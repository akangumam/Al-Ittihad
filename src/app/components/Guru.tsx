import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, MoreHorizontal, X, Eye, Pencil,
  MessageCircle, Trash2, FileText, Calendar,
} from "lucide-react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── types ────────────────────────────────────────────────────────────────────

interface GuruRow {
  id: number;
  nama: string;
  nuptk: string;
  nip: string;
  mapel: string[];
  statusKepeg: "PNS" | "GTY" | "Honorer";
  waliKelas: string | null;
  kehadiran: number;
  status: "Aktif" | "Nonaktif";
  jk: "L" | "P";
  tanggalLahir: string;
  jabatan: string;
  pendidikan: string;
  hp: string;
  email: string;
  alamat: string;
  inits: string;
}

// ─── data ─────────────────────────────────────────────────────────────────────

const guruData: GuruRow[] = [
  {
    id: 1, nama: "Ust. Ahmad Zaki, S.Pd", nuptk: "1245760661200013", nip: "",
    mapel: ["Matematika", "IPA"], statusKepeg: "GTY", waliKelas: "9A",
    kehadiran: 95, status: "Aktif", jk: "L", tanggalLahir: "15 Maret 1985",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan Matematika — IAIN Cirebon",
    hp: "0812-9876-5432", email: "ahmad.zaki@alittihad.sch.id",
    alamat: "Jl. Pedaleman Dalam No. 3, Babakan, Cirebon", inits: "AZ",
  },
  {
    id: 2, nama: "Hj. Siti Nurlaela, S.Pd.I", nuptk: "2345670881200004", nip: "19750408 200312 2 004",
    mapel: ["Bahasa Arab", "Fiqih"], statusKepeg: "PNS", waliKelas: null,
    kehadiran: 92, status: "Aktif", jk: "P", tanggalLahir: "8 April 1975",
    jabatan: "Guru Mapel & Koordinator PAI", pendidikan: "S1 Pendidikan Bahasa Arab — UIN Jakarta",
    hp: "0813-5678-2345", email: "siti.nurlaela@alittihad.sch.id",
    alamat: "Jl. Raya Pekalipan No. 22, Pekalipan, Cirebon", inits: "SN",
  },
  {
    id: 3, nama: "Ust. Farid Hasan, S.Pd", nuptk: "3456781091200015", nip: "",
    mapel: ["IPS", "PKn"], statusKepeg: "GTY", waliKelas: "8B",
    kehadiran: 88, status: "Aktif", jk: "L", tanggalLahir: "22 Juli 1987",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan IPS — UNIKU Kuningan",
    hp: "0821-3456-7890", email: "farid.hasan@alittihad.sch.id",
    alamat: "Jl. Kramat No. 11, Argasunya, Cirebon", inits: "FH",
  },
  {
    id: 4, nama: "Ibu Dewi Rahmawati, S.Pd", nuptk: "4567892301200002", nip: "19800115 200501 2 003",
    mapel: ["Bahasa Indonesia"], statusKepeg: "PNS", waliKelas: "7C",
    kehadiran: 97, status: "Aktif", jk: "P", tanggalLahir: "15 Januari 1980",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Bahasa & Sastra Indonesia — UNSWAGATI Cirebon",
    hp: "0877-8901-2345", email: "dewi.rahmawati@alittihad.sch.id",
    alamat: "Jl. Sukalila Selatan No. 7, Kejaksan, Cirebon", inits: "DR",
  },
  {
    id: 5, nama: "Ust. Ridwan Maulana, S.Pd.I", nuptk: "5678900511200011", nip: "",
    mapel: ["Tahfidz", "PAI"], statusKepeg: "GTY", waliKelas: "9C",
    kehadiran: 79, status: "Aktif", jk: "L", tanggalLahir: "3 Desember 1989",
    jabatan: "Koordinator Tahfidz & Wali Kelas", pendidikan: "S1 Pendidikan Agama Islam — UIN Sunan Gunung Djati",
    hp: "0856-7890-1234", email: "ridwan.maulana@alittihad.sch.id",
    alamat: "Jl. Karanggetas No. 18, Kesambi, Cirebon", inits: "RM",
  },
  {
    id: 6, nama: "Ibu Nining Suparni, S.Pd", nuptk: "", nip: "",
    mapel: ["Prakarya", "SBK"], statusKepeg: "Honorer", waliKelas: null,
    kehadiran: 71, status: "Aktif", jk: "P", tanggalLahir: "9 Agustus 1993",
    jabatan: "Guru Honorer", pendidikan: "D3 Seni Rupa — ISBI Bandung",
    hp: "0812-3456-8901", email: "nining.suparni@alittihad.sch.id",
    alamat: "Jl. Panjunan No. 34, Lemahwungkuk, Cirebon", inits: "NS",
  },
  {
    id: 7, nama: "Ust. Budi Santoso, S.Pd", nuptk: "7890123561200007", nip: "",
    mapel: ["Penjaskes"], statusKepeg: "Honorer", waliKelas: "7B",
    kehadiran: 85, status: "Aktif", jk: "L", tanggalLahir: "17 Juni 1991",
    jabatan: "Guru Olahraga & Wali Kelas", pendidikan: "S1 Pendidikan Jasmani — UNSIL Tasikmalaya",
    hp: "0821-6789-0123", email: "budi.santoso@alittihad.sch.id",
    alamat: "Jl. Lawanggada No. 9, Kasepuhan, Cirebon", inits: "BS",
  },
];

const mapelOptions = [
  "Semua Mapel", "Matematika", "IPA", "Bahasa Arab", "Fiqih",
  "IPS", "PKn", "Bahasa Indonesia", "Tahfidz", "PAI", "Prakarya", "SBK", "Penjaskes",
];

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

function RowMenu({ onView }: { onView: () => void }) {
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
            style={{ border: "1px solid #E2E8DE", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
          >
            <button
              onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Eye size={13} className="text-[#6B7769]" /> Lihat Detail
            </button>
            <button
              onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Pencil size={13} className="text-[#6B7769]" /> Edit Data
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <MessageCircle size={13} className="text-[#6B7769]" /> Kirim WA
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
              <Trash2 size={13} /> Nonaktifkan
            </button>
          </div>
        </>
      )}
    </div>
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

// "Mata Pelajaran" multi-select display (visual mockup)
function MapelMultiSelect({ values, label }: { values: string[]; label: string }) {
  return (
    <div className="relative rounded-lg px-3 pt-6 pb-2.5" style={{ border: "1px solid #E2E8DE" }}>
      <label className="absolute left-3 top-1.5 text-[10px] text-[#6B7769] pointer-events-none">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF7EC] text-[#3E8A2F] text-xs font-semibold">
            {v}
            <span className="text-[#9CA3A0] cursor-pointer hover:text-[#DC2626] leading-none">×</span>
          </span>
        ))}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F5F9F4] text-[#9CA3A0] text-xs cursor-pointer hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors">
          + Tambah
        </span>
      </div>
    </div>
  );
}

// ─── Detail sheet ──────────────────────────────────────────────────────────────

type SheetTab = "profil" | "jadwal" | "absensi";

function GuruSheet({ guru, onClose }: { guru: GuruRow; onClose: () => void }) {
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
  });
  const set = (key: keyof typeof form) => (v: string) =>
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
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] hover:text-[#1C2517] transition-colors"
          >
            <X size={16} />
          </button>
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
                <FloatingInput label="Tanggal Lahir" value={form.tanggalLahir} onChange={set("tanggalLahir")} />
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
                <MapelMultiSelect label="Mata Pelajaran" values={guru.mapel} />
                <FloatingInput label="Pendidikan Terakhir" value={form.pendidikan} onChange={set("pendidikan")} />
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
                <FloatingTextarea label="Alamat" value={form.alamat} onChange={set("alamat")} />
              </section>

              <div className="h-2" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F5F9F4] flex items-center justify-center mx-auto mb-4">
                {tab === "jadwal" ? <Calendar size={22} className="text-[#D1D5DB]" /> : <FileText size={22} className="text-[#D1D5DB]" />}
              </div>
              <p className="text-sm font-semibold text-[#6B7769] mb-1">{TAB_LABELS[tab]}</p>
              <p className="text-xs text-[#9CA3A0]">
                {tab === "jadwal"
                  ? "Jadwal mengajar guru akan ditampilkan di sini"
                  : "Rekapitulasi kehadiran bulanan akan ditampilkan di sini"}
              </p>
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
          <button className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            Simpan
          </button>
        </div>
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Guru() {
  const [search,      setSearch]      = useState("");
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");
  const [statusFilter,setStatusFilter]= useState("Semua Status");
  // Sheet starts open with first teacher (Ust. Ahmad Zaki)
  const [selectedGuru, setSelectedGuru] = useState<GuruRow | null>(guruData[0]);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return guruData.filter((r) => {
      const matchSearch = !q ||
        r.nama.toLowerCase().includes(q) ||
        r.nuptk.includes(q) ||
        r.mapel.some((m) => m.toLowerCase().includes(q));
      const matchMapel  = mapelFilter === "Semua Mapel" || r.mapel.includes(mapelFilter);
      const matchStatus = statusFilter === "Semua Status" || r.statusKepeg === statusFilter;
      return matchSearch && matchMapel && matchStatus;
    });
  }, [search, mapelFilter, statusFilter]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* ── Title + KPI chips ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-[#1C2517]">Guru</h2>
          <p className="text-sm text-[#6B7769]">Data tenaga pengajar dan kepegawaian madrasah</p>
        </div>
        <div className="hidden md:flex items-center gap-2 mt-1 shrink-0">
          {[
            { label: "Total", value: 38 },
            { label: "PNS",   value: 6  },
            { label: "GTY",   value: 24 },
            { label: "Honorer", value: 8 },
          ].map((kpi, i) => (
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
            {mapelOptions.map((o) => <option key={o} value={o}>{o}</option>)}
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
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
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
        ) : rows.map((row) => {
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
          <span className="text-[12px] text-[#6B7769]">1–{rows.length} dari <strong className="text-[#1C2517]">38</strong> guru</span>
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
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F7EE" : "none" }}
                  onClick={() => setSelectedGuru(row)}
                >
                  {/* Guru */}
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

                  {/* Mata Pelajaran */}
                  <td className="px-4 py-3.5">
                    <MapelBadges mapel={row.mapel} />
                  </td>

                  {/* Status Kepegawaian */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.statusKepeg as "PNS" | "GTY" | "Honorer"} />
                  </td>

                  {/* Wali Kelas */}
                  <td className="px-4 py-3.5 text-sm text-[#374040]">
                    {row.waliKelas ? (
                      <span className="font-medium">{row.waliKelas}</span>
                    ) : (
                      <span className="text-[#D1D5DB]">—</span>
                    )}
                  </td>

                  {/* Kehadiran */}
                  <td className="px-4 py-3.5">
                    <KehadiranCell pct={row.kehadiran} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusDot status={row.status} />
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                    <RowMenu onView={() => setSelectedGuru(row)} />
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
            1–{rows.length} dari <span className="font-semibold text-[#1C2517]">38</span> guru
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D1D5DB] cursor-not-allowed"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3E8A2F] text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">3</button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] hover:bg-[#EDF7EC] transition-colors"
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
          key={selectedGuru.id}
          guru={selectedGuru}
          onClose={() => setSelectedGuru(null)}
        />
      )}
    </div>
  );
}
