export interface MataPelajaran {
  id: string;
  nama: string;
  kkm: number;
}

export interface NilaiSiswa {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  mapelId: string;
  nilaiTugas: number;
  nilaiUts: number;
  nilaiUas: number;
  nilaiAkhir: number;
  status: "Tuntas" | "Belum Tuntas";
}

export const dataMataPelajaran: MataPelajaran[] = [
  { id: "M01", nama: "Pendidikan Agama Islam", kkm: 75 },
  { id: "M02", nama: "Pendidikan Kewarganegaraan", kkm: 75 },
  { id: "M03", nama: "Bahasa Indonesia", kkm: 75 },
  { id: "M04", nama: "Matematika", kkm: 70 },
  { id: "M05", nama: "Ilmu Pengetahuan Alam", kkm: 70 },
  { id: "M06", nama: "Ilmu Pengetahuan Sosial", kkm: 75 },
  { id: "M07", nama: "Bahasa Inggris", kkm: 75 },
  { id: "M08", nama: "Seni Budaya", kkm: 80 },
  { id: "M09", nama: "Pendidikan Jasmani", kkm: 80 },
];

export const dataNilaiSiswa: NilaiSiswa[] = [
  {
    id: "N001",
    siswaId: "S001",
    namaSiswa: "Ahmad Fauzi",
    nisn: "0051234561",
    kelas: "7A",
    mapelId: "M04",
    nilaiTugas: 80,
    nilaiUts: 75,
    nilaiUas: 85,
    nilaiAkhir: 80,
    status: "Tuntas",
  },
  {
    id: "N002",
    siswaId: "S002",
    namaSiswa: "Budi Santoso",
    nisn: "0051234562",
    kelas: "7A",
    mapelId: "M04",
    nilaiTugas: 65,
    nilaiUts: 60,
    nilaiUas: 70,
    nilaiAkhir: 65,
    status: "Belum Tuntas",
  },
  {
    id: "N003",
    siswaId: "S003",
    namaSiswa: "Citra Kirana",
    nisn: "0051234563",
    kelas: "7A",
    mapelId: "M04",
    nilaiTugas: 90,
    nilaiUts: 88,
    nilaiUas: 92,
    nilaiAkhir: 90,
    status: "Tuntas",
  },
  {
    id: "N004",
    siswaId: "S004",
    namaSiswa: "Dewi Lestari",
    nisn: "0051234564",
    kelas: "7A",
    mapelId: "M04",
    nilaiTugas: 75,
    nilaiUts: 70,
    nilaiUas: 75,
    nilaiAkhir: 73,
    status: "Tuntas",
  },
  {
    id: "N005",
    siswaId: "S005",
    namaSiswa: "Eka Putra",
    nisn: "0051234565",
    kelas: "7A",
    mapelId: "M04",
    nilaiTugas: 60,
    nilaiUts: 55,
    nilaiUas: 60,
    nilaiAkhir: 58,
    status: "Belum Tuntas",
  },
  {
    id: "N006",
    siswaId: "S001",
    namaSiswa: "Ahmad Fauzi",
    nisn: "0051234561",
    kelas: "7A",
    mapelId: "M03",
    nilaiTugas: 85,
    nilaiUts: 80,
    nilaiUas: 85,
    nilaiAkhir: 83,
    status: "Tuntas",
  },
  {
    id: "N007",
    siswaId: "S002",
    namaSiswa: "Budi Santoso",
    nisn: "0051234562",
    kelas: "7A",
    mapelId: "M03",
    nilaiTugas: 78,
    nilaiUts: 75,
    nilaiUas: 80,
    nilaiAkhir: 78,
    status: "Tuntas",
  },
];
