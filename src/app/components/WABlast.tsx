import { useState, useMemo, useEffect } from "react";
import { MessageCircle, Users, Filter, Send, Clock, CheckCircle2, XCircle, Zap, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";
import { useWAQueue } from "@/hooks/useWAQueue";
import { supabase } from "@/lib/supabase";
import { WA_TEMPLATE_DEFAULTS, renderTemplate } from "@/lib/waTemplates";
import { kelasOptions } from "@/data/constants";
import type { SiswaRow } from "@/data/siswa";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtEstTime(seconds: number): string {
  if (seconds < 60) return `~${Math.ceil(seconds)}d`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return s > 0 ? `~${m}m ${s}d` : `~${m}m`;
}

// ─── RecipientPreview ──────────────────────────────────────────────────────────

function RecipientPreview({ recipients }: { recipients: SiswaRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? recipients : recipients.slice(0, 5);
  if (recipients.length === 0) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
        <p className="text-sm font-semibold text-[#92400E]">Tidak ada penerima</p>
        <p className="text-xs text-[#A16207] mt-0.5">Sesuaikan filter di atas atau periksa data nomor WA siswa</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#F5F9F4", borderBottom: "1px solid #E2E8DE" }}>
        <p className="text-xs font-semibold text-[#1C2517]">
          {recipients.length} penerima (hanya yang punya No WA)
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "#E2E8DE" }}>
        {shown.map(s => (
          <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-sm font-medium text-[#1C2517]">{s.nama}</p>
              <p className="text-xs text-[#6B7769]">Kelas {s.kelas} · {s.waliNama || "Wali tidak tercatat"}</p>
            </div>
            <p className="text-xs tabular-nums text-[#6B7769]">{s.waliHp}</p>
          </div>
        ))}
      </div>
      {recipients.length > 5 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-[#3E8A2F] hover:bg-[#F5F9F4] transition-colors"
          style={{ borderTop: "1px solid #E2E8DE" }}
        >
          <ChevronDown size={13} className={expanded ? "rotate-180" : ""} />
          {expanded ? "Sembunyikan" : `Lihat ${recipients.length - 5} lainnya`}
        </button>
      )}
    </div>
  );
}

// ─── BlastProgress ─────────────────────────────────────────────────────────────

interface BlastStats { sent: number; failed: number; pending: number; total: number }

function BlastProgress({ blastId, onDone }: { blastId: string; onDone: () => void }) {
  const [stats, setStats] = useState<BlastStats | null>(null);

  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase.from("wa_queue").select("status").eq("ref_id", blastId);
      if (!data) return;
      const s: BlastStats = {
        sent:    data.filter(r => r.status === "sent").length,
        failed:  data.filter(r => r.status === "failed").length,
        pending: data.filter(r => ["pending", "sending"].includes(r.status)).length,
        total:   data.length,
      };
      setStats(s);
    };
    poll();
    const iv = setInterval(poll, 12_000);
    return () => clearInterval(iv);
  }, [blastId]);

  if (!stats) return null;

  const pct = stats.total > 0 ? Math.round(((stats.sent + stats.failed) / stats.total) * 100) : 0;
  const done = stats.pending === 0;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "#F5F9F4", borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E7FBF0" }}>
            <MessageCircle size={14} style={{ color: "#25D366" }} />
          </div>
          <p className="text-sm font-semibold text-[#1C2517]">
            {done ? "Blast Selesai" : "Blast Berjalan..."}
          </p>
        </div>
        {done && (
          <button
            onClick={onDone}
            className="text-xs font-semibold text-[#3E8A2F] hover:underline"
          >
            Kirim Blast Baru
          </button>
        )}
      </div>
      <div className="px-5 py-4 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-[#6B7769] mb-1.5">
            <span>{stats.sent + stats.failed} / {stats.total} diproses</span>
            <span className="font-semibold tabular-nums">{pct}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "#E2E8DE" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: stats.failed > 0 ? "#F97316" : "#3E8A2F" }}
            />
          </div>
        </div>

        {/* Stats chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Terkirim", value: stats.sent,    bg: "#DCFCE7", text: "#166534", icon: <CheckCircle2 size={14} /> },
            { label: "Pending",  value: stats.pending, bg: "#FEF3C7", text: "#92400E", icon: <Clock size={14} /> },
            { label: "Gagal",    value: stats.failed,  bg: "#FEE2E2", text: "#991B1B", icon: <XCircle size={14} /> },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: s.bg }}>
              <span style={{ color: s.text }}>{s.icon}</span>
              <div>
                <p className="text-lg font-bold tabular-nums leading-none" style={{ color: s.text }}>{s.value}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: s.text }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {!done && (
          <p className="text-xs text-[#6B7769] text-center">
            Update otomatis setiap 12 detik · Pesan dikirim oleh server WAHA
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function WABlast() {
  const { siswaList, tagihanList, appSettings } = useAppContext();
  const { enqueueBulk } = useWAQueue();

  // Filter state
  const [filterType, setFilterType] = useState<"all" | "kelas" | "status">("all");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Menunggak");

  // Message state
  const [pesan, setPesan] = useState("");
  const [useWrapper, setUseWrapper] = useState(true);

  // Delay state (seconds)
  const [minDelay, setMinDelay] = useState(5);
  const [maxDelay, setMaxDelay] = useState(15);

  // Blast state
  const [isSending, setIsSending] = useState(false);
  const [blastId, setBlastId] = useState<string | null>(null);

  // Compute recipients: active siswa with phone numbers
  const recipients = useMemo<SiswaRow[]>(() => {
    const withPhone = siswaList.filter(s => s.status === "Aktif" && s.waliHp?.trim());
    if (filterType === "all") return withPhone;
    if (filterType === "kelas") {
      return filterKelas === "Semua" ? withPhone : withPhone.filter(s => s.kelas === filterKelas);
    }
    if (filterType === "status") {
      const menunggakNis = new Set(
        tagihanList
          .filter(t => t.nominal > t.terbayar)
          .map(t => t.nis)
      );
      if (filterStatus === "Menunggak") return withPhone.filter(s => menunggakNis.has(s.nis));
      if (filterStatus === "Lunas") return withPhone.filter(s => !menunggakNis.has(s.nis));
      return withPhone;
    }
    return withPhone;
  }, [siswaList, tagihanList, filterType, filterKelas, filterStatus]);

  const estSeconds = useMemo(() => {
    if (recipients.length <= 1) return 0;
    return (recipients.length - 1) * ((minDelay + maxDelay) / 2);
  }, [recipients.length, minDelay, maxDelay]);

  const previewText = useMemo(() => {
    const sample = recipients[0];
    if (!sample || !pesan.trim()) return "";
    const body = pesan.trim();
    if (!useWrapper) return body;
    return renderTemplate(
      appSettings.waTemplates?.blast ?? WA_TEMPLATE_DEFAULTS.blast,
      { nama_siswa: sample.nama, kelas: sample.kelas, nama_wali: sample.waliNama || "Wali", pesan: body },
    );
  }, [pesan, recipients, useWrapper, appSettings.waTemplates]);

  async function handleBlast() {
    if (!pesan.trim()) { toast.error("Pesan tidak boleh kosong"); return; }
    if (recipients.length === 0) { toast.error("Tidak ada penerima"); return; }

    setIsSending(true);
    const newBlastId = `BLAST-${Date.now()}`;
    const now = Date.now();
    let cumulativeMs = 0;
    const blastTemplate = appSettings.waTemplates?.blast ?? WA_TEMPLATE_DEFAULTS.blast;

    const payloads = recipients.map((s, i) => {
      if (i > 0) {
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        cumulativeMs += delay * 1000;
      }
      const scheduled = new Date(now + cumulativeMs);
      const body = pesan.trim();
      const finalPesan = useWrapper
        ? renderTemplate(blastTemplate, { nama_siswa: s.nama, kelas: s.kelas, nama_wali: s.waliNama || `Wali dari ${s.nama}`, pesan: body })
        : body;
      return {
        phone:         s.waliHp!,
        nama_penerima: s.waliNama || `Wali dari ${s.nama}`,
        pesan:         finalPesan,
        jenis:         "custom" as const,
        ref_id:        newBlastId,
        scheduled_at:  scheduled.toISOString(),
        priority:      3,
      };
    });

    const result = await enqueueBulk(payloads);
    setIsSending(false);

    if (result.ok) {
      setBlastId(newBlastId);
      toast.success(`${result.count} pesan berhasil dijadwalkan ke antrian WA`);
    } else {
      toast.error(`Gagal menjadwalkan: ${result.error}`);
    }
  }

  if (blastId) {
    return (
      <div className="space-y-5 max-w-[680px]">
        <div>
          <h2 className="text-[#1C2517] font-bold">WA Blast</h2>
          <p className="text-sm text-[#6B7769]">Pantau status pengiriman pesan massal</p>
        </div>
        <BlastProgress blastId={blastId} onDone={() => setBlastId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[680px]">
      <div>
        <h2 className="text-[#1C2517] font-bold">WA Blast</h2>
        <p className="text-sm text-[#6B7769]">Kirim pesan massal ke wali murid dengan delay acak untuk menghindari pemblokiran</p>
      </div>

      {/* Warning */}
      <div className="rounded-xl px-4 py-3 flex gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#D97706]" />
        <p className="text-xs text-[#92400E]">
          Gunakan fitur ini dengan bijak. Blast terlalu sering dapat memicu pembatasan oleh WhatsApp.
          Gunakan delay minimal <strong>5 detik</strong> dan batasi frekuensi blast per hari.
        </p>
      </div>

      {/* ── Step 1: Filter Penerima ── */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
        <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <Users size={15} className="text-[#6B7769]" />
          <p className="text-sm font-semibold text-[#1C2517]">Pilih Penerima</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Filter type radio */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all",    label: "Semua Wali Murid" },
              { value: "kelas",  label: "Per Kelas" },
              { value: "status", label: "Per Status Tagihan" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value as typeof filterType)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={filterType === opt.value
                  ? { background: "#3E8A2F", color: "#fff", border: "1.5px solid #3E8A2F" }
                  : { background: "#fff", color: "#374040", border: "1px solid #E2E8DE" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filterType === "kelas" && (
            <select
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <option value="Semua">Semua Kelas</option>
              {kelasOptions.filter(k => k !== "Semua").map(k => <option key={k}>{k}</option>)}
            </select>
          )}

          {filterType === "status" && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#1C2517] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <option value="Menunggak">Menunggak (ada tunggakan)</option>
              <option value="Lunas">Lunas (tidak ada tunggakan)</option>
            </select>
          )}

          <RecipientPreview recipients={recipients} />
        </div>
      </div>

      {/* ── Step 2: Tulis Pesan ── */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
        <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <MessageCircle size={15} className="text-[#6B7769]" />
          <p className="text-sm font-semibold text-[#1C2517]">Isi Pesan</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* Wrapper toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseWrapper(v => !v)}
              className="relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200"
              style={{ width: 36, height: 20, background: useWrapper ? "#3E8A2F" : "#D1D5DB", padding: 2 }}
            >
              <span className="inline-block rounded-full bg-white shadow-sm transition-transform duration-200" style={{ width: 16, height: 16, transform: useWrapper ? "translateX(16px)" : "translateX(0)" }} />
            </button>
            <p className="text-sm text-[#374040]">
              Gunakan template blast <span className="text-xs text-[#6B7769]">(tambahkan salam pembuka & penutup otomatis)</span>
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-medium text-[#6B7769] mb-1.5">
              {useWrapper ? "Isi pesan (tanpa salam — akan dibungkus template)" : "Pesan lengkap"}
            </label>
            <textarea
              value={pesan}
              onChange={e => setPesan(e.target.value)}
              placeholder={useWrapper
                ? "Contoh: Mengingatkan pembayaran administrasi TA 2025/2026 yang belum diselesaikan. Mohon segera konfirmasi ke bendahara madrasah."
                : "Tulis pesan lengkap Anda di sini..."
              }
              rows={5}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#1C2517] outline-none resize-none"
              style={{ border: "1.5px solid #3E8A2F" }}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-[#9CA3A0]">
                {useWrapper ? "Variabel tersedia: {nama_siswa}, {kelas}, {nama_wali}" : "Teks akan dikirim apa adanya ke semua penerima"}
              </p>
              <p className="text-[11px] text-[#9CA3A0] tabular-nums">{pesan.length} karakter</p>
            </div>
          </div>

          {/* Preview */}
          {previewText && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
              <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide px-3 py-2" style={{ borderBottom: "1px solid #E2E8DE", background: "#FAFBF9" }}>
                Preview pesan ke: {recipients[0]?.nama}
              </p>
              <pre className="px-3 py-3 text-xs text-[#374040] whitespace-pre-wrap leading-relaxed font-sans">
                {previewText}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 3: Delay & Estimasi ── */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
        <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <Clock size={15} className="text-[#6B7769]" />
          <p className="text-sm font-semibold text-[#1C2517]">Delay Antar Pesan</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7769] mb-1.5">Delay Minimum (detik)</label>
              <div className="flex items-center gap-3">
                <input type="range" min={3} max={60} value={minDelay}
                  onChange={e => { const v = +e.target.value; setMinDelay(v); if (v > maxDelay) setMaxDelay(v); }}
                  className="flex-1 accent-[#3E8A2F]"
                />
                <span className="text-sm font-bold tabular-nums text-[#1C2517] w-8">{minDelay}s</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7769] mb-1.5">Delay Maksimum (detik)</label>
              <div className="flex items-center gap-3">
                <input type="range" min={3} max={60} value={maxDelay}
                  onChange={e => { const v = +e.target.value; setMaxDelay(v); if (v < minDelay) setMinDelay(v); }}
                  className="flex-1 accent-[#3E8A2F]"
                />
                <span className="text-sm font-bold tabular-nums text-[#1C2517] w-8">{maxDelay}s</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Penerima",      value: `${recipients.length} orang`, bg: "#EFF6FF", text: "#1E40AF" },
              { label: "Rata-rata Delay", value: `${((minDelay + maxDelay) / 2).toFixed(0)}s`,  bg: "#F0FDF4", text: "#166534" },
              { label: "Est. Selesai",  value: fmtEstTime(estSeconds),       bg: "#FEF3C7", text: "#92400E" },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-3 text-center" style={{ background: c.bg }}>
                <p className="text-base font-bold tabular-nums" style={{ color: c.text }}>{c.value}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: c.text }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tombol Blast ── */}
      <div className="flex items-center justify-between p-5 bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div>
          <p className="text-sm font-semibold text-[#1C2517]">
            Kirim ke {recipients.length} penerima
          </p>
          <p className="text-xs text-[#6B7769] mt-0.5">
            Pesan akan diantrekan dan dikirim oleh server WAHA secara bertahap
          </p>
        </div>
        <button
          onClick={handleBlast}
          disabled={isSending || recipients.length === 0 || !pesan.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#3E8A2F", color: "#fff" }}
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menjadwalkan...
            </>
          ) : (
            <>
              <Zap size={15} />
              Mulai Blast
            </>
          )}
        </button>
      </div>
    </div>
  );
}
