import { supabase } from "@/lib/supabase";
import type { TagihanSiswa, TransaksiPembayaran, Template } from "@/data/pembayaran";

export function rowToTemplate(r: Record<string, any>): Template {
  return {
    id:                Number(r.id),
    nama:              r.nama,
    tipe:              r.tipe,
    target:            r.target,
    komponen:          Array.isArray(r.komponen) ? r.komponen : [],
    total:             Number(r.total),
    applied:           0,
    jatuhTempoDefault: r.jatuh_tempo_default ?? undefined,
    kelas:             r.kelas ?? undefined,
    tahunAjaran:       r.tahun_ajaran ?? undefined,
  };
}

export function templateToPayload(t: Template): Record<string, unknown> {
  return {
    id:                  t.id,
    nama:                t.nama,
    tipe:                t.tipe,
    target:              t.target,
    komponen:            t.komponen,
    total:               t.total,
    jatuh_tempo_default: t.jatuhTempoDefault ?? null,
    kelas:               t.kelas ?? null,
    tahun_ajaran:        t.tahunAjaran ?? null,
  };
}

// ─── Type mapping: DB (snake_case) ↔ App (camelCase) ─────────────────────────

export function rowToTagihan(r: Record<string, any>): TagihanSiswa {
  return {
    id:          r.id,
    nis:         r.nis,
    namaTagihan: r.nama_tagihan,
    kategori:    r.kategori,
    nominal:     Number(r.nominal),
    terbayar:    Number(r.terbayar),
    jatuhTempo:  typeof r.jatuh_tempo === "string" ? r.jatuh_tempo.split("T")[0] : String(r.jatuh_tempo),
    isLunas:     Boolean(r.is_lunas),
    prioritas:   typeof r.prioritas === "number" ? r.prioritas : 99,
    keterangan:  r.keterangan ?? undefined,
  };
}

export function tagihanToPayload(t: TagihanSiswa): Record<string, unknown> {
  return {
    id:           t.id,
    nis:          t.nis,
    nama_tagihan: t.namaTagihan,
    kategori:     t.kategori,
    nominal:      t.nominal,
    terbayar:     t.terbayar,
    jatuh_tempo:  t.jatuhTempo,
    is_lunas:     t.isLunas,
    prioritas:    t.prioritas ?? 99,
    keterangan:   t.keterangan ?? null,
  };
}

export function rowToTransaksi(r: Record<string, any>): TransaksiPembayaran {
  return {
    id:            r.id,
    nis:           r.nis,
    tanggal:       r.tanggal,
    nominal:       Number(r.nominal),
    metode:        r.metode,
    nomorKuitansi: r.nomor_kuitansi,
    alokasi:       Array.isArray(r.alokasi) ? r.alokasi : [],
    akun:          r.akun ?? undefined,
    catatan:       r.catatan ?? undefined,
    dicatatOleh:   r.dicatat_oleh ?? undefined,
  };
}

export function transaksiToPayload(tr: TransaksiPembayaran): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id:             tr.id,
    nis:            tr.nis,
    tanggal:        tr.tanggal,
    nominal:        tr.nominal,
    metode:         tr.metode,
    nomor_kuitansi: tr.nomorKuitansi,
    alokasi:        tr.alokasi,
  };
  if (tr.akun) payload.akun = tr.akun;
  if (tr.catatan) payload.catatan = tr.catatan;
  if (tr.dicatatOleh) payload.dicatat_oleh = tr.dicatatOleh;
  return payload;
}

// ─── Database Operations ──────────────────────────────────────────────────────

export async function loadTagihanFromDB(): Promise<TagihanSiswa[]> {
  const { data, error } = await supabase
    .from("tagihan_siswa")
    .select("*")
    .order("prioritas", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToTagihan);
}

export async function loadTransaksiFromDB(): Promise<TransaksiPembayaran[]> {
  const { data, error } = await supabase
    .from("transaksi_pembayaran")
    .select("*")
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToTransaksi);
}

export async function bulkUpsertTagihanDB(tagihanList: TagihanSiswa[]): Promise<void> {
  if (tagihanList.length === 0) return;
  const payload = tagihanList.map(tagihanToPayload);
  const { error } = await supabase.from("tagihan_siswa").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function updateTagihanNominalDB(
  id: string,
  newNominal: number,
  keterangan?: string,
  isLunas?: boolean
): Promise<void> {
  const payload: Record<string, unknown> = {
    nominal: newNominal,
    keterangan: keterangan ?? null,
  };
  if (typeof isLunas === "boolean") {
    payload.is_lunas = isLunas;
  }
  const { error } = await supabase.from("tagihan_siswa").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteTagihanSiswaDB(id: string): Promise<void> {
  const { error } = await supabase.from("tagihan_siswa").delete().eq("id", id);
  if (error) throw error;
}

export async function insertTransaksiDB(
  transaksi: TransaksiPembayaran,
  updatedTagihan: TagihanSiswa[]
): Promise<void> {
  // 1. Simpan Transaksi Pembayaran
  const { error: trxError } = await supabase
    .from("transaksi_pembayaran")
    .insert(transaksiToPayload(transaksi));
  if (trxError) throw trxError;

  // 2. Update alokasi tagihan yang terbayar
  if (updatedTagihan.length > 0) {
    const payload = updatedTagihan.map(tagihanToPayload);
    const { error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .upsert(payload, { onConflict: "id" });
    if (tagihanError) throw tagihanError;
  }
}

export async function loadTemplateFromDB(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("template_tagihan")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToTemplate);
}

export async function insertTemplateDB(template: Template): Promise<void> {
  const { error } = await supabase
    .from("template_tagihan")
    .upsert(templateToPayload(template), { onConflict: "id" });
  if (error) throw error;
}

export async function bulkInsertTemplateDB(templates: Template[]): Promise<void> {
  if (templates.length === 0) return;
  const payload = templates.map(templateToPayload);
  const { error } = await supabase
    .from("template_tagihan")
    .upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function updateTemplateDB(id: number, data: Partial<Template>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.nama !== undefined) payload.nama = data.nama;
  if (data.tipe !== undefined) payload.tipe = data.tipe;
  if (data.target !== undefined) payload.target = data.target;
  if (data.komponen !== undefined) payload.komponen = data.komponen;
  if (data.total !== undefined) payload.total = data.total;
  if (data.jatuhTempoDefault !== undefined) payload.jatuh_tempo_default = data.jatuhTempoDefault;
  if (data.kelas !== undefined) payload.kelas = data.kelas;
  if (data.tahunAjaran !== undefined) payload.tahun_ajaran = data.tahunAjaran;

  const { error } = await supabase
    .from("template_tagihan")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTemplateDB(id: number): Promise<void> {
  const { error } = await supabase
    .from("template_tagihan")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
