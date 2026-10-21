import { supabase } from "@/lib/supabase";
import type { TagihanSiswa, TransaksiPembayaran } from "@/data/pembayaran";

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
  };
}

export function transaksiToPayload(tr: TransaksiPembayaran): Record<string, unknown> {
  return {
    id:             tr.id,
    nis:            tr.nis,
    tanggal:        tr.tanggal,
    nominal:        tr.nominal,
    metode:         tr.metode,
    nomor_kuitansi: tr.nomorKuitansi,
    alokasi:        tr.alokasi,
  };
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
