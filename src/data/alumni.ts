export interface AlumniRow {
  id: number;
  nis: string;
  nisn: string;
  nama: string;
  jk: "L" | "P";
  inits: string;
  tahunLulus: string;
  angkatan: number;
  keterangan: string; // Misal: Melanjutkan ke SMAN 1, Bekerja, dll.
  foto?: string;
  wa?: string;
}

export const alumniData: AlumniRow[] = [
  {
    id: 101,
    nis: "2018001",
    nisn: "0051234567",
    nama: "Fajar Nugraha",
    jk: "L",
    inits: "FN",
    tahunLulus: "2021",
    angkatan: 15,
    keterangan: "Melanjutkan ke SMAN 1",
    wa: "081234567890"
  },
  {
    id: 102,
    nis: "2018002",
    nisn: "0052345678",
    nama: "Salsa Bila",
    jk: "P",
    inits: "SB",
    tahunLulus: "2021",
    angkatan: 15,
    keterangan: "Melanjutkan ke MAN 2",
    wa: "082345678901"
  },
  {
    id: 103,
    nis: "2019001",
    nisn: "0063456789",
    nama: "Rizky Firmansyah",
    jk: "L",
    inits: "RF",
    tahunLulus: "2022",
    angkatan: 16,
    keterangan: "Melanjutkan ke SMKN 4",
    wa: "083456789012"
  },
  {
    id: 104,
    nis: "2020005",
    nisn: "0074567890",
    nama: "Anisa Rahmawati",
    jk: "P",
    inits: "AR",
    tahunLulus: "2023",
    angkatan: 17,
    keterangan: "Pesantren Darussalam",
    wa: "084567890123"
  }
];
