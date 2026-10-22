import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { CalendarDays, FileText, ChevronDown, Download, Search, CheckCircle2, AlertCircle, Info, SwitchCamera, Lock } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { bulanOptions, tahunOptions } from "@/data/constants";
import type { GuruRow } from "@/data/guru";
import { KonfirmasiAbsensiGuruModal } from "@/app/components/shared/KonfirmasiAbsensiGuruModal";
import { AbsensiStatusControl } from "@/app/components/shared/AbsensiStatusControl";
import { useIsMobile } from "@/hooks/useIsMobile";

// ─── Scan Tab ────────────────────────────────────────────────────────────────
// ─── Scanner Audio Feedback (Web Audio API) ──────────────────────────────────
function playScannerBeep(type: 'success' | 'warning' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // audio context might be blocked if browser requires user gesture
  }
}

// ─── Scan Tab Guru ───────────────────────────────────────────────────────────
export function ScanTabGuru() {
  const { guruList, absensiGuruHariIni, setAbsensiGuruHariIni, appSettings } = useAppContext();
  const isMobile = useIsMobile();
  const [scanValue, setScanValue] = useState("");
  const [lastScanned, setLastScanned] = useState<{ guru: GuruRow; status: 'success' | 'warning' | 'error'; message: string; time: string; isAlreadyRecorded?: boolean } | null>(null);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">(isMobile ? "environment" : "user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedIdRef = useRef<{ id: string; time: number } | null>(null);
  const resetTimerRef = useRef<any>(null);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const flashResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep focus on hidden input for physical scanner (desktop only, to avoid mobile keyboard popups)
  useEffect(() => {
    if (isMobile) return;
    const focusInput = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    focusInput();
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, [isMobile]);

  const handleNextScan = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setLastScanned(null);
    lastScannedIdRef.current = null;
  };

  const triggerFlash = (type: 'success' | 'warning' | 'error') => {
    const colors = { success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };
    setFlashColor(colors[type]);
    setFlashVisible(true);
    if (flashResetRef.current) clearTimeout(flashResetRef.current);
    flashResetRef.current = setTimeout(() => {
      setFlashVisible(false);
      setTimeout(() => setFlashColor(null), 500);
    }, 300);
  };

  const processScanRef = useRef<(text: string) => void>(() => {});

  const processScan = (scannedText: string) => {
    let identifier = scannedText.trim();
    if (identifier.includes("|")) {
      identifier = identifier.split("|")[1]?.trim() || identifier;
    }
    
    // Cooldown per ID: 5 detik agar tidak spam
    const nowMs = Date.now();
    if (lastScannedIdRef.current && lastScannedIdRef.current.id === identifier && nowMs - lastScannedIdRef.current.time < 5000) {
      return;
    }
    lastScannedIdRef.current = { id: identifier, time: nowMs };

    const guru = guruList.find(g => 
      g.nuptk === identifier || 
      String(g.id) === identifier || 
      (g.nip && g.nip.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')) ||
      g.nama.toLowerCase() === identifier.toLowerCase()
    );
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (guru) {
      if (guru.status === "Nonaktif") {
        playScannerBeep('error');
        triggerFlash('error');
        setLastScanned({ guru, status: 'error', message: "Guru berstatus Nonaktif", time: timeStr });
        toast.error(`Presensi gagal: ${guru.nama} berstatus Nonaktif`);
      } else if ((absensiGuruHariIni || {})[guru.id]) {
        playScannerBeep('warning');
        triggerFlash('warning');
        const recordedStatus = (absensiGuruHariIni || {})[guru.id].status;
        setLastScanned({
          guru,
          status: 'warning',
          message: `Sudah Tercatat: ${recordedStatus}`,
          time: (absensiGuruHariIni || {})[guru.id].jam || timeStr,
          isAlreadyRecorded: true,
        });
        toast.info(`${guru.nama} sudah tercatat: ${recordedStatus}`);
      } else {
        const [jH, jM] = (appSettings.jamMasukGuru ?? "07:00").split(":").map(Number);
        const batasMasuk = new Date();
        batasMasuk.setHours(jH, jM, 0, 0);

        const isTerlambat = now > batasMasuk;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        playScannerBeep(isTerlambat ? 'warning' : 'success');
        triggerFlash(isTerlambat ? 'warning' : 'success');
        setAbsensiGuruHariIni(prev => ({ ...(prev || {}), [guru.id]: { status: statusAbsen, jam: timeStr } }));
        setLastScanned({ 
          guru, 
          status: isTerlambat ? 'warning' : 'success', 
          message: isTerlambat ? "Terlambat" : "Berhasil Hadir", 
          time: timeStr 
        });
        if (isTerlambat) {
          toast.warning(`Presensi dicatat: ${guru.nama} Terlambat (${timeStr})`);
        } else {
          toast.success(`Presensi berhasil: ${guru.nama} Hadir (${timeStr})`);
        }
      }
    } else {
      playScannerBeep('error');
      triggerFlash('error');
      setLastScanned({
        guru: { id: 0, nuptk: identifier, nama: "Tidak Ditemukan", inits: "-", nip: "", mapel: [], statusKepeg: "GTY", waliKelas: null, kehadiran: 0, status: "Aktif", jk: "L", tanggalLahir: "", jabatan: "", pendidikan: "", hp: "", email: "", alamat: "" },
        status: 'error', message: "Data tidak terdaftar", time: timeStr
      });
      toast.error(`Data guru tidak ditemukan untuk: ${identifier}`);
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setLastScanned(prev => {
        if (prev?.guru.id === guru?.id || (!guru && prev?.guru.id === 0)) return null;
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

  useEffect(() => { processScanRef.current = processScan; });

  // Initialize Html5Qrcode dengan dynamic qrbox dan kamera fallback multi-tier
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;
    setCameraError(null);

    const startScanner = async () => {
      const container = document.getElementById("reader-guru");
      if (!container || !isComponentMounted) return;

      const qrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          // Aman di semua resolusi: 72% dari minEdge, dijamin tidak pernah melebihi container
          const edge = Math.min(
            Math.max(Math.floor(minEdge * 0.72), 100),
            Math.max(minEdge - 12, 80)
          );
          return { width: edge, height: edge };
        },
        disableFlip: false,
      };

      const onDecoded = (decodedText: string) => {
        if (isComponentMounted) {
          processScanRef.current(decodedText);
        }
      };

      // Helper untuk mencoba target kamera dengan membuat instance bersih
      const tryStart = async (target: string | MediaTrackConstraints): Promise<boolean> => {
        if (!isComponentMounted) return false;
        try {
          try { container.innerHTML = ""; } catch {}
          const instance = new Html5Qrcode("reader-guru");
          html5QrCode = instance;
          await instance.start(target, qrConfig, onDecoded, () => {});
          return true;
        } catch (err) {
          console.warn("Percobaan kamera guru gagal untuk:", target, err);
          try { html5QrCode?.clear(); } catch {}
          html5QrCode = null;
          return false;
        }
      };

      // Tier 1: Coba mode kamera yang dipilih (user / environment)
      let started = await tryStart({ facingMode: cameraMode });

      // Tier 2: Coba mode sebaliknya jika kamera utama gagal
      if (!started && isComponentMounted) {
        const altMode = cameraMode === "environment" ? "user" : "environment";
        started = await tryStart({ facingMode: altMode });
      }

      // Tier 3: Query daftar kamera fisik perangkat via getCameras
      if (!started && isComponentMounted) {
        try {
          const cameras = await Html5Qrcode.getCameras().catch(() => []);
          if (cameras && cameras.length > 0) {
            const camId = (cameraMode === "environment" && cameras.length > 1)
              ? cameras[cameras.length - 1].id
              : cameras[0].id;
            started = await tryStart(camId);
          }
        } catch (e) {
          console.warn("Html5Qrcode.getCameras guru gagal:", e);
        }
      }

      // Jika komponen keburu unmount saat async start berjalan
      if (!isComponentMounted && html5QrCode) {
        if (html5QrCode.isScanning) {
          await html5QrCode.stop().catch(() => {});
        }
        try { html5QrCode.clear(); } catch {}
      }

      // Jika semua percobaan gagal, tampilkan pesan instruktif ke pengguna
      if (!started && isComponentMounted) {
        setCameraError(
          "Kamera tidak dapat diakses. Pastikan izin kamera aktif di browser Anda dan situs dibuka melalui HTTPS, atau gunakan input manual / barcode scanner di bawah."
        );
      }
    };

    const timer = setTimeout(() => {
      if (isComponentMounted) {
        startScanner();
      }
    }, 200);

    return () => {
      isComponentMounted = false;
      clearTimeout(timer);
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            try { html5QrCode?.clear(); } catch {}
          }).catch(() => {
            try { html5QrCode?.clear(); } catch {}
          });
        } else {
          try { html5QrCode.clear(); } catch {}
        }
      }
    };
  }, [cameraMode]);

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
    <div className="flex flex-col items-center min-h-[520px] bg-white rounded-xl py-5 px-4 relative shadow-sm" style={{ border: "1px solid #E2E8DE" }}>
      {cameraMode === "user" && (
        <style>{`#reader-guru video { transform: scaleX(-1) !important; }`}</style>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {/* Banner Indikator Kamera Aktif */}
        <div className="w-full flex items-center justify-between px-4 py-2 mb-3 bg-[#F4F9F2] rounded-xl border border-[#D5E7CE] text-xs font-medium text-[#2E6B22]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E8A2F] animate-pulse"></span>
            <strong>Scanner Guru Aktif</strong>
          </span>
          <span className="text-[#6B7769]">
            {cameraMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
          </span>
        </div>

        {cameraError && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-center text-xs text-amber-800">
            <p className="font-semibold mb-0.5">{cameraError}</p>
            <p className="text-[11px] text-amber-700">Anda dapat memasukkan NUPTK / ID guru melalui formulir manual di bawah.</p>
          </div>
        )}

        <div className="w-full relative mb-3">
          <div id="reader-guru" className="w-full rounded-2xl overflow-hidden shadow-sm bg-neutral-900" style={{ border: "2px solid #E2E8DE", minHeight: 220 }}></div>
          {flashColor && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-500"
              style={{ background: flashColor, opacity: flashVisible ? 0.35 : 0 }}
            />
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setCameraMode(m => m === "user" ? "environment" : "user")}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm transition-colors z-10"
              title="Ganti kamera"
            >
              <SwitchCamera size={14} />
              {cameraMode === "environment" ? "Belakang" : "Depan"}
            </button>
          )}
        </div>

        {/* Input Barcode Fisik / Manual */}
        <form onSubmit={handleScan} className="w-full mb-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Scan barcode kartu atau masukkan NUPTK / ID..."
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            autoFocus={!isMobile}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E2E8DE] focus:border-[#3E8A2F] outline-none bg-neutral-50/60 font-medium placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!scanValue.trim()}
            className="px-3.5 py-2 text-xs font-semibold bg-[#3E8A2F] text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2E6B22] transition-colors shrink-0 shadow-sm"
          >
            Absen
          </button>
        </form>

        {/* Hasil Scan / Status Menunggu */}
        {!lastScanned ? (
          <div className="flex flex-col items-center text-center py-2 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-[#1C2517] mb-1">Arahkan Kartu Guru ke Kamera</h3>
            <p className="text-[#6B7769] text-xs">Atau gunakan scanner barcode fisik. Presensi guru langsung tersimpan otomatis.</p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border w-full shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200 mb-2"
            style={{ borderColor: statusColor }}
          >
            <div className="relative mb-2.5">
              <div
                className="w-16 h-16 rounded-full bg-[#3E8A2F] flex items-center justify-center border-4 text-white font-bold text-2xl shadow-sm"
                style={{ borderColor: statusColor }}
              >
                {lastScanned.guru.inits}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow"
                style={{ background: statusColor }}
              >
                <StatusIcon size={13} color="white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1C2517] mb-0.5">{lastScanned.guru.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-2">
              {lastScanned.guru.nuptk ? `NUPTK: ${lastScanned.guru.nuptk}` : "NUPTK: -"}
            </p>

            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold text-xs mb-2.5 shadow-sm"
              style={{ background: statusBg, color: statusText }}
            >
              {lastScanned.message} • {lastScanned.time}
            </div>

            {lastScanned.isAlreadyRecorded && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-2.5 text-center">
                <p className="text-amber-900 font-bold text-xs mb-0.5 flex items-center justify-center gap-1.5">
                  <Lock size={13} className="text-amber-700" /> Status Sudah Terkunci
                </p>
                <p className="text-amber-800 text-[11px]">
                  Guru sudah presensi hari ini. Ubah status lewat menu <strong>Rekap Manual</strong> jika perlu koreksi.
                </p>
              </div>
            )}

            <div className="w-full pt-2 border-t border-[#E2E8DE] flex items-center justify-between text-xs text-[#6B7769]">
              <span className="flex items-center gap-1.5 text-[#3E8A2F] font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#3E8A2F] animate-ping"></span>
                Kamera siap scan berikutnya...
              </span>
              <button
                type="button"
                onClick={handleNextScan}
                className="text-xs text-[#6B7769] hover:text-[#1C2517] underline font-medium"
              >
                Tutup
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
  const { guruList, absensiGuruHariIni, setAbsensiGuruHariIni, logActivity } = useAppContext();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showModal, setShowModal] = useState(false);

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

  const handleConfirm = async () => {
    let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0;
    const safeData = absensiGuruHariIni || {};
    activeGuru.forEach(g => {
      const st = safeData[g.id]?.status;
      if (st === "Hadir") hadir++;
      else if (st === "Terlambat") terlambat++;
      else if (st === "Izin") izin++;
      else if (st === "Sakit") sakit++;
      else if (st === "Alpa") alpa++;
    });

    logActivity({
      tipe: "Absensi Guru",
      deskripsi: `Simpan absensi guru: ${hadir} Hadir, ${terlambat} Terlambat, ${izin + sakit} Izin/Sakit, ${alpa} Alpa`,
      ref: "—",
    });

    toast.success(`Data absensi guru berhasil disimpan (${activeGuru.length - chips.Belum} tercatat)!`);
  };

  const handleSaveClick = () => {
    if (chips.Belum > 0) {
      setShowModal(true);
    } else {
      handleConfirm();
    }
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
                    <AbsensiStatusControl value={status} onChange={(v) => setStatus(row.id, v)} />
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
      <div className="bg-white px-6 py-4 flex items-center justify-between" style={{ position: "fixed", bottom: isMobile ? 64 : 0, left: isMobile ? 0 : "var(--sidebar-w, 260px)", right: 0, borderTop: "1px solid #E2E8DE", zIndex: 50 }}>
        <div>
          <span className="text-sm font-semibold text-[#1C2517] tabular-nums">{activeGuru.length - chips.Belum} dari {activeGuru.length}</span>
          <span className="text-sm text-[#6B7769] ml-1">tercatat</span>
          {chips.Belum > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] tabular-nums">{chips.Belum} belum absen</span>}
        </div>
        <button 
          onClick={handleSaveClick}
          className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shadow-sm"
        >
          Simpan Absensi
        </button>
      </div>

      {/* Modal Konfirmasi */}
      <KonfirmasiAbsensiGuruModal
        open={showModal}
        onClose={() => setShowModal(false)}
        activeGuru={activeGuru}
        absensiGuruHariIni={absensiGuruHariIni}
        onConfirm={handleConfirm}
      />
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

      {activeTab === "scan" ? <ScanTabGuru /> : activeTab === "manual" ? <ManualTab /> : <RekapitulasiTab />}
    </div>
  );
}
