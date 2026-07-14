import { useState } from "react";
import { Search, Check, ChevronDown, X, MessageCircle, Printer } from "lucide-react";
import { fmt, fmtNum } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/components/ui/dialog";

// ─── static data ─────────────────────────────────────────────────────────────

const student = {
  nama: "Ahmad Fadhilah Putra",
  nis: "2024-0089",
  kelas: "9A",
  wali: "Bapak Hartono",
  telp: "0812-3456-7890",
  totalTagihan: 4_500_000,
  dibayar: 1_000_000,
  sisa: 3_500_000,
};

const searchResults = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", sisa: 3_500_000, inits: "AF" },
  { id: 2, nama: "Ahmad Fauzi Ridwan", nis: "2023-0145", kelas: "8B", sisa: 450_000, inits: "AF" },
  { id: 3, nama: "Ahmala Kartini", nis: "2025-0067", kelas: "7D", sisa: 0, inits: "AK" },
  { id: 4, nama: "Aisyah Nur Fadhila", nis: "2024-0234", kelas: "9B", sisa: 900_000, inits: "AN" },
];

const tagihanList = [
  // Daftar Ulang package (350.000)
  { prio:  1, kategori: "LKS Semester 1 — Daftar Ulang",                    total: 130_000, dibayar: 0, sisa: 130_000 },
  { prio:  2, kategori: "Iuran Semester 1 & 2 — Daftar Ulang",              total: 170_000, dibayar: 0, sisa: 170_000 },
  { prio:  3, kategori: "Pemeliharaan Lab Komputer — Daftar Ulang",          total:  50_000, dibayar: 0, sisa:  50_000 },
  // Adm. Kelas 9 package (700.000)
  { prio:  4, kategori: "Foto — Adm. Kelas 9",                              total:  40_000, dibayar: 0, sisa:  40_000 },
  { prio:  5, kategori: "Iuran Ujian — Adm. Kelas 9",                       total: 200_000, dibayar: 0, sisa: 200_000 },
  { prio:  6, kategori: "Album — Adm. Kelas 9",                             total:  80_000, dibayar: 0, sisa:  80_000 },
  { prio:  7, kategori: "Medali — Adm. Kelas 9",                            total:  80_000, dibayar: 0, sisa:  80_000 },
  { prio:  8, kategori: "Sampul Ijazah — Adm. Kelas 9",                     total:  50_000, dibayar: 0, sisa:  50_000 },
  { prio:  9, kategori: "Pemeliharaan Lab Komputer — Adm. Kelas 9",         total: 100_000, dibayar: 0, sisa: 100_000 },
  { prio: 10, kategori: "Perpisahan — Adm. Kelas 9",                        total: 150_000, dibayar: 0, sisa: 150_000 },
  // Additional fees (2.450.000)
  { prio: 11, kategori: "Try-out UN (3 Paket) — Kelas 9",                   total: 450_000, dibayar: 0, sisa: 450_000 },
  { prio: 12, kategori: "Wisuda & Pelepasan — Kelas 9",                     total: 600_000, dibayar: 0, sisa: 600_000 },
  { prio: 13, kategori: "Dana Pengembangan Sekolah — TA 2025/2026",         total: 700_000, dibayar: 0, sisa: 700_000 },
  { prio: 14, kategori: "Bimbingan Belajar Intensif — Kelas 9",             total: 500_000, dibayar: 0, sisa: 500_000 },
  { prio: 15, kategori: "Buku Referensi & LKS Semester 2",                  total: 200_000, dibayar: 0, sisa: 200_000 },
  // Total: 3.500.000 = student.sisa
];

// ─── allocation logic ─────────────────────────────────────────────────────────

function computeAlokasi(nominal: number) {
  let rem = nominal;
  return tagihanList.map((t) => {
    const alloc = Math.min(rem, t.sisa);
    rem -= alloc;
    return { ...t, alloc, lunas: alloc > 0 && alloc >= t.sisa };
  });
}

// ─── form components ──────────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const up = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          "w-full px-4 rounded-lg bg-white text-[#1C2517] outline-none transition-all text-sm",
          up ? "pt-6 pb-2" : "pt-4 pb-4",
        ].join(" ")}
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        }}
      />
      <label
        htmlFor={id}
        className={[
          "absolute left-4 pointer-events-none transition-all duration-150",
          up
            ? "top-1.5 text-[10px] text-[#6B7769]"
            : "top-4 text-sm text-[#9CA3A0]",
        ].join(" ")}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2 pr-9 rounded-lg bg-white text-[#1C2517] text-sm appearance-none outline-none transition-all"
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-4 top-1.5 text-[10px] text-[#6B7769] pointer-events-none"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
      />
    </div>
  );
}

// ─── receipt dialog ───────────────────────────────────────────────────────────

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: { nama: string; nis: string; kelas: string; wali: string; telp: string };
  nominal: number;
  tanggal: string;
  metode: string;
  nomorKuitansi: string;
  alokasi: Array<{ kategori: string; alloc: number; lunas: boolean }>;
}

function ReceiptDialog({
  open, onOpenChange, student, nominal, tanggal, metode, nomorKuitansi, alokasi,
}: ReceiptDialogProps) {
  const waNumber = student.telp.replace(/\D/g, "").replace(/^0/, "62");
  const waLines = [
    `Assalamu'alaikum Bapak/Ibu ${student.wali},`,
    ``,
    `Berikut kuitansi pembayaran TA 2025/2026:`,
    ``,
    `No. Kuitansi : ${nomorKuitansi}`,
    `Siswa        : ${student.nama} (Kelas ${student.kelas})`,
    `Nominal      : ${fmt(nominal)}`,
    `Tanggal      : ${tanggal}`,
    `Metode       : ${metode}`,
    ``,
    `Rincian Alokasi:`,
    ...alokasi
      .filter((a) => a.alloc > 0)
      .map((a) => `• ${a.kategori}: ${fmt(a.alloc)}${a.lunas ? " (LUNAS)" : ""}`),
    ``,
    `Terima kasih atas kepercayaan Bapak/Ibu.`,
    `MTs Al-Ittihad Pedaleman`,
  ];
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waLines.join("\n"))}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-8">
        <DialogTitle className="sr-only">Pembayaran Tercatat</DialogTitle>

        <div className="flex flex-col items-center text-center">
          {/* Green check */}
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
            <Check size={30} className="text-[#3E8A2F]" />
          </div>

          <p className="font-bold text-[#1C2517] mb-1" style={{ fontSize: "1.125rem" }}>
            Pembayaran Tercatat
          </p>
          <p className="text-xs text-[#9CA3A0] mb-6">
            No. Kuitansi{" "}
            <span className="font-mono font-semibold text-[#374040]">{nomorKuitansi}</span>
          </p>

          {/* Summary block */}
          <div
            className="w-full rounded-xl p-4 mb-5 text-left space-y-2.5"
            style={{ background: "#F5F9F4" }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Siswa</span>
              <span className="font-semibold text-[#1C2517]">{student.nama}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Nominal</span>
              <span className="font-bold text-[#3E8A2F] tabular-nums">{fmt(nominal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Tanggal</span>
              <span className="font-semibold text-[#1C2517]">{tanggal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Metode</span>
              <span className="font-semibold text-[#1C2517]">{metode}</span>
            </div>
          </div>

          {/* Allocation recap */}
          <div className="w-full mb-6 text-left">
            <p className="text-[10px] font-medium text-[#9CA3A0] uppercase tracking-wide mb-2">
              Alokasi Pembayaran
            </p>
            {alokasi.filter((a) => a.alloc > 0).map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-2"
                style={{ borderBottom: "1px solid #F0F7EE" }}
              >
                <span className="text-[#374040]">{item.kategori}</span>
                <span className="tabular-nums text-[#374040]">{fmt(item.alloc)}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full space-y-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-lg bg-[#3E8A2F] text-white font-semibold text-sm hover:bg-[#2E6B22] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Kirim Kuitansi via WA
            </a>
            <button
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#FAFBF9] transition-colors flex items-center justify-center gap-2"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <Printer size={15} />
              Cetak Kuitansi
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#6B7769] hover:text-[#374040] transition-colors"
            >
              Transaksi Berikutnya
            </button>
          </div>

          <p className="text-xs text-[#9CA3A0] mt-4">
            Dikirim ke {student.wali} — {student.telp}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── page component ───────────────────────────────────────────────────────────

export function Pembayaran() {
  const [query, setQuery] = useState("Ahmad Fadhilah Putra");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nominal, setNominal] = useState(400_000);
  const [metode, setMetode] = useState("Tunai");
  const [akun, setAkun] = useState("Kas Tunai");
  const [tanggal, setTanggal] = useState("13/07/2026");
  const [catatan, setCatatan] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const alokasi = computeAlokasi(nominal);
  const sisaSetelah = Math.max(0, student.sisa - nominal);

  const handleNominalChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setNominal(parseInt(digits) || 0);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Page heading */}
      <div className="mb-5">
        <h2 className="text-[#1C2517]">Pembayaran</h2>
        <p className="text-sm text-[#6B7769]">Catat pembayaran siswa</p>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4 min-w-0">

          {/* 1 · Student search combobox */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8DE" }}>
            <div className="relative">
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg"
                style={{ border: "1.5px solid #3E8A2F", background: "#FAFBF9" }}
              >
                <Search size={15} className="text-[#6B7769] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  className="flex-1 bg-transparent outline-none text-[#1C2517] text-sm"
                  placeholder="Ketik nama atau NIS siswa..."
                  autoFocus
                />
                {query && (
                  <button
                    onMouseDown={() => { setQuery(""); setDropdownOpen(true); }}
                    className="ml-1 text-[#9CA3A0] hover:text-[#374040] transition-colors"
                    tabIndex={-1}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl z-30 overflow-hidden"
                  style={{ border: "1px solid #E2E8DE" }}
                >
                  {searchResults.map((s, i) => (
                    <button
                      key={s.id}
                      onMouseDown={() => {
                        setQuery(s.nama);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EDF7EC] transition-colors text-left"
                      style={{
                        background: i === 0 ? "#EDF7EC" : undefined,
                        borderBottom:
                          i < searchResults.length - 1
                            ? "1px solid #F0F7EE"
                            : undefined,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {s.inits}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C2517] truncate">
                          {s.nama}
                        </p>
                        <p className="text-xs text-[#6B7769]">
                          {s.nis} · Kelas {s.kelas}
                        </p>
                      </div>
                      {s.sisa > 0 && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] tabular-nums">
                          {fmt(s.sisa)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2 · Student context card + bill table */}
          <div
            className="bg-white rounded-xl p-6 space-y-5"
            style={{ border: "1px solid #E2E8DE" }}
          >
            {/* Student info */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white font-bold text-sm shrink-0">
                AF
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1C2517]">{student.nama}</p>
                <p className="text-sm text-[#6B7769]">
                  Kelas {student.kelas} · NIS {student.nis}
                </p>
                <p className="text-xs text-[#6B7769] mt-0.5">
                  <span className="font-medium">Wali:</span> {student.wali} —{" "}
                  {student.telp}
                </p>
              </div>
            </div>

            {/* Summary row */}
            <div
              className="grid grid-cols-3 rounded-xl overflow-hidden"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {[
                { label: "Total Tagihan", value: student.totalTagihan, red: false },
                { label: "Dibayar", value: student.dibayar, red: false },
                { label: "Sisa", value: student.sisa, red: true },
              ].map((col, ci) => (
                <div
                  key={ci}
                  className="px-4 py-3"
                  style={{
                    background: col.red ? "#FFF5F5" : "#FAFBF9",
                    borderRight: ci < 2 ? "1px solid #E2E8DE" : undefined,
                  }}
                >
                  <p className="text-[10px] font-semibold text-[#6B7769] uppercase tracking-wide mb-1">
                    {col.label}
                  </p>
                  <p
                    className={`tabular-nums font-bold ${
                      col.red
                        ? "text-[#DC2626] text-base"
                        : "text-[#1C2517] text-sm"
                    }`}
                  >
                    {fmt(col.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Bill table */}
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest mb-3">
                Tagihan Belum Lunas
              </p>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                    <th className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3 w-10">
                      Prio
                    </th>
                    <th className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                      Kategori
                    </th>
                    <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                      Total
                    </th>
                    <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                      Dibayar
                    </th>
                    <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5">
                      Sisa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tagihanList.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#FAFBF9] transition-colors"
                      style={{
                        borderBottom:
                          i < tagihanList.length - 1
                            ? "1px solid #F0F7EE"
                            : undefined,
                      }}
                    >
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EDF7EC] text-[#3E8A2F] text-[10px] font-bold">
                          {row.prio}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-sm font-medium text-[#1C2517]">
                        {row.kategori}
                      </td>
                      <td className="py-3 pr-3 text-sm tabular-nums text-[#1C2517] text-right">
                        {fmt(row.total)}
                      </td>
                      <td className="py-3 pr-3 text-sm tabular-nums text-[#6B7769] text-right">
                        {fmt(row.dibayar)}
                      </td>
                      <td className="py-3 text-sm tabular-nums font-semibold text-[#DC2626] text-right">
                        {fmt(row.sisa)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 · Payment form */}
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
            <p className="text-sm font-semibold text-[#1C2517] mb-4">
              Detail Pembayaran
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setNominal(student.sisa)}
                className="flex items-center px-3.5 py-2 rounded-lg text-sm transition-colors hover:border-[#3E8A2F] hover:text-[#3E8A2F]"
                style={{ border: "1px solid #E2E8DE", color: "#374040" }}
              >
                Lunasi semua
                <span className="ml-1.5 font-semibold text-[#3E8A2F] tabular-nums">
                  — {fmt(student.sisa)}
                </span>
              </button>
              <button
                onClick={() => setNominal(350_000)}
                className="flex items-center px-3.5 py-2 rounded-lg text-sm transition-colors hover:border-[#3E8A2F] hover:text-[#3E8A2F]"
                style={{ border: "1px solid #E2E8DE", color: "#374040" }}
              >
                Lunasi Daftar Ulang
                <span className="ml-1.5 font-semibold tabular-nums text-[#374040]">
                  — {fmt(350_000)}
                </span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Nominal — large input with inline Rp prefix */}
              <div
                className="relative flex items-center px-4 rounded-lg bg-white"
                style={{
                  border: "1.5px solid #3E8A2F",
                  paddingTop: "22px",
                  paddingBottom: "8px",
                }}
              >
                <span className="text-[#6B7769] mr-1.5 text-sm shrink-0">Rp</span>
                <input
                  type="text"
                  value={fmtNum(nominal)}
                  onChange={(e) => handleNominalChange(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-[#1C2517] tabular-nums"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                />
                <label className="absolute left-4 top-1.5 text-[10px] text-[#3E8A2F] pointer-events-none">
                  Nominal Bayar
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  id="metode"
                  label="Metode Pembayaran"
                  value={metode}
                  onChange={setMetode}
                  options={["Tunai", "Transfer", "QRIS"]}
                  required
                />
                <FloatingSelect
                  id="akun"
                  label="Akun Tujuan"
                  value={akun}
                  onChange={setAkun}
                  options={["Kas Tunai", "Bank BSI", "Bank Mandiri Syariah"]}
                  required
                />
              </div>

              <FloatingInput
                id="tanggal"
                label="Tanggal"
                value={tanggal}
                onChange={setTanggal}
                required
              />

              <FloatingInput
                id="catatan"
                label="Catatan"
                value={catatan}
                onChange={setCatatan}
              />

              <button
                onClick={() => setShowSuccess(true)}
                className="w-full py-3.5 rounded-lg bg-[#3E8A2F] text-white font-semibold text-sm hover:bg-[#2E6B22] transition-colors"
                style={{ marginTop: 4 }}
              >
                Catat Pembayaran
              </button>

              <div className="text-center pt-0.5">
                <button className="text-xs text-[#3E8A2F] hover:underline">
                  Atur alokasi manual
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — sticky ── */}
        <div className="sticky top-6 self-start">
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <p className="text-sm font-semibold text-[#1C2517]">Preview Alokasi</p>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF7EC] text-[#3E8A2F] tabular-nums">
                {fmt(nominal)}
              </span>
            </div>

            {/* Allocation rows */}
            <div className="space-y-4">
              {alokasi.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {/* Icon */}
                  {item.lunas ? (
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-[#166534]" />
                    </div>
                  ) : item.alloc > 0 ? (
                    <div
                      className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5 text-[#92400E]"
                      style={{ fontSize: 14, lineHeight: 1 }}
                    >
                      ◐
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                      <span
                        className="text-[#9CA3A0]"
                        style={{ fontSize: 12, lineHeight: 1 }}
                      >
                        —
                      </span>
                    </div>
                  )}

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C2517]">
                      {item.kategori}
                    </p>
                    {item.lunas && (
                      <p className="text-xs font-semibold text-[#3E8A2F] tabular-nums mt-0.5">
                        {fmt(item.alloc)} → LUNAS
                      </p>
                    )}
                    {!item.lunas && item.alloc > 0 && (
                      <p className="text-xs text-[#92400E] tabular-nums mt-0.5">
                        {fmt(item.alloc)} dari {fmt(item.sisa)}
                      </p>
                    )}
                    {item.alloc === 0 && (
                      <p className="text-xs text-[#9CA3A0] mt-0.5">
                        Belum dialokasikan
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
              <p className="text-xs text-[#6B7769] mb-1">
                Sisa tagihan setelah bayar:
              </p>
              <p className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: "1rem" }}>
                {fmt(sisaSetelah)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Receipt dialog ── */}
      <ReceiptDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        student={student}
        nominal={nominal}
        tanggal={tanggal}
        metode={metode}
        nomorKuitansi="KW/2026/07/0143"
        alokasi={alokasi}
      />

    </div>
  );
}
