import { useState } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { fmt, fmtNum } from "@/lib/formatters";

// ─── static data ──────────────────────────────────────────────────────────────

const student = {
  nama: "Ahmad Fadhilah Putra",
  nis: "2024-0089",
  kelas: "9A",
  wali: "Bapak Hartono",
  totalTagihan: 4_500_000,
  dibayar: 1_000_000,
  sisa: 3_500_000,
  inits: "AF",
};

const searchResults = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A",  sisa: 3_500_000 },
  { id: 2, nama: "Ahmad Fauzi Ridwan",   nis: "2023-0145", kelas: "8B",  sisa: 450_000 },
  { id: 3, nama: "Ahmala Kartini",        nis: "2025-0067", kelas: "7D",  sisa: 0 },
  { id: 4, nama: "Aisyah Nur Fadhila",    nis: "2024-0234", kelas: "9B",  sisa: 900_000 },
];

const tagihanList = [
  // Daftar Ulang package (350.000)
  { prio:  1, kategori: "LKS Semester 1 — Daftar Ulang",                    total: 130_000, sisa: 130_000 },
  { prio:  2, kategori: "Iuran Semester 1 & 2 — Daftar Ulang",              total: 170_000, sisa: 170_000 },
  { prio:  3, kategori: "Pemeliharaan Lab Komputer — Daftar Ulang",          total:  50_000, sisa:  50_000 },
  // Adm. Kelas 9 package (700.000)
  { prio:  4, kategori: "Foto — Adm. Kelas 9",                              total:  40_000, sisa:  40_000 },
  { prio:  5, kategori: "Iuran Ujian — Adm. Kelas 9",                       total: 200_000, sisa: 200_000 },
  { prio:  6, kategori: "Album — Adm. Kelas 9",                             total:  80_000, sisa:  80_000 },
  { prio:  7, kategori: "Medali — Adm. Kelas 9",                            total:  80_000, sisa:  80_000 },
  { prio:  8, kategori: "Sampul Ijazah — Adm. Kelas 9",                     total:  50_000, sisa:  50_000 },
  { prio:  9, kategori: "Pemeliharaan Lab Komputer — Adm. Kelas 9",         total: 100_000, sisa: 100_000 },
  { prio: 10, kategori: "Perpisahan — Adm. Kelas 9",                        total: 150_000, sisa: 150_000 },
  // Additional fees (2.450.000)
  { prio: 11, kategori: "Try-out UN (3 Paket) — Kelas 9",                   total: 450_000, sisa: 450_000 },
  { prio: 12, kategori: "Wisuda & Pelepasan — Kelas 9",                     total: 600_000, sisa: 600_000 },
  { prio: 13, kategori: "Dana Pengembangan Sekolah — TA 2025/2026",         total: 700_000, sisa: 700_000 },
  { prio: 14, kategori: "Bimbingan Belajar Intensif — Kelas 9",             total: 500_000, sisa: 500_000 },
  { prio: 15, kategori: "Buku Referensi & LKS Semester 2",                  total: 200_000, sisa: 200_000 },
  // Total: 3.500.000 = student.sisa
];

function computeAlokasi(nominal: number) {
  let rem = nominal;
  return tagihanList.map((t) => {
    const alloc = Math.min(rem, t.sisa);
    rem -= alloc;
    return { ...t, alloc, lunas: alloc > 0 && alloc >= t.sisa };
  });
}

// ─── form primitives ──────────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, required,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const up = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-4 rounded-lg bg-white text-[#1C2517] outline-none text-sm ${up ? "pt-6 pb-2" : "py-4"}`}
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
          fontFamily: "inherit",
          minHeight: 52,
        }}
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-150 ${up ? "top-1.5 text-[10px] text-[#6B7769]" : "top-[15px] text-sm text-[#9CA3A0]"}`}
      >
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex-1 min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pt-6 pb-2 pl-4 pr-8 rounded-lg bg-white text-[#1C2517] text-sm appearance-none outline-none"
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
          fontFamily: "inherit",
          minHeight: 52,
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <label className="absolute left-4 top-1.5 text-[10px] text-[#6B7769] pointer-events-none">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
      />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MobilePembayaran() {
  const [query, setQuery]       = useState("Ahmad Fadhilah Putra");
  const [dropOpen, setDropOpen] = useState(false);
  const [nominal, setNominal]   = useState(400_000);
  const [metode, setMetode]     = useState("Tunai");
  const [akun, setAkun]         = useState("Kas Tunai");
  const [tanggal, setTanggal]   = useState("13/07/2026");
  const [catatan, setCatatan]   = useState("");

  const isSelected = query === student.nama;
  const alokasi    = computeAlokasi(nominal);
  const sisaSetelah = Math.max(0, student.sisa - nominal);

  const handleNominalChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setNominal(parseInt(digits) || 0);
  };

  return (
    <>
      {/* ── Scrollable content ── */}
      <div
        className="px-4 py-3 flex flex-col gap-3"
        style={{ paddingBottom: 84 }}
      >

        {/* ── 1 · Student search ── */}
        <div className="relative">
          <div
            className="flex items-center gap-2.5 rounded-lg bg-white"
            style={{
              height: 48,
              padding: "0 12px",
              border: isSelected
                ? "1.5px solid #3E8A2F"
                : dropOpen
                ? "1.5px solid #3E8A2F"
                : "1px solid #E2E8DE",
            }}
          >
            <Search size={16} color={isSelected ? "#3E8A2F" : "#9CA3A0"} className="shrink-0" />

            {isSelected ? (
              <>
                <span className="flex-1 text-sm font-medium text-[#1C2517] truncate">
                  {query}
                </span>
                <button
                  onClick={() => { setQuery(""); setDropOpen(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#F3F4F6]"
                  style={{ background: "#F3F4F6", border: "none", cursor: "pointer" }}
                  aria-label="Hapus pilihan"
                >
                  <X size={12} color="#374040" />
                </button>
              </>
            ) : (
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={query}
                autoFocus
                onChange={(e) => { setQuery(e.target.value); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                className="flex-1 bg-transparent outline-none text-sm text-[#1C2517]"
                style={{ fontFamily: "inherit" }}
              />
            )}
          </div>

          {/* Dropdown */}
          {dropOpen && !isSelected && (
            <div
              className="absolute left-0 right-0 z-20 bg-white rounded-xl overflow-hidden"
              style={{ top: 52, border: "1px solid #E2E8DE", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            >
              {searchResults
                .filter((r) => r.nama.toLowerCase().includes(query.toLowerCase()))
                .map((r, i, arr) => (
                  <button
                    key={r.id}
                    onMouseDown={() => { setQuery(r.nama); setDropOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F9F4] transition-colors"
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      borderBottom: i < arr.length - 1 ? "1px solid #F0F7EE" : "none",
                      minHeight: 52,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1C2517] truncate">{r.nama}</p>
                      <p className="text-[11px] text-[#6B7769]">{r.nis} · Kelas {r.kelas}</p>
                    </div>
                    {r.sisa > 0 && (
                      <span className="text-xs font-semibold tabular-nums text-[#DC2626] ml-3 shrink-0">
                        {fmt(r.sisa)}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ── 2 · Student context card ── */}
        {isSelected && (
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
            {/* Name + class row */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: "#3E8A2F" }}
              >
                {student.inits}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#1C2517] leading-none truncate">
                  {student.nama}
                </p>
                <p className="text-[11px] text-[#6B7769] mt-0.5">
                  {student.nis} · Kelas {student.kelas}
                </p>
              </div>
            </div>

            {/* Summary: Total / Dibayar / Sisa */}
            <div
              className="grid grid-cols-3 mt-3 pt-3"
              style={{ borderTop: "1px solid #E2E8DE" }}
            >
              <div style={{ paddingRight: 12, borderRight: "1px solid #E2E8DE" }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Total</p>
                <p className="text-[12px] font-bold tabular-nums text-[#1C2517] leading-none">
                  {fmt(student.totalTagihan)}
                </p>
              </div>
              <div style={{ paddingLeft: 12, paddingRight: 12, borderRight: "1px solid #E2E8DE" }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Dibayar</p>
                <p className="text-[12px] font-bold tabular-nums text-[#3E8A2F] leading-none">
                  {fmt(student.dibayar)}
                </p>
              </div>
              <div style={{ paddingLeft: 12 }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Sisa</p>
                <p className="text-[15px] font-bold tabular-nums text-[#DC2626] leading-none">
                  {fmt(student.sisa)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3 · Tagihan Belum Lunas ── */}
        {isSelected && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-[#9CA3A0] uppercase tracking-wide px-0.5">
              Tagihan Belum Lunas
            </p>
            {tagihanList.map((item) => (
              <div
                key={item.prio}
                className="bg-white rounded-xl flex items-center gap-3"
                style={{
                  border: "1px solid #E2E8DE",
                  padding: "12px 16px",
                  minHeight: 52,
                }}
              >
                {/* Prio chip */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: "#EDF7EC", color: "#3E8A2F" }}
                >
                  {item.prio}
                </div>
                {/* Kategori */}
                <p className="flex-1 text-[13px] font-semibold text-[#1C2517]">
                  {item.kategori}
                </p>
                {/* Sisa */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#9CA3A0]">Sisa</p>
                  <p className="text-[13px] font-bold tabular-nums text-[#DC2626]">
                    {fmt(item.sisa)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 4 · Payment form ── */}
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
          <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 14 }}>
            Detail Pembayaran
          </p>

          {/* Quick chips — horizontal scroll */}
          <div
            className="flex gap-2"
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              paddingBottom: 2,
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => setNominal(student.sisa)}
              className="flex items-center shrink-0 rounded-lg text-sm transition-colors hover:border-[#3E8A2F]"
              style={{
                border: "1px solid #E2E8DE",
                color: "#374040",
                padding: "10px 14px",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                minHeight: 44,
              }}
            >
              Lunasi semua
              <span className="ml-1.5 font-semibold text-[#3E8A2F] tabular-nums">
                — {fmt(student.sisa)}
              </span>
            </button>
            <button
              onClick={() => setNominal(350_000)}
              className="flex items-center shrink-0 rounded-lg text-sm transition-colors hover:border-[#3E8A2F]"
              style={{
                border: "1px solid #E2E8DE",
                color: "#374040",
                padding: "10px 14px",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                minHeight: 44,
              }}
            >
              Lunasi Daftar Ulang
              <span className="ml-1.5 font-semibold text-[#374040] tabular-nums">
                — {fmt(350_000)}
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Nominal Bayar — large filled */}
            <div
              className="relative flex items-center px-4 rounded-lg bg-white"
              style={{
                border: "1.5px solid #3E8A2F",
                paddingTop: 22,
                paddingBottom: 9,
              }}
            >
              <label className="absolute left-4 top-1.5 text-[10px] text-[#3E8A2F] pointer-events-none">
                Nominal Bayar<span className="text-red-500 ml-0.5">*</span>
              </label>
              <span className="text-[#6B7769] mr-1.5 text-sm shrink-0 select-none">Rp</span>
              <input
                type="text"
                value={fmtNum(nominal)}
                onChange={(e) => handleNominalChange(e.target.value)}
                className="flex-1 outline-none bg-transparent text-[#1C2517] tabular-nums"
                style={{ fontSize: "1.125rem", fontWeight: 700, fontFamily: "inherit" }}
              />
            </div>

            {/* Metode + Akun (side by side) */}
            <div className="flex gap-3">
              <FloatingSelect
                label="Metode"
                value={metode}
                onChange={setMetode}
                options={["Tunai", "Transfer", "QRIS"]}
                required
              />
              <FloatingSelect
                label="Akun Tujuan"
                value={akun}
                onChange={setAkun}
                options={["Kas Tunai", "Bank BSI", "Bank Mandiri Syariah"]}
                required
              />
            </div>

            {/* Tanggal */}
            <FloatingInput
              label="Tanggal"
              value={tanggal}
              onChange={setTanggal}
              required
            />

            {/* Catatan — collapsed single line */}
            <FloatingInput
              label="Catatan (opsional)"
              value={catatan}
              onChange={setCatatan}
            />
          </div>
        </div>

        {/* ── 5 · Preview Alokasi ── */}
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
          {/* Header */}
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <p className="text-[13px] font-semibold text-[#1C2517]">Preview Alokasi</p>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums"
              style={{ background: "#EDF7EC", color: "#3E8A2F" }}
            >
              {fmt(nominal)}
            </span>
          </div>

          {/* Allocation waterfall */}
          <div className="flex flex-col gap-4">
            {alokasi.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.lunas ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#DCFCE7" }}
                  >
                    <Check size={11} color="#166534" />
                  </div>
                ) : item.alloc > 0 ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#FEF3C7", color: "#92400E", fontSize: 14, lineHeight: 1 }}
                  >
                    ◐
                  </div>
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#F3F4F6" }}
                  >
                    <span style={{ color: "#9CA3A0", fontSize: 12, lineHeight: 1 }}>—</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C2517]">{item.kategori}</p>
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
                    <p className="text-xs text-[#9CA3A0] mt-0.5">Belum dialokasikan</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sisa setelah bayar */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
            <p className="text-xs text-[#6B7769] mb-1">Sisa tagihan setelah bayar:</p>
            <p className="font-bold tabular-nums text-[#1C2517]" style={{ fontSize: "1rem" }}>
              {fmt(sisaSetelah)}
            </p>
          </div>
        </div>

      </div>

      {/* ── 6 · Sticky "Catat Pembayaran" bar — fixed above bottom nav ── */}
      <div
        style={{
          position: "fixed",
          bottom: 64,
          left: 0,
          right: 0,
          zIndex: 35,
          background: "#fff",
          borderTop: "1px solid #E2E8DE",
          padding: "10px 16px",
        }}
      >
        <button
          style={{
            width: "100%",
            height: 52,
            background: "#3E8A2F",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: 0,
          }}
        >
          Catat Pembayaran
        </button>
      </div>
    </>
  );
}
