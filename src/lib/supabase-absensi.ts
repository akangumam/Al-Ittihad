import { supabase } from "@/lib/supabase";

// ─── ABSENSI SISWA ─────────────────────────────────────────────────────────────

export interface AbsensiRecordSiswa {
  tanggal: string; // 'YYYY-MM-DD'
  nis: string;
  status: string;  // 'Hadir' | 'Izin' | 'Alpa' | 'Terlambat'
  jam?: string;
  keterangan?: string;
}

export async function loadAbsensiSiswaHariIniDB(
  tanggal: string
): Promise<Record<string, { status: string; jam: string }>> {
  const { data, error } = await supabase
    .from("absensi_siswa")
    .select("nis, status, jam")
    .eq("tanggal", tanggal);

  if (error) throw error;

  const result: Record<string, { status: string; jam: string }> = {};
  for (const row of data ?? []) {
    result[row.nis] = { status: row.status, jam: row.jam ?? "—" };
  }
  return result;
}

export async function loadAbsensiSiswaHistoryDB(): Promise<
  Record<string, Record<string, { status: string; jam: string }>>
> {
  const { data, error } = await supabase
    .from("absensi_siswa")
    .select("tanggal, nis, status, jam")
    .order("tanggal", { ascending: false });

  if (error) throw error;

  const history: Record<string, Record<string, { status: string; jam: string }>> = {};
  for (const row of data ?? []) {
    const tgl = typeof row.tanggal === "string" ? row.tanggal.split("T")[0] : String(row.tanggal);
    if (!history[tgl]) {
      history[tgl] = {};
    }
    history[tgl][row.nis] = { status: row.status, jam: row.jam ?? "—" };
  }
  return history;
}

export async function upsertAbsensiSiswaDB(record: AbsensiRecordSiswa): Promise<void> {
  const { error } = await supabase.from("absensi_siswa").upsert(
    {
      tanggal: record.tanggal,
      nis: record.nis,
      status: record.status,
      jam: record.jam ?? "—",
      keterangan: record.keterangan ?? null,
    },
    { onConflict: "tanggal,nis" }
  );

  if (error) throw error;
}

export async function bulkUpsertAbsensiSiswaDB(records: AbsensiRecordSiswa[]): Promise<void> {
  if (records.length === 0) return;
  const payload = records.map((r) => ({
    tanggal: r.tanggal,
    nis: r.nis,
    status: r.status,
    jam: r.jam ?? "—",
    keterangan: r.keterangan ?? null,
  }));

  const { error } = await supabase
    .from("absensi_siswa")
    .upsert(payload, { onConflict: "tanggal,nis" });

  if (error) throw error;
}

// ─── ABSENSI GURU ──────────────────────────────────────────────────────────────

export interface AbsensiRecordGuru {
  tanggal: string; // 'YYYY-MM-DD'
  guruId: number;
  status: string;  // 'Hadir' | 'Izin' | 'Alpa' | 'Terlambat'
  jam?: string;
  keterangan?: string;
}

export async function loadAbsensiGuruHariIniDB(
  tanggal: string
): Promise<Record<number, { status: string; jam: string }>> {
  const { data, error } = await supabase
    .from("absensi_guru")
    .select("guru_id, status, jam")
    .eq("tanggal", tanggal);

  if (error) throw error;

  const result: Record<number, { status: string; jam: string }> = {};
  for (const row of data ?? []) {
    result[row.guru_id] = { status: row.status, jam: row.jam ?? "—" };
  }
  return result;
}

export async function loadAbsensiGuruHistoryDB(): Promise<
  Record<string, Record<number, { status: string; jam: string }>>
> {
  const { data, error } = await supabase
    .from("absensi_guru")
    .select("tanggal, guru_id, status, jam")
    .order("tanggal", { ascending: false });

  if (error) throw error;

  const history: Record<string, Record<number, { status: string; jam: string }>> = {};
  for (const row of data ?? []) {
    const tgl = typeof row.tanggal === "string" ? row.tanggal.split("T")[0] : String(row.tanggal);
    if (!history[tgl]) {
      history[tgl] = {};
    }
    history[tgl][row.guru_id] = { status: row.status, jam: row.jam ?? "—" };
  }
  return history;
}

export async function upsertAbsensiGuruDB(record: AbsensiRecordGuru): Promise<void> {
  const { error } = await supabase.from("absensi_guru").upsert(
    {
      tanggal: record.tanggal,
      guru_id: record.guruId,
      status: record.status,
      jam: record.jam ?? "—",
      keterangan: record.keterangan ?? null,
    },
    { onConflict: "tanggal,guru_id" }
  );

  if (error) throw error;
}

export async function bulkUpsertAbsensiGuruDB(records: AbsensiRecordGuru[]): Promise<void> {
  if (records.length === 0) return;
  const payload = records.map((r) => ({
    tanggal: r.tanggal,
    guru_id: r.guruId,
    status: r.status,
    jam: r.jam ?? "—",
    keterangan: r.keterangan ?? null,
  }));

  const { error } = await supabase
    .from("absensi_guru")
    .upsert(payload, { onConflict: "tanggal,guru_id" });

  if (error) throw error;
}
