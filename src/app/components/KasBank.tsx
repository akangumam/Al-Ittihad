import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, MoreHorizontal, ArrowRight, Landmark, Wallet, X,
  TrendingUp, TrendingDown, Edit2, Trash2, AlertTriangle, Building,
  Printer, Download, Eye, FileText, CheckCircle2,
} from "lucide-react";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import type { AkunNama, ManualTransaksiRow, BankTransferRow } from "@/types";
import { toast } from "sonner";

import {
  BSI_SPARK, MANDIRI_SPARK, KAS_SPARK,
  akunData, AkunRow, resolveAkunForPembayaran,
} from "@/data/keuangan";

// ─── constants ────────────────────────────────────────────────────────────────

const AKUN_OPTIONS: AkunNama[] = ["Bank BSI", "Bank Mandiri Syariah", "Kas Tunai"];

const KATEGORI_MASUK = [
  "Dana BOS", "Infaq", "Bantuan", "Daftar Ulang", "PPDB",
  "Administrasi Kelas 9", "Penerimaan Lainnya",
];
const KATEGORI_KELUAR = [
  "Operasional", "Honor/Gaji", "Utilitas", "Kegiatan Siswa",
  "ATK & Perlengkapan", "Pemeliharaan", "Dana BOS", "Pengeluaran Lainnya",
];

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
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
    </svg>
  );
}

// ─── helpers & reporting ──────────────────────────────────────────────────────

function fmtTanggal(isoOrStr: string): string {
  const d = new Date(isoOrStr);
  if (isNaN(d.getTime())) return isoOrStr;
  return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
}

function getAkunForTrx(metode: string, customAkun?: string, list?: AkunRow[]): AkunNama {
  return (customAkun || resolveAkunForPembayaran(metode, customAkun, list)) as AkunNama;
}

function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function terbilang(n: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  n = Math.floor(Math.abs(n));
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + bilangan[n % 10];
  if (n < 200) return "Seratus " + terbilang(n - 100);
  if (n < 1000) return bilangan[Math.floor(n / 100)] + " Ratus " + terbilang(n % 100);
  if (n < 2000) return "Seribu " + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
  return "";
}

function fmtTerbilang(n: number): string {
  const str = terbilang(n).trim().replace(/\s+/g, " ");
  return str ? `${str} Rupiah` : "Nol Rupiah";
}

// ─── printable Bukti Kas (BKM / BKK) ─────────────────────────────────────────

function printBuktiKas(tx: {
  ref: string;
  tanggal: string;
  tipe: "masuk" | "keluar";
  keterangan: string;
  kategori: string;
  akun: string;
  jumlah: number;
  catatan?: string;
  dicatatOleh?: string;
  rabNama?: string;
}, madrasahInfo: {
  namaMadrasah: string;
  alamatMadrasah: string;
  tahunAjaran: string;
}) {
  const isMasuk = tx.tipe === "masuk";
  const judul = isMasuk ? "BUKTI KAS MASUK (BKM)" : "BUKTI KAS KELUAR (BKK)";
  const win = window.open("", "_blank", "width=850,height=700");
  if (!win) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${judul} - ${tx.ref}</title>
      <style>
        @page { size: A5 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; color: #1c2517; margin: 0; padding: 16px; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px double #333; padding-bottom: 8px; margin-bottom: 12px; }
        .header h2 { margin: 0; font-size: 17px; text-transform: uppercase; color: #166534; }
        .header h3 { margin: 2px 0 4px 0; font-size: 14px; color: #374151; }
        .header p { margin: 0; font-size: 11px; color: #6b7280; }
        .title-badge { text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin: 12px 0; text-transform: uppercase; }
        .meta-box { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 12px; }
        .table-info { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .table-info td { padding: 6px 4px; vertical-align: top; }
        .table-info td.label { width: 170px; color: #4b5563; font-weight: 500; }
        .amount-box {
          background: ${isMasuk ? "#f0fdf4" : "#fef2f2"};
          border: 1.5px solid ${isMasuk ? "#86efac" : "#fca5a5"};
          padding: 10px 14px; border-radius: 6px; margin: 12px 0;
          display: flex; justify-content: space-between; align-items: center;
        }
        .signatures { margin-top: 30px; display: flex; justify-content: space-between; text-align: center; page-break-inside: avoid; }
        .sig-block { width: 28%; }
        .sig-line { margin-top: 55px; border-bottom: 1px solid #333; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD</h2>
        <h3>${madrasahInfo.namaMadrasah || "MTs Al-Ittihad Pedaleman"}</h3>
        <p>${madrasahInfo.alamatMadrasah || "Kec. Tanara, Kab. Serang, Banten"}</p>
      </div>

      <div class="title-badge">${judul}</div>

      <div class="meta-box">
        <div><strong>No. Bukti / Voucher:</strong> ${tx.ref}</div>
        <div><strong>Tanggal Transaksi:</strong> ${tx.tanggal}</div>
      </div>

      <table class="table-info">
        <tr>
          <td class="label">${isMasuk ? "Diterima Dari" : "Dibayarkan Kepada"}</td>
          <td>: <strong>${tx.keterangan}</strong></td>
        </tr>
        <tr>
          <td class="label">Akun Keuangan</td>
          <td>: ${tx.akun}</td>
        </tr>
        <tr>
          <td class="label">Kategori Transaksi</td>
          <td>: ${tx.kategori}</td>
        </tr>
        ${tx.rabNama ? `
        <tr>
          <td class="label">Alokasi Mata Anggaran (RAB)</td>
          <td>: <strong style="color: #166534;">${tx.rabNama}</strong></td>
        </tr>` : ""}
        ${tx.catatan ? `
        <tr>
          <td class="label">Catatan Tambahan</td>
          <td>: ${tx.catatan}</td>
        </tr>` : ""}
      </table>

      <div class="amount-box">
        <div>
          <span style="font-size: 11px; color: #4b5563; display: block;">Jumlah Terbilang:</span>
          <em style="font-size: 13px; font-weight: 600;">${fmtTerbilang(tx.jumlah)}</em>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #4b5563; display: block;">Total Nominal:</span>
          <span style="font-size: 18px; font-weight: bold; color: ${isMasuk ? "#166534" : "#dc2626"};">
            Rp ${tx.jumlah.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div>Mengetahui,</div>
          <div style="font-size: 11px; color: #6b7280;">Kepala Madrasah</div>
          <div class="sig-line">( ................................ )</div>
        </div>
        <div class="sig-block">
          <div>Bendahara Madrasah,</div>
          <div style="font-size: 11px; color: #6b7280;">Dicatat: ${tx.dicatatOleh || "Bendahara"}</div>
          <div class="sig-line">( ................................ )</div>
        </div>
        <div class="sig-block">
          <div>${isMasuk ? "Penyetor / Wajib Bayar" : "Penerima Dana"},</div>
          <div style="font-size: 11px; color: #6b7280;">Pihak Terkait</div>
          <div class="sig-line">( ................................ )</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// ─── printable Buku Kas Umum ─────────────────────────────────────────────────

function printBukuKas(
  rows: any[],
  madrasahInfo: { namaMadrasah: string; alamatMadrasah: string; tahunAjaran: string },
  filterLabel: string
) {
  const win = window.open("", "_blank", "width=950,height=700");
  if (!win) {
    window.print();
    return;
  }

  const totalMasuk = rows.filter(r => r.tipe === "masuk").reduce((s, r) => s + r.jumlah, 0);
  const totalKeluar = rows.filter(r => r.tipe === "keluar").reduce((s, r) => s + r.jumlah, 0);
  const saldoBersih = totalMasuk - totalKeluar;
  const todayFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const tableRowsHtml = rows.map((r, i) => `
    <tr>
      <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${r.tanggal}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 11px;">${r.ref}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600;">${r.keterangan}</div>
        <div style="font-size: 11px; color: #6b7280;">${r.kategori} ${r.rabNama ? `• [${r.rabNama}]` : ""}</div>
      </td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${r.akun}</td>
      <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #166534;">
        ${r.tipe === "masuk" ? "Rp " + r.jumlah.toLocaleString("id-ID") : "—"}
      </td>
      <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #dc2626;">
        ${r.tipe === "keluar" ? "Rp " + r.jumlah.toLocaleString("id-ID") : "—"}
      </td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Buku Kas Umum - ${madrasahInfo.namaMadrasah}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; color: #1c2517; margin: 0; padding: 12px; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #166534; padding-bottom: 8px; margin-bottom: 14px; }
        .header h2 { margin: 0; font-size: 16px; color: #166534; }
        .header h3 { margin: 2px 0; font-size: 13px; color: #374151; }
        .header p { margin: 0; font-size: 10px; color: #6b7280; }
        .summary-grid { display: flex; gap: 12px; margin-bottom: 14px; }
        .summary-card { flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 7px 8px; font-weight: bold; text-align: left; }
        tfoot tr { background: #f1f5f9; font-weight: bold; font-size: 11px; }
        .signatures { margin-top: 24px; display: flex; justify-content: space-between; text-align: center; page-break-inside: avoid; }
        .sig-block { width: 35%; }
        .sig-line { margin-top: 55px; border-bottom: 1px solid #333; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD</h2>
        <h3>${madrasahInfo.namaMadrasah} — BUKU KAS UMUM & REKAP TRANSAKSI</h3>
        <p>${madrasahInfo.alamatMadrasah} | TA ${madrasahInfo.tahunAjaran}</p>
        <p style="margin-top: 4px; font-weight: bold; color: #166534;">Filter: ${filterLabel} | Dicetak: ${todayFormatted}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div style="font-size: 10px; color: #166534;">Total Pemasukan</div>
          <div style="font-size: 15px; font-weight: bold; color: #166534;">Rp ${totalMasuk.toLocaleString("id-ID")}</div>
        </div>
        <div class="summary-card" style="background: #fef2f2; border-color: #fecaca;">
          <div style="font-size: 10px; color: #991b1b;">Total Pengeluaran</div>
          <div style="font-size: 15px; font-weight: bold; color: #dc2626;">Rp ${totalKeluar.toLocaleString("id-ID")}</div>
        </div>
        <div class="summary-card" style="background: #eff6ff; border-color: #bfdbfe;">
          <div style="font-size: 10px; color: #1e40af;">Saldo Bersih Terhitung</div>
          <div style="font-size: 15px; font-weight: bold; color: ${saldoBersih >= 0 ? "#166534" : "#dc2626"};">
            Rp ${saldoBersih.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">No</th>
            <th style="width: 85px;">Tanggal</th>
            <th style="width: 120px;">No. Bukti / Ref</th>
            <th>Keterangan / Kategori</th>
            <th style="width: 120px;">Akun</th>
            <th style="width: 110px; text-align: right;">Masuk (Rp)</th>
            <th style="width: 110px; text-align: right;">Keluar (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;">TOTAL:</td>
            <td style="padding: 8px; text-align: right; color: #166534;">Rp ${totalMasuk.toLocaleString("id-ID")}</td>
            <td style="padding: 8px; text-align: right; color: #dc2626;">Rp ${totalKeluar.toLocaleString("id-ID")}</td>
          </tr>
        </tfoot>
      </table>

      <div class="signatures">
        <div class="sig-block">
          <div>Mengetahui,</div>
          <div style="font-size: 11px; color: #6b7280;">Kepala Madrasah</div>
          <div class="sig-line">( ................................ )</div>
        </div>
        <div class="sig-block">
          <div>Tanara, ${todayFormatted}</div>
          <div style="font-size: 11px; color: #6b7280;">Bendahara Madrasah</div>
          <div class="sig-line">( ................................ )</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// ─── printable Bukti Transfer ────────────────────────────────────────────────

function printBuktiTransfer(
  bt: BankTransferRow,
  madrasahInfo: { namaMadrasah: string; alamatMadrasah: string; tahunAjaran: string }
) {
  const win = window.open("", "_blank", "width=850,height=650");
  if (!win) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Bukti Mutasi Kas - ${bt.id}</title>
      <style>
        @page { size: A5 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; color: #1c2517; margin: 0; padding: 16px; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px double #333; padding-bottom: 8px; margin-bottom: 12px; }
        .header h2 { margin: 0; font-size: 16px; color: #166534; }
        .header h3 { margin: 2px 0; font-size: 13px; color: #374151; }
        .header p { margin: 0; font-size: 10px; color: #6b7280; }
        .title { text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin: 12px 0; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td { padding: 6px 4px; vertical-align: top; }
        .info-table td.lbl { width: 150px; color: #4b5563; }
        .transfer-box {
          background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 12px;
          display: flex; justify-content: space-between; align-items: center; margin: 12px 0;
        }
        .signatures { margin-top: 30px; display: flex; justify-content: space-around; text-align: center; }
        .sig-block { width: 35%; }
        .sig-line { margin-top: 55px; border-bottom: 1px solid #333; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD</h2>
        <h3>${madrasahInfo.namaMadrasah}</h3>
        <p>${madrasahInfo.alamatMadrasah}</p>
      </div>

      <div class="title">BUKTI MUTASI KAS / TRANSFER ANTAR-AKUN</div>

      <table class="info-table">
        <tr><td class="lbl">ID Mutasi</td><td>: <strong>${bt.id}</strong></td></tr>
        <tr><td class="lbl">Tanggal</td><td>: ${fmtTanggal(bt.tanggal)}</td></tr>
        <tr><td class="lbl">Dari Akun (Sumber)</td><td>: <strong style="color: #dc2626;">${bt.dari}</strong></td></tr>
        <tr><td class="lbl">Ke Akun (Tujuan)</td><td>: <strong style="color: #166534;">${bt.ke}</strong></td></tr>
        <tr><td class="lbl">Catatan / Alasan</td><td>: ${bt.catatan || "—"}</td></tr>
        <tr><td class="lbl">Status Mutasi</td><td>: <strong>${bt.status}</strong></td></tr>
      </table>

      <div class="transfer-box">
        <div>
          <span style="font-size: 11px; color: #4b5563; display: block;">Terbilang:</span>
          <em>${fmtTerbilang(bt.nominal)}</em>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #4b5563; display: block;">Nominal Transfer:</span>
          <span style="font-size: 18px; font-weight: bold; color: #1e40af;">Rp ${bt.nominal.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div>Mengetahui,</div>
          <div style="font-size: 11px; color: #6b7280;">Kepala Madrasah</div>
          <div class="sig-line">( ................................ )</div>
        </div>
        <div class="sig-block">
          <div>Dilaksanakan Oleh,</div>
          <div style="font-size: 11px; color: #6b7280;">${bt.dicatatOleh || "Bendahara"}</div>
          <div class="sig-line">( ................................ )</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// ─── Transaksi Detail Modal ──────────────────────────────────────────────────

function TransaksiDetailModal({
  tx,
  onClose,
  onPrint,
  onDelete,
  canDelete,
}: {
  tx: any;
  onClose: () => void;
  onPrint: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const isMasuk = tx.tipe === "masuk";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1C2517]/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#E2E8DE] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8DE] bg-[#FAFBF9]">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMasuk ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
                {isMasuk ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div>
                <h3 className="font-bold text-[#1C2517] text-sm">Detail Transaksi {isMasuk ? "Pemasukan" : "Pengeluaran"}</h3>
                <p className="text-xs text-[#6B7769]">{tx.ref}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3A0] hover:text-[#1C2517] hover:bg-black/5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Amount card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isMasuk ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF2F2] border-[#FECACA]"}`}>
              <div>
                <span className="text-xs text-[#6B7769] block">Nominal Transaksi</span>
                <span className={`text-2xl font-bold tabular-nums ${isMasuk ? "text-[#166534]" : "text-[#DC2626]"}`}>
                  {isMasuk ? "+" : "−"}{fmt(tx.jumlah)}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isMasuk ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
                {isMasuk ? "Pemasukan Kas" : "Pengeluaran Kas"}
              </span>
            </div>

            {/* Field breakdown */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Tanggal</span>
                <span className="font-semibold text-[#1C2517]">{tx.tanggal}</span>
              </div>
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Akun Kas / Bank</span>
                <span className="font-semibold text-[#1C2517]">{tx.akun}</span>
              </div>
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Kategori</span>
                <span className="font-semibold text-[#1C2517]">{tx.kategori}</span>
              </div>
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Dicatat Oleh</span>
                <span className="font-semibold text-[#1C2517]">{tx.dicatatOleh || "Sistem"}</span>
              </div>
            </div>

            {/* Description & Note */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Keterangan Transaksi</span>
                <span className="font-medium text-[#1C2517] text-sm">{tx.keterangan}</span>
              </div>
              {tx.rabNama && (
                <div className="p-3 bg-[#EDF7EC] rounded-lg border border-[#BBF7D0]">
                  <span className="text-[#166534] block text-[11px] font-semibold mb-0.5">Alokasi Mata Anggaran (RAB)</span>
                  <span className="font-bold text-[#166534]">{tx.rabNama}</span>
                </div>
              )}
              {tx.catatan && (
                <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E2E8DE]">
                  <span className="text-[#9CA3A0] block text-[11px] mb-0.5">Catatan Tambahan</span>
                  <p className="text-[#374040] italic">{tx.catatan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8DE] bg-[#FAFBF9]">
            {canDelete && onDelete ? (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
              >
                <Trash2 size={13} />
                Hapus Transaksi
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#374040] bg-white border border-[#E2E8DE] hover:bg-[#F5F9F4] transition-colors"
              >
                <Printer size={13} />
                Cetak Bukti (Voucher)
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Delete Transaksi Dialog ─────────────────────────────────────────────────

function DeleteTransaksiDialog({
  tx,
  onClose,
  onConfirm,
}: {
  tx: any;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1C2517]/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E2E8DE] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-[#DC2626]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C2517]">Hapus Transaksi Keuangan</h3>
              <p className="text-xs text-[#6B7769] mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>

          <p className="text-sm text-[#374040] leading-relaxed">
            Anda akan menghapus transaksi <strong>{tx.ref}</strong> (<em>{tx.keterangan}</em>) sebesar{" "}
            <strong className="text-[#DC2626]">{fmt(tx.jumlah)}</strong> pada akun <strong>{tx.akun}</strong>.
          </p>

          {tx.rabNama && (
            <div className="p-3 bg-[#FEF3C7] rounded-lg border border-[#FDE68A] text-xs text-[#92400E]">
              <strong>Perhatian:</strong> Pengeluaran ini sebelumnya dialokasikan pada mata anggaran{" "}
              <strong>{tx.rabNama}</strong>. Menghapus transaksi ini akan secara otomatis mengembalikan (rollback) serapan anggaran tersebut.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#374040] hover:bg-[#F5F9F4] border border-[#E2E8DE] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors shadow-sm"
            >
              Ya, Hapus Transaksi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Delete Bank Transfer Dialog ──────────────────────────────────────────────

function DeleteBankTransferDialog({
  transfer,
  onClose,
  onConfirm,
}: {
  transfer: BankTransferRow;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1C2517]/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E2E8DE] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-[#DC2626]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C2517]">Batalkan Mutasi Transfer</h3>
              <p className="text-xs text-[#6B7769] mt-0.5">Kembalikan saldo transfer antar akun</p>
            </div>
          </div>

          <p className="text-sm text-[#374040] leading-relaxed">
            Apakah Anda yakin ingin membatalkan mutasi transfer <strong>{fmt(transfer.nominal)}</strong> dari akun{" "}
            <strong>{transfer.dari}</strong> ke <strong>{transfer.ke}</strong>?
          </p>

          <p className="text-xs text-[#6B7769] bg-[#FAFBF9] p-2.5 rounded border border-[#E2E8DE]">
            Saldo berjalan kedua akun keuangan akan secara otomatis disesuaikan kembali ke keadaan sebelum transfer.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#374040] hover:bg-[#F5F9F4] border border-[#E2E8DE] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors shadow-sm"
            >
              Ya, Batalkan Mutasi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Transaksi form sheet ─────────────────────────────────────────────────────

function TransaksiSheet({
  tipe,
  onClose,
  onSave,
}: {
  tipe: "masuk" | "keluar";
  onClose: () => void;
  onSave: (data: Omit<ManualTransaksiRow, "id" | "dicatatOleh" | "waktuCatat" | "ref"> & { rabId?: number }) => void;
}) {
  const { akunList, rabList } = useAppContext();
  const optionsAkun = akunList.length > 0 ? akunList.map(a => a.nama) : AKUN_OPTIONS;
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    tanggal: today,
    keterangan: "",
    kategori: tipe === "masuk" ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0],
    akun: (optionsAkun[0] || "Bank BSI") as AkunNama,
    jumlah: "",
    catatan: "",
    rabId: undefined as number | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isIncome = tipe === "masuk";

  function validate() {
    const e: Record<string, string> = {};
    if (!form.tanggal) e.tanggal = "Tanggal wajib diisi";
    if (!form.keterangan.trim()) e.keterangan = "Keterangan wajib diisi";
    const nominal = parseInt(form.jumlah.replace(/\D/g, ""), 10);
    if (!nominal || nominal <= 0) e.jumlah = "Jumlah harus lebih dari 0";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const nominal = parseInt(form.jumlah.replace(/\D/g, ""), 10);
    onSave({
      tipe,
      tanggal: form.tanggal,
      keterangan: form.keterangan.trim(),
      kategori: form.kategori,
      akun: form.akun,
      jumlah: nominal,
      catatan: form.catatan.trim() || undefined,
      rabId: form.rabId,
    });
  }

  function fmtInput(v: string) {
    const num = v.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("id-ID");
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[480px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: isIncome ? "#EDF7EC" : "#FEE2E2" }}
            >
              {isIncome
                ? <TrendingUp size={17} className="text-[#3E8A2F]" />
                : <TrendingDown size={17} className="text-[#DC2626]" />}
            </div>
            <div>
              <h3 className="font-bold text-[#1C2517]">
                Catat {isIncome ? "Pemasukan" : "Pengeluaran"}
              </h3>
              <p className="text-xs text-[#6B7769] mt-0.5">Entry manual — ref BV/…</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
              Tanggal <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={e => { setForm(f => ({ ...f, tanggal: e.target.value })); setErrors(er => ({ ...er, tanggal: "" })); }}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none transition-colors"
              style={{ border: errors.tanggal ? "1.5px solid #DC2626" : "1px solid #E2E8DE" }}
            />
            {errors.tanggal && <p className="text-xs text-[#DC2626] mt-1">{errors.tanggal}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
              Keterangan <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={form.keterangan}
              onChange={e => { setForm(f => ({ ...f, keterangan: e.target.value })); setErrors(er => ({ ...er, keterangan: "" })); }}
              placeholder={isIncome ? "Contoh: Penerimaan Dana BOS Triwulan III" : "Contoh: Pembelian ATK Semester 1"}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none transition-colors"
              style={{ border: errors.keterangan ? "1.5px solid #DC2626" : "1px solid #E2E8DE" }}
            />
            {errors.keterangan && <p className="text-xs text-[#DC2626] mt-1">{errors.keterangan}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
              Kategori <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <select
                value={form.kategori}
                onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
              >
                {(isIncome ? KATEGORI_MASUK : KATEGORI_KELUAR).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
            </div>
          </div>

          {/* Alokasi Mata Anggaran RAB (hanya untuk pengeluaran) */}
          {!isIncome && rabList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
                Alokasi ke Mata Anggaran (RAB) <span className="text-xs font-normal text-[#9CA3A0]">(opsional)</span>
              </label>
              <div className="relative">
                <select
                  value={form.rabId || ""}
                  onChange={e => setForm(f => ({ ...f, rabId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
                >
                  <option value="">-- Tanpa Alokasi RAB --</option>
                  {rabList.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.group}] {r.nama} (Sisa: {fmt(r.anggaran - r.terpakai)})
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#9CA3A0] mt-1">
                Jika dipilih, pengeluaran ini otomatis menambah serapan dana pada mata anggaran tersebut.
              </p>
            </div>
          )}

          {/* Akun & Jumlah */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
                Akun <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.akun}
                  onChange={e => setForm(f => ({ ...f, akun: e.target.value as AkunNama }))}
                  className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
                >
                  {optionsAkun.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">
                Jumlah (Rp) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.jumlah}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setForm(f => ({ ...f, jumlah: fmtInput(raw) }));
                  setErrors(er => ({ ...er, jumlah: "" }));
                }}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] tabular-nums outline-none transition-colors"
                style={{ border: errors.jumlah ? "1.5px solid #DC2626" : "1px solid #E2E8DE" }}
              />
              {errors.jumlah && <p className="text-xs text-[#DC2626] mt-1">{errors.jumlah}</p>}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Catatan (opsional)</label>
            <textarea
              value={form.catatan}
              onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
              rows={3}
              placeholder="Keterangan tambahan..."
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors resize-none"
            />
          </div>

          {/* Preview nominal */}
          {form.jumlah && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: isIncome ? "#EDF7EC" : "#FEF2F2", border: `1px solid ${isIncome ? "#BBF7D0" : "#FECACA"}` }}
            >
              {isIncome
                ? <TrendingUp size={15} className="text-[#3E8A2F] shrink-0" />
                : <TrendingDown size={15} className="text-[#DC2626] shrink-0" />}
              <div>
                <p className="text-xs text-[#6B7769]">{isIncome ? "Total Pemasukan" : "Total Pengeluaran"}</p>
                <p
                  className="text-base font-bold tabular-nums"
                  style={{ color: isIncome ? "#3E8A2F" : "#DC2626" }}
                >
                  {isIncome ? "+" : "−"} Rp {form.jumlah}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors border border-[#E2E8DE]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: isIncome ? "#3E8A2F" : "#DC2626" }}
          >
            Simpan {isIncome ? "Pemasukan" : "Pengeluaran"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Transaksi tab ────────────────────────────────────────────────────────────

type FilterType = "Semua" | "Pemasukan" | "Pengeluaran";
const PAGE_SIZE = 15;

function TransaksiTab() {
  const {
    transaksiList, siswaList, tagihanList,
    manualTransaksiList, addManualTransaksi, deleteManualTransaksi, nextBVRef,
    role, akunList, rabList, appSettings,
  } = useAppContext();

  const [filter, setFilter] = useState<FilterType>("Semua");
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [page, setPage] = useState(1);
  const [sheetTipe, setSheetTipe] = useState<"masuk" | "keluar" | null>(null);
  const [detailRow, setDetailRow] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Map real siswa payments (always masuk)
  const pemasukanRows = useMemo(() =>
    transaksiList.map(t => {
      const siswa = siswaList.find(s => s.nis === t.nis);
      const firstAlokasi = t.alokasi[0];
      const tagihan = firstAlokasi ? tagihanList.find(tg => tg.id === firstAlokasi.tagihanId) : undefined;
      const kategori = tagihan?.kategori || "Pembayaran Siswa";
      const nama = siswa?.nama ?? t.nis;
      return {
        id: t.id,
        tanggal: fmtTanggal(t.tanggal),
        tanggalRaw: t.tanggal,
        keterangan: `Pembayaran ${nama}`,
        kategori,
        akun: getAkunForTrx(t.metode, (t as any).akun, akunList),
        ref: t.nomorKuitansi,
        jumlah: t.nominal,
        tipe: "masuk" as const,
        catatan: t.catatan || `Pembayaran oleh ${nama} (${siswa?.kelas || ""}) via ${t.metode}`,
        dicatatOleh: t.dicatatOleh || "Bendahara",
        waktuCatat: t.tanggal,
        rabId: undefined,
        rabNama: undefined,
        isManual: false,
      };
    }).sort((a, b) => b.tanggalRaw.localeCompare(a.tanggalRaw)),
  [transaksiList, siswaList, tagihanList, akunList]);

  // Manual entries (both masuk and keluar)
  const manualRows = useMemo(() =>
    manualTransaksiList.map(t => {
      const linkedRab = t.rabId ? rabList.find(r => r.id === t.rabId) : undefined;
      return {
        id: t.id,
        tanggal: fmtTanggal(t.tanggal),
        tanggalRaw: t.tanggal,
        keterangan: t.keterangan,
        kategori: t.kategori,
        akun: t.akun,
        ref: t.ref,
        jumlah: t.jumlah,
        tipe: t.tipe,
        catatan: t.catatan,
        dicatatOleh: t.dicatatOleh,
        waktuCatat: t.waktuCatat,
        rabId: t.rabId,
        rabNama: linkedRab ? `[${linkedRab.group}] ${linkedRab.nama}` : undefined,
        isManual: true,
      };
    }),
  [manualTransaksiList, rabList]);

  const allRows = useMemo(() => {
    const combined = [...pemasukanRows, ...manualRows];
    return combined.sort((a, b) => b.tanggalRaw.localeCompare(a.tanggalRaw));
  }, [pemasukanRows, manualRows]);

  const kategoriOptions = useMemo(() => {
    const cats = new Set<string>(["Semua Kategori"]);
    allRows.forEach(r => cats.add(r.kategori));
    return Array.from(cats);
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return allRows.filter(r => {
      if (filter === "Pemasukan"   && r.tipe !== "masuk")  return false;
      if (filter === "Pengeluaran" && r.tipe !== "keluar") return false;
      if (kategoriFilter !== "Semua Kategori" && r.kategori !== kategoriFilter) return false;
      if (q && !r.keterangan.toLowerCase().includes(q) && !r.ref.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allRows, filter, kategoriFilter, search]);

  useEffect(() => { setPage(1); }, [filter, kategoriFilter, search]);

  const totalMasuk  = useMemo(() => [...pemasukanRows, ...manualRows.filter(r => r.tipe === "masuk")]
    .reduce((s, r) => s + r.jumlah, 0), [pemasukanRows, manualRows]);
  const totalKeluar = useMemo(() => manualRows.filter(r => r.tipe === "keluar")
    .reduce((s, r) => s + r.jumlah, 0), [manualRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paged = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const canEdit = role === "Admin" || role === "Bendahara";

  function handleSave(data: Omit<ManualTransaksiRow, "id" | "dicatatOleh" | "waktuCatat" | "ref"> & { rabId?: number }) {
    const ref = nextBVRef(data.tipe);
    addManualTransaksi({
      ...data,
      id: crypto.randomUUID(),
      ref,
      dicatatOleh: role,
      waktuCatat: new Date().toISOString(),
    });
    setSheetTipe(null);
    toast.success(`${data.tipe === "masuk" ? "Pemasukan" : "Pengeluaran"} berhasil dicatat (${ref})`);
  }

  function handleExportCSV() {
    const headers = ["No. Ref", "Tanggal", "Tipe", "Keterangan", "Kategori", "Akun", "Jumlah (Rp)", "Alokasi RAB", "Dicatat Oleh", "Catatan"];
    const rows = filteredRows.map(r => [
      r.ref,
      r.tanggal,
      r.tipe === "masuk" ? "Pemasukan" : "Pengeluaran",
      r.keterangan,
      r.kategori,
      r.akun,
      r.jumlah,
      r.rabNama || "—",
      r.dicatatOleh || "—",
      r.catatan || "—",
    ]);
    downloadCSV(`buku-kas-${filter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
    toast.success(`${filteredRows.length} transaksi berhasil diekspor ke CSV`);
  }

  function handlePrintRekap() {
    printBukuKas(
      filteredRows,
      {
        namaMadrasah: appSettings.namaMadrasah,
        alamatMadrasah: appSettings.alamatMadrasah,
        tahunAjaran: appSettings.tahunAjaran,
      },
      `${filter} (${kategoriFilter})`
    );
  }

  function handlePrintItem(r: any) {
    printBuktiKas(r, {
      namaMadrasah: appSettings.namaMadrasah,
      alamatMadrasah: appSettings.alamatMadrasah,
      tahunAjaran: appSettings.tahunAjaran,
    });
  }

  return (
    <>
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      {/* Toolbar */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented filter */}
          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid #E2E8DE" }}>
            {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((f, i) => (
              <button key={f} onClick={() => setFilter(f)}
                className={[
                  "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  i > 0 ? "border-l border-[#E2E8DE]" : "",
                  filter === f ? "bg-[#3E8A2F] text-white" : "text-[#6B7769] bg-white hover:bg-[#F5F9F4]",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
            <Search size={13} className="text-[#9CA3A0] shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari keterangan / no. ref..."
              className="bg-transparent outline-none text-sm text-[#1C2517] w-40" />
          </div>

          {/* Category */}
          <div className="relative">
            <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
              {kategoriOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          {/* Export & Print Rekap */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#374040] bg-white hover:bg-[#F5F9F4] border border-[#E2E8DE] transition-colors"
              title="Ekspor CSV"
            >
              <Download size={13} className="text-[#6B7769]" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handlePrintRekap}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#374040] bg-white hover:bg-[#F5F9F4] border border-[#E2E8DE] transition-colors"
              title="Cetak Rekap Buku Kas"
            >
              <Printer size={13} className="text-[#6B7769]" />
              <span className="hidden sm:inline">Cetak Buku Kas</span>
            </button>
          </div>

          {/* Action buttons */}
          {canEdit && (
            <div className="w-full sm:w-auto sm:ml-auto flex gap-2 shrink-0">
              <button
                onClick={() => setSheetTipe("masuk")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3E8A2F] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E6B22] transition-colors shadow-sm"
              >
                <Plus size={14} />
                Pemasukan
              </button>
              <button
                onClick={() => setSheetTipe("keluar")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                style={{ border: "1.5px solid #DC2626" }}
              >
                <span className="font-bold text-base leading-none">−</span>
                Pengeluaran
              </button>
            </div>
          )}
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EDF7EC]">
            <TrendingUp size={14} className="text-[#3E8A2F] shrink-0" />
            <span className="text-xs text-[#6B7769]">Pemasukan:</span>
            <span className="text-xs sm:text-sm font-bold tabular-nums text-[#3E8A2F] ml-auto">{fmt(totalMasuk)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FEE2E2]">
            <TrendingDown size={14} className="text-[#DC2626] shrink-0" />
            <span className="text-xs text-[#6B7769]">Pengeluaran:</span>
            <span className="text-xs sm:text-sm font-bold tabular-nums text-[#DC2626] ml-auto">{fmt(totalKeluar)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F9F4]">
            <span className="text-xs text-[#6B7769]">Saldo Berjalan:</span>
            <span className={`text-xs sm:text-sm font-bold tabular-nums ml-auto ${totalMasuk - totalKeluar >= 0 ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
              {fmt(totalMasuk - totalKeluar)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile Transaction Cards (md:hidden) ── */}
      <div className="md:hidden flex flex-col gap-2 p-3">
        {paged.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#9CA3A0]">Belum ada transaksi</div>
        ) : (
          paged.map((row) => (
            <div key={row.id} className="bg-white rounded-xl p-3.5 border border-[#E2E8DE] shadow-sm flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${row.tipe === "masuk" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
                    {row.tipe === "masuk" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C2517] leading-tight truncate">{row.keterangan}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-[10px] text-[#6B7769] font-medium bg-[#F5F9F4] px-1.5 py-0.5 rounded">
                        {row.kategori}
                      </span>
                      {row.rabNama && (
                        <span className="text-[10px] text-[#166534] font-semibold bg-[#DCFCE7] px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          RAB: {row.rabNama}
                        </span>
                      )}
                      <span className="text-[10px] text-[#9CA3A0]">•</span>
                      <span className="text-[11px] text-[#6B7769]">{row.akun}</span>
                      <span className="text-[10px] text-[#9CA3A0]">•</span>
                      <span className="text-[11px] text-[#9CA3A0]">{row.tanggal}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold tabular-nums ${row.tipe === "masuk" ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
                    {row.tipe === "masuk" ? "+" : "−"}{fmt(row.jumlah)}
                  </span>
                </div>
              </div>

              {/* Action buttons on mobile */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0F7EE]">
                <code className="text-[10px] text-[#6B7769] bg-[#FAFBF9] px-1.5 py-0.5 rounded border border-[#E2E8DE]">
                  {row.ref}
                </code>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDetailRow(row)}
                    className="p-1 rounded-md text-[#6B7769] hover:bg-[#F5F9F4]"
                    title="Lihat Detail"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handlePrintItem(row)}
                    className="p-1 rounded-md text-[#6B7769] hover:bg-[#F5F9F4]"
                    title="Cetak Bukti"
                  >
                    <Printer size={14} />
                  </button>
                  {row.isManual && canEdit && (
                    <button
                      onClick={() => setDeleteTarget(row)}
                      className="p-1 rounded-md text-[#DC2626] hover:bg-[#FEE2E2]"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop Table (hidden md:block) ── */}
      <div className="hidden md:block overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4 whitespace-nowrap">Tanggal</Th>
              <Th className="pr-4">Keterangan &amp; Kategori</Th>
              <Th className="pr-4 whitespace-nowrap">Akun</Th>
              <Th className="pr-4">Ref</Th>
              <Th align="right" className="pr-4">Jumlah</Th>
              <th className="py-3 pr-6 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-[#9CA3A0]">
                  Belum ada transaksi
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={row.id} className="hover:bg-[#FAFBF9] transition-colors"
                style={{ borderBottom: i < paged.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                <td className="py-3.5 pl-6 pr-4 text-sm text-[#6B7769] whitespace-nowrap">
                  {row.tanggal}
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-sm font-semibold text-[#1C2517]">{row.keterangan}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F5F9F4] text-[#6B7769]">
                      {row.kategori}
                    </span>
                    {row.rabNama && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                        RAB: {row.rabNama}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-sm text-[#6B7769] whitespace-nowrap">{row.akun}</td>
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
                  <span className={`text-sm font-bold tabular-nums ${row.tipe === "masuk" ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
                    {row.tipe === "masuk" ? "+" : "−"}{fmt(row.jumlah)}
                  </span>
                </td>
                <td className="py-3.5 pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setDetailRow(row)}
                      className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
                      title="Lihat Detail Transaksi"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handlePrintItem(row)}
                      className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
                      title="Cetak Bukti (Voucher)"
                    >
                      <Printer size={14} />
                    </button>
                    {row.isManual && canEdit && (
                      <button
                        onClick={() => setDeleteTarget(row)}
                        className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3.5" style={{ borderTop: "1px solid #E2E8DE" }}>
        <span className="text-xs text-[#6B7769]">
          {filteredRows.length === 0 ? "0 transaksi" : (
            <>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filteredRows.length)} dari{" "}
              <span className="font-semibold text-[#1C2517]">{filteredRows.length}</span> transaksi</>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:text-[#D1D5DB] disabled:cursor-not-allowed text-[#374040]"
            style={{ border: "1px solid #E2E8DE" }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${page === p ? "bg-[#3E8A2F] text-white font-bold" : "text-[#374040] hover:bg-[#EDF7EC] transition-colors"}`}>
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:text-[#D1D5DB] disabled:cursor-not-allowed text-[#374040]"
            style={{ border: "1px solid #E2E8DE" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>

    {/* Sheet Add */}
    {sheetTipe && (
      <TransaksiSheet
        tipe={sheetTipe}
        onClose={() => setSheetTipe(null)}
        onSave={handleSave}
      />
    )}

    {/* Detail Modal */}
    {detailRow && (
      <TransaksiDetailModal
        tx={detailRow}
        onClose={() => setDetailRow(null)}
        onPrint={() => handlePrintItem(detailRow)}
        onDelete={detailRow.isManual && canEdit ? () => {
          setDeleteTarget(detailRow);
          setDetailRow(null);
        } : undefined}
        canDelete={detailRow.isManual && canEdit}
      />
    )}

    {/* Confirm Delete */}
    {deleteTarget && (
      <DeleteTransaksiDialog
        tx={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteManualTransaksi(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    )}
    </>
  );
}

// ─── AkunFormSheet ────────────────────────────────────────────────────────────

type AkunFormMode = "add" | "edit";

function AkunFormSheet({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: AkunFormMode;
  initial?: AkunRow;
  onClose: () => void;
  onSave: (data: Omit<AkunRow, "id">) => void;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [tipe, setTipe] = useState<"bank" | "wallet">(initial?.icon ?? "bank");
  const [nomor, setNomor] = useState(initial?.nomor ?? "");
  const [atasNama, setAtasNama] = useState(initial?.atasNama ?? "");
  const [saldo, setSaldo] = useState(initial?.saldo ? String(initial.saldo) : "");
  const [catatan, setCatatan] = useState(initial?.catatan ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = "Nama akun wajib diisi";
    if (tipe === "bank" && !nomor.trim()) e.nomor = "Nomor rekening wajib diisi untuk akun bank";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const nominalSaldo = Number(saldo.replace(/\D/g, "")) || 0;
    onSave({
      nama: nama.trim(),
      nomor: tipe === "wallet" ? null : (nomor.trim() || null),
      atasNama: atasNama.trim() || undefined,
      saldo: nominalSaldo,
      icon: tipe,
      sparkColor: tipe === "wallet" ? "#F6B31E" : "#3E8A2F",
      spark: [0, 0, 0],
      rekonsiliasi: "—",
      catatan: catatan.trim() || undefined,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[480px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EDF7EC" }}>
              {tipe === "wallet" ? <Wallet size={17} className="text-[#3E8A2F]" /> : <Landmark size={17} className="text-[#3E8A2F]" />}
            </div>
            <div>
              <h3 className="font-bold text-[#1C2517]">{mode === "add" ? "Tambah Akun Keuangan" : "Edit Akun Keuangan"}</h3>
              <p className="text-xs text-[#6B7769] mt-0.5">{mode === "add" ? "Daftarkan rekening bank atau kas tunai baru" : "Perbarui informasi akun keuangan"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Tipe */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-2">Jenis Akun <span className="text-[#DC2626]">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {(["bank", "wallet"] as const).map(t => {
                const isSelected = tipe === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipe(t)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      border: isSelected ? "2px solid #3E8A2F" : "1.5px solid #E2E8DE",
                      background: isSelected ? "#F0FAF0" : "#fff",
                      color: isSelected ? "#1C2517" : "#6B7769",
                    }}
                  >
                    {t === "bank" ? <Landmark size={16} className={isSelected ? "text-[#3E8A2F]" : "text-[#9CA3A0]"} /> : <Wallet size={16} className={isSelected ? "text-[#F6B31E]" : "text-[#9CA3A0]"} />}
                    {t === "bank" ? "Rekening Bank" : "Kas Tunai"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Nama Akun <span className="text-[#DC2626]">*</span></label>
            <input
              type="text" value={nama} placeholder={tipe === "bank" ? "cth. Bank BSI Operasional" : "cth. Kas Tunai TU"}
              onChange={e => { setNama(e.target.value); setErrors(p => ({ ...p, nama: "" })); }}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
              style={{ border: errors.nama ? "1px solid #DC2626" : "1px solid #E2E8DE" }}
            />
            {errors.nama && <p className="text-xs text-[#DC2626] mt-1">{errors.nama}</p>}
          </div>

          {/* Nomor Rekening (hanya untuk bank) */}
          {tipe === "bank" && (
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Nomor Rekening <span className="text-[#DC2626]">*</span></label>
              <input
                type="text" value={nomor} placeholder="cth. 7101-0254-3318"
                onChange={e => { setNomor(e.target.value); setErrors(p => ({ ...p, nomor: "" })); }}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                style={{ border: errors.nomor ? "1px solid #DC2626" : "1px solid #E2E8DE", fontFamily: "monospace" }}
              />
              {errors.nomor && <p className="text-xs text-[#DC2626] mt-1">{errors.nomor}</p>}
            </div>
          )}

          {/* Atas Nama */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Atas Nama</label>
            <input
              type="text" value={atasNama} placeholder="cth. MTs Al-Ittihad Pedaleman"
              onChange={e => setAtasNama(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE]"
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Saldo Awal (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7769]">Rp</span>
              <input
                type="text" inputMode="numeric" value={saldo}
                placeholder="0"
                onChange={e => {
                  const num = e.target.value.replace(/\D/g, "");
                  setSaldo(num ? Number(num).toLocaleString("id-ID") : "");
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE]"
              />
            </div>
            <p className="text-xs text-[#9CA3A0] mt-1">Saldo awal saat akun pertama kali didaftarkan</p>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Catatan</label>
            <textarea
              value={catatan} rows={2} placeholder="Keterangan tambahan akun..."
              onChange={e => setCatatan(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 flex gap-3" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#6B7769] bg-[#F5F9F4] hover:bg-[#E8F0E5] transition-colors"
          >Batal</button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "#3E8A2F" }}
          >{mode === "add" ? "Tambah Akun" : "Simpan Perubahan"}</button>
        </div>
      </div>
    </>
  );
}

// ─── DeleteAkunDialog ─────────────────────────────────────────────────────────

function DeleteAkunDialog({
  akun,
  onClose,
  onConfirm,
}: {
  akun: AkunRow;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-[#DC2626]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C2517] mb-1">Hapus Akun Keuangan</h3>
              <p className="text-sm text-[#6B7769]">
                Anda akan menghapus akun <strong>"{akun.nama}"</strong>
                {akun.nomor ? ` (${akun.nomor})` : ""}. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#6B7769] bg-[#F5F9F4] hover:bg-[#E8F0E5] transition-colors"
            >Batal</button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors"
            >Ya, Hapus</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Akun tab ─────────────────────────────────────────────────────────────────

function AkunTab() {
  const { manualTransaksiList, bankTransferList, computedAkunList, addAkun, updateAkun, deleteAkun } = useAppContext();
  const [formMode, setFormMode] = useState<{ mode: AkunFormMode; akun?: AkunRow } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AkunRow | null>(null);

  const computedAkun = computedAkunList;

  function handleDelete(akun: AkunRow) {
    const result = deleteAkun(akun.id);
    if (!result.success) {
      toast.error(result.message ?? "Gagal menghapus akun");
    } else {
      toast.success(`Akun "${akun.nama}" berhasil dihapus`);
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {computedAkun.map((akun) => {
          const Icon = akun.icon === "wallet" ? Wallet : Landmark;
          const iconBg    = akun.icon === "wallet" ? "#FEF3C7" : "#EDF7EC";
          const iconColor = akun.icon === "wallet" ? "#92400E" : "#3E8A2F";
          const manualTrxCount = manualTransaksiList.filter(t => t.akun === akun.nama).length;
          const transferCount  = bankTransferList.filter(t => t.dari === akun.nama || t.ke === akun.nama).length;
          const hasTrx = (manualTrxCount + transferCount) > 0;

          return (
            <div key={String(akun.id)} className="bg-white rounded-xl p-5 flex flex-col group relative" style={{ border: "1px solid #E2E8DE" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                    <Icon size={15} style={{ color: iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C2517] truncate">{akun.nama}</p>
                    {akun.nomor
                      ? <p className="text-[11px] text-[#9CA3A0] mt-0.5 truncate" style={{ fontFamily: "monospace" }}>{akun.nomor}</p>
                      : <p className="text-[11px] text-[#9CA3A0] mt-0.5">Petty cash</p>
                    }
                  </div>
                </div>
                {/* Aksi edit/hapus */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button
                    onClick={() => setFormMode({ mode: "edit", akun })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F0FAF0] hover:text-[#3E8A2F] transition-colors"
                    title="Edit akun"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (hasTrx) {
                        toast.error(`Akun "${akun.nama}" memiliki transaksi aktif dan tidak dapat dihapus`);
                      } else {
                        setDeleteTarget(akun);
                      }
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                    title="Hapus akun"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="tabular-nums font-bold text-[#1C2517] tracking-tight mb-1" style={{ fontSize: "1.20rem" }}>
                {fmt(akun.saldoBerjalan)}
              </p>
              {akun.saldo !== akun.saldoBerjalan && (
                <p className="text-[11px] text-[#9CA3A0] mb-2 tabular-nums">
                  Saldo awal: {fmt(akun.saldo)}
                </p>
              )}
              <div className="flex-1 flex items-end mb-3">
                <Sparkline data={akun.spark ?? [0, 0, 0]} color={akun.sparkColor ?? "#3E8A2F"} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[#9CA3A0]">Rekonsiliasi: {akun.rekonsiliasi ?? "—"}</p>
                {hasTrx && (
                  <span className="text-[10px] bg-[#EDF7EC] text-[#3E8A2F] px-2 py-0.5 rounded-full font-semibold">
                    {manualTrxCount + transferCount} trx
                  </span>
                )}
              </div>
              {akun.catatan && (
                <p className="text-[11px] text-[#9CA3A0] mt-1 italic truncate">{akun.catatan}</p>
              )}
            </div>
          );
        })}

        {/* Add account slot */}
        <button
          className="flex flex-col items-center justify-center rounded-xl transition-all group min-h-[180px]"
          style={{ border: "2px dashed #D1D5DB" }}
          onClick={() => setFormMode({ mode: "add" })}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#3E8A2F";
            (e.currentTarget as HTMLElement).style.background = "#F5FBF4";
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB";
            (e.currentTarget as HTMLElement).style.background = "";
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#E2E8DE] flex items-center justify-center mb-2.5 group-hover:bg-[#DCFCE7] transition-colors">
            <Plus size={20} className="text-[#9CA3A0] group-hover:text-[#3E8A2F]" />
          </div>
          <p className="text-sm font-semibold text-[#9CA3A0] group-hover:text-[#3E8A2F] transition-colors">
            Tambah Akun
          </p>
          <p className="text-xs text-[#C8CFC5] mt-1 group-hover:text-[#9CA3A0] transition-colors">
            Bank atau Kas Tunai
          </p>
        </button>
      </div>

      {/* Form Sheet Add/Edit */}
      {formMode && (
        <AkunFormSheet
          mode={formMode.mode}
          initial={formMode.akun}
          onClose={() => setFormMode(null)}
          onSave={data => {
            if (formMode.mode === "add") {
              const saved = addAkun(data);
              toast.success(`Akun "${saved.nama}" berhasil ditambahkan`);
            } else if (formMode.akun) {
              updateAkun(formMode.akun.id, data);
              toast.success(`Akun "${data.nama}" berhasil diperbarui`);
            }
            setFormMode(null);
          }}
        />
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <DeleteAkunDialog
          akun={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </>
  );
}

// ─── Buat Transfer Sheet ──────────────────────────────────────────────────────

function BuatTransferSheet({ onClose }: { onClose: () => void }) {
  const { addBankTransfer, logActivity, akunList } = useAppContext();
  const optionsAkun = akunList.length > 0 ? akunList.map(a => a.nama) : AKUN_OPTIONS;
  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal]   = useState(today);
  const [dari, setDari]         = useState<AkunNama>(optionsAkun[0] || "Bank BSI");
  const [ke, setKe]             = useState<AkunNama>(optionsAkun[1] || optionsAkun[0] || "Kas Tunai");
  const [nominal, setNominal]   = useState("");
  const [catatan, setCatatan]   = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!tanggal) errs.tanggal = "Tanggal wajib diisi";
    if (dari === ke) errs.ke = "Akun tujuan harus berbeda dari akun asal";
    const nom = Number(nominal.replace(/\D/g, ""));
    if (!nom || nom <= 0) errs.nominal = "Nominal harus lebih dari 0";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    addBankTransfer({ tanggal, dari, ke, nominal: nom, catatan: catatan.trim(), status: "Selesai" });
    logActivity({ tipe: "Update Tagihan", deskripsi: `Transfer ${fmt(nom)} dari ${dari} ke ${ke}`, ref: "—" });
    toast.success(`Transfer ${fmt(nom)} dari ${dari} → ${ke} berhasil dicatat`);
    onClose();
  };

  const setField = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: string) =>
    (val: T) => { setter(val); setErrors(p => ({ ...p, [key]: "" })); };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#1C2517]/30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col" style={{ borderLeft: "1px solid #E2E8DE" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div>
            <h3 className="font-semibold text-[#1C2517]">Buat Transfer Antar Akun</h3>
            <p className="text-xs text-[#6B7769] mt-0.5">Catat mutasi dana antara akun keuangan</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3A0] hover:text-[#1C2517] hover:bg-black/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            <div>
              <label className="text-xs font-semibold text-[#374040] block mb-1.5">Tanggal Transfer <span className="text-[#DC2626]">*</span></label>
              <input
                type="date" value={tanggal}
                onChange={e => setField(setTanggal, "tanggal")(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                style={{ border: errors.tanggal ? "1px solid #DC2626" : "1px solid #E2E8DE" }}
              />
              {errors.tanggal && <p className="text-xs text-[#DC2626] mt-1">{errors.tanggal}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#374040] block mb-1.5">Dari Akun <span className="text-[#DC2626]">*</span></label>
              <select
                value={dari}
                onChange={e => setField(setDari, "dari")(e.target.value as AkunNama)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none appearance-none"
                style={{ border: "1px solid #E2E8DE" }}
              >
                {optionsAkun.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#374040] block mb-1.5">Ke Akun <span className="text-[#DC2626]">*</span></label>
              <select
                value={ke}
                onChange={e => setField(setKe, "ke")(e.target.value as AkunNama)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none appearance-none"
                style={{ border: errors.ke ? "1px solid #DC2626" : "1px solid #E2E8DE" }}
              >
                {optionsAkun.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.ke && <p className="text-xs text-[#DC2626] mt-1">{errors.ke}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#374040] block mb-1.5">Nominal <span className="text-[#DC2626]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7769]">Rp</span>
                <input
                  type="text" inputMode="numeric"
                  value={nominal}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setField(setNominal, "nominal")(raw ? Number(raw).toLocaleString("id-ID") : "");
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none tabular-nums"
                  style={{ border: errors.nominal ? "1px solid #DC2626" : "1px solid #E2E8DE" }}
                />
              </div>
              {errors.nominal && <p className="text-xs text-[#DC2626] mt-1">{errors.nominal}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#374040] block mb-1.5">Catatan <span className="text-xs font-normal text-[#9CA3A0]">(opsional)</span></label>
              <textarea
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                rows={2}
                placeholder="Keterangan tambahan…"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none resize-none"
                style={{ border: "1px solid #E2E8DE" }}
              />
            </div>

          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-2" style={{ borderTop: "1px solid #E2E8DE" }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6B7769] hover:bg-black/5 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors disabled:opacity-50">
              Simpan Transfer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Mutasi tab ───────────────────────────────────────────────────────────────

function MutasiTab() {
  const { bankTransferList, deleteBankTransfer, role, appSettings } = useAppContext();
  const [showSheet, setShowSheet] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankTransferRow | null>(null);

  const canEdit = role === "Admin" || role === "Bendahara";

  function fmtTglISO(iso: string) {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
  }

  function handleExportMutasiCSV() {
    const headers = ["ID Mutasi", "Tanggal", "Dari Akun", "Ke Akun", "Nominal (Rp)", "Catatan", "Status", "Dicatat Oleh"];
    const rows = bankTransferList.map(b => [
      b.id,
      b.tanggal,
      b.dari,
      b.ke,
      b.nominal,
      b.catatan || "—",
      b.status,
      b.dicatatOleh || "—",
    ]);
    downloadCSV(`mutasi-bank-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
    toast.success(`${bankTransferList.length} mutasi berhasil diekspor ke CSV`);
  }

  function handlePrintTransfer(row: BankTransferRow) {
    printBuktiTransfer(row, {
      namaMadrasah: appSettings.namaMadrasah,
      alamatMadrasah: appSettings.alamatMadrasah,
      tahunAjaran: appSettings.tahunAjaran,
    });
  }

  return (
    <div>
      {showSheet && <BuatTransferSheet onClose={() => setShowSheet(false)} />}

      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>Mutasi Antar Akun</p>
          <p className="text-sm text-[#6B7769] mt-0.5">Transfer dana antara akun keuangan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMutasiCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#374040] bg-white hover:bg-[#F5F9F4] border border-[#E2E8DE] transition-colors"
            title="Ekspor CSV Riwayat Mutasi"
          >
            <Download size={13} className="text-[#6B7769]" />
            <span>Ekspor CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={() => setShowSheet(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0 shadow-sm"
            >
              <Plus size={14} />
              Buat Transfer
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Transfer Cards (md:hidden) ── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {bankTransferList.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#9CA3A0] bg-white rounded-xl border border-[#E2E8DE]">
            Belum ada mutasi antar akun
          </div>
        ) : (
          bankTransferList.map((row) => (
            <div key={row.id} className="bg-white rounded-xl p-3.5 border border-[#E2E8DE] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7769]">{fmtTglISO(row.tanggal)}</span>
                <StatusBadge status={row.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1C2517]">{row.dari}</span>
                <ArrowRight size={13} className="text-[#3E8A2F] shrink-0" />
                <span className="text-sm font-semibold text-[#1C2517]">{row.ke}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#F0F7EE]">
                <span className="text-xs text-[#6B7769] truncate max-w-[180px]">{row.catatan || "—"}</span>
                <span className="text-sm font-bold tabular-nums text-[#1C2517]">{fmt(row.nominal)}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F0F7EE]">
                <button
                  onClick={() => handlePrintTransfer(row)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#6B7769] hover:bg-[#F5F9F4] rounded border border-[#E2E8DE]"
                  title="Cetak Bukti Transfer"
                >
                  <Printer size={12} />
                  <span>Cetak</span>
                </button>
                {canEdit && (
                  <button
                    onClick={() => setDeleteTarget(row)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#DC2626] hover:bg-[#FEE2E2] rounded border border-[#FECACA]"
                    title="Batalkan Mutasi"
                  >
                    <Trash2 size={12} />
                    <span>Batal</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop Table (hidden md:block) ── */}
      <div className="hidden md:block bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-6 pr-4 whitespace-nowrap">Tanggal</Th>
                <Th className="pr-4">Dari Akun → Ke Akun</Th>
                <Th align="right" className="pr-4">Nominal</Th>
                <Th className="pr-4">Catatan</Th>
                <Th className="pr-4">Status</Th>
                <th className="py-3 pr-6 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bankTransferList.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-[#9CA3A0]">Belum ada mutasi antar akun</td></tr>
              ) : bankTransferList.map((row, i) => (
                <tr key={row.id} className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < bankTransferList.length - 1 ? "1px solid #F0F7EE" : "none" }}>
                  <td className="py-3.5 pl-6 pr-4 text-sm text-[#6B7769] whitespace-nowrap">{fmtTglISO(row.tanggal)}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.dari}</span>
                      <ArrowRight size={13} className="text-[#9CA3A0] shrink-0" />
                      <span className="text-sm font-medium text-[#1C2517] whitespace-nowrap">{row.ke}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className="text-sm font-bold tabular-nums text-[#1C2517]">{fmt(row.nominal)}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-[#6B7769]">{row.catatan || "—"}</td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3.5 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handlePrintTransfer(row)}
                        className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
                        title="Cetak Bukti Transfer"
                      >
                        <Printer size={14} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => setDeleteTarget(row)}
                          className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                          title="Batalkan Transfer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </div>

      {/* Confirm Delete / Cancel Bank Transfer */}
      {deleteTarget && (
        <DeleteBankTransferDialog
          transfer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteBankTransfer(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
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
  const activeTab = (tab || "transaksi") as TabType;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 px-4 md:px-0" style={{ paddingBottom: 88 }}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1C2517]">Kas &amp; Bank</h2>
        <p className="text-xs md:text-sm text-[#6B7769]">Kelola transaksi, akun, dan mutasi keuangan</p>
      </div>

      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC] w-full sm:w-auto">
          {(["transaksi", "akun", "mutasi"] as const).map(t => (
            <button key={t} onClick={() => navigate(`/keuangan/kas-bank/${t}`)}
              className={[
                "flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all text-center whitespace-nowrap",
                activeTab === t ? "bg-white text-[#1C2517] shadow-sm" : "text-[#6B7769] hover:text-[#374040]",
              ].join(" ")}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "transaksi" && <TransaksiTab />}
      {activeTab === "akun"      && <AkunTab />}
      {activeTab === "mutasi"    && <MutasiTab />}
    </div>
  );
}
