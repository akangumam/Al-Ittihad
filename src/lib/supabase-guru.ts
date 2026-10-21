import { supabase } from "@/lib/supabase";
import type { GuruRow } from "@/data/guru";

// ─── Type mapping: DB (snake_case) ↔ App (camelCase) ─────────────────────────

export function rowToGuru(r: Record<string, any>): GuruRow {
  return {
    id:           r.id,
    nama:         r.nama,
    nuptk:        r.nuptk ?? "",
    nip:          r.nip ?? "",
    mapel:        Array.isArray(r.mapel) ? r.mapel : [],
    statusKepeg:  (r.status_kepeg as "PNS" | "GTY" | "Honorer") ?? "GTY",
    waliKelas:    r.wali_kelas ?? null,
    kehadiran:    typeof r.kehadiran === "number" ? r.kehadiran : 100,
    status:       (r.status as "Aktif" | "Nonaktif") ?? "Aktif",
    jk:           (r.jk as "L" | "P") ?? "L",
    tanggalLahir: r.tanggal_lahir ?? "",
    jabatan:      r.jabatan ?? "",
    pendidikan:   r.pendidikan ?? "",
    hp:           r.hp ?? "",
    email:        r.email ?? "",
    alamat:       r.alamat ?? "",
    inits:        r.inits ?? "",
  };
}

export function guruToInsert(g: Omit<GuruRow, "id">): Record<string, unknown> {
  return {
    nama:          g.nama,
    nuptk:         g.nuptk,
    nip:           g.nip,
    mapel:         g.mapel,
    status_kepeg:  g.statusKepeg,
    wali_kelas:    g.waliKelas,
    kehadiran:     g.kehadiran,
    status:        g.status,
    jk:            g.jk,
    tanggal_lahir: g.tanggalLahir,
    jabatan:       g.jabatan,
    pendidikan:    g.pendidikan,
    hp:            g.hp,
    email:         g.email,
    alamat:        g.alamat,
    inits:         g.inits,
  };
}

export function partialGuruToUpdate(data: Partial<GuruRow>): Record<string, unknown> {
  const MAP: Record<string, string> = {
    statusKepeg:  "status_kepeg",
    waliKelas:    "wali_kelas",
    tanggalLahir: "tanggal_lahir",
  };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "id") continue;
    result[MAP[k] ?? k] = v;
  }
  return result;
}

// ─── Guru CRUD ────────────────────────────────────────────────────────────────

export async function loadGuruFromDB(): Promise<GuruRow[]> {
  const { data, error } = await supabase.from("guru").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToGuru);
}

export async function insertGuruDB(g: Omit<GuruRow, "id">): Promise<GuruRow> {
  const { data, error } = await supabase
    .from("guru")
    .insert(guruToInsert(g))
    .select()
    .single();
  if (error) throw error;
  return rowToGuru(data);
}

export async function updateGuruDB(id: number, data: Partial<GuruRow>): Promise<void> {
  const { error } = await supabase
    .from("guru")
    .update(partialGuruToUpdate(data))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGuruDB(id: number): Promise<void> {
  const { error } = await supabase.from("guru").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkInsertGuruDB(gurus: Omit<GuruRow, "id">[]): Promise<GuruRow[]> {
  const { data, error } = await supabase
    .from("guru")
    .insert(gurus.map(guruToInsert))
    .select();
  if (error) throw error;
  return (data ?? []).map(rowToGuru);
}
