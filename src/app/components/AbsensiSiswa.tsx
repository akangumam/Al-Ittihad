import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, CalendarDays, Search, ChevronDown, CheckCircle2, AlertCircle, Info, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { SiswaRow } from "@/data/siswa";
import { kelasOptions } from "@/data/constants";
import { KonfirmasiAbsensiSiswaModal } from "@/app/components/shared/KonfirmasiAbsensiSiswaModal";
import { AbsensiStatusControl } from "@/app/components/shared/AbsensiStatusControl";
import { useWAQueue } from "@/hooks/useWAQueue";
import { WA_TEMPLATE_DEFAULTS, renderTemplate } from "@/lib/waTemplates";
import { useIsMobile } from "@/hooks/useIsMobile";

// ─── Scan Tab ────────────────────────────────────────────────────────────────
function ScanTab() {
  const { siswaList, absensiSiswaHariIni, setAbsensiSiswaHariIni, appSettings } = useAppContext();
  const { enqueue } = useWAQueue();
  const isMobile = useIsMobile();
  const [scanValue, setScanValue] = useState("");
  const [lastScanned, setLastScanned] = useState<{ siswa: SiswaRow; status: 'success' | 'warning' | 'error'; message: string; time: string } | null>(null);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">(isMobile ? "environment" : "user");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on hidden input for physical scanner
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    focusInput();
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, []);

  const processScan = (scannedText: string) => {
    // Format QR Card: "NAMA_SEKOLAH|NIS|Nama" (contoh: "MTS AL-ITTIHAD PEDALEMAN|2024-0089|Ahmad")
    let nis = scannedText;
    if (scannedText.includes("|")) {
      nis = scannedText.split("|")[1];
    }
    
    const siswa = siswaList.find(s => s.nis === nis);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (siswa) {
      if (siswa.status === "Nonaktif") {
        setLastScanned({ siswa, status: 'error', message: "Siswa berstatus Nonaktif", time: timeStr });
      } else if (absensiSiswaHariIni[nis]) {
        // Mencegah double tap
        setLastScanned({
          siswa,
          status: 'warning',
          message: `Sudah Tercatat: ${absensiSiswaHariIni[nis]?.status}`,
          time: timeStr
        });
      } else {
        const [jH, jM] = (appSettings.jamMasukSiswa ?? appSettings.jamMasukGuru ?? "07:00").split(":").map(Number);
        const batasMasuk = new Date();
        batasMasuk.setHours(jH, jM, 0, 0);

        const isTerlambat = now > batasMasuk;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        setAbsensiSiswaHariIni(prev => ({ ...prev, [nis]: { status: statusAbsen, jam: timeStr } }));
        setLastScanned({
          siswa,
          status: isTerlambat ? 'warning' : 'success',
          message: isTerlambat ? "Terlambat" : "Berhasil Hadir",
          time: timeStr
        });

        if (isTerlambat && siswa.waliHp && appSettings.wahaEnabled) {
          enqueue({
            phone: siswa.waliHp,
            nama_penerima: siswa.waliNama || `Wali dari ${siswa.nama}`,
            pesan: renderTemplate(
              appSettings.waTemplates?.absensiTerlambat ?? WA_TEMPLATE_DEFAULTS.absensiTerlambat,
              { nama_siswa: siswa.nama, kelas: siswa.kelas, jam_masuk: timeStr },
            ),
            jenis: "absensi",
            ref_id: siswa.nis,
            priority: 1,
          });
        }
      }
    } else {
      setLastScanned({
        siswa: { id: 0, nis: nis, nisn: "", nama: "Tidak Ditemukan", jk: "L", kelas: "-", waliNama: "", waliHp: "", statusTagihan: "Lunas", status: "Aktif", inits: "-", tempatLahir: "", tanggalLahir: "", namaAyah: "", namaIbu: "", alamat: "", kelurahan: "", kecamatan: "" },
        status: 'error', message: "NIS tidak terdaftar", time: timeStr
      });
    }

    setTimeout(() => {
      setLastScanned(prev => {
        if (prev?.siswa.nis === nis) return null;
        return prev;
      });
    }, 4000);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanValue.trim()) return;
    processScan(scanValue.trim());
    setScanValue("");
  };

  // Initialize Html5Qrcode
  useEffect(() => {
    if (lastScanned) return;

    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
          { facingMode: cameraMode },
          { fps: 10, qrbox: { width: 250, height: 250 }, disableFlip: false },
          (decodedText) => {
            if (isComponentMounted) {
              processScan(decodedText);
              html5QrCode?.stop().catch(() => {});
            }
          },
          () => {}
        );
      } catch {
        // Camera unavailable — user sees the empty scanner placeholder
      }
    };

    const timer = setTimeout(() => {
      if (isComponentMounted) {
        startScanner();
      }
    }, 100);

    return () => {
      isComponentMounted = false;
      clearTimeout(timer);
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [lastScanned, cameraMode]);

  let statusColor = '#DC2626'; // error
  let statusBg = '#FEF2F2';
  let statusText = '#991B1B';
  let StatusIcon = AlertCircle;
  if (lastScanned?.status === 'success') {
    statusColor = '#3E8A2F';
    statusBg = '#EDF7EC';
    statusText = '#166534';
    StatusIcon = CheckCircle2;
  } else if (lastScanned?.status === 'warning') {
    statusColor = '#F59E0B'; 
    statusBg = '#FEF3C7'; 
    statusText = '#92400E'; 
    StatusIcon = Info;
  }

  return (
    <div className="flex flex-col items-center min-h-[600px] bg-white rounded-xl py-8 px-4 relative" style={{ border: "1px solid #E2E8DE" }}>
      {cameraMode === "user" && (
        <style>{`#reader video { transform: scaleX(-1) !important; }`}</style>
      )}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mt-4">
        <form onSubmit={handleScan} className="opacity-0 absolute -top-10">
          <input ref={inputRef} type="text" value={scanValue} onChange={(e) => setScanValue(e.target.value)} autoFocus />
        </form>

        {!lastScanned ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 w-full">
            <div className="relative w-full mb-6">
              <div id="reader" className="w-full rounded-2xl overflow-hidden" style={{ border: "2px solid #E2E8DE" }}></div>
              {isMobile && (
                <button
                  onClick={() => setCameraMode(m => m === "user" ? "environment" : "user")}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm"
                  title="Ganti kamera"
                >
                  <SwitchCamera size={14} />
                  {cameraMode === "environment" ? "Belakang" : "Depan"}
                </button>
              )}
            </div>
            <h3 className="text-2xl font-bold text-[#1C2517] mb-2">Arahkan Kartu ke Kamera</h3>
            <p className="text-[#6B7769] text-sm">Atau gunakan alat Scanner Fisik (kursor otomatis sudah standby).</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-300 w-full">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4" style={{ borderColor: statusColor }}>
                <img src={lastScanned.siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt="Foto" className={`w-full h-full object-cover ${lastScanned.siswa.id === 0 ? 'grayscale opacity-30' : ''}`} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white" style={{ background: statusColor }}>
                <StatusIcon size={24} color="white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-[#1C2517] mb-2">{lastScanned.siswa.nama}</h2>
            <p className="text-xl font-medium text-[#6B7769] mb-6">NIS: {lastScanned.siswa.nis} • Kelas {lastScanned.siswa.kelas}</p>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-2xl"
              style={{ background: statusBg, color: statusText }}>
              {lastScanned.message} • {lastScanned.time}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manual Tab ────────────────────────────────────────────────────────────────
function ManualTab() {
  const { siswaList, absensiSiswaHariIni, setAbsensiSiswaHariIni, logActivity, appSettings } = useAppContext();
  const { enqueueBulk } = useWAQueue();
  const isMobile = useIsMobile();

  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const activeSiswa = useMemo(() => siswaList.filter(s => s.status === "Aktif"), [siswaList]);

  // Target siswa berdasarkan kelasFilter yang dipilih
  const targetSiswa = useMemo(() => {
    if (kelasFilter === "Semua Kelas") return activeSiswa;
    const targetKelas = kelasFilter.replace("Kelas ", "");
    return activeSiswa.filter(s => s.kelas === targetKelas);
  }, [activeSiswa, kelasFilter]);

  const setStatus = (nis: string, v: string) => {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAbsensiSiswaHariIni(prev => ({ ...prev, [nis]: { status: v, jam: prev[nis]?.jam ?? now } }));
  };

  const markAllTargetHadir = () => {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAbsensiSiswaHariIni(prev => {
      const next = { ...prev };
      targetSiswa.forEach(s => {
        if (!next[s.nis]) {
          next[s.nis] = { status: "Hadir", jam: now };
        }
      });
      return next;
    });
    toast.success(`Semua siswa yang belum absen di ${kelasFilter === "Semua Kelas" ? "seluruh kelas" : kelasFilter} ditandai Hadir`);
  };

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return targetSiswa.filter(r => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.nis.includes(q);
      
      let matchStatus = true;
      if (filterStatus !== "Semua") {
        const status = absensiSiswaHariIni[r.nis]?.status ?? null;
        if (filterStatus === "Belum") {
          matchStatus = status === null;
        } else if (filterStatus === "Izin") {
          matchStatus = status === "Izin" || status === "Sakit";
        } else {
          matchStatus = status === filterStatus;
        }
      }

      return matchSearch && matchStatus;
    });
  }, [targetSiswa, search, filterStatus, absensiSiswaHariIni]);

  const chips = useMemo(() => {
    let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0, belum = 0;
    targetSiswa.forEach(s => {
      const status = absensiSiswaHariIni[s.nis]?.status;
      if (status === "Hadir") hadir++;
      else if (status === "Terlambat") terlambat++;
      else if (status === "Izin") izin++;
      else if (status === "Sakit") sakit++;
      else if (status === "Alpa") alpa++;
      else belum++;
    });
    return { Hadir: hadir, Terlambat: terlambat, Izin: izin, Sakit: sakit, Alpa: alpa, Belum: belum };
  }, [targetSiswa, absensiSiswaHariIni]);

  const chipDefs = [
    { label: "Hadir",       value: chips.Hadir,     color: "#DCFCE7", text: "#166534" },
    { label: "Terlambat",   value: chips.Terlambat, color: "#FEF3C7", text: "#92400E" },
    { label: "Izin",        value: chips.Izin,      color: "#FEF9C3", text: "#854D0E" },
    { label: "Sakit",       value: chips.Sakit,     color: "#DBEAFE", text: "#1E40AF" },
    { label: "Alpa",        value: chips.Alpa,      color: "#FEE2E2", text: "#991B1B" },
    { label: "Belum Absen", value: chips.Belum,     color: "#F3F4F6", text: "#374151" },
  ];

  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  const handleConfirm = async () => {
    try {
      // Kirim WA otomatis ke wali siswa Alpa
      let waCount = 0;
      const alpaStudents = appSettings.wahaEnabled
        ? targetSiswa.filter(s => absensiSiswaHariIni[s.nis]?.status === "Alpa" && s.waliHp)
        : [];
      if (alpaStudents.length > 0) {
        const payloads = alpaStudents.map(s => ({
          phone: s.waliHp,
          nama_penerima: s.waliNama || `Wali dari ${s.nama}`,
          pesan: renderTemplate(
            appSettings.waTemplates?.absensiAlpa ?? WA_TEMPLATE_DEFAULTS.absensiAlpa,
            { nama_siswa: s.nama, kelas: s.kelas, tanggal: todayStr },
          ),
          jenis: "absensi" as const,
          ref_id: s.nis,
          priority: 1,
        }));
        const res = await enqueueBulk(payloads);
        if (res.ok) {
          waCount = res.count;
        } else {
          toast.error(`Gagal kirim antrean WA: ${res.error ?? "unknown error"}`);
        }
      }

      // Catat log aktivitas
      let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0;
      targetSiswa.forEach(s => {
        const st = absensiSiswaHariIni[s.nis]?.status;
        if (st === "Hadir") hadir++;
        else if (st === "Terlambat") terlambat++;
        else if (st === "Izin") izin++;
        else if (st === "Sakit") sakit++;
        else if (st === "Alpa") alpa++;
      });

      logActivity({
        tipe: "Absensi Siswa",
        deskripsi: `Simpan absensi ${kelasFilter}: ${hadir} Hadir, ${terlambat} Terlambat, ${izin} Izin, ${sakit} Sakit, ${alpa} Alpa${waCount > 0 ? ` (${waCount} WA diantrekan)` : ""}`,
        ref: "—",
      });

      toast.success(
        `Presensi siswa berhasil disimpan (${targetSiswa.length - chips.Belum} tercatat)${waCount > 0 ? ` · ${waCount} notifikasi WA diantrekan` : ""}.`
      );
    } catch {
      toast.error("Gagal menyimpan absensi. Coba lagi.");
    }
  };

  const handleSaveClick = () => {
    if (chips.Belum > 0) {
      setShowModal(true);
    } else {
      handleConfirm();
    }
  };

  const tercatatCount = targetSiswa.length - chips.Belum;

  return (
    <div className="bg-white rounded-xl pb-[72px]" style={{ border: "1px solid #E2E8DE" }}>
      <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white shrink-0" style={{ border: "1.5px solid #3E8A2F" }}>
            <CalendarDays size={15} className="text-[#3E8A2F]" />
            <span className="text-sm font-semibold text-[#1C2517]">{todayStr}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 md:w-56" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
              <Search size={13} className="text-[#9CA3A0] shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/NIS..." className="bg-transparent outline-none text-sm text-[#1C2517] w-full" />
            </div>

            <div className="relative">
              <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none h-full" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
                {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none h-full"
                style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Belum">Belum Absen</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin/Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
            </div>

            <button
              onClick={markAllTargetHadir}
              className="px-3.5 py-2 rounded-lg bg-[#F5F9F4] text-[#3E8A2F] text-sm font-semibold hover:bg-[#E8F2E6] transition-colors whitespace-nowrap"
              style={{ border: "1px solid #3E8A2F" }}
            >
              Semua Hadir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {chipDefs.map((c) => (
            <div key={c.label} className="flex flex-col items-center justify-center rounded-xl py-3 px-2" style={{ background: c.color }}>
              <span className="tabular-nums font-bold" style={{ fontSize: "1.25rem", color: c.text }}>{c.value}</span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: c.text }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4 w-64">Siswa</Th>
              <Th className="pr-4">Kelas</Th>
              <Th className="pr-4 w-32">Jam Masuk</Th>
              <Th className="pr-6">Status Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => {
              const rec = absensiSiswaHariIni[row.nis];
              const status = rec?.status ?? null;
              const jam = rec?.jam ?? null;
              const belum = status === null;
              const late = status === "Terlambat";

              return (
                <tr key={row.id} className="transition-colors" style={{ borderBottom: i < filteredRows.length - 1 ? "1px solid #F0F7EE" : "none", background: belum ? "#FFFBEB" : undefined }}>
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden" style={{ background: "#3E8A2F", color: "#FFFFFF" }}>
                        <img src={row.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={row.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">{row.nis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-medium text-[#374040]">
                    {row.kelas}
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-medium">
                    {jam ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm tabular-nums font-medium" style={{ color: late ? "#92400E" : "#6B7769" }}>
                          {jam}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-6 w-[420px]">
                    <AbsensiStatusControl value={status} onChange={(v) => setStatus(row.nis, v)} />
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-sm text-[#9CA3A0]">Tidak ada data siswa ditemukan</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>

      {/* Save bar */}
      <div className="bg-white px-6 py-4 flex items-center justify-between" style={{ position: "fixed", bottom: isMobile ? 64 : 0, left: isMobile ? 0 : "var(--sidebar-w, 260px)", right: 0, borderTop: "1px solid #E2E8DE", zIndex: 50 }}>
        <div>
          <span className="text-sm font-semibold text-[#1C2517] tabular-nums">
            {tercatatCount} dari {targetSiswa.length} {kelasFilter === "Semua Kelas" ? "siswa" : `siswa ${kelasFilter}`}
          </span>
          <span className="text-sm text-[#6B7769] ml-1">tercatat</span>
          {chips.Belum > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] tabular-nums">
              {chips.Belum} belum absen
            </span>
          )}
        </div>
        <button 
          onClick={handleSaveClick}
          className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shadow-sm"
        >
          Simpan Absensi
        </button>
      </div>

      {/* Modal Konfirmasi */}
      <KonfirmasiAbsensiSiswaModal
        open={showModal}
        onClose={() => setShowModal(false)}
        kelasFilter={kelasFilter}
        targetSiswa={targetSiswa}
        absensiSiswaHariIni={absensiSiswaHariIni}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export function AbsensiSiswa() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "scan";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5" style={{ paddingBottom: 72 }}>
      <div>
        <h2 className="text-[#1C2517]">Absensi Siswa</h2>
        <p className="text-sm text-[#6B7769]">Rekam dan pantau kehadiran siswa menggunakan QR Code atau Manual</p>
      </div>

      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {(["scan", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/akademik/absensi-siswa/${t}`)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
              activeTab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t === "scan" ? "Stasiun Scan QR" : "Rekap Manual"}
          </button>
        ))}
      </div>

      {activeTab === "scan" ? <ScanTab /> : <ManualTab />}
    </div>
  );
}
