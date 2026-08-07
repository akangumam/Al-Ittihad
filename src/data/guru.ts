export interface GuruRow {
  id: number;
  nama: string;
  nuptk: string;
  nip: string;
  mapel: string[];
  statusKepeg: "PNS" | "GTY" | "Honorer";
  waliKelas: string | null;
  kehadiran: number;
  status: "Aktif" | "Nonaktif";
  jk: "L" | "P";
  tanggalLahir: string;
  jabatan: string;
  pendidikan: string;
  hp: string;
  email: string;
  alamat: string;
  inits: string;
}

export const guruData: GuruRow[] = [
  {
    id: 1, nama: "Ust. Ahmad Zaki, S.Pd", nuptk: "1245760661200013", nip: "",
    mapel: ["Matematika", "IPA"], statusKepeg: "GTY", waliKelas: "9A",
    kehadiran: 95, status: "Aktif", jk: "L", tanggalLahir: "15 Maret 1985",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan Matematika — IAIN Cirebon",
    hp: "0812-9876-5432", email: "ahmad.zaki@alittihad.sch.id",
    alamat: "Jl. Pedaleman Dalam No. 3, Babakan, Cirebon", inits: "AZ",
  },
  {
    id: 2, nama: "Hj. Siti Nurlaela, S.Pd.I", nuptk: "2345670881200004", nip: "19750408 200312 2 004",
    mapel: ["Bahasa Arab", "Fiqih"], statusKepeg: "PNS", waliKelas: null,
    kehadiran: 92, status: "Aktif", jk: "P", tanggalLahir: "8 April 1975",
    jabatan: "Guru Mapel & Koordinator PAI", pendidikan: "S1 Pendidikan Bahasa Arab — UIN Jakarta",
    hp: "0813-5678-2345", email: "siti.nurlaela@alittihad.sch.id",
    alamat: "Jl. Raya Pekalipan No. 22, Pekalipan, Cirebon", inits: "SN",
  },
  {
    id: 3, nama: "Ust. Farid Hasan, S.Pd", nuptk: "3456781091200015", nip: "",
    mapel: ["IPS", "PKn"], statusKepeg: "GTY", waliKelas: "8B",
    kehadiran: 88, status: "Aktif", jk: "L", tanggalLahir: "22 Juli 1987",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan IPS — UNIKU Kuningan",
    hp: "0821-3456-7890", email: "farid.hasan@alittihad.sch.id",
    alamat: "Jl. Kramat No. 11, Argasunya, Cirebon", inits: "FH",
  },
  {
    id: 4, nama: "Ibu Dewi Rahmawati, S.Pd", nuptk: "4567892301200002", nip: "19800115 200501 2 003",
    mapel: ["Bahasa Indonesia"], statusKepeg: "PNS", waliKelas: "7C",
    kehadiran: 97, status: "Aktif", jk: "P", tanggalLahir: "15 Januari 1980",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Bahasa & Sastra Indonesia — UNSWAGATI Cirebon",
    hp: "0877-8901-2345", email: "dewi.rahmawati@alittihad.sch.id",
    alamat: "Jl. Sukalila Selatan No. 7, Kejaksan, Cirebon", inits: "DR",
  },
  {
    id: 5, nama: "Ust. Ridwan Maulana, S.Pd.I", nuptk: "5678900511200011", nip: "",
    mapel: ["Tahfidz", "PAI"], statusKepeg: "GTY", waliKelas: "9C",
    kehadiran: 79, status: "Aktif", jk: "L", tanggalLahir: "3 Desember 1989",
    jabatan: "Koordinator Tahfidz & Wali Kelas", pendidikan: "S1 Pendidikan Agama Islam — UIN Sunan Gunung Djati",
    hp: "0856-7890-1234", email: "ridwan.maulana@alittihad.sch.id",
    alamat: "Jl. Karanggetas No. 18, Kesambi, Cirebon", inits: "RM",
  },
  {
    id: 6, nama: "Ibu Nining Suparni, S.Pd", nuptk: "", nip: "",
    mapel: ["Prakarya", "SBK"], statusKepeg: "Honorer", waliKelas: null,
    kehadiran: 71, status: "Aktif", jk: "P", tanggalLahir: "9 Agustus 1993",
    jabatan: "Guru Honorer", pendidikan: "D3 Seni Rupa — ISBI Bandung",
    hp: "0812-3456-8901", email: "nining.suparni@alittihad.sch.id",
    alamat: "Jl. Panjunan No. 34, Lemahwungkuk, Cirebon", inits: "NS",
  },
  {
    id: 7, nama: "Ust. Budi Santoso, S.Pd", nuptk: "7890123561200007", nip: "",
    mapel: ["Penjaskes"], statusKepeg: "Honorer", waliKelas: "7B",
    kehadiran: 85, status: "Aktif", jk: "L", tanggalLahir: "17 Juni 1991",
    jabatan: "Guru Olahraga & Wali Kelas", pendidikan: "S1 Pendidikan Jasmani — UNSIL Tasikmalaya",
    hp: "0821-6789-0123", email: "budi.santoso@alittihad.sch.id",
    alamat: "Jl. Lawanggada No. 9, Kasepuhan, Cirebon", inits: "BS",
  },
];
