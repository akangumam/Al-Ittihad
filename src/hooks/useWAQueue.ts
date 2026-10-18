import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WAJenis = "absensi" | "pembayaran" | "tagihan" | "tunggakan" | "custom";

export interface EnqueuePayload {
  phone: string;
  nama_penerima: string;
  pesan: string;
  jenis: WAJenis;
  ref_id?: string;
  /** 1 = tinggi, 2 = normal (default), 3 = rendah */
  priority?: number;
  /** ISO string — default: sekarang */
  scheduled_at?: string;
}

export interface WAQueueRow {
  id: string;
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  phone: string;
  nama_penerima: string;
  pesan: string;
  jenis: WAJenis;
  ref_id: string | null;
  priority: number;
  scheduled_at: string;
  sent_at: string | null;
  attempts: number;
  last_error: string | null;
  created_by: string;
  created_at: string;
}

// ─── Template pesan ───────────────────────────────────────────────────────────

export const waTemplate = {
  absensiAlpa: (namaSiswa: string, kelas: string, tanggal: string) =>
    `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *${namaSiswa}* (${kelas})\n\nKami informasikan bahwa putra/putri Bapak/Ibu *tidak hadir (Alpa)* pada:\n📅 ${tanggal}\n\nMohon konfirmasi ketidakhadiran kepada wali kelas atau hubungi sekolah.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  absensiTerlambat: (namaSiswa: string, kelas: string, jamMasuk: string) =>
    `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *${namaSiswa}* (${kelas})\n\nKami informasikan bahwa putra/putri Bapak/Ibu *terlambat masuk* hari ini pukul *${jamMasuk} WIB*.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  pembayaranLunas: (namaSiswa: string, nominal: string, noKuitansi: string) =>
    `Assalamu'alaikum Wr. Wb.\n\nTerima kasih, pembayaran telah kami terima ✅\n\n👤 Siswa    : *${namaSiswa}*\n💰 Nominal  : *${nominal}*\n🧾 Kuitansi : *${noKuitansi}*\n\nJazakumullah khairan atas kepercayaan Bapak/Ibu.\n_MTs Al-Ittihad Pedaleman_`,

  tagihanJatuhTempo: (namaSiswa: string, namaTagihan: string, nominal: string, jatuhTempo: string) =>
    `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *${namaSiswa}*\n\nKami mengingatkan tagihan yang akan jatuh tempo:\n\n📋 Tagihan    : *${namaTagihan}*\n💰 Nominal    : *${nominal}*\n📅 Jatuh Tempo: *${jatuhTempo}*\n\nMohon segera diselesaikan agar tidak terkena denda keterlambatan.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  tunggakanKritis: (namaSiswa: string, totalTunggakan: string, hariTerlambat: number) =>
    `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *${namaSiswa}*\n\nKami menginformasikan bahwa terdapat tunggakan pembayaran:\n\n💰 Total Tunggakan: *${totalTunggakan}*\n⏰ Terlambat      : *${hariTerlambat} hari*\n\nMohon segera menghubungi bagian keuangan sekolah untuk penyelesaian.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWAQueue() {
  const { user } = useAuth();

  const enqueue = useCallback(async (payload: EnqueuePayload): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Tidak ada sesi login" };

    const { error } = await supabase.from("wa_queue").insert({
      phone:         payload.phone,
      nama_penerima: payload.nama_penerima,
      pesan:         payload.pesan,
      jenis:         payload.jenis,
      ref_id:        payload.ref_id ?? null,
      priority:      payload.priority ?? 2,
      scheduled_at:  payload.scheduled_at ?? new Date().toISOString(),
      created_by:    user.nama,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, [user]);

  const enqueueBulk = useCallback(async (payloads: EnqueuePayload[]): Promise<{ ok: boolean; count: number; error?: string }> => {
    if (!user) return { ok: false, count: 0, error: "Tidak ada sesi login" };
    if (payloads.length === 0) return { ok: true, count: 0 };

    const rows = payloads.map(p => ({
      phone:         p.phone,
      nama_penerima: p.nama_penerima,
      pesan:         p.pesan,
      jenis:         p.jenis,
      ref_id:        p.ref_id ?? null,
      priority:      p.priority ?? 2,
      scheduled_at:  p.scheduled_at ?? new Date().toISOString(),
      created_by:    user.nama,
    }));

    const { error } = await supabase.from("wa_queue").insert(rows);
    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: rows.length };
  }, [user]);

  const cancelMessage = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("wa_queue")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "pending");
    return !error;
  }, []);

  return { enqueue, enqueueBulk, cancelMessage };
}
