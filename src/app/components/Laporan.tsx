import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BookOpen, Banknote, Scale, ArrowUpDown, AlertTriangle,
  CalendarDays, Download,
} from "lucide-react";
import { toast } from "sonner";
import { fmt } from "@/lib/formatters";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { akunData } from "@/data/keuangan";
import { SALDO_AWAL, BOS_KOMPONEN } from "@/data/laporan";
import { absensiRekapData } from "@/data/absensi";

// ─── shared ───────────────────────────────────────────────────────────────────

interface ReportMeta {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  nama: string;
  deskripsi: string;
}

const REPORTS: ReportMeta[] = [
  { id: "bku",       icon: BookOpen,      iconBg: "#EDF7EC", iconColor: "#3E8A2F", nama: "Buku Kas Umum (BKU)",             deskripsi: "Rekap seluruh transaksi kas per periode"   },
  { id: "bos",       icon: Banknote,      iconBg: "#DBEAFE", iconColor: "#1E40AF", nama: "Laporan Dana BOS",                deskripsi: "Realisasi penggunaan dana BOS"             },
  { id: "neraca",    icon: Scale,         iconBg: "#EDE9FE", iconColor: "#5B21B6", nama: "Neraca Keuangan",                 deskripsi: "Posisi aset dan kewajiban"                 },
  { id: "kas",       icon: ArrowUpDown,   iconBg: "#DCFCE7", iconColor: "#166534", nama: "Laporan Pemasukan & Pengeluaran", deskripsi: "Ringkasan arus kas per kategori"           },
  { id: "tunggakan", icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626", nama: "Rekap Tunggakan",                 deskripsi: "Snapshot tunggakan per periode"            },
  { id: "absensi",   icon: CalendarDays,  iconBg: "#FEF3C7", iconColor: "#92400E", nama: "Rekap Absensi Guru",              deskripsi: "Kehadiran guru per bulan"                  },
];

function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function ReportCard({ r, selected, onSelect }: { r: ReportMeta; selected: boolean; onSelect: () => void }) {
  const Icon = r.icon;
  return (
    <button onClick={onSelect}
      className="text-left bg-white rounded-xl p-5 flex flex-col gap-3 transition-all"
      style={{ border: selected ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        boxShadow: selected ? "0 0 0 3px rgba(62,138,47,0.10)" : undefined }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.iconBg }}>
        <Icon size={17} style={{ color: r.iconColor }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#1C2517] leading-snug mb-1">{r.nama}</p>
        <p className="text-xs text-[#6B7769]">{r.deskripsi}</p>
      </div>
      <p className="text-[11px] text-[#9CA3A0]">Dibuat: {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date())}</p>
    </button>
  );
}

function ReportToolbar({
  title, subtitle, children, csvRows, csvFilename,
}: {
  title: string; subtitle: string; children?: React.ReactNode;
  csvRows?: (string | number)[][]; csvFilename?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
      <div>
        <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>{title}</p>
        <p className="text-xs text-[#6B7769] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        <button
          onClick={() => csvRows && csvFilename && downloadCSV(csvFilename, csvRows)}
          disabled={!csvRows}
          title={csvRows ? `Unduh ${csvFilename}` : "Data tidak tersedia"}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ border: "1px solid #E2E8DE" }}
        >
          <Download size={13} />
          Excel
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors"
        >
          <Download size={13} />
          PDF
        </button>
      </div>
    </div>
  );
}

function KpiChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl px-3.5 sm:px-5 py-3 sm:py-4 flex flex-col gap-0.5 sm:gap-1" style={{ border: "1px solid #E2E8DE" }}>
      <span className="text-[11px] sm:text-xs text-[#6B7769] leading-tight truncate">{label}</span>
      <span className="text-base sm:text-lg font-bold tabular-nums tracking-tight truncate" style={{ color: color ?? "#1C2517" }}>{value}</span>
    </div>
  );
}

function PrintCaption() {
  const today = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
  return (
    <div className="px-6 py-3" style={{ borderTop: "1px solid #E2E8DE" }}>
      <p className="text-[11px] text-[#9CA3A0] italic">Dicetak dari Sistem Manajemen MTs Al-Ittihad — {today}</p>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtTgl(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
}

function metodeToAkun(m: string) { return m === "Tunai" ? "Kas Tunai" : "Bank BSI"; }

// ─── 1. BKU ───────────────────────────────────────────────────────────────────

function BKUPreview() {
  const { transaksiList, siswaList, manualTransaksiList } = useAppContext();
  const todayStr = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
  const currentMonth = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(new Date());

  type BKURow = { no: number; tanggal: string; tanggalRaw: string; uraian: string; ref: string; debit: number | null; kredit: number | null; saldo: number };

  const rows = useMemo((): BKURow[] => {
    type Pre = Omit<BKURow, "no" | "saldo">;
    const pre: Pre[] = [];
    transaksiList.forEach(t => {
      const siswa = siswaList.find(s => s.nis === t.nis);
      pre.push({ tanggal: fmtTgl(t.tanggal), tanggalRaw: t.tanggal, uraian: `Pembayaran ${siswa?.nama ?? t.nis}`, ref: t.nomorKuitansi, debit: t.nominal, kredit: null });
    });
    manualTransaksiList.forEach(t => pre.push({ tanggal: fmtTgl(t.tanggal), tanggalRaw: t.tanggal, uraian: t.keterangan, ref: t.ref, debit: t.tipe === "masuk" ? t.jumlah : null, kredit: t.tipe === "keluar" ? t.jumlah : null }));
    pre.sort((a, b) => a.tanggalRaw.localeCompare(b.tanggalRaw));
    let saldo = SALDO_AWAL;
    return pre.map((r, i) => { saldo += (r.debit ?? 0) - (r.kredit ?? 0); return { ...r, no: i + 1, saldo }; });
  }, [transaksiList, siswaList, manualTransaksiList]);

  const totalDebit  = rows.reduce((s, r) => s + (r.debit  ?? 0), 0);
  const totalKeluar = rows.reduce((s, r) => s + (r.kredit ?? 0), 0);

  const csvRows = useMemo((): (string | number)[][] => [
    ["No", "Tanggal", "Uraian", "Referensi", "Debit (Rp)", "Kredit (Rp)", "Saldo (Rp)"],
    ...rows.map(r => [r.no, r.tanggal, r.uraian, r.ref, r.debit ?? 0, r.kredit ?? 0, r.saldo]),
  ], [rows]);

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      <ReportToolbar title="Buku Kas Umum" subtitle="Laporan kas masuk dan keluar per periode" csvRows={csvRows} csvFilename={`BKU-${currentMonth}.csv`}>
        <span className="text-sm text-[#6B7769] px-2">1–31 {currentMonth}</span>
      </ReportToolbar>
      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4 w-10">No</Th>
              <Th className="pr-4">Tanggal</Th>
              <Th className="pr-4">Uraian</Th>
              <Th className="pr-4">Ref</Th>
              <Th align="right" className="pr-4">Debit</Th>
              <Th align="right" className="pr-4">Kredit</Th>
              <Th align="right" className="pr-6">Saldo</Th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #F0F7EE", background: "#FAFBF9" }}>
              <td className="py-3 pl-6 pr-4" />
              <td className="py-3 pr-4 text-sm text-[#9CA3A0]">1 {currentMonth}</td>
              <td className="py-3 pr-4"><span className="text-sm italic text-[#9CA3A0]">Saldo Awal</span></td>
              <td className="py-3 pr-4 text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-4 text-right text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-4 text-right text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-6 text-right"><span className="text-sm font-bold tabular-nums text-[#9CA3A0]">{fmt(SALDO_AWAL)}</span></td>
            </tr>
            {rows.map(row => (
              <tr key={row.no} className="hover:bg-[#FAFBF9] transition-colors" style={{ borderBottom: "1px solid #F0F7EE" }}>
                <td className="py-3.5 pl-6 pr-4 text-sm tabular-nums text-[#9CA3A0]">{row.no}</td>
                <td className="py-3.5 pr-4 text-sm text-[#6B7769] whitespace-nowrap">{row.tanggal}</td>
                <td className="py-3.5 pr-4 text-sm font-medium text-[#1C2517]">{row.uraian}</td>
                <td className="py-3.5 pr-4">
                  {row.ref !== "—" ? <code className="text-[11px] text-[#6B7769] bg-[#F5F9F4] px-1.5 py-0.5 rounded">{row.ref}</code> : <span className="text-sm text-[#D1D5DB]">—</span>}
                </td>
                <td className="py-3.5 pr-4 text-right">{row.debit !== null ? <span className="text-sm tabular-nums text-[#3E8A2F]">{fmt(row.debit)}</span> : <span className="text-sm text-[#D1D5DB]">—</span>}</td>
                <td className="py-3.5 pr-4 text-right">{row.kredit !== null ? <span className="text-sm tabular-nums text-[#DC2626]">{fmt(row.kredit)}</span> : <span className="text-sm text-[#D1D5DB]">—</span>}</td>
                <td className="py-3.5 pr-6 text-right"><span className="text-sm font-bold tabular-nums text-[#1C2517]">{fmt(row.saldo)}</span></td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #E2E8DE" }}>
              <td className="py-3.5 pl-6 pr-4" />
              <td className="py-3.5 pr-4 text-sm font-semibold text-[#1C2517] whitespace-nowrap">{todayStr}</td>
              <td className="py-3.5 pr-4"><span className="text-sm font-bold text-[#1C2517]">Saldo Akhir</span></td>
              <td className="py-3.5 pr-4" />
              <td className="py-3.5 pr-4 text-right"><span className="text-sm font-bold tabular-nums text-[#3E8A2F]">{fmt(totalDebit)}</span></td>
              <td className="py-3.5 pr-4 text-right"><span className="text-sm font-bold tabular-nums text-[#DC2626]">{fmt(totalKeluar)}</span></td>
              <td className="py-3.5 pr-6 text-right"><span className="text-sm font-bold tabular-nums text-[#1C2517]">{fmt(SALDO_AWAL + totalDebit - totalKeluar)}</span></td>
            </tr>
          </tbody>
        </DataTable>
      </div>
      <PrintCaption />
    </div>
  );
}

// ─── 2. Dana BOS ─────────────────────────────────────────────────────────────

function BosPreview() {
  const totalAnggaran  = BOS_KOMPONEN.reduce((s, k) => s + k.anggaran,  0);
  const totalRealisasi = BOS_KOMPONEN.reduce((s, k) => s + k.realisasi, 0);
  const sisa = totalAnggaran - totalRealisasi;
  const pctTotal = Math.round((totalRealisasi / totalAnggaran) * 100);

  const csvRows: (string | number)[][] = [
    ["Komponen BOS", "Anggaran (Rp)", "Realisasi (Rp)", "Sisa (Rp)", "% Realisasi"],
    ...BOS_KOMPONEN.map(k => [k.komponen, k.anggaran, k.realisasi, k.anggaran - k.realisasi, totalAnggaran > 0 ? Math.round((k.realisasi / k.anggaran) * 100) : 0]),
    ["TOTAL", totalAnggaran, totalRealisasi, sisa, pctTotal],
  ];

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiChip label="Dana BOS Diterima"   value={fmt(totalAnggaran)}  color="#1E40AF" />
        <KpiChip label="Total Direalisasi"   value={fmt(totalRealisasi)} color="#3E8A2F" />
        <KpiChip label="Sisa Anggaran"       value={fmt(sisa)}           color="#374040" />
        <KpiChip label="Tingkat Serapan"     value={`${pctTotal}%`}      color={pctTotal >= 80 ? "#DC2626" : pctTotal >= 60 ? "#D97706" : "#3E8A2F"} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <ReportToolbar title="Laporan Dana BOS" subtitle={`Triwulan III TA 2025/2026 — serapan ${pctTotal}%`} csvRows={csvRows} csvFilename="Dana-BOS.csv" />
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4 w-10">No</Th>
                <Th className="pr-4">Komponen Kegiatan</Th>
                <Th align="right" className="pr-4">Anggaran</Th>
                <Th align="right" className="pr-4">Realisasi</Th>
                <Th align="right" className="pr-4">Sisa</Th>
                <Th className="pr-6">Serapan</Th>
              </tr>
            </thead>
            <tbody>
              {BOS_KOMPONEN.map((k, i) => {
                const pct = k.anggaran > 0 ? Math.round((k.realisasi / k.anggaran) * 100) : 0;
                const barColor = pct >= 100 ? "#DC2626" : pct >= 75 ? "#D97706" : "#3E8A2F";
                return (
                  <tr key={k.id} className="hover:bg-[#FAFBF9] transition-colors"
                    style={{ borderBottom: i < BOS_KOMPONEN.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                    <td className="py-3.5 pl-6 pr-4 text-sm text-[#9CA3A0] tabular-nums">{k.id}</td>
                    <td className="py-3.5 pr-4 text-sm font-medium text-[#1C2517]">{k.komponen}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#374040]">{fmt(k.anggaran)}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-semibold text-[#3E8A2F]">{k.realisasi > 0 ? fmt(k.realisasi) : <span className="text-[#D1D5DB]">—</span>}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#6B7769]">{fmt(k.anggaran - k.realisasi)}</td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F0F7EE] min-w-[60px]">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                        </div>
                        <span className="text-xs tabular-nums font-semibold min-w-[32px]" style={{ color: barColor }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #E2E8DE", background: "#FAFBF9" }}>
                <td className="py-3.5 pl-6 pr-4" />
                <td className="py-3.5 pr-4 text-sm font-bold text-[#1C2517]">Total</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#1C2517]">{fmt(totalAnggaran)}</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#3E8A2F]">{fmt(totalRealisasi)}</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#374040]">{fmt(sisa)}</td>
                <td className="py-3.5 pr-6 text-sm font-bold tabular-nums" style={{ color: pctTotal >= 80 ? "#DC2626" : pctTotal >= 60 ? "#D97706" : "#3E8A2F" }}>{pctTotal}%</td>
              </tr>
            </tfoot>
          </DataTable>
        </div>
        <PrintCaption />
      </div>
    </div>
  );
}

// ─── 3. Neraca ────────────────────────────────────────────────────────────────

function NeracaPreview() {
  const { transaksiList, tagihanList, siswaList, manualTransaksiList } = useAppContext();

  const { aset, ekuitas, piutang } = useMemo(() => {
    // Compute current saldo per akun
    const computed = akunData.map(akun => {
      const deltaMasuk = transaksiList.reduce((s, t) => metodeToAkun(t.metode) === akun.nama ? s + t.nominal : s, 0);
      const deltaManualMasuk = manualTransaksiList.filter(t => t.akun === akun.nama && t.tipe === "masuk").reduce((s, t) => s + t.jumlah, 0);
      const deltaManualKeluar = manualTransaksiList.filter(t => t.akun === akun.nama && t.tipe === "keluar").reduce((s, t) => s + t.jumlah, 0);
      return { ...akun, current: akun.saldo + deltaMasuk + deltaManualMasuk - deltaManualKeluar };
    });

    // Piutang: unpaid tagihan from active students
    const activeNis = new Set(siswaList.filter(s => s.status === "Aktif").map(s => s.nis));
    const piutang = tagihanList
      .filter(t => activeNis.has(t.nis) && !t.isLunas && t.nominal > t.terbayar)
      .reduce((s, t) => s + (t.nominal - t.terbayar), 0);

    const totalAset = computed.reduce((s, a) => s + a.current, 0) + piutang;

    // Surplus/defisit from all transactions
    const allMasuk = transaksiList.reduce((s, t) => s + t.nominal, 0)
      + manualTransaksiList.filter(t => t.tipe === "masuk").reduce((s, t) => s + t.jumlah, 0);
    const allKeluar = manualTransaksiList.filter(t => t.tipe === "keluar").reduce((s, t) => s + t.jumlah, 0);
    const surplus = allMasuk - allKeluar;

    return { aset: computed, ekuitas: { modalAwal: SALDO_AWAL, surplus, total: SALDO_AWAL + surplus }, piutang, totalAset };
  }, [transaksiList, tagihanList, siswaList, manualTransaksiList]);

  const totalAset = aset.reduce((s, a) => s + a.current, 0) + piutang;

  const csvRows: (string | number)[][] = [
    ["Keterangan", "Nilai (Rp)"],
    ["ASET", ""],
    ...aset.map(a => [`  ${a.nama}`, a.current]),
    ["  Piutang Siswa", piutang],
    ["Total Aset", totalAset],
    ["KEWAJIBAN & EKUITAS", ""],
    ["  Modal Awal", ekuitas.modalAwal],
    ["  Surplus / (Defisit)", ekuitas.surplus],
    ["Total Kewajiban & Ekuitas", totalAset],
  ];

  function AsetRow({ label, value, indent }: { label: string; value: number; indent?: boolean }) {
    return (
      <div className={`flex items-center justify-between py-2.5 ${indent ? "pl-6" : ""}`} style={{ borderBottom: "1px solid #F5F9F4" }}>
        <span className={`text-sm ${indent ? "text-[#374040]" : "font-semibold text-[#1C2517]"}`}>{label}</span>
        <span className="text-sm tabular-nums font-semibold text-[#1C2517]">{fmt(value)}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      <ReportToolbar title="Neraca Keuangan" subtitle="Posisi aset, kewajiban, dan ekuitas" csvRows={csvRows} csvFilename="Neraca-Keuangan.csv" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "#E2E8DE" }}>
        {/* ASET */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#9CA3A0] uppercase tracking-widest mb-4">Aset</p>
          <p className="text-xs font-semibold text-[#6B7769] mb-2">Aset Lancar</p>
          {aset.map(a => <AsetRow key={a.id} label={a.nama} value={a.current} indent />)}
          <AsetRow label="Piutang Siswa" value={piutang} indent />
          <div className="flex items-center justify-between py-3 mt-2" style={{ borderTop: "2px solid #E2E8DE" }}>
            <span className="text-sm font-bold text-[#1C2517]">Total Aset</span>
            <span className="text-base font-bold tabular-nums text-[#1C2517]">{fmt(totalAset)}</span>
          </div>
        </div>

        {/* KEWAJIBAN & EKUITAS */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#9CA3A0] uppercase tracking-widest mb-4">Kewajiban &amp; Ekuitas</p>
          <p className="text-xs font-semibold text-[#6B7769] mb-2">Kewajiban</p>
          <div className="flex items-center justify-between py-2.5 pl-6" style={{ borderBottom: "1px solid #F5F9F4" }}>
            <span className="text-sm text-[#374040]">Kewajiban Jangka Pendek</span>
            <span className="text-sm tabular-nums text-[#D1D5DB]">—</span>
          </div>
          <p className="text-xs font-semibold text-[#6B7769] mt-4 mb-2">Ekuitas</p>
          <div className="flex items-center justify-between py-2.5 pl-6" style={{ borderBottom: "1px solid #F5F9F4" }}>
            <span className="text-sm text-[#374040]">Modal Awal</span>
            <span className="text-sm tabular-nums font-semibold text-[#1C2517]">{fmt(ekuitas.modalAwal)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 pl-6" style={{ borderBottom: "1px solid #F5F9F4" }}>
            <span className="text-sm text-[#374040]">Surplus / (Defisit)</span>
            <span className={`text-sm tabular-nums font-semibold ${ekuitas.surplus >= 0 ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
              {ekuitas.surplus >= 0 ? "+" : "−"}{fmt(Math.abs(ekuitas.surplus))}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 mt-2" style={{ borderTop: "2px solid #E2E8DE" }}>
            <span className="text-sm font-bold text-[#1C2517]">Total Kewajiban &amp; Ekuitas</span>
            <span className="text-base font-bold tabular-nums text-[#1C2517]">{fmt(totalAset)}</span>
          </div>
        </div>
      </div>
      <PrintCaption />
    </div>
  );
}

// ─── 4. Pemasukan & Pengeluaran ───────────────────────────────────────────────

function KasPreview() {
  const { transaksiList, tagihanList, manualTransaksiList } = useAppContext();

  const { byKategori, totalMasuk, totalKeluar } = useMemo(() => {
    const map = new Map<string, { masuk: number; keluar: number }>();
    function add(kat: string, tipe: "masuk" | "keluar", jumlah: number) {
      const prev = map.get(kat) ?? { masuk: 0, keluar: 0 };
      map.set(kat, tipe === "masuk" ? { ...prev, masuk: prev.masuk + jumlah } : { ...prev, keluar: prev.keluar + jumlah });
    }

    transaksiList.forEach(t => {
      const firstAlokasi = t.alokasi?.[0];
      const tagihan = firstAlokasi ? tagihanList.find(tg => tg.id === firstAlokasi.tagihanId) : undefined;
      const kat = tagihan?.kategori ?? "Pembayaran Siswa";
      add(kat, "masuk", t.nominal);
    });
    manualTransaksiList.forEach(t => add(t.kategori, t.tipe, t.jumlah));

    const rows = [...map.entries()].map(([kat, v]) => ({ kat, ...v, net: v.masuk - v.keluar }))
      .sort((a, b) => (b.masuk + b.keluar) - (a.masuk + a.keluar));

    const totalMasuk  = rows.reduce((s, r) => s + r.masuk,  0);
    const totalKeluar = rows.reduce((s, r) => s + r.keluar, 0);
    return { byKategori: rows, totalMasuk, totalKeluar };
  }, [transaksiList, tagihanList, manualTransaksiList]);

  const net = totalMasuk - totalKeluar;
  const maxVal = Math.max(...byKategori.map(r => Math.max(r.masuk, r.keluar)));

  const csvRows: (string | number)[][] = [
    ["Kategori", "Pemasukan (Rp)", "Pengeluaran (Rp)", "Selisih (Rp)"],
    ...byKategori.map(r => [r.kat, r.masuk, r.keluar, r.net]),
    ["TOTAL", totalMasuk, totalKeluar, net],
  ];

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiChip label="Total Pemasukan"  value={fmt(totalMasuk)}  color="#3E8A2F" />
        <KpiChip label="Total Pengeluaran" value={fmt(totalKeluar)} color="#DC2626" />
        <KpiChip label="Selisih Bersih"   value={`${net >= 0 ? "+" : "−"}${fmt(Math.abs(net))}`} color={net >= 0 ? "#3E8A2F" : "#DC2626"} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <ReportToolbar title="Laporan Pemasukan & Pengeluaran" subtitle="Ringkasan per kategori" csvRows={csvRows} csvFilename="Laporan-Arus-Kas.csv" />
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4">Kategori</Th>
                <Th align="right" className="pr-4">Pemasukan</Th>
                <Th align="right" className="pr-4">Pengeluaran</Th>
                <Th align="right" className="pr-4">Selisih</Th>
                <Th className="pr-6">Proporsi</Th>
              </tr>
            </thead>
            <tbody>
              {byKategori.map((r, i) => (
                <tr key={r.kat} className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < byKategori.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                  <td className="py-3.5 pl-6 pr-4 text-sm font-medium text-[#1C2517]">{r.kat}</td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#3E8A2F] font-semibold">{r.masuk > 0 ? fmt(r.masuk) : <span className="text-[#D1D5DB]">—</span>}</td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#DC2626] font-semibold">{r.keluar > 0 ? fmt(r.keluar) : <span className="text-[#D1D5DB]">—</span>}</td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold" style={{ color: r.net >= 0 ? "#3E8A2F" : "#DC2626" }}>
                    {r.net >= 0 ? "+" : "−"}{fmt(Math.abs(r.net))}
                  </td>
                  <td className="py-3.5 pr-6">
                    <div className="flex items-center gap-1.5">
                      {r.masuk > 0 && (
                        <div className="h-2 rounded-full bg-[#3E8A2F]" style={{ width: `${Math.round((r.masuk / maxVal) * 80)}px` }} />
                      )}
                      {r.keluar > 0 && (
                        <div className="h-2 rounded-full bg-[#DC2626]" style={{ width: `${Math.round((r.keluar / maxVal) * 80)}px` }} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #E2E8DE", background: "#FAFBF9" }}>
                <td className="py-3.5 pl-6 pr-4 text-sm font-bold text-[#1C2517]">Total</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#3E8A2F]">{fmt(totalMasuk)}</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#DC2626]">{fmt(totalKeluar)}</td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold" style={{ color: net >= 0 ? "#3E8A2F" : "#DC2626" }}>
                  {net >= 0 ? "+" : "−"}{fmt(Math.abs(net))}
                </td>
                <td className="py-3.5 pr-6 flex items-center gap-3 text-[10px] text-[#9CA3A0]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3E8A2F] inline-block" /> Masuk</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" /> Keluar</span>
                </td>
              </tr>
            </tfoot>
          </DataTable>
        </div>
        <PrintCaption />
      </div>
    </div>
  );
}

// ─── 5. Rekap Tunggakan ───────────────────────────────────────────────────────

function TunggakanPreview() {
  const { tagihanList, siswaList } = useAppContext();

  const rows = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const activeNis = new Set(siswaList.filter(s => s.status === "Aktif").map(s => s.nis));
    const bySiswa = new Map<string, { totalTagihan: number; totalTerbayar: number; oldestDays: number; oldestDate: string }>();

    tagihanList.forEach(t => {
      if (!activeNis.has(t.nis) || t.isLunas) return;
      const sisa = t.nominal - t.terbayar;
      if (sisa <= 0) return;
      const days = Math.floor((today.getTime() - new Date(t.jatuhTempo).getTime()) / 86_400_000);
      const prev = bySiswa.get(t.nis);
      if (!prev) {
        bySiswa.set(t.nis, { totalTagihan: t.nominal, totalTerbayar: t.terbayar, oldestDays: days, oldestDate: t.jatuhTempo });
      } else {
        bySiswa.set(t.nis, {
          totalTagihan: prev.totalTagihan + t.nominal,
          totalTerbayar: prev.totalTerbayar + t.terbayar,
          oldestDays: Math.max(prev.oldestDays, days),
          oldestDate: days > prev.oldestDays ? t.jatuhTempo : prev.oldestDate,
        });
      }
    });

    return [...bySiswa.entries()].map(([nis, v]) => {
      const siswa = siswaList.find(s => s.nis === nis);
      const sisa = v.totalTagihan - v.totalTerbayar;
      const aging: "Kritis" | "Waspada" | "Perhatian" | "Belum Jatuh Tempo" =
        v.oldestDays > 60 ? "Kritis" : v.oldestDays > 30 ? "Waspada" : v.oldestDays > 0 ? "Perhatian" : "Belum Jatuh Tempo";
      return { nis, nama: siswa?.nama ?? nis, kelas: siswa?.kelas ?? "—", sisa, aging, jatuhTempo: v.oldestDate };
    }).sort((a, b) => b.sisa - a.sisa);
  }, [tagihanList, siswaList]);

  const totalSisa = rows.reduce((s, r) => s + r.sisa, 0);
  const kritis    = rows.filter(r => r.aging === "Kritis").length;
  const waspada   = rows.filter(r => r.aging === "Waspada").length;
  const perhatian = rows.filter(r => r.aging === "Perhatian").length;

  const csvRows: (string | number)[][] = [
    ["Nama Siswa", "Kelas", "Sisa Tagihan (Rp)", "Aging", "Jatuh Tempo"],
    ...rows.map(r => [r.nama, r.kelas, r.sisa, r.aging, r.jatuhTempo]),
    ["TOTAL", "", totalSisa, "", ""],
  ];

  const AGING_STYLE: Record<string, { bg: string; text: string }> = {
    "Kritis":           { bg: "#FEE2E2", text: "#991B1B" },
    "Waspada":          { bg: "#FFEDD5", text: "#9A3412" },
    "Perhatian":        { bg: "#FEF9C3", text: "#713F12" },
    "Belum Jatuh Tempo":{ bg: "#F3F4F6", text: "#374151" },
  };

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiChip label="Total Tunggakan" value={fmt(totalSisa)} color="#DC2626" />
        <KpiChip label="Kritis (60+ hari)" value={String(kritis)} color="#991B1B" />
        <KpiChip label="Waspada (31–60)" value={String(waspada)} color="#9A3412" />
        <KpiChip label="Perhatian (1–30)" value={String(perhatian)} color="#713F12" />
      </div>

      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <ReportToolbar title="Rekap Tunggakan" subtitle={`${rows.length} siswa dengan sisa tagihan — per ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}`} csvRows={csvRows} csvFilename="Rekap-Tunggakan.csv" />
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4">Nama Siswa</Th>
                <Th className="pr-4">Kelas</Th>
                <Th align="right" className="pr-4">Sisa Tagihan</Th>
                <Th className="pr-4">Aging</Th>
                <Th className="pr-6">Jatuh Tempo</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-[#9CA3A0]">Tidak ada tunggakan</td></tr>
              ) : rows.map((r, i) => {
                const style = AGING_STYLE[r.aging] ?? AGING_STYLE["Belum Jatuh Tempo"];
                return (
                  <tr key={r.nis} className="hover:bg-[#FAFBF9] transition-colors"
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                    <td className="py-3.5 pl-6 pr-4">
                      <p className="text-sm font-semibold text-[#1C2517]">{r.nama}</p>
                      <p className="text-xs text-[#9CA3A0] tabular-nums">{r.nis}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-[#6B7769]">{r.kelas}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#DC2626]">{fmt(r.sisa)}</td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: style.bg, color: style.text }}>
                        {r.aging}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-sm text-[#6B7769] tabular-nums whitespace-nowrap">
                      {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(r.jatuhTempo))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid #E2E8DE", background: "#FAFBF9" }}>
                  <td className="py-3.5 pl-6 pr-4 text-sm font-bold text-[#1C2517]">{rows.length} Siswa</td>
                  <td />
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#DC2626]">{fmt(totalSisa)}</td>
                  <td /><td />
                </tr>
              </tfoot>
            )}
          </DataTable>
        </div>
        <PrintCaption />
      </div>
    </div>
  );
}

// ─── 6. Rekap Absensi Guru ───────────────────────────────────────────────────

function hitungHariKerja(year: number, month: number): number {
  const d = new Date(year, month, 1);
  let n = 0;
  while (d.getMonth() === month) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

function AbsensiPreview() {
  const now = new Date();
  const totalHariKerja = hitungHariKerja(now.getFullYear(), now.getMonth());
  const bulanLabel = now.toLocaleString("id-ID", { month: "long", year: "numeric" });
  const avgPct = absensiRekapData.length > 0 ? Math.round(absensiRekapData.reduce((s, r) => s + r.pct, 0) / absensiRekapData.length) : 0;
  const kurang = absensiRekapData.filter(r => r.pct < 80).length;

  const csvRows: (string | number)[][] = [
    ["Nama Guru", "Hadir", "Terlambat", "Izin", "Alpa", "% Kehadiran"],
    ...absensiRekapData.map(g => [g.nama, g.hadir, g.terlambat, g.izin, g.alpa, g.pct]),
  ];

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <KpiChip label="Total Hari Kerja" value={`${totalHariKerja} hari`} />
        <KpiChip label="Rata-rata Kehadiran" value={`${avgPct}%`} color={avgPct >= 80 ? "#3E8A2F" : "#DC2626"} />
        <KpiChip label="Kehadiran < 80%" value={`${kurang} guru`} color={kurang > 0 ? "#DC2626" : "#3E8A2F"} />
      </div>

      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <ReportToolbar title="Rekap Absensi Guru" subtitle={`${bulanLabel} — ${totalHariKerja} hari kerja efektif`} csvRows={csvRows} csvFilename={`Absensi-Guru-${bulanLabel}.csv`}>
          <span className="text-sm text-[#6B7769] px-2">{bulanLabel}</span>
        </ReportToolbar>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4">Nama Guru</Th>
                <Th align="right" className="pr-4">Hadir</Th>
                <Th align="right" className="pr-4">Terlambat</Th>
                <Th align="right" className="pr-4">Izin</Th>
                <Th align="right" className="pr-4">Alpa</Th>
                <Th className="pr-6">% Kehadiran</Th>
              </tr>
            </thead>
            <tbody>
              {absensiRekapData.map((g, i) => {
                const pctColor = g.pct >= 90 ? "#3E8A2F" : g.pct >= 80 ? "#D97706" : "#DC2626";
                return (
                  <tr key={g.id} className="hover:bg-[#FAFBF9] transition-colors"
                    style={{ borderBottom: i < absensiRekapData.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {g.inits}
                        </div>
                        <span className="text-sm font-medium text-[#1C2517]">{g.nama}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-semibold text-[#3E8A2F]">{g.hadir}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#D97706]">{g.terlambat > 0 ? g.terlambat : <span className="text-[#D1D5DB]">—</span>}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#6B7769]">{g.izin > 0 ? g.izin : <span className="text-[#D1D5DB]">—</span>}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-sm text-[#DC2626]">{g.alpa > 0 ? g.alpa : <span className="text-[#D1D5DB]">—</span>}</td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F0F7EE] min-w-[60px]">
                          <div className="h-1.5 rounded-full" style={{ width: `${g.pct}%`, background: pctColor }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums min-w-[34px]" style={{ color: pctColor }}>{g.pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {absensiRekapData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-[#9CA3A0]">Belum ada rekapitulasi absensi guru</td>
                </tr>
              )}
            </tbody>
            {absensiRekapData.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid #E2E8DE", background: "#FAFBF9" }}>
                  <td className="py-3.5 pl-6 pr-4 text-sm font-bold text-[#1C2517]">Rata-rata</td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#3E8A2F]">
                    {Math.round(absensiRekapData.reduce((s, g) => s + g.hadir, 0) / absensiRekapData.length)}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#D97706]">
                    {Math.round(absensiRekapData.reduce((s, g) => s + g.terlambat, 0) / absensiRekapData.length)}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#6B7769]">
                    {Math.round(absensiRekapData.reduce((s, g) => s + g.izin, 0) / absensiRekapData.length)}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-sm font-bold text-[#DC2626]">
                    {Math.round(absensiRekapData.reduce((s, g) => s + g.alpa, 0) / absensiRekapData.length)}
                  </td>
                  <td className="py-3.5 pr-6 text-xs font-bold tabular-nums" style={{ color: avgPct >= 90 ? "#3E8A2F" : avgPct >= 80 ? "#D97706" : "#DC2626" }}>
                    {avgPct}%
                  </td>
                </tr>
              </tfoot>
            )}
          </DataTable>
        </div>
        <PrintCaption />
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Laporan() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const selectedId = tab ?? "bku";
  const selected = REPORTS.find(r => r.id === selectedId) ?? REPORTS[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-[#1C2517]">Laporan</h2>
        <p className="text-sm text-[#6B7769]">Pusat laporan keuangan dan akademik</p>
      </div>

      {/* ── Report picker ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <ReportCard key={r.id} r={r} selected={selectedId === r.id}
            onSelect={() => navigate(`/keuangan/laporan/${r.id}`)} />
        ))}
      </div>

      {/* ── Preview ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest whitespace-nowrap">Pratinjau</p>
          <div className="flex-1 h-px bg-[#E2E8DE]" />
          <span className="text-xs text-[#6B7769] font-medium whitespace-nowrap">{selected.nama}</span>
        </div>

        {selectedId === "bku"       && <BKUPreview />}
        {selectedId === "bos"       && <BosPreview />}
        {selectedId === "neraca"    && <NeracaPreview />}
        {selectedId === "kas"       && <KasPreview />}
        {selectedId === "tunggakan" && <TunggakanPreview />}
        {selectedId === "absensi"   && <AbsensiPreview />}
      </div>
    </div>
  );
}
