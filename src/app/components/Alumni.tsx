import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, MessageCircle, X, Plus
} from "lucide-react";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { AlumniRow } from "@/data/alumni";
import { useAppContext } from "@/context/AppContext";

function Checkbox({
  checked, indeterminate = false, onChange,
}: {
  checked: boolean; indeterminate?: boolean; onChange: () => void;
}) {
  const filled = checked || indeterminate;
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        "w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
        filled ? "bg-[#3E8A2F] border-[#3E8A2F]" : "bg-white border-[#D1D5DB] hover:border-[#3E8A2F]",
      ].join(" ")}
    >
      {indeterminate && !checked
        ? <span className="w-2 h-[1.5px] bg-white rounded-full block" />
        : checked
        ? <svg width="9" height="9" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8L0 4.5L1.4 3.1L3.5 5.2L8.6 0L10 1.4L3.5 8Z" fill="white"/></svg>
        : null}
    </button>
  );
}

function RowMenu({ waNumber, onView }: { waNumber?: string; onView: () => void; }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  return (
    <>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          const rect = e.currentTarget.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const menuHeight = 100; 
          
          setCoords({
            left: rect.right - 144, 
            top: spaceBelow < menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8
          });
          setOpen((o) => !o); 
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors relative"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="fixed z-50 w-36 bg-white rounded-xl py-1"
            style={{ 
              top: coords.top, 
              left: coords.left,
              border: "1px solid #E2E8DE", 
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)" 
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Eye size={13} className="text-[#6B7769]" />
              Lihat Profil
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (waNumber) {
                  const digits = waNumber.replace(/\D/g, "");
                  const formatted = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
                  window.open(`https://wa.me/${formatted}`, '_blank');
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <MessageCircle size={13} className="text-[#6B7769]" />
              Hubungi
            </button>
          </div>
        </>
      )}
    </>
  );
}

function AlumniSheet({ alumni, onClose }: { alumni: AlumniRow; onClose: () => void; }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[500px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
              style={{ background: "#F3F4F6", color: "#374040" }}>
              <img src={alumni.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={alumni.nama} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-[#1C2517]">{alumni.nama}</p>
              <p className="text-xs text-[#6B7769] mt-0.5">Alumni Angkatan {alumni.angkatan}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] hover:text-[#1C2517] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="p-4 rounded-xl mb-4 text-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <p className="text-sm font-medium text-[#1E40AF]">Telah lulus pada Tahun Ajaran {alumni.tahunLulus}</p>
          </div>
          
          <section className="space-y-3">
            <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Informasi Kelulusan</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-[#6B7769] mb-1">Tahun Lulus</p>
                <p className="text-sm font-medium text-[#1C2517]">{alumni.tahunLulus}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7769] mb-1">Angkatan</p>
                <p className="text-sm font-medium text-[#1C2517]">Ke-{alumni.angkatan}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#6B7769] mb-1">Keterangan Lanjutan</p>
              <p className="text-sm font-medium text-[#1C2517]">{alumni.keterangan || "-"}</p>
            </div>
          </section>

          <div className="h-px bg-[#E2E8DE]" />

          <section className="space-y-3">
            <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Data Akademik Masa Lalu</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-[#6B7769] mb-1">NIS</p>
                <p className="text-sm font-medium text-[#1C2517]">{alumni.nis}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7769] mb-1">NISN</p>
                <p className="text-sm font-medium text-[#1C2517]">{alumni.nisn}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7769] mb-1">Jenis Kelamin</p>
                <p className="text-sm font-medium text-[#1C2517]">{alumni.jk === "L" ? "Laki-laki" : "Perempuan"}</p>
              </div>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors" style={{ border: "1px solid #E2E8DE" }}>
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}

function AlumniFormSheet({ onClose, onSave }: { onClose: () => void; onSave: (form: Partial<AlumniRow>) => void; }) {
  const { tahunAjaran } = useAppContext();
  const [form, setForm] = useState({
    nis: "", nisn: "", nama: "", jk: "L" as "L" | "P", tahunLulus: tahunAjaran, angkatan: "", keterangan: "",
    tempatLahir: "", tanggalLahir: "", alamat: "", waliHp: ""
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[500px] z-50 flex flex-col bg-white" style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}>
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div>
            <h3 className="font-bold text-[#1C2517]">Tambah Alumni Manual</h3>
            <p className="text-xs text-[#6B7769] mt-0.5">Masukkan data alumni masa lalu.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] hover:text-[#1C2517] transition-colors"><X size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1">NIS *</label>
              <input type="text" value={form.nis} onChange={e => setForm({...form, nis: e.target.value.replace(/\D/g, "")})} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none bg-white border border-[#E2E8DE] focus:border-[#3E8A2F]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1">Nama Lengkap *</label>
              <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value.replace(/[^a-zA-Z\s.,'-]/g, "")})} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none bg-white border border-[#E2E8DE] focus:border-[#3E8A2F]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7769] mb-1">Tahun Lulus *</label>
                <input type="text" value={form.tahunLulus} onChange={e => setForm({...form, tahunLulus: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none bg-white border border-[#E2E8DE] focus:border-[#3E8A2F]" placeholder="Contoh: 2018/2019" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7769] mb-1">Angkatan Ke-</label>
                <input type="text" value={form.angkatan} onChange={e => setForm({...form, angkatan: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none bg-white border border-[#E2E8DE] focus:border-[#3E8A2F]" placeholder="Contoh: 15" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1">Jenis Kelamin</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.jk === "L"} onChange={() => setForm({...form, jk: "L"})} className="accent-[#3E8A2F]" />
                  <span className="text-sm text-[#1C2517]">Laki-laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.jk === "P"} onChange={() => setForm({...form, jk: "P"})} className="accent-[#3E8A2F]" />
                  <span className="text-sm text-[#1C2517]">Perempuan</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1">Keterangan / Lanjut Studi</label>
              <input type="text" value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none bg-white border border-[#E2E8DE] focus:border-[#3E8A2F]" placeholder="Contoh: Lanjut ke SMA Negeri 1" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors">Batal</button>
          <button onClick={() => { if(form.nama && form.nis && form.tahunLulus) onSave({...form, angkatan: Number(form.angkatan) || 0}); }} disabled={!form.nama || !form.nis || !form.tahunLulus} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            Simpan Alumni
          </button>
        </div>
      </div>
    </>
  );
}

export function Alumni() {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("Semua Tahun");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { alumniList, addAlumni } = useAppContext();

  const tahunOptions = useMemo(() => {
    const years = Array.from(new Set(alumniList.map(a => a.tahunLulus))).sort().reverse();
    return ["Semua Tahun", ...years];
  }, [alumniList]);

  const kpiData = useMemo(() => {
    return [
      { label: "Total Lulusan", value: alumniList.length },
      { label: "Laki-laki", value: alumniList.filter(a => a.jk === "L").length },
      { label: "Perempuan", value: alumniList.filter(a => a.jk === "P").length },
    ];
  }, [alumniList]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return alumniList.filter((r) => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.nis.includes(q) || r.nisn.includes(q);
      const matchTahun = tahunFilter === "Semua Tahun" || r.tahunLulus === tahunFilter;
      return matchSearch && matchTahun;
    });
  }, [search, tahunFilter, alumniList]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const rows = filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startIndex = filteredRows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length);

  const allChecked  = rows.length > 0 && checked.size === rows.length;
  const someChecked = checked.size > 0 && !allChecked;

  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleRow = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-[#1C2517]">Data Alumni</h2>
          <p className="text-sm text-[#6B7769]">Buku induk rekam jejak lulusan madrasah</p>
        </div>
        <div className="hidden md:flex items-center gap-2 mt-1 shrink-0">
          {kpiData.map((kpi, i) => (
            <div key={kpi.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#D1D5DB]">·</span>}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white" style={{ border: "1px solid #E2E8DE" }}>
                <span className="font-bold tabular-nums text-[#1C2517]">{kpi.value}</span>
                <span className="text-[#6B7769]">{kpi.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
            <Search size={13} className="text-[#9CA3A0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama/NIS/NISN..."
              className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
            />
          </div>

          <div className="relative">
            <select
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none h-full"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {tahunOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>
        </div>

        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shadow-sm">
          <Plus size={16} /> Tambah Alumni
        </button>
      </div>

      <div className="md:hidden flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9", padding: "0 12px", minHeight: 44 }}>
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama..." className="flex-1 bg-transparent outline-none text-[13px] text-[#1C2517]" />
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-2.5">
        {rows.length === 0 ? (
          <p className="text-sm text-[#9CA3A0] text-center py-8">Belum ada data alumni</p>
        ) : rows.map((row) => (
          <button key={row.id} onClick={() => setSelectedAlumni(row)} className="w-full text-left bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden" style={{ background: "#F3F4F6", color: "#374040" }}>
                <img src={row.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={row.nama} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1C2517] leading-tight truncate">{row.nama}</p>
                <p className="text-[11px] text-[#6B7769]" style={{ marginTop: 2 }}>{row.nis}</p>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534]">Angkatan {row.angkatan}</span>
                  <span className="text-[11px] text-[#6B7769]">Lulus: {row.tahunLulus}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <th className="w-10 pl-6 pr-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                </th>
                <Th className="pr-4">Nama Alumni</Th>
                <Th className="pr-4">Tahun Lulus</Th>
                <Th className="pr-4">Angkatan</Th>
                <Th className="pr-4">L/P</Th>
                <Th className="pr-4">Keterangan Lanjutan</Th>
                <th className="py-3 pr-6 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isChecked = checked.has(row.id);
                return (
                  <tr key={row.id} className="hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none", background: isChecked ? "#F5FBF4" : undefined }}
                    onClick={() => setSelectedAlumni(row)}
                  >
                    <td className="pl-6 pr-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isChecked} onChange={() => toggleRow(row.id)} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden" style={{ background: "#F3F4F6", color: "#374040" }}>
                          <img src={row.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={row.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                          <p className="text-[11px] text-[#9CA3A0] mt-0.5">{row.nis} · {row.nisn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-sm font-medium text-[#1C2517]">{row.tahunLulus}</td>
                    <td className="py-3.5 pr-4"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534]">Ke-{row.angkatan}</span></td>
                    <td className="py-3.5 pr-4 text-sm text-[#374040]">{row.jk === "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="py-3.5 pr-4 text-sm text-[#6B7769]">{row.keterangan || "-"}</td>
                    <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                      <RowMenu waNumber={row.wa} onView={() => setSelectedAlumni(row)} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-[#9CA3A0]">Tidak ada data alumni ditemukan</td>
                </tr>
              )}
            </tbody>
          </DataTable>
        </div>
        
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-3.5" style={{ borderTop: "1px solid #E2E8DE" }}>
            <span className="text-xs text-[#6B7769]">
              {startIndex}–{endIndex} dari <span className="font-semibold text-[#1C2517]">{filteredRows.length}</span> alumni
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === 1 ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
                style={{ border: "1px solid #E2E8DE" }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === p ? "bg-[#3E8A2F] text-white" : "text-[#374040] hover:bg-[#EDF7EC]"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === totalPages ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
                style={{ border: "1px solid #E2E8DE" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedAlumni && (
        <AlumniSheet alumni={selectedAlumni} onClose={() => setSelectedAlumni(null)} />
      )}

      {isAdding && (
        <AlumniFormSheet 
          onClose={() => setIsAdding(false)} 
          onSave={(form) => {
            addAlumni({
              id: Date.now(),
              nama: form.nama!,
              nis: form.nis!,
              nisn: form.nisn || "",
              jk: form.jk as "L" | "P",
              tahunLulus: form.tahunLulus!,
              angkatan: form.angkatan!,
              keterangan: form.keterangan || "",
              inits: form.nama!.substring(0,2).toUpperCase()
            } as AlumniRow);
            setIsAdding(false);
          }} 
        />
      )}
    </div>
  );
}
