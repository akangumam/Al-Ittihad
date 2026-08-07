import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Plus, Download, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import { fmt } from "@/lib/formatters";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── formatter ────────────────────────────────────────────────────────────────

const IDR = (v: number): string => v < 0 ? `−${fmt(Math.abs(v))}` : fmt(v);

// ─── color helpers ────────────────────────────────────────────────────────────

const sColor = (pct: number) => pct >= 100 ? "#DC2626" : pct >= 80 ? "#D97706" : "#3E8A2F";
const sBg    = (pct: number) => pct >= 100 ? "#FEE2E2" : pct >= 80 ? "#FEF3C7" : "#DCFCE7";

import { RABRow, RAB_DATA, GROUPS, TOTAL_A, TOTAL_T, TOTAL_S, TOTAL_P, MONTHS, ANGGARAN_M, REALISASI_M, TOP5 } from "@/data/keuangan";

// ─── sub-components ───────────────────────────────────────────────────────────

function RowMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 w-44 bg-white rounded-xl py-1"
            style={{ border:"1px solid #E2E8DE", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}
          >
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <Pencil size={13} className="text-[#6B7769]" /> Edit
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <Copy size={13} className="text-[#6B7769]" /> Duplikasi
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SerapanBar({ pct }: { pct: number }) {
  const color = sColor(pct);
  const bg    = sBg(pct);
  const fillW = Math.min(pct, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full" style={{ width:`${fillW}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Budget Bar Chart (custom SVG) ───────────────────────────────────────────

function BudgetBarChart() {
  const VW = 760, VH = 220;
  const PL = 50, PR = 15, PT = 10, PB = 38;
  const plotW = VW - PL - PR;
  const plotH = VH - PT - PB;
  const maxV  = 120; // millions
  const n     = MONTHS.length;
  const groupW = plotW / n;
  const barW  = Math.floor(groupW * 0.26);
  const gap   = 3;
  const yTicks = [0, 30, 60, 90, 120];

  const xBar = (i: number, which: 0 | 1) => {
    const groupX = PL + i * groupW;
    const totalBarsW = 2 * barW + gap;
    const offset = (groupW - totalBarsW) / 2;
    return groupX + offset + which * (barW + gap);
  };
  const yBar = (v: number) => PT + plotH - (v / maxV) * plotH;
  const hBar = (v: number) => (v / maxV) * plotH;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Grafik anggaran vs realisasi bulanan"
    >
      {/* Grid lines + Y labels */}
      {yTicks.map((t) => {
        const y = PT + plotH - (t / maxV) * plotH;
        return (
          <g key={t}>
            <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke={t === 0 ? "#D1D5DB" : "#F0F7EE"} strokeWidth={1} />
            <text x={PL - 6} y={y + 3.5} textAnchor="end" fontSize={9.5} fill="#9CA3A0" fontFamily="inherit">
              {t}jt
            </text>
          </g>
        );
      })}

      {/* Bars + X labels */}
      {MONTHS.map((m, i) => {
        const aH = hBar(ANGGARAN_M[i]);
        const rH = hBar(REALISASI_M[i]);
        const labelX = PL + i * groupW + groupW / 2;

        return (
          <g key={m}>
            {/* Anggaran bar (green) */}
            <rect
              x={xBar(i, 0)} y={yBar(ANGGARAN_M[i])}
              width={barW} height={aH}
              rx={2} fill="#3E8A2F" opacity={0.85}
            />
            {/* Realisasi bar (amber) */}
            <rect
              x={xBar(i, 1)} y={yBar(REALISASI_M[i])}
              width={barW} height={rH}
              rx={2} fill="#D97706" opacity={0.9}
            />
            {/* Month label */}
            <text
              x={labelX} y={VH - PB + 16}
              textAnchor="middle" fontSize={9.5} fill="#6B7769" fontFamily="inherit"
            >
              {m}
            </text>
          </g>
        );
      })}

      {/* X-axis baseline */}
      <line
        x1={PL} y1={PT + plotH} x2={VW - PR} y2={PT + plotH}
        stroke="#D1D5DB" strokeWidth={1}
      />
    </svg>
  );
}

// ─── RAB Tab ─────────────────────────────────────────────────────────────────

function RABTab() {
  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[#1C2517]">Rencana Anggaran Biaya</p>
          <p className="text-xs text-[#6B7769] mt-0.5">Tahun Anggaran 2025/2026</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border:"1px solid #E2E8DE" }}
          >
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            <Plus size={13} /> Tambah Mata Anggaran
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="bg-white rounded-xl px-6 py-5" style={{ border:"1px solid #E2E8DE" }}>
        <div className="flex flex-wrap items-start gap-6 md:gap-10 mb-4">
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Total Anggaran</p>
            <p className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize:"1.2rem" }}>
              {IDR(TOTAL_A)}
            </p>
          </div>
          <div className="w-px self-stretch bg-[#E2E8DE]" />
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Terpakai</p>
            <p className="tabular-nums font-bold text-[#D97706]" style={{ fontSize:"1.2rem" }}>
              {IDR(TOTAL_T)}
            </p>
            <p className="text-[11px] text-[#9CA3A0] mt-0.5">{TOTAL_P}% dari total anggaran</p>
          </div>
          <div className="w-px self-stretch bg-[#E2E8DE]" />
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Sisa</p>
            <p className="tabular-nums font-bold text-[#3E8A2F]" style={{ fontSize:"1.2rem" }}>
              {IDR(TOTAL_S)}
            </p>
            <p className="text-[11px] text-[#9CA3A0] mt-0.5">Belum terealisasi</p>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="h-2 rounded-full bg-[#E2E8DE] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width:`${TOTAL_P}%`, background:"#D97706" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[#9CA3A0]">0%</span>
          <span className="text-[10px] text-[#D97706] font-semibold">{TOTAL_P}% terpakai</span>
          <span className="text-[10px] text-[#9CA3A0]">100%</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border:"1px solid #E2E8DE" }}>
        <DataTable>
          <thead>
            <tr style={{ borderBottom:"1px solid #E2E8DE" }}>
              <Th className="px-6">Mata Anggaran</Th>
              <Th align="right" className="px-4">Anggaran</Th>
              <Th align="right" className="px-4">Terpakai</Th>
              <Th align="right" className="px-4">Sisa</Th>
              <Th className="px-4">Serapan</Th>
              <th className="py-3 pr-6 w-10" />
            </tr>
          </thead>
          {GROUPS.map((group) => {
              const rows = RAB_DATA.filter((r) => r.group === group);
              return (
                <tbody key={group}>
                  {/* Group header */}
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-2"
                      style={{ background:"#F5F9F4", borderBottom:"1px solid #E2E8DE" }}
                    >
                      <span className="text-[10px] font-semibold text-[#6B7769] uppercase tracking-widest">
                        {group}
                      </span>
                    </td>
                  </tr>
                  {/* Data rows */}
                  {rows.map((row, ri) => {
                    const sisa   = row.anggaran - row.terpakai;
                    const pct    = Math.round((row.terpakai / row.anggaran) * 100);
                    const overBudget = sisa < 0;
                    const isLast = ri === rows.length - 1;

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-[#FAFBF9] transition-colors"
                        style={{ borderBottom: isLast ? "2px solid #E2E8DE" : "1px solid #F0F7EE" }}
                      >
                        {/* Mata Anggaran */}
                        <td className="px-6 py-3.5 text-sm font-medium text-[#1C2517]">
                          {row.nama}
                        </td>

                        {/* Anggaran */}
                        <td className="px-4 py-3.5 text-sm tabular-nums text-right text-[#374040]">
                          {IDR(row.anggaran)}
                        </td>

                        {/* Terpakai */}
                        <td className="px-4 py-3.5 text-sm tabular-nums text-right text-[#374040]">
                          {row.terpakai === 0
                            ? <span className="text-[#D1D5DB]">—</span>
                            : IDR(row.terpakai)
                          }
                        </td>

                        {/* Sisa */}
                        <td className={`px-4 py-3.5 text-sm tabular-nums text-right font-semibold ${overBudget ? "text-[#DC2626]" : "text-[#374040]"}`}>
                          {IDR(sisa)}
                        </td>

                        {/* Serapan */}
                        <td className="px-4 py-3.5">
                          <SerapanBar pct={pct} />
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 pr-6">
                          <RowMenu />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}

          {/* Footer total row */}
          <tfoot>
            <tr style={{ borderTop:"2px solid #E2E8DE", background:"#F5F9F4" }}>
              <td className="px-6 py-3.5 text-sm font-bold text-[#1C2517]">Total</td>
              <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#1C2517]">
                {IDR(TOTAL_A)}
              </td>
              <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#D97706]">
                {IDR(TOTAL_T)}
              </td>
              <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#3E8A2F]">
                {IDR(TOTAL_S)}
              </td>
              <td className="px-4 py-3.5">
                <SerapanBar pct={TOTAL_P} />
              </td>
              <td className="pr-6" />
            </tr>
          </tfoot>
        </DataTable>
      </div>

      {/* Caption */}
      <p className="text-xs text-[#9CA3A0]">
        * Serapan dihitung dari transaksi Kas &amp; Bank yang terhubung ke mata anggaran.
      </p>
    </div>
  );
}

// ─── Realisasi Tab ────────────────────────────────────────────────────────────

function RealisasiTab() {
  return (
    <div className="space-y-5">
      {/* KPI chips */}
      <div className="flex items-center gap-2">
        {[
          { label:"Total Dianggarkan",    value:IDR(TOTAL_A), color:"#1C2517" },
          { label:"Terealisasi",          value:IDR(TOTAL_T), color:"#D97706" },
          { label:"Persentase Serapan",   value:`${TOTAL_P}%`, color:"#D97706" },
        ].map((kpi, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#D1D5DB]">·</span>}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-sm"
              style={{ border:"1px solid #E2E8DE" }}
            >
              <span className="font-bold tabular-nums" style={{ color:kpi.color }}>{kpi.value}</span>
              <span className="text-[#6B7769]">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main area: chart + top-5 table */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Bar chart card */}
        <div className="flex-1 bg-white rounded-xl p-5" style={{ border:"1px solid #E2E8DE" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#1C2517]">Anggaran vs Realisasi Bulanan</p>
              <p className="text-xs text-[#6B7769] mt-0.5">Tahun Anggaran 2025/2026</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background:"#3E8A2F" }} />
                <span className="text-xs text-[#6B7769]">Anggaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background:"#D97706" }} />
                <span className="text-xs text-[#6B7769]">Realisasi</span>
              </div>
            </div>
          </div>
          <BudgetBarChart />
        </div>

        {/* Top 5 card */}
        <div className="w-full md:w-[300px] shrink-0 bg-white rounded-xl p-5" style={{ border:"1px solid #E2E8DE" }}>
          <p className="text-sm font-semibold text-[#1C2517] mb-1">Top Serapan Tertinggi</p>
          <p className="text-xs text-[#6B7769] mb-4">Berdasarkan % realisasi vs anggaran</p>
          <div className="space-y-4">
            {TOP5.map((item, i) => {
              const color = sColor(item.pct);
              const bg    = sBg(item.pct);
              return (
                <div key={item.nama}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#374040] truncate">{item.nama}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ color }}>
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width:`${Math.min(item.pct, 100)}%`, background: color }}
                    />
                  </div>
                  <p className="text-[10px] text-[#9CA3A0] mt-1 tabular-nums">
                    {IDR(item.terpakai)} / {IDR(item.anggaran)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly detail table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border:"1px solid #E2E8DE" }}>
        <div className="px-6 py-4" style={{ borderBottom:"1px solid #E2E8DE" }}>
          <p className="text-sm font-semibold text-[#1C2517]">Rincian Realisasi per Bulan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid #E2E8DE" }}>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-6 py-3">Bulan</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Anggaran</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Realisasi</th>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Serapan</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3 pr-6">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => {
                const a    = ANGGARAN_M[i]  * 1_000_000;
                const r    = REALISASI_M[i] * 1_000_000;
                const pct  = Math.round((r / a) * 100);
                const sisa = a - r;
                const isLast = i === MONTHS.length - 1;
                return (
                  <tr
                    key={m}
                    className="hover:bg-[#FAFBF9] transition-colors"
                    style={{ borderBottom: isLast ? "none" : "1px solid #F0F7EE" }}
                  >
                    <td className="px-6 py-3 text-sm text-[#374040]">
                      {m} {i < 6 ? "2025" : "2026"}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right text-[#374040]">
                      {IDR(a)}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right text-[#374040]">
                      {r === 0 ? <span className="text-[#D1D5DB]">—</span> : IDR(r)}
                    </td>
                    <td className="px-4 py-3">
                      <SerapanBar pct={pct} />
                    </td>
                    <td className="px-4 py-3 pr-6 text-sm tabular-nums text-right text-[#9CA3A0]">
                      {IDR(sisa)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:"2px solid #E2E8DE", background:"#F5F9F4" }}>
                <td className="px-6 py-3.5 text-sm font-bold text-[#1C2517]">Total</td>
                <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#1C2517]">{IDR(TOTAL_A)}</td>
                <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#D97706]">{IDR(TOTAL_T)}</td>
                <td className="px-4 py-3.5"><SerapanBar pct={TOTAL_P} /></td>
                <td className="px-4 py-3.5 pr-6 text-sm tabular-nums text-right font-bold text-[#9CA3A0]">
                  {IDR(TOTAL_S)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Anggaran() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const currentTab = tab || "rab";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Anggaran</h2>
        <p className="text-sm text-[#6B7769]">Perencanaan dan realisasi anggaran madrasah TA 2025/2026</p>
      </div>

      {/* Shadcn tabs */}
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {[
          { id: "rab", label: "RAB" },
          { id: "realisasi", label: "Realisasi" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/keuangan/anggaran/${t.id}`)}
            className={[
              "px-5 py-2 rounded-md text-sm font-semibold transition-all",
              currentTab === t.id ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={currentTab === t.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {currentTab === "rab"       && <RABTab />}
      {currentTab === "realisasi" && <RealisasiTab />}
    </div>
  );
}
