// ─── KasBank Data ────────────────────────────────────────────────────────────

export interface TransaksiRow {
  id: number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  akun: string;
  ref: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
}

export const transaksiData: TransaksiRow[] = [];

export const BSI_SPARK    = [0, 0, 0];
export const MANDIRI_SPARK= [0, 0, 0];
export const KAS_SPARK    = [0, 0, 0];

export const akunData = [
  { id: 1, nama: "Bank BSI",            nomor: "7101-0254-3318", saldo: 0, spark: BSI_SPARK,     sparkColor: "#3E8A2F", icon: "bank",   rekonsiliasi: "—" },
  { id: 2, nama: "Bank Mandiri Syariah",nomor: "1234-5678-9021", saldo: 0, spark: MANDIRI_SPARK, sparkColor: "#57A946", icon: "bank",   rekonsiliasi: "—" },
  { id: 3, nama: "Kas Tunai",           nomor: null,             saldo: 0, spark: KAS_SPARK,     sparkColor: "#F6B31E", icon: "wallet", rekonsiliasi: "—" },
];

export interface MutasiBankRow {
  id: number;
  tanggal: string;
  dari: string;
  ke: string;
  nominal: number;
  catatan: string;
  status: string;
}

export const mutasiData: MutasiBankRow[] = [];

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
