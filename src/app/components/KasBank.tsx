import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, MoreHorizontal, ArrowRight, Landmark, Wallet, X,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { useAppContext } from "@/context/AppContext";
import type { AkunNama, ManualTransaksiRow } from "@/types";
import { toast } from "sonner";

import {
  BSI_SPARK, MANDIRI_SPARK, KAS_SPARK,
  akunData,
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtTanggal(isoOrStr: string): string {
  const d = new Date(isoOrStr);
  if (isNaN(d.getTime())) return isoOrStr;
  return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
}

function metodeToAkun(metode: string): AkunNama {
  return metode === "Tunai" ? "Kas Tunai" : "Bank BSI";
}

// ─── Transaksi form sheet ─────────────────────────────────────────────────────

function TransaksiSheet({
  tipe,
  onClose,
  onSave,
}: {
  tipe: "masuk" | "keluar";
  onClose: () => void;
  onSave: (data: Omit<ManualTransaksiRow, "id" | "dicatatOleh" | "waktuCatat" | "ref">) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    tanggal: today,
    keterangan: "",
    kategori: tipe === "masuk" ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0],
    akun: "Bank BSI" as AkunNama,
    jumlah: "",
    catatan: "",
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
    onSave({ tipe, tanggal: form.tanggal, keterangan: form.keterangan.trim(),
      kategori: form.kategori, akun: form.akun, jumlah: nominal,
      catatan: form.catatan.trim() || undefined });
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
                  {AKUN_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
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
    manualTransaksiList, addManualTransaksi, nextBVRef, role,
  } = useAppContext();

  const [filter, setFilter] = useState<FilterType>("Semua");
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [page, setPage] = useState(1);
  const [sheetTipe, setSheetTipe] = useState<"masuk" | "keluar" | null>(null);

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
        akun: metodeToAkun(t.metode) as AkunNama,
        ref: t.nomorKuitansi,
        jumlah: t.nominal,
        tipe: "masuk" as const,
      };
    }).sort((a, b) => b.tanggalRaw.localeCompare(a.tanggalRaw)),
  [transaksiList, siswaList, tagihanList]);

  // Manual entries (both masuk and keluar)
  const manualRows = useMemo(() =>
    manualTransaksiList.map(t => ({
      id: t.id,
      tanggal: fmtTanggal(t.tanggal),
      tanggalRaw: t.tanggal,
      keterangan: t.keterangan,
      kategori: t.kategori,
      akun: t.akun,
      ref: t.ref,
      jumlah: t.jumlah,
      tipe: t.tipe,
    })),
  [manualTransaksiList]);

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

  function handleSave(data: Omit<ManualTransaksiRow, "id" | "dicatatOleh" | "waktuCatat" | "ref">) {
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

          {/* Date (display only) */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            <Calendar size={13} className="text-[#6B7769] shrink-0" />
            <span className="text-sm text-[#374040]">Semua periode</span>
            <ChevronDown size={12} className="text-[#9CA3A0]" />
          </button>

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

          {/* Action buttons */}
          {canEdit && (
            <div className="ml-auto flex gap-2 shrink-0">
              <button
                onClick={() => setSheetTipe("masuk")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
              >
                <Plus size={13} />
                Pemasukan
              </button>
              <button
                onClick={() => setSheetTipe("keluar")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                style={{ border: "1.5px solid #DC2626" }}
              >
                <span className="font-bold text-base leading-none">−</span>
                Pengeluaran
              </button>
            </div>
          )}
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EDF7EC]">
            <TrendingUp size={12} className="text-[#3E8A2F]" />
            <span className="text-xs text-[#6B7769]">Pemasukan:</span>
            <span className="text-sm font-bold tabular-nums text-[#3E8A2F]">{fmt(totalMasuk)}</span>
          </div>
          <span className="text-[#D1D5DB]">·</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEE2E2]">
            <TrendingDown size={12} className="text-[#DC2626]" />
            <span className="text-xs text-[#6B7769]">Pengeluaran:</span>
            <span className="text-sm font-bold tabular-nums text-[#DC2626]">{fmt(totalKeluar)}</span>
          </div>
          <span className="text-[#D1D5DB]">·</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F9F4]">
            <span className="text-xs text-[#6B7769]">Saldo:</span>
            <span className={`text-sm font-bold tabular-nums ${totalMasuk - totalKeluar >= 0 ? "text-[#3E8A2F]" : "text-[#DC2626]"}`}>
              {fmt(totalMasuk - totalKeluar)}
            </span>
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
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F9F4] text-[#6B7769]">
                    {row.kategori}
                  </span>
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

    {/* Sheet */}
    {sheetTipe && (
      <TransaksiSheet
        tipe={sheetTipe}
        onClose={() => setSheetTipe(null)}
        onSave={handleSave}
      />
    )}
    </>
  );
}

// ─── Akun tab ─────────────────────────────────────────────────────────────────

function AkunTab() {
  const { transaksiList, manualTransaksiList } = useAppContext();

  const computedAkun = useMemo(() => {
    return akunData.map(akun => {
      const deltaMasuk = transaksiList.reduce((sum, t) =>
        metodeToAkun(t.metode) === akun.nama ? sum + t.nominal : sum, 0);
      const deltaManualMasuk = manualTransaksiList
        .filter(t => t.akun === akun.nama && t.tipe === "masuk")
        .reduce((s, t) => s + t.jumlah, 0);
      const deltaManualKeluar = manualTransaksiList
        .filter(t => t.akun === akun.nama && t.tipe === "keluar")
        .reduce((s, t) => s + t.jumlah, 0);
      return {
        ...akun,
        saldo: akun.saldo + deltaMasuk + deltaManualMasuk - deltaManualKeluar,
      };
    });
  }, [transaksiList, manualTransaksiList]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {computedAkun.map((akun) => {
        const Icon = akun.icon === "wallet" ? Wallet : Landmark;
        const iconBg    = akun.icon === "wallet" ? "#FEF3C7" : "#EDF7EC";
        const iconColor = akun.icon === "wallet" ? "#92400E" : "#3E8A2F";
        return (
          <div key={akun.id} className="bg-white rounded-xl p-6 flex flex-col" style={{ border: "1px solid #E2E8DE" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1C2517]">{akun.nama}</p>
                {akun.nomor
                  ? <p className="text-[11px] text-[#9CA3A0] mt-0.5" style={{ fontFamily: "monospace" }}>{akun.nomor}</p>
                  : <p className="text-[11px] text-[#9CA3A0] mt-0.5">Petty cash</p>
                }
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-3" style={{ background: iconBg }}>
                <Icon size={15} style={{ color: iconColor }} />
              </div>
            </div>
            <p className="tabular-nums font-bold text-[#1C2517] tracking-tight mb-4" style={{ fontSize: "1.25rem" }}>
              {fmt(akun.saldo)}
            </p>
            <div className="flex-1 flex items-end mb-3">
              <Sparkline data={akun.spark} color={akun.sparkColor} />
            </div>
            <p className="text-[11px] text-[#9CA3A0]">Terakhir rekonsiliasi: {akun.rekonsiliasi}</p>
          </div>
        );
      })}

      {/* Add account slot */}
      <button
        className="flex flex-col items-center justify-center rounded-xl transition-colors group"
        style={{ border: "2px dashed #D1D5DB" }}
        onMouseOver={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "#3E8A2F";
          (e.currentTarget as HTMLElement).style.background = "#F5FBF4";
        }}
        onMouseOut={e => {
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
  const { bankTransferList, addBankTransfer } = useAppContext();

  function fmtTglISO(iso: string) {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} ${d.getFullYear()}`;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>Mutasi Antar Akun</p>
          <p className="text-sm text-[#6B7769] mt-0.5">Transfer dana antara akun keuangan</p>
        </div>
        <button
          onClick={() => toast.info("Form buat transfer akan segera tersedia")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0"
        >
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
              {bankTransferList.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-[#9CA3A0]">Belum ada mutasi antar akun</td></tr>
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
                  <td className="py-3.5 pr-4 text-sm text-[#6B7769]">{row.catatan}</td>
                  <td className="py-3.5 pr-6">
                    <StatusBadge status={row.status} />
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
  const activeTab = (tab || "transaksi") as TabType;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      <div>
        <h2 className="text-[#1C2517]">Kas &amp; Bank</h2>
        <p className="text-sm text-[#6B7769]">Kelola transaksi, akun, dan mutasi keuangan</p>
      </div>

      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
          {(["transaksi", "akun", "mutasi"] as const).map(t => (
            <button key={t} onClick={() => navigate(`/keuangan/kas-bank/${t}`)}
              className={[
                "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
                activeTab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
              ].join(" ")}
              style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
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
