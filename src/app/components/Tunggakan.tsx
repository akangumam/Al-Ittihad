import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MessageCircle, Search, ChevronDown, ChevronLeft,
  ChevronRight, Download, Check, AlertTriangle, Users, TrendingDown,
  SlidersHorizontal, X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { fmt, fmtJt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

import { useAppContext } from "@/context/AppContext";
import { kelasOptions } from "@/data/constants";
import type { TransaksiPembayaran } from "@/data/pembayaran";

const AVATAR_STYLE: Record<string, { avatar: string; avatarText: string }> = {
  Kritis:    { avatar: "#FEE2E2", avatarText: "#991B1B" },
  Waspada:   { avatar: "#FEF3C7", avatarText: "#92400E" },
  Perhatian: { avatar: "#EDF7EC", avatarText: "#3E8A2F" },
  Pending:   { avatar: "#F3F4F6", avatarText: "#374040" },
};

// ─── shared sub-components ────────────────────────────────────────────────────

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
        filled
          ? "bg-[#3E8A2F] border-[#3E8A2F]"
          : "bg-white border-[#D1D5DB] hover:border-[#3E8A2F]",
      ].join(" ")}
    >
      {indeterminate && !checked ? (
        <span className="w-2 h-[1.5px] bg-white rounded-full block" />
      ) : checked ? (
        <Check size={9} className="text-white shrink-0" />
      ) : null}
    </button>
  );
}

// ─── MOBILE sub-components ────────────────────────────────────────────────────

function StudentCard({ row, onCatatBayar, onKirimWA }: { row: any, onCatatBayar: (id: number) => void, onKirimWA: (id: number) => void }) {
  const avatarStyle = AVATAR_STYLE[row.badge] ?? { avatar: "#EDF7EC", avatarText: "#3E8A2F" };
  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
          style={{ background: avatarStyle.avatar, color: avatarStyle.avatarText }}>
          {row.inits}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1C2517] leading-tight truncate">{row.nama}</p>
          <p className="text-[11px] text-[#6B7769]" style={{ marginTop: 2 }}>{row.nis} · Kelas {row.kelas}</p>
          <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
            <StatusBadge status={row.badge as any} />
            <span className="text-[10px] text-[#9CA3A0]">Jatuh tempo {row.jatuhTempo}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 gap-2">
          <span className="text-[14px] font-bold tabular-nums text-[#DC2626]">{fmtJt(row.jumlah)}</span>
          <span className="text-[10px] text-[#9CA3A0]">Bayar {row.terakhirBayar}</span>
        </div>
      </div>
      <div className="flex gap-2" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0F7EE" }}>
        <button onClick={() => onKirimWA(row.id)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ background: "#3E8A2F", padding: "10px 0", minHeight: 44 }}>
          <MessageCircle size={14} /> Kirim WA
        </button>
        <button onClick={() => onCatatBayar(row.id)} className="flex-1 flex items-center justify-center rounded-lg text-[13px] font-semibold text-[#374040]"
          style={{ border: "1px solid #E2E8DE", padding: "10px 0", minHeight: 44 }}>
          Catat Bayar
        </button>
      </div>
    </div>
  );
}

function ClassFilterSheet({
  open, onClose,
  selected, onSelect,
}: {
  open: boolean; onClose: () => void;
  selected: string; onSelect: (v: string) => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <p className="text-[15px] font-semibold text-[#1C2517]">Filter Kelas</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "#F3F4F6" }}>
            <X size={14} color="#374040" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {kelasOptions.map((opt) => (
            <button key={opt} onClick={() => { onSelect(opt); onClose(); }}
              className="w-full flex items-center justify-between px-4 text-left"
              style={{ minHeight: 48, borderBottom: "1px solid #F0F7EE" }}>
              <span className="text-[14px]" style={{ color: selected === opt ? "#3E8A2F" : "#1C2517", fontWeight: selected === opt ? 600 : 400 }}>{opt}</span>
              {selected === opt && <Check size={16} color="#3E8A2F" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Tunggakan() {
  const { siswaList, tagihanList, transaksiList } = useAppContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab]       = useState(0);
  const [searchQuery, setSearchQuery]   = useState("");
  const [kelasFilter, setKelasFilter]   = useState("Semua Kelas");
  const [checked, setChecked]           = useState<Set<number>>(new Set());
  const [filterOpen, setFilterOpen]     = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const pageSize = 8; // Menyesuaikan dengan UI sebelumnya

  // Derive all rows with debt dynamically
  const { allRows, tabs } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group transactions by student
    const txBySiswa = new Map<string, TransaksiPembayaran[]>();
    transaksiList.forEach(tx => {
      const arr = txBySiswa.get(tx.nis) || [];
      arr.push(tx);
      txBySiswa.set(tx.nis, arr);
    });

    const studentsWithDebt = siswaList.filter(s => s.status === "Aktif").map(s => {
      const sTagihans = tagihanList.filter(t => t.nis === s.nis && t.nominal > t.terbayar);
      if (sTagihans.length === 0) return null;
      
      const jumlah = sTagihans.reduce((sum, t) => sum + (t.nominal - t.terbayar), 0);
      
      // Calculate overdue based on the oldest unpaid bill
      const oldestBill = sTagihans.reduce((oldest, t) => {
         return (new Date(t.jatuhTempo) < new Date(oldest.jatuhTempo)) ? t : oldest;
      });

      const jatuhTempoDate = new Date(oldestBill.jatuhTempo);
      const diffTime = today.getTime() - jatuhTempoDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let badge = "Perhatian";
      let overdueCategory = "Lewat 1-30 hari";
      if (diffDays <= 0) {
         badge = "Pending";
         overdueCategory = "Belum Jatuh Tempo";
      } else if (diffDays <= 30) {
         badge = "Perhatian";
         overdueCategory = "Lewat 1-30 hari";
      } else if (diffDays <= 60) {
         badge = "Waspada";
         overdueCategory = "Lewat 31-60 hari";
      } else {
         badge = "Kritis";
         overdueCategory = "Lewat 60+ hari";
      }
      
      // Get last payment date
      const sTx = txBySiswa.get(s.nis) || [];
      let terakhirBayar = "-";
      if (sTx.length > 0) {
         sTx.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
         const lastDate = new Date(sTx[0].tanggal);
         terakhirBayar = lastDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
      }

      return {
        id: s.id,
        nama: s.nama,
        nis: s.nis,
        kelas: s.kelas,
        inits: s.inits,
        jumlah,
        badge,
        overdueCategory,
        jatuhTempo: jatuhTempoDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
        terakhirBayar,
      };
    }).filter(Boolean) as any[];

    // Calculate dynamic counts for aging tabs
    const tabCounts: Record<string, number> = {
      "Semua": studentsWithDebt.length,
      "Belum Jatuh Tempo": 0,
      "Lewat 1-30 hari": 0,
      "Lewat 31-60 hari": 0,
      "Lewat 60+ hari": 0,
    };
    
    studentsWithDebt.forEach(r => {
      if (tabCounts[r.overdueCategory] !== undefined) {
        tabCounts[r.overdueCategory]++;
      }
    });

    const activeTabs = [
      { label: "Semua", count: tabCounts["Semua"] },
      { label: "Belum Jatuh Tempo", count: tabCounts["Belum Jatuh Tempo"] },
      { label: "Lewat 1-30 hari", count: tabCounts["Lewat 1-30 hari"] },
      { label: "Lewat 31-60 hari", count: tabCounts["Lewat 31-60 hari"] },
      { label: "Lewat 60+ hari", count: tabCounts["Lewat 60+ hari"] },
    ].filter(t => t.label === "Semua" || t.count > 0);

    return { allRows: studentsWithDebt, tabs: activeTabs };
  }, [siswaList, tagihanList, transaksiList]);

  // Apply filters to all rows
  const filteredRows = React.useMemo(() => {
    let filtered = allRows;
    if (kelasFilter !== "Semua Kelas") {
      filtered = filtered.filter((r: any) => r.kelas === kelasFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter((r: any) => 
        r.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.nis.includes(searchQuery)
      );
    }
    const activeTabLabel = tabs[activeTab]?.label;
    if (activeTabLabel && activeTabLabel !== "Semua") {
      filtered = filtered.filter((r: any) => r.overdueCategory === activeTabLabel);
    }
    return filtered;
  }, [allRows, kelasFilter, searchQuery, activeTab, tabs]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  
  useEffect(() => {
    setCurrentPage(1);
    setChecked(new Set());
  }, [kelasFilter, searchQuery, activeTab]);

  const pagedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  const allChecked = pagedRows.length > 0 && Array.from(checked).filter(id => pagedRows.some((r: any) => r.id === id)).length === pagedRows.length;
  const someChecked = checked.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      const next = new Set(checked);
      pagedRows.forEach((r: any) => next.delete(r.id));
      setChecked(next);
    } else {
      const next = new Set(checked);
      pagedRows.forEach((r: any) => next.add(r.id));
      setChecked(next);
    }
  };
  
  const toggleRow  = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleCatatBayar = (siswaId: number) => {
    navigate(`/keuangan/pembayaran?siswaId=${siswaId}`);
  };

  const handleKirimWA = (studentId: number) => {
    const student = siswaList.find(s => s.id === studentId);
    const row = allRows.find(r => r.id === studentId);
    if (!student || !student.waliHp || !row) return;
    const nominal = row.jumlah;
    const waNumber = student.waliHp.replace(/\D/g, "").replace(/^0/, "62");
    const text = `Assalamu'alaikum Bapak/Ibu ${student.waliNama},\n\nKami menginformasikan bahwa ananda ${student.nama} memiliki tagihan administrasi madrasah yang belum diselesaikan sebesar ${fmt(nominal)}.\n\nMohon kerjasamanya untuk dapat diselesaikan. Abaikan pesan ini jika sudah melakukan pembayaran.\nTerima kasih.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleBulkWA = () => {
    if (checked.size === 0) return;
    toast.info(`Pengiriman WA ke ${checked.size} orang tua siswa akan dieksekusi via API`);
  };

  return (
    <>
      {/* ═══ MOBILE LAYOUT (md:hidden) ═════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Summary strip */}
        <div className="grid grid-cols-3 divide-x bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE", borderColor: "#E2E8DE" }}>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#DC2626]" style={{ fontSize: 16 }}>
              {fmtJt(filteredRows.reduce((sum: number, r: any) => sum + r.jumlah, 0))}
            </span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Total</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: 16 }}>{filteredRows.length}</span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Siswa</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: 16 }}>
              {fmtJt(filteredRows.length ? filteredRows.reduce((sum: number, r: any) => sum + r.jumlah, 0) / filteredRows.length : 0)}
            </span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Rata-rata</span>
          </div>
        </div>

        {/* Aging tabs (horizontally scrollable) */}
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-2 pb-1" style={{ minWidth: "max-content" }}>
            {tabs.map((tab, i) => {
              const active = activeTab === i;
              return (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="flex items-center gap-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap"
                  style={{
                    padding: "8px 14px", minHeight: 44,
                    background: active ? "#3E8A2F" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "#6B7769",
                    border: `1px solid ${active ? "#3E8A2F" : "#E2E8DE"}`,
                  }}>
                  {tab.label}
                  <span className="rounded-full text-[10px] font-bold tabular-nums px-1.5 py-0.5"
                    style={{ background: active ? "rgba(255,255,255,0.2)" : "#E2E8DE", color: active ? "#FFF" : "#6B7769" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + Filter row */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9", padding: "0 12px", minHeight: 44 }}>
            <Search size={14} color="#9CA3A0" className="shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#1C2517]" />
          </div>
          <button onClick={() => setFilterOpen(true)}
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 44, height: 44, border: "1px solid #E2E8DE", background: "#FFFFFF", position: "relative" }}>
            <SlidersHorizontal size={16} color="#374040" />
            {kelasFilter !== "Semua Kelas" && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#3E8A2F]" />
            )}
          </button>
        </div>

        {/* Active filter chip */}
        {kelasFilter !== "Semua Kelas" && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#EDF7EC", border: "1px solid #D4EDD0" }}>
              <span className="text-[12px] font-medium text-[#3E8A2F]">{kelasFilter}</span>
              <button onClick={() => setKelasFilter("Semua Kelas")} className="w-4 h-4 flex items-center justify-center">
                <X size={11} color="#3E8A2F" />
              </button>
            </div>
          </div>
        )}

        {/* Student cards */}
        <div className="flex flex-col gap-2.5">
          {pagedRows.map((row: any) => <StudentCard key={row.id} row={row} onCatatBayar={handleCatatBayar} onKirimWA={handleKirimWA} />)}
          {pagedRows.length === 0 && (
            <div className="text-center py-8 text-[#9CA3A0] text-sm">Tidak ada tunggakan ditemukan</div>
          )}
        </div>

        {/* Pagination */}
        {filteredRows.length > 0 && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] text-[#6B7769]">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRows.length)} dari <strong className="text-[#1C2517]">{filteredRows.length}</strong> siswa
            </span>
            <div className="flex items-center gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#374040] disabled:text-[#D1D5DB]" style={{ border: "1px solid #E2E8DE" }}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-[13px] ${currentPage === p ? "font-bold text-white bg-[#3E8A2F]" : "text-[#374040]"}`} 
                  style={{ border: currentPage === p ? "none" : "1px solid #E2E8DE" }}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#374040] disabled:text-[#D1D5DB]" style={{ border: "1px solid #E2E8DE" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ DESKTOP LAYOUT (hidden md:block) ══════════════════════════════════ */}
      <div className="hidden md:block w-full max-w-[1600px] mx-auto space-y-5">
        {/* Page title */}
        <div>
          <h2 className="text-[#1C2517]">Tunggakan</h2>
          <p className="text-sm text-[#6B7769]">Pantau dan tindak lanjuti tunggakan siswa</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-[#DC2626]" />
              </div>
              <span className="text-xs font-semibold text-[#6B7769]">Total Tunggakan</span>
            </div>
            <p className="text-xl font-bold tabular-nums tracking-tight text-[#DC2626]">
              {fmt(filteredRows.reduce((sum: number, r: any) => sum + r.jumlah, 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center shrink-0">
                <Users size={15} className="text-[#92400E]" />
              </div>
              <span className="text-xs font-semibold text-[#6B7769]">Siswa Menunggak</span>
            </div>
            <p className="text-xl font-bold tabular-nums tracking-tight text-[#1C2517]">
              {filteredRows.length} <span className="text-sm font-normal text-[#6B7769]">siswa</span>
            </p>
          </div>
          <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDF7EC] flex items-center justify-center shrink-0">
                <TrendingDown size={15} className="text-[#3E8A2F]" />
              </div>
              <span className="text-xs font-semibold text-[#6B7769]">Rata-rata Tunggakan</span>
            </div>
            <p className="text-xl font-bold tabular-nums tracking-tight text-[#1C2517]">
              {fmt(filteredRows.length ? filteredRows.reduce((sum: number, r: any) => sum + r.jumlah, 0) / filteredRows.length : 0)}<span className="text-sm font-normal text-[#6B7769]"> / siswa</span>
            </p>
          </div>
        </div>

        {/* Main table card */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 gap-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
            <div className="flex items-center gap-1">
              {tabs.map((tab, i) => {
                const active = activeTab === i;
                return (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={["flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-[#3E8A2F] text-white" : "text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F]"].join(" ")}>
                    {tab.label}
                    <span className={["px-1.5 py-px rounded-full text-[10px] font-bold tabular-nums", active ? "bg-white/20 text-white" : "bg-[#E2E8DE] text-[#6B7769]"].join(" ")}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
                <Search size={13} className="text-[#9CA3A0] shrink-0" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama/NIS..." className="bg-transparent outline-none text-sm text-[#1C2517] w-36" />
              </div>
              <div className="relative">
                <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
                  style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
                  {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
              </div>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors" style={{ border: "1px solid #E2E8DE" }}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {checked.size > 0 && (
            <div className="flex items-center gap-3 px-6 py-3" style={{ background: "#EDF7EC", borderBottom: "1px solid #D4EDD0" }}>
              <span className="text-sm font-semibold text-[#3E8A2F]">{checked.size} siswa dipilih</span>
              <span className="text-[#9CA3A0]">—</span>
              <button onClick={handleBulkWA} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors">
                <MessageCircle size={13} /> Kirim Pengingat WA
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#3E8A2F] hover:bg-[#DCFCE7] transition-colors" style={{ border: "1px solid #3E8A2F" }}>
                <Download size={13} /> Export Terpilih
              </button>
              <button onClick={() => setChecked(new Set())} className="ml-auto text-xs text-[#6B7769] hover:text-[#374040]">Batalkan pilihan</button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <DataTable>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                  <th className="w-10 pl-6 pr-3 py-3">
                    <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                  </th>
                  <Th className="pr-4">Siswa</Th>
                  <Th align="right" className="pr-4">Tunggakan</Th>
                  <Th className="pr-4">Keterlambatan</Th>
                  <Th className="pr-4">Terakhir Bayar</Th>
                  <Th className="pr-6">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row: any, i) => {
                  const isChecked = checked.has(row.id);
                  const avatarStyle = AVATAR_STYLE[row.badge] ?? { avatar: "#EDF7EC", avatarText: "#3E8A2F" };
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-[#FAFBF9]"
                      style={{ borderBottom: i < pagedRows.length - 1 ? "1px solid #F0F7EE" : "none", background: isChecked ? "#F5FBF4" : undefined }}>
                      <td className="pl-6 pr-3 py-3.5">
                        <Checkbox checked={isChecked} onChange={() => toggleRow(row.id)} />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ background: avatarStyle.avatar, color: avatarStyle.avatarText }}>
                            {row.inits}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                            <p className="text-[11px] text-[#6B7769] mt-0.5">{row.nis} · Kelas {row.kelas}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="text-sm font-bold tabular-nums text-[#DC2626]">{fmt(row.jumlah)}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={row.badge as any} />
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 pl-0.5">Jatuh tempo {row.jatuhTempo}</p>
                      </td>
                      <td className="py-3.5 pr-4"><span className="text-sm text-[#6B7769]">{row.terakhirBayar}</span></td>
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleKirimWA(row.id)} title="Kirim pengingat WhatsApp"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EDF7EC] hover:bg-[#DCFCE7] transition-colors">
                            <MessageCircle size={13} className="text-[#3E8A2F]" />
                          </button>
                          <button onClick={() => handleCatatBayar(row.id)} className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors whitespace-nowrap"
                            style={{ border: "1px solid #E2E8DE" }}>
                            Catat Bayar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#9CA3A0] text-sm">Tidak ada tunggakan ditemukan</td>
                  </tr>
                )}
              </tbody>
            </DataTable>
          </div>

          {/* Pagination footer */}
          {filteredRows.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3.5" style={{ borderTop: "1px solid #E2E8DE" }}>
              <span className="text-xs text-[#6B7769]">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRows.length)} dari <span className="font-semibold text-[#1C2517]">{filteredRows.length}</span> siswa
              </span>
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] disabled:text-[#D1D5DB] cursor-pointer disabled:cursor-not-allowed" style={{ border: "1px solid #E2E8DE" }}>
                  <ChevronLeft size={14} />
                </button>
                
                {getPageNumbers().map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${currentPage === p ? "bg-[#3E8A2F] text-white font-bold" : "text-[#374040] hover:bg-[#EDF7EC] transition-colors"}`}>
                    {p}
                  </button>
                ))}
                
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] disabled:text-[#D1D5DB] cursor-pointer disabled:cursor-not-allowed" style={{ border: "1px solid #E2E8DE" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <ClassFilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        selected={kelasFilter} onSelect={setKelasFilter} />
    </>
  );
}

