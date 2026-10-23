import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Html5Qrcode } from "html5-qrcode";
import { 
  QrCode, CalendarDays, Search, ChevronDown, CheckCircle2, AlertCircle, 
  Info, SwitchCamera, Lock, MessageCircle, ExternalLink, Clock, Sparkles, 
  AlertTriangle, Check
} from "lucide-react";
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

// --- Scanner Audio Feedback (Web Audio API) ---
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

// --- Scan Tab ----------------------------------------------------------------
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
    isTerlambat?: boolean;
    menitTerlambat?: number;
    batasJam?: string;
    isAlreadyRecorded?: boolean;
    waInfo?: { type: 'sent' | 'no_phone' | 'disabled'; phone?: string };
  } | null>(null);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">(isMobile ? "environment" : "user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedNisRef = useRef<{ nis: string; time: number } | null>(null);
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
    lastScannedNisRef.current = null;
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

  // Ref agar camera callback selalu pakai processScan terbaru (hindari stale closure)
  const processScanRef = useRef<(text: string) => void>(() => {});

  const processScan = (scannedText: string) => {
    // Format QR Card: "NAMA_SEKOLAH|NIS|Nama" (contoh: "MADRASAH AL-ITTIHAD|2024-0089|Ahmad")
    let nis = scannedText.trim();
    if (nis.includes("|")) {
      nis = nis.split("|")[1].trim();
    }
    
    // Cooldown per NIS: jika NIS yang sama baru saja di-scan dalam 5 detik, abaikan agar tidak loop berulang
    const nowMs = Date.now();
    if (lastScannedNisRef.current && lastScannedNisRef.current.nis === nis && nowMs - lastScannedNisRef.current.time < 5000) {
      return;
    }
    lastScannedNisRef.current = { nis, time: nowMs };

    const siswa = siswaList.find(s => 
      s.nis === nis || 
      s.nisn === nis || 
      s.nama.toLowerCase() === nis.toLowerCase()
    );
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (siswa) {
      if (siswa.status === "Nonaktif") {
        playScannerBeep('error');
        triggerFlash('error');
        setLastScanned({ siswa, status: 'error', message: "Siswa berstatus Nonaktif", time: timeStr });
        toast.error(`Siswa ${siswa.nama} berstatus Nonaktif`);
      } else if (absensiSiswaHariIni[siswa.nis]) {
        // Siswa sudah terdata sebelumnya --- kunci status & cegah scan ulang
        playScannerBeep('warning');
        triggerFlash('warning');
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
        const batasMasuk = new Date(now);
        batasMasuk.setHours(jH, jM, 0, 0);

        const isTerlambat = now > batasMasuk;
        const diffMs = now.getTime() - batasMasuk.getTime();
        const menitTerlambat = isTerlambat ? Math.max(1, Math.round(diffMs / 60000)) : 0;
        const batasJamStr = `${String(jH).padStart(2, '0')}:${String(jM).padStart(2, '0')}`;
        const statusAbsen = isTerlambat ? "Terlambat" : "Hadir";

        playScannerBeep(isTerlambat ? 'warning' : 'success');
        triggerFlash(isTerlambat ? 'warning' : 'success');
        setAbsensiSiswaHariIni(prev => ({ ...prev, [nis]: { status: statusAbsen, jam: timeStr } }));

        let waInfo: { type: 'sent' | 'no_phone' | 'disabled'; phone?: string } | undefined = undefined;

        if (isTerlambat) {
          if (!siswa.waliHp) {
            waInfo = { type: 'no_phone' };
            toast.warning(`Siswa terlambat (${menitTerlambat} menit). Nomor WA wali belum terdaftar.`);
          } else if (!appSettings.wahaEnabled) {
            waInfo = { type: 'disabled', phone: siswa.waliHp };
            toast.info(`Siswa terlambat (${menitTerlambat} menit). Notifikasi WA otomatis belum diaktifkan.`);
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
            }).then(res => {
              if (res.ok) {
                toast.success(`Notifikasi WA keterlambatan dikirim ke wali murid (${siswa.waliHp}).`);
              } else {
                toast.error(`Gagal mengirim notifikasi WA: ${res.error}`);
              }
            });
          }
        } else {
          toast.success(`✨ Tepat waktu: ${siswa.nama} Hadir pukul ${timeStr}`);
        }

        setLastScanned({
          siswa,
          status: isTerlambat ? 'warning' : 'success',
          message: isTerlambat ? `Terlambat ${menitTerlambat} Menit` : "Tepat Waktu",
          time: timeStr,
          isTerlambat,
          menitTerlambat,
          batasJam: batasJamStr,
          waInfo,
        });
      }
    } else {
      playScannerBeep('error');
      triggerFlash('error');
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

  // Initialize Html5Qrcode dengan dynamic qrbox dan kamera fallback multi-tier
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;
    setCameraError(null);

    const startScanner = async () => {
      const container = document.getElementById("reader");
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
          const instance = new Html5Qrcode("reader");
          html5QrCode = instance;
          await instance.start(target, qrConfig, onDecoded, () => {});
          return true;
        } catch (err) {
          console.warn("Percobaan kamera siswa gagal untuk:", target, err);
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
          console.warn("Html5Qrcode.getCameras siswa gagal:", e);
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
        ${cameraMode === "user" ? `#reader video { transform: scaleX(-1) !important; }` : ""}
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {/* Banner Indikator Kamera Berjalan */}
        <div className="w-full flex items-center justify-between px-4 py-2 mb-3 bg-[#F4F9F2] rounded-xl border border-[#D5E7CE] text-xs font-medium text-[#2E6B22]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E8A2F] animate-pulse"></span>
            <strong>Scanner Siswa Aktif</strong>
          </span>
          <span className="text-[#6B7769] font-normal">
            {cameraMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
          </span>
        </div>

        {cameraError && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-center text-xs text-amber-800">
            <p className="font-semibold mb-0.5">{cameraError}</p>
            <p className="text-[11px] text-amber-700">Anda dapat memasukkan NIS siswa melalui formulir manual di bawah.</p>
          </div>
        )}

        {/* Video Box Kamera */}
        <div className="w-full relative mb-3">
          <div id="reader" className="w-full rounded-2xl overflow-hidden shadow-sm bg-neutral-900" style={{ border: "2px solid #E2E8DE", minHeight: 220 }}></div>
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
            placeholder="Scan barcode kartu atau ketik NIS siswa..."
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
            <h3 className="text-xl font-bold text-[#1C2517] mb-1">Arahkan Kartu Siswa ke Kamera</h3>
            <p className="text-[#6B7769] text-xs">Atau gunakan scanner fisik. Scanner standby dan terus menyala tanpa perlu refresh.</p>
          </div>
        ) : lastScanned.isTerlambat ? (
          /* ======================================================== */
          /* KARTU TERLAMBAT: Animasi Peringatan / Shake + Amber Aura */
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
            {/* Top Amber Caution Banner */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#F59E0B] text-white shadow-sm mb-3.5 animate-pulse">
              <Clock size={13} />
              <span>TERLAMBAT MASUK</span>
            </div>

            {/* Avatar dengan Pulsing Amber Glow */}
            <div className="relative mb-3">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#F59E0B] shadow-md"
                style={{ animation: "pulseGlowAmber 1.8s infinite" }}
              >
                <img
                  src={lastScanned.siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'}
                  alt={lastScanned.siswa.nama}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow bg-[#F59E0B]"
                title="Terlambat"
              >
                <AlertTriangle size={14} color="white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#1C2517] mb-0.5">{lastScanned.siswa.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-3">
              NIS: <span className="font-semibold text-[#1C2517]">{lastScanned.siswa.nis}</span> • Kelas {lastScanned.siswa.kelas}
            </p>

            {/* Big Late Indicator Banner */}
            <div className="w-full max-w-sm bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm mb-0.5">
                <Clock size={16} className="text-amber-600" />
                <span>Terlambat {lastScanned.menitTerlambat || 0} Menit</span>
                <span className="text-xs font-normal text-amber-700">({lastScanned.time})</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Batas waktu masuk madrasah: <strong>{lastScanned.batasJam || '07:00'}</strong>
              </p>
            </div>

            {/* Status WhatsApp */}
            {lastScanned.waInfo && (
              <div className="w-full mb-3">
                {lastScanned.waInfo.type === 'sent' && (
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>WA otomatis keterlambatan dikirim ke wali murid ({lastScanned.waInfo.phone})</span>
                  </div>
                )}
                {lastScanned.waInfo.type === 'no_phone' && (
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>Nomor WhatsApp wali murid belum terdaftar di data siswa</span>
                  </div>
                )}
                {lastScanned.waInfo.type === 'disabled' && (
                  <div className="flex flex-col items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 text-xs">
                    <span>Notifikasi WA otomatis nonaktif</span>
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
                        className="inline-flex items-center gap-1 font-bold text-[#166534] bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        <MessageCircle size={14} />
                        Kirim WA Manual ({lastScanned.siswa.waliHp})
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Bar: Kamera Standby */}
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
          /* KARTU TIDAK TERLAMBAT (TEPAT WAKTU): Animasi Bounce + Hijau Segar */
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
            {/* Top Emerald Celebration Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#10B981] text-white shadow-sm mb-3.5">
              <Sparkles size={13} />
              <span>✨ HADIR TEPAT WAKTU</span>
            </div>

            {/* Avatar dengan Pulsing Emerald Halo */}
            <div className="relative mb-3">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#10B981] shadow-md"
                style={{ animation: "pulseGlowGreen 2s infinite" }}
              >
                <img
                  src={lastScanned.siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'}
                  alt={lastScanned.siswa.nama}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow bg-[#10B981]"
                title="Tepat Waktu"
              >
                <CheckCircle2 size={16} color="white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#1C2517] mb-0.5">{lastScanned.siswa.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-3">
              NIS: <span className="font-semibold text-[#1C2517]">{lastScanned.siswa.nis}</span> • Kelas {lastScanned.siswa.kelas}
            </p>

            {/* Success Banner */}
            <div className="w-full max-w-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm mb-0.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Berhasil Hadir Pukul {lastScanned.time}</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Alhamdulillah, hadir tepat waktu. Selamat belajar dan berprestasi!
              </p>
            </div>

            {/* Bottom Bar */}
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
            className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border w-full shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200 mb-2"
            style={{ borderColor: statusColor }}
          >
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-sm" style={{ borderColor: statusColor }}>
                <img
                  src={lastScanned.siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'}
                  alt="Foto"
                  className={`w-full h-full object-cover ${lastScanned.siswa.id === 0 ? 'grayscale opacity-30' : ''}`}
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow"
                style={{ background: statusColor }}
              >
                <StatusIcon size={15} color="white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#1C2517] mb-0.5">{lastScanned.siswa.nama}</h3>
            <p className="text-xs font-medium text-[#6B7769] mb-2.5">
              NIS: <span className="font-semibold text-[#1C2517]">{lastScanned.siswa.nis}</span> --- Kelas {lastScanned.siswa.kelas}
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm mb-2.5 shadow-sm"
              style={{ background: statusBg, color: statusText }}
            >
              {lastScanned.message} --- {lastScanned.time}
            </div>

            {/* Status Terkunci jika scan berulang */}
            {lastScanned.isAlreadyRecorded && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-2.5 text-center">
                <p className="text-amber-900 font-bold text-xs mb-0.5 flex items-center justify-center gap-1.5">
                  <Lock size={13} className="text-amber-700" /> Status Sudah Terkunci
                </p>
                <p className="text-amber-800 text-[11px]">
                  Siswa sudah presensi hari ini. Ubah status lewat menu <strong>Rekap Manual</strong> jika perlu koreksi.
                </p>
              </div>
            )}

            {/* Bar bawah kartu: siap scan berikutnya */}
            <div className="w-full pt-2 border-t border-[#E2E8DE] flex items-center justify-between text-xs text-[#6B7769]">
              <span className="flex items-center gap-1.5 text-[#3E8A2F] font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#3E8A2F] animate-ping"></span>
                Kamera siap scan kartu berikutnya...
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

// --- Manual Tab ----------------------------------------------------------------
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

  const notifCount = useMemo(() => {
    return targetSiswa.filter(s => {
      const st = absensiSiswaHariIni[s.nis]?.status;
      return (st === "Alpa" || st === "Terlambat") && !!s.waliHp;
    }).length;
  }, [targetSiswa, absensiSiswaHariIni]);

  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  const handleConfirm = async () => {
    try {
      // Kirim WA otomatis ke wali siswa Alpa & Terlambat
      let waCount = 0;
      if (appSettings.wahaEnabled) {
        const notifPayloads: any[] = [];
        targetSiswa.forEach(s => {
          if (!s.waliHp) return;
          const status = absensiSiswaHariIni[s.nis]?.status;
          const jam = absensiSiswaHariIni[s.nis]?.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          if (status === "Alpa") {
            notifPayloads.push({
              phone: s.waliHp,
              nama_penerima: s.waliNama || `Wali dari ${s.nama}`,
              pesan: renderTemplate(
                appSettings.waTemplates?.absensiAlpa ?? WA_TEMPLATE_DEFAULTS.absensiAlpa,
                { nama_siswa: s.nama, kelas: s.kelas, tanggal: todayStr },
              ),
              jenis: "absensi",
              ref_id: s.nis,
              priority: 1,
            });
          } else if (status === "Terlambat") {
            notifPayloads.push({
              phone: s.waliHp,
              nama_penerima: s.waliNama || `Wali dari ${s.nama}`,
              pesan: renderTemplate(
                appSettings.waTemplates?.absensiTerlambat ?? WA_TEMPLATE_DEFAULTS.absensiTerlambat,
                { nama_siswa: s.nama, kelas: s.kelas, jam_masuk: jam },
              ),
              jenis: "absensi",
              ref_id: s.nis,
              priority: 1,
            });
          }
        });

        if (notifPayloads.length > 0) {
          const res = await enqueueBulk(notifPayloads);
          if (res.ok) {
            waCount = res.count;
          } else {
            toast.error(`Gagal kirim notifikasi WA: ${res.error ?? "koneksi bermasalah"}`);
          }
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
        deskripsi: `Simpan absensi ${kelasFilter}: ${hadir} Hadir, ${terlambat} Terlambat, ${izin} Izin, ${sakit} Sakit, ${alpa} Alpa${waCount > 0 ? ` (${waCount} WA dikirim)` : ""}`,
        ref: "---",
      });

      toast.success(
        `Presensi siswa berhasil disimpan (${targetSiswa.length - chips.Belum} tercatat)${waCount > 0 ? ` · ${waCount} notifikasi WA terkirim/diantrekan` : ""}.`
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
    <div className="bg-white rounded-xl pb-[76px] sm:pb-[72px]" style={{ border: "1px solid #E2E8DE" }}>
      <div className="p-4 sm:px-6 sm:py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
        {/* Top Header & Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white shrink-0" style={{ border: "1.5px solid #3E8A2F" }}>
              <CalendarDays size={14} className="text-[#3E8A2F]" />
              <span className="text-xs sm:text-sm font-semibold text-[#1C2517]">{todayStr}</span>
            </div>
            
            <button
              onClick={markAllTargetHadir}
              className="px-3 py-2 rounded-lg bg-[#F5F9F4] text-[#3E8A2F] text-xs sm:text-sm font-semibold hover:bg-[#E8F2E6] transition-colors whitespace-nowrap"
              style={{ border: "1px solid #3E8A2F" }}
            >
              Semua Hadir
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
              <Search size={14} className="text-[#9CA3A0] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / NIS..."
                className="bg-transparent outline-none text-xs sm:text-sm text-[#1C2517] w-full"
              />
            </div>

            {/* Filter Kelas */}
            <div className="relative">
              <select
                value={kelasFilter}
                onChange={(e) => setKelasFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs sm:text-sm text-[#374040] outline-none"
                style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
              >
                {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs sm:text-sm text-[#374040] outline-none"
                style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Belum">Belum Absen</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin/Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Chips Counter */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {chipDefs.map((c) => (
            <div key={c.label} className="flex flex-col items-center justify-center rounded-xl py-2.5 px-1.5 sm:py-3 sm:px-2" style={{ background: c.color }}>
              <span className="tabular-nums font-bold text-base sm:text-xl" style={{ color: c.text }}>{c.value}</span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: c.text }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE VIEW: Attendance Cards (md:hidden) ── */}
      <div className="md:hidden flex flex-col gap-2.5 p-3">
        {filteredRows.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#9CA3A0]">Tidak ada data siswa ditemukan</div>
        ) : (
          filteredRows.map((row) => {
            const rec = absensiSiswaHariIni[row.nis];
            const status = rec?.status ?? null;
            const jam = rec?.jam ?? null;
            const belum = status === null;
            const late = status === "Terlambat";

            return (
              <div
                key={row.id}
                className="rounded-xl overflow-hidden bg-white border border-[#E2E8DE] shadow-sm transition-all"
                style={{ background: belum ? "#FFFDF5" : "#FFFFFF" }}
              >
                {/* Header card: Avatar, Nama, NIS, Kelas & Waktu */}
                <div className="flex items-start gap-3 p-3.5 pb-2.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden border border-black/5"
                    style={{ background: belum ? "#F59E0B" : "#3E8A2F", color: "#FFF" }}
                  >
                    <img src={row.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={row.nama} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[13px] font-bold text-[#1C2517] truncate leading-tight">
                        {row.nama}
                      </p>
                      {jam ? (
                        <span className={`text-[11px] font-semibold tabular-nums shrink-0 ${late ? "text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" : "text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"}`}>
                          {jam}
                        </span>
                      ) : belum ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0">
                          Belum
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#6B7769] font-medium">{row.nis}</span>
                      <span className="text-[10px] text-[#9CA3A0]">•</span>
                      <span className="text-[11px] font-semibold text-[#3E8A2F] bg-[#EDF7EC] px-1.5 py-0.5 rounded">
                        Kelas {row.kelas}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status selector & Actions */}
                <div className="px-3.5 pb-3 pt-1 border-t border-[#F0F7EE] space-y-2">
                  <AbsensiStatusControl
                    value={status}
                    onChange={(v) => handleRequestStatusChange(row, v)}
                    minH={40}
                  />

                  {(status === "Terlambat" || status === "Alpa") && row.waliHp && (
                    <a
                      href={`https://wa.me/${row.waliHp.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(
                        status === "Terlambat"
                          ? renderTemplate(appSettings.waTemplates?.absensiTerlambat ?? WA_TEMPLATE_DEFAULTS.absensiTerlambat, {
                              nama_siswa: row.nama,
                              kelas: row.kelas,
                              jam_masuk: jam || '---',
                            })
                          : renderTemplate(appSettings.waTemplates?.absensiAlpa ?? WA_TEMPLATE_DEFAULTS.absensiAlpa, {
                              nama_siswa: row.nama,
                              kelas: row.kelas,
                              tanggal: todayStr,
                            })
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <MessageCircle size={14} className="text-[#25D366]" />
                      <span>Kirim WA ke Orang Tua ({row.waliHp})</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP VIEW: Table (hidden md:block) ── */}
      <div className="hidden md:block overflow-x-auto">
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
                      <span className="text-sm text-[#D1D5DB]">---</span>
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
                                  jam_masuk: jam || '---',
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
      <div
        className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg"
        style={{
          position: "fixed",
          bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom, 0px))" : 0,
          left: isMobile ? 0 : "var(--sidebar-w, 260px)",
          right: 0,
          borderTop: "1px solid #E2E8DE",
          zIndex: 45,
        }}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-[#1C2517] tabular-nums truncate">
            {tercatatCount} dari {targetSiswa.length} {kelasFilter === "Semua Kelas" ? "siswa" : `siswa ${kelasFilter}`}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {chips.Belum > 0 ? (
              <span className="text-[10px] sm:text-xs font-semibold text-[#92400E]">
                {chips.Belum} siswa belum absen
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-semibold text-[#166534]">
                Semua kehadiran tercatat
              </span>
            )}
            {appSettings.wahaEnabled && notifCount > 0 && (
              <span className="text-[10px] sm:text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                • <MessageCircle size={11} /> {notifCount} WA otomatis siap dikirim
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSaveClick}
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#3E8A2F] text-white text-xs sm:text-sm font-bold hover:bg-[#2E6B22] transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
        >
          {appSettings.wahaEnabled && notifCount > 0 ? (
            <>
              <MessageCircle size={15} />
              <span>Simpan & Kirim WA ({notifCount})</span>
            </>
          ) : (
            <span>Simpan Presensi</span>
          )}
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
                  <p className="text-xs text-[#6B7769]">NIS: {confirmEdit.siswa.nis} --- Kelas {confirmEdit.siswa.kelas}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#E2E8DE]">
                <div className="flex flex-col">
                  <span className="text-[#6B7769] mb-1">Status Saat Ini:</span>
                  <span className="font-bold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {confirmEdit.oldStatus} ({confirmEdit.currentJam})
                  </span>
                </div>
                <div className="text-neutral-400 font-bold text-base px-2">---</div>
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

// --- page ---
export function AbsensiSiswa() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "scan";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 px-4 md:px-0" style={{ paddingBottom: 80 }}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1C2517]">Absensi Siswa</h2>
        <p className="text-xs md:text-sm text-[#6B7769]">Rekam dan pantau kehadiran siswa menggunakan QR Code atau Manual</p>
      </div>

      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC] w-full md:w-auto">
        {(["scan", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/akademik/absensi-siswa/${t}`)}
            className={[
              "flex-1 md:flex-initial px-4 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-center",
              activeTab === t ? "bg-white text-[#1C2517] shadow-sm" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
          >
            {t === "scan" ? "Stasiun Scan QR" : "Rekap Manual"}
          </button>
        ))}
      </div>

      {activeTab === "scan" ? <ScanTab /> : <ManualTab />}
    </div>
  );
}
