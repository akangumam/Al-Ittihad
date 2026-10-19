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

export const guruData: GuruRow[] = [];
