import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, MoreHorizontal, X, Eye, Pencil,
  MessageCircle, Trash2, FileText, Calendar, IdCard, ZoomIn
} from "lucide-react";
import QRCode from "react-qr-code";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

import { GuruRow, guruData } from "@/data/guru";
import { mapelOptions } from "@/data/constants";
import { useAppContext } from "@/context/AppContext";
import { DAYS } from "@/data/kelas";
import { KartuGuru } from "./KartuDigital";

// ─── palette ──────────────────────────────────────────────────────────────────

const AVATAR_BG: Record<string, string> = {
  PNS:     "#1E40AF",
  GTY:     "#3E8A2F",
  Honorer: "#D97706",
};

// ─── sub-components ───────────────────────────────────────────────────────────

function MapelBadges({ mapel }: { mapel: string[] }) {
  const shown = mapel.slice(0, 2);
  const rest  = mapel.length - 2;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map((m) => (
        <span key={m} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF7EC] text-[#166534]">
          {m}
        </span>
      ))}
      {rest > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7769]">
          +{rest}
        </span>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const aktif = status === "Aktif";
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${aktif ? "bg-[#3E8A2F]" : "bg-[#9CA3A0]"}`} />
      <span className={`text-sm ${aktif ? "text-[#374040]" : "text-[#9CA3A0]"}`}>{status}</span>
    </div>
  );
}

function KehadiranCell({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#3E8A2F" : pct >= 75 ? "#D97706" : "#DC2626";
  const bgBar = pct >= 90 ? "#DCFCE7" : pct >= 75 ? "#FEF3C7" : "#FEE2E2";
  return (
    <div className="w-[80px] space-y-1.5">
      <span className="text-sm font-semibold tabular-nums" style={{ color }}>{pct}%</span>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bgBar }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function RowMenu({ onView, onWA, onNonaktif, onShowCard }: { onView: () => void, onWA: () => void, onNonaktif: () => void, onShowCard: () => void }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  return (
    <>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          const rect = e.currentTarget.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const menuHeight = 160; 
          
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
              border: "1px solid #E2E8DE", 
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)" 
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onShowCard(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <IdCard size={13} className="text-[#3E8A2F]" /> Kartu Digital
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Eye size={13} className="text-[#6B7769]" /> Lihat Detail
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Pencil size={13} className="text-[#6B7769]" /> Edit Data
            </button>
            <button onClick={(e) => { e.stopPropagation(); onWA(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <MessageCircle size={13} className="text-[#6B7769]" /> Kirim WA
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button onClick={(e) => { e.stopPropagation(); onNonaktif(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
              <Trash2 size={13} /> Nonaktifkan
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ─── floating label helpers ───────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, required = false, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0 || type === "date";
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label className={`absolute left-3 pointer-events-none transition-all duration-150 ${raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"}`}>
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 ${raised ? "pt-6" : "pt-4"}`}
      />
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, required = false, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; options: string[];
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label className={`absolute left-3 pointer-events-none transition-all duration-150 ${raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"}`}>
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full appearance-none bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 pr-8 ${raised ? "pt-6" : "pt-4"}`}
      >
        <option value="" disabled hidden></option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
    </div>
  );
}

function FloatingTextarea({
  label, value, onChange, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label className={`absolute left-3 pointer-events-none transition-all duration-150 ${raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"}`}>
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 resize-none ${raised ? "pt-6" : "pt-4"}`}
      />
    </div>
  );
}

function MapelMultiSelect({ values, onChange, label, options, required = false }: { values: string[]; onChange: (v: string[]) => void; label: string; options: string[]; required?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  const filteredOptions = options.filter(o => 
    !values.includes(o) && 
    o !== "Semua Mapel" &&
    o.toLowerCase().includes(query.toLowerCase())
  );
  
  const exactMatch = options.find(o => o.toLowerCase() === query.trim().toLowerCase());
  const showAdd = query.trim().length > 0 && !exactMatch && !values.some(v => v.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative rounded-lg px-3 pt-6 pb-2.5" style={{ border: "1px solid #E2E8DE" }}>
      <label className="absolute left-3 top-1.5 text-[10px] text-[#6B7769] pointer-events-none">{label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}</label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF7EC] text-[#3E8A2F] text-xs font-semibold">
            {v}
            <span 
              className="text-[#9CA3A0] cursor-pointer hover:text-[#DC2626] leading-none"
              onClick={() => onChange(values.filter(mapel => mapel !== v))}
            >×</span>
          </span>
        ))}
        <div className="relative">
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F5F9F4] text-[#9CA3A0] text-xs cursor-pointer hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
            onClick={() => { setIsOpen(!isOpen); setQuery(""); }}
          >
            + Tambah
          </span>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 w-52 max-h-56 flex flex-col bg-white rounded-lg shadow-lg border border-[#E2E8DE] py-1">
                <div className="px-2 pb-1 mb-1 border-b border-[#E2E8DE]">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ketik mapel baru..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && showAdd) {
                        e.preventDefault();
                        onChange([...values, query.trim()]);
                        setIsOpen(false);
                        setQuery("");
                      }
                    }}
                    className="w-full bg-transparent outline-none text-[13px] text-[#1C2517] px-2 py-1.5"
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  {showAdd && (
                    <div 
                      className="px-3 py-2 text-[13px] hover:bg-[#EDF7EC] cursor-pointer text-[#3E8A2F] font-semibold flex items-center gap-2"
                      onClick={() => {
                        onChange([...values, query.trim()]);
                        setIsOpen(false);
                        setQuery("");
                      }}
                    >
                      + Tambah "{query.trim()}"
                    </div>
                  )}
                  {filteredOptions.length === 0 && !showAdd && (
                    <div className="px-3 py-2 text-[13px] text-[#9CA3A0] italic">Tidak ditemukan</div>
                  )}
                  {filteredOptions.map(opt => (
                    <div 
                      key={opt}
                      className="px-3 py-1.5 text-[13px] hover:bg-[#F5F9F4] cursor-pointer text-[#374040]"
                      onClick={() => {
                        onChange([...values, opt]);
                        setIsOpen(false);
                        setQuery("");
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail sheet ──────────────────────────────────────────────────────────────

type SheetTab = "profil" | "jadwal" | "absensi";

function GuruSheet({ guru, onClose, onSave, isNew, mapelOptions, onShowCard }: { guru: GuruRow; onClose: () => void; onSave: (data: Partial<GuruRow>) => void; isNew?: boolean; mapelOptions: string[]; onShowCard?: () => void }) {
  const { jadwalList, absensiGuruHistory, appSettings } = useAppContext();
  const [tab, setTab] = useState<SheetTab>("profil");
  const [form, setForm] = useState({
    nama: guru.nama,
    nuptk: guru.nuptk,
    nip: guru.nip,
    jk: guru.jk as string,
    tanggalLahir: guru.tanggalLahir,
    statusKepeg: guru.statusKepeg as string,
    jabatan: guru.jabatan,
    pendidikan: guru.pendidikan,
    hp: guru.hp,
    email: guru.email,
    alamat: guru.alamat,
    mapel: guru.mapel || [],
    waliKelas: guru.waliKelas || "",
    foto: (guru as any)?.foto || "",
  });
  const set = (key: keyof typeof form) => (v: any) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const TAB_LABELS: Record<SheetTab, string> = {
    profil:  "Profil",
    jadwal:  "Jadwal Mengajar",
    absensi: "Riwayat Absensi",
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[640px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: AVATAR_BG[guru.statusKepeg] }}
            >
              {guru.inits}
            </div>
            <div>
              <p className="font-semibold text-[#1C2517]">{guru.nama}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={guru.statusKepeg as "PNS" | "GTY" | "Honorer"} />
                {guru.waliKelas && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374040]">
                    Wali Kelas {guru.waliKelas}
                  </span>
                )}
                <StatusDot status={guru.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onShowCard && !isNew && (
              <button
                onClick={onShowCard}
                title="Lihat Kartu Digital"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3E8A2F] bg-[#F5F9F4] hover:bg-[#E2E8DE] transition-colors"
              >
                <IdCard size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] hover:text-[#1C2517] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
            {(["profil", "jadwal", "absensi"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap",
                  tab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
                ].join(" ")}
                style={tab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "profil" ? (
            <div className="space-y-6">
              {/* ── Data Pribadi ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Data Pribadi</p>

                {/* Upload Foto */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-16 h-20 bg-gray-100 border border-gray-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center relative">
                    {form.foto ? (
                      <img src={form.foto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <img src={form.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt="Preview Default" className="w-full h-full object-cover" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => set("foto")(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col relative">
                    <p className="text-sm font-semibold text-[#1C2517]">Foto Profil</p>
                    <p className="text-[11px] text-[#6B7769] mt-0.5 mb-2">Format JPG/PNG. Maks 2MB.</p>
                    <button className="w-fit px-3 py-1.5 rounded-md bg-[#F5F9F4] text-[#3E8A2F] text-xs font-semibold hover:bg-[#EDF7EC] transition-colors">
                      Pilih Foto
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => set("foto")(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <FloatingInput label="Nama Lengkap" value={form.nama} onChange={set("nama")} required />
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="NUPTK" value={form.nuptk} onChange={set("nuptk")} />
                  <FloatingInput label="NIP" value={form.nip} onChange={set("nip")} />
                </div>
                {/* Jenis Kelamin radio */}
                <div className="rounded-lg px-3 py-3" style={{ border: "1px solid #E2E8DE" }}>
                  <p className="text-[10px] text-[#6B7769] mb-2.5">Jenis Kelamin</p>
                  <div className="flex gap-6">
                    {[{ v: "L", l: "Laki-laki" }, { v: "P", l: "Perempuan" }].map(({ v, l }) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer" onClick={() => set("jk")(v)}>
                        <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${form.jk === v ? "border-[#3E8A2F]" : "border-[#D1D5DB]"}`}>
                          {form.jk === v && <div className="w-2 h-2 rounded-full bg-[#3E8A2F]" />}
                        </div>
                        <span className="text-sm text-[#374040]">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FloatingInput label="Tanggal Lahir" value={form.tanggalLahir} onChange={set("tanggalLahir")} type="date" required />
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Kepegawaian ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Kepegawaian</p>
                <FloatingSelect
                  label="Status Kepegawaian" value={form.statusKepeg} onChange={set("statusKepeg")} required
                  options={["GTY", "PNS", "Honorer"]}
                />
                <FloatingInput label="Jabatan" value={form.jabatan} onChange={set("jabatan")} />
                <FloatingInput label="Wali Kelas (Opsional)" value={form.waliKelas} onChange={set("waliKelas")} />
                <MapelMultiSelect label="Mata Pelajaran" values={form.mapel} onChange={set("mapel")} options={mapelOptions} required />
                <FloatingSelect 
                  label="Pendidikan Terakhir" value={form.pendidikan} onChange={set("pendidikan")} required
                  options={["SMA/SMK", "D1/D2", "D3", "D4/S1", "S2", "S3", "Lainnya"]} 
                />
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Kontak ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Kontak</p>
                <div>
                  <FloatingInput label="No. HP / WA" value={form.hp} onChange={set("hp")} required />
                  <p className="text-[11px] text-[#9CA3A0] mt-1 px-1">Untuk pengiriman notifikasi &amp; koordinasi WA</p>
                </div>
                <FloatingInput label="Email" value={form.email} onChange={set("email")} type="email" />
                <FloatingTextarea label="Alamat" value={form.alamat} onChange={set("alamat")} required />
              </section>

              <div className="h-2" />
            </div>
          ) : tab === "jadwal" ? (
            <div className="py-6 space-y-4">
              {(() => {
                const myJadwal = jadwalList.filter(j => j.guruId === guru.id);
                if (myJadwal.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F9F4] flex items-center justify-center mx-auto mb-4">
                        <Calendar size={22} className="text-[#D1D5DB]" />
                      </div>
                      <p className="text-sm font-semibold text-[#6B7769] mb-1">{TAB_LABELS[tab]}</p>
                      <p className="text-xs text-[#9CA3A0]">Belum ada jadwal mengajar yang dialokasikan.</p>
                    </div>
                  );
                }
                return DAYS.map(hari => {
                  const jHari = myJadwal.filter(j => j.hari === hari).sort((a, b) => ((a as any).waktuMulai ?? "").localeCompare((b as any).waktuMulai ?? ""));
                  if (jHari.length === 0) return null;
                  return (
                    <div key={hari} className="border border-[#E2E8DE] rounded-xl overflow-hidden mx-2">
                      <div className="bg-[#F5F9F4] px-4 py-2 border-b border-[#E2E8DE]">
                        <p className="text-xs font-bold text-[#3E8A2F] uppercase">{hari}</p>
                      </div>
                      <div className="divide-y divide-[#E2E8DE]">
                        {jHari.map(j => {
                          return (
                            <div key={j.id} className="p-3 flex items-center justify-between bg-white">
                              <div>
                                <p className="text-sm font-semibold text-[#1C2517]">{j.mapel} <span className="text-xs font-normal text-[#6B7769]">({j.ruang || j.kelas})</span></p>
                                <p className="text-xs text-[#9CA3A0]">{(j as any).waktuMulai} - {(j as any).waktuSelesai}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-[#EDF7EC] text-[#3E8A2F] text-[10px] font-bold">Kelas {j.kelas}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="py-6 space-y-4">
              {(() => {
                const jamMasuk = appSettings.jamMasukGuru ?? "07:00";
                const [limH, limM] = jamMasuk.split(":").map(Number);
                let hadir = 0, izin = 0, alpa = 0, terlambat = 0;
                Object.values(absensiGuruHistory).forEach(dayData => {
                  const entry = dayData[guru.id];
                  if (!entry) return;
                  if (entry.status === "Hadir") {
                    hadir++;
                    const [eH, eM] = (entry.jam || "00:00").split(":").map(Number);
                    if (eH > limH || (eH === limH && eM > limM)) terlambat++;
                  } else if (entry.status === "Izin") {
                    izin++;
                  } else if (entry.status === "Alpa") {
                    alpa++;
                  }
                });
                const totalDays = hadir + izin + alpa;
                const rekap = totalDays > 0 ? { hadir, izin, alpa, terlambat, pct: Math.round((hadir / totalDays) * 100) } : null;
                if (!rekap) {
                  return (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F9F4] flex items-center justify-center mx-auto mb-4">
                        <FileText size={22} className="text-[#D1D5DB]" />
                      </div>
                      <p className="text-sm font-semibold text-[#6B7769] mb-1">{TAB_LABELS[tab]}</p>
                      <p className="text-xs text-[#9CA3A0]">Belum ada data absensi untuk guru ini.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-6 mx-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-[#E2E8DE] rounded-xl p-4 flex flex-col justify-center bg-[#F4FBF4]">
                        <p className="text-[10px] font-semibold text-[#6B7769] mb-1 uppercase tracking-widest">Tingkat Kehadiran</p>
                        <p className="text-3xl font-bold text-[#3E8A2F]">{rekap.pct}%</p>
                      </div>
                      <div className="grid grid-rows-2 gap-3">
                        <div className="border border-[#E2E8DE] rounded-xl px-4 flex items-center justify-between">
                          <p className="text-xs text-[#6B7769] font-semibold">Hadir</p>
                          <p className="text-lg font-bold text-[#1C2517]">{rekap.hadir}</p>
                        </div>
                        <div className="border border-[#E2E8DE] rounded-xl px-4 flex items-center justify-between">
                          <p className="text-xs text-[#6B7769] font-semibold">Terlambat</p>
                          <p className="text-lg font-bold text-[#F6B31E]">{rekap.terlambat}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-[#E2E8DE] rounded-xl px-4 py-3 flex items-center justify-between">
                        <p className="text-xs text-[#6B7769] font-semibold">Izin/Sakit</p>
                        <p className="text-lg font-bold text-[#374040]">{rekap.izin}</p>
                      </div>
                      <div className="border border-[#E2E8DE] rounded-xl px-4 py-3 flex items-center justify-between">
                        <p className="text-xs text-[#6B7769] font-semibold">Alpa</p>
                        <p className="text-lg font-bold text-[#DC2626]">{rekap.alpa}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8DE]">
                      <p className="text-xs text-[#9CA3A0] leading-relaxed">
                        Data ini direkap dari seluruh riwayat absensi harian guru di menu Absensi Guru.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            Batal
          </button>
          <button 
            onClick={() => {
              if (!form.nama || !form.statusKepeg || !form.hp || !form.tanggalLahir || !form.alamat || !form.pendidikan || form.mapel.length === 0) {
                toast.error("Mohon lengkapi semua kolom yang wajib diisi (bertanda *).");
                return;
              }
              onSave(form as unknown as Partial<GuruRow>);
            }} 
            className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Guru() {
  const { guruList, addGuru, updateGuru, deleteGuru } = useAppContext();
  const [search,      setSearch]      = useState("");
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");
  const [statusFilter,setStatusFilter]= useState("Semua Status");
  const [selectedGuru, setSelectedGuru] = useState<GuruRow | null>(null);
  
  const [selectedCardGuru, setSelectedCardGuru] = useState<GuruRow | null>(null);
  const [qrZoomGuru, setQrZoomGuru] = useState<GuruRow | null>(null);
  const [isAddingGuru, setIsAddingGuru] = useState(false);

  const dynamicMapelOptions = useMemo(() => {
    const base = new Set(mapelOptions);
    guruList.forEach(g => {
      g.mapel.forEach(m => base.add(m));
    });
    return Array.from(base).sort();
  }, [guruList]);

  const kpiData = useMemo(() => {
    return [
      { label: "Total", value: guruList.length },
      { label: "PNS",   value: guruList.filter(g => g.statusKepeg === "PNS").length },
      { label: "GTY",   value: guruList.filter(g => g.statusKepeg === "GTY").length },
      { label: "Honorer", value: guruList.filter(g => g.statusKepeg === "Honorer").length },
    ];
  }, [guruList]);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return guruList.filter((r) => {
      const matchSearch = !q ||
        r.nama.toLowerCase().includes(q) ||
        r.nuptk.includes(q) ||
        r.mapel.some((m) => m.toLowerCase().includes(q));
      const matchMapel  = mapelFilter === "Semua Mapel" || r.mapel.includes(mapelFilter);
      const matchStatus = statusFilter === "Semua Status" || r.statusKepeg === statusFilter;
      return matchSearch && matchMapel && matchStatus;
    });
  }, [search, mapelFilter, statusFilter, guruList]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, mapelFilter, statusFilter]);

  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const paginatedRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const startIdx = rows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, rows.length);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* ── Title + KPI chips ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-[#1C2517]">Guru</h2>
          <p className="text-sm text-[#6B7769]">Data tenaga pengajar dan kepegawaian madrasah</p>
        </div>
        <div className="hidden md:flex items-center gap-2 mt-1 shrink-0">
          {kpiData.map((kpi, i) => (
            <div key={kpi.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#D1D5DB]">·</span>}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white"
                style={{ border: "1px solid #E2E8DE" }}
              >
                <span className="font-bold tabular-nums text-[#1C2517]">{kpi.value}</span>
                <span className="text-[#6B7769]">{kpi.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="hidden md:flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
          style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
        >
          <Search size={13} className="text-[#9CA3A0] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / NUPTK / mata pelajaran..."
            className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
          />
        </div>

        {/* Mapel filter */}
        <div className="relative">
          <select
            value={mapelFilter}
            onChange={(e) => setMapelFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {["Semua Mapel", ...dynamicMapelOptions.filter(o => o !== "Semua Mapel")].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        {/* Status kepegawaian filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {["Semua Status", "PNS", "GTY", "Honorer"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        <div className="ml-auto">
          <button onClick={() => setIsAddingGuru(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            <Plus size={13} />
            Tambah Guru
          </button>
        </div>
      </div>

      {/* ── Mobile toolbar ── */}
      <div className="md:hidden flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9", padding: "0 12px", minHeight: 44 }}>
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / NUPTK / mapel..."
            className="flex-1 bg-transparent outline-none text-[13px] text-[#1C2517]" />
        </div>
        <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#3E8A2F] shrink-0">
          <Plus size={16} color="#FFF" />
        </button>
      </div>

      {/* ── Mobile guru cards ── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {rows.length === 0 ? (
          <p className="text-sm text-[#9CA3A0] text-center py-8">Belum ada data guru</p>
        ) : paginatedRows.map((row) => {
          const pct = row.kehadiran;
          const pctColor = pct >= 90 ? "#3E8A2F" : pct >= 75 ? "#D97706" : "#DC2626";
          return (
            <button key={row.id} onClick={() => setSelectedGuru(row)} className="w-full text-left bg-white rounded-xl"
              style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                  style={{ background: AVATAR_BG[row.statusKepeg] }}>
                  {row.inits}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1C2517] leading-tight truncate">{row.nama}</p>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 4 }}>
                    <StatusBadge status={row.statusKepeg as "PNS" | "GTY" | "Honorer"} />
                    {row.waliKelas && <span className="text-[11px] text-[#6B7769] bg-[#F3F4F6] px-2 py-0.5 rounded-full">Wali {row.waliKelas}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1" style={{ marginTop: 6 }}>
                    {row.mapel.map((m) => (
                      <span key={m} className="text-[10px] font-semibold bg-[#EDF7EC] text-[#166534] px-1.5 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: pctColor }}>{pct}%</span>
                  <span className="text-[10px] text-[#9CA3A0]">Hadir</span>
                </div>
              </div>
            </button>
          );
        })}
        <div className="py-1">
          <span className="text-[12px] text-[#6B7769]">{startIdx}–{endIdx} dari <strong className="text-[#1C2517]">{rows.length}</strong> guru</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="hidden md:block bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="px-6">Guru</Th>
                <Th className="px-4">Mata Pelajaran</Th>
                <Th className="px-4">Status Kepegawaian</Th>
                <Th className="px-4">Wali Kelas</Th>
                <Th className="px-4">Kehadiran Bln Ini</Th>
                <Th className="px-4">Status</Th>
                <th className="py-3 pr-6 w-10" />
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                  style={{ borderBottom: i < paginatedRows.length - 1 ? "1px solid #F0F7EE" : "none" }}
                  onClick={() => setSelectedGuru(row)}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: AVATAR_BG[row.statusKepeg] }}
                      >
                        {row.inits}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                        <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">
                          {row.nuptk || <span className="italic">NUPTK —</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <MapelBadges mapel={row.mapel} />
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.statusKepeg as "PNS" | "GTY" | "Honorer"} />
                  </td>

                  <td className="px-4 py-3.5 text-sm text-[#374040]">
                    {row.waliKelas ? (
                      <span className="font-medium">{row.waliKelas}</span>
                    ) : (
                      <span className="text-[#D1D5DB]">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <KehadiranCell pct={row.kehadiran} />
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusDot status={row.status} />
                  </td>

                  <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                    <RowMenu 
                      onView={() => setSelectedGuru(row)} 
                      onWA={() => {
                        const no = row.hp.replace(/\D/g, "");
                        const waNumber = no.startsWith("0") ? "62" + no.slice(1) : no;
                        window.open(`https://wa.me/${waNumber}`, "_blank");
                      }}
                      onNonaktif={() => updateGuru(row.id, { status: "Nonaktif" })}
                      onShowCard={() => setSelectedCardGuru(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{ borderTop: "1px solid #E2E8DE" }}
        >
          <span className="text-xs text-[#6B7769]">
            {startIdx}–{endIdx} dari <span className="font-semibold text-[#1C2517]">{rows.length}</span> guru
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === 1 ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${currentPage === page ? "bg-[#3E8A2F] text-white font-bold" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === totalPages ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail sheet ── */}
      {selectedGuru && (
        <GuruSheet 
          guru={selectedGuru} 
          mapelOptions={dynamicMapelOptions}
          onClose={() => setSelectedGuru(null)}
          onSave={(data) => {
            updateGuru(selectedGuru.id, data);
            setSelectedGuru(null);
          }}
          onShowCard={() => setSelectedCardGuru(selectedGuru)}
        />
      )}
      {isAddingGuru && (
        <GuruSheet 
          isNew
          mapelOptions={dynamicMapelOptions}
          guru={{
            id: Date.now(),
            nama: "", nuptk: "", nip: "",
            mapel: [], statusKepeg: "Honorer", waliKelas: null,
            kehadiran: 100, status: "Aktif", jk: "L", tanggalLahir: "",
            jabatan: "", pendidikan: "", hp: "", email: "", alamat: "", inits: "N"
          }} 
          onClose={() => setIsAddingGuru(false)}
          onSave={(data) => {
            addGuru({
              id: Date.now(),
              nama: data.nama || "",
              nuptk: data.nuptk || "",
              nip: data.nip || "",
              mapel: data.mapel || [],
              statusKepeg: (data.statusKepeg || "Honorer") as any,
              waliKelas: data.waliKelas || null,
              kehadiran: 100,
              status: "Aktif",
              jk: (data.jk || "L") as any,
              tanggalLahir: data.tanggalLahir || "",
              jabatan: data.jabatan || "",
              pendidikan: data.pendidikan || "",
              hp: data.hp || "",
              email: data.email || "",
              alamat: data.alamat || "",
              inits: (data.nama || "N").substring(0, 2).toUpperCase()
            });
            setIsAddingGuru(false);
          }}
        />
      )}

      {/* ── Mobile Modal (Kartu Digital) ── */}
      {selectedCardGuru && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center overflow-hidden" onClick={() => setSelectedCardGuru(null)}>
          <button 
            onClick={() => setSelectedCardGuru(null)}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <KartuGuru 
              key={`modal-guru-${selectedCardGuru.id}`}
              guru={selectedCardGuru} 
              isModal={true} 
              onZoom={(g: any) => setQrZoomGuru(g)}
            />
          </div>
        </div>
      )}

      {/* ── QR Zoom Modal ── */}
      {qrZoomGuru && (
        <div 
          className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-6"
          onClick={() => setQrZoomGuru(null)}
        >
          <div 
            className="bg-white p-6 rounded-2xl flex flex-col items-center max-w-sm w-full relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setQrZoomGuru(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F9F4] flex items-center justify-center text-[#6B7769] hover:bg-[#E2E8DE] transition-colors"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-[#1C2517] font-bold mb-5 text-center text-lg leading-tight">
              Scan QR Code
              <br/>
              <span className="text-sm font-normal text-[#6B7769]">{qrZoomGuru.nama}</span>
            </h3>
            
            <div className="p-3 border-2 border-[#E2E8DE] rounded-xl bg-white shadow-sm mb-6">
              <QRCode
                value={`MADRASAH AL-ITTIHAD|${qrZoomGuru.id}|${qrZoomGuru.nama}`}
                size={220}
                level="M"
              />
            </div>
            
            <p className="text-center text-[#9CA3A0] text-sm">
              Gunakan alat pemindai (scanner) di gerbang/ruang guru untuk merekam kehadiran elektronik Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
