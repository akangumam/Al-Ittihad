import { useState, useRef } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, CheckCircle2, Archive, Clock } from "lucide-react";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";


// ─── shared helpers ───────────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, required = false, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string;
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

function FloatingTextarea({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div
      className="relative rounded-lg transition-colors"
      style={{ border: raised && focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE" }}
    >
      <label className={`absolute left-3 pointer-events-none transition-all duration-150 ${raised ? "top-1.5 text-[10px] text-[#6B7769]" : "top-4 text-sm text-[#9CA3A0]"}`}>
        {label}
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

// shadcn Switch anatomy
function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 42, height: 24,
        background: checked ? "#3E8A2F" : "#D1D5DB",
        padding: 3,
      }}
    >
      <span
        className="pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          width: 18, height: 18,
          transform: checked ? "translateX(18px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({
  title, children, onSave,
}: {
  title: string; children: React.ReactNode; onSave?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border:"1px solid #E2E8DE" }}>
      <div className="px-5 py-4 shrink-0" style={{ borderBottom:"1px solid #E2E8DE" }}>
        <p className="font-semibold text-[#1C2517]">{title}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
      {onSave !== undefined && (
        <div
          className="px-5 py-3.5 flex items-center justify-end shrink-0"
          style={{ borderTop:"1px solid #E2E8DE", background:"#FAFBF9" }}
        >
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
          >
            Simpan
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tahun Ajaran card ────────────────────────────────────────────────────────

const TA_STATUS_STYLE: Record<string, string> = {
  Aktif:  "bg-[#DCFCE7] text-[#166534]",
  Arsip:  "bg-[#F3F4F6] text-[#6B7769]",
  Draft:  "bg-[#F1F5F9] text-[#64748B]",
};

const TA_ROWS = [
  { year:"2024/2025", status:"Arsip" },
  { year:"2025/2026", status:"Aktif" },
  { year:"2026/2027", status:"Draft" },
];

function TARowMenu({ status }: { status: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3A0] hover:bg-[#F5F9F4] hover:text-[#374040] transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 w-44 bg-white rounded-xl py-1"
            style={{ border:"1px solid #E2E8DE", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}
          >
            {status !== "Aktif" && (
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
                <CheckCircle2 size={13} className="text-[#6B7769]" /> Jadikan Aktif
              </button>
            )}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <Pencil size={13} className="text-[#6B7769]" /> Edit
            </button>
            {status === "Aktif" && (
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
                <Archive size={13} className="text-[#6B7769]" /> Arsipkan
              </button>
            )}
            {status !== "Aktif" && (
              <>
                <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
                  <Trash2 size={13} /> Hapus
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TahunAjaranCard() {
  return (
    <Card title="Tahun Ajaran">
      {/* Rows */}
      <div className="mb-4 rounded-lg overflow-hidden" style={{ border:"1px solid #E2E8DE" }}>
        {TA_ROWS.map((row, i) => (
          <div
            key={row.year}
            className="flex items-center justify-between px-4 py-3 hover:bg-[#FAFBF9] transition-colors"
            style={{ borderBottom: i < TA_ROWS.length - 1 ? "1px solid #F0F7EE" : "none" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1C2517]">{row.year}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TA_STATUS_STYLE[row.status]}`}>
                {row.status}
              </span>
            </div>
            <TARowMenu status={row.status} />
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
        style={{ border:"1px solid #E2E8DE" }}
      >
        <Plus size={13} /> Tambah Tahun Ajaran
      </button>

      {/* Caption */}
      <p className="text-xs text-[#9CA3A0] mt-4">
        Tahun ajaran aktif menjadi konteks default seluruh data di sistem.
      </p>
    </Card>
  );
}



function AkademikCard() {
  const [kapasitas, setKapasitas] = useState("32");
  const [jamMasuk,  setJamMasuk]  = useState("07.00");

  return (
    <Card title="Akademik" onSave={() => {}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FloatingInput
          label="Kapasitas maksimal per kelas"
          value={kapasitas}
          onChange={setKapasitas}
          type="number"
        />
        <FloatingInput
          label="Jam masuk guru"
          value={jamMasuk}
          onChange={setJamMasuk}
        />
      </div>
      <p className="text-xs text-[#9CA3A0]">
        Digunakan untuk perhitungan <span className="font-medium text-[#374040]">Terlambat</span> pada modul Absensi.
      </p>
    </Card>
  );
}

// ─── Keuangan card ────────────────────────────────────────────────────────────

function KeuanganCard() {
  const [format, setFormat]   = useState("KW/{TAHUN}/{BULAN}/{URUT}");
  const [kirimWA, setKirimWA] = useState(true);

  return (
    <Card title="Keuangan" onSave={() => {}}>
      <div className="space-y-4">
        {/* Format input */}
        <div>
          <FloatingInput
            label="Format nomor kuitansi"
            value={format}
            onChange={setFormat}
          />
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-xs text-[#9CA3A0]">Contoh:</span>
            <code className="text-xs font-mono text-[#3E8A2F] bg-[#F0FDF4] px-2 py-0.5 rounded">
              KW/2026/07/0143
            </code>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F0F7EE]" />

        {/* WhatsApp switch */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-[#1C2517] font-medium">Kirim kuitansi via WhatsApp setelah pembayaran</p>
            <p className="text-xs text-[#9CA3A0] mt-0.5">
              Kuitansi PDF dikirim otomatis ke nomor HP wali siswa
            </p>
          </div>
          <Switch checked={kirimWA} onChange={() => setKirimWA((v) => !v)} />
        </div>
      </div>
    </Card>
  );
}

// ─── Identitas Madrasah card ──────────────────────────────────────────────────

function IdentitasCard() {
  const [nama,   setNama]   = useState("MTs Al-Ittihad Pedaleman");
  const [alamat, setAlamat] = useState("Jl. Pedaleman No. 1, Babakan, Kota Cirebon, Jawa Barat 45121");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card title="Identitas Madrasah" onSave={() => {}}>
      <div className="space-y-4">
        {/* Logo section */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
            style={{ border:"1px solid #E2E8DE" }}
          >
            <img
              src={logoEmblem}
              alt="Logo MTs Al-Ittihad"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
              style={{ border:"1px solid #E2E8DE" }}
            >
              Ganti Logo
            </button>
            <p className="text-[11px] text-[#9CA3A0] mt-1.5">PNG atau SVG, maks. 512 KB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Fields */}
        <FloatingInput
          label="Nama Madrasah"
          value={nama}
          onChange={setNama}
          required
        />
        <FloatingTextarea
          label="Alamat"
          value={alamat}
          onChange={setAlamat}
        />

        {/* Caption */}
        <p className="text-xs text-[#9CA3A0]">
          Ditampilkan pada kop kuitansi dan laporan PDF yang diterbitkan sistem.
        </p>
      </div>
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Pengaturan() {
  return (
    <div className="space-y-5" style={{ maxWidth: 720 }}>
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Pengaturan</h2>
        <p className="text-sm text-[#6B7769]">Konfigurasi sistem, identitas, dan preferensi madrasah</p>
      </div>

      <TahunAjaranCard />
      <AkademikCard />
      <KeuanganCard />
      <IdentitasCard />
    </div>
  );
}
