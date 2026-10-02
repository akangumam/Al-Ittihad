import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { CalendarDays, FileText, ChevronDown, Download, Search, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { bulanOptions, tahunOptions } from "@/data/constants";
import type { GuruRow } from "@/data/guru";

// ─── StatusControl ────────────────────────────────────────────────────────────
const STATUS_ACTIVE: Record<string, string> = {
  Hadir: "bg-[#3E8A2F] text-white",
  Terlambat: "bg-[#F59E0B] text-white",
  Izin:  "bg-[#F6B31E] text-white",
  Sakit: "bg-[#3B82F6] text-white",
  Alpa:  "bg-[#DC2626] text-white",
};

function StatusControl({ value, onChange }: { value: string | null; onChange: (v: string) => void; }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
      {(["Hadir", "Terlambat", "Izin", "Sakit", "Alpa"] as const).map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={[
            "px-2 py-1.5 text-[11px] font-semibold transition-colors flex-1",
            i > 0 ? "border-l border-[#E2E8DE]" : "",
            value === s ? STATUS_ACTIVE[s] : "text-[#6B7769] hover:bg-[#F5F9F4]",
          ].join(" ")}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── Scan Tab ────────────────────────────────────────────────────────────────
function ScanTab() {
  const { guruList, absensiGuruHariIni, setAbsensiGuruHariIni } = useAppContext();
  const [scanValue, setScanValue] = useState("");
  const [lastScanned, setLastScanned] = useState<{ guru: GuruRow; status: 'success' | 'warning' | 'error'; message: string; time: string } | null>(null);
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
    // Format QR Card Guru: "SEKOLAH|NUPTK|Nama" atau "GURU|ID|Nama"
    // Untuk toleransi, kita cari berdasarkan NUPTK atau ID
    let identifier = scannedText.trim();
    if (identifier.includes("|")) {
      identifier = identifier.split("|")[1]?.trim() || identifier;
    }
    
    // Coba cari berdasarkan NUPTK, jika kosong/tidak cocok cari berdasarkan ID
    const guru = guruList.find(g => g.nuptk === identifier || String(g.id) === identifier);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (guru) {
      if (guru.status === "Nonaktif") {
        setLastScanned({ guru, status: 'error', message: "Guru berstatus Nonaktif", time: timeStr });
      } else if ((absensiGuruHariIni || {})[guru.id]) {
        // Mencegah double tap
        setLastScanned({ 
          guru, 
          status: 'warning', 
          message: `Sudah Tercatat: ${(absensiGuruHariIni || {})[guru.id].status}`, 
          time: timeStr 
        });
      } else {
        // Cek keterlambatan (batas jam 07:00)
        const batasMasuk = new Date();
        batasMasuk.setHours(7, 0, 0, 0);

        const isTerlambat = now > batasMasuk;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        setAbsensiGuruHariIni(prev => ({ ...(prev || {}), [guru.id]: { status: statusAbsen, jam: timeStr } }));
        setLastScanned({ 
          guru, 
          status: isTerlambat ? 'warning' : 'success', 
          message: isTerlambat ? "Terlambat" : "Berhasil Hadir", 
          time: timeStr 
        });
      }
    } else {
      setLastScanned({
        guru: { id: 0, nuptk: identifier, nama: "Tidak Ditemukan", inits: "-", nip: "", mapel: [], statusKepeg: "GTY", waliKelas: null, kehadiran: 0, status: "Aktif", jk: "L", tanggalLahir: "", jabatan: "", pendidikan: "", hp: "", email: "", alamat: "" },
        status: 'error', message: "Data tidak terdaftar", time: timeStr
      });
    }

    setTimeout(() => {
      setLastScanned(prev => {
        if (prev?.guru.id === guru?.id || (!guru && prev?.guru.id === 0)) return null;
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
        html5QrCode = new Html5Qrcode("reader-guru");
        await html5QrCode.start(
          { facingMode: "user" }, // Use front-facing camera
          { fps: 10, qrbox: { width: 250, height: 250 }, disableFlip: false }, // disableFlip: false for mirror effect
          (decodedText) => {
            if (isComponentMounted) {
              processScan(decodedText);
              html5QrCode?.stop().catch(console.error);
            }
          },
          () => {} // ignore frequent parse errors
        );
      } catch (err) {
        console.error("Failed to start scanner", err);
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
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [lastScanned]);

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
      <style>{`
        #reader-guru video {
          transform: scaleX(-1) !important;
        }
      `}</style>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mt-4">
        <form onSubmit={handleScan} className="opacity-0 absolute -top-10">
          <input ref={inputRef} type="text" value={scanValue} onChange={(e) => setScanValue(e.target.value)} autoFocus />
        </form>

        {!lastScanned ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 w-full">
            <div id="reader-guru" className="w-full rounded-2xl overflow-hidden mb-6" style={{ border: "2px solid #E2E8DE" }}></div>
            <h3 className="text-2xl font-bold text-[#1C2517] mb-2">Arahkan Kartu ke Kamera</h3>
            <p className="text-[#6B7769] text-sm">Atau gunakan alat Scanner Fisik (kursor otomatis sudah standby).</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-300 w-full">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full bg-[#3E8A2F] flex items-center justify-center border-4 text-white font-bold text-5xl" style={{ borderColor: statusColor }}>
                {lastScanned.guru.inits}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white" style={{ background: statusColor }}>
                <StatusIcon size={24} color="white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-[#1C2517] mb-2">{lastScanned.guru.nama}</h2>
            <p className="text-xl font-medium text-[#6B7769] mb-6">
              {lastScanned.guru.nuptk ? `NUPTK: ${lastScanned.guru.nuptk}` : "NUPTK: -"}
            </p>
            
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
  const { guruList, absensiGuruHariIni, setAbsensiGuruHariIni } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const activeGuru = useMemo(() => guruList.filter(g => g.status === "Aktif"), [guruList]);

  const setStatus = (id: number, v: string) => {
    setAbsensiGuruHariIni(prev => {
      const safePrev = prev || {};
      const prevJam = safePrev[id]?.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return { ...safePrev, [id]: { status: v, jam: prevJam } };
    });
  };

  const markAllHadir = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAbsensiGuruHariIni(prev => {
      const next = { ...(prev || {}) };
      activeGuru.forEach(g => {
        if (!next[g.id]) {
          next[g.id] = { status: "Hadir", jam: timeStr };
        }
      });
      return next;
    });
    toast.success("Semua guru yang belum absen telah ditandai Hadir");
  };

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    const safeData = absensiGuruHariIni || {};
    return activeGuru.filter(r => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || (r.nuptk && r.nuptk.includes(q));
      
      let matchStatus = true;
      if (filterStatus !== "Semua") {
        const status = safeData[r.id]?.status || null;
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
  }, [activeGuru, search, filterStatus, absensiGuruHariIni]);

  const chips = useMemo(() => {
    let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0, belum = 0;
    const safeData = absensiGuruHariIni || {};
    activeGuru.forEach(g => {
      const rec = safeData[g.id];
      if (!rec) belum++;
      else if (rec.status === "Hadir") hadir++;
      else if (rec.status === "Terlambat") terlambat++;
      else if (rec.status === "Izin") izin++;
      else if (rec.status === "Sakit") sakit++;
      else if (rec.status === "Alpa") alpa++;
    });
    return { Hadir: hadir, Terlambat: terlambat, Izin: izin, Sakit: sakit, Alpa: alpa, Belum: belum };
  }, [activeGuru, absensiGuruHariIni]);

  const chipDefs = [
    { label: "Hadir",       value: chips.Hadir,     color: "#DCFCE7", text: "#166534" },
    { label: "Terlambat",   value: chips.Terlambat, color: "#FEF3C7", text: "#92400E" },
    { label: "Izin",        value: chips.Izin,      color: "#FEF9C3", text: "#854D0E" },
    { label: "Sakit",       value: chips.Sakit,     color: "#DBEAFE", text: "#1E40AF" },
    { label: "Alpa",        value: chips.Alpa,      color: "#FEE2E2", text: "#991B1B" },
    { label: "Belum Absen", value: chips.Belum,     color: "#F3F4F6", text: "#374151" },
  ];

  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="bg-white rounded-xl pb-[72px]" style={{ border: "1px solid #E2E8DE" }}>
      <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white shrink-0" style={{ border: "1.5px solid #3E8A2F" }}>
            <CalendarDays size={15} className="text-[#3E8A2F]" />
            <span className="text-sm font-semibold text-[#1C2517]">{todayStr}</span>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 md:w-64" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
              <Search size={13} className="text-[#9CA3A0] shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/NUPTK..." className="bg-transparent outline-none text-sm text-[#1C2517] w-full" />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none appearance-none"
                style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Belum">Belum Absen</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin/Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>
            
            <button
              onClick={markAllHadir}
              className="px-4 py-2 rounded-lg bg-[#F5F9F4] text-[#3E8A2F] text-sm font-semibold hover:bg-[#E8F2E6] transition-colors whitespace-nowrap" style={{ border: "1px solid #3E8A2F" }}
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
              <Th className="pl-6 pr-4 w-64">Guru</Th>
              <Th className="pr-4">Jam Absen</Th>
              <Th className="pr-6">Status Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => {
              const safeData = absensiGuruHariIni || {};
              const rec = safeData[row.id];
              const status = rec?.status || null;
              const jam = rec?.jam || null;
              const belum = status === null;
              const late = status === "Terlambat";

              return (
                <tr key={row.id} className="transition-colors" style={{ borderBottom: i < filteredRows.length - 1 ? "1px solid #F0F7EE" : "none", background: belum ? "#FFFBEB" : undefined }}>
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3E8A2F] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                        {row.inits}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">{row.nuptk || "NUPTK: -"}</p>
                      </div>
                    </div>
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
                    <StatusControl value={status} onChange={(v) => setStatus(row.id, v)} />
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-sm text-[#9CA3A0]">Tidak ada data guru ditemukan</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>

      {/* Save bar */}
      <div className="bg-white px-6 py-4 flex items-center justify-between" style={{ position: "fixed", bottom: 0, left: "var(--sidebar-w, 260px)", right: 0, borderTop: "1px solid #E2E8DE", zIndex: 20 }}>
        <div>
          <span className="text-sm font-semibold text-[#1C2517] tabular-nums">{activeGuru.length - chips.Belum} dari {activeGuru.length}</span>
          <span className="text-sm text-[#6B7769] ml-1">tercatat</span>
          {chips.Belum > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] tabular-nums">{chips.Belum} belum absen</span>}
        </div>
        <button 
          onClick={() => toast.success("Data absensi guru berhasil dicatat.")}
          className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
        >
          Konfirmasi
        </button>
      </div>
    </div>
  );
}

// ─── Rekapitulasi tab ─────────────────────────────────────────────────────────
function RekapitulasiTab() {
  const { guruList, absensiGuruHistory } = useAppContext();
  const [bulan, setBulan] = useState(bulanOptions[new Date().getMonth()]);
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));

  const monthIndex = bulanOptions.indexOf(bulan);
  
  // Hitung jumlah hari kerja (Senin-Jumat) dalam bulan ini
  const hariKerjaEfektif = useMemo(() => {
    const year = parseInt(tahun);
    const date = new Date(year, monthIndex, 1);
    let count = 0;
    while (date.getMonth() === monthIndex) {
      if (date.getDay() !== 0 && date.getDay() !== 6) count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  }, [monthIndex, tahun]);

  const calculatedRekapData = useMemo(() => {
    const year = parseInt(tahun);
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
    const safeHistory = absensiGuruHistory || {};

    const keysBulanIni = Object.keys(safeHistory).filter(k => k.startsWith(prefix));

    return guruList.map(guru => {
      let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0;

      keysBulanIni.forEach(date => {
        const record = safeHistory[date]?.[guru.id];
        if (record) {
          if (record.status === "Hadir") hadir++;
          else if (record.status === "Terlambat") terlambat++;
          else if (record.status === "Izin") izin++;
          else if (record.status === "Sakit") sakit++;
          else if (record.status === "Alpa") alpa++;
        }
      });

      let pct = 0;
      if (hariKerjaEfektif > 0) {
        pct = Math.round(((hadir + terlambat) / hariKerjaEfektif) * 100);
        if (pct > 100) pct = 100;
      }

      return { ...guru, hadir, terlambat, izin, sakit, alpa, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [guruList, absensiGuruHistory, monthIndex, tahun, hariKerjaEfektif]);

  const handleExportCSV = () => {
    const header = "Nama Guru;NUPTK;Hadir;Terlambat;Izin;Sakit;Alpa;% Kehadiran\n";
    const csvContent = calculatedRekapData.map(r => 
      `"${r.nama}";="${r.nuptk || '-'}";${r.hadir};${r.terlambat};${r.izin};${r.sakit};${r.alpa};${r.pct}%`
    ).join("\n");
    
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekap_Absensi_Guru_${bulan}_${tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      {/* Header: filters + export */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {bulanOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          <span className="text-xs text-[#6B7769]">
            <span className="font-semibold text-[#1C2517]">{hariKerjaEfektif}</span> hari kerja efektif bulan ini
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors"
          style={{ border: "1px solid #E2E8DE" }}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4">Guru</Th>
              <Th align="center" className="pr-4">Hadir</Th>
              <Th align="center" className="pr-4">Terlambat</Th>
              <Th align="center" className="pr-4">Izin</Th>
              <Th align="center" className="pr-4">Alpa</Th>
              <Th className="pr-6">% Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {calculatedRekapData.map((row, i) => {
              const barColor = row.pct >= 90 ? "#3E8A2F" : row.pct >= 80 ? "#F6B31E" : "#DC2626";
              const pctColor = row.pct >= 90 ? "text-[#166534]" : row.pct >= 80 ? "text-[#92400E]" : "text-[#991B1B]";

              return (
                <tr key={row.id} className="hover:bg-[#FAFBF9] transition-colors" style={{ borderBottom: i < calculatedRekapData.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {row.inits}
                      </div>
                      <span className="text-sm font-medium text-[#1C2517]">{row.nama}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-center"><span className="text-sm font-semibold tabular-nums text-[#1C2517]">{row.hadir}</span></td>
                  <td className="py-3.5 pr-4 text-center"><span className={`text-sm font-semibold tabular-nums ${row.terlambat > 0 ? "text-[#92400E]" : "text-[#9CA3A0]"}`}>{row.terlambat}</span></td>
                  <td className="py-3.5 pr-4 text-center"><span className={`text-sm font-semibold tabular-nums ${row.izin > 0 ? "text-[#6B7769]" : "text-[#9CA3A0]"}`}>{row.izin}</span></td>
                  <td className="py-3.5 pr-4 text-center"><span className={`text-sm font-semibold tabular-nums ${row.alpa > 0 ? "text-[#DC2626]" : "text-[#9CA3A0]"}`}>{row.alpa}</span></td>
                  <td className="py-3.5 pr-6">
                    <p className={`text-sm font-bold tabular-nums ${pctColor}`}>{row.pct}%</p>
                    <div className="h-1 rounded-full bg-[#E2E8DE] mt-1.5 w-28">
                      <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, background: barColor }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export function Absensi() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "scan";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5" style={{ paddingBottom: 72 }}>
      <div>
        <h2 className="text-[#1C2517]">Absensi Guru</h2>
        <p className="text-sm text-[#6B7769]">Rekam dan pantau kehadiran guru menggunakan QR Code atau Manual</p>
      </div>

      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {(["scan", "manual", "rekapitulasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/akademik/absensi/${t}`)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
              activeTab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t === "scan" ? "Stasiun Scan QR" : t === "manual" ? "Rekap Manual" : "Rekapitulasi"}
          </button>
        ))}
      </div>

      {activeTab === "scan" ? <ScanTab /> : activeTab === "manual" ? <ManualTab /> : <RekapitulasiTab />}
    </div>
  );
}
