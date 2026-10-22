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

const DUMMY_TEACHER_NAMES = new Set([
  "Ust. Ahmad Zaki, S.Pd", "Hj. Siti Nurlaela, S.Pd.I", "Ust. Farid Hasan, S.Pd",
  "Ibu Dewi Rahmawati, S.Pd", "Ust. Ridwan Maulana, S.Pd.I", "Ibu Nining Suparni, S.Pd",
  "Ust. Budi Santoso, S.Pd", "Ibu Rina Mariana, M.Pd", "Ust. Lukman Hakim, Lc",
  "Ibu Kartini, S.Pd", "Ust. Salman Al-Farisi, S.Pd.I", "Ibu Dian Sastro, S.Sn",
  "Ust. Kevin Sanjaya, S.Pd"
]);

export async function loadGuruFromDB(): Promise<GuruRow[]> {
  const { data, error } = await supabase.from("guru").select("*").order("id");
  if (error) throw error;
  const list = (data ?? []).map(rowToGuru);
  const clean = list.filter(g => !DUMMY_TEACHER_NAMES.has(g.nama));
  if (clean.length !== list.length) {
    supabase.from("guru").delete().in("nama", Array.from(DUMMY_TEACHER_NAMES)).then(() => {});
  }
  return clean;
}

export async function insertGuruDB(g: Omit<GuruRow, "id">): Promise<GuruRow> {
  if (DUMMY_TEACHER_NAMES.has(g.nama)) {
    throw new Error("Data dummy tidak dapat disimpan");
  }
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
  const realGurus = gurus.filter(g => !DUMMY_TEACHER_NAMES.has(g.nama));
  if (realGurus.length === 0) return [];
  const { data, error } = await supabase
    .from("guru")
    .insert(realGurus.map(guruToInsert))
    .select();
  if (error) throw error;
  return (data ?? []).map(rowToGuru);
}
