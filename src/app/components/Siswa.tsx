import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Upload, MoreHorizontal, X, Eye, Pencil,
  MessageCircle, Trash2, Check, FileText,
} from "lucide-react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── types ────────────────────────────────────────────────────────────────────

interface SiswaRow {
  id: number; nama: string; nis: string; nisn: string;
  kelas: string; jk: "L" | "P";
  waliNama: string; waliHp: string;
  statusSPP: "Lunas" | "Mencicil" | "Menunggak";
  status: "Aktif" | "Nonaktif"; inits: string;
  tempatLahir: string; tanggalLahir: string;
  namaAyah: string; namaIbu: string;
  alamat: string; kelurahan: string; kecamatan: string;
}

// ─── data ─────────────────────────────────────────────────────────────────────

const siswaData: SiswaRow[] = [
  { id:1,  nama:"Ahmad Fadhilah Putra",  nis:"2024-0089", nisn:"0089432156", kelas:"9A", jk:"L", waliNama:"H. Fadhilah Hakim",    waliHp:"0812-3456-7890", statusSPP:"Menunggak", status:"Aktif",    inits:"AF", tempatLahir:"Cirebon",   tanggalLahir:"12 Februari 2010", namaAyah:"H. Fadhilah Hakim",  namaIbu:"Sari Wahyuni",     alamat:"Jl. Pedaleman No. 45, RT 02/RW 03",       kelurahan:"Pedaleman",  kecamatan:"Babakan" },
  { id:2,  nama:"Siti Rahmawati",         nis:"2023-0145", nisn:"0091234567", kelas:"8B", jk:"P", waliNama:"Hj. Rahmah Hidayah", waliHp:"0813-5678-9012", statusSPP:"Menunggak", status:"Aktif",    inits:"SR", tempatLahir:"Kuningan",  tanggalLahir:"7 Maret 2011",    namaAyah:"Rahmat Hidayah",     namaIbu:"Hj. Rahmah",       alamat:"Jl. Manggu Besar No. 12, RT 01/RW 05",   kelurahan:"Manggu",     kecamatan:"Argasunya" },
  { id:3,  nama:"Rizky Firmansyah",       nis:"2025-0067", nisn:"0109876543", kelas:"7C", jk:"L", waliNama:"Firmansyah Yusuf",   waliHp:"0821-9876-5432", statusSPP:"Menunggak", status:"Aktif",    inits:"RF", tempatLahir:"Cirebon",   tanggalLahir:"3 Agustus 2012",  namaAyah:"Firmansyah Yusuf",   namaIbu:"Dewi Lestari",     alamat:"Jl. Kesambi No. 8, RT 04/RW 02",          kelurahan:"Kesambi",    kecamatan:"Kesambi" },
  { id:4,  nama:"Nur Hidayatullah",       nis:"2024-0234", nisn:"0087654321", kelas:"9D", jk:"L", waliNama:"Hidayat Kurnia",     waliHp:"0856-1234-5678", statusSPP:"Menunggak", status:"Aktif",    inits:"NH", tempatLahir:"Cirebon",   tanggalLahir:"19 November 2010",namaAyah:"Hidayat Kurnia",     namaIbu:"Nurul Aini",       alamat:"Jl. Pelandakan No. 23, RT 03/RW 01",      kelurahan:"Pelandakan", kecamatan:"Lemahwungkuk" },
  { id:5,  nama:"Dewi Anggraini Putri",   nis:"2023-0312", nisn:"0093456789", kelas:"8A", jk:"P", waliNama:"Susanto Anggraini",  waliHp:"0877-8765-4321", statusSPP:"Lunas",     status:"Aktif",    inits:"DA", tempatLahir:"Indramayu", tanggalLahir:"5 April 2011",    namaAyah:"Susanto Anggraini",  namaIbu:"Sri Mulyati",      alamat:"Jl. Sukalila No. 17, RT 02/RW 04",        kelurahan:"Sukalila",   kecamatan:"Kejaksan" },
  { id:6,  nama:"Bagas Prasetyo",         nis:"2024-0178", nisn:"0112345678", kelas:"9C", jk:"L", waliNama:"Prasetyo Wibowo",   waliHp:"0812-2345-6789", statusSPP:"Mencicil",  status:"Aktif",    inits:"BP", tempatLahir:"Cirebon",   tanggalLahir:"28 Januari 2012", namaAyah:"Prasetyo Wibowo",    namaIbu:"Emi Susanti",      alamat:"Jl. Lawanggada No. 5, RT 01/RW 02",       kelurahan:"Kasepuhan",  kecamatan:"Lemahwungkuk" },
  { id:7,  nama:"Farah Dianti Putri",     nis:"2025-0089", nisn:"0088765432", kelas:"7B", jk:"P", waliNama:"Dianti Rahayu",     waliHp:"0813-4567-8901", statusSPP:"Mencicil",  status:"Aktif",    inits:"FD", tempatLahir:"Cirebon",   tanggalLahir:"14 Juni 2010",    namaAyah:"Rohmad Dianti",      namaIbu:"Siti Rahayu",      alamat:"Jl. Pulasaren No. 9, RT 05/RW 03",        kelurahan:"Pulasaren",  kecamatan:"Pekalipan" },
  { id:8,  nama:"Aisyah Nur Fadila",      nis:"2023-0456", nisn:"0072345678", kelas:"8D", jk:"P", waliNama:"Muharam Fadila",    waliHp:"0821-5678-9012", statusSPP:"Menunggak",     status:"Nonaktif", inits:"AN", tempatLahir:"Brebes",    tanggalLahir:"22 September 2010",namaAyah:"Muharam Fadila",    namaIbu:"Yanti Setiawati",  alamat:"Jl. Kampung Baru No. 33, RT 06/RW 04",    kelurahan:"Gunungjati", kecamatan:"Gunungjati" },
];

const kelasOptions = [
  "Semua Kelas",
  "Kelas 7A","Kelas 7B","Kelas 7C","Kelas 7D",
  "Kelas 8A","Kelas 8B","Kelas 8C","Kelas 8D",
  "Kelas 9A","Kelas 9B","Kelas 9C","Kelas 9D",
];

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
              <Eye size={13} className="text-[#6B7769]" />
              Lihat Detail
            </button>
            <button
              onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
            >
              <Pencil size={13} className="text-[#6B7769]" />
              Edit Data
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors">
              <MessageCircle size={13} className="text-[#6B7769]" />
              Kirim WA
            </button>
            <div className="h-px mx-2 my-1 bg-[#E2E8DE]" />
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
              <Trash2 size={13} />
              Nonaktifkan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── floating label inputs ────────────────────────────────────────────────────

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
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 ${raised ? "pt-6" : "pt-4"}`}
      />
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
        rows={3}
        className={`w-full bg-transparent outline-none text-sm text-[#1C2517] px-3 pb-2 resize-none ${raised ? "pt-6" : "pt-4"}`}
      />
    </div>
  );
}

// ─── Student sheet (detail / edit) ────────────────────────────────────────────

type SheetTab = "profil" | "tagihan" | "riwayat";

function StudentSheet({ siswa, onClose }: { siswa: SiswaRow; onClose: () => void }) {
  const [tab, setTab] = useState<SheetTab>("profil");
  const [form, setForm] = useState({
    nis: siswa.nis, nisn: siswa.nisn, nama: siswa.nama,
    jk: siswa.jk as string,
    tempatLahir: siswa.tempatLahir, tanggalLahir: siswa.tanggalLahir,
    namaAyah: siswa.namaAyah, namaIbu: siswa.namaIbu, waliHp: siswa.waliHp,
    alamat: siswa.alamat, kelurahan: siswa.kelurahan, kecamatan: siswa.kecamatan,
  });
  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const TAB_LABELS: Record<SheetTab, string> = {
    profil: "Profil",
    tagihan: "Tagihan & Pembayaran",
    riwayat: "Riwayat",
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: siswa.status === "Nonaktif" ? "#E2E8DE" : "#3E8A2F",
                color: siswa.status === "Nonaktif" ? "#9CA3A0" : "#FFFFFF",
              }}
            >
              {siswa.inits}
            </div>
            <div>
              <p className="font-semibold text-[#1C2517]">{siswa.nama}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#6B7769]">Kelas {siswa.kelas}</span>
                <span className="text-[#D1D5DB]">·</span>
                <StatusDot status={siswa.status} />
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
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="NIS" value={form.nis} onChange={set("nis")} required />
                  <FloatingInput label="NISN" value={form.nisn} onChange={set("nisn")} required />
                </div>
                <FloatingInput label="Nama Lengkap" value={form.nama} onChange={set("nama")} required />

                {/* Jenis Kelamin radio */}
                <div className="rounded-lg px-3 py-3" style={{ border: "1px solid #E2E8DE" }}>
                  <p className="text-[10px] text-[#6B7769] mb-2.5">
                    Jenis Kelamin <span className="text-[#DC2626]">*</span>
                  </p>
                  <div className="flex gap-6">
                    {[{ v: "L", l: "Laki-laki" }, { v: "P", l: "Perempuan" }].map(({ v, l }) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer" onClick={() => set("jk")(v)}>
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
                  <FloatingInput label="Tempat Lahir" value={form.tempatLahir} onChange={set("tempatLahir")} />
                  <FloatingInput label="Tanggal Lahir" value={form.tanggalLahir} onChange={set("tanggalLahir")} />
                </div>
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Data Wali ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Data Wali</p>
                <FloatingInput label="Nama Ayah" value={form.namaAyah} onChange={set("namaAyah")} />
                <FloatingInput label="Nama Ibu" value={form.namaIbu} onChange={set("namaIbu")} />
                <div>
                  <FloatingInput label="No. HP Wali" value={form.waliHp} onChange={set("waliHp")} required />
                  <p className="text-[11px] text-[#9CA3A0] mt-1 px-1">
                    Untuk pengiriman kuitansi &amp; tagihan WA
                  </p>
                </div>
              </section>

              <div className="h-px bg-[#E2E8DE]" />

              {/* ── Alamat ── */}
              <section className="space-y-3">
                <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest">Alamat</p>
                <FloatingTextarea label="Alamat Lengkap" value={form.alamat} onChange={set("alamat")} />
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Kelurahan" value={form.kelurahan} onChange={set("kelurahan")} />
                  <FloatingInput label="Kecamatan" value={form.kecamatan} onChange={set("kecamatan")} />
                </div>
              </section>

              {/* Spacer so content isn't clipped by footer */}
              <div className="h-2" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F5F9F4] flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-[#D1D5DB]" />
              </div>
              <p className="text-sm font-semibold text-[#6B7769] mb-1">{TAB_LABELS[tab]}</p>
              <p className="text-xs text-[#9CA3A0]">
                {tab === "tagihan"
                  ? "Riwayat tagihan dan pembayaran siswa akan ditampilkan di sini"
                  : "Riwayat perubahan data siswa akan ditampilkan di sini"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
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
          <button className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
            Simpan
          </button>
        </div>
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function Siswa() {
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaRow | null>(null);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return siswaData.filter((r) => {
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.nis.includes(q) || r.nisn.includes(q);
      const matchKelas  = kelasFilter === "Semua Kelas" || r.kelas === kelasFilter.slice(6);
      const matchStatus = statusFilter === "Semua Status" || r.status === statusFilter;
      return matchSearch && matchKelas && matchStatus;
    });
  }, [search, kelasFilter, statusFilter]);

  const allChecked  = rows.length > 0 && checked.size === rows.length;
  const someChecked = checked.size > 0 && !allChecked;

  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleRow = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
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
          {[
            { label: "Total Aktif", value: 355 },
            { label: "Laki-laki",   value: 188 },
            { label: "Perempuan",   value: 167 },
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
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
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
        <button onClick={() => setSelectedSiswa(null)}
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{ background: nonaktif ? "#E2E8DE" : "#3E8A2F", color: nonaktif ? "#9CA3A0" : "#FFF" }}>
                  {row.inits}
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
          <span className="text-[12px] text-[#6B7769]">1–{rows.length} dari <strong className="text-[#1C2517]">355</strong> siswa</span>
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
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{
                            background: nonaktif ? "#E2E8DE" : "#3E8A2F",
                            color:      nonaktif ? "#9CA3A0" : "#FFFFFF",
                          }}
                        >
                          {row.inits}
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
                      <RowMenu onView={() => setSelectedSiswa(row)} />
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
            1–{rows.length} dari <span className="font-semibold text-[#1C2517]">355</span> siswa
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
            <span className="px-1 text-[#9CA3A0] text-xs">...</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] text-xs hover:bg-[#EDF7EC] transition-colors">45</button>
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
      {selectedSiswa && (
        <StudentSheet
          key={selectedSiswa.id}
          siswa={selectedSiswa}
          onClose={() => setSelectedSiswa(null)}
        />
      )}
    </div>
  );
}
