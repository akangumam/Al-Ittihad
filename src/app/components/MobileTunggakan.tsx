import { useState } from "react";
import { Search, SlidersHorizontal, MessageCircle, CreditCard, X } from "lucide-react";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";

// ─── data (consistent with desktop Tunggakan) ─────────────────────────────────

const rows = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", jumlah: 3_500_000, badge: "Kritis",    jatuhTempo: "31 Mar 2026", terakhirBayar: "3 Mar 2026",  inits: "AF" },
  { id: 2, nama: "Siti Rahmawati",        nis: "2023-0145", kelas: "8B", jumlah: 2_800_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "15 Apr 2026", inits: "SR" },
  { id: 3, nama: "Rizky Firmansyah",      nis: "2025-0067", kelas: "7C", jumlah: 2_100_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "20 Apr 2026", inits: "RF" },
  { id: 4, nama: "Nur Hidayatullah",      nis: "2024-0234", kelas: "9D", jumlah: 1_900_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "10 Mei 2026", inits: "NH" },
  { id: 5, nama: "Muhammad Alif Hakim",   nis: "2023-0312", kelas: "8A", jumlah: 1_750_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "12 Mei 2026", inits: "MA" },
  { id: 6, nama: "Farah Dianti Putri",    nis: "2025-0089", kelas: "7B", jumlah:   950_000, badge: "Perhatian", jatuhTempo: "20 Jun 2026", terakhirBayar: "8 Jun 2026",  inits: "FD" },
  { id: 7, nama: "Bagas Prasetyo",        nis: "2024-0178", kelas: "9C", jumlah:   875_000, badge: "Perhatian", jatuhTempo: "17 Jun 2026", terakhirBayar: "5 Jun 2026",  inits: "BP" },
  { id: 8, nama: "Aisyah Nur Fadila",     nis: "2023-0456", kelas: "8D", jumlah:   700_000, badge: "Perhatian", jatuhTempo: "22 Jun 2026", terakhirBayar: "10 Jun 2026", inits: "AN" },
];

const agingTabs = [
  { label: "Semua",            count: 68 },
  { label: "Lewat 1–30 hari",  count: 31 },
  { label: "Lewat 31–60 hari", count: 22 },
  { label: "Lewat 60+ hari",   count: 15 },
];

const kelasOptions = [
  "Semua Kelas",
  "Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D",
  "Kelas 8A", "Kelas 8B", "Kelas 8C", "Kelas 8D",
  "Kelas 9A", "Kelas 9B", "Kelas 9C", "Kelas 9D",
];

// ─── avatar colours for tunggakan cards (stays local) ─────────────────────────

const AVATAR: Record<string, { bg: string; text: string }> = {
  Kritis:    { bg: "#FEE2E2", text: "#991B1B" },
  Waspada:   { bg: "#FEF3C7", text: "#92400E" },
  Perhatian: { bg: "#EDF7EC", text: "#3E8A2F" },
};

// ─── class filter sheet ───────────────────────────────────────────────────────

function ClassFilterSheet({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Dim overlay */}
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 bg-white overflow-y-auto"
        style={{ borderRadius: "16px 16px 0 0", maxHeight: "72%" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="rounded-full bg-[#D1D5DB]" style={{ width: 32, height: 4 }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5"
          style={{ paddingTop: 10, paddingBottom: 12 }}
        >
          <p className="font-semibold text-[#1C2517]">Filter Kelas</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F5F9F4", border: "none", cursor: "pointer" }}
            aria-label="Tutup filter"
          >
            <X size={15} color="#374040" />
          </button>
        </div>

        {/* Options */}
        <div style={{ paddingBottom: 32 }}>
          {kelasOptions.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); onClose(); }}
                className="w-full flex items-center justify-between px-5 hover:bg-[#F5F9F4] transition-colors"
                style={{
                  height: 48,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span
                  className="text-sm"
                  style={{ color: active ? "#3E8A2F" : "#374040", fontWeight: active ? 600 : 400 }}
                >
                  {opt}
                </span>
                {active && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#3E8A2F" }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── student card ─────────────────────────────────────────────────────────────

function StudentCard({ row }: { row: typeof rows[0] }) {
  const avatar = AVATAR[row.badge] ?? { bg: "#EDF7EC", text: "#3E8A2F" };
  return (
    <div
      className="bg-white rounded-xl"
      style={{ border: "1px solid #E2E8DE" }}
    >
      {/* Top row: avatar + info + amount */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
          style={{ background: avatar.bg, color: avatar.text }}
        >
          {row.inits}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1C2517] leading-snug truncate">
            {row.nama}
          </p>
          <p className="text-[11px] text-[#6B7769] mt-0.5">
            {row.nis} · Kelas {row.kelas}
          </p>
        </div>
        <div className="text-right shrink-0 ml-1">
          <p className="text-[15px] font-bold tabular-nums text-[#DC2626] leading-none">
            {fmt(row.jumlah)}
          </p>
        </div>
      </div>

      {/* Badge + last payment row */}
      <div
        className="flex items-center px-4 pb-3"
        style={{ borderBottom: "1px solid #F0F7EE", gap: 8 }}
      >
        <StatusBadge status={row.badge as "Kritis" | "Waspada" | "Perhatian"} className="text-[11px] shrink-0" />
        <span className="text-[11px] text-[#9CA3A0]">
          Jatuh tempo {row.jatuhTempo}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 px-4 py-3">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition-colors hover:border-[#3E8A2F] hover:text-[#3E8A2F]"
          style={{
            height: 40,
            border: "1px solid #E2E8DE",
            color: "#374040",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <MessageCircle size={14} />
          Ingatkan
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold text-white transition-colors hover:bg-[#2E6B22]"
          style={{
            height: 40,
            background: "#3E8A2F",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <CreditCard size={14} />
          Catat Bayar
        </button>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MobileTunggakan() {
  const [activeTab,   setActiveTab]   = useState(0);
  const [search,      setSearch]      = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [filterOpen,  setFilterOpen]  = useState(false);

  const filterActive = kelasFilter !== "Semua Kelas";

  const filtered = rows.filter((r) => {
    const matchSearch =
      search === "" ||
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.nis.includes(search);
    const matchKelas =
      kelasFilter === "Semua Kelas" ||
      kelasFilter === `Kelas ${r.kelas.slice(0, 1)}${r.kelas.slice(1)}` ||
      `Kelas ${r.kelas}` === kelasFilter;
    const matchTab =
      activeTab === 0 ||
      (activeTab === 1 && r.badge === "Perhatian") ||
      (activeTab === 2 && r.badge === "Waspada") ||
      (activeTab === 3 && r.badge === "Kritis");
    return matchSearch && matchKelas && matchTab;
  });

  return (
    <>
      <div className="px-4 py-3 flex flex-col gap-3" style={{ paddingBottom: 24 }}>

        {/* ── 1 · Summary strip ── */}
        <div
          className="bg-white rounded-xl grid grid-cols-3"
          style={{ border: "1px solid #E2E8DE" }}
        >
          {/* Total tunggakan */}
          <div
            className="flex flex-col items-center justify-center py-4"
            style={{ borderRight: "1px solid #E2E8DE" }}
          >
            <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide mb-1">
              Total
            </p>
            <p className="text-[15px] font-bold tabular-nums text-[#DC2626] leading-none">
              Rp 45,2 jt
            </p>
          </div>

          {/* Siswa */}
          <div
            className="flex flex-col items-center justify-center py-4"
            style={{ borderRight: "1px solid #E2E8DE" }}
          >
            <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide mb-1">
              Siswa
            </p>
            <p className="text-[15px] font-bold tabular-nums text-[#1C2517] leading-none">
              68
            </p>
          </div>

          {/* Rata-rata */}
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide mb-1">
              Rata-rata
            </p>
            <p className="text-[15px] font-bold tabular-nums text-[#1C2517] leading-none">
              Rp 664 rb
            </p>
          </div>
        </div>

        {/* ── 2 · Aging tabs — shadcn anatomy, horizontal scroll ── */}
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div
            className="inline-flex rounded-lg p-1"
            style={{ background: "#EDF7EC", gap: 2, minWidth: "max-content" }}
          >
            {agingTabs.map((tab, i) => {
              const active = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="flex items-center gap-1.5 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{
                    height: 36,
                    background: active ? "#fff" : "transparent",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                    color: active ? "#1C2517" : "#6B7769",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                  <span
                    className="text-[10px] font-bold tabular-nums rounded-full px-1.5 py-px"
                    style={{
                      background: active ? "#EDF7EC" : "rgba(0,0,0,0.08)",
                      color: active ? "#3E8A2F" : "#6B7769",
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3 · Search + Filter + Pilih row ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className="flex-1 flex items-center gap-2.5 rounded-lg"
            style={{
              height: 44,
              background: "#fff",
              border: "1px solid #E2E8DE",
              padding: "0 14px",
            }}
          >
            <Search size={15} color="#9CA3A0" className="shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-[#1C2517]"
              style={{ fontFamily: "inherit" }}
            />
            {search.length > 0 && (
              <button onClick={() => setSearch("")} style={{ lineHeight: 0, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                <X size={13} color="#9CA3A0" />
              </button>
            )}
          </div>

          {/* Filter icon button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: 44,
              height: 44,
              background: filterActive ? "#EDF7EC" : "#fff",
              border: filterActive ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Filter kelas"
          >
            <SlidersHorizontal size={17} color={filterActive ? "#3E8A2F" : "#6B7769"} />
          </button>

          {/* Pilih ghost button */}
          <button
            className="text-sm font-medium text-[#6B7769] rounded-lg transition-colors hover:text-[#374040]"
            style={{
              height: 44,
              padding: "0 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            Pilih
          </button>
        </div>

        {/* Active filter chip */}
        {filterActive && (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#EDF7EC", color: "#3E8A2F" }}
            >
              {kelasFilter}
              <button
                onClick={() => setKelasFilter("Semua Kelas")}
                style={{ lineHeight: 0, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                aria-label="Hapus filter"
              >
                <X size={11} color="#3E8A2F" />
              </button>
            </span>
          </div>
        )}

        {/* ── 4 · Student list ── */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-[#9CA3A0]">Tidak ada data tunggakan ditemukan.</p>
            </div>
          ) : (
            filtered.map((row) => <StudentCard key={row.id} row={row} />)
          )}
        </div>

        {/* Count footer */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-[#9CA3A0]">
            Menampilkan {filtered.length} dari 68 siswa
          </p>
        )}
      </div>

      {/* ── Filter bottom sheet ── */}
      {filterOpen && (
        <ClassFilterSheet
          value={kelasFilter}
          onChange={setKelasFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </>
  );
}
