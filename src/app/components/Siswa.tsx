import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Upload, MoreHorizontal, X, Eye, Pencil,
  MessageCircle, Trash2, Check, FileText, IdCard, ZoomIn,
  GraduationCap, ArrowRightLeft, CheckCircle2
} from "lucide-react";
import QRCode from "react-qr-code";
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
          const menuHeight = 160; 
          
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
        </>
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
      alert("Harap lengkapi semua kolom yang wajib diisi!");
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
                        <p className="text-xs text-[#6B7769]">Tahun Ajaran 2026/2027</p>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-[#3E8A2F] text-white rounded-full font-medium">Kelas Saat Ini</span>
                    </div>
                    {siswa.kelas.startsWith("9") ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8DE] bg-[#FAFAFA]">
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517]">8{siswa.kelas.charAt(1) || 'A'}</p>
                          <p className="text-xs text-[#9CA3A0]">Tahun Ajaran 2025/2026</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-[#F3F4F6] text-[#6B7769] rounded-full font-medium border border-[#E5E7EB]">Selesai</span>
                      </div>
                    ) : null}
                    {siswa.kelas.startsWith("8") || siswa.kelas.startsWith("9") ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8DE] bg-[#FAFAFA]">
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517]">7{siswa.kelas.charAt(1) || 'A'}</p>
                          <p className="text-xs text-[#9CA3A0]">Tahun Ajaran {siswa.kelas.startsWith("9") ? "2024/2025" : "2025/2026"}</p>
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
  const ITEMS_PER_PAGE = 10;

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

  const kpiData = useMemo(() => {
    const aktif = siswaList.filter(s => s.status === "Aktif");
    return [
      { label: "Total Aktif", value: aktif.length },
      { label: "Laki-laki",   value: aktif.filter(s => s.jk === "L").length },
      { label: "Perempuan",   value: aktif.filter(s => s.jk === "P").length },
    ];
  }, [siswaList]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return siswaList.filter((r) => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.nis.includes(q) || r.nisn.includes(q);
      const matchKelas  = kelasFilter === "Semua Kelas" || r.kelas === kelasFilter.slice(6);
      const matchStatus = statusFilter === "Semua Status" || r.status === statusFilter;
      return matchSearch && matchKelas && matchStatus;
    });
  }, [search, kelasFilter, statusFilter, siswaList]);

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
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* ── Title + KPI chips ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-[#1C2517]">Siswa</h2>
          <p className="text-sm text-[#6B7769]">Data dan rekam jejak seluruh peserta didik</p>
        </div>
        {/* KPI chips */}
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
            placeholder="Cari nama / NIS / NISN..."
            className="flex-1 bg-transparent outline-none text-[13px] text-[#1C2517]" />
        </div>
        <button onClick={() => setIsAddingSiswa(true)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#3E8A2F] shrink-0">
          <Plus size={16} color="#FFF" />
        </button>
      </div>

      {/* ── Mobile student cards ── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {rows.length === 0 ? (
          <p className="text-sm text-[#9CA3A0] text-center py-8">Belum ada data siswa</p>
        ) : rows.map((row) => {
          const nonaktif = row.status === "Nonaktif";
          return (
            <button key={row.id} onClick={() => setSelectedSiswa(row)} className="w-full text-left bg-white rounded-xl"
              style={{ border: "1px solid #E2E8DE", padding: "14px 16px" }}>
              <div className="flex items-start gap-3">
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
              <div className="flex items-center justify-between" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F7EE" }}>
                <div>
                  <p className="text-[12px] text-[#374040]">{row.waliNama}</p>
                  <p className="text-[11px] text-[#9CA3A0] tabular-nums">{row.waliHp}</p>
                </div>
                <span className="text-[12px] font-semibold text-[#3E8A2F]">Detail →</span>
              </div>
            </button>
          );
        })}
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-[#6B7769]">{startIndex}–{endIndex} dari <strong className="text-[#1C2517]">{filteredRows.length}</strong> siswa</span>
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
              {rows.map((row, i) => {
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
                        onToggleStatus={() => updateSiswa(row.id, { status: nonaktif ? "Aktif" : "Nonaktif" })} 
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
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === p ? "bg-[#3E8A2F] text-white" : "text-[#374040] hover:bg-[#EDF7EC]"}`}
              >
                {p}
              </button>
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
              <button onClick={() => setBulkAction("kelas")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                <ArrowRightLeft size={16} /> Ubah Kelas
              </button>
              <button onClick={() => setBulkAction("lulus")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                <GraduationCap size={16} /> Luluskan
              </button>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button onClick={() => setBulkAction("hapus")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 size={16} /> Hapus
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
