import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Filter } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { kalenderSeed, TIPE_CONFIG, type KalenderEvent, type TipeEvent } from "@/data/kalender";

// ─── helpers ──────────────────────────────────────────────────────────────────

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventSpansDate(ev: KalenderEvent, dateStr: string): boolean {
  return dateStr >= ev.tanggalMulai && dateStr <= ev.tanggalSelesai;
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ─── form sheet ───────────────────────────────────────────────────────────────

function EventSheet({
  event,
  tahunAjaran,
  onClose,
  onSave,
  onDelete,
}: {
  event?: KalenderEvent | null;
  tahunAjaran: string;
  onClose: () => void;
  onSave: (ev: KalenderEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState<Omit<KalenderEvent, "id">>({
    judul: event?.judul ?? "",
    tanggalMulai: event?.tanggalMulai ?? isoDate(new Date()),
    tanggalSelesai: event?.tanggalSelesai ?? isoDate(new Date()),
    tipe: event?.tipe ?? "event",
    keterangan: event?.keterangan ?? "",
    tahunAjaran,
  });
  const [showDelete, setShowDelete] = useState(false);
  const isEdit = !!event;
  const valid = form.judul.trim() && form.tanggalMulai && form.tanggalSelesai && form.tanggalMulai <= form.tanggalSelesai;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[480px] z-50 flex flex-col bg-white"
        style={{ borderLeft: "1px solid #E2E8DE", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div>
            <h3 className="font-bold text-[#1C2517]">{isEdit ? "Edit Event" : "Tambah Event"}</h3>
            <p className="text-xs text-[#6B7769] mt-0.5">Kalender Akademik {tahunAjaran}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Judul Event <span className="text-[#DC2626]">*</span></label>
            <input
              type="text"
              value={form.judul}
              onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
              placeholder="Contoh: Libur Hari Raya Idul Fitri"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Jenis Event <span className="text-[#DC2626]">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TIPE_CONFIG) as TipeEvent[]).map(tipe => {
                const cfg = TIPE_CONFIG[tipe];
                const active = form.tipe === tipe;
                return (
                  <button
                    key={tipe}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, tipe }))}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left"
                    style={{
                      background: active ? cfg.bg : "#FAFBF9",
                      color: active ? cfg.text : "#6B7769",
                      border: active ? `1.5px solid ${cfg.dot}` : "1px solid #E2E8DE",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Tanggal Mulai <span className="text-[#DC2626]">*</span></label>
              <input
                type="date"
                value={form.tanggalMulai}
                onChange={e => setForm(f => ({ ...f, tanggalMulai: e.target.value, tanggalSelesai: e.target.value > f.tanggalSelesai ? e.target.value : f.tanggalSelesai }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Tanggal Selesai <span className="text-[#DC2626]">*</span></label>
              <input
                type="date"
                value={form.tanggalSelesai}
                min={form.tanggalMulai}
                onChange={e => setForm(f => ({ ...f, tanggalSelesai: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7769] mb-1.5">Keterangan</label>
            <textarea
              value={form.keterangan}
              onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
              rows={3}
              placeholder="Opsional — informasi tambahan"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none border border-[#E2E8DE] focus:border-[#3E8A2F] transition-colors resize-none"
            />
          </div>

          {/* Delete confirm inline */}
          {isEdit && showDelete && (
            <div className="p-4 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2]">
              <p className="text-sm font-semibold text-[#DC2626] mb-3">Hapus event ini?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-lg text-sm font-medium text-[#374040] bg-white border border-[#E2E8DE] hover:bg-[#F5F9F4] transition-colors">Batal</button>
                <button onClick={() => { onDelete?.(event!.id); onClose(); }} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors">Hapus</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
          {isEdit && !showDelete && (
            <button onClick={() => setShowDelete(true)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors border border-[#DC2626]/30">
              Hapus
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors border border-[#E2E8DE]">
            Batal
          </button>
          <button
            onClick={() => valid && onSave({ id: event?.id ?? `ev-${Date.now()}`, ...form })}
            disabled={!valid}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#3E8A2F] text-white hover:bg-[#2E6B22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Simpan" : "Tambah"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function Kalender() {
  const { tahunAjaran, role } = useAppContext();
  const isAdmin = role === "Admin";

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [filterTipe, setFilterTipe] = useState<TipeEvent | "semua">("semua");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ mode: "add"; date?: string } | { mode: "edit"; event: KalenderEvent } | null>(null);

  // ── events state persisted to localStorage ────────────────────────────────
  const [events, setEvents] = useState<KalenderEvent[]>(() => {
    try {
      const saved = localStorage.getItem("alittihad_kalender");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return kalenderSeed;
  });

  useEffect(() => {
    localStorage.setItem("alittihad_kalender", JSON.stringify(events));
  }, [events]);

  // ── filtered by tahun ajaran + tipe ──────────────────────────────────────
  const filteredEvents = useMemo(() =>
    events.filter(ev =>
      ev.tahunAjaran === tahunAjaran &&
      (filterTipe === "semua" || ev.tipe === filterTipe)
    ), [events, tahunAjaran, filterTipe]);

  // ── calendar grid ─────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = firstDay.getDay(); // 0=Sun
    const days: (string | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(isoDate(new Date(viewYear, viewMonth, d)));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewYear, viewMonth]);

  const eventsOnDate = useMemo(() => {
    const map: Record<string, KalenderEvent[]> = {};
    filteredEvents.forEach(ev => {
      const cur = new Date(ev.tanggalMulai);
      const end = new Date(ev.tanggalSelesai);
      while (cur <= end) {
        const key = isoDate(cur);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [filteredEvents]);

  const selectedDateEvents = useMemo(() =>
    selectedDate ? (eventsOnDate[selectedDate] ?? []) : [],
    [selectedDate, eventsOnDate]
  );

  // ── upcoming events (next 60 days from today) ─────────────────────────────
  const upcomingEvents = useMemo(() => {
    const todayStr = isoDate(today);
    const limit = isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60));
    return filteredEvents
      .filter(ev => ev.tanggalSelesai >= todayStr && ev.tanggalMulai <= limit)
      .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
      .slice(0, 8);
  }, [filteredEvents]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(isoDate(today)); };

  const saveEvent = (ev: KalenderEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === ev.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = ev; return next; }
      return [...prev, ev];
    });
    setSheet(null);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const todayStr = isoDate(today);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-5 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-[#1C2517]">Kalender Akademik</h2>
          <p className="text-sm text-[#6B7769]">Tahun Ajaran {tahunAjaran} — jadwal kegiatan dan hari penting</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tipe */}
          <div className="relative">
            <select
              value={filterTipe}
              onChange={e => setFilterTipe(e.target.value as TipeEvent | "semua")}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              <option value="semua">Semua Jenis</option>
              {(Object.keys(TIPE_CONFIG) as TipeEvent[]).map(t => (
                <option key={t} value={t}>{TIPE_CONFIG[t].label}</option>
              ))}
            </select>
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none" />
            <ChevronLeft size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none rotate-[-90deg]" />
          </div>
          <button
            onClick={goToday}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#374040] hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
            style={{ border: "1px solid #E2E8DE" }}
          >
            Hari Ini
          </button>
          {isAdmin && (
            <button
              onClick={() => setSheet({ mode: "add" })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E8A2F] text-white text-sm font-semibold hover:bg-[#2E6B22] transition-colors"
            >
              <Plus size={13} /> Tambah Event
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── Calendar grid ── */}
        <div className="flex-1 min-w-0 bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors" style={{ border: "1px solid #E2E8DE" }}>
              <ChevronLeft size={15} />
            </button>
            <h3 className="font-bold text-[#1C2517] text-base">{BULAN_NAMES[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors" style={{ border: "1px solid #E2E8DE" }}>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {HARI.map(h => (
              <div key={h} className={`text-center text-[11px] font-semibold pb-2 ${h === "Min" || h === "Sab" ? "text-[#DC2626]/60" : "text-[#9CA3A0]"}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px px-3 pb-3">
            {calendarDays.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} />;
              const dayEvents = eventsOnDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayOfWeek = new Date(dateStr).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const dayNum = parseInt(dateStr.split("-")[2], 10);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="relative flex flex-col min-h-[68px] md:min-h-[80px] p-1.5 rounded-lg transition-colors text-left"
                  style={{
                    background: isSelected ? "#F0F7EE" : "transparent",
                    border: isSelected ? "1.5px solid #3E8A2F" : "1px solid transparent",
                  }}
                >
                  <span
                    className={[
                      "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 shrink-0",
                      isToday ? "bg-[#3E8A2F] text-white" :
                      isWeekend ? "text-[#DC2626]/70" :
                      "text-[#374040]",
                    ].join(" ")}
                  >
                    {dayNum}
                  </span>
                  <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                    {dayEvents.slice(0, 3).map(ev => {
                      const cfg = TIPE_CONFIG[ev.tipe];
                      return (
                        <div
                          key={ev.id}
                          className="truncate text-[10px] font-medium px-1 py-0.5 rounded"
                          style={{ background: cfg.bg, color: cfg.text }}
                          title={ev.judul}
                        >
                          {ev.judul}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-[#9CA3A0] pl-1">+{dayEvents.length - 3} lagi</span>
                    )}
                  </div>
                  {isAdmin && dayEvents.length === 0 && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-[#F5FBF4]">
                      <Plus size={14} className="text-[#3E8A2F]/60" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
          {/* Selected date events */}
          {selectedDate && (
            <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E2E8DE" }}>
                <div>
                  <p className="text-xs font-semibold text-[#9CA3A0] uppercase tracking-wider">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setSheet({ mode: "add", date: selectedDate })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3E8A2F] bg-[#F5FBF4] hover:bg-[#EDF7EC] transition-colors"
                    title="Tambah event pada tanggal ini"
                  >
                    <Plus size={13} />
                  </button>
                )}
              </div>
              <div className="px-4 py-3">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-[#9CA3A0] py-2">Tidak ada event pada hari ini.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map(ev => {
                      const cfg = TIPE_CONFIG[ev.tipe];
                      const isRange = ev.tanggalMulai !== ev.tanggalSelesai;
                      return (
                        <div
                          key={ev.id}
                          className="rounded-lg p-3 cursor-pointer hover:brightness-95 transition-all"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.dot}30` }}
                          onClick={() => isAdmin && setSheet({ mode: "edit", event: ev })}
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: cfg.dot }} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-snug" style={{ color: cfg.text }}>{ev.judul}</p>
                              {isRange && (
                                <p className="text-[11px] mt-0.5 opacity-75" style={{ color: cfg.text }}>
                                  {formatDisplayDate(ev.tanggalMulai)} – {formatDisplayDate(ev.tanggalSelesai)}
                                </p>
                              )}
                              {ev.keterangan && (
                                <p className="text-[11px] mt-0.5 opacity-75 line-clamp-2" style={{ color: cfg.text }}>{ev.keterangan}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming events */}
          <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #E2E8DE" }}>
              <p className="text-xs font-semibold text-[#9CA3A0] uppercase tracking-wider">Agenda 60 Hari ke Depan</p>
            </div>
            <div className="px-4 py-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-[#9CA3A0] py-2">Tidak ada event mendatang.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingEvents.map(ev => {
                    const cfg = TIPE_CONFIG[ev.tipe];
                    const isRange = ev.tanggalMulai !== ev.tanggalSelesai;
                    const dateLabel = isRange
                      ? `${formatDisplayDate(ev.tanggalMulai)} – ${formatDisplayDate(ev.tanggalSelesai)}`
                      : formatDisplayDate(ev.tanggalMulai);
                    return (
                      <div
                        key={ev.id}
                        className="flex items-start gap-2.5 cursor-pointer group"
                        onClick={() => {
                          const d = new Date(ev.tanggalMulai + "T00:00:00");
                          setViewYear(d.getFullYear());
                          setViewMonth(d.getMonth());
                          setSelectedDate(ev.tanggalMulai);
                        }}
                      >
                        <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cfg.dot }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1C2517] group-hover:text-[#3E8A2F] transition-colors leading-snug truncate">{ev.judul}</p>
                          <p className="text-[11px] text-[#9CA3A0] tabular-nums">{dateLabel}</p>
                        </div>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl px-4 py-3" style={{ border: "1px solid #E2E8DE" }}>
            <p className="text-xs font-semibold text-[#9CA3A0] uppercase tracking-wider mb-3">Keterangan</p>
            <div className="space-y-1.5">
              {(Object.keys(TIPE_CONFIG) as TipeEvent[]).map(tipe => {
                const cfg = TIPE_CONFIG[tipe];
                const count = filteredEvents.filter(ev => ev.tipe === tipe).length;
                return (
                  <div key={tipe} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                      <span className="text-xs text-[#374040]">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-[#9CA3A0]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: upcoming events below */}
      <div className="lg:hidden bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <p className="text-xs font-semibold text-[#9CA3A0] uppercase tracking-wider flex items-center gap-2">
            <Calendar size={13} /> Agenda Mendatang
          </p>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-[#9CA3A0] py-2">Tidak ada event mendatang.</p>
          ) : upcomingEvents.map(ev => {
            const cfg = TIPE_CONFIG[ev.tipe];
            return (
              <div key={ev.id} className="flex items-center gap-3 py-1">
                <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: cfg.dot }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C2517] truncate">{ev.judul}</p>
                  <p className="text-[11px] text-[#9CA3A0]">{formatDisplayDate(ev.tanggalMulai)}</p>
                </div>
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sheet ── */}
      {sheet && (
        <EventSheet
          event={sheet.mode === "edit" ? sheet.event : null}
          tahunAjaran={tahunAjaran}
          onClose={() => setSheet(null)}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
