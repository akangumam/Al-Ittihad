import { useState, useRef, useId } from "react";
import { useParams, useNavigate } from "react-router";
import { Plus, Search, ChevronDown, AlertTriangle, Check, X, Trash2 } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fmt } from "@/lib/formatters";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { DataTable, Th } from "@/app/components/shared/DataTable";

// ─── data ─────────────────────────────────────────────────────────────────────

interface TemplateComponent { nama: string; jumlah: number }
interface Template {
  id: number; nama: string; tipe: string; target: string;
  komponen: TemplateComponent[]; total: number; applied: number;
}

const templates: Template[] = [
  {
    id: 1, nama: "Administrasi PPDB",
    tipe: "PPDB", target: "Siswa Baru", applied: 120,
    komponen: [
      { nama: "Seragam Batik, Kaos Olahraga & Atribut", jumlah: 200_000 },
      { nama: "LKS Semester 1",                          jumlah: 130_000 },
      { nama: "Iuran Semester 1 & 2",                    jumlah: 120_000 },
      { nama: "Map Raport",                              jumlah:  50_000 },
      { nama: "Pemeliharaan Lab Komputer",               jumlah:  50_000 },
      { nama: "Infaq Gedung",                            jumlah: 200_000 },
    ],
    total: 750_000,
  },
  {
    id: 2, nama: "Daftar Ulang",
    tipe: "Daftar Ulang", target: "Siswa Lama (Kelas 8 & 9)", applied: 235,
    komponen: [
      { nama: "LKS Semester 1",           jumlah: 130_000 },
      { nama: "Iuran Semester 1 & 2",     jumlah: 170_000 },
      { nama: "Pemeliharaan Lab Komputer", jumlah:  50_000 },
    ],
    total: 350_000,
  },
  {
    id: 3, nama: "Administrasi Kelas 9",
    tipe: "Kelas 9", target: "Khusus Kelas 9", applied: 115,
    komponen: [
      { nama: "Foto",                      jumlah:  40_000 },
      { nama: "Iuran Ujian",               jumlah: 200_000 },
      { nama: "Album",                     jumlah:  80_000 },
      { nama: "Medali",                    jumlah:  80_000 },
      { nama: "Sampul Ijazah",             jumlah:  50_000 },
      { nama: "Pemeliharaan Lab Komputer", jumlah: 100_000 },
      { nama: "Perpisahan",                jumlah: 150_000 },
    ],
    total: 700_000,
  },
];

interface TemplateBadgeRef { label: string; key: string }
interface PenetapanRow {
  id: number; nama: string; nis: string; kelas: string; inits: string;
  templates: TemplateBadgeRef[]; total: number | null; status: string;
}

const penetapanRows: PenetapanRow[] = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", inits: "AF",
    templates: [{ label: "Adm. Kelas 9", key: "kelas9" }],
    total: 700_000, status: "Lengkap" },
  { id: 2, nama: "Siti Rahmawati", nis: "2023-0145", kelas: "8B", inits: "SR",
    templates: [{ label: "Daftar Ulang", key: "daftar" }],
    total: 350_000, status: "Lengkap" },
  { id: 3, nama: "Rizky Firmansyah", nis: "2025-0067", kelas: "7C", inits: "RF",
    templates: [{ label: "Adm. PPDB", key: "ppdb" }],
    total: 750_000, status: "Lengkap" },
  { id: 4, nama: "Nur Hidayatullah", nis: "2024-0234", kelas: "9D", inits: "NH",
    templates: [{ label: "Daftar Ulang", key: "daftar" }, { label: "Adm. Kelas 9", key: "kelas9" }],
    total: 1_050_000, status: "Lengkap" },
  { id: 5, nama: "Dewi Anggraini Putri", nis: "2023-0312", kelas: "8A", inits: "DA",
    templates: [{ label: "Daftar Ulang", key: "daftar" }],
    total: 350_000, status: "Lengkap" },
  { id: 6, nama: "Bagas Prasetyo", nis: "2025-0089", kelas: "7B", inits: "BP",
    templates: [], total: null, status: "Belum Ditetapkan" },
  { id: 7, nama: "Farah Dianti Putri", nis: "2024-0178", kelas: "9C", inits: "FD",
    templates: [], total: null, status: "Belum Ditetapkan" },
];

const kelasOptions = [
  "Semua Kelas",
  "Kelas 7A","Kelas 7B","Kelas 7C","Kelas 7D",
  "Kelas 8A","Kelas 8B","Kelas 8C","Kelas 8D",
  "Kelas 9A","Kelas 9B","Kelas 9C","Kelas 9D",
];
const templateOptions = [
  "Semua Template","Administrasi PPDB","Daftar Ulang","Administrasi Kelas 9",
];

// ─── badge palette ────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, string> = {
  "PPDB":         "bg-[#DBEAFE] text-[#1E40AF]",
  "Daftar Ulang": "bg-[#FEF3C7] text-[#92400E]",
  "Kelas 9":      "bg-[#EDE9FE] text-[#5B21B6]",
};

const TMPL_BADGE: Record<string, string> = {
  ppdb:   "bg-[#DBEAFE] text-[#1E40AF]",
  daftar: "bg-[#FEF3C7] text-[#92400E]",
  kelas9: "bg-[#EDE9FE] text-[#5B21B6]",
};

// ─── shared sub-components ────────────────────────────────────────────────────

function TypeBadge({ tipe }: { tipe: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${TYPE_STYLE[tipe] ?? "bg-[#F3F4F6] text-[#374040]"}`}
    >
      {tipe}
    </span>
  );
}

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
      {indeterminate && !checked ? (
        <span className="w-2 h-[1.5px] bg-white rounded-full block" />
      ) : checked ? (
        <Check size={9} className="text-white shrink-0" />
      ) : null}
    </button>
  );
}

// ─── Sheet: floating-label helpers ───────────────────────────────────────────

function FloatInput({
  label, required, value, onChange, type = "text",
}: {
  label: string; required?: boolean; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue || type === "date";
  return (
    <div
      className="relative rounded-lg"
      style={{
        border: `1px solid ${focused ? "#3E8A2F" : "#E2E8DE"}`,
        background: "#FAFBF9",
        transition: "border-color 0.15s",
      }}
    >
      <label
        htmlFor={id}
        className="absolute left-3 pointer-events-none transition-all"
        style={
          floated
            ? { top: 6, fontSize: 10, color: "#6B7769" }
            : { top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3A0" }
        }
      >
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full outline-none bg-transparent text-sm text-[#1C2517] rounded-lg"
        style={{ padding: floated ? "22px 12px 6px" : "16px 12px" }}
      />
    </div>
  );
}

function FloatSelect({
  label, required, value, onChange, options,
}: {
  label: string; required?: boolean; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== "";
  const floated = focused || hasValue;
  return (
    <div
      className="relative rounded-lg"
      style={{
        border: `1px solid ${focused ? "#3E8A2F" : "#E2E8DE"}`,
        background: "#FAFBF9",
        transition: "border-color 0.15s",
      }}
    >
      <label
        htmlFor={id}
        className="absolute left-3 pointer-events-none transition-all"
        style={
          floated
            ? { top: 6, fontSize: 10, color: "#6B7769" }
            : { top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3A0" }
        }
      >
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full appearance-none outline-none bg-transparent text-sm text-[#1C2517] rounded-lg pr-8"
        style={{ padding: floated ? "22px 12px 6px" : "16px 12px" }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "—"}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none"
      />
    </div>
  );
}

// ─── Sheet: komponen row ──────────────────────────────────────────────────────

interface KRow { id: number; nama: string; nominal: number; keterangan: string }

function GripDots({ darkened }: { darkened: boolean }) {
  return (
    <svg
      width="10"
      height="15"
      viewBox="0 0 10 15"
      fill={darkened ? "#9CA3A0" : "#D1D5DB"}
      style={{ transition: "fill 0.15s", flexShrink: 0 }}
    >
      <circle cx="2" cy="2.5" r="1.5" />
      <circle cx="8" cy="2.5" r="1.5" />
      <circle cx="2" cy="7.5" r="1.5" />
      <circle cx="8" cy="7.5" r="1.5" />
      <circle cx="2" cy="12.5" r="1.5" />
      <circle cx="8" cy="12.5" r="1.5" />
    </svg>
  );
}

function KomponenRow({
  row, index, onUpdate, onDelete,
}: {
  row: KRow; index: number;
  onUpdate: (field: keyof KRow, value: string | number) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        border: "1px solid #E2E8DE",
        background: isDragging ? "#EDF7EC" : hovered ? "#F5FBF4" : "#FAFBF9",
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Grip + priority — drag handle */}
      <div
        className="flex items-center gap-1.5 shrink-0 touch-none select-none"
        style={{ width: 44, cursor: isDragging ? "grabbing" : "grab" }}
        {...attributes}
        {...listeners}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 24, height: 24 }}
        >
          <GripDots darkened={hovered || isDragging} />
        </div>
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ background: "#3E8A2F" }}
        >
          {index + 1}
        </span>
      </div>

      {/* Nama */}
      <input
        type="text"
        value={row.nama}
        onChange={(e) => onUpdate("nama", e.target.value)}
        placeholder="Nama komponen"
        className="text-sm text-[#1C2517] outline-none rounded-md px-2 py-1.5 flex-1 min-w-0"
        style={{ border: "1px solid #E2E8DE", background: "white" }}
      />

      {/* Nominal */}
      <div
        className="flex items-center rounded-md shrink-0 overflow-hidden"
        style={{ border: "1px solid #E2E8DE", background: "white", width: 126 }}
      >
        <span className="text-xs text-[#9CA3A0] pl-2 shrink-0" style={{ paddingRight: 2 }}>
          Rp
        </span>
        <input
          type="text"
          value={row.nominal > 0 ? row.nominal.toLocaleString("id-ID") : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onUpdate("nominal", Number(raw));
          }}
          placeholder="0"
          className="text-sm text-[#1C2517] outline-none py-1.5 pr-2 w-full min-w-0 tabular-nums text-right"
          style={{ background: "transparent" }}
        />
      </div>

      {/* Keterangan */}
      <input
        type="text"
        value={row.keterangan}
        onChange={(e) => onUpdate("keterangan", e.target.value)}
        placeholder="Opsional"
        className="text-sm text-[#9CA3A0] outline-none rounded-md px-2 py-1.5 shrink-0"
        style={{ border: "1px solid #E2E8DE", background: "white", width: 110 }}
      />

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 hover:bg-[#FEE2E2] transition-colors group"
      >
        <Trash2
          size={13}
          className="text-[#D1D5DB] group-hover:text-[#DC2626] transition-colors"
        />
      </button>
    </div>
  );
}

// ─── Sheet: TambahTemplateSheet ───────────────────────────────────────────────

const PPDB_DEFAULTS: KRow[] = [
  { id: 1, nama: "Seragam Batik, Kaos Olahraga & Atribut", nominal: 200_000, keterangan: "" },
  { id: 2, nama: "LKS Semester 1",                          nominal: 130_000, keterangan: "" },
  { id: 3, nama: "Iuran Semester 1 & 2",                    nominal: 120_000, keterangan: "" },
  { id: 4, nama: "Map Raport",                              nominal:  50_000, keterangan: "" },
  { id: 5, nama: "Pemeliharaan Lab Komputer",               nominal:  50_000, keterangan: "" },
  { id: 6, nama: "Infaq Gedung",                            nominal: 200_000, keterangan: "" },
];

function TambahTemplateSheet({ onClose }: { onClose: () => void }) {
  const [namaTemplate, setNamaTemplate] = useState("Administrasi PPDB");
  const [tipe, setTipe]                 = useState("PPDB");
  const [tahunAjaran, setTahunAjaran]   = useState("2025/2026");
  const [kelas, setKelas]               = useState("");
  const [jatuhTempo, setJatuhTempo]     = useState("2026-07-31");
  const [komponen, setKomponen]         = useState<KRow[]>(PPDB_DEFAULTS);
  const nextId = useRef(PPDB_DEFAULTS.length + 1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const total = komponen.reduce((sum, k) => sum + k.nominal, 0);

  const updateKomponen = (id: number, field: keyof KRow, value: string | number) =>
    setKomponen((prev) => prev.map((k) => (k.id === id ? { ...k, [field]: value } : k)));

  const deleteKomponen = (id: number) =>
    setKomponen((prev) => prev.filter((k) => k.id !== id));

  const addKomponen = () => {
    setKomponen((prev) => [
      ...prev,
      { id: nextId.current++, nama: "", nominal: 0, keterangan: "" },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setKomponen((prev) => {
        const oldIndex = prev.findIndex((k) => k.id === active.id);
        const newIndex = prev.findIndex((k) => k.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      {/* Dim overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className="fixed right-0 top-0 h-full bg-white z-50 flex flex-col"
        style={{ width: 640, boxShadow: "-4px 0 32px rgba(0,0,0,0.14)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E2E8DE" }}
        >
          <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>
            Tambah Template Biaya
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7769] hover:bg-[#F3F4F6] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* 1. Nama Template */}
          <FloatInput
            label="Nama Template"
            required
            value={namaTemplate}
            onChange={setNamaTemplate}
          />

          {/* 2. Tipe Template + Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-4">
            <FloatSelect
              label="Tipe Template"
              required
              value={tipe}
              onChange={setTipe}
              options={["PPDB", "Daftar Ulang", "Kelas 9"]}
            />
            <FloatSelect
              label="Tahun Ajaran"
              value={tahunAjaran}
              onChange={setTahunAjaran}
              options={["2025/2026", "2026/2027", "2027/2028"]}
            />
          </div>

          {/* 3. Kelas + Jatuh Tempo Default */}
          <div className="grid grid-cols-2 gap-4">
            <FloatSelect
              label="Kelas (Opsional)"
              value={kelas}
              onChange={setKelas}
              options={["", "Kelas 7", "Kelas 8", "Kelas 9"]}
            />
            <FloatInput
              label="Jatuh Tempo Default"
              required
              value={jatuhTempo}
              onChange={setJatuhTempo}
              type="date"
            />
          </div>

          {/* 4. Komponen Biaya */}
          <div>
            <p className="text-sm font-semibold text-[#1C2517] mb-0.5">
              Komponen Biaya <span className="text-[#DC2626]">*</span>
            </p>
            <p className="text-[11px] text-[#9CA3A0]">
              Tambahkan komponen biaya dan nominalnya. Seret ikon untuk mengubah urutan.
            </p>
            <p className="text-[10px] text-[#C4CBBC] mb-3">
              Nomor prioritas diperbarui otomatis saat urutan diubah.
            </p>

            {/* Column labels */}
            <div
              className="grid mb-2 px-3"
              style={{ gridTemplateColumns: "44px 1fr 126px 110px 28px", gap: 8 }}
            >
              <div />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A0]">
                Nama Komponen
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A0]">
                Nominal
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A0]">
                Keterangan
              </p>
              <div />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={komponen.map((k) => k.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {komponen.map((k, i) => (
                    <KomponenRow
                      key={k.id}
                      row={k}
                      index={i}
                      onUpdate={(field, value) => updateKomponen(k.id, field, value)}
                      onDelete={() => deleteKomponen(k.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add komponen */}
            <button
              type="button"
              onClick={addKomponen}
              className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#3E8A2F] hover:bg-[#EDF7EC] transition-colors w-full justify-center"
              style={{ border: "1.5px dashed #A3C99A" }}
            >
              <Plus size={14} />
              Tambah Komponen
            </button>
          </div>

          {/* Bottom spacer so footer doesn't overlap last item */}
          <div style={{ height: 8 }} />
        </div>

        {/* Sticky footer */}
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid #E2E8DE", background: "#FAFBF9" }}
        >
          <div>
            <p className="text-[11px] text-[#9CA3A0] leading-none mb-0.5">Total Biaya</p>
            <p className="font-bold tabular-nums text-[#1C2517]" style={{ fontSize: "1.0625rem" }}>
              {fmt(total)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F3F4F6] transition-colors"
              style={{ border: "1px solid #E2E8DE" }}
            >
              Batal
            </button>
            <button
              className="px-5 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
            >
              Simpan Template
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ t }: { t: Template }) {
  return (
    <div
      className="bg-white rounded-xl p-6 flex flex-col"
      style={{ border: "1px solid #E2E8DE" }}
    >
      {/* Name + badge */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-[#1C2517] leading-snug">{t.nama}</p>
        <TypeBadge tipe={t.tipe} />
      </div>
      <p className="text-xs text-[#9CA3A0] mb-4">{t.target}</p>

      {/* Components */}
      <div
        className="flex-1 space-y-2.5 py-4"
        style={{ borderTop: "1px solid #E2E8DE", borderBottom: "1px solid #E2E8DE" }}
      >
        {t.komponen.map((k, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-[#6B7769]">{k.nama}</span>
            <span className="text-sm tabular-nums text-[#1C2517]">{fmt(k.jumlah)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 mb-4">
        <span className="text-sm font-semibold text-[#1C2517]">Total</span>
        <span className="text-sm font-bold tabular-nums text-[#1C2517]">{fmt(t.total)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#9CA3A0]">
          Diterapkan ke{" "}
          <span className="font-semibold text-[#6B7769]">{t.applied}</span> siswa
        </span>
        <div className="flex gap-0.5">
          <button className="text-xs font-medium text-[#6B7769] px-2.5 py-1 rounded-lg hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors">
            Edit
          </button>
          <button className="text-xs font-medium text-[#6B7769] px-2.5 py-1 rounded-lg hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors">
            Duplikat
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template tab ─────────────────────────────────────────────────────────────

function TemplateTab() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {sheetOpen && <TambahTemplateSheet onClose={() => setSheetOpen(false)} />}

      <div>
        {/* Section header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-semibold text-[#1C2517]" style={{ fontSize: "0.9375rem" }}>
              Template Biaya
            </p>
            <p className="text-sm text-[#6B7769] mt-0.5">
              Susun komponen biaya per jenis tagihan
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors shrink-0"
          >
            <Plus size={14} />
            Tambah Template
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}

          {/* Empty slot */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl transition-colors group"
            style={{ border: "2px dashed #D1D5DB", minHeight: "220px" }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#3E8A2F";
              (e.currentTarget as HTMLElement).style.background = "#F5FBF4";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB";
              (e.currentTarget as HTMLElement).style.background = "";
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#E2E8DE] flex items-center justify-center mb-3 transition-colors group-hover:bg-[#DCFCE7]">
              <Plus size={20} className="text-[#9CA3A0] group-hover:text-[#3E8A2F]" />
            </div>
            <p className="text-sm font-semibold text-[#9CA3A0] group-hover:text-[#3E8A2F] transition-colors">
              Buat template baru
            </p>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Penetapan tab ────────────────────────────────────────────────────────────

function PenetapanTab() {
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("Semua Kelas");
  const [template, setTemplate] = useState("Semua Template");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showInfo, setShowInfo] = useState(true);

  const allChecked = checked.size === penetapanRows.length;
  const someChecked = checked.size > 0 && !allChecked;

  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(penetapanRows.map((r) => r.id)));

  const toggleRow = (id: number) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
        >
          <Search size={13} className="text-[#9CA3A0] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa..."
            className="bg-transparent outline-none text-sm text-[#1C2517] w-36"
          />
        </div>

        {/* Class filter */}
        <div className="relative">
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        {/* Template filter */}
        <div className="relative">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
          >
            {templateOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
        </div>

        <button className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors">
          Tetapkan Massal
        </button>
      </div>

      {/* Amber info strip */}
      {showInfo && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#FFFBEB", border: "1px solid #FEF3C7" }}
        >
          <AlertTriangle size={14} className="text-[#92400E] shrink-0" />
          <span className="text-sm text-[#92400E]">
            2 siswa belum memiliki tagihan TA 2025/2026
          </span>
          <button
            onClick={() => {}}
            className="text-sm font-semibold text-[#92400E] hover:underline"
          >
            Tampilkan
          </button>
          <button
            onClick={() => setShowInfo(false)}
            className="ml-auto text-[#92400E] hover:opacity-70 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <th className="w-10 pl-6 pr-3 py-3">
                  <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                </th>
                <Th className="pr-4">Siswa</Th>
                <Th className="pr-4">Template Diterapkan</Th>
                <Th align="right" className="pr-4">Total Tagihan</Th>
                <Th className="pr-4">Status Penetapan</Th>
                <Th className="pr-6">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {penetapanRows.map((row, i) => {
                const isChecked = checked.has(row.id);
                const belum = row.status === "Belum Ditetapkan";
                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[#FAFBF9]"
                    style={{
                      borderBottom: i < penetapanRows.length - 1 ? "1px solid #F0F7EE" : "none",
                      background: isChecked ? "#F5FBF4" : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <td className="pl-6 pr-3 py-3.5">
                      <Checkbox checked={isChecked} onChange={() => toggleRow(row.id)} />
                    </td>

                    {/* Siswa */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {row.inits}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C2517] leading-none">{row.nama}</p>
                          <p className="text-[11px] text-[#6B7769] mt-0.5">{row.nis} · Kelas {row.kelas}</p>
                        </div>
                      </div>
                    </td>

                    {/* Template badges */}
                    <td className="py-3.5 pr-4">
                      {row.templates.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.templates.map((tb) => (
                            <span
                              key={tb.key}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${TMPL_BADGE[tb.key] ?? "bg-[#F3F4F6] text-[#374040]"}`}
                            >
                              {tb.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-[#D1D5DB]">—</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 pr-4 text-right">
                      {row.total !== null ? (
                        <span className="text-sm font-bold tabular-nums text-[#1C2517]">
                          {fmt(row.total)}
                        </span>
                      ) : (
                        <span className="text-sm text-[#D1D5DB]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      {belum ? (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#92400E]"
                          style={{ border: "1.5px solid #F6B31E" }}
                        >
                          Belum Ditetapkan
                        </span>
                      ) : (
                        <StatusBadge status="Lengkap" />
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 pr-6">
                      <button
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors"
                        style={{ border: "1px solid #E2E8DE" }}
                      >
                        Atur
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

type TabType = "template" | "penetapan";

export function Tagihan() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab: TabType = tab === "penetapan" ? "penetapan" : "template";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-[#1C2517]">Tagihan</h2>
        <p className="text-sm text-[#6B7769]">Kelola template dan penetapan tagihan siswa</p>
      </div>

      {/* Tab buttons — shadcn Tabs pattern, tab stored in URL */}
      <div className="inline-flex rounded-lg p-1 bg-[#EDF7EC]">
        {(["template", "penetapan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => navigate(`/keuangan/tagihan/${t}`)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
              activeTab === t
                ? "bg-white text-[#1C2517]"
                : "text-[#6B7769] hover:text-[#374040]",
            ].join(" ")}
            style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
          >
            {t === "template" ? "Template" : "Penetapan"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "template" ? <TemplateTab /> : <PenetapanTab />}
    </div>
  );
}
