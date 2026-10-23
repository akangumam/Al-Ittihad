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

/** Kirim langsung ke REST endpoint WAHA jika antrean Supabase terkendala atau butuh pengiriman instan */
async function sendToWAHAEndpoint(
  phone: string,
  pesan: string,
  settings: { wahaUrl?: string; wahaApiKey?: string; wahaSession?: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!settings.wahaUrl) {
    return { ok: false, error: "URL WAHA belum diatur di menu Pengaturan" };
  }
  const cleanUrl = settings.wahaUrl.replace(/\/$/, "");
  let p = phone.replace(/[\s\-().+]/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  const chatId = p.endsWith("@c.us") ? p : `${p}@c.us`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (settings.wahaApiKey) headers["X-Api-Key"] = settings.wahaApiKey;

  try {
    const res = await fetch(`${cleanUrl}/api/sendText`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId,
        text: pesan,
        session: settings.wahaSession || "alittihad",
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `WAHA HTTP ${res.status}: ${body.slice(0, 150)}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Gagal menghubungi server WAHA" };
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWAQueue() {
  const { user } = useAuth();

  const getSettings = useCallback(() => {
    try {
      const s = localStorage.getItem("alittihad_app_settings");
      if (s) return JSON.parse(s);
    } catch {}
    return null;
  }, []);

  const enqueue = useCallback(async (payload: EnqueuePayload): Promise<{ ok: boolean; error?: string }> => {
    const senderName = user?.nama || "Admin Presensi";
    const settings = getSettings();

    // 1. Coba masukkan ke database Supabase wa_queue
    try {
      const { error } = await supabase.from("wa_queue").insert({
        phone:         payload.phone,
        nama_penerima: payload.nama_penerima,
        pesan:         payload.pesan,
        jenis:         payload.jenis,
        ref_id:        payload.ref_id ?? null,
        priority:      payload.priority ?? 2,
        scheduled_at:  payload.scheduled_at ?? new Date().toISOString(),
        created_by:    senderName,
      });

      if (!error) return { ok: true };

      // 2. Jika Supabase error (misal RLS blocked / anon), kirim langsung via endpoint WAHA jika tersedia
      if (settings?.wahaUrl) {
        const direct = await sendToWAHAEndpoint(payload.phone, payload.pesan, settings);
        if (direct.ok) return { ok: true };
        return { ok: false, error: direct.error || error.message };
      }

      return { ok: false, error: error.message };
    } catch (err: any) {
      if (settings?.wahaUrl) {
        const direct = await sendToWAHAEndpoint(payload.phone, payload.pesan, settings);
        if (direct.ok) return { ok: true };
        return { ok: false, error: direct.error || err.message };
      }
      return { ok: false, error: err.message };
    }
  }, [user, getSettings]);

  const enqueueBulk = useCallback(async (payloads: EnqueuePayload[]): Promise<{ ok: boolean; count: number; error?: string }> => {
    if (payloads.length === 0) return { ok: true, count: 0 };
    const senderName = user?.nama || "Admin Presensi";
    const settings = getSettings();

    const rows = payloads.map(p => ({
      phone:         p.phone,
      nama_penerima: p.nama_penerima,
      pesan:         p.pesan,
      jenis:         p.jenis,
      ref_id:        p.ref_id ?? null,
      priority:      p.priority ?? 2,
      scheduled_at:  p.scheduled_at ?? new Date().toISOString(),
      created_by:    senderName,
    }));

    try {
      const { error } = await supabase.from("wa_queue").insert(rows);
      if (!error) return { ok: true, count: rows.length };

      // Fallback: kirim langsung jika tabel database wa_queue RLS blocked
      if (settings?.wahaUrl) {
        let sentCount = 0;
        let lastErr = "";
        for (const p of payloads) {
          const res = await sendToWAHAEndpoint(p.phone, p.pesan, settings);
          if (res.ok) {
            sentCount++;
          } else {
            lastErr = res.error || "Gagal";
          }
        }
        if (sentCount > 0) {
          return { ok: true, count: sentCount, error: sentCount < payloads.length ? lastErr : undefined };
        }
        return { ok: false, count: 0, error: lastErr || error.message };
      }

      return { ok: false, count: 0, error: error.message };
    } catch (err: any) {
      if (settings?.wahaUrl) {
        let sentCount = 0;
        let lastErr = "";
        for (const p of payloads) {
          const res = await sendToWAHAEndpoint(p.phone, p.pesan, settings);
          if (res.ok) sentCount++;
          else lastErr = res.error || "Gagal";
        }
        if (sentCount > 0) return { ok: true, count: sentCount };
        return { ok: false, count: 0, error: lastErr || err.message };
      }
      return { ok: false, count: 0, error: err.message };
    }
  }, [user, getSettings]);

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
