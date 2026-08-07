import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, MoreHorizontal, ArrowRight, Landmark, Wallet,
} from "lucide-react";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

import { transaksiData, BSI_SPARK, MANDIRI_SPARK, KAS_SPARK, akunData, mutasiData, kategoriOptions } from "@/data/keuangan";

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120, H = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = ((i / (data.length - 1)) * W).toFixed(1);
      const y = (H - ((v - min) / range) * (H - 6) - 3).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}

// ─── Transaksi tab ────────────────────────────────────────────────────────────

type FilterType = "Semua" | "Pemasukan" | "Pengeluaran";

function TransaksiTab() {
  const [filter, setFilter] = useState<FilterType>("Semua");
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua Kategori");

  const rows = transaksiData.filter((r) => {
    if (filter === "Pemasukan")  return r.tipe === "masuk";
    if (filter === "Pengeluaran") return r.tipe === "keluar";
    return true;
  });

  const totalCount = filter === "Semua" ? 156 : filter === "Pemasukan" ? 112 : 44;
  const totalLabel = filter === "Semua" ? "transaksi" : filter === "Pemasukan" ? "pemasukan" : "pengeluaran";
  const lastPage   = filter === "Semua" ? 20 : filter === "Pemasukan" ? 14 : 6;

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      {/* Toolbar */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented filter */}
          <div
            className="flex rounded-lg overflow-hidden shrink-0"
            style={{ border: "1px solid #E2E8DE" }}
          >
            {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((f, i) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  i > 0 ? "border-l border-[#E2E8DE]" : "",
                  filter === f
                    ? "bg-[#3E8A2F] text-white"
                    : "text-[#6B7769] bg-white hover:bg-[#F5F9F4]",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Date range */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            <Calendar size={13} className="text-[#6B7769] shrink-0" />
            <span className="text-sm text-[#374040]">1–13 Jul 2026</span>
            <ChevronDown size={12} className="text-[#9CA3A0]" />
          </button>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            <Search size={13} className="text-[#9CA3A0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi..."
              className="bg-transparent outline-none text-sm text-[#1C2517] w-32"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {kategoriOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          {/* Action buttons */}
          <div className="ml-auto flex gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
              <Plus size={13} />
              Pemasukan
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              style={{ border: "1.5px solid #DC2626" }}
            >
              <span className="font-bold text-base leading-none">−</span>
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EDF7EC]">
            <span className="text-xs text-[#6B7769]">Pemasukan periode ini:</span>
            <span className="text-sm font-bold tabular-nums text-[#3E8A2F]">Rp 8.450.000</span>
          </div>
          <span className="text-[#D1D5DB]">·</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEE2E2]">
            <span className="text-xs text-[#6B7769]">Pengeluaran:</span>
            <span className="text-sm font-bold tabular-nums text-[#DC2626]">Rp 3.200.000</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4 whitespace-nowrap">Tanggal</Th>
              <Th className="pr-4">Keterangan</Th>
              <Th className="pr-4 whitespace-nowrap">Akun</Th>
              <Th className="pr-4">Ref</Th>
              <Th align="right" className="pr-4">Jumlah</Th>
              <th className="py-3 pr-6 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="hover:bg-[#FAFBF9] transition-colors"
                style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none" }}
              >
                <td className="py-3.5 pl-6 pr-4 text-sm text-[#6B7769] whitespace-nowrap">
                  {row.tanggal}
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-sm font-semibold text-[#1C2517]">{row.keterangan}</p>
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F9F4] text-[#6B7769]">
                    {row.kategori}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-sm text-[#6B7769] whitespace-nowrap">
                  {row.akun}
                </td>
                <td className="py-3.5 pr-4">
                  {row.ref !== "—" ? (
                    <code className="text-[11px] text-[#6B7769] bg-[#F5F9F4] px-1.5 py-0.5 rounded">
                      {row.ref}
                    </code>
                  ) : (
                    <span className="text-sm text-[#D1D5DB]">—</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      row.tipe === "masuk" ? "text-[#3E8A2F]" : "text-[#DC2626]"
                    }`}
                  >
                    {row.tipe === "masuk" ? "+" : "−"}
                    {fmt(row.jumlah)}
                  </span>
                </td>
                <td className="py-3.5 pr-6">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-6 py-3.5"
        style={{ borderTop: "1px solid #E2E8DE" }}
      >
        <span className="text-xs text-[#6B7769]">
          1–{rows.length} dari{" "}
          <span className="font-semibold text-[#1C2517]">{totalCount}</span> {totalLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D1D5DB] cursor-not-allowed"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <ChevronLeft size={14} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3E8A2F] text-white text-xs font-bold">1</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">2</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">3</button>
          <span className="px-1 text-[#9CA3A0] text-xs">...</span>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">{lastPage}</button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] hover:bg-[#EDF7EC] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Akun tab ─────────────────────────────────────────────────────────────────

function AkunTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {akunData.map((akun) => {
        const Icon = akun.icon === "wallet" ? Wallet : Landmark;
        const iconBg = akun.icon === "wallet" ? "#FEF3C7" : "#EDF7EC";
        const iconColor = akun.icon === "wallet" ? "#92400E" : "#3E8A2F";
        return (
          <div
            key={akun.id}
            className="bg-white rounded-xl p-6 flex flex-col"
            style={{ border: "1px solid #E2E8DE" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1C2517]">{akun.nama}</p>
                {akun.nomor ? (
                  <p className="text-[11px] text-[#9CA3A0] mt-0.5" style={{ fontFamily: "monospace" }}>
                    {akun.nomor}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#9CA3A0] mt-0.5">Petty cash</p>
                )}
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-3"
                style={{ background: iconBg }}
              >
                <Icon size={15} style={{ color: iconColor }} />
              </div>
            </div>

            {/* Balance */}
            <p className="tabular-nums font-bold text-[#1C2517] tracking-tight mb-4" style={{ fontSize: "1.25rem" }}>
              {fmt(akun.saldo)}
            </p>

            {/* Sparkline */}
            <div className="flex-1 flex items-end mb-3">
              <Sparkline data={akun.spark} color={akun.sparkColor} />
            </div>

            {/* Reconciliation date */}
            <p className="text-[11px] text-[#9CA3A0]">
              Terakhir rekonsiliasi: {akun.rekonsiliasi}
            </p>
          </div>
        );
      })}

      {/* Add account slot */}
      <button
        className="flex flex-col items-center justify-center rounded-xl transition-colors group"
        style={{ border: "2px dashed #D1D5DB" }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#3E8A2F";
          (e.currentTarget as HTMLElement).style.background = "#F5FBF4";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB";
          (e.currentTarget as HTMLElement).style.background = "";
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-[#E2E8DE] flex items-center justify-center mb-2.5 group-hover:bg-[#DCFCE7] transition-colors">
          <Plus size={18} className="text-[#9CA3A0] group-hover:text-[#3E8A2F]" />
        </div>
        <p className="text-sm font-semibold text-[#9CA3A0] group-hover:text-[#3E8A2F] transition-colors">
          Tambah Akun
        </p>
      </button>
    </div>
  );
}

// ─── Mutasi tab ───────────────────────────────────────────────────────────────

function MutasiTab() {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>
            Mutasi Antar Akun
          </p>
          <p className="text-sm text-[#6B7769] mt-0.5">
            Transfer dana antara akun keuangan
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0">
          <Plus size={14} />
          Buat Transfer
        </button>
      </div>

      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4 whitespace-nowrap">Tanggal</Th>
                <Th className="pr-4">Dari Akun → Ke Akun</Th>
                <Th align="right" className="pr-4">Nominal</Th>
                <Th className="pr-4">Catatan</Th>
                <Th className="pr-6">Status</Th>
              </tr>
            </thead>
            <tbody>
              {mutasiData.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < mutasiData.length - 1 ? "1px solid #F0F7EE" : "none" }}
                >
                  <td className="py-3.5 pl-6 pr-4 text-sm text-[#6B7769] whitespace-nowrap">
                    {row.tanggal}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.dari}</span>
                      <ArrowRight size={13} className="text-[#9CA3A0] shrink-0" />
                      <span className="text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.ke}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className="text-sm font-bold tabular-nums text-[#1C2517]">
                      {fmt(row.nominal)}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-[#6B7769]">
                    {row.catatan}
                  </td>
                  <td className="py-3.5 pr-6">
                    <StatusBadge status={row.status as "Selesai"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

type TabType = "transaksi" | "akun" | "mutasi";

const TAB_LABELS: Record<TabType, string> = {
  transaksi: "Transaksi",
  akun:      "Akun",
  mutasi:    "Mutasi",
};

export function KasBank() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "transaksi";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-[#1C2517]">Kas &amp; Bank</h2>
        <p className="text-sm text-[#6B7769]">Kelola transaksi, akun, dan mutasi keuangan</p>
      </div>

      {/* Tab buttons — shadcn Tabs pattern */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {(["transaksi", "akun", "mutasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/keuangan/kas-bank/${t}`)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
              activeTab === t
                ? "bg-white text-[#1C2517]"
                : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {TAB_LABELS[t as TabType]}
          </button>
        ))}
      </div>
      </div>

      {/* Tab content */}
      {activeTab === "transaksi" && <TransaksiTab />}
      {activeTab === "akun"      && <AkunTab />}
      {activeTab === "mutasi"    && <MutasiTab />}
    </div>
  );
}
