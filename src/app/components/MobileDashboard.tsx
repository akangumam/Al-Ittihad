import type React from "react";
import {
  TrendingUp, Wallet, AlertTriangle,
  ArrowUpRight, ArrowDownRight, MessageCircle,
} from "lucide-react";

// ─── formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtJt = (n: number) => {
  const v = n / 1_000_000;
  return `Rp ${v.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} jt`;
};

// ─── data ─────────────────────────────────────────────────────────────────────

const saldoAkun = [
  { nama: "Bank BSI",              saldo: 85_200_000 },
  { nama: "Bank Mandiri Syariah",  saldo: 32_750_000 },
  { nama: "Kas Tunai",             saldo: 10_500_000 },
];

const chartData = [
  { label: "Jan", pemasukan: 24_000_000, pengeluaran: 18_500_000 },
  { label: "Feb", pemasukan: 23_000_000, pengeluaran: 17_100_000 },
  { label: "Mar", pemasukan: 25_000_000, pengeluaran: 19_200_000 },
  { label: "Apr", pemasukan: 22_000_000, pengeluaran: 16_500_000 },
  { label: "Mei", pemasukan: 23_500_000, pengeluaran: 18_000_000 },
  { label: "Jun", pemasukan: 24_500_000, pengeluaran: 18_200_000 },
];

const tunggakanTop3 = [
  { nama: "Ahmad Fadhilah Putra", kelas: "9A", jumlah: 3_500_000, badge: "Kritis", inits: "AF" },
  { nama: "Siti Rahmawati",       kelas: "8B", jumlah: 2_800_000, badge: "Kritis", inits: "SR" },
  { nama: "Rizky Firmansyah",     kelas: "7C", jumlah: 2_100_000, badge: "Kritis", inits: "RF" },
];

const absensiChips = [
  { label: "Hadir",       value: 34, bg: "#DCFCE7", text: "#166534" },
  { label: "Izin",        value: 2,  bg: "#FEF3C7", text: "#92400E" },
  { label: "Alpa",        value: 1,  bg: "#FEE2E2", text: "#991B1B" },
  { label: "Belum Absen", value: 1,  bg: "#F3F4F6", text: "#374151" },
];

const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  Kritis:    { bg: "#FEE2E2", text: "#991B1B" },
  Waspada:   { bg: "#FEF3C7", text: "#92400E" },
  Perhatian: { bg: "#FEF9C3", text: "#713F12" },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function CircularRing({ value, size = 88 }: { value: number; size?: number }) {
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const c = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#E2E8DE" strokeWidth={sw} />
        <circle
          cx={c} cy={c} r={r}
          fill="none" stroke="#3E8A2F" strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-[#1C2517] tabular-nums" style={{ fontSize: 16 }}>{value}%</span>
        <span style={{ fontSize: 9, color: "#6B7769" }}>Hadir</span>
      </div>
    </div>
  );
}

function MobileChart() {
  const W = 320, H = 132;
  const ML = 34, MR = 6, MT = 6, MB = 22;
  const cW = W - ML - MR;
  const cH = H - MT - MB;
  const MAX = 30_000_000;

  const xOf = (i: number) => ML + (i / (chartData.length - 1)) * cW;
  const yOf = (v: number) => MT + cH * (1 - v / MAX);
  const mkPath = (key: "pemasukan" | "pengeluaran") =>
    chartData
      .map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`)
      .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {[0, 15_000_000, 30_000_000].map((t, ti) => (
        <g key={`yt-${ti}`}>
          <line
            x1={ML} x2={W - MR}
            y1={yOf(t)} y2={yOf(t)}
            stroke="#E2E8DE"
            strokeDasharray={t === 0 ? "0" : "4 3"}
          />
          <text
            x={ML - 5} y={yOf(t)}
            textAnchor="end" dominantBaseline="middle"
            fill="#9CA3A0" fontSize={8} fontFamily="Space Grotesk"
          >
            {t === 0 ? "0" : `${t / 1_000_000}jt`}
          </text>
        </g>
      ))}
      {chartData.map((d, i) => (
        <text
          key={`xl-${i}`}
          x={xOf(i)} y={H - 4}
          textAnchor="middle"
          fill="#9CA3A0" fontSize={8} fontFamily="Space Grotesk"
        >
          {d.label}
        </text>
      ))}
      <path d={mkPath("pemasukan")}   fill="none" stroke="#3E8A2F" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={mkPath("pengeluaran")} fill="none" stroke="#F6B31E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {chartData.map((d, i) => (
        <g key={`dot-${i}`}>
          <circle cx={xOf(i)} cy={yOf(d.pemasukan)}   r={2.5} fill="#3E8A2F" />
          <circle cx={xOf(i)} cy={yOf(d.pengeluaran)} r={2.5} fill="#F6B31E" />
        </g>
      ))}
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MobileDashboard() {
  const kpiCards: Array<{
    label: string; value: string; iconBg: string; icon: React.ReactNode;
    compare?: string; dir?: "up" | "down"; good?: boolean; valueRed?: boolean;
  }> = [
    {
      label: "Pemasukan",
      value: "Rp 24,5 jt",
      iconBg: "#EDF7EC",
      icon: <TrendingUp size={16} color="#3E8A2F" />,
      compare: "+4,2%",
      dir: "up" as const,
      good: true,
    },
    {
      label: "Pengeluaran",
      value: "Rp 18,2 jt",
      iconBg: "#FFFBEB",
      icon: <ArrowDownRight size={16} color="#D97706" />,
      compare: "+1,1%",
      dir: "up" as const,
      good: false,
    },
    {
      label: "Saldo Kas",
      value: "Rp 128,4 jt",
      iconBg: "#EFF6FF",
      icon: <Wallet size={16} color="#2563EB" />,
    },
    {
      label: "Tunggakan",
      value: "Rp 45,2 jt",
      iconBg: "#FEF2F2",
      icon: <AlertTriangle size={16} color="#DC2626" />,
      valueRed: true,
    },
  ];

  return (
    <div className="px-4 py-3 flex flex-col gap-3">

      {/* 1 · Greeting */}
      <p className="text-sm text-[#6B7769]">
        Selamat pagi, <span className="font-semibold text-[#1C2517]">Admin</span> — Senin, 13 Juli 2026
      </p>

      {/* 2 · KPI 2×2 */}
      <div className="grid grid-cols-2 gap-2.5">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="bg-white rounded-xl flex flex-col"
            style={{ border: "1px solid #E2E8DE", padding: "14px 14px 12px", gap: 8 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: kpi.iconBg }}
            >
              {kpi.icon}
            </div>
            <div>
              <p className="text-[11px] text-[#6B7769] font-medium" style={{ marginBottom: 2 }}>
                {kpi.label}
              </p>
              <p
                className="font-bold tabular-nums"
                style={{
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                  color: kpi.valueRed ? "#DC2626" : "#1C2517",
                  margin: 0,
                }}
              >
                {kpi.value}
              </p>
            </div>
            {kpi.compare && (
              <div className="flex items-center gap-1">
                {kpi.dir === "up" ? (
                  <ArrowUpRight size={11} color={kpi.good ? "#3E8A2F" : "#DC2626"} />
                ) : (
                  <ArrowDownRight size={11} color={kpi.good ? "#3E8A2F" : "#DC2626"} />
                )}
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: kpi.good ? "#3E8A2F" : "#DC2626" }}
                >
                  {kpi.compare}
                </span>
                <span className="text-[9px] text-[#9CA3A0]">vs bulan lalu</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3 · Saldo per Akun */}
      <div
        className="bg-white rounded-xl"
        style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}
      >
        <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 10 }}>
          Saldo per Akun
        </p>
        {saldoAkun.map((akun, i) => (
          <div
            key={i}
            className="flex items-center justify-between"
            style={{
              padding: "10px 0",
              minHeight: 44,
              borderBottom: i < saldoAkun.length - 1 ? "1px solid #F0F7EE" : "none",
            }}
          >
            <span className="text-[13px] text-[#374040]">{akun.nama}</span>
            <span className="text-[13px] font-bold tabular-nums text-[#1C2517]">
              {fmt(akun.saldo)}
            </span>
          </div>
        ))}
      </div>

      {/* 4 · Chart */}
      <div
        className="bg-white rounded-xl"
        style={{ border: "1px solid #E2E8DE", padding: "14px 14px 10px" }}
      >
        <p className="text-[13px] font-semibold text-[#1C2517]">Pemasukan vs Pengeluaran</p>
        <p className="text-[11px] text-[#6B7769]" style={{ marginBottom: 10 }}>Jan – Jun 2026</p>
        <div className="flex gap-4" style={{ marginBottom: 10 }}>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full bg-[#3E8A2F]"
              style={{ width: 16, height: 2 }}
            />
            <span className="text-[10px] text-[#6B7769]">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full bg-[#F6B31E]"
              style={{ width: 16, height: 2 }}
            />
            <span className="text-[10px] text-[#6B7769]">Pengeluaran</span>
          </div>
        </div>
        <MobileChart />
      </div>

      {/* 5 · Tunggakan Terbesar – top 3 */}
      <div
        className="bg-white rounded-xl"
        style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}
      >
        <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 12 }}>
          Tunggakan Terbesar
        </p>
        {tunggakanTop3.map((row, i) => {
          const badge = BADGE_STYLE[row.badge] ?? { bg: "#F3F4F6", text: "#374040" };
          return (
            <div
              key={i}
              className="flex items-center gap-2.5"
              style={{
                padding: "10px 0",
                minHeight: 52,
                borderBottom: i < tunggakanTop3.length - 1 ? "1px solid #F0F7EE" : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: "#EDF7EC", color: "#3E8A2F" }}
              >
                {row.inits}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1C2517] leading-none truncate">
                  {row.nama}
                </p>
                <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
                  <span className="text-[10px] text-[#6B7769]">Kelas {row.kelas}</span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {row.badge}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0" style={{ gap: 6 }}>
                <span className="text-[13px] font-bold tabular-nums text-[#DC2626]">
                  {fmtJt(row.jumlah)}
                </span>
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#EDF7EC", border: "none", cursor: "pointer" }}
                >
                  <MessageCircle size={13} color="#3E8A2F" />
                </button>
              </div>
            </div>
          );
        })}
        <button
          className="text-[12px] font-semibold text-[#3E8A2F]"
          style={{
            marginTop: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          Lihat semua →
        </button>
      </div>

      {/* 6 · Absensi Hari Ini */}
      <div
        className="bg-white rounded-xl"
        style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}
      >
        <p className="text-[13px] font-semibold text-[#1C2517]">Absensi Hari Ini</p>
        <p className="text-[11px] text-[#6B7769]" style={{ marginBottom: 14 }}>
          Senin, 13 Juli 2026
        </p>
        <div className="flex items-center gap-3.5">
          <CircularRing value={89} size={88} />
          <div className="flex-1 grid grid-cols-2 gap-2">
            {absensiChips.map((chip, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-[10px] text-center"
                style={{ background: chip.bg, padding: "10px 6px", minHeight: 56 }}
              >
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: 18, color: chip.text }}
                >
                  {chip.value}
                </span>
                <span
                  className="font-medium leading-tight"
                  style={{ fontSize: 9, color: chip.text, marginTop: 3 }}
                >
                  {chip.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
