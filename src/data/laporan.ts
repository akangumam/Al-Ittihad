export const SALDO_AWAL = 123_200_000;

export interface BosKomponen {
  id: number;
  komponen: string;
  anggaran: number;
  realisasi: number;
}

export const BOS_KOMPONEN: BosKomponen[] = [
  { id: 1, komponen: "Pengembangan Perpustakaan",      anggaran:   500_000, realisasi:         0 },
  { id: 2, komponen: "Penerimaan Peserta Didik Baru",  anggaran:   300_000, realisasi:         0 },
  { id: 3, komponen: "Pembelajaran & Ekstrakurikuler", anggaran: 1_500_000, realisasi:   750_000 },
  { id: 4, komponen: "Asesmen & Evaluasi",             anggaran:   800_000, realisasi:   400_000 },
  { id: 5, komponen: "Administrasi Madrasah",          anggaran:   600_000, realisasi:   350_000 },
  { id: 6, komponen: "Pengembangan Profesi GTK",       anggaran:   400_000, realisasi:         0 },
  { id: 7, komponen: "Langganan Daya & Jasa",          anggaran: 1_200_000, realisasi: 1_200_000 },
  { id: 8, komponen: "Pemeliharaan Sarana",            anggaran:   700_000, realisasi:   500_000 },
  { id: 9, komponen: "Pembayaran Honor",               anggaran: 1_500_000, realisasi: 1_500_000 },
];
// total anggaran = 7,500,000 (= BOS Triwulan III diterima)
// total realisasi = 4,700,000

