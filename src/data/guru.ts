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
    mapel: ["Matematika"], statusKepeg: "GTY", waliKelas: "9A",
    kehadiran: 95, status: "Aktif", jk: "L", tanggalLahir: "15 Maret 1985",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan Matematika — IAIN Cirebon",
    hp: "0812-9876-5432", email: "ahmad.zaki@alittihad.sch.id",
    alamat: "Jl. Pedaleman Dalam No. 3, Babakan, Cirebon", inits: "AZ",
  },
  {
    id: 2, nama: "Hj. Siti Nurlaela, S.Pd.I", nuptk: "2345670881200004", nip: "19750408 200312 2 004",
    mapel: ["Bahasa Arab"], statusKepeg: "PNS", waliKelas: null,
    kehadiran: 92, status: "Aktif", jk: "P", tanggalLahir: "8 April 1975",
    jabatan: "Koordinator PAI", pendidikan: "S1 Pendidikan Bahasa Arab — UIN Jakarta",
    hp: "0813-5678-2345", email: "siti.nurlaela@alittihad.sch.id",
    alamat: "Jl. Raya Pekalipan No. 22, Pekalipan, Cirebon", inits: "SN",
  },
  {
    id: 3, nama: "Ust. Farid Hasan, S.Pd", nuptk: "3456781091200015", nip: "",
    mapel: ["IPS"], statusKepeg: "GTY", waliKelas: "8B",
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
    mapel: ["Tahfidz"], statusKepeg: "GTY", waliKelas: "9C",
    kehadiran: 79, status: "Aktif", jk: "L", tanggalLahir: "3 Desember 1989",
    jabatan: "Koordinator Tahfidz & Wali Kelas", pendidikan: "S1 Pendidikan Agama Islam — UIN Sunan Gunung Djati",
    hp: "0856-7890-1234", email: "ridwan.maulana@alittihad.sch.id",
    alamat: "Jl. Karanggetas No. 18, Kesambi, Cirebon", inits: "RM",
  },
  {
    id: 6, nama: "Ibu Nining Suparni, S.Pd", nuptk: "", nip: "",
    mapel: ["Prakarya"], statusKepeg: "Honorer", waliKelas: null,
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
  {
    id: 8, nama: "Ibu Rina Mariana, M.Pd", nuptk: "9876543210123456", nip: "19820510 200801 2 005",
    mapel: ["IPA"], statusKepeg: "PNS", waliKelas: "8A",
    kehadiran: 98, status: "Aktif", jk: "P", tanggalLahir: "10 Mei 1982",
    jabatan: "Kepala Lab IPA & Wali Kelas", pendidikan: "S2 Pendidikan IPA — UPI Bandung",
    hp: "0811-2233-4455", email: "rina.mariana@alittihad.sch.id",
    alamat: "Jl. Pemuda No. 45, Kesambi, Cirebon", inits: "RM",
  },
  {
    id: 9, nama: "Ust. Lukman Hakim, Lc", nuptk: "8765432109876543", nip: "",
    mapel: ["Fiqih"], statusKepeg: "GTY", waliKelas: null,
    kehadiran: 89, status: "Aktif", jk: "L", tanggalLahir: "25 November 1986",
    jabatan: "Guru Mapel", pendidikan: "S1 Syariah — Universitas Al-Azhar Mesir",
    hp: "0822-3344-5566", email: "lukman.hakim@alittihad.sch.id",
    alamat: "Jl. Cipto Mangunkusumo No. 12, Cirebon", inits: "LH",
  },
  {
    id: 10, nama: "Ibu Kartini, S.Pd", nuptk: "7654321098765432", nip: "",
    mapel: ["PKn"], statusKepeg: "Honorer", waliKelas: "7A",
    kehadiran: 93, status: "Aktif", jk: "P", tanggalLahir: "14 Februari 1990",
    jabatan: "Guru Mapel & Wali Kelas", pendidikan: "S1 Pendidikan Kewarganegaraan — UNNES",
    hp: "0857-1122-3344", email: "kartini@alittihad.sch.id",
    alamat: "Jl. Tuparev No. 88, Kedawung, Cirebon", inits: "KT",
  },
  {
    id: 11, nama: "Ust. Salman Al-Farisi, S.Pd.I", nuptk: "6543210987654321", nip: "",
    mapel: ["PAI"], statusKepeg: "GTY", waliKelas: null,
    kehadiran: 91, status: "Aktif", jk: "L", tanggalLahir: "30 Oktober 1988",
    jabatan: "Guru Mapel", pendidikan: "S1 PAI — IAIN Syekh Nurjati",
    hp: "0819-9988-7766", email: "salman.alfarisi@alittihad.sch.id",
    alamat: "Jl. Fatahillah No. 5, Sumber, Cirebon", inits: "SA",
  },
  {
    id: 12, nama: "Ibu Dian Sastro, S.Sn", nuptk: "", nip: "",
    mapel: ["SBK"], statusKepeg: "Honorer", waliKelas: null,
    kehadiran: 84, status: "Aktif", jk: "P", tanggalLahir: "16 Maret 1995",
    jabatan: "Guru Kesenian", pendidikan: "S1 Seni Rupa — ITB",
    hp: "0813-1122-4455", email: "dian.sastro@alittihad.sch.id",
    alamat: "Jl. Dr. Wahidin No. 21, Kejaksan, Cirebon", inits: "DS",
  },
  {
    id: 13, nama: "Ust. Kevin Sanjaya, S.Pd", nuptk: "5432109876543210", nip: "19851122 201001 1 002",
    mapel: ["Bahasa Inggris"], statusKepeg: "PNS", waliKelas: "9B",
    kehadiran: 96, status: "Aktif", jk: "L", tanggalLahir: "22 November 1985",
    jabatan: "Koordinator Bahasa & Wali Kelas", pendidikan: "S1 Sastra Inggris — UGM",
    hp: "0812-5566-7788", email: "kevin.sanjaya@alittihad.sch.id",
    alamat: "Jl. Veteran No. 10, Cirebon", inits: "KS",
  }
];
