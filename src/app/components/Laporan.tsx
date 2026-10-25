import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BookOpen, Banknote, Scale, ArrowUpDown, AlertTriangle,
  CalendarDays, Download, Printer, Filter, CheckCircle2,
  Calendar, Layers, ArrowRight, Wallet, Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { fmt } from "@/lib/formatters";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { resolveAkunForPembayaran } from "@/data/keuangan";
import logoEmblem from "../../imports/aliet_logo.png";

// ─── TYPES & CONSTANTS ───────────────────────────────────────────────────────

interface ReportMeta {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  nama: string;
  deskripsi: string;
}

const REPORTS: ReportMeta[] = [
  { id: "bku",       icon: BookOpen,      iconBg: "#EDF7EC", iconColor: "#3E8A2F", nama: "Buku Kas Umum (BKU)",             deskripsi: "Rekap seluruh mutasi kas per periode"      },
  { id: "bos",       icon: Banknote,      iconBg: "#DBEAFE", iconColor: "#1E40AF", nama: "Laporan Dana BOS",                deskripsi: "Penerimaan & realisasi belanja dana BOS"   },
  { id: "neraca",    icon: Scale,         iconBg: "#EDE9FE", iconColor: "#5B21B6", nama: "Neraca Keuangan",                 deskripsi: "Posisi aset, kewajiban, dan ekuitas"       },
  { id: "kas",       icon: ArrowUpDown,   iconBg: "#DCFCE7", iconColor: "#166534", nama: "Laporan Pemasukan & Pengeluaran", deskripsi: "Ringkasan arus kas per kategori"           },
  { id: "tunggakan", icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626", nama: "Rekap Tunggakan Siswa",          deskripsi: "Pemantauan aging & sisa tagihan siswa"     },
  { id: "absensi",   icon: CalendarDays,  iconBg: "#FEF3C7", iconColor: "#92400E", nama: "Rekap Absensi Guru",              deskripsi: "Kehadiran guru per bulan efektif"          },
];

const BULAN_OPTIONS = [
  { val: 0, label: "Januari" },
  { val: 1, label: "Februari" },
  { val: 2, label: "Maret" },
  { val: 3, label: "April" },
  { val: 4, label: "Mei" },
  { val: 5, label: "Juni" },
  { val: 6, label: "Juli" },
  { val: 7, label: "Agustus" },
  { val: 8, label: "September" },
  { val: 9, label: "Oktober" },
  { val: 10, label: "November" },
  { val: 11, label: "Desember" },
];

const TAHUN_OPTIONS = [2024, 2025, 2026, 2027];

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast.success(`Berhasil mengunduh ${filename}`);
}

function fmtTgl(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
}

function hitungHariKerja(year: number, month: number): number {
  const d = new Date(year, month, 1);
  let n = 0;
  while (d.getMonth() === month) {
    const day = d.getDay();
    // Hari Minggu (0) libur; Senin–Sabtu masuk madrasah
    if (day !== 0) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────

function KopSuratResmi({ title, subtitle }: { title: string; subtitle?: string }) {
  const { appSettings } = useAppContext();
  return (
    <div className="hidden print:block pb-4 mb-4 border-b-2 border-black">
      <div className="flex items-center gap-4">
        <img
          src={logoEmblem}
          alt="Logo Madrasah"
          className="w-16 h-16 object-contain shrink-0"
        />
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-700">YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD PEDALEMAN</p>
          <h1 className="text-lg font-black tracking-wide text-black uppercase">{appSettings?.namaMadrasah || "MADRASAH TSANAWIYAH AL-ITTIHAD"}</h1>
          <p className="text-[11px] text-gray-700 mt-0.5">
            NSM: 121236040023 | NPSN: 69982405 | Status: Terakreditasi
          </p>
          <p className="text-[10px] text-gray-600">
            {appSettings?.alamatMadrasah || "Jl. Raya Pedaleman No. 12, Kec. Tanara, Kab. Serang, Banten 42194"}
          </p>
        </div>
        <div className="w-16 shrink-0" />
      </div>
      <div className="mt-3 border-t border-black pt-2 text-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black">{title}</h2>
        {subtitle && <p className="text-xs text-gray-600 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

function TandaTanganResmi() {
  const { guruList } = useAppContext();
  const todayStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

  const kepala = guruList.find(g => g.jabatan?.toLowerCase().includes("kepala"))?.nama || "Ust. H. Ahmad Fauzi, S.Ag";
  const bendahara = guruList.find(g => g.jabatan?.toLowerCase().includes("bendahara"))?.nama || "Ibu Hj. Siti Nurlaela, S.Pd.I";

  return (
    <div className="hidden print:flex justify-between items-start pt-8 mt-6 text-xs text-black border-t border-gray-300">
      <div className="text-center w-64">
        <p>Mengetahui,</p>
        <p className="font-semibold">Kepala Madrasah</p>
        <div className="h-16" />
        <p className="font-bold underline">{kepala}</p>
        <p className="text-[11px] text-gray-600">NIP/NUPTK: —</p>
      </div>
      <div className="text-center w-64">
        <p>Pedaleman, {todayStr}</p>
        <p className="font-semibold">Bendahara Madrasah</p>
        <div className="h-16" />
        <p className="font-bold underline">{bendahara}</p>
        <p className="text-[11px] text-gray-600">NIP/NUPTK: —</p>
      </div>
    </div>
  );
}

function ReportCard({ r, selected, onSelect }: { r: ReportMeta; selected: boolean; onSelect: () => void }) {
  const Icon = r.icon;
  return (
    <button
      onClick={onSelect}
      className="text-left bg-white rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 transition-all cursor-pointer hover:border-[#3E8A2F]"
      style={{
        border: selected ? "2px solid #3E8A2F" : "1px solid #E2E8DE",
        boxShadow: selected ? "0 0 0 3px rgba(62,138,47,0.12)" : undefined,
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.iconBg }}>
          <Icon size={18} style={{ color: r.iconColor }} />
        </div>
        {selected && (
          <span className="text-[10px] font-bold text-[#3E8A2F] bg-[#EDF7EC] px-2 py-0.5 rounded-full">
            Aktif
          </span>
        )}
      </div>
      <div className="flex-1 mt-1">
        <p className="text-sm font-semibold text-[#1C2517] leading-snug mb-1">{r.nama}</p>
        <p className="text-xs text-[#6B7769] line-clamp-2">{r.deskripsi}</p>
      </div>
    </button>
  );
}

function ReportToolbar({
  title, subtitle, children, csvRows, csvFilename,
}: {
  title: string; subtitle: string; children?: React.ReactNode;
  csvRows?: (string | number)[][] | null; csvFilename?: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E2E8DE] bg-[#FAFBF9]/40">
      <div>
        <p className="font-bold text-[#1C2517] text-sm sm:text-base">{title}</p>
        <p className="text-xs text-[#6B7769] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap action-toolbar">
        {children}
        <button
          onClick={() => csvRows && csvFilename && downloadCSV(csvFilename, csvRows)}
          disabled={!csvRows || csvRows.length <= 1}
          title={csvRows ? `Unduh ${csvFilename}` : "Data tidak tersedia"}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#374040] bg-white hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors border border-[#E2E8DE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          <Download size={13} />
          Excel (CSV)
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors cursor-pointer shadow-xs"
        >
          <Printer size={13} />
          Cetak PDF
        </button>
      </div>
    </div>
  );
}

function KpiChip({ label, value, color, desc }: { label: string; value: string; color?: string; desc?: string }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 sm:py-3.5 flex flex-col gap-0.5 border border-[#E2E8DE] shadow-xs">
      <span className="text-[11px] text-[#6B7769] font-medium leading-tight truncate">{label}</span>
      <span className="text-base sm:text-lg font-bold tabular-nums tracking-tight truncate" style={{ color: color ?? "#1C2517" }}>
        {value}
      </span>
      {desc && <span className="text-[10px] text-[#9CA3A0] leading-none mt-0.5 truncate">{desc}</span>}
    </div>
  );
}

// ─── 1. BKU PREVIEW (BUKU KAS UMUM) ──────────────────────────────────────────

function BKUPreview() {
  const { transaksiList, siswaList, manualTransaksiList, akunList, computedAkunList } = useAppContext();
  const now = new Date();

  const [bulan, setBulan] = useState<number>(now.getMonth());
  const [tahun, setTahun] = useState<number>(now.getFullYear());
  const [akunId, setAkunId] = useState<string>("all");

  const namaBulan = BULAN_OPTIONS.find(b => b.val === bulan)?.label || "Bulan";
  const selectedAkun = computedAkunList.find(a => String(a.id) === String(akunId));

  // Tanggal batas periode
  const startPeriod = new Date(tahun, bulan, 1);
  const endPeriod = new Date(tahun, bulan + 1, 0, 23, 59, 59, 999);

  type BKURow = {
    no: number;
    tanggal: string;
    tanggalRaw: string;
    uraian: string;
    ref: string;
    akun: string;
    debit: number | null;
    kredit: number | null;
    saldo: number;
  };

  // 1. Hitung Saldo Awal Dinamis per 1 [Bulan] [Tahun]
  const saldoAwal = useMemo(() => {
    // A. Saldo awal base dari akun
    let base = 0;
    if (akunId === "all") {
      base = akunList.reduce((s, a) => s + (Number(a.saldo) || 0), 0);
    } else {
      const orig = akunList.find(a => String(a.id) === String(akunId));
      base = Number(orig?.saldo) || 0;
    }

    // B. Mutasi sebelum tanggal 1 bulan ini
    let preDebit = 0;
    let preKredit = 0;

    // Pembayaran siswa sebelum periode
    transaksiList.forEach(t => {
      const tDate = new Date(t.tanggal);
      if (tDate < startPeriod) {
        const tAkun = resolveAkunForPembayaran(t.metode, t.akun, akunList);
        if (akunId === "all" || tAkun === selectedAkun?.nama) {
          preDebit += t.nominal;
        }
      }
    });

    // Transaksi manual sebelum periode
    manualTransaksiList.forEach(t => {
      const tDate = new Date(t.tanggal);
      if (tDate < startPeriod) {
        if (akunId === "all" || t.akun === selectedAkun?.nama) {
          if (t.tipe === "masuk") preDebit += t.jumlah;
          if (t.tipe === "keluar") preKredit += t.jumlah;
        }
      }
    });

    return base + preDebit - preKredit;
  }, [akunList, selectedAkun, transaksiList, manualTransaksiList, akunId, startPeriod]);

  // 2. Baris Transaksi pada Periode Ini
  const rows = useMemo((): BKURow[] => {
    type Pre = Omit<BKURow, "no" | "saldo">;
    const pre: Pre[] = [];

    // Siswa payments
    transaksiList.forEach(t => {
      const tDate = new Date(t.tanggal);
      if (tDate >= startPeriod && tDate <= endPeriod) {
        const tAkun = resolveAkunForPembayaran(t.metode, t.akun, akunList);
        if (akunId === "all" || tAkun === selectedAkun?.nama) {
          const siswa = siswaList.find(s => s.nis === t.nis);
          pre.push({
            tanggal: fmtTgl(t.tanggal),
            tanggalRaw: t.tanggal,
            uraian: `Pembayaran ${t.alokasi?.[0]?.namaTagihan || "Tagihan"} - ${siswa?.nama ?? t.nis}`,
            ref: t.nomorKuitansi,
            akun: tAkun,
            debit: t.nominal,
            kredit: null,
          });
        }
      }
    });

    // Manual transactions
    manualTransaksiList.forEach(t => {
      const tDate = new Date(t.tanggal);
      if (tDate >= startPeriod && tDate <= endPeriod) {
        if (akunId === "all" || t.akun === selectedAkun?.nama) {
          pre.push({
            tanggal: fmtTgl(t.tanggal),
            tanggalRaw: t.tanggal,
            uraian: t.keterangan || `Transaksi ${t.kategori}`,
            ref: t.ref || "—",
            akun: t.akun,
            debit: t.tipe === "masuk" ? t.jumlah : null,
            kredit: t.tipe === "keluar" ? t.jumlah : null,
          });
        }
      }
    });

    pre.sort((a, b) => a.tanggalRaw.localeCompare(b.tanggalRaw));

    let running = saldoAwal;
    return pre.map((r, i) => {
      running += (r.debit ?? 0) - (r.kredit ?? 0);
      return { ...r, no: i + 1, saldo: running };
    });
  }, [transaksiList, siswaList, manualTransaksiList, akunList, akunId, selectedAkun, startPeriod, endPeriod, saldoAwal]);

  const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0);
  const totalKredit = rows.reduce((s, r) => s + (r.kredit ?? 0), 0);
  const saldoAkhir = saldoAwal + totalDebit - totalKredit;

  const csvRows = useMemo((): (string | number)[][] => [
    ["No", "Tanggal", "Uraian", "Referensi", "Akun Kas", "Debit (Rp)", "Kredit (Rp)", "Saldo (Rp)"],
    ["—", `1 ${namaBulan} ${tahun}`, "Saldo Awal Periode", "—", akunId === "all" ? "Semua Akun" : (selectedAkun?.nama || ""), 0, 0, saldoAwal],
    ...rows.map(r => [r.no, r.tanggal, r.uraian, r.ref, r.akun, r.debit ?? 0, r.kredit ?? 0, r.saldo]),
    ["TOTAL", `Total ${namaBulan} ${tahun}`, "", "", "", totalDebit, totalKredit, saldoAkhir],
  ], [rows, namaBulan, tahun, akunId, selectedAkun, saldoAwal, totalDebit, totalKredit, saldoAkhir]);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs print-container">
      <KopSuratResmi
        title="BUKU KAS UMUM (BKU)"
        subtitle={`Periode: 1–${endPeriod.getDate()} ${namaBulan} ${tahun} | Akun: ${akunId === "all" ? "Semua Akun Kas/Bank" : selectedAkun?.nama}`}
      />

      <ReportToolbar
        title="Buku Kas Umum (BKU)"
        subtitle={`Rekap mutasi kas masuk dan keluar periode ${namaBulan} ${tahun}`}
        csvRows={csvRows}
        csvFilename={`BKU-${namaBulan}-${tahun}.csv`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Akun Filter */}
          <select
            value={akunId}
            onChange={(e) => setAkunId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
          >
            <option value="all">Semua Akun Kas & Bank</option>
            {computedAkunList.map(a => (
              <option key={a.id} value={a.id}>{a.nama}</option>
            ))}
          </select>

          {/* Bulan Filter */}
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
          >
            {BULAN_OPTIONS.map(b => (
              <option key={b.val} value={b.val}>{b.label}</option>
            ))}
          </select>

          {/* Tahun Filter */}
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
          >
            {TAHUN_OPTIONS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </ReportToolbar>

      {/* Mini KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[#FAFBF9] border-b border-[#E2E8DE]">
        <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8DE]">
          <p className="text-[10px] text-[#6B7769] font-medium">Saldo Awal</p>
          <p className="text-sm font-bold text-[#1C2517] tabular-nums">{fmt(saldoAwal)}</p>
        </div>
        <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8DE]">
          <p className="text-[10px] text-[#6B7769] font-medium">Total Masuk (Debit)</p>
          <p className="text-sm font-bold text-[#3E8A2F] tabular-nums">{fmt(totalDebit)}</p>
        </div>
        <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8DE]">
          <p className="text-[10px] text-[#6B7769] font-medium">Total Keluar (Kredit)</p>
          <p className="text-sm font-bold text-[#DC2626] tabular-nums">{fmt(totalKredit)}</p>
        </div>
        <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8DE]">
          <p className="text-[10px] text-[#6B7769] font-medium">Saldo Akhir</p>
          <p className="text-sm font-bold text-[#1C2517] tabular-nums">{fmt(saldoAkhir)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr className="border-b border-[#E2E8DE]">
              <Th className="pl-6 pr-3 w-10">No</Th>
              <Th className="pr-3">Tanggal</Th>
              <Th className="pr-3">Uraian Transaksi</Th>
              <Th className="pr-3">Ref/Bukti</Th>
              <Th className="pr-3">Akun</Th>
              <Th align="right" className="pr-3">Debit (Rp)</Th>
              <Th align="right" className="pr-3">Kredit (Rp)</Th>
              <Th align="right" className="pr-6">Saldo (Rp)</Th>
            </tr>
          </thead>
          <tbody>
            {/* Saldo Awal */}
            <tr className="bg-[#FAFBF9] border-b border-[#E2E8DE]">
              <td className="py-3 pl-6 pr-3 text-xs text-[#9CA3A0] font-bold">—</td>
              <td className="py-3 pr-3 text-xs text-[#6B7769] font-semibold whitespace-nowrap">
                1 {namaBulan} {tahun}
              </td>
              <td className="py-3 pr-3 text-xs font-semibold text-[#1C2517]" colSpan={3}>
                Saldo Awal Periode {namaBulan} {tahun}
              </td>
              <td className="py-3 pr-3 text-right text-xs text-[#9CA3A0]">—</td>
              <td className="py-3 pr-3 text-right text-xs text-[#9CA3A0]">—</td>
              <td className="py-3 pr-6 text-right">
                <span className="text-xs font-bold tabular-nums text-[#1C2517]">{fmt(saldoAwal)}</span>
              </td>
            </tr>

            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-[#9CA3A0]">
                  Belum ada transaksi kas pada periode {namaBulan} {tahun}. Saldo kas madrasah tetap {fmt(saldoAwal)}.
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row.no} className="hover:bg-[#FAFBF9] transition-colors border-b border-[#F0F7EE]">
                  <td className="py-3 pl-6 pr-3 text-xs tabular-nums text-[#9CA3A0]">{row.no}</td>
                  <td className="py-3 pr-3 text-xs text-[#6B7769] whitespace-nowrap">{row.tanggal}</td>
                  <td className="py-3 pr-3 text-xs font-medium text-[#1C2517] max-w-[280px] truncate">{row.uraian}</td>
                  <td className="py-3 pr-3">
                    {row.ref !== "—" ? (
                      <code className="text-[11px] text-[#6B7769] bg-[#F5F9F4] px-1.5 py-0.5 rounded border border-[#E2E8DE]">
                        {row.ref}
                      </code>
                    ) : (
                      <span className="text-xs text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs text-[#6B7769]">{row.akun}</td>
                  <td className="py-3 pr-3 text-right">
                    {row.debit !== null ? (
                      <span className="text-xs font-semibold tabular-nums text-[#3E8A2F]">{fmt(row.debit)}</span>
                    ) : (
                      <span className="text-xs text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {row.kredit !== null ? (
                      <span className="text-xs font-semibold tabular-nums text-[#DC2626]">{fmt(row.kredit)}</span>
                    ) : (
                      <span className="text-xs text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-6 text-right">
                    <span className="text-xs font-bold tabular-nums text-[#1C2517]">{fmt(row.saldo)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#E2E8DE] bg-[#FAFBF9] font-bold">
              <td className="py-3 pl-6 pr-3" />
              <td className="py-3 pr-3 text-xs text-[#1C2517] whitespace-nowrap">{endPeriod.getDate()} {namaBulan} {tahun}</td>
              <td className="py-3 pr-3 text-xs text-[#1C2517]" colSpan={3}>Saldo Akhir Periode</td>
              <td className="py-3 pr-3 text-right text-xs text-[#3E8A2F] tabular-nums">{fmt(totalDebit)}</td>
              <td className="py-3 pr-3 text-right text-xs text-[#DC2626] tabular-nums">{fmt(totalKredit)}</td>
              <td className="py-3 pr-6 text-right text-xs text-[#1C2517] tabular-nums font-black">{fmt(saldoAkhir)}</td>
            </tr>
          </tfoot>
        </DataTable>
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── 2. DANA BOS PREVIEW ─────────────────────────────────────────────────────

function BosPreview() {
  const { manualTransaksiList } = useAppContext();
  const navigate = useNavigate();

  // Dapatkan seluruh transaksi riil kategori Dana BOS
  const bosTransaksi = useMemo(() => {
    return manualTransaksiList.filter(t =>
      t.kategori === "Dana BOS" ||
      t.keterangan?.toLowerCase().includes("bos") ||
      t.ref?.toLowerCase().includes("bos")
    );
  }, [manualTransaksiList]);

  const penerimaan = bosTransaksi.filter(t => t.tipe === "masuk").reduce((s, t) => s + t.jumlah, 0);
  const realisasi = bosTransaksi.filter(t => t.tipe === "keluar").reduce((s, t) => s + t.jumlah, 0);
  const sisa = penerimaan - realisasi;
  const serapan = penerimaan > 0 ? Math.round((realisasi / penerimaan) * 100) : 0;

  const csvRows = useMemo((): (string | number)[][] => [
    ["No", "Tanggal", "Jenis", "Uraian / Komponen", "Referensi", "Nominal (Rp)"],
    ...bosTransaksi.map((t, i) => [
      i + 1,
      fmtTgl(t.tanggal),
      t.tipe === "masuk" ? "Penerimaan BOS" : "Belanja BOS",
      t.keterangan,
      t.ref || "—",
      t.jumlah,
    ]),
    ["TOTAL PENERIMAAN", "", "", "", "", penerimaan],
    ["TOTAL REALISASI", "", "", "", "", realisasi],
    ["SISA ANGGARAN BOS", "", "", "", "", sisa],
  ], [bosTransaksi, penerimaan, realisasi, sisa]);

  return (
    <div className="space-y-4 print-container">
      <KopSuratResmi
        title="LAPORAN PERTANGGUNGJAWABAN DANA BOS"
        subtitle={`Tahun Anggaran ${new Date().getFullYear()} — MTs Al-Ittihad Pedaleman`}
      />

      {/* KPI Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 no-print">
        <KpiChip label="Dana BOS Diterima" value={fmt(penerimaan)} color="#1E40AF" desc="Total penerimaan kas BOS" />
        <KpiChip label="Total Realisasi Belanja" value={fmt(realisasi)} color="#3E8A2F" desc="Belanja operasional BOS" />
        <KpiChip label="Sisa Saldo BOS" value={fmt(sisa)} color="#374040" desc="Sisa kas dana BOS" />
        <KpiChip
          label="Tingkat Serapan"
          value={`${serapan}%`}
          color={serapan >= 80 ? "#3E8A2F" : serapan >= 50 ? "#D97706" : "#6B7769"}
          desc="Persentase serapan belanja"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs">
        <ReportToolbar
          title="Laporan Realisasi Dana BOS"
          subtitle={`Pencatatan realisasi dana BOS riil madrasah — serapan ${serapan}%`}
          csvRows={csvRows}
          csvFilename={`Laporan-Dana-BOS-${new Date().getFullYear()}.csv`}
        />

        {bosTransaksi.length === 0 ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center mx-auto mb-3">
              <Banknote size={24} className="text-[#1E40AF]" />
            </div>
            <h4 className="text-base font-bold text-[#1C2517] mb-1">Belum Ada Transaksi Dana BOS</h4>
            <p className="text-xs text-[#6B7769] leading-relaxed mb-5">
              Penerimaan pencairan dan realisasi belanja Dana BOS madrasah dicatat melalui menu <strong>Kas & Bank</strong> dengan memilih kategori <strong>"Dana BOS"</strong>.
            </p>
            <button
              onClick={() => navigate("/keuangan/kas-bank/transaksi")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors cursor-pointer"
            >
              Catat Transaksi BOS di Kas & Bank <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable>
              <thead>
                <tr className="border-b border-[#E2E8DE]">
                  <Th className="pl-6 pr-3 w-10">No</Th>
                  <Th className="pr-3">Tanggal</Th>
                  <Th className="pr-3">Tipe</Th>
                  <Th className="pr-3">Uraian / Keterangan</Th>
                  <Th className="pr-3">Ref/Bukti</Th>
                  <Th align="right" className="pr-6">Nominal (Rp)</Th>
                </tr>
              </thead>
              <tbody>
                {bosTransaksi.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-[#FAFBF9] border-b border-[#F0F7EE]">
                    <td className="py-3 pl-6 pr-3 text-xs text-[#9CA3A0] tabular-nums">{idx + 1}</td>
                    <td className="py-3 pr-3 text-xs text-[#6B7769] whitespace-nowrap">{fmtTgl(t.tanggal)}</td>
                    <td className="py-3 pr-3 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.tipe === "masuk" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {t.tipe === "masuk" ? "Penerimaan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs font-medium text-[#1C2517]">{t.keterangan}</td>
                    <td className="py-3 pr-3 text-xs text-[#6B7769]">{t.ref || "—"}</td>
                    <td className="py-3 pr-6 text-right text-xs font-bold tabular-nums" style={{
                      color: t.tipe === "masuk" ? "#3E8A2F" : "#DC2626"
                    }}>
                      {fmt(t.jumlah)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E2E8DE] bg-[#FAFBF9] font-bold text-xs">
                  <td className="py-3 pl-6 pr-3" colSpan={5}>Total Penerimaan Dana BOS</td>
                  <td className="py-3 pr-6 text-right text-[#3E8A2F] tabular-nums">{fmt(penerimaan)}</td>
                </tr>
                <tr className="bg-[#FAFBF9] font-bold text-xs">
                  <td className="py-2 pl-6 pr-3" colSpan={5}>Total Belanja / Realisasi</td>
                  <td className="py-2 pr-6 text-right text-[#DC2626] tabular-nums">{fmt(realisasi)}</td>
                </tr>
                <tr className="border-t border-[#E2E8DE] bg-[#FAFBF9] font-black text-xs text-[#1C2517]">
                  <td className="py-3 pl-6 pr-3" colSpan={5}>Sisa Saldo Kas Dana BOS</td>
                  <td className="py-3 pr-6 text-right tabular-nums">{fmt(sisa)}</td>
                </tr>
              </tfoot>
            </DataTable>
          </div>
        )}
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── 3. NERACA KEUANGAN PREVIEW ──────────────────────────────────────────────

function NeracaPreview() {
  const { transaksiList, tagihanList, siswaList, manualTransaksiList, akunList, computedAkunList } = useAppContext();
  const todayStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

  const { aset, ekuitas, piutang, totalAset, modalAwalRiil, isBalanced } = useMemo(() => {
    // ASET: Kas & Bank Riil
    const akunAset = computedAkunList.map(akun => ({
      ...akun,
      current: akun.saldoBerjalan ?? akun.saldo ?? 0,
    }));

    const totalKasBank = akunAset.reduce((s, a) => s + a.current, 0);

    // PIUTANG: Tagihan siswa aktif yang belum lunas
    const activeNis = new Set(siswaList.filter(s => s.status === "Aktif").map(s => s.nis));
    const piutangSiswa = tagihanList
      .filter(t => activeNis.has(t.nis) && !t.isLunas && t.nominal > t.terbayar)
      .reduce((s, t) => s + (t.nominal - t.terbayar), 0);

    const totAset = totalKasBank + piutangSiswa;

    // EKUITAS:
    // Modal awal riil dari saldo awal seluruh akun saat dibuat
    const modalAwal = akunList.reduce((s, a) => s + (Number(a.saldo) || 0), 0);

    // Surplus/Defisit Berjalan dari seluruh transaksi operasional
    const allMasuk = transaksiList.reduce((s, t) => s + t.nominal, 0)
      + manualTransaksiList.filter(t => t.tipe === "masuk").reduce((s, t) => s + t.jumlah, 0);
    const allKeluar = manualTransaksiList.filter(t => t.tipe === "keluar").reduce((s, t) => s + t.jumlah, 0);
    const surplus = allMasuk - allKeluar;

    // Ekuitas Total = Modal Awal + Surplus + Piutang = Persis Total Aset!
    const totEkuitas = modalAwal + surplus + piutangSiswa;

    return {
      aset: akunAset,
      ekuitas: { modalAwal, surplus, total: totEkuitas },
      piutang: piutangSiswa,
      totalAset: totAset,
      modalAwalRiil: modalAwal,
      isBalanced: Math.abs(totAset - totEkuitas) < 1,
    };
  }, [transaksiList, tagihanList, siswaList, manualTransaksiList, akunList, computedAkunList]);

  const csvRows: (string | number)[][] = [
    ["Keterangan", "Nilai (Rp)"],
    ["ASET", ""],
    ...aset.map(a => [`  ${a.nama}`, a.current]),
    ["  Piutang Tagihan Siswa", piutang],
    ["TOTAL ASET", totalAset],
    ["", ""],
    ["KEWAJIBAN & EKUITAS", ""],
    ["  Kewajiban Jangka Pendek", 0],
    ["  Modal Awal Kas Madrasah", modalAwalRiil],
    ["  Surplus / (Defisit) Berjalan", ekuitas.surplus],
    ["  Piutang Siswa Terakui", piutang],
    ["TOTAL KEWAJIBAN & EKUITAS", ekuitas.total],
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs print-container">
      <KopSuratResmi
        title="NERACA POSISI KEUANGAN"
        subtitle={`Per ${todayStr} — MTs Al-Ittihad Pedaleman`}
      />

      <ReportToolbar
        title="Neraca Keuangan"
        subtitle={`Posisi aset, kewajiban, dan ekuitas madrasah per ${todayStr}`}
        csvRows={csvRows}
        csvFilename={`Neraca-Keuangan-${new Date().getFullYear()}.csv`}
      />

      {/* Balance Indicator Banner */}
      <div className="px-6 py-2.5 bg-[#FAFBF9] border-b border-[#E2E8DE] flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#3E8A2F]" />
          <span className="text-xs font-semibold text-[#1C2517]">
            {isBalanced ? "Neraca Seimbang (Aset = Kewajiban + Ekuitas)" : "Selisih Penyesuaian"}
          </span>
        </div>
        <span className="text-xs font-bold text-[#3E8A2F] tabular-nums">
          Total: {fmt(totalAset)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-[#E2E8DE]">
        {/* ASET */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#9CA3A0] uppercase tracking-widest mb-4">Aset Madrasah</p>
          <p className="text-xs font-semibold text-[#6B7769] mb-2 flex items-center gap-1.5">
            <Landmark size={14} /> Kas & Bank
          </p>
          <div className="space-y-2 mb-4">
            {aset.map(a => (
              <div key={a.id} className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs">
                <span className="text-[#374040]">{a.nama}</span>
                <span className="tabular-nums font-semibold text-[#1C2517]">{fmt(a.current)}</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-[#6B7769] mb-2 flex items-center gap-1.5">
            <Wallet size={14} /> Piutang
          </p>
          <div className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs">
            <span className="text-[#374040]">Piutang Tagihan Siswa</span>
            <span className="tabular-nums font-semibold text-[#1C2517]">{fmt(piutang)}</span>
          </div>

          <div className="flex items-center justify-between py-3 mt-4 border-t-2 border-[#E2E8DE]">
            <span className="text-sm font-bold text-[#1C2517]">Total Aset</span>
            <span className="text-base font-black tabular-nums text-[#3E8A2F]">{fmt(totalAset)}</span>
          </div>
        </div>

        {/* KEWAJIBAN & EKUITAS */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#9CA3A0] uppercase tracking-widest mb-4">Kewajiban & Ekuitas</p>

          <p className="text-xs font-semibold text-[#6B7769] mb-2">Kewajiban</p>
          <div className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs text-[#9CA3A0]">
            <span>Hutang / Kewajiban Jangka Pendek</span>
            <span>Rp 0</span>
          </div>

          <p className="text-xs font-semibold text-[#6B7769] mt-4 mb-2">Ekuitas Madrasah</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs">
              <span className="text-[#374040]">Modal Awal Saldo Kas</span>
              <span className="tabular-nums font-semibold text-[#1C2517]">{fmt(modalAwalRiil)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs">
              <span className="text-[#374040]">Surplus / (Defisit) Berjalan</span>
              <span className={`tabular-nums font-semibold ${ekuitas.surplus >= 0 ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
                {ekuitas.surplus >= 0 ? "+" : "−"}{fmt(Math.abs(ekuitas.surplus))}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 pl-4 border-b border-[#F5F9F4] text-xs">
              <span className="text-[#374040]">Piutang Siswa Terakui</span>
              <span className="tabular-nums font-semibold text-[#1C2517]">{fmt(piutang)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 mt-4 border-t-2 border-[#E2E8DE]">
            <span className="text-sm font-bold text-[#1C2517]">Total Kewajiban & Ekuitas</span>
            <span className="text-base font-black tabular-nums text-[#3E8A2F]">{fmt(ekuitas.total)}</span>
          </div>
        </div>
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── 4. KAS PREVIEW (PEMASUKAN & PENGELUARAN) ────────────────────────────────

function KasPreview() {
  const { transaksiList, tagihanList, manualTransaksiList } = useAppContext();
  const now = new Date();

  const [bulan, setBulan] = useState<number | "all">("all");
  const [tahun, setTahun] = useState<number>(now.getFullYear());

  const namaBulan = bulan === "all" ? "Sepanjang Tahun" : BULAN_OPTIONS.find(b => b.val === bulan)?.label;

  const { byKategori, totalMasuk, totalKeluar, net } = useMemo(() => {
    const map = new Map<string, { masuk: number; keluar: number }>();

    function add(kat: string, tipe: "masuk" | "keluar", jumlah: number) {
      const prev = map.get(kat) ?? { masuk: 0, keluar: 0 };
      map.set(kat, tipe === "masuk" ? { ...prev, masuk: prev.masuk + jumlah } : { ...prev, keluar: prev.keluar + jumlah });
    }

    // Filter transaksi siswa
    transaksiList.forEach(t => {
      const d = new Date(t.tanggal);
      if (d.getFullYear() === tahun && (bulan === "all" || d.getMonth() === bulan)) {
        const firstAlokasi = t.alokasi?.[0];
        const tagihan = firstAlokasi ? tagihanList.find(tg => tg.id === firstAlokasi.tagihanId) : undefined;
        const kat = tagihan?.kategori ?? "Pembayaran Siswa";
        add(kat, "masuk", t.nominal);
      }
    });

    // Filter transaksi manual
    manualTransaksiList.forEach(t => {
      const d = new Date(t.tanggal);
      if (d.getFullYear() === tahun && (bulan === "all" || d.getMonth() === bulan)) {
        add(t.kategori || "Operasional", t.tipe, t.jumlah);
      }
    });

    const rows = [...map.entries()].map(([kat, v]) => ({ kat, ...v, net: v.masuk - v.keluar }))
      .sort((a, b) => (b.masuk + b.keluar) - (a.masuk + a.keluar));

    const masuk = rows.reduce((s, r) => s + r.masuk, 0);
    const keluar = rows.reduce((s, r) => s + r.keluar, 0);
    return { byKategori: rows, totalMasuk: masuk, totalKeluar: keluar, net: masuk - keluar };
  }, [transaksiList, tagihanList, manualTransaksiList, bulan, tahun]);

  const maxVal = Math.max(...byKategori.map(r => Math.max(r.masuk, r.keluar)), 1);

  const csvRows: (string | number)[][] = [
    ["Kategori", "Pemasukan (Rp)", "Pengeluaran (Rp)", "Selisih Bersih (Rp)"],
    ...byKategori.map(r => [r.kat, r.masuk, r.keluar, r.net]),
    ["TOTAL", totalMasuk, totalKeluar, net],
  ];

  return (
    <div className="space-y-4 print-container">
      <KopSuratResmi
        title="LAPORAN ARUS KAS (PEMASUKAN & PENGELUARAN)"
        subtitle={`Periode: ${namaBulan} ${tahun} — MTs Al-Ittihad Pedaleman`}
      />

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <KpiChip label="Total Pemasukan" value={fmt(totalMasuk)} color="#3E8A2F" desc="Total penerimaan kas" />
        <KpiChip label="Total Pengeluaran" value={fmt(totalKeluar)} color="#DC2626" desc="Total belanja operasional" />
        <KpiChip
          label="Selisih Bersih"
          value={`${net >= 0 ? "+" : "−"}${fmt(Math.abs(net))}`}
          color={net >= 0 ? "#3E8A2F" : "#DC2626"}
          desc={net >= 0 ? "Surplus kas madrasah" : "Defisit kas madrasah"}
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs">
        <ReportToolbar
          title="Laporan Pemasukan & Pengeluaran"
          subtitle={`Ringkasan arus kas per kategori periode ${namaBulan} ${tahun}`}
          csvRows={csvRows}
          csvFilename={`Arus-Kas-${namaBulan}-${tahun}.csv`}
        >
          <div className="flex items-center gap-1.5">
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              <option value="all">Semua Bulan</option>
              {BULAN_OPTIONS.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              {TAHUN_OPTIONS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </ReportToolbar>

        {byKategori.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#9CA3A0]">
            Belum ada transaksi pemasukan atau pengeluaran pada periode {namaBulan} {tahun}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable>
              <thead>
                <tr className="border-b border-[#E2E8DE]">
                  <Th className="pl-6 pr-3">Kategori</Th>
                  <Th align="right" className="pr-3">Pemasukan (Rp)</Th>
                  <Th align="right" className="pr-3">Pengeluaran (Rp)</Th>
                  <Th align="right" className="pr-3">Selisih (Rp)</Th>
                  <Th className="pr-6 no-print">Proporsi Visual</Th>
                </tr>
              </thead>
              <tbody>
                {byKategori.map((r, i) => (
                  <tr key={r.kat} className="hover:bg-[#FAFBF9] border-b border-[#F0F7EE]">
                    <td className="py-3 pl-6 pr-3 text-xs font-semibold text-[#1C2517]">{r.kat}</td>
                    <td className="py-3 pr-3 text-right tabular-nums text-xs font-semibold text-[#3E8A2F]">
                      {r.masuk > 0 ? fmt(r.masuk) : <span className="text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-xs font-semibold text-[#DC2626]">
                      {r.keluar > 0 ? fmt(r.keluar) : <span className="text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-xs font-bold" style={{ color: r.net >= 0 ? "#3E8A2F" : "#DC2626" }}>
                      {r.net >= 0 ? "+" : "−"}{fmt(Math.abs(r.net))}
                    </td>
                    <td className="py-3 pr-6 no-print">
                      <div className="flex items-center gap-1">
                        {r.masuk > 0 && (
                          <div className="h-2 rounded-full bg-[#3E8A2F]" style={{ width: `${Math.max(Math.round((r.masuk / maxVal) * 70), 4)}px` }} />
                        )}
                        {r.keluar > 0 && (
                          <div className="h-2 rounded-full bg-[#DC2626]" style={{ width: `${Math.max(Math.round((r.keluar / maxVal) * 70), 4)}px` }} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E2E8DE] bg-[#FAFBF9] font-bold text-xs">
                  <td className="py-3 pl-6 pr-3 text-[#1C2517]">TOTAL KESELURUHAN</td>
                  <td className="py-3 pr-3 text-right text-[#3E8A2F] tabular-nums">{fmt(totalMasuk)}</td>
                  <td className="py-3 pr-3 text-right text-[#DC2626] tabular-nums">{fmt(totalKeluar)}</td>
                  <td className="py-3 pr-3 text-right tabular-nums" style={{ color: net >= 0 ? "#3E8A2F" : "#DC2626" }}>
                    {net >= 0 ? "+" : "−"}{fmt(Math.abs(net))}
                  </td>
                  <td className="py-3 pr-6 no-print text-[10px] text-[#9CA3A0]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#3E8A2F] mr-1" /> Masuk
                    <span className="inline-block w-2 h-2 rounded-full bg-[#DC2626] ml-2 mr-1" /> Keluar
                  </td>
                </tr>
              </tfoot>
            </DataTable>
          </div>
        )}
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── 5. REKAP TUNGGAKAN SISWA ────────────────────────────────────────────────

function TunggakanPreview() {
  const { tagihanList, siswaList } = useAppContext();

  const [selectedKelas, setSelectedKelas] = useState<string>("all");
  const [selectedAging, setSelectedAging] = useState<string>("all");

  // Dapatkan daftar kelas unik dari siswa
  const kelasOptions = useMemo(() => {
    const set = new Set(siswaList.map(s => s.kelas).filter(Boolean));
    return Array.from(set).sort();
  }, [siswaList]);

  const rows = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const activeNis = new Set(siswaList.filter(s => s.status === "Aktif").map(s => s.nis));

    const bySiswa = new Map<string, {
      totalTagihan: number;
      totalTerbayar: number;
      oldestDays: number;
      oldestDate: string;
      itemNames: Set<string>;
    }>();

    tagihanList.forEach(t => {
      if (!activeNis.has(t.nis) || t.isLunas) return;
      const sisa = t.nominal - t.terbayar;
      if (sisa <= 0) return;
      const days = Math.floor((today.getTime() - new Date(t.jatuhTempo).getTime()) / 86_400_000);

      const prev = bySiswa.get(t.nis);
      if (!prev) {
        bySiswa.set(t.nis, {
          totalTagihan: t.nominal,
          totalTerbayar: t.terbayar,
          oldestDays: days,
          oldestDate: t.jatuhTempo,
          itemNames: new Set([t.namaTagihan]),
        });
      } else {
        prev.itemNames.add(t.namaTagihan);
        bySiswa.set(t.nis, {
          totalTagihan: prev.totalTagihan + t.nominal,
          totalTerbayar: prev.totalTerbayar + t.terbayar,
          oldestDays: Math.max(prev.oldestDays, days),
          oldestDate: days > prev.oldestDays ? t.jatuhTempo : prev.oldestDate,
          itemNames: prev.itemNames,
        });
      }
    });

    let list = [...bySiswa.entries()].map(([nis, v]) => {
      const siswa = siswaList.find(s => s.nis === nis);
      const sisa = v.totalTagihan - v.totalTerbayar;
      const aging: "Kritis" | "Waspada" | "Perhatian" | "Belum Jatuh Tempo" =
        v.oldestDays > 60 ? "Kritis" : v.oldestDays > 30 ? "Waspada" : v.oldestDays > 0 ? "Perhatian" : "Belum Jatuh Tempo";
      return {
        nis,
        nama: siswa?.nama ?? nis,
        kelas: siswa?.kelas ?? "—",
        tagihanSummary: Array.from(v.itemNames).join(", "),
        sisa,
        aging,
        jatuhTempo: v.oldestDate,
      };
    });

    if (selectedKelas !== "all") {
      list = list.filter(r => r.kelas === selectedKelas);
    }
    if (selectedAging !== "all") {
      list = list.filter(r => r.aging === selectedAging);
    }

    return list.sort((a, b) => b.sisa - a.sisa);
  }, [tagihanList, siswaList, selectedKelas, selectedAging]);

  const totalSisa = rows.reduce((s, r) => s + r.sisa, 0);
  const kritis = rows.filter(r => r.aging === "Kritis").length;
  const waspada = rows.filter(r => r.aging === "Waspada").length;
  const perhatian = rows.filter(r => r.aging === "Perhatian").length;

  const csvRows: (string | number)[][] = [
    ["No", "Nama Siswa", "NIS", "Kelas", "Rincian Tagihan", "Sisa Tunggakan (Rp)", "Status Aging", "Jatuh Tempo"],
    ...rows.map((r, i) => [i + 1, r.nama, r.nis, r.kelas, r.tagihanSummary, r.sisa, r.aging, r.jatuhTempo]),
    ["TOTAL TUNGGAKAN", "", "", "", `${rows.length} Siswa`, totalSisa, "", ""],
  ];

  const AGING_STYLE: Record<string, { bg: string; text: string }> = {
    "Kritis":           { bg: "#FEE2E2", text: "#991B1B" },
    "Waspada":          { bg: "#FFEDD5", text: "#9A3412" },
    "Perhatian":        { bg: "#FEF9C3", text: "#713F12" },
    "Belum Jatuh Tempo":{ bg: "#F3F4F6", text: "#374151" },
  };

  return (
    <div className="space-y-4 print-container">
      <KopSuratResmi
        title="REKAPITULASI TUNGGAKAN PEMBAYARAN SISWA"
        subtitle={`Per ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())} — MTs Al-Ittihad Pedaleman`}
      />

      {/* KPI Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 no-print">
        <KpiChip label="Total Tunggakan" value={fmt(totalSisa)} color="#DC2626" desc={`${rows.length} siswa menunggak`} />
        <KpiChip label="Kritis (> 60 hari)" value={`${kritis} siswa`} color="#991B1B" desc="Tunggakan lewat 2 bulan" />
        <KpiChip label="Waspada (31–60 hari)" value={`${waspada} siswa`} color="#9A3412" desc="Tunggakan 1–2 bulan" />
        <KpiChip label="Perhatian (1–30 hari)" value={`${perhatian} siswa`} color="#713F12" desc="Baru jatuh tempo" />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs">
        <ReportToolbar
          title="Rekap Tunggakan Siswa"
          subtitle={`${rows.length} siswa memiliki sisa tagihan aktif`}
          csvRows={csvRows}
          csvFilename={`Rekap-Tunggakan-${new Date().toISOString().split("T")[0]}.csv`}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              <option value="all">Semua Kelas</option>
              {kelasOptions.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={selectedAging}
              onChange={(e) => setSelectedAging(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              <option value="all">Semua Status Aging</option>
              <option value="Kritis">Kritis (&gt; 60 hari)</option>
              <option value="Waspada">Waspada (31–60 hari)</option>
              <option value="Perhatian">Perhatian (1–30 hari)</option>
              <option value="Belum Jatuh Tempo">Belum Jatuh Tempo</option>
            </select>
          </div>
        </ReportToolbar>

        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr className="border-b border-[#E2E8DE]">
                <Th className="pl-6 pr-3 w-10">No</Th>
                <Th className="pr-3">Nama Siswa</Th>
                <Th className="pr-3">Kelas</Th>
                <Th className="pr-3">Rincian Tagihan</Th>
                <Th align="right" className="pr-3">Sisa Tunggakan</Th>
                <Th className="pr-3">Aging</Th>
                <Th className="pr-6">Jatuh Tempo</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#3E8A2F] font-semibold">
                    ✓ Alhamdulillah, tidak ada tunggakan siswa pada kriteria filter ini.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const style = AGING_STYLE[r.aging] ?? AGING_STYLE["Belum Jatuh Tempo"];
                  return (
                    <tr key={r.nis} className="hover:bg-[#FAFBF9] border-b border-[#F0F7EE]">
                      <td className="py-3 pl-6 pr-3 text-xs text-[#9CA3A0] tabular-nums">{i + 1}</td>
                      <td className="py-3 pr-3">
                        <p className="text-xs font-semibold text-[#1C2517]">{r.nama}</p>
                        <p className="text-[10px] text-[#9CA3A0] tabular-nums">NIS: {r.nis}</p>
                      </td>
                      <td className="py-3 pr-3 text-xs font-medium text-[#6B7769]">{r.kelas}</td>
                      <td className="py-3 pr-3 text-xs text-[#6B7769] max-w-[220px] truncate" title={r.tagihanSummary}>
                        {r.tagihanSummary}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-xs font-bold text-[#DC2626]">
                        {fmt(r.sisa)}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: style.bg, color: style.text }}>
                          {r.aging}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-xs text-[#6B7769] tabular-nums whitespace-nowrap">
                        {fmtTgl(r.jatuhTempo)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E2E8DE] bg-[#FAFBF9] font-bold text-xs">
                  <td className="py-3 pl-6 pr-3" colSpan={4}>TOTAL TUNGGAKAN ({rows.length} Siswa)</td>
                  <td className="py-3 pr-3 text-right text-[#DC2626] font-black tabular-nums">{fmt(totalSisa)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </DataTable>
        </div>
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── 6. REKAP ABSENSI GURU ───────────────────────────────────────────────────

function AbsensiPreview() {
  const { guruList, absensiGuruHistory, absensiGuruHariIni } = useAppContext();
  const navigate = useNavigate();
  const now = new Date();

  const [bulan, setBulan] = useState<number>(now.getMonth());
  const [tahun, setTahun] = useState<number>(now.getFullYear());

  const namaBulan = BULAN_OPTIONS.find(b => b.val === bulan)?.label;
  const totalHariKerja = hitungHariKerja(tahun, bulan);

  // Kompilasi data absensi riil per guru
  const rows = useMemo(() => {
    const activeGuru = guruList.filter(g => g.status === "Aktif");

    return activeGuru.map(g => {
      let hadir = 0;
      let terlambat = 0;
      let izin = 0;
      let alpa = 0;

      // Periksa riwayat absensi bulan ini
      Object.entries(absensiGuruHistory).forEach(([tglStr, records]) => {
        const d = new Date(tglStr);
        if (d.getFullYear() === tahun && d.getMonth() === bulan) {
          const rec = records[g.id];
          if (rec) {
            const st = rec.status.toLowerCase();
            if (st === "hadir") hadir++;
            else if (st === "terlambat") terlambat++;
            else if (st === "izin" || st === "sakit") izin++;
            else if (st === "alpa") alpa++;
          }
        }
      });

      // Tambahkan hari ini jika dalam bulan yang sama
      if (now.getFullYear() === tahun && now.getMonth() === bulan) {
        const todayRec = absensiGuruHariIni[g.id];
        if (todayRec) {
          const st = todayRec.status.toLowerCase();
          if (st === "hadir") hadir++;
          else if (st === "terlambat") terlambat++;
          else if (st === "izin" || st === "sakit") izin++;
          else if (st === "alpa") alpa++;
        }
      }

      const totalMasuk = hadir + terlambat;
      const pct = totalHariKerja > 0 ? Math.min(Math.round((totalMasuk / totalHariKerja) * 100), 100) : 0;

      return {
        id: g.id,
        nama: g.nama,
        nip: g.nip || g.nuptk || "—",
        inits: g.inits || g.nama.substring(0, 2).toUpperCase(),
        hadir,
        terlambat,
        izin,
        alpa,
        pct,
      };
    });
  }, [guruList, absensiGuruHistory, absensiGuruHariIni, bulan, tahun, totalHariKerja, now]);

  const avgPct = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0;
  const kurang = rows.filter(r => r.pct < 80).length;

  const csvRows: (string | number)[][] = [
    ["No", "Nama Guru", "NIP/NUPTK", "Hadir", "Terlambat", "Izin/Sakit", "Alpa", "% Kehadiran"],
    ...rows.map((g, i) => [i + 1, g.nama, g.nip, g.hadir, g.terlambat, g.izin, g.alpa, `${g.pct}%`]),
    ["RATA-RATA", "", "", "", "", "", "", `${avgPct}%`],
  ];

  return (
    <div className="space-y-4 print-container">
      <KopSuratResmi
        title="REKAPITULASI PRESENSI KEHADIRAN GURU"
        subtitle={`Periode: ${namaBulan} ${tahun} (${totalHariKerja} Hari Kerja) — MTs Al-Ittihad`}
      />

      {/* KPI Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 no-print">
        <KpiChip label="Hari Kerja Efektif" value={`${totalHariKerja} hari`} desc="Senin–Sabtu bulan berjalan" />
        <KpiChip
          label="Rata-rata Kehadiran"
          value={`${avgPct}%`}
          color={avgPct >= 80 ? "#3E8A2F" : "#DC2626"}
          desc="Tingkat kedisiplinan guru"
        />
        <KpiChip
          label="Kehadiran < 80%"
          value={`${kurang} guru`}
          color={kurang > 0 ? "#DC2626" : "#3E8A2F"}
          desc="Memerlukan pembinaan"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs">
        <ReportToolbar
          title="Rekap Absensi Guru"
          subtitle={`Presensi kehadiran guru periode ${namaBulan} ${tahun}`}
          csvRows={csvRows}
          csvFilename={`Rekap-Absensi-Guru-${namaBulan}-${tahun}.csv`}
        >
          <div className="flex items-center gap-1.5">
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              {BULAN_OPTIONS.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E2E8DE] bg-white text-[#1C2517] focus:outline-none focus:border-[#3E8A2F]"
            >
              {TAHUN_OPTIONS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </ReportToolbar>

        {rows.length === 0 ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} className="text-[#92400E]" />
            </div>
            <h4 className="text-base font-bold text-[#1C2517] mb-1">Belum Ada Data Guru Aktif</h4>
            <p className="text-xs text-[#6B7769] leading-relaxed mb-5">
              Data guru madrasah dapat ditambahkan melalui menu <strong>Akademik &gt; Guru</strong>. Presensi harian dicatat pada menu <strong>Akademik &gt; Absensi Guru</strong>.
            </p>
            <button
              onClick={() => navigate("/akademik/guru")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors cursor-pointer"
            >
              Kelola Data Guru <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable>
              <thead>
                <tr className="border-b border-[#E2E8DE]">
                  <Th className="pl-6 pr-3 w-10">No</Th>
                  <Th className="pr-3">Nama Guru</Th>
                  <Th className="pr-3">NIP / NUPTK</Th>
                  <Th align="right" className="pr-3">Hadir</Th>
                  <Th align="right" className="pr-3">Terlambat</Th>
                  <Th align="right" className="pr-3">Izin / Sakit</Th>
                  <Th align="right" className="pr-3">Alpa</Th>
                  <Th className="pr-6">% Kehadiran</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g, idx) => {
                  const pctColor = g.pct >= 90 ? "#3E8A2F" : g.pct >= 75 ? "#D97706" : "#DC2626";
                  return (
                    <tr key={g.id} className="hover:bg-[#FAFBF9] border-b border-[#F0F7EE]">
                      <td className="py-3 pl-6 pr-3 text-xs text-[#9CA3A0] tabular-nums">{idx + 1}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[9px] font-bold shrink-0 no-print">
                            {g.inits}
                          </div>
                          <span className="text-xs font-semibold text-[#1C2517]">{g.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#6B7769] tabular-nums">{g.nip}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-xs font-bold text-[#3E8A2F]">{g.hadir}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-xs text-[#D97706]">
                        {g.terlambat > 0 ? g.terlambat : <span className="text-[#D1D5DB]">—</span>}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-xs text-[#6B7769]">
                        {g.izin > 0 ? g.izin : <span className="text-[#D1D5DB]">—</span>}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-xs text-[#DC2626]">
                        {g.alpa > 0 ? g.alpa : <span className="text-[#D1D5DB]">—</span>}
                      </td>
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#F0F7EE] min-w-[50px] no-print">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${g.pct}%`, background: pctColor }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums min-w-[34px]" style={{ color: pctColor }}>{g.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E2E8DE] bg-[#FAFBF9] font-bold text-xs text-[#1C2517]">
                  <td className="py-3 pl-6 pr-3" colSpan={7}>RATA-RATA TINGKAT KEHADIRAN GURU</td>
                  <td className="py-3 pr-6 text-sm tabular-nums font-black" style={{ color: avgPct >= 80 ? "#3E8A2F" : "#DC2626" }}>
                    {avgPct}%
                  </td>
                </tr>
              </tfoot>
            </DataTable>
          </div>
        )}
      </div>

      <TandaTanganResmi />
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────

export function Laporan() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Validasi tab, fallback ke bku
  const validIds = new Set(REPORTS.map(r => r.id));
  const selectedId = tab && validIds.has(tab) ? tab : "bku";
  const selected = REPORTS.find(r => r.id === selectedId) ?? REPORTS[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 px-4 md:px-0">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm 15mm;
          }
          aside, header, nav, .no-print, button, .action-toolbar {
            display: none !important;
          }
          body, #root, main {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <h2 className="text-[#1C2517] text-xl font-bold tracking-tight">Pusat Laporan</h2>
        <p className="text-xs sm:text-sm text-[#6B7769]">
          Rekapitulasi keuangan, buku kas, dana BOS, neraca, serta monitoring operasional MTs Al-Ittihad
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 no-print">
        {REPORTS.map(r => (
          <ReportCard
            key={r.id}
            r={r}
            selected={selectedId === r.id}
            onSelect={() => navigate(`/keuangan/laporan/${r.id}`)}
          />
        ))}
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 no-print">
          <p className="text-[10px] font-bold text-[#9CA3A0] uppercase tracking-widest whitespace-nowrap">
            Lembar Laporan Aktif
          </p>
          <div className="flex-1 h-px bg-[#E2E8DE]" />
          <span className="text-xs text-[#3E8A2F] font-bold whitespace-nowrap bg-[#EDF7EC] px-2.5 py-0.5 rounded-full">
            {selected.nama}
          </span>
        </div>

        {/* Tab Switcher */}
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
