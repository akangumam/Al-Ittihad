import { useState } from "react";
import {
  ArrowUpRight, ArrowDownRight, Minus,
  TrendingUp, Wallet, AlertTriangle, MessageCircle, Banknote,
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { fmt, fmtCompact, fmtJt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";

import {
  monthlyData,
  piutangData,
  saldoAkun,
  dashboardTunggakanData as tunggakanData,
  dashboardTransaksiData as transaksiData,
  absensiChips,
} from "@/data/dashboard";

const chartData6 = monthlyData.slice(-6);

// ─── shared sub-components ────────────────────────────────────────────────────

function CircularProgress({ value, size = 110 }: { value: number; size?: number }) {
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const c = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#E2E8DE" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke="#3E8A2F" strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tabular-nums text-[#1C2517]" style={{ fontSize: size < 100 ? 15 : 18 }}>
          {value}%
        </span>
        <span style={{ fontSize: 9, color: "#6B7769" }}>Hadir</span>
      </div>
    </div>
  );
}

// ─── DESKTOP sub-components ───────────────────────────────────────────────────

function KpiCard({
  label, value, icon, iconBg, compare, compareDir, colorBad, valueColor,
}: {
  label: string; value: string; icon: React.ReactNode; iconBg: string;
  compare?: string; compareDir?: "up" | "down" | "neutral";
  colorBad?: boolean; valueColor?: string;
}) {
  const ArrowIcon =
    compareDir === "up" ? ArrowUpRight : compareDir === "down" ? ArrowDownRight : Minus;
  const arrowColor =
    !compareDir || compareDir === "neutral"
      ? "text-[#9CA3A0]"
      : compareDir === "up"
        ? (colorBad ? "text-[#DC2626]" : "text-[#3E8A2F]")
        : (colorBad ? "text-[#3E8A2F]" : "text-[#DC2626]");
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col gap-4" style={{ border: "1px solid #E2E8DE" }}>
      <div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-[#6B7769] font-medium mb-1">{label}</p>
        <p className={`text-xl font-bold tabular-nums tracking-tight ${valueColor ?? "text-[#1C2517]"}`}>{value}</p>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <ArrowIcon size={13} className={arrowColor} />
        {compare
          ? <span className={arrowColor + " font-semibold"}>{compare}</span>
          : <span className="text-[#9CA3A0]">—</span>}
        <span className="text-[#9CA3A0] ml-0.5">vs bulan lalu</span>
      </div>
    </div>
  );
}

function SaldoAkunCard() {
  return (
    <div className="bg-white rounded-xl px-6 py-4" style={{ border: "1px solid #E2E8DE" }}>
      <p className="text-sm font-semibold text-[#1C2517] mb-3">Saldo per Akun</p>
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: "#E2E8DE" }}>
        {saldoAkun.map((akun, i) => (
          <div key={i} className={`flex flex-col ${i > 0 ? "pl-6" : ""} ${i < saldoAkun.length - 1 ? "pr-6" : ""}`}>
            <p className="text-xs text-[#6B7769] font-medium mb-1">{akun.nama}</p>
            <p className="tabular-nums font-bold text-[#1C2517] tracking-tight text-right">{fmt(akun.saldo)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomeExpenseChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 520, H = 208, ML = 48, MR = 8, MT = 8, MB = 36;
  const cW = W - ML - MR, cH = H - MT - MB, MAX = 30_000_000;
  const xOf = (i: number) => ML + (i / (monthlyData.length - 1)) * cW;
  const yOf = (v: number) => MT + cH * (1 - v / MAX);
  const mkPath = (key: "pemasukan" | "pengeluaran") =>
    monthlyData.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`).join(" ");
  const yTicks = [0, 10_000_000, 20_000_000, 30_000_000];
  const currentYear = new Date().getFullYear();
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <p className="text-sm font-semibold text-[#1C2517] mb-0.5">Pemasukan vs Pengeluaran</p>
      <p className="text-xs text-[#6B7769] mb-3">Jul {currentYear - 1} – Jun {currentYear}</p>
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5"><span className="w-5 h-[2px] rounded-full inline-block bg-[#3E8A2F]" /><span className="text-xs text-[#6B7769]">Pemasukan</span></div>
        <div className="flex items-center gap-1.5"><span className="w-5 h-[2px] rounded-full inline-block bg-[#F6B31E]" /><span className="text-xs text-[#6B7769]">Pengeluaran</span></div>
      </div>
      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {yTicks.map((t, ti) => (
            <g key={ti}>
              <line x1={ML} x2={W - MR} y1={yOf(t)} y2={yOf(t)} stroke="#E2E8DE" strokeDasharray={t === 0 ? "0" : "4 3"} />
              <text x={ML - 5} y={yOf(t)} textAnchor="end" dominantBaseline="middle" fill="#9CA3A0" fontSize={9} fontFamily="Space Grotesk">{fmtCompact(t)}</text>
            </g>
          ))}
          {monthlyData.map((d, i) => (
            <text key={i} x={xOf(i)} y={H - MB + 14} textAnchor="middle" fill="#9CA3A0" fontSize={9} fontFamily="Space Grotesk">{d.bulan}</text>
          ))}
          <path d={mkPath("pemasukan")} fill="none" stroke="#3E8A2F" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={mkPath("pengeluaran")} fill="none" stroke="#F6B31E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hovered !== null && <line x1={xOf(hovered)} x2={xOf(hovered)} y1={MT} y2={H - MB} stroke="#D1D5DB" strokeWidth={1} />}
          {monthlyData.map((d, i) => (
            <g key={i}>
              <circle cx={xOf(i)} cy={yOf(d.pemasukan)}   r={hovered === i ? 5 : 3} fill="#3E8A2F" />
              <circle cx={xOf(i)} cy={yOf(d.pengeluaran)} r={hovered === i ? 5 : 3} fill="#F6B31E" />
            </g>
          ))}
          {monthlyData.map((_d, i) => (
            <rect key={i} x={xOf(i) - 18} y={MT} width={36} height={cH} fill="transparent" style={{ cursor: "crosshair" }} onMouseEnter={() => setHovered(i)} />
          ))}
        </svg>
        {hovered !== null && (() => {
          const d = monthlyData[hovered];
          const pct = (xOf(hovered) / W) * 100;
          const flipLeft = hovered >= monthlyData.length - 4;
          return (
            <div className="absolute top-2 pointer-events-none bg-white rounded-xl shadow-lg px-3 py-2.5 z-10 whitespace-nowrap"
              style={{ border: "1px solid #E2E8DE", left: flipLeft ? undefined : `${pct}%`, right: flipLeft ? `${100 - pct}%` : undefined, transform: flipLeft ? "translateX(18px)" : "translateX(5%)" }}>
              <p className="text-[11px] font-semibold text-[#1C2517] mb-1.5">{d.bulan}</p>
              <div className="flex items-center gap-1.5 text-[11px] mb-1"><span className="w-2 h-2 rounded-full bg-[#3E8A2F] shrink-0" /><span className="text-[#6B7769]">Pemasukan</span><span className="font-semibold tabular-nums ml-1">{fmt(d.pemasukan)}</span></div>
              <div className="flex items-center gap-1.5 text-[11px]"><span className="w-2 h-2 rounded-full bg-[#F6B31E] shrink-0" /><span className="text-[#6B7769]">Pengeluaran</span><span className="font-semibold tabular-nums ml-1">{fmt(d.pengeluaran)}</span></div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function PiutangDonut() {
  const total = piutangData.reduce((s, d) => s + d.value, 0);
  const currentYear = new Date().getFullYear();
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#1C2517]">Status Piutang</p>
        <p className="text-xs text-[#6B7769]">Tahun Ajaran {currentYear - 1}/{currentYear}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie data={piutangData} cx={75} cy={75} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
              {piutangData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#1C2517] tabular-nums">{total}</span>
            <span className="text-[10px] text-[#6B7769]">Siswa</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {piutangData.map((d, i) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} /><span className="text-xs font-medium text-[#374040]">{d.name}</span></div>
                  <span className="text-xs font-bold tabular-nums text-[#1C2517]">{d.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E2E8DE] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AbsensiGuru() {
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <p className="text-sm font-semibold text-[#1C2517] mb-1">Absensi Guru Hari Ini</p>
      <p className="text-xs text-[#6B7769] mb-5">Senin, 13 Juli 2026</p>
      <div className="flex items-center gap-6">
        <CircularProgress value={89} size={110} />
        <div className="flex-1 grid grid-cols-2 gap-2">
          {absensiChips.map((c, i) => (
            <div key={i} className="flex flex-col items-center justify-center rounded-xl py-3 px-2" style={{ background: c.bg }}>
              <span className="tabular-nums font-bold text-xl" style={{ color: c.text }}>{c.value}</span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: c.text }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
        <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide mb-2">Belum Absen</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#1C2517]">Ust. Ahmad Zaki</p>
          <button className="text-xs font-semibold text-[#3E8A2F] hover:underline">Input absensi →</button>
        </div>
      </div>
    </div>
  );
}

function TunggakanTable() {
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#1C2517]">Tunggakan Terbesar</p>
          <p className="text-xs text-[#6B7769]">5 siswa tertunggak terbanyak</p>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-2 mb-2" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide">Nama / Kelas</span>
        <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide text-right">Jumlah</span>
        <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide">Status</span>
        <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide text-center">WA</span>
      </div>
      {tunggakanData.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-2.5"
          style={{ borderBottom: i < tunggakanData.length - 1 ? "1px solid #F0F7EE" : "none" }}>
          <div>
            <p className="text-sm font-medium text-[#1C2517] leading-none">{row.nama}</p>
            <p className="text-[10px] text-[#6B7769] mt-0.5">Kelas {row.kelas}</p>
          </div>
          <p className="tabular-nums text-sm font-bold text-[#DC2626] text-right whitespace-nowrap">{fmt(row.jumlah)}</p>
          <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} />
          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#DCFCE7] transition-colors" title="Kirim WhatsApp">
            <MessageCircle size={14} className="text-[#3E8A2F]" />
          </button>
        </div>
      ))}
    </div>
  );
}

function TransaksiTerbaru() {
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#1C2517]">Transaksi Terbaru</p>
          <p className="text-xs text-[#6B7769]">8 transaksi terakhir</p>
        </div>
        <button className="text-xs font-semibold text-[#3E8A2F] hover:underline">Lihat semua</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              {["Tanggal", "Siswa", "Kategori", "Metode", "Jumlah", "Status Tagihan"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transaksiData.map((row, i) => (
              <tr key={i} className="hover:bg-[#FAFBF9] transition-colors" style={{ borderBottom: i < transaksiData.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                <td className="py-3 pr-4 text-xs text-[#6B7769] whitespace-nowrap">{row.tanggal}</td>
                <td className="py-3 pr-4 text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.siswa}</td>
                <td className="py-3 pr-4"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#F5F9F4] text-[#374040] font-medium">{row.kategori}</span></td>
                <td className="py-3 pr-4 text-xs text-[#6B7769]">{row.metode}</td>
                <td className="py-3 pr-4 text-sm font-bold tabular-nums text-[#1C2517] whitespace-nowrap">{fmt(row.jumlah)}</td>
                <td className="py-3"><StatusBadge status={row.status as "Lunas" | "Mencicil" | "Menunggak"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MOBILE sub-components ────────────────────────────────────────────────────

function MobileChart() {
  const W = 320, H = 132, ML = 34, MR = 6, MT = 6, MB = 22;
  const cW = W - ML - MR, cH = H - MT - MB, MAX = 30_000_000;
  const xOf = (i: number) => ML + (i / (chartData6.length - 1)) * cW;
  const yOf = (v: number) => MT + cH * (1 - v / MAX);
  const mkPath = (key: "pemasukan" | "pengeluaran") =>
    chartData6.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {[0, 15_000_000, 30_000_000].map((t, ti) => (
        <g key={ti}>
          <line x1={ML} x2={W - MR} y1={yOf(t)} y2={yOf(t)} stroke="#E2E8DE" strokeDasharray={t === 0 ? "0" : "4 3"} />
          <text x={ML - 5} y={yOf(t)} textAnchor="end" dominantBaseline="middle" fill="#9CA3A0" fontSize={8} fontFamily="Space Grotesk">
            {t === 0 ? "0" : `${t / 1_000_000}jt`}
          </text>
        </g>
      ))}
      {chartData6.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 4} textAnchor="middle" fill="#9CA3A0" fontSize={8} fontFamily="Space Grotesk">{d.label}</text>
      ))}
      <path d={mkPath("pemasukan")}   fill="none" stroke="#3E8A2F" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={mkPath("pengeluaran")} fill="none" stroke="#F6B31E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {chartData6.map((d, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(d.pemasukan)}   r={2.5} fill="#3E8A2F" />
          <circle cx={xOf(i)} cy={yOf(d.pengeluaran)} r={2.5} fill="#F6B31E" />
        </g>
      ))}
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const currentYear = new Date().getFullYear();
  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <>
      {/* ═══ MOBILE LAYOUT (md:hidden) ═════════════════════════════════════════ */}
      <div className="md:hidden px-4 py-3 flex flex-col gap-3">
        <p className="text-sm text-[#6B7769]">
          Selamat pagi, <span className="font-semibold text-[#1C2517]">Admin</span> — {todayStr}
        </p>

        {/* KPI 2×2 */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Pemasukan",    value: fmtJt(24_500_000), iconBg: "#EDF7EC", icon: <TrendingUp  size={16} color="#3E8A2F" />, compare: "+4,2%", good: true },
            { label: "Pengeluaran",  value: fmtJt(18_200_000), iconBg: "#FFFBEB", icon: <ArrowDownRight size={16} color="#D97706" />, compare: "+1,1%", good: false },
            { label: "Saldo Kas",    value: fmtJt(128_450_000), iconBg: "#EFF6FF", icon: <Wallet size={16} color="#2563EB" /> },
            { label: "Tunggakan",    value: fmtJt(45_200_000), iconBg: "#FEF2F2", icon: <AlertTriangle size={16} color="#DC2626" />, red: true },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl flex flex-col gap-2" style={{ border: "1px solid #E2E8DE", padding: "14px 14px 12px" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: kpi.iconBg }}>{kpi.icon}</div>
              <div>
                <p className="text-[11px] text-[#6B7769] font-medium" style={{ marginBottom: 2 }}>{kpi.label}</p>
                <p className="font-bold tabular-nums" style={{ fontSize: 15, color: kpi.red ? "#DC2626" : "#1C2517" }}>{kpi.value}</p>
              </div>
              {kpi.compare && (
                <div className="flex items-center gap-1">
                  <ArrowUpRight size={11} color={kpi.good ? "#3E8A2F" : "#DC2626"} />
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: kpi.good ? "#3E8A2F" : "#DC2626" }}>{kpi.compare}</span>
                  <span className="text-[9px] text-[#9CA3A0]">vs bulan lalu</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saldo per Akun */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
          <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 10 }}>Saldo per Akun</p>
          {saldoAkun.map((akun, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "10px 0", minHeight: 44, borderBottom: i < saldoAkun.length - 1 ? "1px solid #F0F7EE" : "none" }}>
              <span className="text-[13px] text-[#374040]">{akun.nama}</span>
              <span className="text-[13px] font-bold tabular-nums text-[#1C2517]">{fmt(akun.saldo)}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 14px 10px" }}>
          <p className="text-[13px] font-semibold text-[#1C2517]">Pemasukan vs Pengeluaran</p>
          <p className="text-[11px] text-[#6B7769]" style={{ marginBottom: 10 }}>Jan – Jun {currentYear}</p>
          <div className="flex gap-4" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-1.5"><span className="inline-block rounded-full bg-[#3E8A2F]" style={{ width: 16, height: 2 }} /><span className="text-[10px] text-[#6B7769]">Pemasukan</span></div>
            <div className="flex items-center gap-1.5"><span className="inline-block rounded-full bg-[#F6B31E]" style={{ width: 16, height: 2 }} /><span className="text-[10px] text-[#6B7769]">Pengeluaran</span></div>
          </div>
          <MobileChart />
        </div>

        {/* Tunggakan top 3 */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
          <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 12 }}>Tunggakan Terbesar</p>
          {tunggakanData.slice(0, 3).map((row, i) => (
            <div key={i} className="flex items-center gap-2.5"
              style={{ padding: "10px 0", minHeight: 52, borderBottom: i < 2 ? "1px solid #F0F7EE" : "none" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: "#EDF7EC", color: "#3E8A2F" }}>{row.inits}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1C2517] leading-none truncate">{row.nama}</p>
                <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
                  <span className="text-[10px] text-[#6B7769]">Kelas {row.kelas}</span>
                  <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} className="text-[9px] px-1.5 py-0.5" />
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-1.5">
                <span className="text-[13px] font-bold tabular-nums text-[#DC2626]">{fmtJt(row.jumlah)}</span>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EDF7EC" }}>
                  <MessageCircle size={13} color="#3E8A2F" />
                </button>
              </div>
            </div>
          ))}
          <button className="text-[12px] font-semibold text-[#3E8A2F] mt-2.5 block">Lihat semua →</button>
        </div>

        {/* Absensi Hari Ini */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
          <p className="text-[13px] font-semibold text-[#1C2517]">Absensi Hari Ini</p>
          <p className="text-[11px] text-[#6B7769]" style={{ marginBottom: 14 }}>{todayStr}</p>
          <div className="flex items-center gap-3.5">
            <CircularProgress value={89} size={88} />
            <div className="flex-1 grid grid-cols-2 gap-2">
              {absensiChips.map((chip, i) => (
                <div key={i} className="flex flex-col items-center justify-center rounded-[10px] text-center" style={{ background: chip.bg, padding: "10px 6px", minHeight: 56 }}>
                  <span className="font-bold tabular-nums" style={{ fontSize: 18, color: chip.text }}>{chip.value}</span>
                  <span className="font-medium leading-tight" style={{ fontSize: 9, color: chip.text, marginTop: 3 }}>{chip.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT (hidden md:block) ══════════════════════════════════ */}
      <div className="hidden md:block max-w-[1280px] mx-auto space-y-5">
        <p className="text-sm text-[#6B7769]">
          Selamat datang,{" "}
          <span className="font-semibold text-[#1C2517]">Admin Keuangan</span>
          {" — "}
          <span>{todayStr}</span>
        </p>

        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Total Pemasukan"  value={fmt(24_500_000)}  iconBg="#DCFCE7" icon={<TrendingUp size={18} className="text-[#3E8A2F]" />}  compare="+4,2%" compareDir="up" />
          <KpiCard label="Total Pengeluaran" value={fmt(18_200_000)} iconBg="#FEF3C7" icon={<Banknote size={18} className="text-[#92400E]" />}    compare="+1,1%" compareDir="up" colorBad />
          <KpiCard label="Saldo Kas"         value={fmt(128_450_000)} iconBg="#E8F5E9" icon={<Wallet size={18} className="text-[#57A946]" />}       compareDir="neutral" />
          <KpiCard label="Total Tunggakan"   value={fmt(45_200_000)} iconBg="#FEE2E2" icon={<AlertTriangle size={18} className="text-[#DC2626]" />} compare="+8,3%" compareDir="up" colorBad valueColor="text-[#DC2626]" />
        </div>

        <SaldoAkunCard />

        <div className="grid grid-cols-2 gap-4">
          <IncomeExpenseChart />
          <PiutangDonut />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AbsensiGuru />
          <TunggakanTable />
        </div>

        <TransaksiTerbaru />
      </div>
    </>
  );
}
