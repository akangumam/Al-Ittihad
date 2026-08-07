// ─── KasBank Data ────────────────────────────────────────────────────────────

export const transaksiData = [
  { id: 1, tanggal: "13 Jul 2026", keterangan: "Pembayaran Daftar Ulang",          kategori: "Daftar Ulang",akun: "Bank BSI",            ref: "KW/2026/07/0142", jumlah:   350_000, tipe: "masuk"  },
  { id: 2, tanggal: "13 Jul 2026", keterangan: "Pembayaran Adm. PPDB",             kategori: "PPDB",        akun: "Kas Tunai",           ref: "KW/2026/07/0141", jumlah:   250_000, tipe: "masuk"  },
  { id: 3, tanggal: "12 Jul 2026", keterangan: "Penerimaan Dana BOS Triwulan III", kategori: "Dana BOS",    akun: "Bank BSI",            ref: "—",               jumlah: 7_500_000, tipe: "masuk"  },
  { id: 4, tanggal: "12 Jul 2026", keterangan: "Cicilan Administrasi PPDB",        kategori: "PPDB",        akun: "Bank BSI",            ref: "KW/2026/07/0139", jumlah:   175_000, tipe: "masuk"  },
  { id: 5, tanggal: "11 Jul 2026", keterangan: "Pembelian ATK dan Perlengkapan",   kategori: "Operasional", akun: "Kas Tunai",           ref: "—",               jumlah:   500_000, tipe: "keluar" },
  { id: 6, tanggal: "10 Jul 2026", keterangan: "Honor Pengajar Ekstrakurikuler",   kategori: "Honor",       akun: "Bank BSI",            ref: "—",               jumlah: 1_500_000, tipe: "keluar" },
  { id: 7, tanggal: "10 Jul 2026", keterangan: "Pembayaran Tagihan Listrik & Air", kategori: "Utilitas",    akun: "Bank Mandiri Syariah",ref: "—",               jumlah: 1_200_000, tipe: "keluar" },
  { id: 8, tanggal: "9 Jul 2026",  keterangan: "Pembayaran Kegiatan Siswa",        kategori: "Kegiatan",    akun: "Kas Tunai",           ref: "KW/2026/07/0131", jumlah:   175_000, tipe: "masuk"  },
];

export const BSI_SPARK    = [83.5,82.1,84.2,83.8,85.0,84.3,83.9,85.2,84.7,86.1,85.3,84.9,83.8,85.1,84.6,83.7,85.4,84.8,86.3,85.2,84.5,83.9,85.6,84.2,83.8,85.3,84.9,86.2,85.1,85.2];
export const MANDIRI_SPARK= [31.8,32.2,31.9,32.4,32.1,31.7,32.5,32.3,31.8,32.6,32.1,31.9,32.7,32.2,31.8,32.9,32.4,31.7,32.8,32.5,32.0,31.8,32.6,32.3,32.7,32.4,32.1,32.8,32.7,32.75];
export const KAS_SPARK    = [8.5,9.2,10.1,7.8,11.2,9.5,8.8,12.1,10.5,9.8,8.5,11.5,10.2,9.0,8.7,10.8,9.5,8.2,11.0,9.8,8.5,10.5,9.2,8.8,11.5,10.0,9.5,8.8,10.2,10.5];

export const akunData = [
  { id: 1, nama: "Bank BSI",            nomor: "7101-0254-3318", saldo: 85_200_000, spark: BSI_SPARK,     sparkColor: "#3E8A2F", icon: "bank",   rekonsiliasi: "30 Jun 2026" },
  { id: 2, nama: "Bank Mandiri Syariah",nomor: "1234-5678-9021", saldo: 32_750_000, spark: MANDIRI_SPARK, sparkColor: "#57A946", icon: "bank",   rekonsiliasi: "30 Jun 2026" },
  { id: 3, nama: "Kas Tunai",           nomor: null,             saldo: 10_500_000, spark: KAS_SPARK,     sparkColor: "#F6B31E", icon: "wallet", rekonsiliasi: "30 Jun 2026" },
];

export const mutasiData = [
  { id: 1, tanggal: "13 Jul 2026", dari: "Kas Tunai",  ke: "Bank BSI",            nominal: 5_000_000,  catatan: "Setoran tunai mingguan",      status: "Selesai" },
  { id: 2, tanggal: "7 Jul 2026",  dari: "Kas Tunai",  ke: "Bank BSI",            nominal: 3_500_000,  catatan: "Setoran tunai mingguan",      status: "Selesai" },
  { id: 3, tanggal: "5 Jul 2026",  dari: "Bank BSI",   ke: "Bank Mandiri Syariah",nominal: 10_000_000, catatan: "Alokasi dana operasional",    status: "Selesai" },
  { id: 4, tanggal: "1 Jul 2026",  dari: "Kas Tunai",  ke: "Bank BSI",            nominal: 4_200_000,  catatan: "Setoran tunai mingguan",      status: "Selesai" },
];

export const kategoriOptions = ["Semua Kategori","Daftar Ulang","PPDB","Kelas 9","Dana BOS","Operasional","Honor","Utilitas","Kegiatan"];


// ─── Anggaran Data ─────────────────────────────────────────────────────────────

export interface RABRow {
  id: number; group: string; nama: string;
  anggaran: number; terpakai: number;
}

export const RAB_DATA: RABRow[] = [
  // OPERASIONAL – A=85M T=60.45M
  { id:1, group:"OPERASIONAL",      nama:"Listrik & Air",             anggaran: 30_000_000, terpakai: 31_200_000 },
  { id:2, group:"OPERASIONAL",      nama:"ATK & Administrasi",        anggaran: 15_000_000, terpakai: 11_250_000 },
  { id:3, group:"OPERASIONAL",      nama:"Pemeliharaan Gedung",       anggaran: 40_000_000, terpakai: 18_000_000 },
  // KEGIATAN SISWA – A=65M T=22M
  { id:4, group:"KEGIATAN SISWA",   nama:"Kegiatan Porseni",          anggaran: 25_000_000, terpakai: 22_000_000 },
  { id:5, group:"KEGIATAN SISWA",   nama:"Study Tour & Outing",       anggaran: 40_000_000, terpakai:          0 },
  // SARANA PRASARANA – A=200M T=85M
  { id:6, group:"SARANA PRASARANA", nama:"Pengadaan Perangkat TIK",   anggaran:120_000_000, terpakai: 85_000_000 },
  { id:7, group:"SARANA PRASARANA", nama:"Renovasi Perpustakaan",     anggaran: 80_000_000, terpakai:          0 },
  // GAJI & HONOR – A=500M T=145.05M
  { id:8, group:"GAJI & HONOR",     nama:"Gaji & Tunjangan GTY",      anggaran:420_000_000, terpakai:140_000_000 },
  { id:9, group:"GAJI & HONOR",     nama:"Honor Kegiatan & Panitia",  anggaran: 80_000_000, terpakai:  5_050_000 },
];

export const GROUPS = ["OPERASIONAL","KEGIATAN SISWA","SARANA PRASARANA","GAJI & HONOR"];

export const TOTAL_A = 850_000_000;
export const TOTAL_T = 312_500_000;
export const TOTAL_S = TOTAL_A - TOTAL_T;          // 537_500_000
export const TOTAL_P = Math.round((TOTAL_T / TOTAL_A) * 100); // 37

export const MONTHS = ["Jul","Agt","Sep","Okt","Nov","Des","Jan","Feb","Mar","Apr","Mei","Jun"];
export const ANGGARAN_M = [45,65,70,75,65,80,75,65,70,60,65,115]; // juta — sum 850
export const REALISASI_M = [38,42,45,30,28,35,28,22,20,18,5,1.5]; // juta — sum 312.5

export const TOP5 = [
  { nama:"Listrik & Air",           pct:104, anggaran: 30_000_000, terpakai: 31_200_000 },
  { nama:"Kegiatan Porseni",         pct:88,  anggaran: 25_000_000, terpakai: 22_000_000 },
  { nama:"ATK & Administrasi",       pct:75,  anggaran: 15_000_000, terpakai: 11_250_000 },
  { nama:"Pengadaan Perangkat TIK",  pct:71,  anggaran:120_000_000, terpakai: 85_000_000 },
  { nama:"Pemeliharaan Gedung",      pct:45,  anggaran: 40_000_000, terpakai: 18_000_000 },
];
