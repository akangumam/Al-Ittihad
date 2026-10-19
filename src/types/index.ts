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

export type { SiswaRow } from "@/data/siswa";
export type { GuruRow } from "@/data/guru";

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
  /** Format: "HH:mm", default "07:00" */
  jamMasukSiswa?: string;
  kapasitasKelas: number;
  formatKuitansi: string;
  namaMadrasah: string;
  alamatMadrasah: string;
  kirimWA: boolean;
  tahunAjaranRows?: { year: string; status: "Aktif" | "Arsip" | "Draft" }[];
  // ─── WAHA (WhatsApp HTTP API) ──────────────────────────────────────────────
  wahaEnabled: boolean;
  wahaUrl: string;       // e.g. "https://waha.alittihadpedaleman.web.id"
  wahaApiKey: string;
  wahaSession: string;   // default "alittihad"
}


export type JenisMutasi = "masuk" | "pindah" | "dikeluarkan" | "meninggal";

export interface MutasiRecord {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jk: JenisKelamin;
  jenisMutasi: JenisMutasi;
  tanggal: string;           // "YYYY-MM-DD"
  sekolahAsal?: string;      // diisi saat masuk
  sekolahTujuan?: string;    // diisi saat pindah
  alasan: string;
  dicatatOleh: string;
  waktuCatat: string;        // ISO timestamp
}

export type AkunNama = "Bank BSI" | "Bank Mandiri Syariah" | "Kas Tunai";

export interface ManualTransaksiRow {
  id: string;
  tipe: "masuk" | "keluar";
  tanggal: string;        // "YYYY-MM-DD"
  keterangan: string;
  kategori: string;
  akun: AkunNama;
  jumlah: number;
  ref: string;            // "BV/YYYY/MM/NNN" atau "—"
  catatan?: string;
  dicatatOleh: string;
  waktuCatat: string;     // ISO timestamp
}

export interface BankTransferRow {
  id: string;
  tanggal: string;   // "YYYY-MM-DD"
  dari: string;      // akun asal
  ke: string;        // akun tujuan
  nominal: number;
  catatan: string;
  status: "Selesai" | "Pending";
  dicatatOleh: string;
  waktuCatat: string;
}

export type ActivityLogTipe =
  | "Login"
  | "Logout"
  | "Pembayaran"
  | "Pembatalan"
  | "Penetapan Tagihan"
  | "Update Tagihan"
  | "Hapus Tagihan"
  | "Mutasi Siswa"
  | "Absensi Siswa"
  | "Absensi Guru";

export interface ActivityLogEntry {
  id: string;
  waktu: string;        // ISO timestamp
  tipe: ActivityLogTipe;
  deskripsi: string;
  ref: string;          // no. kuitansi atau "—"
  pelaku: string;
}

