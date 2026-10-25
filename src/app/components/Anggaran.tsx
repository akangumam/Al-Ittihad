import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Download, MoreHorizontal, Pencil, Trash2, X,
  Search, Printer, AlertTriangle, ChevronDown, Filter, FileText, Check
} from "lucide-react";
import { toast } from "sonner";
import { fmt } from "@/lib/formatters";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import { type RABRow, MONTHS } from "@/data/keuangan";

// ─── formatters & helpers ─────────────────────────────────────────────────────

const IDR = (v: number): string => (v < 0 ? `−${fmt(Math.abs(v))}` : fmt(v));

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

// ─── printable RAB report ─────────────────────────────────────────────────────

function printRAB(data: {
  namaMadrasah: string;
  tahunAjaran: string;
  groups: string[];
  rabList: RABRow[];
  totalAnggaran: number;
  totalTerpakai: number;
}) {
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) {
    window.print();
    return;
  }

  const sisaTotal = data.totalAnggaran - data.totalTerpakai;
  const pctTotal = data.totalAnggaran > 0 ? Math.round((data.totalTerpakai / data.totalAnggaran) * 100) : 0;
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let tableHtml = "";
  data.groups.forEach((group) => {
    const items = data.rabList.filter((r) => r.group === group);
    const subAnggaran = items.reduce((s, r) => s + r.anggaran, 0);
    const subTerpakai = items.reduce((s, r) => s + r.terpakai, 0);
    const subSisa = subAnggaran - subTerpakai;
    const subPct = subAnggaran > 0 ? Math.round((subTerpakai / subAnggaran) * 100) : 0;

    tableHtml += `
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td colspan="5" style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #334155;">
          ${group}
        </td>
      </tr>
    `;

    items.forEach((item, idx) => {
      const sisa = item.anggaran - item.terpakai;
      const pct = item.anggaran > 0 ? Math.round((item.terpakai / item.anggaran) * 100) : 0;
      tableHtml += `
        <tr>
          <td style="padding: 7px 12px; border-bottom: 1px solid #e2e8f0;">${idx + 1}. ${item.nama}</td>
          <td style="padding: 7px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">Rp ${item.anggaran.toLocaleString("id-ID")}</td>
          <td style="padding: 7px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">Rp ${item.terpakai.toLocaleString("id-ID")}</td>
          <td style="padding: 7px 12px; text-align: right; border-bottom: 1px solid #e2e8f0; ${sisa < 0 ? "color: #dc2626; font-weight: 600;" : ""}">Rp ${sisa.toLocaleString("id-ID")}</td>
          <td style="padding: 7px 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${pct}%</td>
        </tr>
      `;
    });

    tableHtml += `
      <tr style="background: #fafafa; font-weight: 600; font-size: 12px;">
        <td style="padding: 6px 12px; text-align: right;">Subtotal ${group}:</td>
        <td style="padding: 6px 12px; text-align: right;">Rp ${subAnggaran.toLocaleString("id-ID")}</td>
        <td style="padding: 6px 12px; text-align: right; color: #d97706;">Rp ${subTerpakai.toLocaleString("id-ID")}</td>
        <td style="padding: 6px 12px; text-align: right; color: #166534;">Rp ${subSisa.toLocaleString("id-ID")}</td>
        <td style="padding: 6px 12px; text-align: center;">${subPct}%</td>
      </tr>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Laporan RAB TA ${data.tahunAjaran}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
        .header { text-align: center; border-bottom: 2.5px double #334155; padding-bottom: 14px; margin-bottom: 20px; }
        .school-name { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #166534; margin: 0; }
        .doc-title { font-size: 14px; font-weight: bold; margin: 6px 0 2px; text-transform: uppercase; text-decoration: underline; }
        .doc-sub { font-size: 11px; color: #64748b; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f8fafc; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; padding: 8px 12px; font-size: 11.5px; text-align: left; }
        .grand-total td { background: #e2e8f0; font-weight: bold; font-size: 13px; padding: 10px 12px; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; margin-top: 40px; text-align: center; page-break-inside: avoid; }
        .sig-box { padding: 0 40px; }
        .sig-space { height: 65px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="school-name">${data.namaMadrasah}</h1>
        <div class="doc-title">Rencana Anggaran Biaya (RAB) & Serapan Dana</div>
        <p class="doc-sub">Tahun Anggaran ${data.tahunAjaran} · Tanggal Cetak: ${todayFormatted}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Uraian / Mata Anggaran</th>
            <th style="text-align: right; width: 150px;">Anggaran</th>
            <th style="text-align: right; width: 150px;">Terpakai</th>
            <th style="text-align: right; width: 150px;">Sisa Anggaran</th>
            <th style="text-align: center; width: 80px;">% Serapan</th>
          </tr>
        </thead>
        <tbody>
          ${tableHtml}
          <tr class="grand-total">
            <td>TOTAL KESELURUHAN (RAB)</td>
            <td style="text-align: right;">Rp ${data.totalAnggaran.toLocaleString("id-ID")}</td>
            <td style="text-align: right; color: #b45309;">Rp ${data.totalTerpakai.toLocaleString("id-ID")}</td>
            <td style="text-align: right; color: #166534;">Rp ${sisaTotal.toLocaleString("id-ID")}</td>
            <td style="text-align: center;">${pctTotal}%</td>
          </tr>
        </tbody>
      </table>

      <div class="signatures">
        <div class="sig-box">
          <p>Mengetahui,<br><strong>Kepala Madrasah</strong></p>
          <div class="sig-space"></div>
          <p style="text-decoration: underline; font-weight: bold;">( Kepala Madrasah )</p>
        </div>
        <div class="sig-box">
          <p>Disusun oleh,<br><strong>Bendahara Madrasah</strong></p>
          <div class="sig-space"></div>
          <p style="text-decoration: underline; font-weight: bold;">( Bendahara Madrasah )</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// ─── color helpers ────────────────────────────────────────────────────────────

const sColor = (pct: number) => (pct >= 100 ? "#DC2626" : pct >= 80 ? "#D97706" : "#3E8A2F");
const sBg = (pct: number) => (pct >= 100 ? "#FEE2E2" : pct >= 80 ? "#FEF3C7" : "#DCFCE7");

const AVAILABLE_GROUPS = ["OPERASIONAL", "KEGIATAN SISWA", "SARANA PRASARANA", "GAJI & HONOR"];

// ─── sub-components ───────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors"
        aria-label="Menu pilihan"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 w-44 bg-white rounded-xl py-1"
            style={{ border: "1px solid #E2E8DE", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Pencil size={13} className="text-[#6B7769]" /> Edit
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
            >
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
  const bg = sBg(pct);
  const fillW = Math.min(pct, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full" style={{ width: `${fillW}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Budget Bar Chart (Dynamic SVG) ───────────────────────────────────────────

interface MonthlyPoint {
  m: string;
  year: number;
  anggaran: number;
  realisasi: number;
}

function BudgetBarChart({ data }: { data: MonthlyPoint[] }) {
  const VW = 760,
    VH = 220;
  const PL = 50,
    PR = 15,
    PT = 10,
    PB = 38;
  const plotW = VW - PL - PR;
  const plotH = VH - PT - PB;

  const maxValRaw = Math.max(...data.map((d) => Math.max(d.anggaran, d.realisasi)), 10_000_000);
  const maxVInJuta = Math.ceil(maxValRaw / 10_000_000) * 10;
  const maxV = maxVInJuta * 1_000_000;
  const tickStep = maxV / 4;
  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, maxV];

  const n = data.length || 12;
  const groupW = plotW / n;
  const barW = Math.floor(groupW * 0.28);
  const gap = 3;

  const xBar = (i: number, which: 0 | 1) => {
    const groupX = PL + i * groupW;
    const totalBarsW = 2 * barW + gap;
    const offset = (groupW - totalBarsW) / 2;
    return groupX + offset + which * (barW + gap);
  };
  const yBar = (v: number) => PT + plotH - (v / maxV) * plotH;
  const hBar = (v: number) => Math.max(0, (v / maxV) * plotH);

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Grafik anggaran vs realisasi bulanan dinamis"
    >
      {/* Grid lines + Y labels */}
      {yTicks.map((t) => {
        const y = PT + plotH - (t / maxV) * plotH;
        return (
          <g key={t}>
            <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke={t === 0 ? "#D1D5DB" : "#F0F7EE"} strokeWidth={1} />
            <text x={PL - 6} y={y + 3.5} textAnchor="end" fontSize={9.5} fill="#9CA3A0" fontFamily="inherit">
              {Math.round(t / 1_000_000)}jt
            </text>
          </g>
        );
      })}

      {/* Bars + X labels */}
      {data.map((item, i) => {
        const aH = hBar(item.anggaran);
        const rH = hBar(item.realisasi);
        const labelX = PL + i * groupW + groupW / 2;

        return (
          <g key={item.m + i}>
            {/* Anggaran bar (green) */}
            <rect
              x={xBar(i, 0)}
              y={yBar(item.anggaran)}
              width={barW}
              height={aH}
              rx={2}
              fill="#3E8A2F"
              opacity={0.85}
            >
              <title>{`${item.m}: Anggaran ${fmt(item.anggaran)}`}</title>
            </rect>
            {/* Realisasi bar (amber) */}
            <rect
              x={xBar(i, 1)}
              y={yBar(item.realisasi)}
              width={barW}
              height={rH}
              rx={2}
              fill="#D97706"
              opacity={0.9}
            >
              <title>{`${item.m}: Realisasi ${fmt(item.realisasi)}`}</title>
            </rect>
            {/* Month label */}
            <text x={labelX} y={VH - PB + 16} textAnchor="middle" fontSize={9.5} fill="#6B7769" fontFamily="inherit">
              {item.m}
            </text>
          </g>
        );
      })}

      {/* X-axis baseline */}
      <line x1={PL} y1={PT + plotH} x2={VW - PR} y2={PT + plotH} stroke="#D1D5DB" strokeWidth={1} />
    </svg>
  );
}

// ─── RAB Sheet (add / edit) ───────────────────────────────────────────────────

type RABForm = { group: string; nama: string; anggaran: string; terpakai: string };

function RABSheet({ row, onClose }: { row: RABRow | null; onClose: () => void }) {
  const { addRab, updateRab } = useAppContext();
  const [form, setForm] = useState<RABForm>({
    group: row?.group ?? AVAILABLE_GROUPS[0],
    nama: row?.nama ?? "",
    anggaran: row?.anggaran != null ? String(row.anggaran) : "",
    terpakai: row?.terpakai != null ? String(row.terpakai) : "0",
  });
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    if (!form.nama.trim()) {
      setErr("Nama mata anggaran wajib diisi");
      return;
    }
    const ang = Number(form.anggaran.replace(/\D/g, ""));
    const ter = Number(form.terpakai.replace(/\D/g, ""));
    if (!ang || ang <= 0) {
      setErr("Anggaran harus lebih dari 0");
      return;
    }
    if (ter < 0) {
      setErr("Terpakai tidak boleh negatif");
      return;
    }
    if (row) {
      updateRab(row.id, { group: form.group, nama: form.nama.trim(), anggaran: ang, terpakai: ter });
      toast.success(`Mata anggaran "${form.nama.trim()}" berhasil diperbarui`);
    } else {
      addRab({ group: form.group, nama: form.nama.trim(), anggaran: ang, terpakai: ter });
      toast.success(`Mata anggaran "${form.nama.trim()}" berhasil ditambahkan`);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col"
        style={{ borderLeft: "1px solid #E2E8DE", borderRadius: "16px 0 0 16px" }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <p className="font-semibold text-[#1C2517]">{row ? "Edit Mata Anggaran" : "Tambah Mata Anggaran"}</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374040] uppercase tracking-wide">
              Kelompok Anggaran <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none focus:ring-2 focus:ring-[#3E8A2F]/30"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {AVAILABLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          {/* Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374040] uppercase tracking-wide">
              Mata Anggaran <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => {
                setForm((f) => ({ ...f, nama: e.target.value }));
                setErr(null);
              }}
              placeholder="Contoh: Pengadaan Alat Tulis Kantor"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] placeholder:text-[#9CA3A0] outline-none focus:ring-2 focus:ring-[#3E8A2F]/30"
              style={{ border: "1px solid #E2E8DE" }}
            />
          </div>
          {/* Anggaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374040] uppercase tracking-wide">
              Pagu Anggaran (Rp) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.anggaran}
              onChange={(e) => {
                setForm((f) => ({ ...f, anggaran: e.target.value.replace(/\D/g, "") }));
                setErr(null);
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] tabular-nums placeholder:text-[#9CA3A0] outline-none focus:ring-2 focus:ring-[#3E8A2F]/30"
              style={{ border: "1px solid #E2E8DE" }}
            />
            {form.anggaran && <p className="text-xs text-[#6B7769]">{fmt(Number(form.anggaran))}</p>}
          </div>
          {/* Terpakai */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374040] uppercase tracking-wide">
              Realisasi Awal / Terpakai (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.terpakai}
              onChange={(e) => {
                setForm((f) => ({ ...f, terpakai: e.target.value.replace(/\D/g, "") }));
                setErr(null);
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] tabular-nums placeholder:text-[#9CA3A0] outline-none focus:ring-2 focus:ring-[#3E8A2F]/30"
              style={{ border: "1px solid #E2E8DE" }}
            />
            {form.terpakai && <p className="text-xs text-[#6B7769]">{fmt(Number(form.terpakai))}</p>}
          </div>
          {err && <p className="text-xs text-[#DC2626]">{err}</p>}
        </div>
        <div className="px-6 pb-6 pt-3 flex gap-3" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            Batal
          </button>
          <button
            onClick={submit}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors"
          >
            {row ? "Simpan Perubahan" : "Tambah Mata Anggaran"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RAB Tab ─────────────────────────────────────────────────────────────────

function RABTab({ tahunAjaran }: { tahunAjaran: string }) {
  const { rabList, deleteRab, appSettings } = useAppContext();
  const [sheetRow, setSheetRow] = useState<RABRow | null | "new">(undefined as any);
  const isOpen = sheetRow !== undefined && sheetRow !== (undefined as any);

  const [searchQuery, setSearchQuery] = useState("");
  const [kelompokFilter, setKelompokFilter] = useState("Semua Kelompok");
  const [deleteConfirm, setDeleteConfirm] = useState<RABRow | null>(null);

  const { groups, TOTAL_A, TOTAL_T } = useMemo(() => {
    const g = [...new Set(rabList.map((r) => r.group))];
    const a = rabList.reduce((s, r) => s + r.anggaran, 0);
    const t = rabList.reduce((s, r) => s + r.terpakai, 0);
    return { groups: g, TOTAL_A: a, TOTAL_T: t };
  }, [rabList]);

  const TOTAL_S = TOTAL_A - TOTAL_T;
  const TOTAL_P = TOTAL_A > 0 ? Math.round((TOTAL_T / TOTAL_A) * 100) : 0;

  // Filter rows based on search and group selection
  const filteredRabList = useMemo(() => {
    return rabList.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.group.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = kelompokFilter === "Semua Kelompok" || r.group === kelompokFilter;
      return matchSearch && matchGroup;
    });
  }, [rabList, searchQuery, kelompokFilter]);

  const activeGroups = useMemo(() => {
    return [...new Set(filteredRabList.map((r) => r.group))];
  }, [filteredRabList]);

  const handlePrintRAB = () => {
    printRAB({
      namaMadrasah: appSettings.namaMadrasah || "MTs Al-Ittihad Pedaleman",
      tahunAjaran,
      groups: activeGroups.length > 0 ? activeGroups : groups,
      rabList: filteredRabList,
      totalAnggaran: TOTAL_A,
      totalTerpakai: TOTAL_T,
    });
  };

  return (
    <div className="space-y-5">
      {isOpen && (
        <RABSheet
          row={sheetRow === "new" ? null : (sheetRow as RABRow)}
          onClose={() => setSheetRow(undefined as any)}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E2E8DE]">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1C2517] text-center mb-1">Hapus Mata Anggaran?</h3>
            <p className="text-xs text-[#6B7769] text-center mb-6">
              Mata anggaran <strong className="text-[#1C2517]">"{deleteConfirm.nama}"</strong> akan dihapus permanen dari daftar RAB.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8DE] text-sm font-semibold text-[#374040] hover:bg-[#FAFBF9] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteRab(deleteConfirm.id);
                  toast.success(`"${deleteConfirm.nama}" berhasil dihapus`);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#B91C1C] transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <p className="font-semibold text-[#1C2517]">Rencana Anggaran Biaya (RAB)</p>
          <p className="text-xs text-[#6B7769] mt-0.5">Tahun Anggaran {tahunAjaran}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              const csvRows: (string | number)[][] = [
                ["Kelompok", "Uraian", "Anggaran (Rp)", "Terpakai (Rp)", "Sisa (Rp)", "% Terpakai"],
                ...filteredRabList.map((r) => [
                  r.group,
                  r.nama,
                  r.anggaran,
                  r.terpakai,
                  r.anggaran - r.terpakai,
                  r.anggaran > 0 ? Math.round((r.terpakai / r.anggaran) * 100) : 0,
                ]),
              ];
              downloadCSV(`RAB-${tahunAjaran}.csv`, csvRows);
              toast.success("Data RAB berhasil diekspor ke CSV");
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Download size={13} /> Export CSV
          </button>

          <button
            onClick={handlePrintRAB}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Printer size={13} /> Cetak RAB
          </button>

          <button
            onClick={() => setSheetRow("new")}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3E8A2F] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
          >
            <Plus size={13} /> Tambah Mata Anggaran
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid #E2E8DE" }}>
        <div className="flex flex-wrap items-start gap-6 md:gap-10 mb-4">
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Total Pagu Anggaran</p>
            <p className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: "1.2rem" }}>
              {IDR(TOTAL_A)}
            </p>
          </div>
          <div className="w-px self-stretch bg-[#E2E8DE] hidden sm:block" />
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Total Terpakai (Realisasi)</p>
            <p className="tabular-nums font-bold text-[#D97706]" style={{ fontSize: "1.2rem" }}>
              {IDR(TOTAL_T)}
            </p>
            <p className="text-[11px] text-[#9CA3A0] mt-0.5">{TOTAL_P}% dari total anggaran</p>
          </div>
          <div className="w-px self-stretch bg-[#E2E8DE] hidden sm:block" />
          <div>
            <p className="text-xs text-[#9CA3A0] uppercase tracking-wide mb-1">Sisa Anggaran</p>
            <p className="tabular-nums font-bold text-[#3E8A2F]" style={{ fontSize: "1.2rem" }}>
              {IDR(TOTAL_S)}
            </p>
            <p className="text-[11px] text-[#9CA3A0] mt-0.5">Sisa saldo belum terserap</p>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="h-2 rounded-full bg-[#E2E8DE] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(TOTAL_P, 100)}%`, background: sColor(TOTAL_P) }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[#9CA3A0]">0%</span>
          <span className="text-[10px] text-[#D97706] font-semibold">{TOTAL_P}% terpakai</span>
          <span className="text-[10px] text-[#9CA3A0]">100%</span>
        </div>
      </div>

      {rabList.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#E2E8DE] space-y-4 max-w-xl mx-auto my-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EAF5E6] text-[#3E8A2F] flex items-center justify-center mx-auto shadow-sm">
            <FileText size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#1C2517]">Mata Anggaran (RAB) Masih Kosong</h3>
            <p className="text-xs sm:text-sm text-[#6B7769] leading-relaxed max-w-md mx-auto">
              Belum ada mata anggaran yang didaftarkan untuk Tahun Ajaran <strong>{tahunAjaran}</strong>. Daftarkan pos rencana kerja dan anggaran madrasah (RKAM) untuk memulai pencatatan serta monitoring serapan belanja.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setSheetRow("new")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-all shadow-sm"
            >
              <Plus size={16} /> Tambah Mata Anggaran Pertama
            </button>
          </div>
          <div className="pt-3 border-t border-[#F0F7EE] text-[11px] text-[#9CA3A0]">
            Pos kelompok standar: <span className="text-[#374040] font-medium">Operasional, Kegiatan Siswa, Sarana Prasarana, Gaji & Honor</span>
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar filter & search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2E8DE]">
            <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-2 rounded-lg bg-[#FAFBF9] border border-[#E2E8DE]">
              <Search size={14} className="text-[#9CA3A0] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata anggaran / kelompok..."
                className="bg-transparent outline-none text-xs sm:text-sm text-[#1C2517] w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#9CA3A0] hover:text-[#374040]">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={kelompokFilter}
                  onChange={(e) => setKelompokFilter(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 rounded-lg text-xs sm:text-sm text-[#374040] outline-none border border-[#E2E8DE] bg-[#FAFBF9]"
                >
                  <option value="Semua Kelompok">Semua Kelompok ({rabList.length})</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g} ({rabList.filter((r) => r.group === g).length})
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
            <DataTable>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                  <Th className="px-6">Mata Anggaran</Th>
                  <Th align="right" className="px-4">Pagu Anggaran</Th>
                  <Th align="right" className="px-4">Terpakai</Th>
                  <Th align="right" className="px-4">Sisa</Th>
                  <Th className="px-4">Serapan</Th>
                  <th className="py-3 pr-6 w-10" />
                </tr>
              </thead>
              {activeGroups.map((group) => {
                const rows = filteredRabList.filter((r) => r.group === group);
                if (rows.length === 0) return null;

                const subA = rows.reduce((s, r) => s + r.anggaran, 0);
                const subT = rows.reduce((s, r) => s + r.terpakai, 0);
                const subS = subA - subT;
                const subP = subA > 0 ? Math.round((subT / subA) * 100) : 0;

                return (
                  <tbody key={group}>
                    {/* Group header */}
                    <tr>
                      <td colSpan={6} className="px-6 py-2.5" style={{ background: "#F5F9F4", borderBottom: "1px solid #E2E8DE" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#3E8A2F] uppercase tracking-wider">{group}</span>
                          <span className="text-xs text-[#6B7769] tabular-nums">
                            Subtotal: <strong>{IDR(subA)}</strong> · Terpakai: <strong className="text-[#D97706]">{IDR(subT)}</strong> ({subP}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Data rows */}
                    {rows.map((row, ri) => {
                      const sisa = row.anggaran - row.terpakai;
                      const pct = row.anggaran > 0 ? Math.round((row.terpakai / row.anggaran) * 100) : 0;
                      const overBudget = sisa < 0;
                      const isLast = ri === rows.length - 1;

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-[#FAFBF9] transition-colors"
                          style={{ borderBottom: isLast ? "2px solid #E2E8DE" : "1px solid #F0F7EE" }}
                        >
                          <td className="px-6 py-3.5 text-sm font-medium text-[#1C2517]">{row.nama}</td>
                          <td className="px-4 py-3.5 text-sm tabular-nums text-right text-[#374040]">{IDR(row.anggaran)}</td>
                          <td className="px-4 py-3.5 text-sm tabular-nums text-right text-[#374040]">
                            {row.terpakai === 0 ? <span className="text-[#D1D5DB]">—</span> : IDR(row.terpakai)}
                          </td>
                          <td className={`px-4 py-3.5 text-sm tabular-nums text-right font-semibold ${overBudget ? "text-[#DC2626]" : "text-[#374040]"}`}>
                            {IDR(sisa)}
                          </td>
                          <td className="px-4 py-3.5">
                            <SerapanBar pct={pct} />
                          </td>
                          <td className="py-3.5 pr-6">
                            <RowMenu
                              onEdit={() => setSheetRow(row)}
                              onDelete={() => setDeleteConfirm(row)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                );
              })}

              {filteredRabList.length === 0 && (
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-[#9CA3A0]">
                      Tidak ada mata anggaran yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                </tbody>
              )}

              {/* Footer total row */}
              <tfoot>
                <tr style={{ borderTop: "2px solid #E2E8DE", background: "#F5F9F4" }}>
                  <td className="px-6 py-3.5 text-sm font-bold text-[#1C2517]">Total RAB Terfilter</td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#1C2517]">{IDR(TOTAL_A)}</td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#D97706]">{IDR(TOTAL_T)}</td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#3E8A2F]">{IDR(TOTAL_S)}</td>
                  <td className="px-4 py-3.5">
                    <SerapanBar pct={TOTAL_P} />
                  </td>
                  <td className="pr-6" />
                </tr>
              </tfoot>
            </DataTable>
          </div>

          {/* Cards View (Mobile) */}
          <div className="md:hidden space-y-3">
            {filteredRabList.map((row) => {
              const sisa = row.anggaran - row.terpakai;
              const pct = row.anggaran > 0 ? Math.round((row.terpakai / row.anggaran) * 100) : 0;
              return (
                <div key={row.id} className="bg-white rounded-xl p-4 border border-[#E2E8DE] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#3E8A2F] uppercase tracking-wider">{row.group}</span>
                      <h4 className="text-sm font-semibold text-[#1C2517] mt-0.5">{row.nama}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSheetRow(row)}
                        className="p-1.5 rounded-lg text-[#6B7769] hover:bg-[#F5F9F4]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(row)}
                        className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F0F7EE] text-xs">
                    <div>
                      <span className="text-[#9CA3A0] block text-[10px]">Pagu</span>
                      <span className="font-semibold text-[#1C2517]">{IDR(row.anggaran)}</span>
                    </div>
                    <div>
                      <span className="text-[#9CA3A0] block text-[10px]">Terpakai</span>
                      <span className="font-semibold text-[#D97706]">{IDR(row.terpakai)}</span>
                    </div>
                    <div>
                      <span className="text-[#9CA3A0] block text-[10px]">Sisa</span>
                      <span className={`font-semibold ${sisa < 0 ? "text-[#DC2626]" : "text-[#3E8A2F]"}`}>{IDR(sisa)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-[#6B7769]">Serapan Anggaran</span>
                    <SerapanBar pct={pct} />
                  </div>
                </div>
              );
            })}

            {filteredRabList.length === 0 && (
              <div className="text-center py-8 bg-white rounded-xl border border-[#E2E8DE] text-[#9CA3A0] text-sm">
                Tidak ada mata anggaran ditemukan.
              </div>
            )}
          </div>

          {/* Caption */}
          <p className="text-xs text-[#9CA3A0]">
            * Serapan dihitung dari data realisasi pengeluaran madrasah yang dialokasikan pada mata anggaran.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Realisasi Tab ────────────────────────────────────────────────────────────

function RealisasiTab({ tahunAjaran }: { tahunAjaran: string }) {
  const navigate = useNavigate();
  const { rabList, manualTransaksiList } = useAppContext();

  const TOTAL_A = useMemo(() => rabList.reduce((s, r) => s + r.anggaran, 0), [rabList]);
  const TOTAL_T = useMemo(() => rabList.reduce((s, r) => s + r.terpakai, 0), [rabList]);
  const TOTAL_S = TOTAL_A - TOTAL_T;
  const TOTAL_P = TOTAL_A > 0 ? Math.round((TOTAL_T / TOTAL_A) * 100) : 0;

  // Dynamic Top 5 serapan derived directly from rabList
  const dynamicTop5 = useMemo(() => {
    return [...rabList]
      .map((r) => ({
        nama: r.nama,
        group: r.group,
        anggaran: r.anggaran,
        terpakai: r.terpakai,
        pct: r.anggaran > 0 ? Math.round((r.terpakai / r.anggaran) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [rabList]);

  // Dynamic monthly realisasi derived from actual expense transactions (manualTransaksiList where tipe === "keluar")
  const monthlyData = useMemo(() => {
    // Determine academic year split: e.g. "2025/2026"
    const parts = tahunAjaran.split("/");
    const yStart = parseInt(parts[0]) || new Date().getFullYear();
    const yEnd = parseInt(parts[1]) || yStart + 1;

    // Month map for 12 months: Jul-Des in yStart, Jan-Jun in yEnd
    const monthDefs: { m: string; monthIndex: number; year: number }[] = [
      { m: "Jul", monthIndex: 6, year: yStart },
      { m: "Agt", monthIndex: 7, year: yStart },
      { m: "Sep", monthIndex: 8, year: yStart },
      { m: "Okt", monthIndex: 9, year: yStart },
      { m: "Nov", monthIndex: 10, year: yStart },
      { m: "Des", monthIndex: 11, year: yStart },
      { m: "Jan", monthIndex: 0, year: yEnd },
      { m: "Feb", monthIndex: 1, year: yEnd },
      { m: "Mar", monthIndex: 2, year: yEnd },
      { m: "Apr", monthIndex: 3, year: yEnd },
      { m: "Mei", monthIndex: 4, year: yEnd },
      { m: "Jun", monthIndex: 5, year: yEnd },
    ];

    const monthlyBudget = TOTAL_A > 0 ? Math.round(TOTAL_A / 12) : 0;

    return monthDefs.map((def) => {
      // Aggregate real expense transactions in this month & year
      const expenses = manualTransaksiList.filter((tx) => {
        if (tx.tipe !== "keluar") return false;
        const d = new Date(tx.tanggal);
        return d.getMonth() === def.monthIndex && d.getFullYear() === def.year;
      });

      const totalExpenseInMonth = expenses.reduce((sum, tx) => sum + tx.jumlah, 0);

      // Realisasi bulanan 100% murni dihitung dari total transaksi pengeluaran kas riil di bulan & tahun ini
      const computedRealisasi = totalExpenseInMonth;

      return {
        m: def.m,
        year: def.year,
        anggaran: monthlyBudget,
        realisasi: computedRealisasi,
      };
    });
  }, [tahunAjaran, TOTAL_A, TOTAL_T, manualTransaksiList]);

  return (
    <div className="space-y-5">
      {rabList.length === 0 && (
        <div className="bg-[#FAFBF9] border border-[#E2E8DE] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#6B7769]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-[#D97706] shrink-0" />
            <span>Mata anggaran RAB belum didaftarkan. Pagu rata-rata dan serapan bulanan akan aktif setelah pos anggaran ditambahkan di tab <strong>RAB</strong>.</span>
          </div>
          <button
            onClick={() => navigate(`/keuangan/anggaran/rab`)}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#3E8A2F] text-white text-xs font-semibold hover:bg-[#2E6B22] transition-colors self-start sm:self-auto"
          >
            Buka Tab RAB
          </button>
        </div>
      )}

      {/* KPI chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: "Total Dianggarkan", value: IDR(TOTAL_A), color: "#1C2517" },
          { label: "Terealisasi", value: IDR(TOTAL_T), color: "#D97706" },
          { label: "Persentase Serapan", value: `${TOTAL_P}%`, color: sColor(TOTAL_P) },
          { label: "Sisa Dana Anggaran", value: IDR(TOTAL_S), color: "#3E8A2F" },
        ].map((kpi, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#D1D5DB] hidden sm:inline">·</span>}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-xs sm:text-sm"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <span className="font-bold tabular-nums" style={{ color: kpi.color }}>
                {kpi.value}
              </span>
              <span className="text-[#6B7769]">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main area: chart + top-5 table */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Bar chart card */}
        <div className="flex-1 w-full bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1C2517]">Anggaran vs Realisasi Bulanan</p>
              <p className="text-xs text-[#6B7769] mt-0.5">Tahun Anggaran {tahunAjaran}</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "#3E8A2F" }} />
                <span className="text-xs text-[#6B7769]">Pagu Rata-rata</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "#D97706" }} />
                <span className="text-xs text-[#6B7769]">Realisasi Kas</span>
              </div>
            </div>
          </div>
          <BudgetBarChart data={monthlyData} />
        </div>

        {/* Top 5 card (dynamic) */}
        <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-[#1C2517]">Top Serapan Tertinggi</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAFBF9] border border-[#E2E8DE] text-[#6B7769]">
              Dinamis
            </span>
          </div>
          <p className="text-xs text-[#6B7769] mb-4">Mata anggaran dengan % serapan tertinggi</p>
          <div className="space-y-4">
            {dynamicTop5.map((item, i) => {
              const color = sColor(item.pct);
              const bg = sBg(item.pct);
              return (
                <div key={item.nama + i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#374040] font-medium truncate" title={item.nama}>
                        {item.nama}
                      </span>
                    </div>
                    <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ color }}>
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(item.pct, 100)}%`, background: color }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#9CA3A0] mt-1 tabular-nums">
                    <span>Terpakai: {IDR(item.terpakai)}</span>
                    <span>Pagu: {IDR(item.anggaran)}</span>
                  </div>
                </div>
              );
            })}

            {dynamicTop5.length === 0 && (
              <p className="text-xs text-[#9CA3A0] py-4 text-center">Belum ada data mata anggaran.</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly detail table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div>
            <p className="text-sm font-semibold text-[#1C2517]">Rincian Realisasi per Bulan</p>
            <p className="text-xs text-[#6B7769] mt-0.5">Agregasi bulanan terhadap alokasi anggaran tahun berjalan</p>
          </div>
          <button
            onClick={() => {
              const csvData = [
                ["Bulan", "Tahun", "Pagu Anggaran (Rp)", "Realisasi (Rp)", "Sisa (Rp)", "% Serapan"],
                ...monthlyData.map((d) => [
                  d.m,
                  d.year,
                  d.anggaran,
                  d.realisasi,
                  d.anggaran - d.realisasi,
                  d.anggaran > 0 ? Math.round((d.realisasi / d.anggaran) * 100) : 0,
                ]),
              ];
              downloadCSV(`Realisasi-Bulanan-${tahunAjaran}.csv`, csvData);
              toast.success("Rincian realisasi bulanan berhasil diekspor");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#374040] hover:text-[#3E8A2F] border border-[#E2E8DE] transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-6 py-3">Bulan &amp; Tahun</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Alokasi Pagu</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Realisasi Kas</th>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Serapan</th>
                <th className="text-right text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3 pr-6">Sisa Alokasi</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => {
                const sisa = d.anggaran - d.realisasi;
                const pct = d.anggaran > 0 ? Math.round((d.realisasi / d.anggaran) * 100) : 0;
                const isLast = i === monthlyData.length - 1;
                return (
                  <tr
                    key={d.m + d.year}
                    className="hover:bg-[#FAFBF9] transition-colors"
                    style={{ borderBottom: isLast ? "none" : "1px solid #F0F7EE" }}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-[#374040]">
                      {d.m} {d.year}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right text-[#374040]">{IDR(d.anggaran)}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right font-medium text-[#D97706]">
                      {d.realisasi === 0 ? <span className="text-[#D1D5DB]">—</span> : IDR(d.realisasi)}
                    </td>
                    <td className="px-4 py-3">
                      <SerapanBar pct={pct} />
                    </td>
                    <td className={`px-4 py-3 pr-6 text-sm tabular-nums text-right font-medium ${sisa < 0 ? "text-[#DC2626]" : "text-[#6B7769]"}`}>
                      {IDR(sisa)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #E2E8DE", background: "#F5F9F4" }}>
                <td className="px-6 py-3.5 text-sm font-bold text-[#1C2517]">Total Realisasi Terhitung</td>
                <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#1C2517]">{IDR(TOTAL_A)}</td>
                <td className="px-4 py-3.5 text-sm tabular-nums text-right font-bold text-[#D97706]">{IDR(TOTAL_T)}</td>
                <td className="px-4 py-3.5">
                  <SerapanBar pct={TOTAL_P} />
                </td>
                <td className="px-4 py-3.5 pr-6 text-sm tabular-nums text-right font-bold text-[#3E8A2F]">{IDR(TOTAL_S)}</td>
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
  const { tahunAjaran } = useAppContext();

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 px-4 md:px-0 pb-12">
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Anggaran</h2>
        <p className="text-sm text-[#6B7769]">Perencanaan dan realisasi anggaran madrasah TA {tahunAjaran}</p>
      </div>

      {/* Tabs */}
      <div className="flex sm:inline-flex w-full sm:w-auto rounded-lg p-1 bg-[#EDF7EC]">
        {[
          { id: "rab", label: "RAB (Rencana Anggaran)" },
          { id: "realisasi", label: "Realisasi & Evaluasi" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/keuangan/anggaran/${t.id}`)}
            className={[
              "flex-1 sm:flex-initial text-center px-5 py-2 rounded-md text-sm font-semibold transition-all",
              currentTab === t.id ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={currentTab === t.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {currentTab === "rab" && <RABTab tahunAjaran={tahunAjaran} />}
      {currentTab === "realisasi" && <RealisasiTab tahunAjaran={tahunAjaran} />}
    </div>
  );
}
