import { useState, useMemo } from "react";
import { X, Send, AlertTriangle, Users, BookOpen, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";
import type { AbsensiGerbangRecord } from "@/types";

interface AlpaConfirmModalProps {
  onClose: () => void;
}

export function AlpaConfirmModal({ onClose }: AlpaConfirmModalProps) {
  const {
    siswaList,
    guruList,
    absensiGerbangLog,
    setAbsensiGerbangLog,
    setAbsensiSiswaHariIni,
    setAbsensiGuruHariIni,
    appSettings,
  } = useAppContext();
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"siswa" | "guru">("siswa");

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = useMemo(
    () => absensiGerbangLog.filter(l => l.tanggal === today),
    [absensiGerbangLog, today],
  );

  const unrecordedSiswa = useMemo(
    () =>
      siswaList
        .filter(s => s.status === "Aktif")
        .filter(s => !todayLogs.some(l => l.personId === s.nis && l.personType === "siswa")),
    [siswaList, todayLogs],
  );

  const unrecordedGuru = useMemo(
    () =>
      guruList.filter(
        g => !todayLogs.some(l => l.personId === String(g.id) && l.personType === "guru"),
      ),
    [guruList, todayLogs],
  );

  const handleConfirmAlpa = () => {
    setIsSending(true);

    const now = new Date();
    const tanggal = now.toISOString().split("T")[0];
    const waktuScan = now.toLocaleTimeString("id-ID", { hour12: false });

    const siswaRecords: AbsensiGerbangRecord[] = unrecordedSiswa.map(s => ({
      id: crypto.randomUUID(),
      tanggal,
      personId: s.nis,
      personType: "siswa",
      waktuScan,
      status: "Alpa",
      method: "manual",
      adminId: "admin-01",
    }));

    const guruRecords: AbsensiGerbangRecord[] = unrecordedGuru.map(g => ({
      id: crypto.randomUUID(),
      tanggal,
      personId: String(g.id),
      personType: "guru",
      waktuScan,
      status: "Alpa",
      method: "manual",
      adminId: "admin-01",
    }));

    // Simpan ke log gerbang
    setAbsensiGerbangLog(prev => [...siswaRecords, ...guruRecords, ...prev]);

    // Sync ke state absensi harian
    const siswaUpdate: Record<string, string> = {};
    unrecordedSiswa.forEach(s => { siswaUpdate[s.nis] = "Alpa"; });
    setAbsensiSiswaHariIni(prev => ({ ...prev, ...siswaUpdate }));

    const guruUpdate: Record<number, { status: string; jam: string }> = {};
    unrecordedGuru.forEach(g => { guruUpdate[g.id] = { status: "Alpa", jam: waktuScan.slice(0, 5) }; });
    setAbsensiGuruHariIni(prev => ({ ...prev, ...guruUpdate }));

    setIsSending(false);
    toast.success(
      `Rekap selesai: ${siswaRecords.length} siswa & ${guruRecords.length} guru tercatat Alpa`,
    );
    onClose();
  };

  const openWA = (hp: string, nama: string, kelas: string) => {
    const digits = hp.replace(/\D/g, "");
    const no = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    const tanggalHariIni = new Date().toLocaleDateString("id-ID");
    const pesan = encodeURIComponent(
      `Assalamu'alaikum, Bapak/Ibu Wali dari *${nama}* (Kelas ${kelas}).\n\nKami informasikan bahwa putra/putri Anda tidak tercatat hadir di ${appSettings.namaMadrasah} pada *${tanggalHariIni}*.\n\nMohon konfirmasi jika ada keterangan. Jazakallah khair.`,
    );
    window.open(`https://wa.me/${no}?text=${pesan}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2517]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8DE] bg-[#FAFCFA]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF4E5] flex items-center justify-center text-[#F6B31E]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1C2517]">Konfirmasi Rekap Alpa</h2>
              <p className="text-sm font-medium text-[#6B7769]">Tutup sesi absensi gerbang hari ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9CA3A0] hover:text-[#1C2517] transition-colors rounded-full hover:bg-black/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-[#E2E8DE]">
          <button
            onClick={() => setActiveTab("siswa")}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "siswa"
                ? "border-[#3E8A2F] text-[#3E8A2F]"
                : "border-transparent text-[#9CA3A0] hover:text-[#6B7769]"
            }`}
          >
            <Users size={18} />
            SISWA ALPA ({unrecordedSiswa.length})
          </button>
          <button
            onClick={() => setActiveTab("guru")}
            className={`flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "guru"
                ? "border-[#3E8A2F] text-[#3E8A2F]"
                : "border-transparent text-[#9CA3A0] hover:text-[#6B7769]"
            }`}
          >
            <BookOpen size={18} />
            GURU ALPA ({unrecordedGuru.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <p className="text-sm text-[#6B7769] mb-4">
            Berikut daftar {activeTab} yang belum scan hari ini. Klik <strong>Rekap & Tutup</strong> untuk mencatat
            sebagai ALPA.{" "}
            {activeTab === "siswa" && (
              <span>Gunakan tombol <MessageCircle size={12} className="inline" /> per baris untuk kirim notifikasi WA ke wali.</span>
            )}
          </p>

          <div className="space-y-2">
            {activeTab === "siswa" ? (
              unrecordedSiswa.length === 0 ? (
                <div className="text-center py-10 text-[#6B7769] font-medium">
                  Semua siswa sudah tercatat kehadirannya! 🎉
                </div>
              ) : (
                unrecordedSiswa.map(s => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 border border-[#E2E8DE] rounded-xl hover:bg-[#FAFCFA]"
                  >
                    <div>
                      <p className="font-bold text-[#1C2517]">{s.nama}</p>
                      <p className="text-xs font-medium text-[#6B7769]">
                        Kelas {s.kelas} · NIS: {s.nis}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-[#9CA3A0] mb-0.5">{s.waliNama}</p>
                        <p className="text-xs font-medium text-[#1C2517]">{s.waliHp}</p>
                      </div>
                      <button
                        onClick={() => openWA(s.waliHp, s.nama, s.kelas)}
                        title="Kirim WA ke wali"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#25D366] hover:bg-[#E7FBF0] transition-colors shrink-0"
                        style={{ border: "1px solid #D1FADF" }}
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : unrecordedGuru.length === 0 ? (
              <div className="text-center py-10 text-[#6B7769] font-medium">
                Semua guru sudah tercatat kehadirannya! 🎉
              </div>
            ) : (
              unrecordedGuru.map(g => (
                <div
                  key={g.id}
                  className="flex justify-between items-center p-3 border border-[#E2E8DE] rounded-xl hover:bg-[#FAFCFA]"
                >
                  <div>
                    <p className="font-bold text-[#1C2517]">{g.nama}</p>
                    <p className="text-xs font-medium text-[#6B7769]">
                      {g.mapel.join(", ") || "Pegawai"}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-md text-xs font-bold uppercase">
                    Alpa
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#FAFCFA] border-t border-[#E2E8DE] flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-6 py-3 font-semibold text-[#6B7769] hover:bg-black/5 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmAlpa}
            disabled={isSending}
            className="px-8 py-3 bg-[#F6B31E] hover:bg-[#E0A31B] text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              <>
                <Send size={18} />
                Rekap & Tutup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
