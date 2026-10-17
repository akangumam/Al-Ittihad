import { useState, useRef } from "react";
import { Plus, MoreHorizontal, Trash2, CheckCircle2, Archive } from "lucide-react";
import { toast } from "sonner";
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

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
      style={{ width: 42, height: 24, background: checked ? "#3E8A2F" : "#D1D5DB", padding: 3 }}
    >
      <span
        className="pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ width: 18, height: 18, transform: checked ? "translateX(18px)" : "translateX(0)" }}
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

type TARow = { year: string; status: "Aktif" | "Arsip" | "Draft" };

const DEFAULT_TA_ROWS: TARow[] = [
  { year: "2024/2025", status: "Arsip" },
  { year: "2025/2026", status: "Aktif" },
  { year: "2026/2027", status: "Draft" },
];

function TARowMenu({ row, onJadikanAktif, onHapus }: { row: TARow; onJadikanAktif: () => void; onHapus: () => void }) {
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
            {row.status !== "Aktif" && (
              <button
                onClick={() => { setOpen(false); onJadikanAktif(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
              >
                <CheckCircle2 size={13} className="text-[#6B7769]" /> Jadikan Aktif
              </button>
            )}
            {row.status === "Aktif" && (
              <button
                onClick={() => { setOpen(false); toast.info("Aktifkan tahun ajaran lain untuk mengarsipkan ini"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
              >
                <Archive size={13} className="text-[#6B7769]" /> Arsipkan
              </button>
            )}
            {row.status !== "Aktif" && (
              <>
                <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
                <button
                  onClick={() => { setOpen(false); onHapus(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                >
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
  const { appSettings, setAppSettings } = useAppContext();
  // Rows persisted in appSettings — never hardcoded local-only state
  const rows: TARow[] = appSettings.tahunAjaranRows ?? DEFAULT_TA_ROWS;
  const [showAdd, setShowAdd] = useState(false);
  const [newYear, setNewYear] = useState("");

  function saveRows(newRows: TARow[], activeYear?: string) {
    setAppSettings(s => ({
      ...s,
      tahunAjaranRows: newRows,
      ...(activeYear !== undefined ? { tahunAjaran: activeYear } : {}),
    }));
  }

  function jadikanAktif(year: string) {
    const newRows = rows.map(r => ({
      ...r,
      status: r.year === year ? "Aktif" : r.status === "Aktif" ? "Arsip" : r.status,
    })) as TARow[];
    saveRows(newRows, year);
    toast.success(`Tahun ajaran ${year} kini aktif`);
  }

  function hapus(year: string) {
    saveRows(rows.filter(r => r.year !== year));
    toast.success(`Tahun ajaran ${year} dihapus`);
  }

  function tambah() {
    const trimmed = newYear.trim();
    if (!trimmed || !/^\d{4}\/\d{4}$/.test(trimmed)) {
      toast.error("Format tahun ajaran: YYYY/YYYY, contoh 2027/2028");
      return;
    }
    if (rows.find(r => r.year === trimmed)) {
      toast.error("Tahun ajaran sudah ada");
      return;
    }
    saveRows([...rows, { year: trimmed, status: "Draft" }]);
    setNewYear("");
    setShowAdd(false);
    toast.success(`Tahun ajaran ${trimmed} ditambahkan sebagai Draft`);
  }

  return (
    <Card title="Tahun Ajaran">
      <div className="mb-4 rounded-lg overflow-hidden" style={{ border:"1px solid #E2E8DE" }}>
        {rows.map((row, i) => (
          <div
            key={row.year}
            className="flex items-center justify-between px-4 py-3 hover:bg-[#FAFBF9] transition-colors"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1C2517]">{row.year}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TA_STATUS_STYLE[row.status]}`}>
                {row.status}
              </span>
            </div>
            <TARowMenu row={row} onJadikanAktif={() => jadikanAktif(row.year)} onHapus={() => hapus(row.year)} />
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="flex items-center gap-2 mb-3">
          <input
            autoFocus
            type="text"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") tambah(); if (e.key === "Escape") setShowAdd(false); }}
            placeholder="2027/2028"
            className="flex-1 px-3 py-2 rounded-lg text-sm text-[#1C2517] outline-none focus:ring-2 focus:ring-[#3E8A2F]/30"
            style={{ border:"1px solid #E2E8DE" }}
          />
          <button onClick={tambah} className="px-3 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">Tambah</button>
          <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-[#6B7769] hover:bg-[#F5F9F4] transition-colors" style={{ border:"1px solid #E2E8DE" }}>Batal</button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:text-[#3E8A2F] hover:border-[#3E8A2F] transition-colors"
          style={{ border:"1px solid #E2E8DE" }}
        >
          <Plus size={13} /> Tambah Tahun Ajaran
        </button>
      )}

      <p className="text-xs text-[#9CA3A0] mt-4">
        Tahun ajaran aktif menjadi konteks default seluruh data di sistem.
      </p>
    </Card>
  );
}

// ─── Akademik card ────────────────────────────────────────────────────────────

function AkademikCard() {
  const { appSettings, setAppSettings } = useAppContext();
  // Lazy init reads correct values from appSettings (already loaded from localStorage)
  const [kapasitas, setKapasitas] = useState(String(appSettings.kapasitasKelas ?? 32));
  const [jamMasuk, setJamMasuk]   = useState(appSettings.jamMasukGuru ?? "07:00");

  function save() {
    const kap = Number(kapasitas);
    if (!kap || kap < 1 || kap > 100) { toast.error("Kapasitas harus antara 1–100"); return; }
    if (!/^\d{2}:\d{2}$/.test(jamMasuk)) { toast.error("Format jam masuk: HH:MM, contoh 07:00"); return; }
    setAppSettings(s => ({ ...s, kapasitasKelas: kap, jamMasukGuru: jamMasuk }));
    toast.success("Pengaturan akademik disimpan");
  }

  return (
    <Card title="Akademik" onSave={save}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FloatingInput
          label="Kapasitas maksimal per kelas"
          value={kapasitas}
          onChange={setKapasitas}
          type="number"
        />
        <FloatingInput
          label="Jam masuk guru (HH:MM)"
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
  const { appSettings, setAppSettings } = useAppContext();
  const [format, setFormat]   = useState(appSettings.formatKuitansi ?? "KW/{TAHUN}/{BULAN}/{URUT}");
  const [kirimWA, setKirimWA] = useState(appSettings.kirimWA ?? true);

  function save() {
    if (!format.trim()) { toast.error("Format kuitansi tidak boleh kosong"); return; }
    setAppSettings(s => ({ ...s, formatKuitansi: format.trim(), kirimWA }));
    toast.success("Pengaturan keuangan disimpan");
  }

  const preview = format
    .replace("{TAHUN}", "2026")
    .replace("{BULAN}", "07")
    .replace("{URUT}", "0143");

  return (
    <Card title="Keuangan" onSave={save}>
      <div className="space-y-4">
        <div>
          <FloatingInput
            label="Format nomor kuitansi"
            value={format}
            onChange={setFormat}
          />
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-xs text-[#9CA3A0]">Contoh:</span>
            <code className="text-xs font-mono text-[#3E8A2F] bg-[#F0FDF4] px-2 py-0.5 rounded">
              {preview}
            </code>
          </div>
        </div>

        <div className="h-px bg-[#F0F7EE]" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-[#1C2517] font-medium">Kirim kuitansi via WhatsApp setelah pembayaran</p>
            <p className="text-xs text-[#9CA3A0] mt-0.5">
              Ringkasan kuitansi dikirim ke nomor HP wali siswa
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
  const { appSettings, setAppSettings } = useAppContext();
  const [nama,   setNama]   = useState(appSettings.namaMadrasah   ?? "");
  const [alamat, setAlamat] = useState(appSettings.alamatMadrasah ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function save() {
    if (!nama.trim()) { toast.error("Nama madrasah wajib diisi"); return; }
    setAppSettings(s => ({ ...s, namaMadrasah: nama.trim(), alamatMadrasah: alamat.trim() }));
    toast.success("Identitas madrasah disimpan");
  }

  return (
    <Card title="Identitas Madrasah" onSave={save}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
            style={{ border:"1px solid #E2E8DE" }}
          >
            <img src={logoEmblem} alt="Logo MTs Al-Ittihad" className="w-12 h-12 object-contain" />
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={() => toast.info("Upload logo akan tersedia segera")} />
          </div>
        </div>

        <FloatingInput label="Nama Madrasah" value={nama} onChange={setNama} required />
        <FloatingTextarea label="Alamat" value={alamat} onChange={setAlamat} />

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
