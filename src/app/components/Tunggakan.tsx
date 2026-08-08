import React, { useState } from "react";
import {
  MessageCircle, Search, ChevronDown, ChevronLeft,
  ChevronRight, Download, Check, AlertTriangle, Users, TrendingDown,
  SlidersHorizontal, X,
} from "lucide-react";
import { fmt, fmtJt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

import { agingTabs } from "@/data/pembayaran";
import { useAppContext } from "@/context/AppContext";
import { kelasOptions } from "@/data/constants";

const AVATAR_STYLE: Record<string, { avatar: string; avatarText: string }> = {
  Kritis:    { avatar: "#FEE2E2", avatarText: "#991B1B" },
  Waspada:   { avatar: "#FEF3C7", avatarText: "#92400E" },
  Perhatian: { avatar: "#EDF7EC", avatarText: "#3E8A2F" },
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

function StudentCard({ row }: { row: any }) {
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
            <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} />
            <span className="text-[10px] text-[#9CA3A0]">Jatuh tempo {row.jatuhTempo}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 gap-2">
          <span className="text-[14px] font-bold tabular-nums text-[#DC2626]">{fmtJt(row.jumlah)}</span>
          <span className="text-[10px] text-[#9CA3A0]">Bayar {row.terakhirBayar}</span>
        </div>
      </div>
      <div className="flex gap-2" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0F7EE" }}>
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ background: "#3E8A2F", padding: "10px 0", minHeight: 44 }}>
          <MessageCircle size={14} /> Kirim WA
        </button>
        <button className="flex-1 flex items-center justify-center rounded-lg text-[13px] font-semibold text-[#374040]"
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
  const { siswaList, tagihanList } = useAppContext();
  
  const [activeTab, setActiveTab]       = useState(0);
  const [searchQuery, setSearchQuery]   = useState("");
  const [kelasFilter, setKelasFilter]   = useState("Semua Kelas");
  const [checked, setChecked]           = useState<Set<number>>(new Set());
  const [filterOpen, setFilterOpen]     = useState(false);

  // Derive rows from AppContext
  const rows = React.useMemo(() => {
    const studentsWithDebt = siswaList.filter(s => s.status === "Aktif").map(s => {
      const sTagihans = tagihanList.filter(t => t.nis === s.nis && t.nominal > t.terbayar);
      if (sTagihans.length === 0) return null;
      
      const jumlah = sTagihans.reduce((sum, t) => sum + (t.nominal - t.terbayar), 0);
      let badge = "Perhatian";
      if (jumlah >= 2_000_000) badge = "Kritis";
      else if (jumlah >= 1_000_000) badge = "Waspada";
      
      return {
        id: s.id,
        nama: s.nama,
        nis: s.nis,
        kelas: s.kelas,
        inits: s.inits,
        jumlah,
        badge,
        jatuhTempo: sTagihans[0]?.jatuhTempo || "-",
        terakhirBayar: "-" // we don't track last payment date easily here without transaction history, but can mock
      };
    }).filter(Boolean) as any[];
    
    return studentsWithDebt.filter(r => 
      (kelasFilter === "Semua Kelas" || r.kelas === kelasFilter) &&
      (r.nama.toLowerCase().includes(searchQuery.toLowerCase()) || r.nis.includes(searchQuery))
    );
  }, [siswaList, tagihanList, kelasFilter, searchQuery]);

  const allChecked = rows.length > 0 && checked.size === rows.length;
  const someChecked = checked.size > 0 && checked.size < rows.length;

  const toggleAll  = () => setChecked(allChecked ? new Set() : new Set(rows.map((r: any) => r.id)));
  const toggleRow  = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  return (
    <>
      {/* ═══ MOBILE LAYOUT (md:hidden) ═════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Summary strip */}
        <div className="grid grid-cols-3 divide-x bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE", borderColor: "#E2E8DE" }}>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#DC2626]" style={{ fontSize: 16 }}>
              {fmtJt(rows.reduce((sum, r) => sum + r.jumlah, 0))}
            </span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Total</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: 16 }}>{rows.length}</span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Siswa</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "14px 8px" }}>
            <span className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: 16 }}>
              {fmtJt(rows.length ? rows.reduce((sum, r) => sum + r.jumlah, 0) / rows.length : 0)}
            </span>
            <span className="text-[10px] text-[#6B7769]" style={{ marginTop: 3 }}>Rata-rata</span>
          </div>
        </div>

        {/* Aging tabs (horizontally scrollable) */}
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-2 pb-1" style={{ minWidth: "max-content" }}>
            {agingTabs.map((tab, i) => {
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
          {rows.map((row) => <StudentCard key={row.id} row={row} />)}
        </div>

        {/* Pagination (simple) */}
        <div className="flex items-center justify-between py-2">
          <span className="text-[12px] text-[#6B7769]">1–8 dari <strong className="text-[#1C2517]">68</strong> siswa</span>
          <div className="flex items-center gap-1">
            <button disabled className="w-10 h-10 flex items-center justify-center rounded-xl text-[#D1D5DB]" style={{ border: "1px solid #E2E8DE" }}>
              <ChevronLeft size={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[13px] font-bold text-white" style={{ background: "#3E8A2F" }}>1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[13px] text-[#374040]" style={{ border: "1px solid #E2E8DE" }}>2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[#374040]" style={{ border: "1px solid #E2E8DE" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
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
              {fmt(rows.reduce((sum, r) => sum + r.jumlah, 0))}
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
              {rows.length} <span className="text-sm font-normal text-[#6B7769]">siswa</span>
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
              {fmt(rows.length ? rows.reduce((sum, r) => sum + r.jumlah, 0) / rows.length : 0)}<span className="text-sm font-normal text-[#6B7769]"> / siswa</span>
            </p>
          </div>
        </div>

        {/* Main table card */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 gap-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
            <div className="flex items-center gap-1">
              {agingTabs.map((tab, i) => {
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
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors">
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
                {rows.map((row, i) => {
                  const isChecked = checked.has(row.id);
                  const avatarStyle = AVATAR_STYLE[row.badge] ?? { avatar: "#EDF7EC", avatarText: "#3E8A2F" };
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-[#FAFBF9]"
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none", background: isChecked ? "#F5FBF4" : undefined }}>
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
                        <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} />
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 pl-0.5">Jatuh tempo {row.jatuhTempo}</p>
                      </td>
                      <td className="py-3.5 pr-4"><span className="text-sm text-[#6B7769]">{row.terakhirBayar}</span></td>
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-2">
                          <button title="Kirim pengingat WhatsApp"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EDF7EC] hover:bg-[#DCFCE7] transition-colors">
                            <MessageCircle size={13} className="text-[#3E8A2F]" />
                          </button>
                          <button className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors whitespace-nowrap"
                            style={{ border: "1px solid #E2E8DE" }}>
                            Catat Bayar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-6 py-3.5" style={{ borderTop: "1px solid #E2E8DE" }}>
            <span className="text-xs text-[#6B7769]">1–{Math.min(8, rows.length)} dari <span className="font-semibold text-[#1C2517]">{rows.length}</span> siswa</span>
            <div className="flex items-center gap-1">
              <button disabled className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D1D5DB] cursor-not-allowed" style={{ border: "1px solid #E2E8DE" }}>
                <ChevronLeft size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3E8A2F] text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">3</button>
              <span className="px-1 text-[#9CA3A0] text-xs">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">9</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] hover:bg-[#EDF7EC] transition-colors" style={{ border: "1px solid #E2E8DE" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet (rendered outside both sections so it overlays correctly) */}
      <ClassFilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        selected={kelasFilter} onSelect={setKelasFilter} />
    </>
  );
}
