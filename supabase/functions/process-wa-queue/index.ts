import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────────────────────

const WAHA_URL      = Deno.env.get("WAHA_URL")!;
const WAHA_API_KEY  = Deno.env.get("WAHA_API_KEY")!;
const WAHA_SESSION  = Deno.env.get("WAHA_SESSION") ?? "al-ittihad";
const MAX_PER_RUN   = 5;    // maks pesan per eksekusi cron
const JAM_MULAI_WIB = 6;    // 06:00 WIB
const JAM_TUTUP_WIB = 21;   // 21:00 WIB (jam aktif 06:00 - 21:00 WIB)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const e164 = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
  return `${e164}@c.us`;
}

function randomDelayMs(): number {
  return 3_000 + Math.random() * 5_000; // 3–8 detik
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function backoffSchedule(attempts: number): string {
  const minutes = [1, 5, 15][attempts] ?? 15;
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WAQueueRow {
  id: string;
  phone: string;
  pesan: string;
  attempts: number;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (_req) => {
  // Cek jam aktif (WIB = UTC+7)
  const jamWIB = new Date().getUTCHours() + 7;
  const jamEfektif = jamWIB >= 24 ? jamWIB - 24 : jamWIB;
  if (jamEfektif < JAM_MULAI_WIB || jamEfektif >= JAM_TUTUP_WIB) {
    return Response.json({ skipped: true, reason: "di luar jam aktif" });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Ambil pesan pending yang sudah scheduled dan belum 3x gagal
  const { data: messages, error } = await supabase
    .from("wa_queue")
    .select("id, phone, pesan, attempts")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .lt("attempts", 3)
    .order("priority", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error("Gagal query wa_queue:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!messages || messages.length === 0) {
    return Response.json({ processed: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const msg of messages as WAQueueRow[]) {
    // Kunci row sebagai "sending" agar tidak diambil run paralel
    const { error: lockErr } = await supabase
      .from("wa_queue")
      .update({ status: "sending", attempts: msg.attempts + 1 })
      .eq("id", msg.id)
      .eq("status", "pending"); // pastikan masih pending (optimistic lock)

    if (lockErr) continue; // sudah diambil run lain

    try {
      const res = await fetch(`${WAHA_URL}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_API_KEY,
        },
        body: JSON.stringify({
          session: WAHA_SESSION,
          chatId: normalizePhone(msg.phone),
          text: msg.pesan,
        }),
      });

      if (res.ok) {
        await supabase
          .from("wa_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", msg.id);
        sent++;
      } else {
        const errText = await res.text();
        const nextAttempts = msg.attempts + 1;
        await supabase
          .from("wa_queue")
          .update({
            status: nextAttempts >= 3 ? "failed" : "pending",
            last_error: `HTTP ${res.status}: ${errText}`.slice(0, 500),
            scheduled_at: backoffSchedule(nextAttempts),
          })
          .eq("id", msg.id);
        failed++;
      }
    } catch (err) {
      const nextAttempts = msg.attempts + 1;
      await supabase
        .from("wa_queue")
        .update({
          status: nextAttempts >= 3 ? "failed" : "pending",
          last_error: String(err).slice(0, 500),
          scheduled_at: backoffSchedule(nextAttempts),
        })
        .eq("id", msg.id);
      failed++;
    }

    // Delay acak antar pesan untuk menghindari deteksi spam
    if (sent + failed < messages.length) {
      await sleep(randomDelayMs());
    }
  }

  console.log(`wa-queue: sent=${sent} failed=${failed}`);
  return Response.json({ processed: sent, failed });
});
