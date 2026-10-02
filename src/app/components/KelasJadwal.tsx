import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Plus, Printer, MoreHorizontal, AlertTriangle, Info,
  ChevronLeft, ChevronRight, ChevronDown, Eye, Pencil, Trash2, X
} from "lucide-react";

import { KelasRow, JadwalRow, JadwalOverride, DAYS } from "@/data/kelas";
import { useAppContext } from "@/context/AppContext";
import { PrintJadwalKelas, PrintMasterJadwal } from "./PrintJadwal";

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

function SlotRow({ seg, onClickSlot }: { seg: any; onClickSlot: () => void }) {
  const isBreak = seg.subject === "Jam Kosong / Istirahat" || seg.subject === "Istirahat";
  
  if (isBreak) {
    return (
      <div className="flex gap-3 items-center py-1 group cursor-pointer" onClick={onClickSlot}>
        <div className="w-[112px] shrink-0">
          <p className="text-[11px] text-[#9CA3A0] tabular-nums group-hover:text-[#3E8A2F] transition-colors">{seg.timeRange}</p>
        </div>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background:"#E2E8DE" }} />
          <p className="text-xs font-semibold text-[#D97706] bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FDE68A] group-hover:border-[#D97706] transition-colors">{seg.subject}</p>
          <div className="flex-1 h-px" style={{ background:"#E2E8DE" }} />
        </div>
      </div>
    );
  }

  const style  = SUBJECT_STYLE[seg.subject] ?? { bg:"#F9FAFB", accent:"#6B7280", text:"#374151" };

  return (
    <div className="flex gap-3 items-stretch">
      <div className="w-[112px] shrink-0 flex flex-col justify-center py-0.5">
        <p className="text-[11px] text-[#9CA3A0] tabular-nums">{seg.timeRange}</p>
      </div>
      <div
        onClick={onClickSlot}
        className="flex-1 rounded-xl relative cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          background: style.bg,
          borderLeft: `3px solid ${style.accent}`,
          padding: "12px 16px",
        }}
      >
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
    </div>
  );
}

// ─── right summary panel ──────────────────────────────────────────────────────

function RingkasanPanel({ day, ringkasan }: { day: string; ringkasan: { nama: string; inits: string; jam: number; overloaded: boolean }[] }) {
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
            {t.overloaded && <span className="w-2 h-2 rounded-full bg-[#DC2626]" title="Lebih dari 8 jam/hari" />}
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
            {t.overloaded && (
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

function JadwalEditorModal({ 
  kelas, hari, editJadwal, onClose 
}: { 
  kelas: string; hari: string; editJadwal?: any; onClose: () => void 
}) {
  const { guruList, jadwalList, addJadwal, updateJadwal, deleteJadwal } = useAppContext();
  
  const currentJadwal = editJadwal;
  
  const [waktuMulai, setWaktuMulai] = useState(currentJadwal?.waktuMulai || "07:00");
  const [waktuSelesai, setWaktuSelesai] = useState(currentJadwal?.waktuSelesai || "08:00");
  const [mapel, setMapel] = useState(currentJadwal?.mapel || "");
  const [guruId, setGuruId] = useState<number | "">(currentJadwal?.guruId || "");
  const [ruang, setRuang] = useState(currentJadwal?.ruang || `R. ${kelas}`);
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    if (!mapel || !waktuMulai || !waktuSelesai) return;
    if (mapel !== "Istirahat" && guruId === "") return;
    
    // Overlap validation
    const isOverlap = jadwalList.some(j => {
      if (j.kelas !== kelas || j.hari !== hari) return false;
      if (currentJadwal && j.id === currentJadwal.id) return false;
      return (waktuMulai < (j as any).waktuSelesai) && (waktuSelesai > (j as any).waktuMulai);
    });

    if (isOverlap) {
      setErrorMsg("Gagal menyimpan: Jadwal bentrok dengan jam lain di kelas ini!");
      return;
    }

    const data = {
      waktuMulai,
      waktuSelesai,
      mapel,
      guruId: mapel === "Istirahat" ? null : Number(guruId),
      ruang
    };

    if (currentJadwal) {
      updateJadwal(currentJadwal.id, data);
    } else {
      addJadwal({
        id: Date.now(),
        kelas,
        hari,
        jam: 0, // legacy: slot number unknown, stored via waktuMulai/waktuSelesai
        ...data
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
              <h3 className="text-lg font-bold text-[#1C2517]">{currentJadwal ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
              <p className="text-xs text-[#6B7769] mt-0.5">{hari}, Kelas {kelas}</p>
            </div>
            <button onClick={onClose} className="p-2 -mr-2 text-[#9CA3A0] hover:text-[#374040] hover:bg-[#F5F9F4] rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg flex gap-2 items-start">
                <AlertTriangle size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#B91C1C] leading-relaxed">{errorMsg}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Waktu Mulai</label>
                <input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Waktu Selesai</label>
                <input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} />
              </div>
            </div>
            
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
                <option value="Istirahat">Istirahat</option>
                {mapelOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Guru Pengajar</label>
              <select
                value={guruId}
                onChange={(e) => setGuruId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none disabled:opacity-50 disabled:bg-[#FAFBF9]"
                style={{ border: "1px solid #E2E8DE" }}
                disabled={!mapel || mapel === "Istirahat"}
              >
                <option value="">-- Pilih Guru --</option>
                {recommendedGurus.map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
              {mapel && mapel !== "Istirahat" && recommendedGurus.length === 0 && (
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
                disabled={!mapel || (mapel !== "Istirahat" && guruId === "") || !waktuMulai || !waktuSelesai}
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

function JadwalTab({ uniqueClasses }: { uniqueClasses: string[] }) {
  const [activeClass, setActiveClass] = useState(uniqueClasses[0] || "7A");
  const [activeDay,   setActiveDay]   = useState(getCurrentDay());
  const [editJadwal, setEditJadwal] = useState<any>(null);
  const [printMode, setPrintMode] = useState<"kelas" | "master" | null>(null);

  const { jadwalList, guruList } = useAppContext();

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handleCetak = (mode: "kelas" | "master") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const segments = useMemo(() => {
    const dailyJadwal = jadwalList.filter(j => j.kelas === activeClass && j.hari === activeDay);
    dailyJadwal.sort((a, b) => ((a as any).waktuMulai ?? "").localeCompare((b as any).waktuMulai ?? ""));

    const segs: any[] = dailyJadwal.map(j => {
      const conflictJadwal = j.guruId ? jadwalList.find(c => c.guruId === j.guruId && c.hari === activeDay && (c as any).waktuMulai < (j as any).waktuSelesai && (c as any).waktuSelesai > (j as any).waktuMulai && c.kelas !== activeClass) : undefined;
      const conflict = !!conflictJadwal;
      const conflictNote = conflictJadwal ? `Mengajar juga di Kelas ${conflictJadwal.kelas}` : "";
      const guru = j.guruId ? guruList.find(g => g.id === j.guruId) : undefined;

      return {
        id: j.id,
        type: "period",
        timeRange: `${j.waktuMulai} - ${j.waktuSelesai}`,
        subject: j.mapel,
        teacher: guru?.nama || (j.mapel === "Istirahat" ? "" : "Unknown"),
        teacherId: j.guruId,
        room: j.ruang || `R. ${activeClass}`,
        conflict,
        conflictNote
      };
    });

    return segs;
  }, [jadwalList, activeClass, activeDay, guruList]);

  const ringkasan = useMemo(() => {
    const counts: Record<number, number> = {};
    jadwalList.filter(j => j.hari === activeDay && j.guruId !== null).forEach(j => {
      counts[j.guruId as number] = (counts[j.guruId as number] || 0) + 1;
    });
    return Object.entries(counts).map(([guruId, count]) => {
      const guru = guruList.find(g => g.id === Number(guruId));
      const nama = guru?.nama || "Unknown Guru";
      const parts = nama.split(" ").filter(p => !p.includes("."));
      const inits = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();
      
      return { nama, inits, jam: count, overloaded: count >= 8 };
    }).sort((a,b) => b.jam - a.jam);
  }, [jadwalList, activeDay, guruList]);

  return (
    <>
      <div className="space-y-4 print:hidden">
        {editJadwal !== null && (
          <JadwalEditorModal 
            kelas={activeClass} hari={activeDay} editJadwal={editJadwal === "new" ? undefined : editJadwal} 
            onClose={() => setEditJadwal(null)} 
          />
        )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={activeClass} onChange={(e) => setActiveClass(e.target.value)} className="px-3 py-2 rounded-lg text-sm font-semibold bg-white text-[#1C2517] outline-none shadow-sm" style={{ border: "1px solid #E2E8DE" }}>
            {uniqueClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
          </select>
          <div className="flex bg-[#F5F9F4] rounded-lg p-1 overflow-x-auto border border-[#E2E8DE]">
            {DAYS.map(d => (
              <button key={d} onClick={() => setActiveDay(d)} className={`px-4 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${activeDay === d ? "bg-white text-[#3E8A2F] shadow-sm" : "text-[#6B7769] hover:text-[#1C2517]"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setEditJadwal("new")} className="flex items-center gap-1.5 px-3 py-2 bg-[#3E8A2F] hover:bg-[#2E6B22] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} /> Tambah Jadwal
          </button>
          <button onClick={() => handleCetak("kelas")} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-[#374040] rounded-lg text-sm font-semibold transition-colors shadow-sm border border-[#E2E8DE]">
            <Printer size={16} /> Cetak Kelas
          </button>
          <button onClick={() => handleCetak("master")} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-[#374040] rounded-lg text-sm font-semibold transition-colors shadow-sm border border-[#E2E8DE]">
            <Printer size={16} /> Cetak Master
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-[#E2E8DE] p-4">
          <h2 className="text-sm font-bold text-[#1C2517] mb-4">Jadwal Pelajaran • Kelas {activeClass}</h2>
          <div className="space-y-3">
            {segments.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-[#9CA3A0]">Tidak ada jadwal untuk hari ini.</p>
                <button onClick={() => setEditJadwal("new")} className="mt-3 text-sm text-[#3E8A2F] hover:underline">Tambah Jadwal Pertama</button>
              </div>
            )}
            {segments.map((seg, i) => (
              <SlotRow key={i} seg={seg as any} onClickSlot={() => setEditJadwal(jadwalList.find(j => j.id === seg.id))} />
            ))}
          </div>
        </div>
        
          <div className="w-full lg:w-72 shrink-0">
            <RingkasanPanel day={activeDay} ringkasan={ringkasan} />
          </div>
        </div>
      </div>

      {printMode && (
        <div className="hidden print:block">
          {printMode === "kelas" ? (
            <PrintJadwalKelas kelas={activeClass} jadwalList={jadwalList} guruList={guruList} />
          ) : (
            <PrintMasterJadwal uniqueClasses={uniqueClasses} jadwalList={jadwalList} guruList={guruList} />
          )}
        </div>
      )}
    </>
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
  tanggal, kelas, hari, editOverride, onClose 
}: { 
  tanggal: string; kelas: string; hari: string; editOverride?: any; onClose: () => void; 
}) {
  const { guruList, jadwalOverridesList, setJadwalOverride, clearJadwalOverride } = useAppContext();
  
  const overrideSlot = editOverride;
  
  const [waktuMulai, setWaktuMulai] = useState(overrideSlot?.waktuMulai || "07:00");
  const [waktuSelesai, setWaktuSelesai] = useState(overrideSlot?.waktuSelesai || "08:00");
  const [mapel, setMapel] = useState(overrideSlot?.mapel || "");
  const [guruId, setGuruId] = useState<string | number>(overrideSlot?.guruId || "");
  const [ruang, setRuang] = useState(overrideSlot?.ruang || `R. ${kelas}`);
  
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    guruList.forEach(g => g.mapel.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [guruList]);

  const handleSave = () => {
    setJadwalOverride({
      id: overrideSlot?.id || `${tanggal}_${kelas}_${Date.now()}`,
      tanggal,
      kelas,
      jam: 0, // legacy override: slot unknown; stored by time
      mapel: mapel || null,
      guruId: guruId ? Number(guruId) : null,
      ruang: ruang || null
    } as any);
    onClose();
  };

  const handleClearOverride = () => {
    if (overrideSlot) clearJadwalOverride(overrideSlot.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#E2E8DE]">
          <div>
            <h3 className="text-lg font-bold text-[#1C2517]">{overrideSlot ? "Edit Override" : "Tambah Override Harian"}</h3>
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
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Waktu Mulai</label>
              <input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Waktu Selesai</label>
              <input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Mata Pelajaran (Kosongkan jika jam kosong/istirahat)</label>
            <select value={mapel} onChange={(e) => { setMapel(e.target.value); setGuruId(""); }} className="w-full px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none" style={{ border: "1px solid #E2E8DE" }}>
              <option value="">-- Jam Kosong / Istirahat --</option>
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
            {overrideSlot && (
              <button onClick={handleClearOverride} className="px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg">Hapus Override</button>
            )}
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
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  });
  const [editOverride, setEditOverride] = useState<any>(null);

  const { jadwalList, jadwalOverridesList, guruList } = useAppContext();

  const activeDayName = useMemo(() => {
    const d = new Date(activeDate);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return dayNames[d.getDay()];
  }, [activeDate]);

  const segments = useMemo(() => {
    const dailyMaster = jadwalList.filter(j => j.kelas === activeClass && j.hari === activeDayName);
    const dailyOverride = jadwalOverridesList.filter(o => o.tanggal === activeDate && o.kelas === activeClass);
    
    // We combine master and override blocks. 
    // If an override block exists, it overrides the master block with the same waktuMulai and waktuSelesai.
    // In Solusi 2, overrides can be completely free. Let's just list them all, but remove master blocks that exactly match override times if we want to replace them.
    // Actually, simple rule: an override with the same waktuMulai replaces the master block at that waktuMulai.
    const overrideMap = new Map();
    dailyOverride.forEach(o => overrideMap.set(o.jam ?? (o as any).waktuMulai, o));

    const combined: any[] = [];
    dailyMaster.forEach(m => {
      const key = m.jam ?? (m as any).waktuMulai;
      if (overrideMap.has(key)) {
        combined.push(overrideMap.get(key));
        overrideMap.delete(key);
      } else {
        combined.push(m);
      }
    });
    // Add remaining overrides (new blocks)
    overrideMap.forEach(o => combined.push(o));

    combined.sort((a, b) => (a.jam ?? 0) - (b.jam ?? 0) || ((a as any).waktuMulai ?? "").localeCompare((b as any).waktuMulai ?? ""));

    return combined.map(finalSlot => {
      const isOverridden = !!finalSlot.tanggal; // overrides have tanggal

      if (finalSlot.mapel && finalSlot.guruId) {
        const conflictJadwal = jadwalList.find(j => j.guruId === finalSlot.guruId && j.hari === activeDayName && (j as any).waktuMulai < finalSlot.waktuSelesai && (j as any).waktuSelesai > finalSlot.waktuMulai && j.kelas !== activeClass);
        const conflict = !!conflictJadwal && !isOverridden; 
        const conflictNote = conflictJadwal ? `Mengajar di ${conflictJadwal.kelas}` : "";
        const guru = guruList.find(g => g.id === finalSlot.guruId);

        return {
          id: finalSlot.id,
          type: "period",
          timeRange: `${finalSlot.waktuMulai} - ${finalSlot.waktuSelesai}`,
          subject: finalSlot.mapel,
          teacher: guru?.nama || "Unknown",
          teacherId: finalSlot.guruId,
          room: finalSlot.ruang || `R. ${activeClass}`,
          conflict, conflictNote,
          isOverridden,
          raw: finalSlot
        };
      } else {
        return {
          id: finalSlot.id,
          type: "period",
          timeRange: `${finalSlot.waktuMulai} - ${finalSlot.waktuSelesai}`,
          subject: "Jam Kosong / Istirahat",
          teacher: "-",
          room: "-",
          isOverridden,
          raw: finalSlot
        };
      }
    });
  }, [jadwalList, jadwalOverridesList, activeClass, activeDate, activeDayName, guruList]);

  return (
    <div className="space-y-4">
      {editOverride !== null && (
        <SlotOverrideModal 
          tanggal={activeDate} kelas={activeClass} hari={activeDayName} editOverride={editOverride === "new" ? undefined : editOverride} 
          onClose={() => setEditOverride(null)} 
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="date" 
            value={activeDate} 
            onChange={e => setActiveDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-white text-[#1C2517] outline-none shadow-sm border border-[#E2E8DE]" 
          />
          <select value={activeClass} onChange={(e) => setActiveClass(e.target.value)} className="px-3 py-2 rounded-lg text-sm font-semibold bg-white text-[#1C2517] outline-none shadow-sm border border-[#E2E8DE]">
            {uniqueClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setEditOverride("new")} className="flex items-center gap-1.5 px-3 py-2 bg-[#3E8A2F] hover:bg-[#2E6B22] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} /> Tambah Override
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-[#E2E8DE] p-4">
          <h2 className="text-sm font-bold text-[#1C2517] mb-4">
            Jadwal Harian • Kelas {activeClass} • {activeDayName}, {activeDate}
          </h2>
          
          <div className="space-y-3">
            {segments.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-[#9CA3A0]">Tidak ada jadwal untuk tanggal ini.</p>
              </div>
            )}
            {segments.map((seg, i) => (
              <SlotRow key={i} seg={seg as any} onClickSlot={() => setEditOverride(seg.raw)} />
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-[#FFFBEB] rounded-xl shadow-sm border border-[#FDE68A] p-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-[#D97706] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#92400E]">Mode Jadwal Harian</h4>
                <p className="text-xs text-[#92400E] mt-1 leading-relaxed">
                  Perubahan di tab ini hanya berlaku untuk tanggal <b>{activeDate}</b> (misal: guru izin, ganti jam). Tidak mengubah Jadwal Master.
                </p>
              </div>
            </div>
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
  const [pendingDeleteKelas, setPendingDeleteKelas] = useState<string | null>(null);

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
      <div className="print:hidden">
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
      {currentTab === "jadwal" && <JadwalTab uniqueClasses={uniqueClasses} />}
      {currentTab === "harian" && <JadwalHarianTab uniqueClasses={uniqueClasses} handlePrint={() => window.print()} />}
      {currentTab === "data"  && (
        <DataKelasTab
          kelasRows={kelasRows}
          onAdd={() => setIsAddingKelas(true)}
          onEdit={(row) => setEditingKelas(row)}
          onDelete={(id) => setPendingDeleteKelas(id)}
          onViewSiswa={(kelas) => navigate('/akademik/siswa', { state: { kelasFilter: `Kelas ${kelas}` } })}
        />
      )}

      {/* Confirm delete kelas */}
      {pendingDeleteKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-[#DC2626]" />
              </div>
              <div>
                <p className="font-bold text-[#1C2517] text-sm">Hapus Kelas {pendingDeleteKelas}?</p>
                <p className="text-xs text-[#6B7769] mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteKelas(null)}
                className="px-4 py-2 text-sm font-semibold text-[#374040] rounded-lg hover:bg-[#F5F9F4] transition-colors"
                style={{ border: "1px solid #E2E8DE" }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteKelas(pendingDeleteKelas);
                  toast.success(`Kelas ${pendingDeleteKelas} berhasil dihapus`);
                  setPendingDeleteKelas(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
