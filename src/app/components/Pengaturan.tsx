import { useState, useRef } from "react";
import { Plus, MoreHorizontal, Trash2, CheckCircle2, Archive, MessageCircle, Loader2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";
import { useWAQueue } from "@/hooks/useWAQueue";
import { WA_TEMPLATE_DEFAULTS, WA_TEMPLATE_LABELS, WA_TEMPLATE_VARS, type WATemplateKey } from "@/lib/waTemplates";
import type { WATemplates } from "@/types";


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
  { year: "2025/2026", status: "Aktif" },
  { year: "2024/2025", status: "Arsip" },
  { year: "2023/2024", status: "Arsip" },
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
  const [kapasitas, setKapasitas]         = useState(String(appSettings.kapasitasKelas ?? 32));
  const [jamMasuk, setJamMasuk]           = useState(appSettings.jamMasukGuru ?? "07:00");
  const [jamMasukSiswa, setJamMasukSiswa] = useState(appSettings.jamMasukSiswa ?? "07:00");

  function save() {
    const kap = Number(kapasitas);
    if (!kap || kap < 1 || kap > 100) { toast.error("Kapasitas harus antara 1–100"); return; }
    if (!/^\d{2}:\d{2}$/.test(jamMasuk)) { toast.error("Format jam masuk guru: HH:MM, contoh 07:00"); return; }
    if (!/^\d{2}:\d{2}$/.test(jamMasukSiswa)) { toast.error("Format jam masuk siswa: HH:MM, contoh 07:00"); return; }
    setAppSettings(s => ({ ...s, kapasitasKelas: kap, jamMasukGuru: jamMasuk, jamMasukSiswa }));
    toast.success("Pengaturan akademik disimpan");
  }

  return (
    <Card title="Akademik" onSave={save}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        <FloatingInput
          label="Jam masuk siswa (HH:MM)"
          value={jamMasukSiswa}
          onChange={setJamMasukSiswa}
        />
      </div>
      <p className="text-xs text-[#9CA3A0]">
        Digunakan untuk perhitungan <span className="font-medium text-[#374040]">Terlambat</span> pada presensi QR dan modul Absensi Guru & Siswa.
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

// ─── WAHA card ────────────────────────────────────────────────────────────────

function WAHACard() {
  const { appSettings, setAppSettings } = useAppContext();
  const { enqueue } = useWAQueue();

  const [url,     setUrl]     = useState(appSettings.wahaUrl     ?? "");
  const [apiKey,  setApiKey]  = useState(appSettings.wahaApiKey  ?? "");
  const [session, setSession] = useState(appSettings.wahaSession ?? "alittihad");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  const enabled = appSettings.wahaEnabled ?? false;

  function handleToggle() {
    setAppSettings(s => ({ ...s, wahaEnabled: !s.wahaEnabled }));
    toast.success(!enabled ? "Notifikasi WhatsApp diaktifkan" : "Notifikasi WhatsApp dinonaktifkan");
  }

  function handleSave() {
    if (url && !url.startsWith("http")) {
      toast.error("URL harus diawali https://");
      return;
    }
    setAppSettings(s => ({
      ...s,
      wahaUrl:     url.trim(),
      wahaApiKey:  apiKey.trim(),
      wahaSession: session.trim() || "alittihad",
    }));
    toast.success("Konfigurasi WAHA disimpan");
  }

  async function handleTest() {
    if (!testPhone.trim()) { toast.error("Masukkan nomor tujuan test"); return; }
    setTesting(true);
    const result = await enqueue({
      phone:         testPhone.trim(),
      nama_penerima: "Test",
      pesan:         `✅ *Test Notifikasi WAHA*\n\nKoneksi ke MTs Al-Ittihad berhasil!\nWaktu: ${new Date().toLocaleString("id-ID")}`,
      jenis:         "custom",
      priority:      1,
    });
    setTesting(false);
    if (result.ok) {
      toast.success("Pesan test masuk ke antrian — akan terkirim dalam ±1 menit");
    } else {
      toast.error(`Gagal: ${result.error}`);
    }
  }

  return (
    <Card title="Notifikasi WhatsApp (WAHA)" onSave={handleSave}>
      <div className="space-y-4">
        {/* Toggle aktif */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1C2517]">Aktifkan notifikasi otomatis</p>
            <p className="text-xs text-[#6B7769]">Kirim pesan WA untuk absensi, tagihan, dan pembayaran</p>
          </div>
          <Switch checked={enabled} onChange={handleToggle} />
        </div>

        {/* Banner info queue */}
        <div className="rounded-lg px-4 py-3 flex gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <MessageCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#16A34A" }} />
          <p className="text-xs" style={{ color: "#15803D" }}>
            Pesan tidak dikirim langsung — masuk ke <strong>antrian</strong> dan diproses maks. 5 pesan/menit
            (06.00–21.00 WIB) untuk menghindari pemblokiran oleh Meta.
          </p>
        </div>

        <div className="grid gap-3" style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? "auto" : "none" }}>
          <FloatingInput
            label="WAHA URL"
            value={url}
            onChange={setUrl}
            required
          />

          {/* API Key dengan toggle show/hide */}
          <div className="relative">
            <FloatingInput
              label="API Key"
              value={apiKey}
              onChange={setApiKey}
              type={showKey ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#374040]"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <FloatingInput
            label="Nama Session"
            value={session}
            onChange={setSession}
          />
        </div>

        {/* Test kirim — selalu aktif agar bisa dicoba tanpa toggle on */}
        <div>
          <p className="text-xs font-medium text-[#1C2517] mb-2">Test kirim pesan</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <FloatingInput
                label="Nomor WA (08xxx atau 628xxx)"
                value={testPhone}
                onChange={setTestPhone}
              />
            </div>
            <button
              onClick={handleTest}
              disabled={testing}
              className="shrink-0 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
              style={{ background: "#3E8A2F", color: "#fff", minWidth: 100 }}
            >
              {testing
                ? <><Loader2 size={14} className="animate-spin" /> Mengantri...</>
                : <><MessageCircle size={14} /> Test</>
              }
            </button>
          </div>
          <p className="text-xs text-[#9CA3A0] mt-1.5">
            Format: <code className="text-[11px]">08123456789</code> atau <code className="text-[11px]">628123456789</code> — pesan masuk antrian, dikirim server dalam ±1 menit.
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Manajemen Data card ──────────────────────────────────────────────────────

function ManajemenDataCard() {
  const { resetToCleanData } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleReset() {
    resetToCleanData();
    setShowConfirm(false);
    toast.success("Semua data operasional berhasil dibersihkan! Aplikasi siap diisi data riil.");
  }

  return (
    <>
      <Card title="Manajemen & Pembersihan Data">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#1C2517] mb-1">Pembersihan Data Operasional</p>
            <p className="text-xs text-[#6B7769] leading-relaxed">
              Gunakan fungsi ini untuk mengosongkan seluruh data siswa, alumni, tagihan, transaksi pembayaran, mutasi, dan log aktivitas agar sistem bersih dan siap diisi data riil madrasah.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 size={16} /> Bersihkan Semua Data Simulasi
            </button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowConfirm(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1C2517] mb-2">Konfirmasi Pembersihan Data</h3>
            <p className="text-sm text-[#6B7769] mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh data Siswa, Alumni, Tagihan, Pembayaran, dan Riwayat Mutasi?
              Tindakan ini akan menyiapkan sistem dengan basis data kosong untuk siap diinput data riil.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors border border-[#E2E8DE] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors shadow-sm cursor-pointer"
              >
                Ya, Bersihkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── WA Templates Card ────────────────────────────────────────────────────────

const TEMPLATE_KEYS: WATemplateKey[] = [
  "absensiAlpa", "absensiTerlambat", "pembayaranLunas",
  "tagihanJatuhTempo", "tunggakanKritis", "blast",
];

function WATemplatesCard() {
  const { appSettings, setAppSettings } = useAppContext();
  const merged: WATemplates = { ...WA_TEMPLATE_DEFAULTS, ...(appSettings.waTemplates ?? {}) };

  const [drafts, setDrafts] = useState<WATemplates>({ ...merged });
  const [activeKey, setActiveKey] = useState<WATemplateKey>("absensiAlpa");

  function handleSave() {
    setAppSettings(s => ({ ...s, waTemplates: { ...drafts } }));
    toast.success("Template pesan WA disimpan");
  }

  function handleReset(key: WATemplateKey) {
    setDrafts(d => ({ ...d, [key]: WA_TEMPLATE_DEFAULTS[key] }));
    toast.info("Template dikembalikan ke bawaan");
  }

  return (
    <Card title="Template Pesan WA" onSave={handleSave}>
      <div className="space-y-4">
        <p className="text-xs text-[#6B7769] leading-relaxed">
          Kustomisasi isi pesan otomatis. Gunakan placeholder dalam kurung kurawal yang akan diganti otomatis saat pengiriman.
        </p>

        {/* Tab selector */}
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={
                activeKey === key
                  ? { background: "#3E8A2F", color: "#fff" }
                  : { background: "#F3F4F6", color: "#374040" }
              }
            >
              {WA_TEMPLATE_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Editor for active key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#1C2517]">{WA_TEMPLATE_LABELS[activeKey]}</p>
            <button
              onClick={() => handleReset(activeKey)}
              className="flex items-center gap-1 text-xs text-[#6B7769] hover:text-[#374040] transition-colors"
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          <textarea
            value={drafts[activeKey]}
            onChange={e => setDrafts(d => ({ ...d, [activeKey]: e.target.value }))}
            rows={7}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-[#1C2517] outline-none resize-none font-mono"
            style={{ border: "1.5px solid #3E8A2F", lineHeight: 1.6 }}
          />

          {/* Placeholder legend */}
          <div className="flex flex-wrap gap-1.5">
            {WA_TEMPLATE_VARS[activeKey].map(v => (
              <code
                key={v}
                className="px-2 py-0.5 rounded text-[11px] font-mono"
                style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
              >
                {v}
              </code>
            ))}
          </div>
          <p className="text-[11px] text-[#9CA3A0]">Klik kode di atas untuk referensi — placeholder akan diganti data real saat pesan terkirim.</p>
        </div>
      </div>
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Pengaturan() {
  return (
    <div className="space-y-4 px-4 md:px-0 mx-auto" style={{ maxWidth: 720, paddingBottom: 88 }}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1C2517]">Pengaturan</h2>
        <p className="text-xs md:text-sm text-[#6B7769]">Konfigurasi sistem, identitas, dan preferensi madrasah</p>
      </div>

      <TahunAjaranCard />
      <AkademikCard />
      <KeuanganCard />
      <IdentitasCard />
      <WAHACard />
      <WATemplatesCard />
      <ManajemenDataCard />
    </div>
  );
}
