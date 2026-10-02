import { useState } from "react";
import { toast } from "sonner";
import { X, Search, Trash2, Edit2, Check, AlertTriangle, Plus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import type { SiswaRow } from "@/data/siswa";
import type { TagihanSiswa } from "@/data/pembayaran";

export function ProfilTagihanSheet({
  siswa,
  onClose,
}: {
  siswa: SiswaRow;
  onClose: () => void;
}) {
  const { tagihanList, deleteTagihanSiswa, updateTagihanSiswa, addTagihanSiswaManual } = useAppContext();
  const sTagihans = tagihanList.filter((t) => t.nis === siswa.nis);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNominal, setEditNominal] = useState(0);
  const [editKeterangan, setEditKeterangan] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalTagihan = sTagihans.reduce((sum, t) => sum + t.nominal, 0);
  const totalTerbayar = sTagihans.reduce((sum, t) => sum + t.terbayar, 0);

  const startEdit = (t: TagihanSiswa) => {
    setEditingId(t.id);
    setEditNominal(t.nominal);
    setEditKeterangan(t.keterangan || "");
  };

  const saveEdit = () => {
    if (editingId) {
      updateTagihanSiswa(editingId, editNominal, editKeterangan);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl transition-transform"
        style={{ width: "640px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8DE] shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#1C2517] leading-tight">
              Profil Tagihan Siswa
            </h3>
            <p className="text-xs text-[#6B7769] mt-0.5">Penyesuaian tagihan individu</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#6B7769] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Siswa Info */}
        <div className="px-5 py-4 border-b border-[#E2E8DE] bg-[#FAFBF9] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-base font-bold shrink-0">
              {siswa.inits}
            </div>
            <div>
              <p className="text-base font-semibold text-[#1C2517]">{siswa.nama}</p>
              <p className="text-sm text-[#6B7769]">NIS: {siswa.nis} · Kelas: {siswa.kelas}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="flex-1 bg-white border border-[#E2E8DE] rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-[#9CA3A0] mb-1">Total Tagihan</p>
              <p className="text-sm font-bold text-[#1C2517]">{fmt(totalTagihan)}</p>
            </div>
            <div className="flex-1 bg-white border border-[#E2E8DE] rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-[#9CA3A0] mb-1">Terbayar</p>
              <p className="text-sm font-bold text-[#3E8A2F]">{fmt(totalTerbayar)}</p>
            </div>
          </div>
        </div>

        {/* List of Tagihan */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-[#1C2517]">Daftar Tagihan</h4>
            <button className="flex items-center gap-1 text-xs font-medium text-[#3E8A2F] hover:underline" onClick={() => {
              const res = prompt("Masukkan nama tagihan baru (contoh: Denda Buku)");
              if (res) {
                const nom = prompt("Masukkan nominal (contoh: 50000)");
                if (nom && !isNaN(Number(nom))) {
                  addTagihanSiswaManual(siswa.nis, res, Number(nom), "2026-12-31");
                }
              }
            }}>
              <Plus size={14} /> Tambah Manual
            </button>
          </div>

          {sTagihans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#6B7769]">Belum ada tagihan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sTagihans.map((t) => (
                <div key={t.id} className="border border-[#E2E8DE] rounded-xl p-4 bg-white relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-[#1C2517]">{t.namaTagihan}</p>
                      <p className="text-xs text-[#6B7769]">{t.kategori} · Jatuh Tempo: {t.jatuhTempo}</p>
                    </div>
                    {t.isLunas ? <StatusBadge status="Lunas" /> : <StatusBadge status="Belum Tuntas" />}
                  </div>

                  {editingId === t.id ? (
                    <div className="mt-3 pt-3 border-t border-[#E2E8DE] space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-[#6B7769] w-20">Nominal</label>
                        <input
                          type="number"
                          value={editNominal}
                          onChange={(e) => setEditNominal(Number(e.target.value))}
                          className="flex-1 border border-[#E2E8DE] rounded-md px-2 py-1 text-sm outline-none focus:border-[#3E8A2F]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-[#6B7769] w-20">Keterangan</label>
                        <input
                          type="text"
                          value={editKeterangan}
                          onChange={(e) => setEditKeterangan(e.target.value)}
                          placeholder="Cth: Diskon Kepsek"
                          className="flex-1 border border-[#E2E8DE] rounded-md px-2 py-1 text-sm outline-none focus:border-[#3E8A2F]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={cancelEdit} className="px-3 py-1 text-xs font-medium text-[#6B7769] hover:bg-[#F3F4F6] rounded-md">Batal</button>
                        <button onClick={saveEdit} className="px-3 py-1 text-xs font-medium text-white bg-[#3E8A2F] hover:bg-[#2E6B22] rounded-md">Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[#E2E8DE] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[#1C2517]">{fmt(t.nominal)}</p>
                        {t.keterangan && <p className="text-[11px] text-[#92400E] mt-0.5 italic">Catatan: {t.keterangan}</p>}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(t)}
                          className="w-7 h-7 rounded bg-[#F3F4F6] flex items-center justify-center text-[#6B7769] hover:text-[#1C2517]"
                          title="Edit Nominal / Diskon"
                        >
                          <Edit2 size={13} />
                        </button>
                        {t.terbayar === 0 && (
                          <button
                            onClick={() => setPendingDeleteId(t.id)}
                            className="w-7 h-7 rounded bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] hover:bg-[#FCA5A5]"
                            title="Hapus Tagihan"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete tagihan */}
      {pendingDeleteId && (() => {
        const t = sTagihans.find(t => t.id === pendingDeleteId);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-[#DC2626]" />
                </div>
                <div>
                  <p className="font-bold text-[#1C2517] text-sm">Hapus Tagihan?</p>
                  <p className="text-xs text-[#6B7769] mt-0.5">{t?.namaTagihan}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="px-4 py-2 text-sm font-semibold text-[#374040] rounded-lg hover:bg-[#F5F9F4] transition-colors"
                  style={{ border: "1px solid #E2E8DE" }}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    deleteTagihanSiswa(pendingDeleteId);
                    toast.success("Tagihan berhasil dihapus");
                    setPendingDeleteId(null);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
