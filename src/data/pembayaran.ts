// ─── Tunggakan Data ────────────────────────────────────────────────────────────

export const tunggakanRows = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", jumlah: 3_500_000, badge: "Kritis",    jatuhTempo: "31 Mar 2026", terakhirBayar: "3 Mar 2026",  inits: "AF" },
  { id: 2, nama: "Siti Rahmawati",        nis: "2023-0145", kelas: "8B", jumlah: 2_800_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "15 Apr 2026", inits: "SR" },
  { id: 3, nama: "Rizky Firmansyah",      nis: "2025-0067", kelas: "7C", jumlah: 2_100_000, badge: "Kritis",    jatuhTempo: "30 Apr 2026", terakhirBayar: "20 Apr 2026", inits: "RF" },
  { id: 4, nama: "Nur Hidayatullah",      nis: "2024-0234", kelas: "9D", jumlah: 1_900_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "10 Mei 2026", inits: "NH" },
  { id: 5, nama: "Muhammad Alif Hakim",   nis: "2023-0312", kelas: "8A", jumlah: 1_750_000, badge: "Waspada",   jatuhTempo: "31 Mei 2026", terakhirBayar: "12 Mei 2026", inits: "MA" },
  { id: 6, nama: "Farah Dianti Putri",    nis: "2025-0089", kelas: "7B", jumlah:   950_000, badge: "Perhatian", jatuhTempo: "20 Jun 2026", terakhirBayar: "8 Jun 2026",  inits: "FD" },
  { id: 7, nama: "Bagas Prasetyo",        nis: "2024-0178", kelas: "9C", jumlah:   875_000, badge: "Perhatian", jatuhTempo: "17 Jun 2026", terakhirBayar: "5 Jun 2026",  inits: "BP" },
  { id: 8, nama: "Aisyah Nur Fadila",     nis: "2023-0456", kelas: "8D", jumlah:   700_000, badge: "Perhatian", jatuhTempo: "22 Jun 2026", terakhirBayar: "10 Jun 2026", inits: "AN" },
];

export const agingTabs = [
  { label: "Semua",           count: 68 },
  { label: "Lewat 1–30 hari", count: 31 },
  { label: "Lewat 31–60 hari",count: 22 },
  { label: "Lewat 60+ hari",  count: 15 },
];

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

export interface TemplateBadgeRef { label: string; key: string }
export interface PenetapanRow {
  id: number; nama: string; nis: string; kelas: string; inits: string;
  templates: TemplateBadgeRef[]; total: number | null; status: string;
}

export const penetapanRows: PenetapanRow[] = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", inits: "AF",
    templates: [{ label: "Adm. Kelas 9", key: "kelas9" }],
    total: 700_000, status: "Lengkap" },
  { id: 2, nama: "Siti Rahmawati", nis: "2023-0145", kelas: "8B", inits: "SR",
    templates: [{ label: "Daftar Ulang", key: "daftar" }],
    total: 350_000, status: "Lengkap" },
  { id: 3, nama: "Rizky Firmansyah", nis: "2025-0067", kelas: "7C", inits: "RF",
    templates: [{ label: "Adm. PPDB", key: "ppdb" }],
    total: 750_000, status: "Lengkap" },
  { id: 4, nama: "Nur Hidayatullah", nis: "2024-0234", kelas: "9D", inits: "NH",
    templates: [{ label: "Daftar Ulang", key: "daftar" }, { label: "Adm. Kelas 9", key: "kelas9" }],
    total: 1_050_000, status: "Lengkap" },
  { id: 5, nama: "Dewi Anggraini Putri", nis: "2023-0312", kelas: "8A", inits: "DA",
    templates: [{ label: "Daftar Ulang", key: "daftar" }],
    total: 350_000, status: "Lengkap" },
  { id: 6, nama: "Bagas Prasetyo", nis: "2025-0089", kelas: "7B", inits: "BP",
    templates: [], total: null, status: "Belum Ditetapkan" },
  { id: 7, nama: "Farah Dianti Putri", nis: "2024-0178", kelas: "9C", inits: "FD",
    templates: [], total: null, status: "Belum Ditetapkan" },
];

export const templateOptions = [
  "Semua Template","Administrasi PPDB","Daftar Ulang","Administrasi Kelas 9",
];

export const pembayaranStudent = {
  nama: "Ahmad Fadhilah Putra",
  nis: "2024-0089",
  kelas: "9A",
  wali: "Bapak Hartono",
  telp: "0812-3456-7890",
  totalTagihan: 4_500_000,
  dibayar: 1_000_000,
  sisa: 3_500_000,
  inits: "AF",
};

export const pembayaranSearchResults = [
  { id: 1, nama: "Ahmad Fadhilah Putra", nis: "2024-0089", kelas: "9A", sisa: 3_500_000, inits: "AF" },
  { id: 2, nama: "Ahmad Fauzi Ridwan", nis: "2023-0145", kelas: "8B", sisa: 450_000, inits: "AF" },
  { id: 3, nama: "Ahmala Kartini", nis: "2025-0067", kelas: "7D", sisa: 0, inits: "AK" },
  { id: 4, nama: "Aisyah Nur Fadhila", nis: "2024-0234", kelas: "9B", sisa: 900_000, inits: "AN" },
];

export const pembayaranTagihanList = [
  // Daftar Ulang package (350.000)
  { prio:  1, kategori: "LKS Semester 1 — Daftar Ulang",                    total: 130_000, dibayar: 0, sisa: 130_000 },
  { prio:  2, kategori: "Iuran Semester 1 & 2 — Daftar Ulang",              total: 170_000, dibayar: 0, sisa: 170_000 },
  { prio:  3, kategori: "Pemeliharaan Lab Komputer — Daftar Ulang",          total:  50_000, dibayar: 0, sisa:  50_000 },
  // Adm. Kelas 9 package (700.000)
  { prio:  4, kategori: "Foto — Adm. Kelas 9",                              total:  40_000, dibayar: 0, sisa:  40_000 },
  { prio:  5, kategori: "Iuran Ujian — Adm. Kelas 9",                       total: 200_000, dibayar: 0, sisa: 200_000 },
  { prio:  6, kategori: "Album — Adm. Kelas 9",                             total:  80_000, dibayar: 0, sisa:  80_000 },
  { prio:  7, kategori: "Medali — Adm. Kelas 9",                            total:  80_000, dibayar: 0, sisa:  80_000 },
  { prio:  8, kategori: "Sampul Ijazah — Adm. Kelas 9",                     total:  50_000, dibayar: 0, sisa:  50_000 },
  { prio:  9, kategori: "Pemeliharaan Lab Komputer — Adm. Kelas 9",         total: 100_000, dibayar: 0, sisa: 100_000 },
  { prio: 10, kategori: "Perpisahan — Adm. Kelas 9",                        total: 150_000, dibayar: 0, sisa: 150_000 },
  // Additional fees (2.450.000)
  { prio: 11, kategori: "Try-out UN (3 Paket) — Kelas 9",                   total: 450_000, dibayar: 0, sisa: 450_000 },
  { prio: 12, kategori: "Wisuda & Pelepasan — Kelas 9",                     total: 600_000, dibayar: 0, sisa: 600_000 },
  { prio: 13, kategori: "Dana Pengembangan Sekolah — TA 2025/2026",         total: 700_000, dibayar: 0, sisa: 700_000 },
  { prio: 14, kategori: "Bimbingan Belajar Intensif — Kelas 9",             total: 500_000, dibayar: 0, sisa: 500_000 },
  { prio: 15, kategori: "Buku Referensi & LKS Semester 2",                  total: 200_000, dibayar: 0, sisa: 200_000 },
  // Total: 3.500.000 = student.sisa
];

export const PPDB_DEFAULTS = [
  { id: 1, nama: "Seragam Batik, Kaos Olahraga & Atribut", nominal: 200_000, keterangan: "" },
  { id: 2, nama: "LKS Semester 1",                          nominal: 130_000, keterangan: "" },
  { id: 3, nama: "Iuran Semester 1 & 2",                    nominal: 120_000, keterangan: "" },
  { id: 4, nama: "Map Raport",                              nominal:  50_000, keterangan: "" },
  { id: 5, nama: "Pemeliharaan Lab Komputer",               nominal:  50_000, keterangan: "" },
  { id: 6, nama: "Infaq Gedung",                            nominal: 200_000, keterangan: "" },
];
