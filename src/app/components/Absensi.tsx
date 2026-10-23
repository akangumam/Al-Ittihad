import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  CalendarDays, FileText, ChevronDown, Download, Search, CheckCircle2, 
  AlertCircle, Info, SwitchCamera, Lock, Clock, Sparkles, AlertTriangle, Check 
} from "lucide-react";
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

    if (type === 'success') {
      // Melodic 2-tone ascending success chime (cheerful ding-dong!)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.14);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.09); // E6
      gain2.gain.setValueAtTime(0.22, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.3);
    } else if (type === 'warning') {
      // 2-tone descending caution alert chime (distinct warning!)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(493.88, now + 0.12); // B4
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Reject low buzz
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
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
  const [lastScanned, setLastScanned] = useState<{ 
    guru: GuruRow; 
    status: 'success' | 'warning' | 'error'; 
    message: string; 
    time: string; 
    isTerlambat?: boolean;
    menitTerlambat?: number;
    batasJam?: string;
    isAlreadyRecorded?: boolean;
  } | null>(null);
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
    const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
    setFlashColor(colors[type]);
    setFlashVisible(true);
    if (flashResetRef.current) clearTimeout(flashResetRef.current);
    flashResetRef.current = setTimeout(() => {
      setFlashVisible(false);
      setTimeout(() => setFlashColor(null), 500);
    }, 380);
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
        const batasMasuk = new Date(now);
        batasMasuk.setHours(jH, jM, 0, 0);

        const isTerlambat = now > batasMasuk;
        const diffMs = now.getTime() - batasMasuk.getTime();
        const menitTerlambat = isTerlambat ? Math.max(1, Math.round(diffMs / 60000)) : 0;
        const batasJamStr = `${String(jH).padStart(2, '0')}:${String(jM).padStart(2, '0')}`;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        playScannerBeep(isTerlambat ? 'warning' : 'success');
        triggerFlash(isTerlambat ? 'warning' : 'success');
        setAbsensiGuruHariIni(prev => ({ ...(prev || {}), [guru.id]: { status: statusAbsen, jam: timeStr } }));
        setLastScanned({ 
          guru, 
          status: isTerlambat ? 'warning' : 'success', 
          message: isTerlambat ? `Terlambat ${menitTerlambat} Menit` : "Tepat Waktu", 
          time: timeStr,
          isTerlambat,
          menitTerlambat,
          batasJam: batasJamStr,
        });
        if (isTerlambat) {
          toast.warning(`Presensi dicatat: ${guru.nama} Terlambat (${menitTerlambat} menit)`);
        } else {
          toast.success(`✨ Presensi tepat waktu: ${guru.nama} Hadir (${timeStr})`);
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
      <style>{`
        @keyframes scanSuccessBounce {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scanWarningShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes pulseGlowGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
        }
        @keyframes pulseGlowAmber {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
          50% { box-shadow: 0 0 0 14px rgba(245, 158, 11, 0); }
        }
        ${cameraMode === "user" ? `#reader-guru video { transform: scaleX(-1) !important; }` : ""}
      `}</style>

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
        ) : lastScanned.isTerlambat ? (
          /* ======================================================== */
          /* KARTU TERLAMBAT GURU                                     */
          /* ======================================================== */
          <div
            className="flex flex-col items-center text-center p-5 rounded-2xl w-full shadow-lg relative overflow-hidden mb-2"
            style={{
              animation: "scanWarningShake 0.45s ease-in-out forwards",
              background: "linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 38%)",
              border: "2px solid #F59E0B",
              boxShadow: "0 12px 28px -6px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#F59E0B] text-white shadow-sm mb-3.5 animate-pulse">
              <Clock size={13} />
              <span>TERLAMBAT MASUK</span>
            </div>

            <div className="relative mb-3">
              <div
                className="w-16 h-16 rounded-full bg-[#F59E0B] flex items-center justify-center border-4 border-[#F59E0B] text-white font-bold text-2xl shadow-md"
                style={{ animation: "pulseGlowAmber 1.8s infinite" }}
              >
                {lastScanned.guru.inits}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow bg-[#F59E0B]"
                title="Terlambat"
              >
                <AlertTriangle size={13} color="white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1C2517] mb-0.5">{lastScanned.guru.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-3">
              {lastScanned.guru.nuptk ? `NUPTK: ${lastScanned.guru.nuptk}` : "NUPTK: -"}
            </p>

            <div className="w-full max-w-sm bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm mb-0.5">
                <Clock size={16} className="text-amber-600" />
                <span>Terlambat {lastScanned.menitTerlambat || 0} Menit</span>
                <span className="text-xs font-normal text-amber-700">({lastScanned.time})</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Batas waktu kedatangan guru: <strong>{lastScanned.batasJam || '07:00'}</strong>
              </p>
            </div>

            <div className="w-full pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs text-[#6B7769]">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Kamera siap scan berikutnya...
              </span>
              <button
                type="button"
                onClick={handleNextScan}
                className="text-xs text-[#6B7769] hover:text-[#1C2517] underline font-medium"
              >
                Scan Sekarang
              </button>
            </div>
          </div>
        ) : lastScanned.status === 'success' ? (
          /* ======================================================== */
          /* KARTU TEPAT WAKTU GURU                                   */
          /* ======================================================== */
          <div
            className="flex flex-col items-center text-center p-5 rounded-2xl w-full shadow-lg relative overflow-hidden mb-2"
            style={{
              animation: "scanSuccessBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 38%)",
              border: "2px solid #10B981",
              boxShadow: "0 12px 28px -6px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#10B981] text-white shadow-sm mb-3.5">
              <Sparkles size={13} />
              <span>✨ HADIR TEPAT WAKTU</span>
            </div>

            <div className="relative mb-3">
              <div
                className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center border-4 border-[#10B981] text-white font-bold text-2xl shadow-md"
                style={{ animation: "pulseGlowGreen 2s infinite" }}
              >
                {lastScanned.guru.inits}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow bg-[#10B981]"
                title="Tepat Waktu"
              >
                <CheckCircle2 size={15} color="white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1C2517] mb-0.5">{lastScanned.guru.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-3">
              {lastScanned.guru.nuptk ? `NUPTK: ${lastScanned.guru.nuptk}` : "NUPTK: -"}
            </p>

            <div className="w-full max-w-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm mb-0.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Berhasil Hadir Pukul {lastScanned.time}</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Alhamdulillah, hadir tepat waktu. Selamat beraktivitas dan membimbing siswa!
              </p>
            </div>

            <div className="w-full pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs text-[#6B7769]">
              <span className="flex items-center gap-1.5 text-[#3E8A2F] font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#3E8A2F] animate-ping"></span>
                Kamera siap scan berikutnya...
              </span>
              <button
                type="button"
                onClick={handleNextScan}
                className="text-xs text-[#6B7769] hover:text-[#1C2517] underline font-medium"
              >
                Scan Sekarang
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* KARTU SUDAH TERCATAT / ERROR LAINNYA                     */
          /* ======================================================== */
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
  const [showSemuaHadirModal, setShowSemuaHadirModal] = useState(false);

  const activeGuru = useMemo(() => guruList.filter(g => g.status === "Aktif"), [guruList]);

  const setStatus = (id: number, v: string) => {
    setAbsensiGuruHariIni(prev => {
      const safePrev = prev || {};
      const prevJam = safePrev[id]?.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return { ...safePrev, [id]: { status: v, jam: prevJam } };
    });
  };

  const handleSemuaHadirClick = () => {
    if (chips.Belum === 0) {
      toast.info("Semua guru sudah memiliki catatan kehadiran.");
      return;
    }
    setShowSemuaHadirModal(true);
  };

  const handleConfirmSemuaHadir = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let countMarked = 0;
    setAbsensiGuruHariIni(prev => {
      const next = { ...(prev || {}) };
      activeGuru.forEach(g => {
        if (!next[g.id]) {
          next[g.id] = { status: "Hadir", jam: timeStr };
          countMarked++;
        }
      });
      return next;
    });
    toast.success(`${countMarked} guru yang belum absen berhasil ditandai Hadir`);
    setShowSemuaHadirModal(false);
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
      <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-white shrink-0 self-start md:self-auto" style={{ border: "1.5px solid #3E8A2F" }}>
            <CalendarDays size={15} className="text-[#3E8A2F]" />
            <span className="text-xs sm:text-sm font-semibold text-[#1C2517]">{todayStr}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 md:w-64" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
              <Search size={13} className="text-[#9CA3A0] shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/NUPTK..." className="bg-transparent outline-none text-sm text-[#1C2517] w-full" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none appearance-none"
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
                onClick={handleSemuaHadirClick}
                className="px-3.5 py-2 rounded-lg bg-[#F5F9F4] text-[#3E8A2F] text-xs sm:text-sm font-semibold hover:bg-[#E8F2E6] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5" style={{ border: "1px solid #3E8A2F" }}
              >
                <CheckCircle2 size={14} />
                <span>Semua Hadir</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {chipDefs.map((c) => (
            <div key={c.label} className="flex flex-col items-center justify-center rounded-xl py-2.5 sm:py-3 px-1.5 sm:px-2 text-center" style={{ background: c.color }}>
              <span className="tabular-nums font-bold text-base sm:text-xl leading-none" style={{ color: c.text }}>{c.value}</span>
              <span className="text-[10px] font-medium mt-1 truncate w-full" style={{ color: c.text }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Guru Cards */}
      <div className="md:hidden flex flex-col gap-2.5 p-3 sm:p-4">
        {filteredRows.length === 0 ? (
          <p className="text-sm text-[#9CA3A0] text-center py-8">Tidak ada data guru ditemukan</p>
        ) : (
          filteredRows.map((row) => {
            const safeData = absensiGuruHariIni || {};
            const rec = safeData[row.id];
            const status = rec?.status || null;
            const jam = rec?.jam || null;
            const belum = status === null;
            const late = status === "Terlambat";

            return (
              <div
                key={row.id}
                className="bg-white rounded-xl p-3.5 flex flex-col gap-3 transition-colors shadow-xs"
                style={{
                  border: "1px solid #E2E8DE",
                  background: belum ? "#FFFBEB" : "#FFFFFF"
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#3E8A2F] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                      {row.inits}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C2517] leading-tight">{row.nama}</p>
                      <p className="text-[11px] text-[#9CA3A0] mt-0.5">{row.nuptk ? `NUPTK: ${row.nuptk}` : "Guru"} · {row.mapel || "—"}</p>
                    </div>
                  </div>
                  {jam && (
                    <span className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded bg-[#FAFBF9] border border-[#E2E8DE]" style={{ color: late ? "#92400E" : "#3E8A2F" }}>
                      {jam}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F0F7EE]">
                  <AbsensiStatusControl value={status} onChange={(v) => setStatus(row.id, v)} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
      <div
        className="bg-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between"
        style={{
          position: "fixed",
          bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom, 0px))" : 0,
          left: isMobile ? 0 : "var(--sidebar-w, 260px)",
          right: 0,
          borderTop: "1px solid #E2E8DE",
          zIndex: 50,
          boxShadow: isMobile ? "0 -4px 12px rgba(0,0,0,0.05)" : undefined,
        }}
      >
        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#1C2517] tabular-nums">{activeGuru.length - chips.Belum} dari {activeGuru.length}</span>
          <span className="text-xs sm:text-sm text-[#6B7769] ml-1">tercatat</span>
          {chips.Belum > 0 && <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] tabular-nums">{chips.Belum} belum</span>}
        </div>
        <button 
          onClick={handleSaveClick}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#3E8A2F] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E6B22] transition-colors shadow-sm"
        >
          Simpan Absensi
        </button>
      </div>

      {/* Modal Dialog Konfirmasi "Semua Hadir" Guru */}
      {showSemuaHadirModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8DE] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#3E8A2F] shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1C2517]">Tandai Semua Guru Hadir?</h3>
                <p className="text-xs text-[#6B7769]">Konfirmasi presensi massal untuk guru yang belum absen.</p>
              </div>
            </div>

            <div className="bg-[#FAFBF9] rounded-xl p-4 border border-[#E2E8DE] mb-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7769]">Guru Belum Absen:</span>
                <span className="font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                  {chips.Belum} Guru
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7769]">Waktu Presensi:</span>
                <span className="font-semibold text-[#1C2517]">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#E2E8DE] text-[11px] text-[#6B7769] leading-relaxed flex items-start gap-1.5">
                <Info size={14} className="text-[#3E8A2F] shrink-0 mt-0.5" />
                <span>
                  Guru yang sudah memiliki catatan kehadiran tidak akan diubah. Hanya guru yang masih berstatus <strong>Belum Absen</strong> yang akan ditandai Hadir.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSemuaHadirModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6B7769] hover:bg-neutral-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSemuaHadir}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check size={16} />
                <span>Ya, Tandai Hadir ({chips.Belum})</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
    <div className="w-full max-w-[1600px] mx-auto space-y-5 px-4 md:px-0" style={{ paddingBottom: 72 }}>
      <div>
        <h2 className="text-[#1C2517]">Absensi Guru</h2>
        <p className="text-sm text-[#6B7769]">Rekam dan pantau kehadiran guru menggunakan QR Code atau Manual</p>
      </div>

      <div className="flex sm:inline-flex w-full sm:w-auto rounded-lg p-1 bg-[#EDF7EC]">
        {(["scan", "manual", "rekapitulasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/akademik/absensi/${t}`)}
            className={[
              "flex-1 sm:flex-initial text-center px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t === "scan" ? "Scan QR" : t === "manual" ? "Manual" : "Rekapitulasi"}
          </button>
        ))}
      </div>

      {activeTab === "scan" ? <ScanTabGuru /> : activeTab === "manual" ? <ManualTab /> : <RekapitulasiTab />}
    </div>
  );
}
