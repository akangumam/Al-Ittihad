export interface SiswaRow {
  id: number; nama: string; nis: string; nisn: string;
  kelas: string; jk: "L" | "P";
  waliNama: string; waliHp: string;
  statusSPP: "Lunas" | "Mencicil" | "Menunggak";
  status: "Aktif" | "Nonaktif"; inits: string;
  tempatLahir: string; tanggalLahir: string;
  namaAyah: string; namaIbu: string;
  alamat: string; kelurahan: string; kecamatan: string;
}

export const siswaData: SiswaRow[] = [
  { id:1,  nama:"Ahmad Fadhilah Putra",  nis:"2024-0089", nisn:"0089432156", kelas:"9A", jk:"L", waliNama:"H. Fadhilah Hakim",    waliHp:"0812-3456-7890", statusSPP:"Menunggak", status:"Aktif",    inits:"AF", tempatLahir:"Cirebon",   tanggalLahir:"12 Februari 2010", namaAyah:"H. Fadhilah Hakim",  namaIbu:"Sari Wahyuni",     alamat:"Jl. Pedaleman No. 45, RT 02/RW 03",       kelurahan:"Pedaleman",  kecamatan:"Babakan" },
  { id:2,  nama:"Siti Rahmawati",         nis:"2023-0145", nisn:"0091234567", kelas:"8B", jk:"P", waliNama:"Hj. Rahmah Hidayah", waliHp:"0813-5678-9012", statusSPP:"Menunggak", status:"Aktif",    inits:"SR", tempatLahir:"Kuningan",  tanggalLahir:"7 Maret 2011",    namaAyah:"Rahmat Hidayah",     namaIbu:"Hj. Rahmah",       alamat:"Jl. Manggu Besar No. 12, RT 01/RW 05",   kelurahan:"Manggu",     kecamatan:"Argasunya" },
  { id:3,  nama:"Rizky Firmansyah",       nis:"2025-0067", nisn:"0109876543", kelas:"7C", jk:"L", waliNama:"Firmansyah Yusuf",   waliHp:"0821-9876-5432", statusSPP:"Menunggak", status:"Aktif",    inits:"RF", tempatLahir:"Cirebon",   tanggalLahir:"3 Agustus 2012",  namaAyah:"Firmansyah Yusuf",   namaIbu:"Dewi Lestari",     alamat:"Jl. Kesambi No. 8, RT 04/RW 02",          kelurahan:"Kesambi",    kecamatan:"Kesambi" },
  { id:4,  nama:"Nur Hidayatullah",       nis:"2024-0234", nisn:"0087654321", kelas:"9D", jk:"L", waliNama:"Hidayat Kurnia",     waliHp:"0856-1234-5678", statusSPP:"Menunggak", status:"Aktif",    inits:"NH", tempatLahir:"Cirebon",   tanggalLahir:"19 November 2010",namaAyah:"Hidayat Kurnia",     namaIbu:"Nurul Aini",       alamat:"Jl. Pelandakan No. 23, RT 03/RW 01",      kelurahan:"Pelandakan", kecamatan:"Lemahwungkuk" },
  { id:5,  nama:"Dewi Anggraini Putri",   nis:"2023-0312", nisn:"0093456789", kelas:"8A", jk:"P", waliNama:"Susanto Anggraini",  waliHp:"0877-8765-4321", statusSPP:"Lunas",     status:"Aktif",    inits:"DA", tempatLahir:"Indramayu", tanggalLahir:"5 April 2011",    namaAyah:"Susanto Anggraini",  namaIbu:"Sri Mulyati",      alamat:"Jl. Sukalila No. 17, RT 02/RW 04",        kelurahan:"Sukalila",   kecamatan:"Kejaksan" },
  { id:6,  nama:"Bagas Prasetyo",         nis:"2024-0178", nisn:"0112345678", kelas:"9C", jk:"L", waliNama:"Prasetyo Wibowo",   waliHp:"0812-2345-6789", statusSPP:"Mencicil",  status:"Aktif",    inits:"BP", tempatLahir:"Cirebon",   tanggalLahir:"28 Januari 2012", namaAyah:"Prasetyo Wibowo",    namaIbu:"Emi Susanti",      alamat:"Jl. Lawanggada No. 5, RT 01/RW 02",       kelurahan:"Kasepuhan",  kecamatan:"Lemahwungkuk" },
  { id:7,  nama:"Farah Dianti Putri",     nis:"2025-0089", nisn:"0088765432", kelas:"7B", jk:"P", waliNama:"Dianti Rahayu",     waliHp:"0813-4567-8901", statusSPP:"Mencicil",  status:"Aktif",    inits:"FD", tempatLahir:"Cirebon",   tanggalLahir:"14 Juni 2010",    namaAyah:"Rohmad Dianti",      namaIbu:"Siti Rahayu",      alamat:"Jl. Pulasaren No. 9, RT 05/RW 03",        kelurahan:"Pulasaren",  kecamatan:"Pekalipan" },
  { id:8,  nama:"Aisyah Nur Fadila",      nis:"2023-0456", nisn:"0072345678", kelas:"8D", jk:"P", waliNama:"Muharam Fadila",    waliHp:"0821-5678-9012", statusSPP:"Menunggak",     status:"Nonaktif", inits:"AN", tempatLahir:"Brebes",    tanggalLahir:"22 September 2010",namaAyah:"Muharam Fadila",    namaIbu:"Yanti Setiawati",  alamat:"Jl. Kampung Baru No. 33, RT 06/RW 04",    kelurahan:"Gunungjati", kecamatan:"Gunungjati" },
];
