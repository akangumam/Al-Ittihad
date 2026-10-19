import type { JenisKelamin, StatusTagihan, StatusSiswa } from "@/types";

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
  asalSekolah?: string;
  tahunMasuk?: string;
}

export const siswaData: SiswaRow[] = [];
