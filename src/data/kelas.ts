export interface JadwalRow {
  id: number;
  kelas: string;
  hari: string;
  jam: number;      // 1 to 8
  mapel: string;
  guruId: number;   // foreign key to GuruRow
  ruang: string;
}

export interface JadwalOverride {
  id: string; // e.g., "2026-08-10_7A_1"
  tanggal: string; // YYYY-MM-DD
  kelas: string;
  jam: number;
  mapel: string | null; // null if cleared/empty
  guruId: number | null; // null if cleared/empty
  ruang: string | null;
}

export interface KelasRow {
  id: string; // e.g. "7A"
  tingkat: string; // "VII", "VIII", "IX"
  waliId: number | null; // foreign key to GuruRow
  kapasitas: number;
}

export const kelasData: KelasRow[] = [
  { id: "7A", tingkat: "VII", waliId: 5, kapasitas: 32 },
  { id: "7B", tingkat: "VII", waliId: 6, kapasitas: 32 },
  { id: "8A", tingkat: "VIII", waliId: 7, kapasitas: 32 },
  { id: "8B", tingkat: "VIII", waliId: null, kapasitas: 32 },
  { id: "9A", tingkat: "IX", waliId: null, kapasitas: 32 },
];

export type ScheduleSegment =
  | { type: "period"; jams: number[]; timeRange: string; subject: string; teacher: string; room: string; conflict?: boolean; conflictNote?: string; teacherId?: number }
  | { type: "empty";  jams: number[]; timeRange: string }
  | { type: "break";  label: string;  time: string };

export const DAYS = ["Sabtu", "Minggu", "Senin", "Selasa", "Rabu", "Kamis"];

export interface WaktuJam {
  id: number;
  type: "period" | "break";
  label: string;
  jam?: number;
  range: string;
}

export const DEFAULT_WAKTU_JAM: WaktuJam[] = [
  { id: 1, type: "period", label: "Jam ke-1", jam: 1, range: "07.00–07.40" },
  { id: 2, type: "period", label: "Jam ke-2", jam: 2, range: "07.40–08.20" },
  { id: 3, type: "period", label: "Jam ke-3", jam: 3, range: "08.20–09.00" },
  { id: 4, type: "period", label: "Jam ke-4", jam: 4, range: "09.00–09.40" },
  { id: 5, type: "break", label: "Istirahat", range: "09.40–10.00" },
  { id: 6, type: "period", label: "Jam ke-5", jam: 5, range: "10.00–10.40" },
  { id: 7, type: "period", label: "Jam ke-6", jam: 6, range: "10.40–11.20" },
  { id: 8, type: "period", label: "Jam ke-7", jam: 7, range: "11.20–12.00" },
  { id: 9, type: "break", label: "Dzuhur", range: "12.00–12.40" },
  { id: 10, type: "period", label: "Jam ke-8", jam: 8, range: "12.40–13.20" },
];

export function getTimeRange(jams: number[], waktuJamList: WaktuJam[]) {
  if (jams.length === 0) return "";
  const start = waktuJamList.find(w => w.type === "period" && w.jam === jams[0])?.range.split("–")[0];
  const end = waktuJamList.find(w => w.type === "period" && w.jam === jams[jams.length - 1])?.range.split("–")[1];
  return `${start}–${end}`;
}
