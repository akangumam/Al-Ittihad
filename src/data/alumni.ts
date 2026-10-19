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

export const alumniData: AlumniRow[] = [];
