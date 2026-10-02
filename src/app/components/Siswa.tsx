import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Upload, MoreHorizontal, X, Eye, Pencil,
  MessageCircle, Trash2, Check, FileText, IdCard, ZoomIn,
  GraduationCap, ArrowRightLeft, BarChart3, SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { KartuPelajar } from "./KartuDigital";

import { SiswaRow } from "@/data/siswa";
import { kelasOptions } from "@/data/constants";
import { useAppContext } from "@/context/AppContext";

// ─── badge palettes ───────────────────────────────────────────────────────────

const KELAS_COLOR: Record<string, string> = {
  "7": "bg-[#DBEAFE] text-[#1E40AF]",
  "8": "bg-[#EDE9FE] text-[#5B21B6]",
  "9": "bg-[#DCFCE7] text-[#166534]",
};

function getVisiblePages(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Checkbox({
  checked, indeterminate = false, onChange,
}: {
  checked: boolean; indeterminate?: boolean; onChange: () => void;
}) {
  const filled = checked || indeterminate;
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        "w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
        filled ? "bg-[#3E8A2F] border-[#3E8A2F]" : "bg-white border-[#D1D5DB] hover:border-[#3E8A2F]",
      ].join(" ")}
    >
      {indeterminate && !checked
        ? <span className="w-2 h-[1.5px] bg-white rounded-full block" />
        : checked
        ? <Check size={9} className="text-white shrink-0" />
        : null}
    </button>
  );
}

function KelasBadge({ kelas }: { kelas: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${KELAS_COLOR[kelas[0]] ?? "bg-[#F3F4F6] text-[#374040]"}`}>
      {kelas}
    </span>
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

function RowMenu({ isActive, waNumber, onView, onEdit, onShowCard, onToggleStatus }: { isActive: boolean; waNumber: string; onView: () => void; onEdit: () => void; onShowCard: () => void; onToggleStatus: () => void }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  return (
    <>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          const rect = e.currentTarget.getBoundingClientRect();
          // Jika menu terlalu dekat ke bawah layar, buka ke atas
          const spaceBelow = window.innerHeight - rect.bottom;
          const menuHeight = 220; 
          
          setCoords({
            left: rect.right - 176, // 176 = w-44 (44 * 4px)
            top: spaceBelow < menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8
          });
          setOpen((o) => !o); 
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors relative"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && createPortal(
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
              <IdCard size={13} className="text-[#3E8A2F]" />
              Kartu Digital
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Eye size={13} className="text-[#6B7769]" />
              Lihat Detail
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Pencil size={13} className="text-[#6B7769]" />
              Edit Data
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (waNumber) {
                  const formatted = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber;
                  window.open(`https://wa.me/${formatted}`, '_blank');
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <MessageCircle size={13} className="text-[#6B7769]" />
              Kirim WA
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleStatus(); setOpen(false); }} 
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isActive ? "text-[#DC2626] hover:bg-[#FEF2F2]" : "text-[#3E8A2F] hover:bg-[#F5F9F4]"}`}
            >
              <Trash2 size={13} />
              {isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// ─── floating label inputs ────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, required = false, type = "text", readOnly = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0 || type === "date";
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label
        className={`absolute left-3 pointer-events-none transition-all duration-150 ${
          raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"
        }`}
      >
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly={readOnly}
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 ${raised ? "pt-6" : "pt-4"} ${readOnly ? "opacity-75 cursor-default" : ""}`}
      />
    </div>
  );
}

function FloatingTextarea({
  label, value, onChange, required = false, readOnly = false,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label
        className={`absolute left-3 pointer-events-none transition-all duration-150 ${
          raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"
        }`}
      >
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly={readOnly}
        rows={3}
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 resize-none ${raised ? "pt-6" : "pt-4"} ${readOnly ? "opacity-75 cursor-default" : ""}`}
      />
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, required = false, options, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; options: string[]; disabled?: boolean;
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
        disabled={disabled}
        className={`w-full appearance-none bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 pr-8 ${raised ? "pt-6" : "pt-4"} ${disabled ? "opacity-75 cursor-default" : ""}`}
      >
        <option value="" disabled hidden></option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
    </div>
  );
}

// ─── Student sheet (detail / edit) ────────────────────────────────────────────

type SheetTab = "profil" | "tagihan" | "riwayat";

function StudentSheet({ siswa, isAdding, isReadOnly, onClose, onSave, onShowCard }: { siswa?: SiswaRow | null; isAdding?: boolean; isReadOnly?: boolean; onClose: () => void; onSave: (data: any) => void; onShowCard?: () => void }) {
  const { tahunAjaran } = useAppContext();
  const [taStart, taEnd] = tahunAjaran.split("/");
  const prevYear = `${parseInt(taStart) - 1}/${taStart}`;
  const nextYear = `${taEnd}/${parseInt(taEnd) + 1}`;
  const [tab, setTab] = useState<SheetTab>("profil");
  const [form, setForm] = useState({
    nis: siswa?.nis || "", nisn: siswa?.nisn || "", nama: siswa?.nama || "",
    jk: (siswa?.jk as string) || "L",
    tempatLahir: siswa?.tempatLahir || "", tanggalLahir: siswa?.tanggalLahir || "",
    asalSekolah: siswa?.asalSekolah || "", tahunMasuk: siswa?.tahunMasuk || new Date().getFullYear().toString(),
    namaAyah: siswa?.namaAyah || "", namaIbu: siswa?.namaIbu || "", waliHp: siswa?.waliHp || "",
    alamat: siswa?.alamat || "", kelurahan: siswa?.kelurahan || "", kecamatan: siswa?.kecamatan || "",
    kelas: siswa?.kelas || kelasOptions.find(o => o !== "Semua Kelas")?.replace("Kelas ", "") || "7A",
    status: (siswa?.status as "Aktif" | "Nonaktif") || "Aktif",
    foto: (siswa as any)?.foto || "",
  });
  const set = (key: keyof typeof form) => (v: string) => {
    let finalValue = v;
    if (key === "nis" || key === "nisn" || key === "waliHp") {
      finalValue = v.replace(/\D/g, ""); // Hanya angka
    } else if (key === "nama" || key === "namaAyah" || key === "namaIbu" || key === "tempatLahir") {
      finalValue = v.replace(/[^a-zA-Z\s.,'-]/g, ""); // Hanya huruf dan tanda baca umum
    }
    setForm((prev) => ({ ...prev, [key]: finalValue }));
  };

  const TAB_LABELS: Record<SheetTab, string> = {
    profil: "Profil",
    tagihan: "Tagihan & Pembayaran",
    riwayat: "Riwayat",
  };

  const handleSave = () => {
    if (!form.nis || !form.nisn || !form.nama || !form.namaAyah || !form.waliHp || !form.tempatLahir || !form.tanggalLahir || !form.alamat || !form.asalSekolah || !form.tahunMasuk) {
      toast.error("Harap lengkapi semua kolom yang wajib diisi!");
      return;
    }
    onSave(form);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />

      {/* Sheet panel */}
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[640px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E2E8DE" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
              style={{
                background: siswa?.status === "Nonaktif" ? "#E2E8DE" : "#3E8A2F",
                color: siswa?.status === "Nonaktif" ? "#9CA3A0" : "#FFFFFF",
              }}
            >
              {siswa ? (
                <img src={siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={siswa.nama} className={`w-full h-full object-cover ${siswa.status === "Nonaktif" ? 'grayscale opacity-60' : ''}`} />
              ) : (
                "NEW"
              )}
            </div>
            <div>
              <p className="font-semibold text-[#1C2517]">{siswa ? siswa.nama : "Siswa Baru"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#6B7769]">Kelas {form.kelas}</span>
                {siswa && (
                  <>
                    <span className="text-[#D1D5DB]">·</span>
                    <StatusDot status={siswa.status} />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onShowCard && !isAdding && (
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
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
            {(["profil", "tagihan", "riwayat"] as const).map((t) => (
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

        {/* Scrollable content */}
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
                    {!isReadOnly && (
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
                    )}
                  </div>
                  <div className="flex flex-col relative">
                    <p className="text-sm font-semibold text-[#1C2517]">Foto Profil</p>
                    <p className="text-[11px] text-[#6B7769] mt-0.5 mb-2">Format JPG/PNG. Maks 2MB.</p>
                    {!isReadOnly && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="NIS" value={form.nis} onChange={set("nis")} required readOnly={isReadOnly} />
                  <FloatingInput label="NISN" value={form.nisn} onChange={set("nisn")} required readOnly={isReadOnly} />
                </div>
                <FloatingInput label="Nama Lengkap" value={form.nama} onChange={set("nama")} required readOnly={isReadOnly} />

                {/* Jenis Kelamin radio */}
                <div className={`rounded-lg px-3 py-3 ${isReadOnly ? "opacity-75" : ""}`} style={{ border: "1px solid #E2E8DE" }}>
                  <p className="text-[10px] text-[#6B7769] mb-2.5">
                    Jenis Kelamin <span className="text-[#DC2626]">*</span>
                  </p>
                  <div className="flex gap-6">
                    {[{ v: "L", l: "Laki-laki" }, { v: "P", l: "Perempuan" }].map(({ v, l }) => (
                      <label key={v} className={`flex items-center gap-2 ${isReadOnly ? "cursor-default" : "cursor-pointer"}`} onClick={() => !isReadOnly && set("jk")(v)}>
                        <div
                          className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                            form.jk === v ? "border-[#3E8A2F]" : "border-[#D1D5DB]"
                          }`}
                        >
                          {form.jk === v && <div className="w-2 h-2 rounded-full bg-[#3E8A2F]" />}
                        </div>
                        <span className="text-sm text-[#374040]">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Tempat Lahir" value={form.tempatLahir} onChange={set("tempatLahir")} required readOnly={isReadOnly} />
                  <FloatingInput label="Tanggal Lahir" value={form.tanggalLahir} onChange={set("tanggalLahir")} required type="date" readOnly={isReadOnly} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Asal Sekolah (SD/MI)" value={form.asalSekolah} onChange={set("asalSekolah")} required readOnly={isReadOnly} />
                  <FloatingInput label="Tahun Masuk" value={form.tahunMasuk} onChange={set("tahunMasuk")} required readOnly={isReadOnly} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingSelect
                    label="Kelas"
                    value={form.kelas}
                    onChange={set("kelas")}
                    disabled={isReadOnly}
                    options={kelasOptions.filter(o => o !== "Semua Kelas").map(o => o.replace("Kelas ", ""))}
                  />
                  <FloatingSelect
                    label="Status Siswa"
                    value={form.status}
                    onChange={set("status")}
                    disabled={isReadOnly}
                    options={["Aktif", "Nonaktif"]}
                  />
                </div>
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Data Wali ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Data Wali</p>
                <FloatingInput label="Nama Ayah" value={form.namaAyah} onChange={set("namaAyah")} required readOnly={isReadOnly} />
                <FloatingInput label="Nama Ibu" value={form.namaIbu} onChange={set("namaIbu")} readOnly={isReadOnly} />
                <div>
                  <FloatingInput label="No. HP Wali" value={form.waliHp} onChange={set("waliHp")} required readOnly={isReadOnly} />
                  <p className="text-[11px] text-[#9CA3A0] mt-1 px-1">
                    Untuk pengiriman kuitansi &amp; tagihan WA
                  </p>
                </div>
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Alamat ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Alamat</p>
                <FloatingTextarea label="Alamat Lengkap" value={form.alamat} onChange={set("alamat")} required readOnly={isReadOnly} />
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Kelurahan" value={form.kelurahan} onChange={set("kelurahan")} readOnly={isReadOnly} />
                  <FloatingInput label="Kecamatan" value={form.kecamatan} onChange={set("kecamatan")} readOnly={isReadOnly} />
                </div>
              </section>

              {/* Spacer so content isn't clipped by footer */}
              <div className="h-2" />
            </div>
          ) : tab === "tagihan" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
                <div>
                  <p className="text-xs text-[#6B7769] mb-1">Status Pembayaran SPP</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={siswa?.statusSPP || "Lunas"} />
                    <span className="text-sm font-semibold text-[#1C2517]">Juli 2026</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-[#EDF7EC] text-[#3E8A2F] text-xs font-semibold rounded-lg hover:bg-[#E3F2E1] transition-colors">
                  Buat Tagihan
                </button>
              </div>
              
              <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest mt-6 mb-2">Riwayat Transaksi</p>
              {siswa ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b border-[#F0F7EE] last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-[#1C2517]">Pembayaran SPP Bulan {["Juni", "Mei", "April"][item-1]}</p>
                        <p className="text-xs text-[#9CA3A0]">Transfer Bank • {10 + item} {["Juni", "Mei", "April"][item-1]} 2026</p>
                      </div>
                      <span className="text-sm font-bold text-[#3E8A2F]">Rp350.000</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-[#9CA3A0]">Belum ada data tagihan</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {/* Riwayat Kelas (Akademik) */}
              <section>
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest mb-4">Riwayat Kelas (Akademik)</p>
                {siswa ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#3E8A2F] bg-[#F4FBF4]">
                      <div>
                        <p className="text-sm font-semibold text-[#3E8A2F]">{siswa.kelas}</p>
                        <p className="text-xs text-[#6B7769]">Tahun Ajaran {nextYear}</p>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-[#3E8A2F] text-white rounded-full font-medium">Kelas Saat Ini</span>
                    </div>
                    {siswa.kelas.startsWith("9") ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8DE] bg-[#FAFAFA]">
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517]">8{siswa.kelas.charAt(1) || 'A'}</p>
                          <p className="text-xs text-[#9CA3A0]">Tahun Ajaran {tahunAjaran}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-[#F3F4F6] text-[#6B7769] rounded-full font-medium border border-[#E5E7EB]">Selesai</span>
                      </div>
                    ) : null}
                    {siswa.kelas.startsWith("8") || siswa.kelas.startsWith("9") ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8DE] bg-[#FAFAFA]">
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517]">7{siswa.kelas.charAt(1) || 'A'}</p>
                          <p className="text-xs text-[#9CA3A0]">Tahun Ajaran {siswa.kelas.startsWith("9") ? prevYear : tahunAjaran}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-[#F3F4F6] text-[#6B7769] rounded-full font-medium border border-[#E5E7EB]">Selesai</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3A0] italic">Belum ada riwayat kelas.</p>
                )}
              </section>

              {/* Log Aktivitas Data */}
              <section>
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest mb-4">Log Aktivitas Data</p>
                <div className="relative pl-4 border-l border-[#E2E8DE] space-y-6 ml-2 mt-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#3E8A2F] border-2 border-white" />
                    <p className="text-sm font-semibold text-[#1C2517]">Data diperbarui</p>
                    <p className="text-xs text-[#6B7769] mt-0.5">Oleh Admin Utama • Hari ini, 09:30</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#D1D5DB] border-2 border-white" />
                    <p className="text-sm font-semibold text-[#1C2517]">Siswa didaftarkan</p>
                    <p className="text-xs text-[#6B7769] mt-0.5">Sistem • 10 Juli 2025</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isReadOnly && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid #E2E8DE" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
              style={{ border: "1px solid #E2E8DE" }}
            >
              Batal
            </button>
            <button onClick={handleSave} className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
              {isAdding ? "Tambah Siswa" : "Simpan"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Siswa() {
  const { state } = useLocation();
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState(state?.kelasFilter || "Semua Kelas");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaRow | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit">("view");
  const [isAddingSiswa, setIsAddingSiswa] = useState(false);
  const [selectedCardSiswa, setSelectedCardSiswa] = useState<SiswaRow | null>(null);
  const [qrZoomSiswa, setQrZoomSiswa] = useState<SiswaRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [showStats, setShowStats] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [search, kelasFilter, statusFilter, sortBy]);

  const { siswaList, addSiswa, updateSiswa, deleteSiswa, bulkUpdateSiswa, bulkDeleteSiswa, graduateSiswa, tahunAjaran } = useAppContext();

  // Bulk actions state
  const [bulkAction, setBulkAction] = useState<"kelas" | "lulus" | "hapus" | null>(null);
  const [bulkKelasTarget, setBulkKelasTarget] = useState(kelasOptions.find(o => o !== "Semua Kelas")?.replace("Kelas ", "") || "8A");
  const [bulkTahunLulus, setBulkTahunLulus] = useState(tahunAjaran);

  // Initialize bulk tahun lulus when it opens
  useEffect(() => {
    if (bulkAction === "lulus") {
      setBulkTahunLulus(tahunAjaran);
    }
  }, [bulkAction, tahunAjaran]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    const result = siswaList.filter((r) => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.nis.includes(q) || r.nisn.includes(q);
      const matchKelas  = kelasFilter === "Semua Kelas" || r.kelas === kelasFilter.slice(6);
      const matchStatus = statusFilter === "Semua Status" || r.status === statusFilter;
      return matchSearch && matchKelas && matchStatus;
    });
    
    if (sortBy === "nama-asc") {
      result.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortBy === "status-spp") {
      const getSppScore = (status: string) => status === "Tunggakan" ? 0 : (status === "Belum Lunas" ? 1 : 2);
      result.sort((a, b) => getSppScore(a.statusSPP) - getSppScore(b.statusSPP));
    } else {
      if (statusFilter === "Semua Status") {
        result.sort((a, b) => {
          if (a.status === "Aktif" && b.status === "Nonaktif") return -1;
          if (a.status === "Nonaktif" && b.status === "Aktif") return 1;
          return 0;
        });
      }
    }

    return result;
  }, [search, kelasFilter, statusFilter, sortBy, siswaList]);

  const kpiData = useMemo(() => {
    const aktif = filteredRows.filter(s => s.status === "Aktif");
    return [
      { label: "Total Aktif", value: aktif.length },
      { label: "Laki-laki",   value: aktif.filter(s => s.jk === "L").length },
      { label: "Perempuan",   value: aktif.filter(s => s.jk === "P").length },
    ];
  }, [filteredRows]);


  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, kelasFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const rows = filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startIndex = filteredRows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length);

  const allChecked  = rows.length > 0 && checked.size === rows.length;
  const someChecked = checked.size > 0 && !allChecked;

  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleRow = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  const { canGraduate, canChangeClass } = useMemo(() => {
    if (checked.size === 0) return { canGraduate: false, canChangeClass: false };
    const selectedStudents = siswaList.filter(s => checked.has(s.id));
    const allActive = selectedStudents.every(s => s.status === "Aktif");
    const allGrade9 = selectedStudents.every(s => s.kelas.startsWith("9"));
    return {
      canGraduate: allActive && allGrade9,
      canChangeClass: allActive
    };
  }, [checked, siswaList]);

  const handleExecuteBulkAction = () => {
    const ids = Array.from(checked);
    if (bulkAction === "kelas") {
      bulkUpdateSiswa(ids, { kelas: bulkKelasTarget });
    } else if (bulkAction === "lulus") {
      graduateSiswa(ids, bulkTahunLulus);
    } else if (bulkAction === "hapus") {
      bulkDeleteSiswa(ids);
    }
    setChecked(new Set());
    setBulkAction(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 px-4 md:px-0">
      {/* ── Title + KPI chips ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-[#1C2517]">Siswa</h2>
          <p className="text-sm text-[#6B7769]">Data dan rekam jejak seluruh peserta didik</p>
          
          {/* Mobile Compact Stats */}
          <div className="md:hidden flex items-center gap-2 mt-3">
            <div className="flex items-center px-2.5 py-1 bg-[#F5FBF4] text-[#3E8A2F] rounded-md border border-[#3E8A2F]/20">
              <span className="text-[11px] font-semibold">Total: {kpiData[0].value}</span>
            </div>
            <div className="flex items-center px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] rounded-md border border-[#3B82F6]/20">
              <span className="text-[11px] font-semibold">Laki-laki: {kpiData[1].value}</span>
            </div>
            <div className="flex items-center px-2.5 py-1 bg-[#FDF2F8] text-[#DB2777] rounded-md border border-[#EC4899]/20">
              <span className="text-[11px] font-semibold">Perempuan: {kpiData[2].value}</span>
            </div>
          </div>
        </div>
        {/* KPI chips */}
        <div className="hidden md:flex flex-1 gap-3 overflow-x-auto pb-4 md:pb-0 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
          {kpiData.map((kpi, i) => (
            <div key={i} className="flex-1 min-w-[140px] md:min-w-0 bg-white rounded-xl shadow-sm p-4 flex flex-col justify-center" style={{ border: "1px solid #E2E8DE" }}>
              <p className="text-xs font-medium text-[#6B7769] mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#1C2517] leading-none">{kpi.value}</p>
            </div>
          ))}
          
          <button 
            onClick={() => setShowStats(true)}
            className="min-w-[140px] md:min-w-0 bg-[#F5FBF4] hover:bg-[#EDF7EC] transition-colors rounded-xl p-4 flex flex-col justify-center items-center gap-2 cursor-pointer border border-[#3E8A2F]/20"
          >
            <BarChart3 size={24} className="text-[#3E8A2F]" />
            <span className="text-xs font-semibold text-[#3E8A2F]">Lihat Statistik</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="hidden md:flex items-center gap-2">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
          style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
        >
          <Search size={13} className="text-[#9CA3A0] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama/NIS/NISN..."
            className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
          />
        </div>

        {/* Kelas filter */}
        <div className="relative">
          <select
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {["Semua Status", "Aktif", "Nonaktif"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        {/* Sort filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            <option value="default">Urutkan: Terbaru</option>
            <option value="nama-asc">Urutkan: Nama (A-Z)</option>
            <option value="status-spp">Urutkan: Status Tagihan</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Import Excel */}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Upload size={13} />
            Import Excel
          </button>
          {/* Tambah Siswa */}
          <button onClick={() => setIsAddingSiswa(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            <Plus size={13} />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* ── Mobile toolbar ── */}
      <div className="md:hidden flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl" style={{ border: "1px solid #E2E8DE", background: "#FAFBF9", padding: "0 12px", minHeight: 44 }}>
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama/NIS..."
            className="flex-1 bg-transparent outline-none text-[13px] text-[#1C2517]" />
        </div>
        <button onClick={() => setShowMobileFilter(true)}
          className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 transition-colors ${kelasFilter !== "Semua Kelas" || statusFilter !== "Semua Status" || sortBy !== "default" ? "bg-[#EDF7EC] text-[#3E8A2F] border border-[#3E8A2F]/30" : "bg-[#FAFBF9] text-[#6B7769] border border-[#E2E8DE]"}`}>
          <SlidersHorizontal size={16} />
        </button>
        <button onClick={() => setIsAddingSiswa(true)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#3E8A2F] shrink-0 text-white">
          <Plus size={16} />
        </button>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {showMobileFilter && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setShowMobileFilter(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1C2517]">Filter & Urutkan</h3>
              <button onClick={() => setShowMobileFilter(false)} className="text-[#9CA3A0] hover:text-[#1C2517]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Kelas</label>
                <div className="relative">
                  <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)} className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm text-[#1C2517] font-medium outline-none border border-[#E2E8DE] bg-[#FAFBF9]">
                    {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Status Siswa</label>
                <div className="relative">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm text-[#1C2517] font-medium outline-none border border-[#E2E8DE] bg-[#FAFBF9]">
                    {["Semua Status", "Aktif", "Nonaktif"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Urutkan Berdasarkan</label>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm text-[#1C2517] font-medium outline-none border border-[#E2E8DE] bg-[#FAFBF9]">
                    <option value="default">Terbaru</option>
                    <option value="nama-asc">Nama (A-Z)</option>
                    <option value="status-spp">Status Tagihan</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowMobileFilter(false); setShowStats(true); }} 
                className="px-4 py-3 bg-[#F5F9F4] text-[#3E8A2F] font-semibold rounded-xl hover:bg-[#EDF7EC] border border-[#3E8A2F]/20"
                title="Lihat Statistik"
              >
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setShowMobileFilter(false)} className="flex-1 py-3 bg-[#3E8A2F] text-white font-semibold rounded-xl hover:bg-[#2E6B22]">
                Terapkan Filter
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Mobile student cards ── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full bg-white rounded-xl flex items-start gap-3 animate-pulse" style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 mt-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-2 mt-2">
                  <div className="h-4 bg-gray-200 rounded w-10" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-[#9CA3A0] text-center py-8">Belum ada data siswa</p>
        ) : filteredRows.map((row) => {
          const nonaktif = row.status === "Nonaktif";
          return (
            <div key={row.id} className="relative w-full rounded-xl bg-[#F0F7EE] overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
              {/* Actions behind the card */}
              <div className="absolute inset-0 flex justify-between items-center px-6">
                <button 
                  onClick={() => { setSheetMode("edit"); setSelectedSiswa(row); }}
                  className="flex flex-col items-center justify-center gap-1 text-[#3E8A2F] font-semibold"
                >
                  <Pencil size={18} />
                  <span className="text-[10px]">Edit</span>
                </button>
                <button 
                  onClick={() => setSelectedCardSiswa(row)}
                  className="flex flex-col items-center justify-center gap-1 text-[#3E8A2F] font-semibold"
                >
                  <IdCard size={18} />
                  <span className="text-[10px]">Kartu</span>
                </button>
              </div>
              
              {/* Swipeable Card */}
              <motion.button
                drag="x"
                dragConstraints={{ left: -80, right: 80 }}
                dragElastic={0.2}
                onClick={() => setSelectedSiswa(row)}
                className="relative w-full text-left bg-white z-10 flex flex-col"
                style={{ padding: "14px 16px", touchAction: "pan-y", borderLeft: "1px solid #E2E8DE", borderRight: "1px solid #E2E8DE" }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden"
                    style={{ background: nonaktif ? "#E2E8DE" : "#3E8A2F", color: nonaktif ? "#9CA3A0" : "#FFF" }}>
                    <img src={row.jk === 'L' ? '/foto_L.png' : '/foto_P.png'} alt={row.nama} className={`w-full h-full object-cover ${nonaktif ? 'grayscale opacity-50' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1C2517] leading-tight truncate">{row.nama}</p>
                    <p className="text-[11px] text-[#6B7769]" style={{ marginTop: 2 }}>{row.nis}</p>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${KELAS_COLOR[row.kelas[0]] ?? "bg-[#F3F4F6] text-[#374040]"}`}>{row.kelas}</span>
                      <StatusBadge status={row.statusSPP} />
                      <StatusBadge status={row.status as "Aktif" | "Nonaktif"} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F7EE" }}>
                  <div>
                    <p className="text-[12px] text-[#374040]">{row.waliNama}</p>
                    <a href={`https://wa.me/62${row.waliHp.replace(/^0/, "")}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 mt-0.5 text-[#3E8A2F] hover:underline">
                      <MessageCircle size={10} />
                      <span className="text-[11px] tabular-nums">{row.waliHp}</span>
                    </a>
                  </div>
                  <span className="text-[12px] font-semibold text-[#3E8A2F]">Detail →</span>
                </div>
              </motion.button>
            </div>
          );
        })}
        <div className="flex items-center justify-center py-4">
          <span className="text-[12px] text-[#6B7769]">Menampilkan semua <strong className="text-[#1C2517]">{filteredRows.length}</strong> siswa</span>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="hidden md:block bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <th className="w-10 pl-6 pr-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                </th>
                <Th className="pr-4">Siswa</Th>
                <Th className="pr-4">Kelas</Th>
                <Th className="pr-4">L/P</Th>
                <Th className="pr-4">Wali</Th>
                <Th className="pr-4">Status Tagihan</Th>
                <Th className="pr-4">Status</Th>
                <th className="py-3 pr-6 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse" style={{ borderBottom: i < ITEMS_PER_PAGE - 1 ? "1px solid #F0F7EE" : "none" }}>
                    <td className="pl-6 pr-3 py-3.5"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                    <td className="py-3.5 pr-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex flex-col gap-1.5 w-full max-w-[120px]"><div className="h-3.5 bg-gray-200 rounded w-full" /><div className="h-2.5 bg-gray-200 rounded w-2/3" /></div>
                    </td>
                    <td className="py-3.5 pr-4"><div className="h-5 bg-gray-200 rounded-full w-12" /></td>
                    <td className="py-3.5 pr-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="py-3.5 pr-4"><div className="flex flex-col gap-1.5"><div className="h-3.5 bg-gray-200 rounded w-24" /><div className="h-2.5 bg-gray-200 rounded w-16" /></div></td>
                    <td className="py-3.5 pr-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                    <td className="py-3.5 pr-4"><div className="h-5 bg-gray-200 rounded-full w-12" /></td>
                    <td className="py-3.5 pr-6"><div className="h-8 bg-gray-200 rounded-lg w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : rows.map((row, i) => {
                const isChecked = checked.has(row.id);
                const nonaktif  = row.status === "Nonaktif";
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                    style={{
                      borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none",
                      background: isChecked ? "#F5FBF4" : undefined,
                    }}
                    onClick={() => setSelectedSiswa(row)}
                  >
                    {/* Checkbox */}
                    <td className="pl-6 pr-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isChecked} onChange={() => toggleRow(row.id)} />
                    </td>

                    {/* Siswa */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden"
                          style={{
                            background: nonaktif ? "#E2E8DE" : "#3E8A2F",
                            color:      nonaktif ? "#9CA3A0" : "#FFFFFF",
                          }}
                        >
                          <img src={(row as any).foto || (row.jk === 'L' ? '/foto_L.png' : '/foto_P.png')} alt={row.nama} className={`w-full h-full object-cover ${nonaktif ? 'grayscale opacity-60' : ''}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-none ${nonaktif ? "text-[#6B7769]" : "text-[#1C2517]"}`}>
                            {row.nama}
                          </p>
                          <p className="text-[11px] text-[#9CA3A0] mt-0.5">
                            {row.nis} · {row.nisn}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3.5 pr-4">
                      <KelasBadge kelas={row.kelas} />
                    </td>

                    {/* L/P */}
                    <td className="py-3.5 pr-4 text-sm text-[#374040]">
                      {row.jk === "L" ? "Laki-laki" : "Perempuan"}
                    </td>

                    {/* Wali */}
                    <td className="py-3.5 pr-4">
                      <p className="text-sm font-medium text-[#1C2517] leading-none">{row.waliNama}</p>
                      <p className="text-[11px] text-[#9CA3A0] mt-0.5 tabular-nums">{row.waliHp}</p>
                    </td>

                    {/* Status Tagihan */}
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={row.statusSPP} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      <StatusDot status={row.status} />
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                      <RowMenu 
                        isActive={!nonaktif}
                        waNumber={row.waliHp}
                        onView={() => { setSheetMode("view"); setSelectedSiswa(row); }} 
                        onEdit={() => { setSheetMode("edit"); setSelectedSiswa(row); }} 
                        onShowCard={() => setSelectedCardSiswa(row)}
                        onToggleStatus={() => {
                          const newStatus = nonaktif ? "Aktif" : "Nonaktif";
                          updateSiswa(row.id, { status: newStatus });
                          toast.success(`Status ${row.nama} berhasil diubah menjadi ${newStatus}`);
                        }} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{ borderTop: "1px solid #E2E8DE" }}
        >
          <span className="text-xs text-[#6B7769]">
            {startIndex}–{endIndex} dari <span className="font-semibold text-[#1C2517]">{filteredRows.length}</span> siswa
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
            
            {getVisiblePages(currentPage, totalPages).map((p, idx) => (
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-[#9CA3A0]">...</span>
              ) : (
                <button 
                  key={p} 
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === p ? "bg-[#3E8A2F] text-white" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
                >
                  {p}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === totalPages || totalPages === 0 ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail sheet ── */}
      {(selectedSiswa || isAddingSiswa) && (
        <StudentSheet
          key={selectedSiswa ? selectedSiswa.id : "new"}
          siswa={selectedSiswa}
          isAdding={isAddingSiswa}
          isReadOnly={sheetMode === "view" && !isAddingSiswa}
          onClose={() => { setSelectedSiswa(null); setIsAddingSiswa(false); }}
          onShowCard={() => { if (selectedSiswa) setSelectedCardSiswa(selectedSiswa); }}
          onSave={(form) => {
            if (isAddingSiswa) {
              const newSiswa: SiswaRow = {
                id: Date.now(),
                statusSPP: "Lunas",
                ...form,
                inits: form.nama.substring(0, 2).toUpperCase(),
              };
              addSiswa(newSiswa);
            } else if (selectedSiswa) {
              updateSiswa(selectedSiswa.id, {
                ...form,
                inits: form.nama.substring(0, 2).toUpperCase(),
              });
            }
            setSelectedSiswa(null);
            setIsAddingSiswa(false);
          }}
        />
      )}

      {/* ── Mobile Modal (Kartu Digital) ── */}
      {selectedCardSiswa && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center overflow-hidden" onClick={() => setSelectedCardSiswa(null)}>
          <button 
            onClick={() => setSelectedCardSiswa(null)}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <KartuPelajar 
              key={`modal-${selectedCardSiswa.id}`}
              siswa={selectedCardSiswa} 
              isModal={true} 
              onZoom={(s: any) => setQrZoomSiswa(s)}
            />
          </div>
        </div>
      )}

      {/* ── QR Zoom Modal ── */}
      {qrZoomSiswa && (
        <div 
          className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-6"
          onClick={() => setQrZoomSiswa(null)}
        >
          <div 
            className="bg-white p-6 rounded-2xl flex flex-col items-center max-w-sm w-full relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setQrZoomSiswa(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F9F4] flex items-center justify-center text-[#6B7769] hover:bg-[#E2E8DE] transition-colors"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-[#1C2517] font-bold mb-5 text-center text-lg leading-tight">
              Scan QR Code
              <br/>
              <span className="text-sm font-normal text-[#6B7769]">{qrZoomSiswa.nama}</span>
            </h3>
            
            <div className="p-3 border-2 border-[#E2E8DE] rounded-xl bg-white shadow-sm mb-6">
              <QRCode
                value={`MADRASAH AL-ITTIHAD|${qrZoomSiswa.nis}|${qrZoomSiswa.nama}`}
                size={220}
                level="M"
              />
            </div>
            
            <button 
              onClick={() => setQrZoomSiswa(null)}
              className="w-full py-2.5 bg-[#3E8A2F] text-white font-semibold rounded-xl hover:bg-[#2E6B22] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── Mini Chart Modal ── */}
      {showStats && (
        <div 
          className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowStats(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ border: "1px solid #E2E8DE" }}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E2E8DE" }}>
              <h2 className="text-lg font-bold text-[#1C2517]">Statistik Siswa</h2>
              <button onClick={() => setShowStats(false)} className="w-8 h-8 rounded-full bg-[#F5F9F4] flex items-center justify-center text-[#3E8A2F] hover:bg-[#E2E8DE] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-semibold text-[#374040] mb-4 text-center">Komposisi Gender Siswa Aktif</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Laki-laki", value: kpiData[1].value, color: "#3B82F6" },
                        { name: "Perempuan", value: kpiData[2].value, color: "#EC4899" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Laki-laki", value: kpiData[1].value, color: "#3B82F6" },
                        { name: "Perempuan", value: kpiData[2].value, color: "#EC4899" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} Siswa`, "Total"]}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                  <span className="text-xs text-[#374040] font-medium">Laki-laki ({kpiData[1].value})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EC4899]" />
                  <span className="text-xs text-[#374040] font-medium">Perempuan ({kpiData[2].value})</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-[#FAFBF9] flex justify-end" style={{ borderTop: "1px solid #E2E8DE" }}>
              <button onClick={() => setShowStats(false)} className="px-5 py-2 rounded-xl bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Actions Floating Bar ── */}
      {checked.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#1C2517] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center gap-3 pr-6 border-r border-white/20">
              <div className="w-6 h-6 rounded-md bg-[#3E8A2F] flex items-center justify-center text-xs font-bold tabular-nums">
                {checked.size}
              </div>
              <span className="text-sm font-medium">siswa dipilih</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setBulkAction("kelas")} 
                disabled={!canChangeClass}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!canChangeClass ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"}`}
                title={!canChangeClass ? "Siswa nonaktif tidak dapat diubah kelasnya" : ""}
              >
                <ArrowRightLeft size={16} /> Ubah Kelas
              </button>
              <button 
                onClick={() => setBulkAction("lulus")} 
                disabled={!canGraduate}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!canGraduate ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"}`}
                title={!canGraduate ? "Hanya siswa aktif kelas 9 yang dapat diluluskan" : ""}
              >
                <GraduationCap size={16} /> Luluskan
              </button>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button onClick={() => setBulkAction("hapus")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 size={16} /> Hapus
              </button>
              
              <div className="w-px h-6 bg-white/20 ml-2 mr-1"></div>
              <button 
                onClick={() => setChecked(new Set())} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9CA3A0] hover:text-white hover:bg-white/10 transition-colors"
                title="Batal / Tutup"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Action Modals ── */}
      {bulkAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setBulkAction(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setBulkAction(null)} className="absolute top-4 right-4 text-[#9CA3A0] hover:text-[#1C2517] transition-colors"><X size={20} /></button>
            
            {bulkAction === "kelas" && (
              <>
                <h3 className="text-lg font-bold text-[#1C2517] mb-2 flex items-center gap-2"><ArrowRightLeft size={20} className="text-[#3E8A2F]"/> Ubah Kelas Massal</h3>
                <p className="text-sm text-[#6B7769] mb-5">Pindahkan {checked.size} siswa terpilih ke kelas baru.</p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7769] mb-1">Pilih Kelas Tujuan</label>
                    <div className="relative">
                      <select value={bulkKelasTarget} onChange={(e) => setBulkKelasTarget(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-lg text-sm text-[#1C2517] font-medium outline-none bg-[#F5F9F4] border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors">
                        {kelasOptions.filter(o => o !== "Semua Kelas").map(o => <option key={o} value={o.replace("Kelas ", "")}>{o.replace("Kelas ", "")}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <button onClick={handleExecuteBulkAction} className="w-full py-2.5 bg-[#3E8A2F] text-white font-semibold rounded-xl hover:bg-[#2E6B22] transition-colors shadow-sm">
                  Simpan Perubahan
                </button>
              </>
            )}

            {bulkAction === "lulus" && (
              <>
                <h3 className="text-lg font-bold text-[#1C2517] mb-2 flex items-center gap-2"><GraduationCap size={20} className="text-[#3E8A2F]"/> Luluskan Siswa</h3>
                <p className="text-sm text-[#6B7769] mb-5">{checked.size} siswa terpilih akan dipindahkan ke data Alumni.</p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7769] mb-1">Tahun Lulus</label>
                    <input type="text" value={bulkTahunLulus} onChange={e => setBulkTahunLulus(e.target.value)} className="w-full px-4 py-2.5 rounded-lg text-sm text-[#1C2517] font-medium outline-none bg-[#F5F9F4] border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors" />
                  </div>
                </div>
                <button onClick={handleExecuteBulkAction} className="w-full py-2.5 bg-[#3E8A2F] text-white font-semibold rounded-xl hover:bg-[#2E6B22] transition-colors shadow-sm">
                  Proses Kelulusan
                </button>
              </>
            )}

            {bulkAction === "hapus" && (
              <>
                <h3 className="text-lg font-bold text-[#DC2626] mb-2 flex items-center gap-2"><Trash2 size={20}/> Hapus Data</h3>
                <p className="text-sm text-[#6B7769] mb-6">Apakah Anda yakin ingin menghapus {checked.size} siswa terpilih? Data tidak dapat dipulihkan.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setBulkAction(null)} className="flex-1 py-2.5 font-semibold text-[#374040] hover:bg-[#F5F9F4] rounded-xl transition-colors">Batal</button>
                  <button onClick={handleExecuteBulkAction} className="flex-1 py-2.5 bg-[#DC2626] text-white font-semibold rounded-xl hover:bg-[#B91C1C] transition-colors shadow-sm">Hapus</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
