import { useState, useMemo } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { GuruRow } from "@/data/guru";

interface Props {
  open: boolean;
  onClose: () => void;
  activeGuru: GuruRow[];
  absensiGuruHariIni: Record<number, { status: string; jam: string }>;
  onConfirm: () => Promise<void>;
}

export function KonfirmasiAbsensiGuruModal({
  open,
  onClose,
  activeGuru,
  absensiGuruHariIni,
  onConfirm,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return { hadir, terlambat, izin, sakit, alpa, belum };
  }, [activeGuru, absensiGuruHariIni]);

  if (!open) return null;

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const chipDefs = [
    { label: "Hadir",       value: chips.hadir,     color: "#DCFCE7", text: "#166534" },
    { label: "Terlambat",   value: chips.terlambat, color: "#FEF3C7", text: "#92400E" },
    { label: "Izin",        value: chips.izin,      color: "#FEF9C3", text: "#854D0E" },
    { label: "Sakit",       value: chips.sakit,     color: "#DBEAFE", text: "#1E40AF" },
    { label: "Alpa",        value: chips.alpa,      color: "#FEE2E2", text: "#991B1B" },
    { label: "Belum Absen", value: chips.belum,     color: "#F3F4F6", text: "#374151" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2517]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-[#E2E8DE]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8DE] bg-[#FAFCFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C2517]">Konfirmasi Simpan Absensi Guru</h2>
              <p className="text-xs text-[#6B7769]">{todayStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-[#9CA3A0] hover:text-[#1C2517] transition-colors rounded-lg hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] leading-relaxed">
            Terdapat <strong className="font-bold tabular-nums text-[#78350F]">{chips.belum} guru</strong> yang belum memiliki catatan absensi hari ini. Catatan mereka akan tetap disimpan sebagai <strong>Belum Absen</strong> tanpa mengubah data secara otomatis.
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B7769] uppercase tracking-wider block mb-2">
              Status Presensi Saat Ini
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {chipDefs.map(c => (
                <div key={c.label} className="flex flex-col items-center justify-center rounded-xl py-2 px-1" style={{ background: c.color }}>
                  <span className="tabular-nums font-bold text-base" style={{ color: c.text }}>{c.value}</span>
                  <span className="text-[10px] font-medium mt-0.5 text-center leading-tight" style={{ color: c.text }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#6B7769] bg-[#FAFBF9] p-3 rounded-lg border border-[#E2E8DE]">
            💡 <em>Jika Anda ingin menandai semua guru yang belum hadir, tutup dialog ini dan gunakan tombol <strong>"Semua Hadir"</strong> di atas tabel.</em>
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFBF9] border-t border-[#E2E8DE] flex items-center justify-between">
          <span className="text-xs text-[#6B7769]">
            Tercatat: <strong className="text-[#1C2517] tabular-nums">{activeGuru.length - chips.belum}</strong> dari {activeGuru.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#6B7769] hover:text-[#1C2517] hover:bg-black/5 rounded-lg transition-colors"
            >
              Batal & Periksa
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-xs font-semibold hover:bg-[#2E6B22] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Tetap Simpan</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
