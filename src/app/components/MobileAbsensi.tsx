import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { CalendarDays, ChevronDown, FileText } from "lucide-react";

import { absensiGuruList as guruList, absensiRekapData as rekapData, NV_HADIR, NV_IZIN, NV_ALPA } from "@/data/absensi";
import { bulanOptions, tahunOptions } from "@/data/constants";

const TOTAL_GURU = 38;

function isTerlambat(jam: string | null) {
  if (!jam) return false;
  const [h, m] = jam.split(".").map(Number);
  return h > 7 || (h === 7 && m > 0);
}

// ─── segmented status control ─────────────────────────────────────────────────

const STATUS_ACTIVE: Record<string, React.CSSProperties> = {
  Hadir: { background: "#3E8A2F", color: "#fff", border: "none" },
  Izin:  { background: "#F6B31E", color: "#fff", border: "none" },
  Alpa:  { background: "#DC2626", color: "#fff", border: "none" },
};

function StatusControl({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex overflow-hidden rounded-lg"
      style={{ border: "1px solid #E2E8DE" }}
    >
      {(["Hadir", "Izin", "Alpa"] as const).map((s, i) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="flex-1 flex items-center justify-center transition-colors"
          style={{
            height: 44,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            borderLeft: i > 0 ? "1px solid #E2E8DE" : "none",
            ...(value === s
              ? STATUS_ACTIVE[s]
              : { background: "transparent", color: "#6B7769", border: i > 0 ? "none" : undefined }),
            ...(i > 0 && value !== s ? { borderLeft: "1px solid #E2E8DE" } : {}),
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── teacher card ─────────────────────────────────────────────────────────────

function TeacherCard({
  guru,
  status,
  onStatusChange,
}: {
  guru: typeof guruList[0];
  status: string | null;
  onStatusChange: (id: number, v: string) => void;
}) {
  const belum = status === null;
  const late  = isTerlambat(guru.jam);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid #E2E8DE",
        background: belum ? "#FFFBEB" : "#fff",
      }}
    >
      {/* Top row: avatar + name + jam */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-white"
          style={{ background: belum ? "#D97706" : "#3E8A2F" }}
        >
          {guru.inits}
        </div>

        {/* Name */}
        <p className="flex-1 min-w-0 text-[13px] font-semibold text-[#1C2517] truncate leading-snug">
          {guru.nama}
        </p>

        {/* Jam / badge */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          {guru.jam ? (
            <>
              <span
                className="text-[12px] tabular-nums font-medium leading-none"
                style={{ color: late ? "#92400E" : "#6B7769" }}
              >
                {guru.jam}
              </span>
              {late && (
                <span
                  className="text-[10px] font-semibold rounded-full px-1.5 py-px"
                  style={{ background: "#FEF3C7", color: "#92400E" }}
                >
                  Terlambat
                </span>
              )}
            </>
          ) : guru.keterangan ? (
            <div className="flex items-center gap-1">
              <FileText size={11} color="#3E8A2F" />
              <span className="text-[11px] text-[#6B7769]">Ada ket.</span>
            </div>
          ) : belum ? (
            <span
              className="text-[10px] font-semibold rounded-full px-2 py-px"
              style={{ background: "#FEF3C7", color: "#92400E" }}
            >
              Belum
            </span>
          ) : (
            <span className="text-[12px] text-[#D1D5DB]">—</span>
          )}
        </div>
      </div>

      {/* Keterangan note */}
      {guru.keterangan && (
        <div
          className="px-4 pb-2.5 flex items-center gap-1.5"
        >
          <span className="text-[11px] italic text-[#6B7769]">{guru.keterangan}</span>
        </div>
      )}

      {/* Segmented control */}
      <div className="px-4 pb-4">
        <StatusControl value={status} onChange={(v) => onStatusChange(guru.id, v)} />
      </div>
    </div>
  );
}

// ─── Hari Ini tab ─────────────────────────────────────────────────────────────

function HariIniTab() {
  const [statuses, setStatuses] = useState<Record<number, string | null>>(
    () => Object.fromEntries(guruList.map((g) => [g.id, g.defaultStatus]))
  );

  const setStatus = (id: number, v: string) =>
    setStatuses((prev) => ({ ...prev, [id]: v }));

  const markAllHadir = () =>
    setStatuses(Object.fromEntries(guruList.map((g) => [g.id, "Hadir"])));

  const chips = useMemo(() => {
    const vis = Object.values(statuses);
    return {
      Hadir:  NV_HADIR + vis.filter((s) => s === "Hadir").length,
      Izin:   NV_IZIN  + vis.filter((s) => s === "Izin").length,
      Alpa:   NV_ALPA  + vis.filter((s) => s === "Alpa").length,
      Belum:  vis.filter((s) => s === null).length,
    };
  }, [statuses]);

  const tercatat = useMemo(() => {
    const visSet = Object.values(statuses).filter((s) => s !== null).length;
    return visSet + NV_HADIR + NV_IZIN + NV_ALPA;
  }, [statuses]);

  const chipDefs = [
    { label: "Hadir", value: chips.Hadir, bg: "#DCFCE7", fg: "#166534" },
    { label: "Izin",  value: chips.Izin,  bg: "#FEF3C7", fg: "#92400E" },
    { label: "Alpa",  value: chips.Alpa,  bg: "#FEE2E2", fg: "#991B1B" },
    { label: "Belum", value: chips.Belum, bg: "#F3F4F6", fg: "#374151" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Date row */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white transition-colors"
            style={{ border: "1.5px solid #3E8A2F", minHeight: 44 }}
          >
            <CalendarDays size={15} color="#3E8A2F" />
            <span className="text-sm font-semibold text-[#1C2517]">
              Senin, 13 Juli 2026
            </span>
            <ChevronDown size={13} color="#6B7769" />
          </button>
          <p className="text-xs text-[#9CA3A0]">
            Jam masuk:{" "}
            <span className="font-semibold text-[#6B7769]">07.00</span>
          </p>
        </div>

        {/* Stat chips 4-in-a-row */}
        <div className="grid grid-cols-4 gap-2">
          {chipDefs.map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center justify-center rounded-xl py-3"
              style={{ background: c.bg }}
            >
              <span
                className="tabular-nums font-bold leading-none"
                style={{ fontSize: "1.125rem", color: c.fg }}
              >
                {c.value}
              </span>
              <span
                className="text-[9px] font-semibold mt-1 leading-none"
                style={{ color: c.fg }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tandai Semua Hadir — ghost full-width */}
        <button
          onClick={markAllHadir}
          className="w-full flex items-center justify-center rounded-lg text-sm font-semibold text-[#3E8A2F] transition-colors hover:bg-[#EDF7EC]"
          style={{
            height: 44,
            background: "transparent",
            border: "1px solid #D4EDD0",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Tandai Semua Hadir
        </button>

        {/* Teacher cards */}
        {guruList.map((g) => (
          <TeacherCard
            key={g.id}
            guru={g}
            status={statuses[g.id]}
            onStatusChange={setStatus}
          />
        ))}
      </div>

      {/* Save bar — solid sibling, never overlaid */}
      <div
        style={{
          flexShrink: 0,
          background: "#fff",
          borderTop: "1px solid #E2E8DE",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span className="text-sm font-semibold text-[#1C2517] tabular-nums">
            {tercatat} dari {TOTAL_GURU}
          </span>
          <span className="text-sm text-[#6B7769]"> tercatat</span>
          {tercatat < TOTAL_GURU && (
            <span
              className="ml-2 text-[10px] font-semibold rounded-full px-2 py-px tabular-nums"
              style={{ background: "#FEF3C7", color: "#92400E" }}
            >
              {TOTAL_GURU - tercatat} belum
            </span>
          )}
        </div>
        <button
          style={{
            height: 40,
            padding: "0 20px",
            background: "#3E8A2F",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}

// ─── Rekapitulasi tab ─────────────────────────────────────────────────────────

function RekapitulasiTab() {
  const [bulan, setBulan] = useState("Juli");
  const [tahun, setTahun] = useState("2026");

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Filter row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
            style={{
              height: 44,
              border: "1px solid #E2E8DE",
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            {bulanOptions.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={13} color="#6B7769" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative" style={{ width: 86 }}>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
            style={{
              height: 44,
              border: "1px solid #E2E8DE",
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={13} color="#6B7769" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs text-[#9CA3A0] shrink-0">
          <span className="font-semibold text-[#6B7769]">22</span> hari kerja
        </span>
      </div>

      {/* Rekap cards */}
      {rekapData.map((row) => {
        const barColor = row.pct >= 90 ? "#3E8A2F" : row.pct >= 80 ? "#F6B31E" : "#DC2626";
        const pctColor = row.pct >= 90 ? "#166534" : row.pct >= 80 ? "#92400E" : "#991B1B";

        return (
          <div
            key={row.id}
            className="bg-white rounded-xl px-4 py-4"
            style={{ border: "1px solid #E2E8DE" }}
          >
            {/* Name row */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-white"
                style={{ background: "#3E8A2F" }}
              >
                {row.inits}
              </div>
              <p className="flex-1 min-w-0 text-[13px] font-semibold text-[#1C2517] truncate">
                {row.nama}
              </p>
              <span
                className="text-sm font-bold tabular-nums shrink-0"
                style={{ color: pctColor }}
              >
                {row.pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full mb-3"
              style={{ background: "#E2E8DE" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${row.pct}%`, background: barColor }}
              />
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Hadir",     value: row.hadir,     color: "#166534" },
                { label: "Terlambat", value: row.terlambat, color: row.terlambat > 0 ? "#92400E" : "#9CA3A0" },
                { label: "Izin",      value: row.izin,      color: row.izin > 0 ? "#6B7769" : "#9CA3A0" },
                { label: "Alpa",      value: row.alpa,      color: row.alpa > 0 ? "#991B1B" : "#9CA3A0" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="text-[15px] font-bold tabular-nums leading-none"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[9px] font-medium text-[#9CA3A0] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

type Tab = "hari-ini" | "rekapitulasi";

export function MobileAbsensi() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "hari-ini";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ── Shadcn tabs — shrink-0, never scrolls away ── */}
      <div style={{ flexShrink: 0, padding: "12px 16px 0" }}>
        <div className="inline-flex rounded-lg p-1" style={{ background: "#EDF7EC" }}>
          {(["hari-ini", "rekapitulasi"] as const).map((t) => {
            const active = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => navigate(`/akademik/absensi/${t}`)}
                className="px-4 rounded-md text-sm font-semibold transition-all"
                style={{
                  height: 36,
                  background: active ? "#fff" : "transparent",
                  color: active ? "#1C2517" : "#6B7769",
                  boxShadow: active
                    ? "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                {t === "hari-ini" ? "Hari Ini" : "Rekapitulasi"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content — fills remaining height ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {activeTab === "hari-ini"      && <HariIniTab />}
        {activeTab === "rekapitulasi"  && <RekapitulasiTab />}
      </div>
    </div>
  );
}
