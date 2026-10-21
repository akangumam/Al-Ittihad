import { supabase } from "@/lib/supabase";
import type { SiswaRow } from "@/data/siswa";
import type { AlumniRow } from "@/data/alumni";

// ─── Type mapping: DB (snake_case) ↔ App (camelCase) ─────────────────────────

export function rowToSiswa(r: Record<string, any>): SiswaRow {
  return {
    id:            r.id,
    nis:           r.nis,
    nisn:          r.nisn ?? "",
    nama:          r.nama,
    jk:            r.jk,
    kelas:         r.kelas ?? "",
    waliNama:      r.wali_nama ?? "",
    waliHp:        r.wali_hp ?? "",
    statusTagihan: r.status_tagihan ?? "Lunas",
    status:        r.status ?? "Aktif",
    inits:         r.inits ?? "",
    tempatLahir:   r.tempat_lahir ?? "",
    tanggalLahir:  r.tanggal_lahir ?? "",
    namaAyah:      r.nama_ayah ?? "",
    namaIbu:       r.nama_ibu ?? "",
    alamat:        r.alamat ?? "",
    kelurahan:     r.kelurahan ?? "",
    kecamatan:     r.kecamatan ?? "",
    asalSekolah:   r.asal_sekolah ?? undefined,
    tahunMasuk:    r.tahun_masuk ?? undefined,
  };
}

export function siswaToInsert(s: Omit<SiswaRow, "id">): Record<string, unknown> {
  return {
    nis:            s.nis,
    nisn:           s.nisn,
    nama:           s.nama,
    jk:             s.jk,
    kelas:          s.kelas,
    wali_nama:      s.waliNama,
    wali_hp:        s.waliHp,
    status_tagihan: s.statusTagihan,
    status:         s.status,
    inits:          s.inits,
    tempat_lahir:   s.tempatLahir,
    tanggal_lahir:  s.tanggalLahir,
    nama_ayah:      s.namaAyah,
    nama_ibu:       s.namaIbu,
    alamat:         s.alamat,
    kelurahan:      s.kelurahan,
    kecamatan:      s.kecamatan,
    asal_sekolah:   s.asalSekolah ?? null,
    tahun_masuk:    s.tahunMasuk ?? null,
  };
}

export function partialSiswaToUpdate(data: Partial<SiswaRow>): Record<string, unknown> {
  const MAP: Record<string, string> = {
    waliNama:      "wali_nama",
    waliHp:        "wali_hp",
    statusTagihan: "status_tagihan",
    tempatLahir:   "tempat_lahir",
    tanggalLahir:  "tanggal_lahir",
    namaAyah:      "nama_ayah",
    namaIbu:       "nama_ibu",
    asalSekolah:   "asal_sekolah",
    tahunMasuk:    "tahun_masuk",
  };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "id") continue;
    result[MAP[k] ?? k] = v;
  }
  return result;
}

export function rowToAlumni(r: Record<string, any>): AlumniRow {
  return {
    id:         r.id,
    nis:        r.nis,
    nisn:       r.nisn ?? "",
    nama:       r.nama,
    jk:         r.jk,
    inits:      r.inits ?? "",
    tahunLulus: r.tahun_lulus,
    angkatan:   r.angkatan,
    keterangan: r.keterangan ?? "Lulus Reguler",
    foto:       r.foto ?? undefined,
    wa:         r.wa ?? undefined,
  };
}

export function alumniToInsert(a: Omit<AlumniRow, "id">): Record<string, unknown> {
  return {
    nis:         a.nis,
    nisn:        a.nisn ?? "",
    nama:        a.nama,
    jk:          a.jk,
    inits:       a.inits ?? "",
    tahun_lulus: a.tahunLulus,
    angkatan:    a.angkatan,
    keterangan:  a.keterangan,
    foto:        a.foto ?? null,
    wa:          a.wa ?? null,
  };
}

export function partialAlumniToUpdate(data: Partial<AlumniRow>): Record<string, unknown> {
  const MAP: Record<string, string> = {
    tahunLulus: "tahun_lulus",
  };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "id") continue;
    result[MAP[k] ?? k] = v;
  }
  return result;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadSiswaFromDB(): Promise<SiswaRow[]> {
  const { data, error } = await supabase.from("siswa").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToSiswa);
}

export async function loadAlumniFromDB(): Promise<AlumniRow[]> {
  const { data, error } = await supabase.from("alumni").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToAlumni);
}

// ─── Siswa CRUD ───────────────────────────────────────────────────────────────

export async function insertSiswaDB(s: Omit<SiswaRow, "id">): Promise<SiswaRow> {
  const { data, error } = await supabase
    .from("siswa").insert(siswaToInsert(s)).select().single();
  if (error) throw error;
  return rowToSiswa(data);
}

export async function bulkInsertSiswaDB(records: Omit<SiswaRow, "id">[]): Promise<SiswaRow[]> {
  if (records.length === 0) return [];
  const payload = records.map(siswaToInsert);
  const { data, error } = await supabase.from("siswa").insert(payload).select();
  if (error) throw error;
  return (data ?? []).map(rowToSiswa);
}

export async function updateSiswaDB(id: number, data: Partial<SiswaRow>): Promise<void> {
  const { error } = await supabase
    .from("siswa").update(partialSiswaToUpdate(data)).eq("id", id);
  if (error) throw error;
}

export async function deleteSiswaDB(id: number): Promise<void> {
  const { error } = await supabase.from("siswa").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteSiswaDB(ids: number[]): Promise<void> {
  const { error } = await supabase.from("siswa").delete().in("id", ids);
  if (error) throw error;
}

export async function bulkUpdateSiswaDB(ids: number[], data: Partial<SiswaRow>): Promise<void> {
  const payload = partialSiswaToUpdate(data);
  await Promise.all(
    ids.map(id => supabase.from("siswa").update(payload).eq("id", id))
  );
}

export async function graduateSiswaDB(
  toGraduate: SiswaRow[],
  tahunLulus: string,
): Promise<AlumniRow[]> {
  const inserts = toGraduate.map(s =>
    alumniToInsert({ ...s, tahunLulus, angkatan: parseInt(tahunLulus, 10), keterangan: "Lulus Reguler" })
  );
  const { data: alumniData, error: alumniErr } = await supabase
    .from("alumni").insert(inserts).select();
  if (alumniErr) throw alumniErr;

  const ids = toGraduate.map(s => s.id);
  const { error: deleteErr } = await supabase.from("siswa").delete().in("id", ids);
  if (deleteErr) throw deleteErr;

  return (alumniData ?? []).map(rowToAlumni);
}

// ─── Alumni CRUD ──────────────────────────────────────────────────────────────

export async function insertAlumniDB(a: Omit<AlumniRow, "id">): Promise<AlumniRow> {
  const { data, error } = await supabase
    .from("alumni").insert(alumniToInsert(a)).select().single();
  if (error) throw error;
  return rowToAlumni(data);
}

export async function updateAlumniDB(id: number, data: Partial<AlumniRow>): Promise<void> {
  const { error } = await supabase
    .from("alumni").update(partialAlumniToUpdate(data)).eq("id", id);
  if (error) throw error;
}

export async function deleteAlumniDB(id: number): Promise<void> {
  const { error } = await supabase.from("alumni").delete().eq("id", id);
  if (error) throw error;
}
