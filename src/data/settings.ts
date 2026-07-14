import type { AppSettings } from "@/types";

export const defaultSettings: AppSettings = {
  tahunAjaran: "2025/2026",
  jamMasukGuru: "07:00",
  kapasitasKelas: 32,
  formatKuitansi: "KW/{TAHUN}/{BULAN}/{URUT}",
  namaMadrasah: "MTs Al-Ittihad Pedaleman",
  alamatMadrasah: "Jl. Pedaleman, Babakan, Cirebon",
};

export const tahunAjaranOptions = [
  "2025/2026",
  "2024/2025",
  "2023/2024",
];

export const kelasOptions = [
  "Semua Kelas",
  "Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D",
  "Kelas 8A", "Kelas 8B", "Kelas 8C", "Kelas 8D",
  "Kelas 9A", "Kelas 9B", "Kelas 9C", "Kelas 9D",
];
