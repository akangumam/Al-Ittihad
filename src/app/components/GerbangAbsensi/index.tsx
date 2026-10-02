import { useState, useEffect } from "react";
import { Clock, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";
import { ScanPanel } from "./ScanPanel";
import { LogPanel } from "./LogPanel";
import { AlpaConfirmModal } from "./AlpaConfirmModal";
import { AttendanceService } from "@/services/attendance/AttendanceService";
import type { AbsensiGerbangRecord } from "@/types";

export function GerbangAbsensi() {
  const {
    siswaList,
    guruList,
    absensiSettings,
    absensiGerbangLog,
    setAbsensiGerbangLog,
    setAbsensiSiswaHariIni,
    setAbsensiGuruHariIni,
  } = useAppContext();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showConfirmAlpa, setShowConfirmAlpa] = useState(false);
  const [lastScanned, setLastScanned] = useState<AbsensiGerbangRecord | null>(null);

  // Update jam real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScan = (qrData: string) => {
    // Format QR: MADRASAH AL-ITTIHAD|ID|NAMA
    const parts = qrData.split("|");
    if (parts.length < 3 || parts[0] !== "MADRASAH AL-ITTIHAD") {
      toast.error("QR Code tidak valid");
      return;
    }

    const idStr = parts[1];
    let personType: "siswa" | "guru" = "siswa";
    
    // Cek apakah ini guru (cari ID di list guru)
    const isGuru = guruList.some(g => String(g.id) === idStr);
    if (isGuru) {
      personType = "guru";
    }

    handleAttendance(idStr, personType, "qr");
  };

  const handleManualInput = (idStr: string, type: "siswa" | "guru") => {
    handleAttendance(idStr, type, "manual", "admin-01"); // admin-01 sbg dummy id admin
  };

  const handleAttendance = (
    personId: string, 
    personType: "siswa" | "guru", 
    method: "qr" | "fingerprint" | "manual",
    adminId?: string
  ) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Cek apakah sudah absen hari ini
    const alreadyScanned = absensiGerbangLog.find(
      (log) => log.personId === personId && log.tanggal === today
    );

    if (alreadyScanned) {
      const prevStatus = alreadyScanned.status;
      const prevTime = alreadyScanned.waktuScan;
      toast.warning(`Sudah absen hari ini (${prevStatus} — ${prevTime})`);
      return;
    }

    const record = AttendanceService.createRecord(personId, personType, method, absensiSettings, adminId);

    // Tambah ke log gerbang
    setAbsensiGerbangLog(prev => [record, ...prev]);
    setLastScanned(record);

    // Sync ke state absensi harian agar halaman Absensi terbaca
    if (personType === "siswa") {
      setAbsensiSiswaHariIni(prev => ({ ...prev, [personId]: record.status }));
    } else {
      const guruIdNum = parseInt(personId, 10);
      if (!isNaN(guruIdNum)) {
        setAbsensiGuruHariIni(prev => ({
          ...prev,
          [guruIdNum]: { status: record.status, jam: record.waktuScan.slice(0, 5) },
        }));
      }
    }

    // Hilangkan notifikasi sukses setelah 3 detik
    setTimeout(() => {
      setLastScanned(null);
    }, 3000);
  };

  const todayStr = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-[calc(100vh-100px)] flex flex-col pt-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-t-2xl border border-[#E2E8DE] border-b-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EBF4EA] flex items-center justify-center text-[#3E8A2F]">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1C2517]">MODE ABSENSI GERBANG</h1>
            <p className="text-sm text-[#6B7769] font-medium">{todayStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold font-mono tracking-widest text-[#1C2517]">
              {currentTime.toLocaleTimeString("id-ID", { hour12: false })}
            </p>
            <p className="text-xs text-[#9CA3A0] font-medium uppercase tracking-widest">
              Batas Hadir: <span className="text-[#F6B31E]">{absensiSettings.batasHadir}</span>
            </p>
          </div>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] hover:text-[#3E8A2F] transition-colors"
            title="Pengaturan Absensi"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex flex-col lg:flex-row flex-1 bg-[#F9FBFC] rounded-b-2xl border border-[#E2E8DE] overflow-hidden shadow-sm">
        
        {/* Left Side: Scanner & Manual Input */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-[#E2E8DE] bg-white relative">
          <ScanPanel 
            onScan={handleScan}
            onManualInput={handleManualInput}
            lastScanned={lastScanned}
            siswaList={siswaList}
            guruList={guruList}
          />
        </div>

        {/* Right Side: Logs */}
        <div className="w-full lg:w-[55%] flex flex-col bg-[#FAFCFA]">
          <LogPanel 
            logs={absensiGerbangLog}
            siswaList={siswaList}
            guruList={guruList}
            onClose={() => setShowConfirmAlpa(true)}
          />
        </div>
      </div>

      {showConfirmAlpa && (
        <AlpaConfirmModal 
          onClose={() => setShowConfirmAlpa(false)} 
        />
      )}
    </div>
  );
}
