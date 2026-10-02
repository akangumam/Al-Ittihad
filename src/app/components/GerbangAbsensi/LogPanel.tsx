import { useMemo } from "react";
import { Check, CheckCircle2, Clock, Fingerprint, Keyboard, QrCode, Scan } from "lucide-react";
import type { AbsensiGerbangRecord } from "@/types";
import type { SiswaRow } from "@/data/siswa";
import type { GuruRow } from "@/data/guru";

interface LogPanelProps {
  logs: AbsensiGerbangRecord[];
  siswaList: SiswaRow[];
  guruList: GuruRow[];
  onClose: () => void;
}

export function LogPanel({ logs, siswaList, guruList, onClose }: LogPanelProps) {
  // Hanya ambil log hari ini
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = useMemo(() => logs.filter(l => l.tanggal === today), [logs, today]);

  const stats = useMemo(() => {
    let siswaHadir = 0;
    let siswaTerlambat = 0;
    let guruHadir = 0;
    let guruTerlambat = 0;

    todayLogs.forEach(log => {
      if (log.personType === "siswa") {
        if (log.status === "Hadir") siswaHadir++;
        if (log.status === "Terlambat") siswaTerlambat++;
      } else {
        if (log.status === "Hadir") guruHadir++;
        if (log.status === "Terlambat") guruTerlambat++;
      }
    });

    return { siswaHadir, siswaTerlambat, guruHadir, guruTerlambat };
  }, [todayLogs]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "qr": return <QrCode size={12} className="text-[#6B7769]" />;
      case "fingerprint": return <Fingerprint size={12} className="text-[#6B7769]" />;
      case "manual": return <Keyboard size={12} className="text-[#6B7769]" />;
      default: return null;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "qr": return "Scan QR";
      case "fingerprint": return "Sidik Jari";
      case "manual": return "Manual";
      default: return method;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 p-6 gap-4 border-b border-[#E2E8DE] shrink-0 bg-white">
        <div className="flex items-center gap-4 bg-[#F5F9F4] rounded-xl p-4 border border-[#EBF4EA]">
          <div className="flex-1">
            <p className="text-xs font-bold text-[#6B7769] tracking-widest uppercase mb-1">Total Siswa</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1C2517]">{stats.siswaHadir + stats.siswaTerlambat}</span>
              <span className="text-sm font-medium text-[#9CA3A0]">/ {siswaList.length}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs font-semibold text-right">
            <div className="flex items-center justify-end gap-1 text-[#3E8A2F]"><Check size={12}/> {stats.siswaHadir}</div>
            <div className="flex items-center justify-end gap-1 text-[#F6B31E]"><Clock size={12}/> {stats.siswaTerlambat}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[#E2E8DE]">
          <div className="flex-1">
            <p className="text-xs font-bold text-[#6B7769] tracking-widest uppercase mb-1">Total Guru</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1C2517]">{stats.guruHadir + stats.guruTerlambat}</span>
              <span className="text-sm font-medium text-[#9CA3A0]">/ {guruList.length}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs font-semibold text-right">
            <div className="flex items-center justify-end gap-1 text-[#3E8A2F]"><Check size={12}/> {stats.guruHadir}</div>
            <div className="flex items-center justify-end gap-1 text-[#F6B31E]"><Clock size={12}/> {stats.guruTerlambat}</div>
          </div>
        </div>
      </div>

      {/* ── Logs Table ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFCFA]">
        <h3 className="text-sm font-bold text-[#1C2517] mb-4">LOG HARI INI</h3>
        
        {todayLogs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#9CA3A0]">
            <Scan size={48} className="mb-4 opacity-50" />
            <p className="font-medium">Belum ada data absensi hari ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs.map(log => {
              let name = "";
              let subtitle = "";
              if (log.personType === "siswa") {
                const s = siswaList.find(x => x.nis === log.personId);
                name = s ? s.nama : log.personId;
                subtitle = s ? `Kelas ${s.kelas}` : "Siswa";
              } else {
                const g = guruList.find(x => String(x.id) === log.personId);
                name = g ? g.nama : log.personId;
                subtitle = "Guru / Pegawai";
              }

              return (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-[#E2E8DE] rounded-xl shadow-sm hover:border-[#C1CEC0] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${log.status === "Hadir" ? "bg-[#3E8A2F]" : "bg-[#F6B31E]"}`} />
                    <div>
                      <p className="font-bold text-[#1C2517]">{name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-[#6B7769]">{subtitle}</span>
                        <span className="w-1 h-1 rounded-full bg-[#E2E8DE]" />
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#9CA3A0] uppercase tracking-wider">
                          {getMethodIcon(log.method)}
                          {getMethodLabel(log.method)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${log.status === "Hadir" ? "text-[#3E8A2F]" : "text-[#F6B31E]"}`}>
                      {log.waktuScan}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${log.status === "Hadir" ? "text-[#3E8A2F]" : "text-[#F6B31E]"}`}>
                      {log.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Action Footer ── */}
      <div className="p-6 bg-white border-t border-[#E2E8DE] shrink-0">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#1C2517] hover:bg-[#374040] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle2 size={20} />
          Selesaikan Absensi & Rekap Alpa
        </button>
      </div>
    </div>
  );
}
