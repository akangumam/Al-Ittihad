import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Printer, MoreHorizontal, AlertTriangle, Info,
  ChevronLeft, ChevronRight, Eye, Pencil, Trash2,
} from "lucide-react";

import { ScheduleSegment, CLASSES, DAYS, SCHEDULE, RINGKASAN, KELAS_ROWS } from "@/data/kelas";

// ─── subject color palette ────────────────────────────────────────────────────

const SUBJECT_STYLE: Record<string, { bg: string; accent: string; text: string }> = {
  "Matematika":       { bg:"#F0FDF4", accent:"#3E8A2F", text:"#166534" },
  "Bahasa Indonesia": { bg:"#EFF6FF", accent:"#2563EB", text:"#1D4ED8" },
  "IPA":              { bg:"#ECFEFF", accent:"#0891B2", text:"#0E7490" },
  "Tahfidz":          { bg:"#F5F3FF", accent:"#7C3AED", text:"#6D28D9" },
  "PKn":              { bg:"#FFFBEB", accent:"#D97706", text:"#92400E" },
  "Penjaskes":        { bg:"#FFF7ED", accent:"#EA580C", text:"#9A3412" },
  "Bahasa Arab":      { bg:"#FDF4FF", accent:"#9333EA", text:"#7E22CE" },
  "Fiqih":            { bg:"#FFF1F2", accent:"#E11D48", text:"#9F1239" },
  "IPS":              { bg:"#F0F9FF", accent:"#0369A1", text:"#075985" },
  "PAI":              { bg:"#FEF3C7", accent:"#D97706", text:"#92400E" },
};

const KELAS_BADGE: Record<string, string> = {
  "7":"bg-[#DBEAFE] text-[#1E40AF]",
  "8":"bg-[#EDE9FE] text-[#5B21B6]",
  "9":"bg-[#DCFCE7] text-[#166534]",
};

// ─── small helpers ────────────────────────────────────────────────────────────

function KelasChipBadge({ kelas }: { kelas: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${KELAS_BADGE[kelas[0]] ?? "bg-[#F3F4F6] text-[#374040]"}`}>
      {kelas}
    </span>
  );
}

function SiswaProgress({ siswa, kap }: { siswa: number; kap: number }) {
  const pct  = (siswa / kap) * 100;
  const full  = siswa >= kap;
  const color = full ? "#DC2626" : "#3E8A2F";
  const bg    = full ? "#FEE2E2" : "#E2E8DE";
  return (
    <div className="w-32 space-y-1.5">
      <span className={`text-sm font-semibold tabular-nums`} style={{ color }}>
        {siswa}/{kap}
      </span>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full" style={{ width:`${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function KelasRowMenu() {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  return (
    <>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          const rect = e.currentTarget.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const menuHeight = 120; // 3 item menu
          
          setCoords({
            left: rect.right - 176,
            top: spaceBelow < menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8
          });
          setOpen((o) => !o); 
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors relative"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="fixed z-50 w-44 bg-white rounded-xl py-1"
            style={{ 
              top: coords.top, 
              left: coords.left,
              border:"1px solid #E2E8DE", 
              boxShadow:"0 4px 16px rgba(0,0,0,0.08)" 
            }}
          >
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
              <Eye size={13} className="text-[#6B7769]" /> Lihat Siswa
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
              <Pencil size={13} className="text-[#6B7769]" /> Edit Kelas
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ─── timetable components ─────────────────────────────────────────────────────

function SlotCard({ seg }: { seg: ScheduleSegment & { type: "period" | "empty" } }) {
  if (seg.type === "empty") {
    return (
      <div
        className="flex-1 rounded-xl flex items-center justify-center group cursor-pointer transition-colors"
        style={{
          border: "2px dashed #D1D5DB",
          padding: "18px 16px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3E8A2F";
          (e.currentTarget as HTMLDivElement).style.background  = "#F5FBF4";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#D1D5DB";
          (e.currentTarget as HTMLDivElement).style.background  = "transparent";
        }}
      >
        <span className="text-sm text-[#D1D5DB] group-hover:text-[#3E8A2F] transition-colors select-none">
          + Isi jam kosong
        </span>
      </div>
    );
  }

  const style  = SUBJECT_STYLE[seg.subject] ?? { bg:"#F9FAFB", accent:"#6B7280", text:"#374151" };
  const double = seg.jams.length > 1;

  return (
    <div
      className="flex-1 rounded-xl relative"
      style={{
        background: style.bg,
        borderLeft: `3px solid ${style.accent}`,
        padding: double ? "18px 16px" : "12px 16px",
      }}
    >
      {/* Conflict badge */}
      {seg.conflict && (
        <div
          className="absolute top-2.5 right-3 inline-flex items-center px-2 py-0.5 rounded-full"
          style={{ background:"#FEE2E2" }}
        >
          <span className="text-[10px] font-bold text-[#DC2626]">Bentrok</span>
        </div>
      )}

      <p className="text-sm font-bold leading-none" style={{ color: style.text }}>{seg.subject}</p>
      <p className="text-xs text-[#6B7769] mt-1">{seg.teacher}</p>
      <p className="text-[11px] text-[#9CA3A0] mt-0.5">{seg.room}</p>

      {seg.conflict && seg.conflictNote && (
        <p className="text-[11px] text-[#DC2626] mt-2 leading-tight">{seg.conflictNote}</p>
      )}
    </div>
  );
}

function SlotRow({ seg }: { seg: ScheduleSegment & { type: "period" | "empty" } }) {
  const jamLabel =
    seg.jams.length > 1
      ? `Jam ke-${seg.jams[0]}–${seg.jams[seg.jams.length - 1]}`
      : `Jam ke-${seg.jams[0]}`;

  return (
    <div className="flex gap-3 items-stretch">
      <div className="w-[112px] shrink-0 flex flex-col justify-center py-0.5">
        <p className="text-xs font-semibold text-[#374040]">{jamLabel}</p>
        <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">{seg.timeRange}</p>
      </div>
      <SlotCard seg={seg} />
    </div>
  );
}

function BreakRow({ seg }: { seg: ScheduleSegment & { type: "break" } }) {
  return (
    <div className="flex gap-3 items-center py-1">
      <div className="w-[112px] shrink-0">
        <p className="text-[11px] text-[#9CA3A0] tabular-nums">{seg.time}</p>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background:"#E2E8DE" }} />
        <span className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest px-2">{seg.label}</span>
        <div className="flex-1 h-px" style={{ background:"#E2E8DE" }} />
      </div>
    </div>
  );
}

// ─── right summary panel ──────────────────────────────────────────────────────

function RingkasanPanel({ day }: { day: string }) {
  return (
    <div
      className="w-[300px] shrink-0 bg-white rounded-xl flex flex-col"
      style={{ border:"1px solid #E2E8DE" }}
    >
      {/* Header */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom:"1px solid #E2E8DE" }}>
        <p className="text-sm font-semibold text-[#1C2517]">Ringkasan Guru</p>
        <p className="text-xs text-[#6B7769] mt-0.5">{day}, 13 Juli 2026</p>
      </div>

      {/* Teacher list */}
      <div className="px-5 py-4 space-y-3.5">
        {RINGKASAN.map((t) => (
          <div key={t.nama} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background:"#3E8A2F" }}
            >
              {t.inits}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1C2517] leading-none truncate">{t.nama}</p>
              <p className="text-[11px] text-[#6B7769] mt-0.5">{t.jam} jam mengajar</p>
            </div>
            {t.warning && (
              <div title="Melebihi 8 jam mengajar sehari" className="shrink-0">
                <AlertTriangle size={14} className="text-[#D97706]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-auto px-5 py-4 shrink-0" style={{ borderTop:"1px solid #E2E8DE" }}>
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background:"#FFFBEB" }}>
          <AlertTriangle size={12} className="text-[#D97706] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#92400E] leading-relaxed">
            Guru dengan jam mengajar melebihi <span className="font-semibold">8 jam/hari</span> memerlukan perhatian.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Jadwal Mengajar tab content ──────────────────────────────────────────────

function JadwalTab() {
  const [activeClass, setActiveClass] = useState("7A");
  const [activeDay,   setActiveDay]   = useState("Senin");

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Class picker chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveClass(c)}
              className="px-2.5 py-1 rounded-full text-xs font-bold transition-colors"
              style={
                activeClass === c
                  ? { background:"#3E8A2F", color:"#FFFFFF" }
                  : { background:"#FFFFFF", color:"#374040", border:"1px solid #E2E8DE" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#E2E8DE] mx-1 shrink-0" />

        {/* Day tabs (shadcn muted container) */}
        <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={[
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap",
                activeDay === d ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
              ].join(" ")}
              style={activeDay === d ? { boxShadow:"0 1px 2px rgba(0,0,0,0.08)" } : undefined}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Right buttons */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border:"1px solid #E2E8DE" }}
          >
            <Printer size={13} />
            Cetak Jadwal
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            <Plus size={13} />
            Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Active state caption */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B7769]">
          Jadwal <span className="font-semibold text-[#1C2517]">Kelas {activeClass}</span> — <span className="font-semibold text-[#1C2517]">{activeDay}</span>
        </span>
        {activeDay !== "Senin" || activeClass !== "7A" ? (
          <span className="text-xs text-[#9CA3A0] italic">(contoh data: 7A / Senin)</span>
        ) : null}
      </div>

      {/* Main area: timetable + summary panel */}
      <div className="flex gap-4 items-start">
        {/* Timetable */}
        <div
          className="flex-1 bg-white rounded-xl p-5 space-y-2.5"
          style={{ border:"1px solid #E2E8DE" }}
        >
          {SCHEDULE.map((seg, i) =>
            seg.type === "break" ? (
              <BreakRow key={i} seg={seg as ScheduleSegment & { type:"break" }} />
            ) : (
              <SlotRow key={i} seg={seg as ScheduleSegment & { type:"period" | "empty" }} />
            )
          )}
        </div>

        {/* Summary panel */}
        <RingkasanPanel day={activeDay} />
      </div>
    </div>
  );
}

// ─── Data Kelas tab content ───────────────────────────────────────────────────

function DataKelasTab() {
  return (
    <div className="space-y-4">
      {/* Caption + button row */}
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background:"#FFFBEB", border:"1px solid #FDE68A" }}
        >
          <Info size={13} className="text-[#D97706] shrink-0" />
          <span className="text-[#92400E]">
            Kapasitas maksimal <span className="font-semibold">32 siswa</span> per kelas — dapat diubah di{" "}
            <span className="font-semibold underline cursor-pointer">Pengaturan</span>
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0">
          <Plus size={13} />
          Tambah Kelas
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl" style={{ border:"1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid #E2E8DE" }}>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-6 py-3 w-24">Kelas</th>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3 w-24">Tingkat</th>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Wali Kelas</th>
                <th className="text-left text-xs font-medium text-[#9CA3A0] uppercase tracking-wide px-4 py-3">Jumlah Siswa</th>
                <th className="py-3 pr-6 w-10" />
              </tr>
            </thead>
            <tbody>
              {KELAS_ROWS.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < KELAS_ROWS.length - 1 ? "1px solid #F0F7EE" : "none" }}
                >
                  {/* Kelas */}
                  <td className="px-6 py-3.5">
                    <KelasChipBadge kelas={row.kelas} />
                  </td>

                  {/* Tingkat */}
                  <td className="px-4 py-3.5 text-sm text-[#6B7769]">{row.tingkat}</td>

                  {/* Wali Kelas */}
                  <td className="px-4 py-3.5 text-sm text-[#374040]">{row.wali}</td>

                  {/* Jumlah Siswa */}
                  <td className="px-4 py-3.5">
                    <SiswaProgress siswa={row.siswa} kap={row.kap} />
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 pr-6">
                    <KelasRowMenu />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{ borderTop:"1px solid #E2E8DE" }}
        >
          <span className="text-xs text-[#6B7769]">
            1–6 dari <span className="font-semibold text-[#1C2517]">12</span> kelas
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D1D5DB] cursor-not-allowed" style={{ border:"1px solid #E2E8DE" }}>
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3E8A2F] text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] hover:bg-[#EDF7EC] transition-colors" style={{ border:"1px solid #E2E8DE" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function KelasJadwal() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const currentTab = tab || "data";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Kelas &amp; Jadwal</h2>
        <p className="text-sm text-[#6B7769]">Manajemen data kelas, wali kelas, dan jadwal mengajar</p>
      </div>

      {/* Page-level shadcn tabs */}
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {[
          { id: "jadwal", label: "Jadwal Mengajar" },
          { id: "data", label: "Data Kelas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/akademik/kelas-jadwal/${t.id}`)}
            className={[
              "px-5 py-2 rounded-md text-sm font-semibold transition-all",
              currentTab === t.id ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={currentTab === t.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTab === "jadwal" && <JadwalTab />}
      {currentTab === "data"  && <DataKelasTab />}
    </div>
  );
}
