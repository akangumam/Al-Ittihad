/**
 * WAHA Worker — polls wa_queue (Supabase) and sends via WAHA API.
 * Run: node worker.mjs
 * Requires: .env (see .env.example) + Node.js 18+
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WAHA_URL         = (process.env.WAHA_URL ?? "http://localhost:3000").replace(/\/$/, "");
const WAHA_API_KEY     = process.env.WAHA_API_KEY ?? "";
const WAHA_SESSION     = process.env.WAHA_SESSION ?? "default";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 15_000);
const BATCH_SIZE       = Number(process.env.BATCH_SIZE ?? 5);
const MSG_DELAY_MS     = Number(process.env.MSG_DELAY_MS ?? 2_000);
const MAX_ATTEMPTS     = 3;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalisasi nomor HP Indonesia ke format WhatsApp (628xxx@c.us) */
function normalizePhone(phone) {
  let p = String(phone).replace(/[\s\-().+]/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p.endsWith("@c.us")) p = p + "@c.us";
  return p;
}

async function sendWAHA(chatId, text) {
  const headers = { "Content-Type": "application/json" };
  if (WAHA_API_KEY) headers["X-Api-Key"] = WAHA_API_KEY;

  const res = await fetch(`${WAHA_URL}/api/sendText`, {
    method: "POST",
    headers,
    body: JSON.stringify({ chatId, text, session: WAHA_SESSION }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`WAHA HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(level, ...args) {
  const ts = new Date().toISOString();
  console[level](`[${ts}]`, ...args);
}

// ── Queue processing ──────────────────────────────────────────────────────────

async function processQueue() {
  const now = new Date().toISOString();

  // Ambil BATCH_SIZE baris pending yang sudah saatnya dikirim
  const { data: rows, error: fetchErr } = await supabase
    .from("wa_queue")
    .select("id, phone, pesan, attempts, nama_penerima")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .lt("attempts", MAX_ATTEMPTS)
    .order("priority", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchErr) {
    log("error", "[poll] Gagal fetch queue:", fetchErr.message);
    return;
  }
  if (!rows || rows.length === 0) return;

  log("info", `[poll] ${rows.length} pesan diproses...`);

  for (const row of rows) {
    // Klaim atomik: ubah status → "sending" hanya jika masih "pending"
    const { error: claimErr, count } = await supabase
      .from("wa_queue")
      .update({ status: "sending", attempts: row.attempts + 1 })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id", { count: "exact", head: true });

    if (claimErr || count === 0) {
      log("warn", `[msg ${row.id}] sudah diklaim proses lain, skip`);
      continue;
    }

    const chatId = normalizePhone(row.phone);

    try {
      await sendWAHA(chatId, row.pesan);
      await supabase.from("wa_queue").update({
        status: "sent",
        sent_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", row.id);
      log("info", `[msg ${row.id}] ✓ terkirim → ${chatId} (${row.nama_penerima})`);
    } catch (err) {
      const newAttempts = row.attempts + 1;
      const isFinal = newAttempts >= MAX_ATTEMPTS;
      await supabase.from("wa_queue").update({
        status: isFinal ? "failed" : "pending",
        last_error: err.message.slice(0, 500),
      }).eq("id", row.id);
      log("error", `[msg ${row.id}] ✗ gagal (percobaan ${newAttempts}/${MAX_ATTEMPTS}) → ${chatId}:`, err.message);
    }

    await sleep(MSG_DELAY_MS);
  }
}

// ── WAHA session check ────────────────────────────────────────────────────────

async function checkSession() {
  try {
    const headers = {};
    if (WAHA_API_KEY) headers["X-Api-Key"] = WAHA_API_KEY;
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers,
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      log("warn", `[session] Status session "${WAHA_SESSION}": HTTP ${res.status} — pastikan WAHA sudah terhubung ke WhatsApp`);
      return false;
    }
    const data = await res.json();
    const status = data?.status ?? data?.state ?? "UNKNOWN";
    log("info", `[session] "${WAHA_SESSION}" status: ${status}`);
    return status === "WORKING";
  } catch (err) {
    log("error", "[session] Tidak bisa terhubung ke WAHA:", err.message);
    return false;
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function main() {
  log("info", "=== WAHA Worker dimulai ===");
  log("info", `  WAHA   : ${WAHA_URL} (session: ${WAHA_SESSION})`);
  log("info", `  Poll   : setiap ${POLL_INTERVAL_MS / 1000}s | Batch: ${BATCH_SIZE} | Delay antar pesan: ${MSG_DELAY_MS}ms`);
  log("info", `  Auth   : ${WAHA_API_KEY ? "X-Api-Key aktif" : "tanpa autentikasi"}`);

  // Cek koneksi session saat start
  await checkSession();

  let iteration = 0;
  while (true) {
    try {
      await processQueue();
    } catch (err) {
      log("error", "[loop] Unexpected error:", err);
    }

    // Cek health session setiap 20 iterasi (~5 menit)
    if (++iteration % 20 === 0) await checkSession();

    await sleep(POLL_INTERVAL_MS);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
