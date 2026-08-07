import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { CalendarDays, FileText, ChevronDown, Download, Check } from "lucide-react";
import { DataTable, Th } from "@/app/components/shared/DataTable";

import { absensiGuruList as guruList, absensiRekapData as rekapData, NV_HADIR, NV_IZIN, NV_ALPA } from "@/data/absensi";
import { bulanOptions, tahunOptions } from "@/data/constants";

// ─── helpers ──────────────────────────────────────────────────────────────────

function isTerlambat(jam: string | null): boolean {
  if (!jam) return false;
  const [h, m] = jam.split(".").map(Number);
  return h > 7 || (h === 7 && m > 0);
}

// ─── StatusControl ────────────────────────────────────────────────────────────

const STATUS_ACTIVE: Record<string, string> = {
  Hadir: "bg-[#3E8A2F] text-white",
  Izin:  "bg-[#F6B31E] text-white",
  Alpa:  "bg-[#DC2626] text-white",
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
      className="flex rounded-lg overflow-hidden"
      style={{ border: "1px solid #E2E8DE" }}
    >
      {(["Hadir", "Izin", "Alpa"] as const).map((s, i) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={[
            "px-3 py-1.5 text-xs font-semibold transition-colors",
            i > 0 ? "border-l border-[#E2E8DE]" : "",
            value === s ? STATUS_ACTIVE[s] : "text-[#6B7769] hover:bg-[#F5F9F4]",
          ].join(" ")}
        >
          {s}
        </button>
      ))}
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

  // Global chip counts (visible rows + fixed non-visible)
  const chips = useMemo(() => {
    const vis = Object.values(statuses);
    return {
      Hadir:       NV_HADIR + vis.filter((s) => s === "Hadir").length,
      Izin:        NV_IZIN  + vis.filter((s) => s === "Izin").length,
      Alpa:        NV_ALPA  + vis.filter((s) => s === "Alpa").length,
      "Belum Absen": vis.filter((s) => s === null).length,
    };
  }, [statuses]);

  const chipDefs = [
    { label: "Hadir",       value: chips.Hadir,          color: "#DCFCE7", text: "#166534" },
    { label: "Izin",        value: chips.Izin,           color: "#FEF3C7", text: "#92400E" },
    { label: "Alpa",        value: chips.Alpa,           color: "#FEE2E2", text: "#991B1B" },
    { label: "Belum Absen", value: chips["Belum Absen"], color: "#F3F4F6", text: "#374151" },
  ];

  const visibleWithStatus = Object.values(statuses).filter((s) => s !== null).length;
  const tercatat = visibleWithStatus + NV_HADIR + NV_IZIN + NV_ALPA;
  const totalGuru = 38;

  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div
      className="bg-white rounded-xl"
      style={{ border: "1px solid #E2E8DE" }}
    >
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8DE" }}>
        {/* Row 1: date + controls */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Date picker */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#F5F9F4] transition-colors"
            style={{ border: "1.5px solid #3E8A2F" }}
          >
            <CalendarDays size={15} className="text-[#3E8A2F] shrink-0" />
            <span className="text-sm font-semibold text-[#1C2517]">
              {todayStr}
            </span>
            <ChevronDown size={13} className="text-[#6B7769] ml-0.5" />
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7769]">
              Jam masuk standar:{" "}
              <span className="font-semibold text-[#1C2517]">07.00</span>
            </span>
            <button
              onClick={markAllHadir}
              className="px-4 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
            >
              Tandai Semua Hadir
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-3">
          {chipDefs.map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
              style={{ background: c.color }}
            >
              <span
                className="tabular-nums font-bold"
                style={{ fontSize: "1.25rem", color: c.text }}
              >
                {c.value}
              </span>
              <span
                className="text-[10px] font-medium mt-0.5"
                style={{ color: c.text }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table — full height, scrolls with the page */}
      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4 w-64">Guru</Th>
              <Th className="pr-6">Status</Th>
              <Th className="pr-6">Jam Absen</Th>
              <Th className="pr-6">Keterangan</Th>
            </tr>
          </thead>
          <tbody>
            {guruList.map((row, i) => {
              const status = statuses[row.id];
              const belum = status === null;
              const late = isTerlambat(row.jam);

              return (
                <tr
                  key={row.id}
                  className="transition-colors"
                  style={{
                    borderBottom: i < guruList.length - 1 ? "1px solid #F0F7EE" : "none",
                    background: belum ? "#FFFBEB" : undefined,
                  }}
                >
                  {/* Guru */}
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {row.inits}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2517] leading-none">
                          {row.nama}
                        </p>
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">
                          {row.nuptk}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status segmented control */}
                  <td className="py-3.5 pr-6">
                    <StatusControl value={status} onChange={(v) => setStatus(row.id, v)} />
                  </td>

                  {/* Jam Absen */}
                  <td className="py-3.5 pr-6">
                    {row.jam ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm tabular-nums font-medium"
                          style={{ color: late ? "#92400E" : "#6B7769" }}
                        >
                          {row.jam}
                        </span>
                        {late && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E]">
                            Terlambat
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </td>

                  {/* Keterangan */}
                  <td className="py-3.5 pr-6">
                    {row.keterangan ? (
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-[#3E8A2F] shrink-0" />
                        <span className="text-xs text-[#6B7769]">{row.keterangan}</span>
                      </div>
                    ) : (
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D1D5DB] hover:bg-[#F5F9F4] hover:text-[#9CA3A0] transition-colors">
                        <FileText size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>

      {/* Save bar — fixed to viewport bottom, always visible while scrolling */}
      <div
        className="bg-white px-6 py-4 flex items-center justify-between"
        style={{
          position: "fixed",
          bottom: 0,
          left: "var(--sidebar-w, 260px)",
          right: 0,
          borderTop: "1px solid #E2E8DE",
          zIndex: 20,
        }}
      >
        <div>
          <span className="text-sm font-semibold text-[#1C2517] tabular-nums">
            {tercatat} dari {totalGuru}
          </span>
          <span className="text-sm text-[#6B7769] ml-1">tercatat</span>
          {tercatat < totalGuru && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] tabular-nums">
              {totalGuru - tercatat} belum absen
            </span>
          )}
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
          Simpan Absensi
        </button>
      </div>
    </div>
  );
}

// ─── Rekapitulasi tab ─────────────────────────────────────────────────────────

function RekapitulasiTab() {
  const [bulan, setBulan] = useState("Juli");
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
      {/* Header: filters + export */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #E2E8DE" }}
      >
        <div className="flex items-center gap-3">
          {/* Month select */}
          <div className="relative">
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {bulanOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          {/* Year select */}
          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {tahunOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          <span className="text-xs text-[#6B7769]">
            <span className="font-semibold text-[#1C2517]">22</span> hari kerja efektif bulan ini
          </span>
        </div>

        <button
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors"
          style={{ border: "1px solid #E2E8DE" }}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Rekapitulasi table */}
      <div className="overflow-x-auto">
        <DataTable>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
              <Th className="pl-6 pr-4">Guru</Th>
              <Th align="center" className="pr-4">Hadir</Th>
              <Th align="center" className="pr-4">Terlambat</Th>
              <Th align="center" className="pr-4">Izin</Th>
              <Th align="center" className="pr-4">Alpa</Th>
              <Th className="pr-6">% Kehadiran</Th>
            </tr>
          </thead>
          <tbody>
            {rekapData.map((row, i) => {
              const barColor =
                row.pct >= 90 ? "#3E8A2F" : row.pct >= 80 ? "#F6B31E" : "#DC2626";
              const pctColor =
                row.pct >= 90
                  ? "text-[#166534]"
                  : row.pct >= 80
                  ? "text-[#92400E]"
                  : "text-[#991B1B]";

              return (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAFBF9] transition-colors"
                  style={{
                    borderBottom: i < rekapData.length - 1 ? "1px solid #F0F7EE" : "none",
                  }}
                >
                  {/* Guru */}
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {row.inits}
                      </div>
                      <span className="text-sm font-medium text-[#1C2517]">{row.nama}</span>
                    </div>
                  </td>

                  {/* Hadir */}
                  <td className="py-3.5 pr-4 text-center">
                    <span className="text-sm font-semibold tabular-nums text-[#1C2517]">
                      {row.hadir}
                    </span>
                  </td>

                  {/* Terlambat */}
                  <td className="py-3.5 pr-4 text-center">
                    <span className={`text-sm font-semibold tabular-nums ${row.terlambat > 0 ? "text-[#92400E]" : "text-[#9CA3A0]"}`}>
                      {row.terlambat}
                    </span>
                  </td>

                  {/* Izin */}
                  <td className="py-3.5 pr-4 text-center">
                    <span className={`text-sm font-semibold tabular-nums ${row.izin > 0 ? "text-[#6B7769]" : "text-[#9CA3A0]"}`}>
                      {row.izin}
                    </span>
                  </td>

                  {/* Alpa */}
                  <td className="py-3.5 pr-4 text-center">
                    <span className={`text-sm font-semibold tabular-nums ${row.alpa > 0 ? "text-[#DC2626]" : "text-[#9CA3A0]"}`}>
                      {row.alpa}
                    </span>
                  </td>

                  {/* % Kehadiran */}
                  <td className="py-3.5 pr-6">
                    <p className={`text-sm font-bold tabular-nums ${pctColor}`}>
                      {row.pct}%
                    </p>
                    <div className="h-1 rounded-full bg-[#E2E8DE] mt-1.5 w-28">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${row.pct}%`, background: barColor }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

type TabType = "hari-ini" | "rekapitulasi";

export function Absensi() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || "hari-ini";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5" style={{ paddingBottom: 72 }}>
      {/* Page title */}
      <div>
        <h2 className="text-[#1C2517]">Absensi Guru</h2>
        <p className="text-sm text-[#6B7769]">Rekam dan pantau kehadiran guru</p>
      </div>

      {/* Tab buttons — shadcn Tabs pattern */}
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {(["hari-ini", "rekapitulasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/akademik/absensi/${t}`)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
              activeTab === t
                ? "bg-white text-[#1C2517]"
                : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t === "hari-ini" ? "Hari Ini" : "Rekapitulasi"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "hari-ini" ? <HariIniTab /> : <RekapitulasiTab />}
    </div>
  );
}
