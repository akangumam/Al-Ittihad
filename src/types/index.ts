import type { ElementType } from "react";

// ─── Domain types ──────────────────────────────────────────────────────────────

export type JenisKelamin = "L" | "P";

export type StatusTagihan = "Lunas" | "Mencicil" | "Menunggak";

export type StatusKehadiran = "Hadir" | "Izin" | "Alpa" | "Terlambat";

export type AgingBadge = "Perhatian" | "Waspada" | "Kritis";

export type Role = "Admin" | "Bendahara" | "TU";

export type StatusSiswa = "Aktif" | "Nonaktif";

// ─── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  icon: ElementType;
  label: string;
  badge?: number;
  /** URL path segment, mis. "dashboard", "siswa". Kosong = belum ada halaman. */
  path?: string;
}

export interface NavGroup {
  group: string | null;
  items: NavItem[];
}

// ─── Entities ──────────────────────────────────────────────────────────────────

export interface SiswaRow {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kelas: string;
  jk: JenisKelamin;
  waliNama: string;
  waliHp: string;
  statusTagihan: StatusTagihan;
  status: StatusSiswa;
  inits: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaAyah: string;
  namaIbu: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
}

export interface GuruRow {
  id: number;
  nama: string;
  nip?: string;
  nuptk?: string;
  mapel: string[];
  kelas?: string;
  status: "PNS" | "GTY" | "Honorer";
  jk: JenisKelamin;
  noHp?: string;
  inits: string;
}

export interface TunggakanRow {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  jumlah: number;
  badge: AgingBadge;
  jatuhTempo: string;
  terakhirBayar: string;
  inits: string;
}

// ─── Settings (single source of truth per CLAUDE.md §6) ───────────────────────

export interface AppSettings {
  tahunAjaran: string;
  /** Format: "HH:mm", default "07:00" */
  jamMasukGuru: string;
  kapasitasKelas: number;
  formatKuitansi: string;
  namaMadrasah: string;
  alamatMadrasah: string;
}

export interface AbsensiSettings {
  batasHadir: string;        // e.g. "08:00"
  batasTerlambat: string;    // e.g. "08:15"
  jamBuka: string;           // e.g. "06:30"
  jamTutupOtomatis: string;  // e.g. "09:00"
  enableFingerprint: boolean;
  enableQR: boolean;
  enableManual: boolean;
}


export type ActivityLogTipe =
  | "Login"
  | "Logout"
  | "Pembayaran"
  | "Pembatalan"
  | "Penetapan Tagihan"
  | "Update Tagihan"
  | "Hapus Tagihan";

export interface ActivityLogEntry {
  id: string;
  waktu: string;        // ISO timestamp
  tipe: ActivityLogTipe;
  deskripsi: string;
  ref: string;          // no. kuitansi atau "—"
  pelaku: string;
}

export interface AbsensiGerbangRecord {
  id: string;
  tanggal: string;           // "YYYY-MM-DD"
  personId: string;          // NIS or Guru ID (stringified)
  personType: "siswa" | "guru";
  waktuScan: string;         // "HH:mm:ss"
  status: StatusKehadiran;
  method: "qr" | "fingerprint" | "manual";
  adminId?: string;          // optional for manual entry
  catatan?: string;
}
