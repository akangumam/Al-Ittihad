import { useState } from "react";
import { toast } from "sonner";
import { X, Trash2, Edit2, Plus, Calendar, Tag, DollarSign, FileText } from "lucide-react";
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

  // Add manual modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addNama, setAddNama] = useState("");
  const [addNominal, setAddNominal] = useState<number | "">("");
  const [addKategori, setAddKategori] = useState("Penyesuaian Khusus");
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);
  const defaultJT = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;
  const [addJatuhTempo, setAddJatuhTempo] = useState(defaultJT);
  const [addKeterangan, setAddKeterangan] = useState("");

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
      toast.success("Rincian tagihan berhasil diperbarui");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = addNama.trim();
    const cleanNominal = Number(addNominal);

    if (!cleanNama) {
      toast.error("Nama tagihan wajib diisi");
      return;
    }
    if (!cleanNominal || cleanNominal <= 0) {
      toast.error("Nominal tagihan harus lebih dari Rp 0");
      return;
    }
    if (!addJatuhTempo) {
      toast.error("Tanggal jatuh tempo wajib ditentukan");
      return;
    }

    addTagihanSiswaManual(
      siswa.nis,
      cleanNama,
      cleanNominal,
      addJatuhTempo,
      addKategori || "Penyesuaian Khusus"
    );

    toast.success(`Tagihan "${cleanNama}" berhasil ditambahkan`);
    setShowAddModal(false);
    setAddNama("");
    setAddNominal("");
    setAddKeterangan("");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[640px] bg-white z-50 flex flex-col shadow-2xl transition-transform"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8DE] shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#1C2517] leading-tight">
              Profil Tagihan Siswa
            </h3>
            <p className="text-xs text-[#6B7769] mt-0.5">Penyesuaian tagihan individu & diskon</p>
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
            <div className="flex-1 bg-white border border-[#E2E8DE] rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-[#9CA3A0] mb-1">Sisa Tunggakan</p>
              <p className="text-sm font-bold text-[#DC2626]">{fmt(Math.max(0, totalTagihan - totalTerbayar))}</p>
            </div>
          </div>
        </div>

        {/* List of Tagihan */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-[#1C2517]">
              Daftar Rincian Tagihan ({sTagihans.length})
            </h4>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EDF7EC] text-[#3E8A2F] hover:bg-[#DCFCE7] transition-colors"
            >
              <Plus size={14} /> Tambah Tagihan Manual
            </button>
          </div>

          {sTagihans.length === 0 ? (
            <div className="text-center py-12 bg-[#FAFBF9] rounded-xl border border-dashed border-[#E2E8DE]">
              <p className="text-sm font-medium text-[#374040]">Belum ada tagihan ditetapkan untuk siswa ini</p>
              <p className="text-xs text-[#9CA3A0] mt-1">Klik "+ Tambah Tagihan Manual" atau tetapkan via tab Penetapan Tagihan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sTagihans.map((t) => (
                <div key={t.id} className="border border-[#E2E8DE] rounded-xl p-4 bg-white relative group transition-all hover:border-[#CBD5E1]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-[#1C2517]">{t.namaTagihan}</p>
                      <p className="text-xs text-[#6B7769] mt-0.5">
                        <span className="font-medium">{t.kategori}</span> · Jatuh Tempo: {t.jatuhTempo}
                      </p>
                    </div>
                    {t.isLunas ? <StatusBadge status="Lunas" /> : <StatusBadge status="Belum Tuntas" />}
                  </div>

                  {editingId === t.id ? (
                    <div className="mt-3 pt-3 border-t border-[#E2E8DE] space-y-3 bg-[#FAFBF9] p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#6B7769] w-24">Nominal (Rp)</label>
                        <input
                          type="number"
                          value={editNominal}
                          onChange={(e) => setEditNominal(Number(e.target.value))}
                          className="flex-1 border border-[#E2E8DE] rounded-md px-3 py-1.5 text-sm outline-none bg-white focus:border-[#3E8A2F]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#6B7769] w-24">Catatan/Alasan</label>
                        <input
                          type="text"
                          value={editKeterangan}
                          onChange={(e) => setEditKeterangan(e.target.value)}
                          placeholder="Cth: Diskon Khusus Yatim / Keringanan"
                          className="flex-1 border border-[#E2E8DE] rounded-md px-3 py-1.5 text-sm outline-none bg-white focus:border-[#3E8A2F]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-semibold text-[#6B7769] hover:bg-[#F3F4F6] rounded-md">
                          Batal
                        </button>
                        <button onClick={saveEdit} className="px-4 py-1.5 text-xs font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] rounded-md">
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[#E2E8DE] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1C2517]">{fmt(t.nominal)}</span>
                          {t.terbayar > 0 && (
                            <span className="text-xs text-[#3E8A2F] font-medium">
                              (Terbayar {fmt(t.terbayar)})
                            </span>
                          )}
                        </div>
                        {t.keterangan && (
                          <p className="text-[11px] text-[#92400E] mt-0.5 italic">
                            Catatan: {t.keterangan}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

      {/* Modern Modal: Tambah Tagihan Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8DE]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDF7EC] flex items-center justify-center text-[#3E8A2F]">
                  <Plus size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1C2517]">Tambah Tagihan Manual</h4>
                  <p className="text-xs text-[#6B7769]">Untuk {siswa.nama} ({siswa.nis})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#6B7769]"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1C2517] block mb-1">
                  Nama Tagihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Denda Keterlambatan Buku, Iuran Ekstra"
                  value={addNama}
                  onChange={(e) => setAddNama(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8DE] rounded-lg text-sm outline-none focus:border-[#3E8A2F] bg-[#FAFBF9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1C2517] block mb-1">
                    Nominal (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="50000"
                    value={addNominal}
                    onChange={(e) => setAddNominal(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-[#E2E8DE] rounded-lg text-sm outline-none focus:border-[#3E8A2F] bg-[#FAFBF9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1C2517] block mb-1">
                    Kategori Tagihan
                  </label>
                  <select
                    value={addKategori}
                    onChange={(e) => setAddKategori(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8DE] rounded-lg text-sm outline-none focus:border-[#3E8A2F] bg-[#FAFBF9]"
                  >
                    <option value="Penyesuaian Khusus">Penyesuaian Khusus</option>
                    <option value="Administrasi PPDB">Administrasi PPDB</option>
                    <option value="Daftar Ulang">Daftar Ulang</option>
                    <option value="Administrasi Kelas 9">Administrasi Kelas 9</option>
                    <option value="Iuran Lainnya">Iuran Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1C2517] block mb-1">
                  Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={addJatuhTempo}
                  onChange={(e) => setAddJatuhTempo(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8DE] rounded-lg text-sm outline-none focus:border-[#3E8A2F] bg-[#FAFBF9]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1C2517] block mb-1">
                  Catatan / Keterangan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Opsional (misal: Sesuai disposisi Kepala Madrasah)"
                  value={addKeterangan}
                  onChange={(e) => setAddKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8DE] rounded-lg text-sm outline-none focus:border-[#3E8A2F] bg-[#FAFBF9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8DE]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#374040] rounded-lg hover:bg-[#F3F4F6] border border-[#E2E8DE]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] rounded-lg transition-colors"
                >
                  Tambah Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete tagihan */}
      {pendingDeleteId && (() => {
        const t = sTagihans.find((t) => t.id === pendingDeleteId);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
              <p className="text-xs text-[#6B7769]">
                Tagihan ini belum memiliki riwayat pembayaran dan dapat dihapus secara permanen.
              </p>
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
