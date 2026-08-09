import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, Printer, MoreHorizontal, AlertTriangle, Info,
  ChevronLeft, ChevronRight, ChevronDown, Eye, Pencil, Trash2, X
} from "lucide-react";

import { ScheduleSegment, DAYS, getTimeRange, JadwalRow, WaktuJam } from "@/data/kelas";
import { useAppContext } from "@/context/AppContext";

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
  const pct  = Math.min((siswa / kap) * 100, 100);
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

function KelasRowMenu({ onViewSiswa, onEdit, onDelete }: { onViewSiswa: () => void; onEdit: () => void; onDelete: () => void }) {
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
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); onViewSiswa(); }}>
              <Eye size={13} className="text-[#6B7769]" /> Lihat Siswa
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}>
              <Pencil size={13} className="text-[#6B7769]" /> Edit Kelas
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors" onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}>
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ─── Kelas Editor Modal ───────────────────────────────────────────────────────

function KelasEditorModal({
  kelasData, onClose, onSave
}: {
  kelasData: any; onClose: () => void; onSave: (data: any) => void;
}) {
  const { guruList } = useAppContext();
  const [id, setId] = useState(kelasData?.id || "");
  const [tingkat, setTingkat] = useState(kelasData?.tingkat || "VII");
  const [waliId, setWaliId] = useState<number | "">(kelasData?.waliId || "");
  const [kapasitas, setKapasitas] = useState<number>(kelasData?.kapasitas || 32);

  const isNew = !kelasData;

  const handleSave = () => {
    if (!id.trim()) return;
    onSave({ id: id.trim(), tingkat, waliId: waliId === "" ? null : Number(waliId), kapasitas });
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#E2E8DE]">
          <div>
            <h3 className="text-lg font-bold text-[#1C2517]">{isNew ? "Tambah Kelas Baru" : "Edit Kelas"}</h3>
            <p className="text-xs text-[#6B7769] mt-0.5">{isNew ? "Buat kelas baru" : `Kelas ${kelasData.id}`}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-[#9CA3A0] hover:text-[#374040] hover:bg-[#F5F9F4] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Nama Kelas</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={!isNew}
              className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none disabled:opacity-50 disabled:bg-[#FAFBF9]"
              style={{ border: "1px solid #E2E8DE" }}
              placeholder="Contoh: 7A"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Tingkat</label>
            <select
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <option value="VII">Kelas VII (7)</option>
              <option value="VIII">Kelas VIII (8)</option>
              <option value="IX">Kelas IX (9)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Wali Kelas</label>
            <select
              value={waliId}
              onChange={(e) => setWaliId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <option value="">-- Tidak ada wali kelas --</option>
              {guruList.map(g => (
                <option key={g.id} value={g.id}>{g.nama}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Kapasitas Maksimal</label>
            <input
              type="number"
              value={kapasitas}
              onChange={(e) => setKapasitas(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
              min={1}
            />
          </div>
        </div>
        
        <div className="px-5 py-4 bg-[#FAFBF9] border-t border-[#E2E8DE] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] rounded-lg transition-colors border border-[#E2E8DE]">Batal</button>
          <button 
            onClick={handleSave} 
            disabled={!id.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8A2F] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E6B22] rounded-lg transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── timetable components ─────────────────────────────────────────────────────

function SlotCard({ seg, onClick }: { seg: ScheduleSegment & { type: "period" | "empty" }; onClick: () => void }) {
  if (seg.type === "empty") {
    return (
      <div
        onClick={onClick}
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
        <span className="text-sm text-[#D1D5DB] group-hover:text-[#3E8A2F] transition-colors select-none print:text-transparent">
          + Isi jam kosong
        </span>
      </div>
    );
  }

  const style  = SUBJECT_STYLE[seg.subject] ?? { bg:"#F9FAFB", accent:"#6B7280", text:"#374151" };
  const double = seg.jams.length > 1;

  return (
    <div
      onClick={onClick}
      className="flex-1 rounded-xl relative cursor-pointer hover:opacity-90 transition-opacity"
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

function SlotRow({ seg, onClickSlot }: { seg: ScheduleSegment & { type: "period" | "empty" }; onClickSlot: (jam: number) => void }) {
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
      <SlotCard seg={seg} onClick={() => onClickSlot(seg.jams[0])} />
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

function RingkasanPanel({ day, ringkasan }: { day: string; ringkasan: { nama: string; inits: string; jam: number; warning: boolean }[] }) {
  return (
    <div
      className="w-[300px] shrink-0 bg-white rounded-xl flex flex-col"
      style={{ border:"1px solid #E2E8DE" }}
    >
      {/* Header */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom:"1px solid #E2E8DE" }}>
        <p className="text-sm font-semibold text-[#1C2517]">Ringkasan Guru</p>
        <p className="text-xs text-[#6B7769] mt-0.5">{day}, Jadwal Aktif</p>
      </div>

      {/* Teacher list */}
      <div className="px-5 py-4 space-y-3.5 max-h-[500px] overflow-y-auto">
        {ringkasan.length === 0 ? (
           <p className="text-sm text-[#9CA3A0] italic">Belum ada jam mengajar</p>
        ) : ringkasan.map((t) => (
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

// ─── Slot Editor Modal ────────────────────────────────────────────────────────

function SlotEditorModal({ 
  kelas, hari, jam, onClose 
}: { 
  kelas: string; hari: string; jam: number; onClose: () => void 
}) {
  const { guruList, jadwalList, addJadwal, updateJadwal, deleteJadwal } = useAppContext();
  
  const currentJadwal = jadwalList.find(j => j.kelas === kelas && j.hari === hari && j.jam === jam);
  
  const [mapel, setMapel] = useState(currentJadwal?.mapel || "");
  const [guruId, setGuruId] = useState<number | "">(currentJadwal?.guruId || "");
  const [ruang, setRuang] = useState(currentJadwal?.ruang || `R. ${kelas}`);

  // Auto-recommend gurus based on mapel
  const recommendedGurus = useMemo(() => {
    if (!mapel) return guruList;
    return guruList.filter(g => g.mapel.includes(mapel));
  }, [guruList, mapel]);

  // Mapel options derived from Guru list
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    guruList.forEach(g => g.mapel.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [guruList]);

  const handleSave = () => {
    if (!mapel || guruId === "") return;
    
    if (currentJadwal) {
      updateJadwal(currentJadwal.id, { mapel, guruId: Number(guruId), ruang });
    } else {
      addJadwal({
        id: Date.now(),
        kelas,
        hari,
        jam,
        mapel,
        guruId: Number(guruId),
        ruang
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (currentJadwal) deleteJadwal(currentJadwal.id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" style={{ border: "1px solid #E2E8DE" }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-[#E2E8DE]">
            <div>
              <h3 className="text-lg font-bold text-[#1C2517]">Atur Jam ke-{jam}</h3>
              <p className="text-xs text-[#6B7769] mt-0.5">{hari}, Kelas {kelas}</p>
            </div>
            <button onClick={onClose} className="p-2 -mr-2 text-[#9CA3A0] hover:text-[#374040] hover:bg-[#F5F9F4] rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Mata Pelajaran</label>
              <select
                value={mapel}
                onChange={(e) => {
                  setMapel(e.target.value);
                  setGuruId(""); // Reset guru when mapel changes
                }}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
                style={{ border: "1px solid #E2E8DE" }}
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {mapelOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Guru Pengajar</label>
              <select
                value={guruId}
                onChange={(e) => setGuruId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
                style={{ border: "1px solid #E2E8DE" }}
                disabled={!mapel}
              >
                <option value="">-- Pilih Guru --</option>
                {recommendedGurus.map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
              {mapel && recommendedGurus.length === 0 && (
                <p className="text-xs text-[#DC2626] mt-1">Tidak ada guru yang mengajar {mapel}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Ruang Kelas</label>
              <input
                type="text"
                value={ruang}
                onChange={(e) => setRuang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none"
                style={{ border: "1px solid #E2E8DE" }}
                placeholder={`Contoh: R. ${kelas}`}
              />
            </div>
          </div>
          
          <div className="px-5 py-4 bg-[#FAFBF9] border-t border-[#E2E8DE] flex justify-between">
            {currentJadwal ? (
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
              >
                Kosongkan
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] rounded-lg transition-colors border border-[#E2E8DE]">Batal</button>
              <button 
                onClick={handleSave} 
                disabled={!mapel || guruId === ""}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8A2F] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E6B22] rounded-lg transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Jadwal Mengajar tab content ──────────────────────────────────────────────

function getCurrentDay() {
  const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, ...
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayName = dayNames[dayIndex];
  return DAYS.includes(todayName) ? todayName : DAYS[0];
}

function JadwalTab({ uniqueClasses, handlePrint }: { uniqueClasses: string[]; handlePrint: () => void }) {
  const [activeClass, setActiveClass] = useState(uniqueClasses[0] || "7A");
  const [activeDay,   setActiveDay]   = useState(getCurrentDay());
  const [editSlot, setEditSlot] = useState<{ jam: number } | null>(null);

  const { jadwalList, guruList, waktuJamList } = useAppContext();

  // Dynamically calculate segments for activeClass and activeDay
  const segments = useMemo(() => {
    const dailyJadwal = jadwalList.filter(j => j.kelas === activeClass && j.hari === activeDay);
    const segs: ScheduleSegment[] = [];
    let currentPeriod: any = null;

    waktuJamList.forEach((w) => {
      if (w.type === "break") {
        if (currentPeriod) { segs.push(currentPeriod); currentPeriod = null; }
        segs.push({ type: "break", label: w.label, time: w.range });
        return;
      }

      const jadwal = dailyJadwal.find(j => j.jam === w.jam);

      if (jadwal) {
        // Conflict detection: Does this teacher teach another class exactly right now?
        const conflictJadwal = jadwalList.find(j => j.guruId === jadwal.guruId && j.hari === activeDay && j.jam === w.jam && j.kelas !== activeClass);
        const conflict = !!conflictJadwal;
        const conflictNote = conflictJadwal ? `Mengajar juga di Kelas ${conflictJadwal.kelas}` : "";
        const guru = guruList.find(g => g.id === jadwal.guruId);

        if (currentPeriod && currentPeriod.subject === jadwal.mapel && currentPeriod.teacherId === jadwal.guruId) {
          // extend period
          currentPeriod.jams.push(w.jam);
          if (conflict) {
            currentPeriod.conflict = true;
            currentPeriod.conflictNote = conflictNote;
          }
        } else {
          if (currentPeriod) segs.push(currentPeriod);
          currentPeriod = {
            type: "period",
            jams: [w.jam],
            subject: jadwal.mapel,
            teacher: guru?.nama || "Unknown",
            teacherId: jadwal.guruId,
            room: jadwal.ruang || `R. ${activeClass}`,
            conflict,
            conflictNote
          };
        }
      } else {
        if (currentPeriod) { segs.push(currentPeriod); currentPeriod = null; }
        segs.push({ type: "empty", jams: [w.jam!], timeRange: w.range });
      }
    });

    if (currentPeriod) segs.push(currentPeriod);

    // Apply timeRange for periods
    segs.forEach(s => {
      if (s.type === "period") {
        s.timeRange = getTimeRange(s.jams, waktuJamList);
      }
    });

    return segs;
  }, [jadwalList, activeClass, activeDay, guruList]);

  // Dynamically calculate ringkasan guru
  const ringkasan = useMemo(() => {
    const counts: Record<number, number> = {};
    jadwalList.filter(j => j.hari === activeDay).forEach(j => {
      counts[j.guruId] = (counts[j.guruId] || 0) + 1;
    });
    return Object.entries(counts).map(([guruId, jam]) => {
      const guru = guruList.find(g => g.id === Number(guruId));
      const nama = guru?.nama || "Unknown Guru";
      // Basic initials
      const parts = nama.split(" ").filter(p => !p.includes("."));
      const inits = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();
      
      return {
        nama,
        inits,
        jam,
        warning: jam > 8
      };
    }).sort((a,b) => b.jam - a.jam);
  }, [jadwalList, activeDay, guruList]);

  return (
    <div className="space-y-4">
      {editSlot && (
        <SlotEditorModal 
          kelas={activeClass} 
          hari={activeDay} 
          jam={editSlot.jam} 
          onClose={() => setEditSlot(null)} 
        />
      )}
      
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        {/* Class picker dropdown */}
        <div className="relative">
          <select
            value={activeClass}
            onChange={(e) => setActiveClass(e.target.value)}
            className="appearance-none bg-white border border-[#E2E8DE] text-[#1C2517] text-sm font-semibold rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-[#3E8A2F] focus:ring-1 focus:ring-[#3E8A2F] cursor-pointer transition-colors"
          >
            {uniqueClasses.length === 0 && <option value="" disabled>Tidak ada data kelas</option>}
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>Kelas {c}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7769]">
            <ChevronDown size={14} />
          </div>
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border:"1px solid #E2E8DE" }}
          >
            <Printer size={13} />
            Cetak Jadwal
          </button>
        </div>
      </div>

      {/* Active state caption */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-[#6B7769] print:text-black print:text-lg">
          Jadwal <span className="font-semibold text-[#1C2517] print:text-black">Kelas {activeClass}</span> — <span className="font-semibold text-[#1C2517] print:text-black">{activeDay}</span>
        </span>
        <span className="text-xs text-[#9CA3A0] italic print:hidden">Klik pada jam kosong atau mata pelajaran untuk mengatur jadwal</span>
      </div>

      {/* Main area: timetable + summary panel */}
      <div className="flex gap-4 items-start">
        {/* Timetable */}
        <div
          className="flex-1 bg-white rounded-xl p-5 space-y-2.5 print:p-0 print:border-none"
          style={{ border:"1px solid #E2E8DE" }}
        >
          {segments.map((seg, i) =>
            seg.type === "break" ? (
              <BreakRow key={i} seg={seg as ScheduleSegment & { type:"break" }} />
            ) : (
              <SlotRow key={i} seg={seg as ScheduleSegment & { type:"period" | "empty" }} onClickSlot={(jam) => setEditSlot({ jam })} />
            )
          )}
        </div>

        {/* Summary panel */}
        <div className="print:hidden">
          <RingkasanPanel day={activeDay} ringkasan={ringkasan} />
        </div>
      </div>
    </div>
  );
}

// ─── Data Kelas tab content ───────────────────────────────────────────────────

function DataKelasTab({ kelasRows, onViewSiswa, onEdit, onDelete, onAdd }: { kelasRows: any[]; onViewSiswa: (kelas: string) => void; onEdit: (row: any) => void; onDelete: (kelas: string) => void; onAdd: () => void }) {
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
            Data kelas dihitung otomatis dari data <span className="font-semibold">Siswa</span> dan <span className="font-semibold">Guru Wali Kelas</span>
          </span>
        </div>
        
        <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0">
          <Plus size={13} /> Tambah Kelas
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
              {kelasRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-[#9CA3A0]">Belum ada data kelas (Tambahkan siswa atau atur wali kelas guru)</td>
                </tr>
              )}
              {kelasRows.map((row, i) => (
                <tr
                  key={row.kelas}
                  className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < kelasRows.length - 1 ? "1px solid #F0F7EE" : "none" }}
                >
                  <td className="px-6 py-3.5"><KelasChipBadge kelas={row.kelas} /></td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7769]">{row.tingkat}</td>
                  <td className="px-4 py-3.5 text-sm text-[#374040]">{row.wali}</td>
                  <td className="px-4 py-3.5"><SiswaProgress siswa={row.siswa} kap={row.kap} /></td>
                  <td className="py-3.5 pr-6"><KelasRowMenu onViewSiswa={() => onViewSiswa(row.kelas)} onEdit={() => onEdit(row.raw)} onDelete={() => onDelete(row.kelas)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Jadwal Harian / Override Tab ─────────────────────────────────────────────

function SlotOverrideModal({ 
  tanggal, kelas, hari, jam, onClose 
}: { 
  tanggal: string; kelas: string; hari: string; jam: number; onClose: () => void; 
}) {
  const { guruList, jadwalList, jadwalOverridesList, setJadwalOverride, clearJadwalOverride } = useAppContext();
  
  // Base schedule for this slot
  const baseSlot = jadwalList.find(j => j.kelas === kelas && j.hari === hari && j.jam === jam);
  const overrideSlot = jadwalOverridesList.find(o => o.tanggal === tanggal && o.kelas === kelas && o.jam === jam);
  
  const [mapel, setMapel] = useState(overrideSlot?.mapel !== undefined ? (overrideSlot.mapel || "") : (baseSlot?.mapel || ""));
  const [guruId, setGuruId] = useState<string | number>(overrideSlot?.guruId !== undefined ? (overrideSlot.guruId || "") : (baseSlot?.guruId || ""));
  const [ruang, setRuang] = useState(overrideSlot?.ruang !== undefined ? (overrideSlot.ruang || "") : (baseSlot?.ruang || `R. ${kelas}`));
  
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    guruList.forEach(g => g.mapel.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [guruList]);

  const handleSave = () => {
    setJadwalOverride({
      id: `${tanggal}_${kelas}_${jam}`,
      tanggal,
      kelas,
      jam,
      mapel: mapel || null,
      guruId: guruId ? Number(guruId) : null,
      ruang: ruang || null
    });
    onClose();
  };

  const handleClearOverride = () => {
    clearJadwalOverride(`${tanggal}_${kelas}_${jam}`);
    onClose();
  };

  const handleEmptySlot = () => {
    setJadwalOverride({
      id: `${tanggal}_${kelas}_${jam}`,
      tanggal, kelas, jam,
      mapel: null, guruId: null, ruang: null
    });
    onClose();
  };

  const isOverridden = !!overrideSlot;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#E2E8DE]">
          <div>
            <h3 className="text-lg font-bold text-[#1C2517]">Override Jam ke-{jam}</h3>
            <p className="text-xs text-[#6B7769] mt-0.5">{tanggal} • Kelas {kelas}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-[#9CA3A0] hover:text-[#374040] hover:bg-[#F5F9F4] rounded-full">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-lg flex gap-2">
            <Info size={16} className="text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E]">Perubahan ini hanya berlaku untuk tanggal <b>{tanggal}</b> dan tidak mengubah Master Jadwal.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Mata Pelajaran</label>
            <select value={mapel} onChange={(e) => { setMapel(e.target.value); setGuruId(""); }} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }}>
              <option value="">-- Kosong --</option>
              {mapelOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Guru Pengajar</label>
            <select value={guruId} onChange={(e) => setGuruId(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} disabled={!mapel}>
              <option value="">-- Pilih Guru --</option>
              {guruList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Ruang Kelas</label>
            <input type="text" value={ruang} onChange={(e) => setRuang(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} />
          </div>
        </div>
        
        <div className="px-5 py-4 bg-[#FAFBF9] border-t border-[#E2E8DE] flex justify-between">
          <div className="flex gap-2">
            {isOverridden && (
              <button onClick={handleClearOverride} className="px-3 py-2 text-xs font-semibold text-[#374040] hover:bg-white rounded-lg border border-[#E2E8DE] bg-[#F5F9F4]">Kembali Normal</button>
            )}
            <button onClick={handleEmptySlot} className="px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg">Kosongkan</button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] rounded-lg border border-[#E2E8DE]">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#2E6B22] rounded-lg">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JadwalHarianTab({ uniqueClasses, handlePrint }: { uniqueClasses: string[]; handlePrint: () => void }) {
  const [activeClass, setActiveClass] = useState(uniqueClasses[0] || "7A");
  const [activeDate, setActiveDate] = useState(() => {
    const d = new Date();
    // adjust for local timezone so it doesn't default to yesterday evening
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  });
  const [editSlot, setEditSlot] = useState<{ jam: number } | null>(null);

  const { jadwalList, jadwalOverridesList, guruList, waktuJamList } = useAppContext();

  const activeDayName = useMemo(() => {
    const d = new Date(activeDate);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return dayNames[d.getDay()];
  }, [activeDate]);

  const segments = useMemo(() => {
    const dailyMaster = jadwalList.filter(j => j.kelas === activeClass && j.hari === activeDayName);
    const dailyOverride = jadwalOverridesList.filter(o => o.tanggal === activeDate && o.kelas === activeClass);
    
    const segs: ScheduleSegment[] = [];
    let currentPeriod: any = null;

    waktuJamList.forEach((w) => {
      if (w.type === "break") {
        if (currentPeriod) { segs.push(currentPeriod); currentPeriod = null; }
        segs.push({ type: "break", label: w.label, time: w.range });
        return;
      }

      const override = dailyOverride.find(o => o.jam === w.jam);
      let finalSlot = null;
      let isOverridden = false;
      
      if (override) {
        isOverridden = true;
        if (override.mapel && override.guruId) {
          finalSlot = { mapel: override.mapel, guruId: override.guruId, ruang: override.ruang };
        }
      } else {
        const master = dailyMaster.find(j => j.jam === w.jam);
        if (master) finalSlot = master;
      }

      if (finalSlot) {
        const conflictJadwal = jadwalList.find(j => j.guruId === finalSlot.guruId && j.hari === activeDayName && j.jam === w.jam && j.kelas !== activeClass);
        const conflict = !!conflictJadwal && !isOverridden; 
        const conflictNote = conflictJadwal ? `Mengajar di ${conflictJadwal.kelas}` : "";
        const guru = guruList.find(g => g.id === finalSlot.guruId);

        if (currentPeriod && currentPeriod.subject === finalSlot.mapel && currentPeriod.teacherId === finalSlot.guruId && currentPeriod.isOverridden === isOverridden) {
          currentPeriod.jams.push(w.jam);
        } else {
          if (currentPeriod) segs.push(currentPeriod);
          currentPeriod = {
            type: "period",
            jams: [w.jam],
            subject: finalSlot.mapel,
            teacher: guru?.nama || "Unknown",
            teacherId: finalSlot.guruId,
            room: finalSlot.ruang || `R. ${activeClass}`,
            conflict, conflictNote,
            isOverridden
          };
        }
      } else {
        if (currentPeriod) { segs.push(currentPeriod); currentPeriod = null; }
        segs.push({ type: "empty", jams: [w.jam!], timeRange: w.range });
      }
    });

    if (currentPeriod) segs.push(currentPeriod);

    segs.forEach(s => {
      if (s.type === "period") s.timeRange = getTimeRange(s.jams, waktuJamList);
    });
    return segs;
  }, [jadwalList, jadwalOverridesList, activeClass, activeDate, activeDayName, guruList, waktuJamList]);

  return (
    <div className="space-y-4">
      {editSlot && (
        <SlotOverrideModal 
          tanggal={activeDate} kelas={activeClass} hari={activeDayName} jam={editSlot.jam} 
          onClose={() => setEditSlot(null)} 
        />
      )}
      
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <div className="relative">
          <select value={activeClass} onChange={(e) => setActiveClass(e.target.value)} className="appearance-none bg-white border border-[#E2E8DE] text-[#1C2517] text-sm font-semibold rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-[#3E8A2F] focus:ring-1 focus:ring-[#3E8A2F] cursor-pointer">
            {uniqueClasses.map((c) => <option key={c} value={c}>Kelas {c}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7769]"><ChevronDown size={14} /></div>
        </div>
        <div className="w-px h-5 bg-[#E2E8DE] mx-1" />
        <input 
          type="date" 
          value={activeDate} 
          onChange={e => setActiveDate(e.target.value)}
          className="border border-[#E2E8DE] text-sm font-semibold text-[#1C2517] rounded-lg px-3 py-2 outline-none focus:border-[#3E8A2F]"
        />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors border border-[#E2E8DE]">
            <Printer size={13} /> Cetak Jadwal
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-[#6B7769] print:text-black print:text-lg">
          Jadwal <span className="font-semibold text-[#1C2517] print:text-black">Kelas {activeClass}</span> — <span className="font-semibold text-[#1C2517] print:text-black">{activeDate} ({activeDayName})</span>
        </span>
        <span className="text-xs text-[#9CA3A0] italic print:hidden">Klik pada jam untuk mengatur override harian</span>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 bg-white rounded-xl p-5 space-y-2.5 print:p-0 print:border-none" style={{ border:"1px solid #E2E8DE" }}>
          {segments.map((seg, i) =>
            seg.type === "break" ? (
              <BreakRow key={i} seg={seg as any} />
            ) : (
              <div key={i} className="relative">
                {(seg as any).isOverridden && (
                  <div className="absolute -left-1 top-2 bottom-2 w-1 bg-[#3E8A2F] rounded-r-md print:hidden z-10" title="Override aktif" />
                )}
                <SlotRow seg={seg as any} onClickSlot={(jam) => setEditSlot({ jam })} />
              </div>
            )
          )}
        </div>
        <div className="w-72 bg-white rounded-xl overflow-hidden print:hidden shrink-0" style={{ border: "1px solid #E2E8DE" }}>
          <div className="px-5 py-4 border-b border-[#E2E8DE] bg-[#FFFBEB]">
            <h4 className="text-sm font-bold text-[#92400E]">Mode Jadwal Harian</h4>
            <p className="text-xs text-[#B45309] mt-1 leading-relaxed">Jadwal Harian digunakan untuk mengubah jadwal pada tanggal tertentu (misalnya ada guru Inval / Berhalangan) tanpa mengganggu Master Jadwal reguler.</p>
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
  
  const { siswaList, guruList, kelasList, addKelas, updateKelas, deleteKelas } = useAppContext();
  
  const [editingKelas, setEditingKelas] = useState<any | null>(null);
  const [isAddingKelas, setIsAddingKelas] = useState(false);

  // Use kelasList directly
  const uniqueClasses = useMemo(() => {
    return kelasList.map(k => k.id).sort();
  }, [kelasList]);

  // Compute kelas Rows for the table based on kelasList
  const kelasRows = useMemo(() => {
    return kelasList.map(kelas => {
      const siswaCount = siswaList.filter(s => s.kelas === kelas.id && s.status === "Aktif").length;
      const waliInfo = guruList.find(g => g.id === kelas.waliId);
      const waliName = waliInfo?.nama || "Belum ada wali kelas";
      
      return {
        kelas: kelas.id,
        tingkat: kelas.tingkat,
        wali: waliName,
        siswa: siswaCount,
        kap: kelas.kapasitas,
        raw: kelas // pass raw data for editing
      };
    });
  }, [kelasList, siswaList, guruList]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Editor Modal */}
      {(editingKelas || isAddingKelas) && (
        <KelasEditorModal
          kelasData={editingKelas}
          onClose={() => { setEditingKelas(null); setIsAddingKelas(false); }}
          onSave={(data) => {
            if (isAddingKelas) {
              addKelas(data);
            } else {
              updateKelas(data.id, data);
            }
            setEditingKelas(null);
            setIsAddingKelas(false);
          }}
        />
      )}
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Kelas &amp; Jadwal</h2>
        <p className="text-sm text-[#6B7769]">Manajemen data kelas, wali kelas, dan jadwal mengajar</p>
      </div>

      {/* Page-level shadcn tabs */}
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC] print:hidden">
        {[
          { id: "jadwal", label: "Jadwal Mengajar" },
          { id: "harian", label: "Jadwal Harian" },
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
      {currentTab === "jadwal" && <JadwalTab uniqueClasses={uniqueClasses} handlePrint={() => window.print()} />}
      {currentTab === "harian" && <JadwalHarianTab uniqueClasses={uniqueClasses} handlePrint={() => window.print()} />}
      {currentTab === "data"  && (
        <DataKelasTab 
          kelasRows={kelasRows} 
          onAdd={() => setIsAddingKelas(true)}
          onEdit={(row) => setEditingKelas(row)}
          onDelete={(id) => {
            if (window.confirm(`Yakin ingin menghapus kelas ${id}?`)) {
              deleteKelas(id);
            }
          }}
          onViewSiswa={(kelas) => navigate('/akademik/siswa', { state: { kelasFilter: `Kelas ${kelas}` } })}
        />
      )}
    </div>
  );
}
