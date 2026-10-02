// ─── Core Pembayaran Types ───────────────────────────────────────────────────────

export interface TagihanSiswa {
  id: string; // unique ID
  nis: string;
  namaTagihan: string; // e.g. "SPP Bulan Juli 2026", "Administrasi PPDB"
  kategori: string; // e.g. "SPP", "Daftar Ulang"
  nominal: number;
  terbayar: number; // how much has been paid so far
  jatuhTempo: string; // "YYYY-MM-DD"
  isLunas: boolean;
  prioritas?: number;
  keterangan?: string; // Untuk menyimpan catatan diskon, beasiswa, dsb.
}

export interface TransaksiAlokasi {
  tagihanId: string;
  nominalAlokasi: number;
  namaTagihan: string;
}

export interface TransaksiPembayaran {
  id: string;
  nis: string;
  tanggal: string; // ISO string
  nominal: number;
  metode: string; // "Tunai", "Transfer"
  nomorKuitansi: string;
  alokasi: TransaksiAlokasi[];
}

export const initialTagihanSiswa: TagihanSiswa[] = [
  // ── Dimas Ramadhan (2026-0011) — Siswa Baru Kelas 7A ──────────────────────
  { id: "TGH-2026-0011-01", nis: "2026-0011", namaTagihan: "Seragam Batik, Kaos Olahraga & Atribut", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 1 },
  { id: "TGH-2026-0011-02", nis: "2026-0011", namaTagihan: "LKS Semester 1", kategori: "Administrasi PPDB", nominal: 130_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 2 },
  { id: "TGH-2026-0011-03", nis: "2026-0011", namaTagihan: "Iuran Semester 1 & 2", kategori: "Administrasi PPDB", nominal: 120_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 3 },
  { id: "TGH-2026-0011-04", nis: "2026-0011", namaTagihan: "Map Raport", kategori: "Administrasi PPDB", nominal: 50_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 4 },
  { id: "TGH-2026-0011-05", nis: "2026-0011", namaTagihan: "Pemeliharaan Lab Komputer", kategori: "Administrasi PPDB", nominal: 50_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 5 },
  { id: "TGH-2026-0011-06", nis: "2026-0011", namaTagihan: "Infaq Gedung", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 0, jatuhTempo: "2026-09-30", isLunas: false, prioritas: 6 },

  // ── Bagas Syahputra (2026-0001) — Siswa Baru Kelas 7A ─────────────────────
  { id: "TGH-2026-0001-01", nis: "2026-0001", namaTagihan: "Seragam Batik, Kaos Olahraga & Atribut", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 200_000, jatuhTempo: "2026-08-31", isLunas: true, prioritas: 1 },
  { id: "TGH-2026-0001-02", nis: "2026-0001", namaTagihan: "LKS Semester 1", kategori: "Administrasi PPDB", nominal: 130_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 2 },
  { id: "TGH-2026-0001-03", nis: "2026-0001", namaTagihan: "Iuran Semester 1 & 2", kategori: "Administrasi PPDB", nominal: 120_000, terbayar: 60_000, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 3 },
  { id: "TGH-2026-0001-04", nis: "2026-0001", namaTagihan: "Map Raport", kategori: "Administrasi PPDB", nominal: 50_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 4 },
  { id: "TGH-2026-0001-05", nis: "2026-0001", namaTagihan: "Infaq Gedung", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 0, jatuhTempo: "2026-09-30", isLunas: false, prioritas: 5 },

  // ── Aisyah Mahendra (2026-0002) — Siswa Baru Kelas 7A ─────────────────────
  { id: "TGH-2026-0002-01", nis: "2026-0002", namaTagihan: "Seragam Batik, Kaos Olahraga & Atribut", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 200_000, jatuhTempo: "2026-08-31", isLunas: true, prioritas: 1 },
  { id: "TGH-2026-0002-02", nis: "2026-0002", namaTagihan: "LKS Semester 1", kategori: "Administrasi PPDB", nominal: 130_000, terbayar: 130_000, jatuhTempo: "2026-08-31", isLunas: true, prioritas: 2 },
  { id: "TGH-2026-0002-03", nis: "2026-0002", namaTagihan: "Iuran Semester 1 & 2", kategori: "Administrasi PPDB", nominal: 120_000, terbayar: 0, jatuhTempo: "2026-08-31", isLunas: false, prioritas: 3 },
  { id: "TGH-2026-0002-04", nis: "2026-0002", namaTagihan: "Infaq Gedung", kategori: "Administrasi PPDB", nominal: 200_000, terbayar: 0, jatuhTempo: "2026-09-30", isLunas: false, prioritas: 4 },
];

export const initialTransaksiPembayaran: TransaksiPembayaran[] = [];

export interface KasBankItem {
  id: string;
  nama: string;
  tipe: "Kas" | "Bank";
}

export const KAS_BANK_LIST: KasBankItem[] = [
  { id: "kas-1", nama: "Kas Tunai TU", tipe: "Kas" },
  { id: "bank-1", nama: "Bank BSI Sekolah", tipe: "Bank" },
  { id: "bank-2", nama: "Bank Mandiri Syariah", tipe: "Bank" },
];

export const METODE_PEMBAYARAN_LIST = ["Tunai", "Transfer", "QRIS"];

// ─── Tagihan Data ────────────────────────────────────────────────────────────

export interface TemplateComponent { nama: string; jumlah: number }
export interface Template {
  id: number; nama: string; tipe: string; target: string;
  komponen: TemplateComponent[]; total: number; applied: number;
}

export const tagihanTemplates: Template[] = [
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

export const templateOptions = [
  "Semua Template","Administrasi PPDB","Daftar Ulang","Administrasi Kelas 9",
];

export const PPDB_DEFAULTS = [
  { id: 1, nama: "Seragam Batik, Kaos Olahraga & Atribut", nominal: 200_000, keterangan: "" },
  { id: 2, nama: "LKS Semester 1",                          nominal: 130_000, keterangan: "" },
  { id: 3, nama: "Iuran Semester 1 & 2",                    nominal: 120_000, keterangan: "" },
  { id: 4, nama: "Map Raport",                              nominal:  50_000, keterangan: "" },
  { id: 5, nama: "Pemeliharaan Lab Komputer",               nominal:  50_000, keterangan: "" },
  { id: 6, nama: "Infaq Gedung",                            nominal: 200_000, keterangan: "" },
];
