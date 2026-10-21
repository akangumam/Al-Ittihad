import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, CalendarDays, Search, ChevronDown, CheckCircle2, AlertCircle, Info, SwitchCamera, Lock, MessageCircle, ExternalLink } from "lucide-react";
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
  const [lastScanned, setLastScanned] = useState<{
    siswa: SiswaRow;
    status: 'success' | 'warning' | 'error';
    message: string;
    time: string;
    isAlreadyRecorded?: boolean;
    waInfo?: { type: 'sent' | 'no_phone' | 'disabled'; phone?: string };
  } | null>(null);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">(isMobile ? "environment" : "user");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedNisRef = useRef<{ nis: string; time: number } | null>(null);
  const resetTimerRef = useRef<any>(null);

  // Keep focus on hidden input for physical scanner
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    focusInput();
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, []);

  const handleNextScan = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setLastScanned(null);
    lastScannedNisRef.current = null;
  };

  // Ref agar camera callback selalu pakai processScan terbaru (hindari stale closure)
  const processScanRef = useRef<(text: string) => void>(() => {});

  const processScan = (scannedText: string) => {
    // Format QR Card: "NAMA_SEKOLAH|NIS|Nama" (contoh: "MTS AL-ITTIHAD PEDALEMAN|2024-0089|Ahmad")
    let nis = scannedText.trim();
    if (nis.includes("|")) {
      nis = nis.split("|")[1].trim();
    }
    
    // Cooldown per NIS: jika NIS yang sama baru saja di-scan dalam 8 detik, abaikan agar tidak loop berulang
    const nowMs = Date.now();
    if (lastScannedNisRef.current && lastScannedNisRef.current.nis === nis && nowMs - lastScannedNisRef.current.time < 8000) {
      return;
    }
    lastScannedNisRef.current = { nis, time: nowMs };

    const siswa = siswaList.find(s => s.nis === nis);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (siswa) {
      if (siswa.status === "Nonaktif") {
        setLastScanned({ siswa, status: 'error', message: "Siswa berstatus Nonaktif", time: timeStr });
      } else if (absensiSiswaHariIni[nis]) {
        // Siswa sudah terdata sebelumnya — kunci status & cegah scan ulang
        const existing = absensiSiswaHariIni[nis];
        setLastScanned({
          siswa,
          status: 'warning',
          message: `Sudah Tercatat: ${existing?.status}`,
          time: existing?.jam || timeStr,
          isAlreadyRecorded: true,
        });
        toast.info(`${siswa.nama} sudah tercatat ${existing?.status} pada ${existing?.jam || timeStr}`);
      } else {
        const [jH, jM] = (appSettings.jamMasukSiswa ?? appSettings.jamMasukGuru ?? "07:00").split(":").map(Number);
        const batasMasuk = new Date();
        batasMasuk.setHours(jH, jM, 0, 0);

        const isTerlambat = now > batasMasuk;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        setAbsensiSiswaHariIni(prev => ({ ...prev, [nis]: { status: statusAbsen, jam: timeStr } }));

        let waInfo: { type: 'sent' | 'no_phone' | 'disabled'; phone?: string } | undefined = undefined;

        if (isTerlambat) {
          if (!siswa.waliHp) {
            waInfo = { type: 'no_phone' };
            toast.warning(`Siswa terlambat. Nomor WA wali murid belum terdaftar.`);
          } else if (!appSettings.wahaEnabled) {
            waInfo = { type: 'disabled', phone: siswa.waliHp };
            toast.info(`Siswa terlambat. Notifikasi WA otomatis belum diaktifkan di Pengaturan.`);
          } else {
            waInfo = { type: 'sent', phone: siswa.waliHp };
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
            toast.success(`Notifikasi WA keterlambatan dikirim ke wali murid (${siswa.waliHp}).`);
          }
        } else {
          toast.success(`Absensi ${siswa.nama} tercatat: Hadir pukul ${timeStr}`);
        }

        setLastScanned({
          siswa,
          status: isTerlambat ? 'warning' : 'success',
          message: isTerlambat ? "Terlambat" : "Berhasil Hadir",
          time: timeStr,
          waInfo,
        });
      }
    } else {
      setLastScanned({
        siswa: { id: 0, nis: nis, nisn: "", nama: "Tidak Ditemukan", jk: "L", kelas: "-", waliNama: "", waliHp: "", statusTagihan: "Lunas", status: "Aktif", inits: "-", tempatLahir: "", tanggalLahir: "", namaAyah: "", namaIbu: "", alamat: "", kelurahan: "", kecamatan: "" },
        status: 'error', message: "NIS tidak terdaftar", time: timeStr
      });
      toast.error(`NIS "${nis}" tidak ditemukan dalam sistem`);
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setLastScanned(prev => {
        if (prev?.siswa.nis === nis) return null;
        return prev;
      });
    }, 6000);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanValue.trim()) return;
    processScan(scanValue.trim());
    setScanValue("");
  };

  // Selalu update ref ke versi terbaru agar closure kamera tidak basi
  useEffect(() => { processScanRef.current = processScan; });

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
              processScanRef.current(decodedText); // selalu fresh
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
            <p className="text-xl font-medium text-[#6B7769] mb-4">NIS: {lastScanned.siswa.nis} • Kelas {lastScanned.siswa.kelas}</p>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-2xl mb-4"
              style={{ background: statusBg, color: statusText }}>
              {lastScanned.message} • {lastScanned.time}
            </div>

            {/* Peringatan Status Sudah Terkunci jika scan berulang */}
            {lastScanned.isAlreadyRecorded && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-center">
                <p className="text-amber-900 font-bold text-base mb-1 flex items-center justify-center gap-2">
                  <Lock size={16} className="text-amber-700" /> Status Absensi Sudah Terkunci
                </p>
                <p className="text-amber-800 text-xs">
                  Siswa ini sudah melakukan presensi hari ini. Absensi ganda dicegah otomatis oleh sistem.
                </p>
                <p className="text-xs text-amber-700 mt-1.5">
                  Jika ada kesalahan atau perlu perubahan status, silakan ubah melalui tab <strong>Rekap Manual</strong>.
                </p>
              </div>
            )}

            {/* Banner Status Notifikasi WhatsApp */}
            {lastScanned.waInfo && (
              <div className="w-full mb-4">
                {lastScanned.waInfo.type === 'sent' && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>Notifikasi WA keterlambatan dikirim ke wali ({lastScanned.waInfo.phone})</span>
                  </div>
                )}
                {lastScanned.waInfo.type === 'no_phone' && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>Nomor WhatsApp wali belum terdaftar di data siswa</span>
                  </div>
                )}
                {lastScanned.waInfo.type === 'disabled' && (
                  <div className="flex flex-col items-center gap-2 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Info size={14} className="text-neutral-500 shrink-0" />
                      <span>Notifikasi WA otomatis belum diaktifkan di menu <strong>Pengaturan</strong></span>
                    </div>
                    {lastScanned.siswa.waliHp && (
                      <a
                        href={`https://wa.me/${lastScanned.siswa.waliHp.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(
                          renderTemplate(appSettings.waTemplates?.absensiTerlambat ?? WA_TEMPLATE_DEFAULTS.absensiTerlambat, {
                            nama_siswa: lastScanned.siswa.nama,
                            kelas: lastScanned.siswa.kelas,
                            jam_masuk: lastScanned.time,
                          })
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-[#166534] bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MessageCircle size={14} />
                        Kirim WA Konfirmasi Manual ({lastScanned.siswa.waliHp})
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tombol Lanjut Scan Kartu Berikutnya */}
            <div className="mt-2">
              <button
                type="button"
                onClick={handleNextScan}
                className="px-5 py-2.5 rounded-xl bg-[#1C2517] text-white text-sm font-semibold hover:bg-black transition-all shadow flex items-center gap-2"
              >
                <QrCode size={16} />
                Scan Siswa Berikutnya
              </button>
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

  const [confirmEdit, setConfirmEdit] = useState<{
    siswa: SiswaRow;
    oldStatus: string;
    newStatus: string;
    currentJam: string;
  } | null>(null);

  const handleRequestStatusChange = (siswa: SiswaRow, targetStatus: string) => {
    const existing = absensiSiswaHariIni[siswa.nis];
    const currentStatus = existing?.status;
    const currentJam = existing?.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Jika belum ada status sama sekali (Belum Absen), langsung set tanpa dialog
    if (!currentStatus) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setAbsensiSiswaHariIni(prev => ({ ...prev, [siswa.nis]: { status: targetStatus, jam: now } }));
      toast.success(`${siswa.nama}: Status diatur ke ${targetStatus}`);
      return;
    }

    // Jika status yang diklik sama persis dengan yang ada, abaikan
    if (currentStatus === targetStatus) return;

    // Siswa SUDAH punya status tercatat/terkunci -> tampilkan dialog konfirmasi Ya/Tidak
    setConfirmEdit({
      siswa,
      oldStatus: currentStatus,
      newStatus: targetStatus,
      currentJam,
    });
  };

  const handleConfirmEdit = () => {
    if (!confirmEdit) return;
    const { siswa, newStatus, currentJam } = confirmEdit;
    setAbsensiSiswaHariIni(prev => ({
      ...prev,
      [siswa.nis]: { status: newStatus, jam: prev[siswa.nis]?.jam ?? currentJam }
    }));
    toast.success(`Status absensi ${siswa.nama} berhasil diubah ke ${newStatus}`);
    setConfirmEdit(null);
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm tabular-nums font-semibold" style={{ color: late ? "#92400E" : "#166534" }}>
                          {jam}
                        </span>
                        <span title="Status kehadiran telah tercatat dan terkunci" className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Lock size={10} className="shrink-0" /> Terkunci
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-6 w-[450px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-[280px]">
                        <AbsensiStatusControl value={status} onChange={(v) => handleRequestStatusChange(row, v)} />
                      </div>
                      {(status === "Terlambat" || status === "Alpa") && row.waliHp && (
                        <a
                          href={`https://wa.me/${row.waliHp.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(
                            status === "Terlambat"
                              ? renderTemplate(appSettings.waTemplates?.absensiTerlambat ?? WA_TEMPLATE_DEFAULTS.absensiTerlambat, {
                                  nama_siswa: row.nama,
                                  kelas: row.kelas,
                                  jam_masuk: jam || '—',
                                })
                              : renderTemplate(appSettings.waTemplates?.absensiAlpa ?? WA_TEMPLATE_DEFAULTS.absensiAlpa, {
                                  nama_siswa: row.nama,
                                  kelas: row.kelas,
                                  tanggal: todayStr,
                                })
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title={`Kirim WA pemberitahuan ke wali ${row.nama} (${row.waliHp})`}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25 transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        >
                          <MessageCircle size={14} className="text-[#25D366]" />
                          <span>Kirim WA</span>
                        </a>
                      )}
                    </div>
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

      {/* Modal Pertanyaan Konfirmasi Ubah Status Absensi Terkunci */}
      {confirmEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8DE] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1C2517]">Ubah Status Absensi?</h3>
                <p className="text-xs text-[#6B7769]">Status siswa ini sebelumnya sudah tercatat/terkunci.</p>
              </div>
            </div>

            <div className="bg-[#FAFBF9] rounded-xl p-4 border border-[#E2E8DE] mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#3E8A2F] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                  <img src={confirmEdit.siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt="Foto" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C2517]">{confirmEdit.siswa.nama}</p>
                  <p className="text-xs text-[#6B7769]">NIS: {confirmEdit.siswa.nis} • Kelas {confirmEdit.siswa.kelas}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#E2E8DE]">
                <div className="flex flex-col">
                  <span className="text-[#6B7769] mb-1">Status Saat Ini:</span>
                  <span className="font-bold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {confirmEdit.oldStatus} ({confirmEdit.currentJam})
                  </span>
                </div>
                <div className="text-neutral-400 font-bold text-base px-2">➔</div>
                <div className="flex flex-col items-end">
                  <span className="text-[#6B7769] mb-1">Ubah Menjadi:</span>
                  <span className="font-bold px-2.5 py-1 rounded-md bg-[#3E8A2F] text-white shadow-sm">
                    {confirmEdit.newStatus}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#6B7769] mb-6">
              Apakah Anda yakin ingin mengubah status absensi siswa ini? Perubahan akan langsung disinkronkan ke server.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmEdit(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6B7769] hover:bg-neutral-100 transition-colors"
              >
                Batal (Tidak)
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] shadow-sm transition-colors"
              >
                Ya, Ubah Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Simpan dengan Siswa Belum Absen */}
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
