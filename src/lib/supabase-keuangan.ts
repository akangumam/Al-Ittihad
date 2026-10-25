import { supabase } from "@/lib/supabase";
import type { ManualTransaksiRow, BankTransferRow, AkunNama } from "@/types";
import type { RABRow, AkunRow } from "@/data/keuangan";

// ─── Manual Transaksi (Buku Kas Umum) ─────────────────────────────────────────

export function rowToManualTransaksi(r: Record<string, any>): ManualTransaksiRow {
  return {
    id:          r.id,
    tipe:        r.tipe as "masuk" | "keluar",
    tanggal:     typeof r.tanggal === "string" ? r.tanggal.split("T")[0] : String(r.tanggal),
    keterangan:  r.keterangan,
    kategori:    r.kategori,
    akun:        r.akun as AkunNama,
    jumlah:      Number(r.jumlah),
    ref:         r.ref,
    catatan:     r.catatan ?? undefined,
    dicatatOleh: r.dicatat_oleh ?? "Admin",
    waktuCatat:  r.waktu_catat ?? new Date().toISOString(),
    rabId:       r.rab_id ? Number(r.rab_id) : undefined,
  };
}

export function manualTransaksiToPayload(m: ManualTransaksiRow): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id:           m.id,
    tipe:         m.tipe,
    tanggal:      m.tanggal,
    keterangan:   m.keterangan,
    kategori:     m.kategori,
    akun:         m.akun,
    jumlah:       m.jumlah,
    ref:          m.ref,
    catatan:      m.catatan ?? null,
    dicatat_oleh: m.dicatatOleh,
    waktu_catat:  m.waktuCatat,
  };
  if (m.rabId !== undefined) {
    payload.rab_id = m.rabId;
  }
  return payload;
}

export async function loadManualTransaksiFromDB(): Promise<ManualTransaksiRow[]> {
  const { data, error } = await supabase
    .from("manual_transaksi")
    .select("*")
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToManualTransaksi);
}

export async function insertManualTransaksiDB(t: ManualTransaksiRow): Promise<void> {
  const { error } = await supabase.from("manual_transaksi").insert(manualTransaksiToPayload(t));
  if (error) throw error;
}

export async function deleteManualTransaksiDB(id: string): Promise<void> {
  const { error } = await supabase.from("manual_transaksi").delete().eq("id", id);
  if (error) throw error;
}

// ─── Bank Transfer (Mutasi Antar-Bank) ─────────────────────────────────────────

export function rowToBankTransfer(r: Record<string, any>): BankTransferRow {
  return {
    id:          r.id,
    tanggal:     typeof r.tanggal === "string" ? r.tanggal.split("T")[0] : String(r.tanggal),
    dari:        r.dari,
    ke:          r.ke,
    nominal:     Number(r.nominal),
    catatan:     r.catatan ?? "",
    status:      (r.status as "Selesai" | "Pending") ?? "Selesai",
    dicatatOleh: r.dicatat_oleh ?? "Admin",
    waktuCatat:  r.waktu_catat ?? new Date().toISOString(),
  };
}

export function bankTransferToPayload(bt: BankTransferRow): Record<string, unknown> {
  return {
    id:           bt.id,
    tanggal:      bt.tanggal,
    dari:         bt.dari,
    ke:           bt.ke,
    nominal:      bt.nominal,
    catatan:      bt.catatan ?? null,
    status:       bt.status,
    dicatat_oleh: bt.dicatatOleh,
    waktu_catat:  bt.waktuCatat,
  };
}

export async function loadBankTransferFromDB(): Promise<BankTransferRow[]> {
  const { data, error } = await supabase
    .from("bank_transfer")
    .select("*")
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToBankTransfer);
}

export async function insertBankTransferDB(bt: BankTransferRow): Promise<void> {
  const { error } = await supabase.from("bank_transfer").insert(bankTransferToPayload(bt));
  if (error) throw error;
}

export async function deleteBankTransferDB(id: string): Promise<void> {
  const { error } = await supabase.from("bank_transfer").delete().eq("id", id);
  if (error) throw error;
}

// ─── RAB Anggaran ─────────────────────────────────────────────────────────────

export function rowToRAB(r: Record<string, any>): RABRow {
  return {
    id:       r.id,
    group:    r.kelompok,
    nama:     r.nama,
    anggaran: Number(r.anggaran),
    terpakai: Number(r.terpakai),
  };
}

export function rabToPayload(rab: Omit<RABRow, "id">): Record<string, unknown> {
  return {
    kelompok: rab.group,
    nama:     rab.nama,
    anggaran: rab.anggaran,
    terpakai: rab.terpakai,
  };
}

export async function loadRabFromDB(): Promise<RABRow[]> {
  const { data, error } = await supabase
    .from("rab_anggaran")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToRAB);
}

export async function insertRabDB(row: Omit<RABRow, "id">): Promise<RABRow> {
  const { data, error } = await supabase
    .from("rab_anggaran")
    .insert(rabToPayload(row))
    .select()
    .single();

  if (error) throw error;
  return rowToRAB(data);
}

export async function updateRabDB(id: number, data: Partial<RABRow>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.group !== undefined) payload.kelompok = data.group;
  if (data.nama !== undefined) payload.nama = data.nama;
  if (data.anggaran !== undefined) payload.anggaran = data.anggaran;
  if (data.terpakai !== undefined) payload.terpakai = data.terpakai;

  const { error } = await supabase.from("rab_anggaran").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteRabDB(id: number): Promise<void> {
  const { error } = await supabase.from("rab_anggaran").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkInsertRabDB(rows: Omit<RABRow, "id">[]): Promise<RABRow[]> {
  const { data, error } = await supabase
    .from("rab_anggaran")
    .insert(rows.map(rabToPayload))
    .select();

  if (error) throw error;
  return (data ?? []).map(rowToRAB);
}

// ─── Akun Bank / Kas ─────────────────────────────────────────────────────────

export function rowToAkun(r: Record<string, any>): AkunRow {
  return {
    id:           r.id,
    nama:         r.nama,
    nomor:        r.nomor ?? null,
    atasNama:     r.atas_nama ?? undefined,
    saldo:        Number(r.saldo_awal ?? r.saldo ?? 0),
    spark:        Array.isArray(r.spark) ? r.spark : [0, 0, 0],
    sparkColor:   r.spark_color ?? "#3E8A2F",
    icon:         (r.icon as "bank" | "wallet") ?? (r.tipe === "Kas" ? "wallet" : "bank"),
    rekonsiliasi: r.rekonsiliasi ?? "—",
    catatan:      r.catatan ?? undefined,
    isDefault:    Boolean(r.is_default),
  };
}

export function akunToPayload(a: AkunRow): Record<string, unknown> {
  return {
    id:           a.id,
    nama:         a.nama,
    nomor:        a.nomor,
    atas_nama:    a.atasNama ?? null,
    saldo_awal:   a.saldo,
    spark:        a.spark ?? [0, 0, 0],
    spark_color:  a.sparkColor ?? "#3E8A2F",
    icon:         a.icon ?? "bank",
    rekonsiliasi: a.rekonsiliasi ?? "—",
    catatan:      a.catatan ?? null,
    is_default:   Boolean(a.isDefault),
  };
}

export async function loadAkunFromDB(): Promise<AkunRow[]> {
  const { data, error } = await supabase
    .from("akun_bank")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToAkun);
}

export async function insertAkunDB(a: AkunRow): Promise<void> {
  const { error } = await supabase.from("akun_bank").insert(akunToPayload(a));
  if (error) throw error;
}

export async function updateAkunDB(id: string | number, a: Partial<AkunRow>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (a.nama !== undefined) payload.nama = a.nama;
  if (a.nomor !== undefined) payload.nomor = a.nomor;
  if (a.atasNama !== undefined) payload.atas_nama = a.atasNama;
  if (a.saldo !== undefined) payload.saldo_awal = a.saldo;
  if (a.spark !== undefined) payload.spark = a.spark;
  if (a.sparkColor !== undefined) payload.spark_color = a.sparkColor;
  if (a.icon !== undefined) payload.icon = a.icon;
  if (a.rekonsiliasi !== undefined) payload.rekonsiliasi = a.rekonsiliasi;
  if (a.catatan !== undefined) payload.catatan = a.catatan;

  const { error } = await supabase.from("akun_bank").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteAkunDB(id: string | number): Promise<void> {
  const { error } = await supabase.from("akun_bank").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkInsertAkunDB(rows: AkunRow[]): Promise<AkunRow[]> {
  const { data, error } = await supabase
    .from("akun_bank")
    .insert(rows.map(akunToPayload))
    .select();

  if (error) throw error;
  return (data ?? []).map(rowToAkun);
}

