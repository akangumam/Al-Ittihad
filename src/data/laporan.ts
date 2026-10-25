// Data Laporan Keuangan MTs Al-Ittihad Pedaleman
// Saldo awal dihitung dinamis dari akun riil Kas & Bank (atau Rp 0 jika belum ada).
export const SALDO_AWAL = 0;

export interface BosKomponen {
  id: number;
  komponen: string;
  anggaran: number;
  realisasi: number;
}

// Komponen BOS kosong saat awal mula operasional madrasah
export const BOS_KOMPONEN: BosKomponen[] = [];
