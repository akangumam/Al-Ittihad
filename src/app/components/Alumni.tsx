import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, MessageCircle, X
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
                  const formatted = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber;
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

export function Alumni() {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("Semua Tahun");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { alumniList } = useAppContext();

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

      <div className="hidden md:flex items-center gap-2">
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
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {tahunOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>
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
    </div>
  );
}
