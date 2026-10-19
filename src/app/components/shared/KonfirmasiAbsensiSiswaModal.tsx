import { useState, useMemo } from "react";
import { X, AlertTriangle, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { SiswaRow } from "@/data/siswa";

interface Props {
  open: boolean;
  onClose: () => void;
  kelasFilter: string;
  targetSiswa: SiswaRow[];
  absensiSiswaHariIni: Record<string, { status: string; jam: string }>;
  onConfirm: (sendWA: boolean) => Promise<void>;
}

export function KonfirmasiAbsensiSiswaModal({
  open,
  onClose,
  kelasFilter,
  targetSiswa,
  absensiSiswaHariIni,
  onConfirm,
}: Props) {
  const [sendWA, setSendWA] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return { hadir, terlambat, izin, sakit, alpa, belum };
  }, [targetSiswa, absensiSiswaHariIni]);

  // Siswa yang secara eksplisit sudah ditandai Alpa di tabel
  const alpaStudents = useMemo(() => {
    return targetSiswa.filter(s => absensiSiswaHariIni[s.nis]?.status === "Alpa");
  }, [targetSiswa, absensiSiswaHariIni]);

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
      await onConfirm(sendWA);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDirectWALink = (hp: string, nama: string, kelas: string) => {
    const digits = (hp || "").replace(/\D/g, "");
    const no = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    const pesan = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *${nama}* (${kelas})\n\nKami informasikan bahwa putra/putri Bapak/Ibu *tidak hadir (Alpa)* pada:\n📅 ${todayStr}\n\nMohon konfirmasi ketidakhadiran kepada wali kelas atau hubungi madrasah.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`
    );
    return `https://wa.me/${no}?text=${pesan}`;
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-[#E2E8DE]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8DE] bg-[#FAFCFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C2517]">Konfirmasi Simpan Absensi Siswa</h2>
              <p className="text-xs text-[#6B7769]">
                {todayStr} • {kelasFilter === "Semua Kelas" ? "Seluruh Kelas" : kelasFilter} ({targetSiswa.length} Siswa)
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Peringatan fakta siswa belum absen */}
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] leading-relaxed">
            Terdapat <strong className="font-bold tabular-nums text-[#78350F]">{chips.belum} siswa</strong> yang belum memiliki catatan absensi hari ini. Catatan mereka akan tetap disimpan sebagai <strong>Belum Absen</strong> tanpa mengubah data otomatis.
          </div>

          {/* Status Breakdown Jujur */}
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

          {/* Opsi WA hanya bila ADA siswa yang berstatus Alpa */}
          {alpaStudents.length > 0 && (
            <div className="rounded-xl border border-[#D1FADF] bg-[#F5FBF7] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#166534]">
                      Notifikasi WhatsApp ke Wali Siswa Alpa
                    </span>
                    <p className="text-[11px] text-[#227244]">
                      {alpaStudents.length} siswa ditandai Alpa di tabel
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendWA}
                    onChange={(e) => setSendWA(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#3E8A2F] accent-[#3E8A2F] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#166534]">Kirim Antrean WA</span>
                </label>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {alpaStudents.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#E2E8DE] text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-[#1C2517]">{s.nama}</span>
                      <span className="text-[#6B7769] ml-1">Kelas {s.kelas}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7769] tabular-nums">{s.waliHp || "No HP Kosong"}</span>
                      {s.waliHp && (
                        <a
                          href={getDirectWALink(s.waliHp, s.nama, s.kelas)}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka WhatsApp langsung"
                          className="p-1 rounded text-[#25D366] hover:bg-[#E7FBF0] transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[#6B7769] bg-[#FAFBF9] p-3 rounded-lg border border-[#E2E8DE]">
            💡 <em>Jika Anda ingin menandai seluruh siswa kelas ini sebagai Hadir, tutup dialog ini dan klik tombol <strong>"Semua Hadir"</strong> di atas tabel.</em>
          </p>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFBF9] border-t border-[#E2E8DE] flex items-center justify-between">
          <span className="text-xs text-[#6B7769]">
            Tercatat: <strong className="text-[#1C2517] tabular-nums">{targetSiswa.length - chips.belum}</strong> dari {targetSiswa.length}
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
