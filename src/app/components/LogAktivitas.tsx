import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Download, Activity } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import type { ActivityLogTipe } from "@/types";

// ─── badge ────────────────────────────────────────────────────────────────────

const TIPE_STYLE: Record<ActivityLogTipe, string> = {
  "Login":             "bg-[#EDE9FE] text-[#5B21B6]",
  "Logout":            "bg-[#F3F4F6] text-[#374151]",
  "Pembayaran":        "bg-[#DCFCE7] text-[#166534]",
  "Penetapan Tagihan": "bg-[#DBEAFE] text-[#1E40AF]",
  "Update Tagihan":    "bg-[#FEF3C7] text-[#92400E]",
  "Hapus Tagihan":     "bg-[#FEE2E2] text-[#991B1B]",
  "Pembatalan":        "bg-[#FEE2E2] text-[#991B1B]",
};

function TipeBadge({ tipe }: { tipe: ActivityLogTipe }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${TIPE_STYLE[tipe]}`}>
      {tipe}
    </span>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtWaktu(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

const SEMUA_TIPE = "Semua Tipe";
const TIPE_OPTIONS: string[] = [
  SEMUA_TIPE, "Login", "Logout", "Pembayaran", "Penetapan Tagihan", "Update Tagihan", "Hapus Tagihan", "Pembatalan",
];

const PERIODE_OPTIONS = [
  { label: "Hari Ini",    value: "today" },
  { label: "7 Hari",      value: "7d" },
  { label: "30 Hari",     value: "30d" },
  { label: "Semua",       value: "all" },
];

function exportCSV(rows: ReturnType<typeof useFilteredRows>) {
  const header = "Waktu,Tipe,Deskripsi,Ref,Pelaku";
  const body = rows.map(r =>
    [fmtWaktu(r.waktu), r.tipe, `"${r.deskripsi}"`, r.ref, r.pelaku].join(",")
  ).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `log-aktivitas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── hook ─────────────────────────────────────────────────────────────────────

function useFilteredRows(
  search: string,
  tipeFilter: string,
  periodeFilter: string,
  activityLogs: ReturnType<typeof useAppContext>["activityLogs"],
) {
  return useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return activityLogs.filter(log => {
      if (tipeFilter !== SEMUA_TIPE && log.tipe !== tipeFilter) return false;

      if (periodeFilter !== "all") {
        const logDate = new Date(log.waktu);
        const diffMs = now.getTime() - logDate.getTime();
        if (periodeFilter === "today") {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          if (logDate < today) return false;
        } else if (periodeFilter === "7d" && diffMs > 7 * 86_400_000) return false;
        else if (periodeFilter === "30d" && diffMs > 30 * 86_400_000) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        return log.deskripsi.toLowerCase().includes(q) || log.ref.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activityLogs, search, tipeFilter, periodeFilter]);
}

// ─── page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export function LogAktivitas() {
  const { activityLogs } = useAppContext();
  const [search, setSearch]         = useState("");
  const [tipeFilter, setTipeFilter] = useState(SEMUA_TIPE);
  const [periode, setPeriode]       = useState("all");
  const [page, setPage]             = useState(1);

  const filtered = useFilteredRows(search, tipeFilter, periode, activityLogs);

  // Reset page on filter change
  React.useEffect(() => { setPage(1); }, [search, tipeFilter, periode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNums = useMemo(() => {
    const max = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-[#1C2517]">Log Aktivitas</h2>
        <p className="text-sm text-[#6B7769]">Rekam jejak seluruh perubahan data keuangan</p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl" style={{ border: "1px solid #E2E8DE" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap px-5 py-4" style={{ borderBottom: "1px solid #E2E8DE" }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[180px]"
            style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}>
            <Search size={13} className="text-[#9CA3A0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari deskripsi atau no. ref..."
              className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
            />
          </div>

          {/* Tipe filter */}
          <div className="relative">
            <select
              value={tipeFilter}
              onChange={e => setTipeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {TIPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          {/* Periode filter */}
          <div className="relative">
            <select
              value={periode}
              onChange={e => setPeriode(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE", background: "#FAFBF9" }}
            >
              {PERIODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#374040] hover:border-[#3E8A2F] hover:text-[#3E8A2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Count bar */}
        {filtered.length > 0 && (
          <div className="px-5 py-2.5 text-xs text-[#6B7769]" style={{ borderBottom: "1px solid #F0F7EE", background: "#FAFBF9" }}>
            Menampilkan <span className="font-semibold text-[#1C2517]">{filtered.length}</span> entri
            {tipeFilter !== SEMUA_TIPE && <> · tipe: <span className="font-medium">{tipeFilter}</span></>}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                <Th className="pl-5 pr-4 w-36">Waktu</Th>
                <Th className="pr-4 w-40">Tipe</Th>
                <Th className="pr-4">Deskripsi</Th>
                <Th className="pr-4 w-44">Ref</Th>
                <Th className="pr-5 w-28">Pelaku</Th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 text-[#9CA3A0]">
                      <Activity size={36} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">Belum ada aktivitas tercatat</p>
                      {(search || tipeFilter !== SEMUA_TIPE) && (
                        <p className="text-xs mt-1">Coba ubah filter pencarian</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((log, i) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-[#FAFBF9]"
                    style={{ borderBottom: i < paged.length - 1 ? "1px solid #F0F7EE" : "none" }}
                  >
                    <td className="pl-5 pr-4 py-3.5">
                      <span className="text-xs font-mono tabular-nums text-[#6B7769] whitespace-nowrap">
                        {fmtWaktu(log.waktu)}
                      </span>
                    </td>
                    <td className="pr-4 py-3.5">
                      <TipeBadge tipe={log.tipe} />
                    </td>
                    <td className="pr-4 py-3.5">
                      <span className="text-sm text-[#1C2517]">{log.deskripsi}</span>
                    </td>
                    <td className="pr-4 py-3.5">
                      {log.ref !== "—" ? (
                        <span className="text-xs font-mono tabular-nums text-[#3E8A2F] font-semibold">
                          {log.ref}
                        </span>
                      ) : (
                        <span className="text-xs text-[#C4C9C2]">—</span>
                      )}
                    </td>
                    <td className="pr-5 py-3.5">
                      <span className="text-sm text-[#6B7769]">{log.pelaku}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid #E2E8DE" }}>
            <span className="text-xs text-[#6B7769]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari{" "}
              <span className="font-semibold text-[#1C2517]">{filtered.length}</span> entri
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] disabled:text-[#D1D5DB] disabled:cursor-not-allowed"
                style={{ border: "1px solid #E2E8DE" }}
              >
                <ChevronLeft size={14} />
              </button>
              {pageNums.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    page === p ? "bg-[#3E8A2F] text-white font-bold" : "text-[#374040] hover:bg-[#EDF7EC] transition-colors"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#374040] disabled:text-[#D1D5DB] disabled:cursor-not-allowed"
                style={{ border: "1px solid #E2E8DE" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
