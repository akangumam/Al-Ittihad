import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Wallet, AlertTriangle, MessageCircle, Banknote } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { fmt, fmtCompact } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";

// ─── data ─────────────────────────────────────────────────────────────────────

const monthlyData = [
  { bulan: "Jul '25", pemasukan: 20_000_000, pengeluaran: 14_500_000 },
  { bulan: "Agu", pemasukan: 22_000_000, pengeluaran: 16_000_000 },
  { bulan: "Sep", pemasukan: 23_000_000, pengeluaran: 17_500_000 },
  { bulan: "Okt", pemasukan: 21_000_000, pengeluaran: 15_200_000 },
  { bulan: "Nov", pemasukan: 22_500_000, pengeluaran: 17_000_000 },
  { bulan: "Des", pemasukan: 19_500_000, pengeluaran: 14_300_000 },
  { bulan: "Jan '26", pemasukan: 24_000_000, pengeluaran: 18_500_000 },
  { bulan: "Feb", pemasukan: 23_000_000, pengeluaran: 17_100_000 },
  { bulan: "Mar", pemasukan: 25_000_000, pengeluaran: 19_200_000 },
  { bulan: "Apr", pemasukan: 22_000_000, pengeluaran: 16_500_000 },
  { bulan: "Mei", pemasukan: 23_500_000, pengeluaran: 18_000_000 },
  { bulan: "Jun", pemasukan: 24_500_000, pengeluaran: 18_200_000 },
];

const piutangData = [
  { name: "Lunas", value: 245, color: "#57A946" },
  { name: "Mencicil", value: 42, color: "#F6B31E" },
  { name: "Belum Bayar", value: 68, color: "#DC2626" },
];

const saldoAkun = [
  { nama: "Bank BSI", saldo: 85_200_000 },
  { nama: "Bank Mandiri Syariah", saldo: 32_750_000 },
  { nama: "Kas Tunai", saldo: 10_500_000 },
];

const tunggakanData = [
  { nama: "Ahmad Fadhilah Putra", kelas: "9A", jumlah: 3_500_000, badge: "Kritis" },
  { nama: "Siti Rahmawati",       kelas: "8B", jumlah: 2_800_000, badge: "Kritis" },
  { nama: "Rizky Firmansyah",     kelas: "7C", jumlah: 2_100_000, badge: "Kritis" },
  { nama: "Nur Hidayatullah",     kelas: "9D", jumlah: 1_900_000, badge: "Waspada" },
  { nama: "Muhammad Alif Hakim",  kelas: "8A", jumlah: 1_750_000, badge: "Waspada" },
];

const transaksiData = [
  { tanggal: "13 Jul 2026", siswa: "Rizki Amalina",    kategori: "Daftar Ulang", metode: "Transfer", jumlah: 350_000, status: "Lunas" },
  { tanggal: "13 Jul 2026", siswa: "Dian Permatasari", kategori: "PPDB",         metode: "Tunai",    jumlah: 250_000, status: "Lunas" },
  { tanggal: "12 Jul 2026", siswa: "Bagas Prasetyo",   kategori: "PPDB",         metode: "Transfer", jumlah: 175_000, status: "Mencicil" },
  { tanggal: "12 Jul 2026", siswa: "Siti Fatimah Nur", kategori: "Daftar Ulang", metode: "Tunai",    jumlah: 180_000, status: "Lunas" },
  { tanggal: "11 Jul 2026", siswa: "Ardian Kusuma",    kategori: "Daftar Ulang", metode: "QRIS",     jumlah: 350_000, status: "Lunas" },
  { tanggal: "11 Jul 2026", siswa: "Laila Nurjanah",   kategori: "Kelas 9",      metode: "Transfer", jumlah: 150_000, status: "Menunggak" },
  { tanggal: "10 Jul 2026", siswa: "Fajar Setiawan",   kategori: "Daftar Ulang", metode: "Tunai",    jumlah: 350_000, status: "Lunas" },
  { tanggal: "10 Jul 2026", siswa: "Annisa Rahayu",    kategori: "Kelas 9",      metode: "Transfer", jumlah: 120_000, status: "Lunas" },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  iconBg,
  compare,
  compareDir,
  colorBad,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  compare?: string;
  /** "up" = ↗, "down" = ↘ — follows the sign of the number */
  compareDir?: "up" | "down" | "neutral";
  /** When true, an up arrow is bad (red); down arrow is good (green) */
  colorBad?: boolean;
  valueColor?: string;
}) {
  const ArrowIcon =
    compareDir === "up"
      ? ArrowUpRight
      : compareDir === "down"
      ? ArrowDownRight
      : Minus;

  const arrowColor =
    !compareDir || compareDir === "neutral"
      ? "text-[#9CA3A0]"
      : compareDir === "up"
      ? (colorBad ? "text-[#DC2626]" : "text-[#3E8A2F]")
      : (colorBad ? "text-[#3E8A2F]" : "text-[#DC2626]");

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col gap-4" style={{ border: "1px solid #E2E8DE" }}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-[#6B7769] font-medium mb-1">{label}</p>
        <p
          className={`text-xl font-bold tabular-nums tracking-tight ${valueColor ?? "text-[#1C2517]"}`}
        >
          {value}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <ArrowIcon size={13} className={arrowColor} />
        {compare ? (
          <span className={arrowColor + " font-semibold"}>{compare}</span>
        ) : (
          <span className="text-[#9CA3A0]">—</span>
        )}
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
            <p className="tabular-nums font-bold text-[#1C2517] tracking-tight text-right">
              {fmt(akun.saldo)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomeExpenseChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 520, H = 208;
  const ML = 48, MR = 8, MT = 8, MB = 36;
  const cW = W - ML - MR;
  const cH = H - MT - MB;
  const MAX = 30_000_000;

  const xOf = (i: number) => ML + (i / (monthlyData.length - 1)) * cW;
  const yOf = (v: number) => MT + cH * (1 - v / MAX);

  const mkPath = (key: "pemasukan" | "pengeluaran") =>
    monthlyData
      .map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`)
      .join(" ");

  const yTicks = [0, 10_000_000, 20_000_000, 30_000_000];

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <p className="text-sm font-semibold text-[#1C2517] mb-0.5">Pemasukan vs Pengeluaran</p>
      <p className="text-xs text-[#6B7769] mb-3">Jul 2025 – Jun 2026</p>

      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-[2px] rounded-full inline-block bg-[#3E8A2F]" />
          <span className="text-xs text-[#6B7769]">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-[2px] rounded-full inline-block bg-[#F6B31E]" />
          <span className="text-xs text-[#6B7769]">Pengeluaran</span>
        </div>
      </div>

      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* Y grid + labels */}
          {yTicks.map((t, ti) => (
            <g key={`ytick-${ti}`}>
              <line
                x1={ML} x2={W - MR}
                y1={yOf(t)} y2={yOf(t)}
                stroke="#E2E8DE" strokeDasharray={t === 0 ? "0" : "4 3"}
              />
              <text
                x={ML - 5} y={yOf(t)}
                textAnchor="end" dominantBaseline="middle"
                fill="#9CA3A0" fontSize={9} fontFamily="Space Grotesk"
              >
                {fmtCompact(t)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {monthlyData.map((d, i) => (
            <text
              key={`xlabel-${i}`}
              x={xOf(i)} y={H - MB + 14}
              textAnchor="middle" fill="#9CA3A0"
              fontSize={9} fontFamily="Space Grotesk"
            >
              {d.bulan}
            </text>
          ))}

          {/* Lines */}
          <path d={mkPath("pemasukan")} fill="none" stroke="#3E8A2F" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={mkPath("pengeluaran")} fill="none" stroke="#F6B31E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover vertical guide */}
          {hovered !== null && (
            <line
              x1={xOf(hovered)} x2={xOf(hovered)}
              y1={MT} y2={H - MB}
              stroke="#D1D5DB" strokeWidth={1}
            />
          )}

          {/* Dots */}
          {monthlyData.map((d, i) => (
            <g key={`dots-${i}`}>
              <circle cx={xOf(i)} cy={yOf(d.pemasukan)} r={hovered === i ? 5 : 3} fill="#3E8A2F" />
              <circle cx={xOf(i)} cy={yOf(d.pengeluaran)} r={hovered === i ? 5 : 3} fill="#F6B31E" />
            </g>
          ))}

          {/* Hit areas per column (transparent) */}
          {monthlyData.map((_d, i) => (
            <rect
              key={`hit-${i}`}
              x={xOf(i) - 18} y={MT}
              width={36} height={cH}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </svg>

        {/* Floating tooltip */}
        {hovered !== null && (() => {
          const d = monthlyData[hovered];
          const pct = (xOf(hovered) / W) * 100;
          const flipLeft = hovered >= monthlyData.length - 4;
          return (
            <div
              className="absolute top-2 pointer-events-none bg-white rounded-xl shadow-lg px-3 py-2.5 z-10 whitespace-nowrap"
              style={{
                border: "1px solid #E2E8DE",
                left: flipLeft ? undefined : `${pct}%`,
                right: flipLeft ? `${100 - pct}%` : undefined,
                transform: flipLeft ? "translateX(18px)" : "translateX(5%)",
              }}
            >
              <p className="text-[11px] font-semibold text-[#1C2517] mb-1.5">{d.bulan}</p>
              <div className="flex items-center gap-1.5 text-[11px] mb-1">
                <span className="w-2 h-2 rounded-full bg-[#3E8A2F] shrink-0" />
                <span className="text-[#6B7769]">Pemasukan</span>
                <span className="font-semibold tabular-nums ml-1">{fmt(d.pemasukan)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#F6B31E] shrink-0" />
                <span className="text-[#6B7769]">Pengeluaran</span>
                <span className="font-semibold tabular-nums ml-1">{fmt(d.pengeluaran)}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}


function PiutangDonut() {
  const total = piutangData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#1C2517]">Status Piutang</p>
        <p className="text-xs text-[#6B7769]">Tahun Ajaran 2025/2026</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={piutangData}
              cx={75}
              cy={75}
              innerRadius={50}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
            >
              {piutangData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#1C2517] tabular-nums">{total}</span>
            <span className="text-[10px] text-[#6B7769]">Siswa</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {piutangData.map((d, i) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs font-medium text-[#374040]">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[#1C2517]">{d.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E2E8DE] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 110 }: { value: number; size?: number }) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E2E8DE"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#3E8A2F"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1C2517] tabular-nums">{value}%</span>
        <span className="text-[10px] text-[#6B7769]">Hadir</span>
      </div>
    </div>
  );
}

function AbsensiGuru() {
  const chips = [
    { label: "Hadir", value: 34, color: "#DCFCE7", text: "#166534" },
    { label: "Izin", value: 2, color: "#FEF3C7", text: "#92400E" },
    { label: "Alpa", value: 1, color: "#FEE2E2", text: "#991B1B" },
    { label: "Belum Absen", value: 1, color: "#F3F4F6", text: "#374151" },
  ];

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
      <p className="text-sm font-semibold text-[#1C2517] mb-1">Absensi Guru Hari Ini</p>
      <p className="text-xs text-[#6B7769] mb-5">Senin, 13 Juli 2026</p>

      <div className="flex items-center gap-6">
        <CircularProgress value={89} size={110} />
        <div className="flex-1 grid grid-cols-2 gap-2">
          {chips.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
              style={{ background: c.color }}
            >
              <span className="tabular-nums font-bold text-xl" style={{ color: c.text }}>
                {c.value}
              </span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: c.text }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
        <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide mb-2">
          Belum Absen
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#1C2517]">Ust. Ahmad Zaki</p>
          <button className="text-xs font-semibold text-[#3E8A2F] hover:underline">
            Input absensi →
          </button>
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

      <div className="space-y-0">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-2 mb-2" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide">Nama / Kelas</span>
          <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide text-right">Jumlah</span>
          <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide">Status</span>
          <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide text-center">WA</span>
        </div>

        {tunggakanData.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-2.5"
            style={{ borderBottom: i < tunggakanData.length - 1 ? "1px solid #F0F7EE" : "none" }}
          >
            <div>
              <p className="text-sm font-medium text-[#1C2517] leading-none">{row.nama}</p>
              <p className="text-[10px] text-[#6B7769] mt-0.5">Kelas {row.kelas}</p>
            </div>
            <p className="tabular-nums text-sm font-bold text-[#DC2626] text-right whitespace-nowrap">
              {fmt(row.jumlah)}
            </p>
            <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} />
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#DCFCE7] transition-colors"
              title="Kirim WhatsApp"
            >
              <MessageCircle size={14} className="text-[#3E8A2F]" />
            </button>
          </div>
        ))}
      </div>
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
        <button className="text-xs font-semibold text-[#3E8A2F] hover:underline">
          Lihat semua
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              {["Tanggal", "Siswa", "Kategori", "Metode", "Jumlah", "Status Tagihan"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transaksiData.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-[#FAFBF9] transition-colors"
                style={{ borderBottom: i < transaksiData.length - 1 ? "1px solid #F0F7EE" : "none" }}
              >
                <td className="py-3 pr-4 text-xs text-[#6B7769] whitespace-nowrap">{row.tanggal}</td>
                <td className="py-3 pr-4 text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.siswa}</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#F5F9F4] text-[#374040] font-medium">
                    {row.kategori}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-[#6B7769]">{row.metode}</td>
                <td className="py-3 pr-4 text-sm font-bold tabular-nums text-[#1C2517] whitespace-nowrap">
                  {fmt(row.jumlah)}
                </td>
                <td className="py-3">
                  <StatusBadge status={row.status as "Lunas" | "Mencicil" | "Menunggak"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-5">
      {/* Greeting */}
      <p className="text-sm text-[#6B7769]">
        Selamat datang,{" "}
        <span className="font-semibold text-[#1C2517]">Admin Keuangan</span>
        {" "}—{" "}
        <span>Senin, 13 Juli 2026</span>
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Pemasukan"
          value={fmt(24_500_000)}
          iconBg="#DCFCE7"
          icon={<TrendingUp size={18} className="text-[#3E8A2F]" />}
          compare="+4,2%"
          compareDir="up"
        />
        <KpiCard
          label="Total Pengeluaran"
          value={fmt(18_200_000)}
          iconBg="#FEF3C7"
          icon={<Banknote size={18} className="text-[#92400E]" />}
          compare="+1,1%"
          compareDir="up"
          colorBad={true}
        />
        <KpiCard
          label="Saldo Kas"
          value={fmt(128_450_000)}
          iconBg="#E8F5E9"
          icon={<Wallet size={18} className="text-[#57A946]" />}
          compareDir="neutral"
        />
        <KpiCard
          label="Total Tunggakan"
          value={fmt(45_200_000)}
          iconBg="#FEE2E2"
          icon={<AlertTriangle size={18} className="text-[#DC2626]" />}
          compare="+8,3%"
          compareDir="up"
          colorBad={true}
          valueColor="text-[#DC2626]"
        />
      </div>

      {/* Saldo per Akun */}
      <SaldoAkunCard />

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <IncomeExpenseChart />
        <PiutangDonut />
      </div>

      {/* Absensi + Tunggakan */}
      <div className="grid grid-cols-2 gap-4">
        <AbsensiGuru />
        <TunggakanTable />
      </div>

      {/* Transaksi Terbaru */}
      <TransaksiTerbaru />
    </div>
  );
}
