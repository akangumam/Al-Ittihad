import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BookOpen, Banknote, Scale, ArrowUpDown, AlertTriangle,
  CalendarDays, Calendar, ChevronDown, Download, FileText,
} from "lucide-react";
import { fmt } from "@/lib/formatters";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── static data ──────────────────────────────────────────────────────────────
import { SALDO_AWAL, BKU_ROWS } from "@/data/laporan";

interface ReportMeta {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  nama: string;
  deskripsi: string;
}

const REPORTS: ReportMeta[] = [
  { id: "bku",       icon: BookOpen,      iconBg: "#EDF7EC", iconColor: "#3E8A2F", nama: "Buku Kas Umum (BKU)",               deskripsi: "Rekap seluruh transaksi kas per periode" },
  { id: "bos",       icon: Banknote,      iconBg: "#DBEAFE", iconColor: "#1E40AF", nama: "Laporan Dana BOS",                   deskripsi: "Realisasi penggunaan dana BOS" },
  { id: "neraca",    icon: Scale,         iconBg: "#EDE9FE", iconColor: "#5B21B6", nama: "Neraca Keuangan",                    deskripsi: "Posisi aset dan kewajiban" },
  { id: "kas",       icon: ArrowUpDown,   iconBg: "#DCFCE7", iconColor: "#166534", nama: "Laporan Pemasukan & Pengeluaran",    deskripsi: "Ringkasan arus kas per kategori" },
  { id: "tunggakan", icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626", nama: "Rekap Tunggakan",                    deskripsi: "Snapshot tunggakan per periode" },
  { id: "absensi",   icon: CalendarDays,  iconBg: "#FEF3C7", iconColor: "#92400E", nama: "Rekap Absensi Guru",                 deskripsi: "Kehadiran guru per bulan" },
];

const AKUN_OPTIONS = ["Semua Akun", "Bank BSI", "Bank Mandiri Syariah", "Kas Tunai"];

// ─── Report picker card ───────────────────────────────────────────────────────

function ReportCard({
  r,
  selected,
  onSelect,
}: {
  r: ReportMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = r.icon;
  return (
    <button
      onClick={onSelect}
      className="text-left bg-white rounded-xl p-5 flex flex-col gap-3 transition-all"
      style={{
        border: selected ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        boxShadow: selected ? "0 0 0 3px rgba(62,138,47,0.10)" : undefined,
      }}
    >
      {/* Icon chip */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: r.iconBg }}
      >
        <Icon size={17} style={{ color: r.iconColor }} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#1C2517] leading-snug mb-1">{r.nama}</p>
        <p className="text-xs text-[#6B7769]">{r.deskripsi}</p>
      </div>

      {/* Footer caption */}
      <p className="text-[11px] text-[#9CA3A0]">Terakhir dibuat: 30 Jun 2026</p>
    </button>
  );
}

// ─── BKU report preview ───────────────────────────────────────────────────────

function BKUPreview() {
  const [akun, setAkun] = useState("Semua Akun");
  const todayStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date());

  const totalDebit  = BKU_ROWS.reduce((s, r) => s + (r.debit  ?? 0), 0); // 8 450 000
  const totalKredit = BKU_ROWS.reduce((s, r) => s + (r.kredit ?? 0), 0); // 3 200 000
  const saldoAkhir  = SALDO_AWAL + totalDebit - totalKredit;              // 128 450 000

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-4 flex-wrap"
        style={{ borderBottom: "1px solid #E2E8DE" }}
      >
        <div>
          <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>
            Buku Kas Umum
          </p>
          <p className="text-xs text-[#6B7769] mt-0.5">Laporan kas masuk dan keluar per periode</p>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0 flex-wrap">
          {/* Period picker */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            <Calendar size={13} className="text-[#6B7769] shrink-0" />
            <span className="text-sm text-[#374040]">1–31 {currentMonth}</span>
            <ChevronDown size={12} className="text-[#9CA3A0]" />
          </button>

          {/* Account filter */}
          <div className="relative">
            <select
              value={akun}
              onChange={(e) => setAkun(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {AKUN_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
            />
          </div>

          {/* Export Excel — outline */}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Download size={13} />
            Export Excel
          </button>

          {/* Export PDF — solid green */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors">
            <Download size={13} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
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
            {/* ── Saldo Awal ── muted opening row */}
            <tr style={{ borderBottom: "1px solid #F0F7EE", background: "#FAFBF9" }}>
              <td className="py-3 pl-6 pr-4" />
              <td className="py-3 pr-4 text-sm text-[#9CA3A0]">1 {currentMonth}</td>
              <td className="py-3 pr-4">
                <span className="text-sm italic text-[#9CA3A0]">Saldo Awal</span>
              </td>
              <td className="py-3 pr-4 text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-4 text-right text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-4 text-right text-sm text-[#D1D5DB]">—</td>
              <td className="py-3 pr-6 text-right">
                <span className="text-sm font-bold tabular-nums text-[#9CA3A0]">
                  {fmt(SALDO_AWAL)}
                </span>
              </td>
            </tr>

            {/* ── Transaction rows ── */}
            {BKU_ROWS.map((row) => (
              <tr
                key={row.no}
                className="hover:bg-[#FAFBF9] transition-colors"
                style={{ borderBottom: "1px solid #F0F7EE" }}
              >
                <td className="py-3.5 pl-6 pr-4 text-sm tabular-nums text-[#9CA3A0]">{row.no}</td>
                <td className="py-3.5 pr-4 text-sm text-[#6B7769] whitespace-nowrap">{row.tanggal}</td>
                <td className="py-3.5 pr-4 text-sm font-medium text-[#1C2517]">{row.uraian}</td>
                <td className="py-3.5 pr-4">
                  {row.ref !== "—" ? (
                    <code
                      className="text-[11px] text-[#6B7769] bg-[#F5F9F4] px-1.5 py-0.5 rounded"
                      style={{ fontFamily: "monospace" }}
                    >
                      {row.ref}
                    </code>
                  ) : (
                    <span className="text-sm text-[#D1D5DB]">—</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-right">
                  {row.debit !== null ? (
                    <span className="text-sm tabular-nums text-[#3E8A2F]">{fmt(row.debit)}</span>
                  ) : (
                    <span className="text-sm text-[#D1D5DB]">—</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-right">
                  {row.kredit !== null ? (
                    <span className="text-sm tabular-nums text-[#DC2626]">{fmt(row.kredit)}</span>
                  ) : (
                    <span className="text-sm text-[#D1D5DB]">—</span>
                  )}
                </td>
                <td className="py-3.5 pr-6 text-right">
                  <span className="text-sm font-bold tabular-nums text-[#1C2517]">
                    {fmt(row.saldo)}
                  </span>
                </td>
              </tr>
            ))}

            {/* ── Saldo Akhir ── bold closing row with top border */}
            <tr style={{ borderTop: "2px solid #E2E8DE" }}>
              <td className="py-3.5 pl-6 pr-4" />
              <td className="py-3.5 pr-4 text-sm font-semibold text-[#1C2517] whitespace-nowrap">
                {todayStr}
              </td>
              <td className="py-3.5 pr-4">
                <span className="text-sm font-bold text-[#1C2517]">Saldo Akhir</span>
              </td>
              <td className="py-3.5 pr-4" />
              <td className="py-3.5 pr-4 text-right">
                <span className="text-sm font-bold tabular-nums text-[#3E8A2F]">
                  {fmt(totalDebit)}
                </span>
              </td>
              <td className="py-3.5 pr-4 text-right">
                <span className="text-sm font-bold tabular-nums text-[#DC2626]">
                  {fmt(totalKredit)}
                </span>
              </td>
              <td className="py-3.5 pr-6 text-right">
                <span className="text-sm font-bold tabular-nums text-[#1C2517]">
                  {fmt(saldoAkhir)}
                </span>
              </td>
            </tr>
          </tbody>
        </DataTable>
      </div>

      {/* Print caption */}
      <div
        className="px-6 py-3"
        style={{ borderTop: "1px solid #E2E8DE" }}
      >
        <p className="text-[11px] text-[#9CA3A0] italic">
          Dicetak dari Sistem Manajemen MTs Al-Ittihad — {todayStr}
        </p>
      </div>
    </div>
  );
}

// ─── Placeholder for unimplemented previews ───────────────────────────────────

function PreviewPlaceholder({ nama }: { nama: string }) {
  return (
    <div
      className="bg-white rounded-xl flex items-center justify-center py-20"
      style={{ border: "1.5px dashed #D1D5DB" }}
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-[#F5F9F4] flex items-center justify-center mx-auto mb-4">
          <FileText size={22} className="text-[#D1D5DB]" />
        </div>
        <p className="text-sm font-semibold text-[#6B7769] mb-1">{nama}</p>
        <p className="text-xs text-[#9CA3A0]">
          Pilih periode dan klik "Export" untuk membuat laporan ini
        </p>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Laporan() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const selectedId = tab || "bku";

  const selected = REPORTS.find((r) => r.id === selectedId) || REPORTS[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-[#1C2517]">Laporan</h2>
        <p className="text-sm text-[#6B7769]">Pusat laporan keuangan dan akademik</p>
      </div>

      {/* ── Report picker ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <ReportCard
            key={r.id}
            r={r}
            selected={selectedId === r.id}
            onSelect={() => navigate(`/keuangan/laporan/${r.id}`)}
          />
        ))}
      </div>

      {/* ── Preview section ── */}
      <div className="space-y-4">
        {/* Section divider */}
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest whitespace-nowrap">
            Pratinjau
          </p>
          <div className="flex-1 h-px bg-[#E2E8DE]" />
          <span className="text-xs text-[#6B7769] font-medium whitespace-nowrap">{selected.nama}</span>
        </div>

        {selectedId === "bku" ? (
          <BKUPreview />
        ) : (
          <PreviewPlaceholder nama={selected.nama} />
        )}
      </div>
    </div>
  );
}
