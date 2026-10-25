import { siswaData } from "@/data/siswa";

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
  akun?: string;
  catatan?: string;
  dicatatOleh?: string;
}

// ─── Template komponen (mirrors tagihanTemplates below, used by generator) ────

const PPDB_KOMPS = [
  { nama: "Seragam Batik, Kaos Olahraga & Atribut", jumlah: 200_000 },
  { nama: "LKS Semester 1",                          jumlah: 130_000 },
  { nama: "Iuran Semester 1 & 2",                    jumlah: 120_000 },
  { nama: "Map Raport",                              jumlah:  50_000 },
  { nama: "Pemeliharaan Lab Komputer",               jumlah:  50_000 },
  { nama: "Infaq Gedung",                            jumlah: 200_000 },
] as const;

const DU_KOMPS = [
  { nama: "LKS Semester 1",            jumlah: 130_000 },
  { nama: "Iuran Semester 1 & 2",      jumlah: 170_000 },
  { nama: "Pemeliharaan Lab Komputer",  jumlah:  50_000 },
] as const;

const K9_KOMPS = [
  { nama: "Foto",                       jumlah:  40_000 },
  { nama: "Iuran Ujian",               jumlah: 200_000 },
  { nama: "Album",                     jumlah:  80_000 },
  { nama: "Medali",                    jumlah:  80_000 },
  { nama: "Sampul Ijazah",             jumlah:  50_000 },
  { nama: "Pemeliharaan Lab Komputer", jumlah: 100_000 },
  { nama: "Perpisahan",                jumlah: 150_000 },
] as const;

// Waterfall-paid amounts for Mencicil students (deterministic by student id % length)
// Each value represents cumulative payment — allocate() distributes to components in order.
const PPDB_MENCICIL = [200_000, 330_000, 450_000, 500_000, 550_000, 650_000]; // 750k total
const DU_MENCICIL   = [130_000, 200_000, 300_000];                             // 350k total
const K9_MENCICIL   = [40_000,  240_000, 320_000, 450_000, 560_000, 650_000]; // 700k total

function allocate(
  komps: readonly { nama: string; jumlah: number }[],
  totalPaid: number,
  nis: string,
  kategori: string,
  jatuhTempos: string[],
  idOffset: number,
): TagihanSiswa[] {
  let remaining = totalPaid;
  return komps.map((k, i) => {
    const terbayar = Math.min(remaining, k.jumlah);
    remaining -= terbayar;
    return {
      id: `TGH-${nis}-${String(idOffset + i + 1).padStart(2, "0")}`,
      nis,
      namaTagihan: k.nama,
      kategori,
      nominal: k.jumlah,
      terbayar,
      jatuhTempo: jatuhTempos[i] ?? jatuhTempos[jatuhTempos.length - 1],
      isLunas: terbayar === k.jumlah,
      prioritas: i + 1,
    };
  });
}

function generateTagihanSeed(): TagihanSiswa[] {
  const rows: TagihanSiswa[] = [];
  for (const s of siswaData) {
    if (s.status !== "Aktif") continue;
    const kelas = s.kelas[0]; // "7", "8", "9"
    const spp = s.statusTagihan;

    if (kelas === "7") {
      const paid = spp === "Lunas" ? 750_000
        : spp === "Menunggak" ? 0
        : PPDB_MENCICIL[s.id % PPDB_MENCICIL.length];
      rows.push(...allocate(PPDB_KOMPS, paid, s.nis, "Administrasi PPDB",
        ["2026-08-31","2026-08-31","2026-08-31","2026-08-31","2026-08-31","2026-09-30"], 0));
    }

    if (kelas === "8" || kelas === "9") {
      const paid = spp === "Lunas" ? 350_000
        : spp === "Menunggak" ? 0
        : DU_MENCICIL[s.id % DU_MENCICIL.length];
      rows.push(...allocate(DU_KOMPS, paid, s.nis, "Daftar Ulang",
        ["2026-08-31","2026-08-31","2026-08-31"], 0));
    }

    if (kelas === "9") {
      const paid = spp === "Lunas" ? 700_000
        : spp === "Menunggak" ? 0
        : K9_MENCICIL[s.id % K9_MENCICIL.length];
      // idOffset=3 so K9 IDs start at -04 (DU uses -01..-03)
      rows.push(...allocate(K9_KOMPS, paid, s.nis, "Administrasi Kelas 9",
        Array<string>(K9_KOMPS.length).fill("2026-09-30"), 3));
    }
  }
  return rows;
}

export const initialTagihanSiswa: TagihanSiswa[] = [];

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
    tipe: "PPDB", target: "Siswa Baru", applied: 0,
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
    tipe: "Daftar Ulang", target: "Siswa Lama (Kelas 8 & 9)", applied: 0,
    komponen: [
      { nama: "LKS Semester 1",           jumlah: 130_000 },
      { nama: "Iuran Semester 1 & 2",     jumlah: 170_000 },
      { nama: "Pemeliharaan Lab Komputer", jumlah:  50_000 },
    ],
    total: 350_000,
  },
  {
    id: 3, nama: "Administrasi Kelas 9",
    tipe: "Kelas 9", target: "Khusus Kelas 9", applied: 0,
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
