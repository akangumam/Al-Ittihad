import { useState } from "react";
import {
  MessageCircle, Search, ChevronDown, ChevronLeft,
  ChevronRight, Download, Check, AlertTriangle, Users, TrendingDown,
} from "lucide-react";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── data ─────────────────────────────────────────────────────────────────────

const rows = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", jumlah: 3_500_000, badge: "Kritis",    jatuhTempo: "31 Mar 2026", terakhirBayar: "3 Mar 2026",  inits: "AF" },
  { id: 2, nama: "Siti Rahmawati",        nis: "2023-0145", kelas: "8B", jumlah: 2_800_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "15 Apr 2026", inits: "SR" },
  { id: 3, nama: "Rizky Firmansyah",      nis: "2025-0067", kelas: "7C", jumlah: 2_100_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "20 Apr 2026", inits: "RF" },
  { id: 4, nama: "Nur Hidayatullah",      nis: "2024-0234", kelas: "9D", jumlah: 1_900_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "10 Mei 2026", inits: "NH" },
  { id: 5, nama: "Muhammad Alif Hakim",   nis: "2023-0312", kelas: "8A", jumlah: 1_750_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "12 Mei 2026", inits: "MA" },
  { id: 6, nama: "Farah Dianti Putri",    nis: "2025-0089", kelas: "7B", jumlah:   950_000, badge: "Perhatian", jatuhTempo: "20 Jun 2026", terakhirBayar: "8 Jun 2026",  inits: "FD" },
  { id: 7, nama: "Bagas Prasetyo",        nis: "2024-0178", kelas: "9C", jumlah:   875_000, badge: "Perhatian", jatuhTempo: "17 Jun 2026", terakhirBayar: "5 Jun 2026",  inits: "BP" },
  { id: 8, nama: "Aisyah Nur Fadila",     nis: "2023-0456", kelas: "8D", jumlah:   700_000, badge: "Perhatian", jatuhTempo: "22 Jun 2026", terakhirBayar: "10 Jun 2026", inits: "AN" },
];

const agingTabs = [
  { label: "Semua",           count: 68 },
  { label: "Lewat 1–30 hari", count: 31 },
  { label: "Lewat 31–60 hari",count: 22 },
  { label: "Lewat 60+ hari",  count: 15 },
];

const kelasOptions = [
  "Semua Kelas",
  "Kelas 7A","Kelas 7B","Kelas 7C","Kelas 7D",
  "Kelas 8A","Kelas 8B","Kelas 8C","Kelas 8D",
  "Kelas 9A","Kelas 9B","Kelas 9C","Kelas 9D",
];

// ─── avatar colours for tunggakan rows (badge-level, stays local) ─────────────

const AVATAR_STYLE: Record<string, { avatar: string; avatarText: string }> = {
  Kritis:    { avatar: "#FEE2E2", avatarText: "#991B1B" },
  Waspada:   { avatar: "#FEF3C7", avatarText: "#92400E" },
  Perhatian: { avatar: "#EDF7EC", avatarText: "#3E8A2F" },
};

// ─── sub-components ───────────────────────────────────────────────────────────

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

// ─── page ─────────────────────────────────────────────────────────────────────

export function Tunggakan() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [checked, setChecked] = useState<Set<number>>(new Set([1, 2, 3]));

  const allChecked = checked.size === rows.length;
  const someChecked = checked.size > 0 && checked.size < rows.length;

  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  const toggleRow = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* ── Page title ── */}
      <div>
        <h2 className="text-[#1C2517]">Tunggakan</h2>
        <p className="text-sm text-[#6B7769]">
          Pantau dan tindak lanjuti tunggakan siswa
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Total Tunggakan */}
        <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-[#DC2626]" />
            </div>
            <span className="text-xs font-semibold text-[#6B7769]">Total Tunggakan</span>
          </div>
          <p className="text-xl font-bold tabular-nums tracking-tight text-[#DC2626]">
            {fmt(45_200_000)}
          </p>
        </div>

        {/* Siswa Menunggak */}
        <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <Users size={15} className="text-[#92400E]" />
            </div>
            <span className="text-xs font-semibold text-[#6B7769]">Siswa Menunggak</span>
          </div>
          <p className="text-xl font-bold tabular-nums tracking-tight text-[#1C2517]">
            68{" "}
            <span className="text-sm font-normal text-[#6B7769]">dari 355 siswa</span>
          </p>
        </div>

        {/* Rata-rata Tunggakan */}
        <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#EDF7EC] flex items-center justify-center shrink-0">
              <TrendingDown size={15} className="text-[#3E8A2F]" />
            </div>
            <span className="text-xs font-semibold text-[#6B7769]">Rata-rata Tunggakan</span>
          </div>
          <p className="text-xl font-bold tabular-nums tracking-tight text-[#1C2517]">
            {fmt(664_000)}
            <span className="text-sm font-normal text-[#6B7769]"> / siswa</span>
          </p>
        </div>
      </div>

      {/* ── Main table card ── */}
      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>

        {/* Card header: tabs + controls */}
        <div
          className="flex items-center justify-between px-6 py-4 gap-4"
          style={{ borderBottom: "1px solid #E2E8DE" }}
        >
          {/* Aging tabs */}
          <div className="flex items-center gap-1">
            {agingTabs.map((tab, i) => {
              const active = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#3E8A2F] text-white"
                      : "text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F]",
                  ].join(" ")}
                >
                  {tab.label}
                  <span
                    className={[
                      "px-1.5 py-px rounded-full text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#E2E8DE] text-[#6B7769]",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              <Search size={13} className="text-[#9CA3A0] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama/NIS..."
                className="bg-transparent outline-none text-sm text-[#1C2517] w-36"
              />
            </div>

            {/* Class filter */}
            <div className="relative">
              <select
                value={kelasFilter}
                onChange={(e) => setKelasFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
                style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
              >
                {kelasOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
              />
            </div>

            {/* Export */}
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {checked.size > 0 && (
          <div
            className="flex items-center gap-3 px-6 py-3"
            style={{
              background: "#EDF7EC",
              borderBottom: "1px solid #D4EDD0",
            }}
          >
            <span className="text-sm font-semibold text-[#3E8A2F]">
              {checked.size} siswa dipilih
            </span>
            <span className="text-[#9CA3A0]">—</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors">
              <MessageCircle size={13} />
              Kirim Pengingat WA
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#3E8A2F] hover:bg-[#DCFCE7] transition-colors"
              style={{ border: "1px solid #3E8A2F" }}
            >
              <Download size={13} />
              Export Terpilih
            </button>
            <button
              onClick={() => setChecked(new Set())}
              className="ml-auto text-xs text-[#6B7769] hover:text-[#374040]"
            >
              Batalkan pilihan
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <th className="w-10 pl-6 pr-3 py-3">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                  />
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
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[#FAFBF9]"
                    style={{
                      borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none",
                      background: isChecked ? "#F5FBF4" : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <td className="pl-6 pr-3 py-3.5">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>

                    {/* Siswa */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{
                            background: avatarStyle.avatar,
                            color: avatarStyle.avatarText,
                          }}
                        >
                          {row.inits}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517] leading-none">
                            {row.nama}
                          </p>
                          <p className="text-[11px] text-[#6B7769] mt-0.5">
                            {row.nis} · Kelas {row.kelas}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tunggakan */}
                    <td className="py-3.5 pr-4 text-right">
                      <span className="text-sm font-bold tabular-nums text-[#DC2626]">
                        {fmt(row.jumlah)}
                      </span>
                    </td>

                    {/* Lama Menunggak */}
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} />
                      <p className="text-[11px] text-[#9CA3A0] mt-0.5 pl-0.5">Jatuh tempo {row.jatuhTempo}</p>
                    </td>

                    {/* Terakhir Bayar */}
                    <td className="py-3.5 pr-4">
                      <span className="text-sm text-[#6B7769]">{row.terakhirBayar}</span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        <button
                          title="Kirim pengingat WhatsApp"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EDF7EC] hover:bg-[#DCFCE7] transition-colors"
                        >
                          <MessageCircle size={13} className="text-[#3E8A2F]" />
                        </button>
                        <button
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors whitespace-nowrap"
                          style={{ border: "1px solid #E2E8DE" }}
                        >
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
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{ borderTop: "1px solid #E2E8DE" }}
        >
          <span className="text-xs text-[#6B7769]">
            1–8 dari <span className="font-semibold text-[#1C2517]">68</span> siswa
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D1D5DB] cursor-not-allowed"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3E8A2F] text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">
              3
            </button>
            <span className="px-1 text-[#9CA3A0] text-xs">...</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">
              9
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] hover:bg-[#EDF7EC] transition-colors"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
