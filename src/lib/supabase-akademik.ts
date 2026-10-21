import { supabase } from "@/lib/supabase";
import type { KelasRow, JadwalRow } from "@/data/kelas";
import type { AppSettings, ActivityLogEntry, ActivityLogTipe } from "@/types";

// ─── PENGATURAN MADRASAH ──────────────────────────────────────────────────────

export async function loadAppSettingsFromDB(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw error;
  return data?.value as AppSettings | null;
}

export async function saveAppSettingsDB(settings: AppSettings): Promise<void> {
  const { error } = await supabase.from("app_settings").upsert({
    id: "default",
    value: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─── KELAS ────────────────────────────────────────────────────────────────────

export function rowToKelas(r: Record<string, any>): KelasRow {
  return {
    id:        r.id,
    tingkat:   r.tingkat,
    waliId:    r.wali_id ?? null,
    kapasitas: typeof r.kapasitas === "number" ? r.kapasitas : 32,
  };
}

export function kelasToPayload(k: KelasRow): Record<string, unknown> {
  return {
    id:        k.id,
    tingkat:   k.tingkat,
    wali_id:   k.waliId,
    kapasitas: k.kapasitas,
  };
}

export async function loadKelasFromDB(): Promise<KelasRow[]> {
  const { data, error } = await supabase.from("kelas").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToKelas);
}

export async function bulkInsertKelasDB(kelasList: KelasRow[]): Promise<KelasRow[]> {
  const { data, error } = await supabase
    .from("kelas")
    .insert(kelasList.map(kelasToPayload))
    .select();
  if (error) throw error;
  return (data ?? []).map(rowToKelas);
}

export async function insertKelasDB(k: KelasRow): Promise<void> {
  const { error } = await supabase.from("kelas").insert(kelasToPayload(k));
  if (error) throw error;
}

export async function updateKelasDB(id: string, data: Partial<KelasRow>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.tingkat !== undefined) payload.tingkat = data.tingkat;
  if (data.waliId !== undefined) payload.wali_id = data.waliId;
  if (data.kapasitas !== undefined) payload.kapasitas = data.kapasitas;

  const { error } = await supabase.from("kelas").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteKelasDB(id: string): Promise<void> {
  const { error } = await supabase.from("kelas").delete().eq("id", id);
  if (error) throw error;
}

// ─── JADWAL PELAJARAN ─────────────────────────────────────────────────────────

export function rowToJadwal(r: Record<string, any>): JadwalRow {
  return {
    id:     r.id,
    kelas:  r.kelas,
    hari:   r.hari,
    jam:    Number(r.jam),
    mapel:  r.mapel,
    guruId: r.guru_id ?? null,
    ruang:  r.ruang ?? "",
  };
}

export function jadwalToPayload(j: JadwalRow | Omit<JadwalRow, "id">): Record<string, unknown> {
  return {
    kelas:   j.kelas,
    hari:    j.hari,
    jam:     j.jam,
    mapel:   j.mapel,
    guru_id: j.guruId,
    ruang:   j.ruang ?? "",
  };
}

export async function loadJadwalFromDB(): Promise<JadwalRow[]> {
  const { data, error } = await supabase
    .from("jadwal_pelajaran")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToJadwal);
}

export async function bulkInsertJadwalDB(jadwalList: JadwalRow[]): Promise<JadwalRow[]> {
  const payload = jadwalList.map(j => ({
    kelas:   j.kelas,
    hari:    j.hari,
    jam:     j.jam,
    mapel:   j.mapel,
    guru_id: j.guruId,
    ruang:   j.ruang ?? "",
  }));
  const { data, error } = await supabase
    .from("jadwal_pelajaran")
    .insert(payload)
    .select();
  if (error) throw error;
  return (data ?? []).map(rowToJadwal);
}

export async function insertJadwalDB(j: JadwalRow): Promise<JadwalRow> {
  const { data, error } = await supabase
    .from("jadwal_pelajaran")
    .insert(jadwalToPayload(j))
    .select()
    .single();
  if (error) throw error;
  return rowToJadwal(data);
}

export async function updateJadwalDB(id: number, data: Partial<JadwalRow>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.kelas !== undefined) payload.kelas = data.kelas;
  if (data.hari !== undefined) payload.hari = data.hari;
  if (data.jam !== undefined) payload.jam = data.jam;
  if (data.mapel !== undefined) payload.mapel = data.mapel;
  if (data.guruId !== undefined) payload.guru_id = data.guruId;
  if (data.ruang !== undefined) payload.ruang = data.ruang;

  const { error } = await supabase.from("jadwal_pelajaran").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteJadwalDB(id: number): Promise<void> {
  const { error } = await supabase.from("jadwal_pelajaran").delete().eq("id", id);
  if (error) throw error;
}

// ─── LOG AKTIVITAS ────────────────────────────────────────────────────────────

export function rowToLog(r: Record<string, any>): ActivityLogEntry {
  return {
    id:        r.id,
    waktu:     r.waktu,
    tipe:      r.tipe as ActivityLogTipe,
    deskripsi: r.deskripsi,
    ref:       r.ref ?? "—",
    pelaku:    r.pelaku,
  };
}

export async function loadLogAktivitasFromDB(limit = 100): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from("log_aktivitas")
    .select("*")
    .order("waktu", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(rowToLog);
}

export async function insertLogAktivitasDB(entry: ActivityLogEntry): Promise<void> {
  const { error } = await supabase.from("log_aktivitas").insert({
    id:        entry.id,
    waktu:     entry.waktu,
    tipe:      entry.tipe,
    deskripsi: entry.deskripsi,
    ref:       entry.ref,
    pelaku:    entry.pelaku,
  });
  if (error) throw error;
}
