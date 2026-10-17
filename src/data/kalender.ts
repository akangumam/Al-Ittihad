export type TipeEvent =
  | "semester"  // awal/akhir semester
  | "libur"     // libur nasional / keagamaan
  | "uts"       // UTS
  | "uas"       // UAS / PAT
  | "ppdb"      // penerimaan peserta didik baru
  | "event";    // rapat, kunjungan, event madrasah

export interface KalenderEvent {
  id: string;
  judul: string;
  tanggalMulai: string;   // "YYYY-MM-DD"
  tanggalSelesai: string; // same for single-day
  tipe: TipeEvent;
  keterangan?: string;
  tahunAjaran: string;
}

export const TIPE_CONFIG: Record<TipeEvent, { label: string; bg: string; text: string; dot: string }> = {
  semester: { label: "Semester",    bg: "#DCFCE7", text: "#166534", dot: "#16A34A" },
  libur:    { label: "Hari Libur",  bg: "#FEE2E2", text: "#991B1B", dot: "#DC2626" },
  uts:      { label: "UTS",         bg: "#FEF9C3", text: "#713F12", dot: "#CA8A04" },
  uas:      { label: "UAS / PAT",   bg: "#FFEDD5", text: "#9A3412", dot: "#EA580C" },
  ppdb:     { label: "PPDB",        bg: "#DBEAFE", text: "#1E3A8A", dot: "#2563EB" },
  event:    { label: "Event",       bg: "#EDE9FE", text: "#4C1D95", dot: "#7C3AED" },
};

export const kalenderSeed: KalenderEvent[] = [
  // ── Semester 1 2025/2026 ────────────────────────────────────────────────────
  { id: "ev001", judul: "Awal Semester 1",       tanggalMulai: "2025-07-14", tanggalSelesai: "2025-07-14", tipe: "semester", tahunAjaran: "2025/2026" },
  { id: "ev002", judul: "Tahun Baru Islam 1447H", tanggalMulai: "2025-07-07", tanggalSelesai: "2025-07-07", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev003", judul: "HUT RI ke-80",           tanggalMulai: "2025-08-17", tanggalSelesai: "2025-08-17", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev004", judul: "Maulid Nabi SAW 1447H",  tanggalMulai: "2025-09-05", tanggalSelesai: "2025-09-05", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev005", judul: "UTS Semester 1",         tanggalMulai: "2025-09-22", tanggalSelesai: "2025-10-03", tipe: "uts",     tahunAjaran: "2025/2026", keterangan: "Ujian Tengah Semester 1 seluruh kelas" },
  { id: "ev006", judul: "UAS Semester 1",         tanggalMulai: "2025-12-08", tanggalSelesai: "2025-12-19", tipe: "uas",     tahunAjaran: "2025/2026", keterangan: "Ujian Akhir Semester 1 seluruh kelas" },
  { id: "ev007", judul: "Akhir Semester 1",       tanggalMulai: "2025-12-20", tanggalSelesai: "2025-12-20", tipe: "semester", tahunAjaran: "2025/2026" },
  { id: "ev008", judul: "Libur Semester 1",       tanggalMulai: "2025-12-22", tanggalSelesai: "2026-01-03", tipe: "libur",   tahunAjaran: "2025/2026", keterangan: "Libur akhir semester 1" },
  { id: "ev009", judul: "Hari Natal",             tanggalMulai: "2025-12-25", tanggalSelesai: "2025-12-25", tipe: "libur",   tahunAjaran: "2025/2026" },

  // ── Semester 2 2025/2026 ────────────────────────────────────────────────────
  { id: "ev010", judul: "Awal Semester 2",        tanggalMulai: "2026-01-05", tanggalSelesai: "2026-01-05", tipe: "semester", tahunAjaran: "2025/2026" },
  { id: "ev011", judul: "Tahun Baru Masehi",      tanggalMulai: "2026-01-01", tanggalSelesai: "2026-01-01", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev012", judul: "PPDB Tahun Ajaran Baru", tanggalMulai: "2026-01-12", tanggalSelesai: "2026-02-28", tipe: "ppdb",    tahunAjaran: "2025/2026", keterangan: "Pendaftaran online & seleksi berkas" },
  { id: "ev013", judul: "Isra Mi'raj 1447H",      tanggalMulai: "2026-01-27", tanggalSelesai: "2026-01-27", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev014", judul: "Tahun Baru Imlek",       tanggalMulai: "2026-02-17", tanggalSelesai: "2026-02-17", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev015", judul: "UTS Semester 2",         tanggalMulai: "2026-03-09", tanggalSelesai: "2026-03-20", tipe: "uts",     tahunAjaran: "2025/2026", keterangan: "Ujian Tengah Semester 2 seluruh kelas" },
  { id: "ev016", judul: "Hari Raya Nyepi",        tanggalMulai: "2026-03-19", tanggalSelesai: "2026-03-19", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev017", judul: "Libur Idul Fitri 1447H", tanggalMulai: "2026-03-28", tanggalSelesai: "2026-04-05", tipe: "libur",   tahunAjaran: "2025/2026", keterangan: "Libur Hari Raya Idul Fitri" },
  { id: "ev018", judul: "Hari Kartini",           tanggalMulai: "2026-04-21", tanggalSelesai: "2026-04-21", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev019", judul: "Wafat Isa Almasih",      tanggalMulai: "2026-04-03", tanggalSelesai: "2026-04-03", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev020", judul: "Hari Buruh",             tanggalMulai: "2026-05-01", tanggalSelesai: "2026-05-01", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev021", judul: "Kenaikan Isa Almasih",   tanggalMulai: "2026-05-14", tanggalSelesai: "2026-05-14", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev022", judul: "Hari Waisak",            tanggalMulai: "2026-05-24", tanggalSelesai: "2026-05-24", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev023", judul: "Hari Raya Idul Adha",    tanggalMulai: "2026-06-05", tanggalSelesai: "2026-06-07", tipe: "libur",   tahunAjaran: "2025/2026" },
  { id: "ev024", judul: "UAS / PAT Semester 2",   tanggalMulai: "2026-06-01", tanggalSelesai: "2026-06-12", tipe: "uas",     tahunAjaran: "2025/2026", keterangan: "Penilaian Akhir Tahun seluruh kelas" },
  { id: "ev025", judul: "PPDB Gelombang 2",       tanggalMulai: "2026-06-08", tanggalSelesai: "2026-07-10", tipe: "ppdb",    tahunAjaran: "2025/2026", keterangan: "Pendaftaran & seleksi gelombang 2" },
  { id: "ev026", judul: "Akhir Semester 2",       tanggalMulai: "2026-06-20", tanggalSelesai: "2026-06-20", tipe: "semester", tahunAjaran: "2025/2026" },
  { id: "ev027", judul: "Libur Kenaikan Kelas",   tanggalMulai: "2026-06-22", tanggalSelesai: "2026-07-12", tipe: "libur",   tahunAjaran: "2025/2026", keterangan: "Libur akhir tahun ajaran & kenaikan kelas" },
  { id: "ev028", judul: "Rapat Kerja Guru",       tanggalMulai: "2026-07-06", tanggalSelesai: "2026-07-07", tipe: "event",   tahunAjaran: "2025/2026", keterangan: "Persiapan tahun ajaran baru 2026/2027" },
];
