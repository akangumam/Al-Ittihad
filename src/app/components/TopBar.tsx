import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search, Bell, ChevronDown, LogOut, KeyRound, Eye, EyeOff,
  X, AlertTriangle, UserX, Calendar, Wallet, CheckCircle, RefreshCw, FileText,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { tahunAjaranOptions } from "@/data/settings";
import { akunData } from "@/data/keuangan";
import type { AkunNama } from "@/types";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { toast } from "sonner";

function metodeToAkun(metode: string): AkunNama {
  return metode === "Tunai" ? "Kas Tunai" : "Bank BSI";
}

// ─── alert types ─────────────────────────────────────────────────────────────

type AlertLevel = "kritis" | "waspada" | "perhatian" | "info";

interface Alert {
  id: string;
  level: AlertLevel;
  icon: typeof AlertTriangle;
  title: string;
  subtitle: string;
  link: string;
}

const LEVEL_STYLE: Record<AlertLevel, { bg: string; text: string; dot: string }> = {
  kritis:    { bg: "#FEE2E2", text: "#991B1B", dot: "#DC2626" },
  waspada:   { bg: "#FFEDD5", text: "#9A3412", dot: "#EA580C" },
  perhatian: { bg: "#FEF9C3", text: "#713F12", dot: "#CA8A04" },
  info:      { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
};

const SALDO_MINIMUM = 12_000_000;

// ─── hook ─────────────────────────────────────────────────────────────────────

function useAlerts() {
  const { tagihanList, siswaList, jadwalList, guruList, absensiGuruHariIni, transaksiList, manualTransaksiList } = useAppContext();

  return useMemo<Alert[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts: Alert[] = [];

    // ── 1. Tunggakan per siswa ────────────────────────────────────────────────
    const activeNis = new Set(siswaList.filter(s => s.status === "Aktif").map(s => s.nis));
    const tunggakanBySiswa = new Map<string, number>();

    tagihanList.forEach(t => {
      if (!activeNis.has(t.nis) || t.isLunas) return;
      if (t.nominal <= t.terbayar) return;
      const days = Math.floor((today.getTime() - new Date(t.jatuhTempo).getTime()) / 86_400_000);
      if (days <= 0) return;
      const prev = tunggakanBySiswa.get(t.nis) ?? 0;
      if (days > prev) tunggakanBySiswa.set(t.nis, days);
    });

    const kritis    = [...tunggakanBySiswa.values()].filter(d => d > 60).length;
    const waspada   = [...tunggakanBySiswa.values()].filter(d => d > 30 && d <= 60).length;
    const perhatian = [...tunggakanBySiswa.values()].filter(d => d > 0 && d <= 30).length;

    if (kritis > 0) alerts.push({
      id: "tgk-kritis",
      level: "kritis",
      icon: AlertTriangle,
      title: `${kritis} siswa tunggakan kritis`,
      subtitle: `Jatuh tempo lebih dari 60 hari yang lalu`,
      link: "/keuangan/tunggakan",
    });
    if (waspada > 0) alerts.push({
      id: "tgk-waspada",
      level: "waspada",
      icon: AlertTriangle,
      title: `${waspada} siswa tunggakan waspada`,
      subtitle: `Jatuh tempo 31–60 hari yang lalu`,
      link: "/keuangan/tunggakan",
    });
    if (perhatian > 0) alerts.push({
      id: "tgk-perhatian",
      level: "perhatian",
      icon: AlertTriangle,
      title: `${perhatian} siswa perlu perhatian`,
      subtitle: `Tagihan melewati jatuh tempo 1–30 hari`,
      link: "/keuangan/tunggakan",
    });

    // ── 2. Guru belum absen hari ini ─────────────────────────────────────────
    const safe = absensiGuruHariIni ?? {};
    const belumAbsen = guruList.filter(g => !safe[g.id]).length;
    if (belumAbsen > 0) alerts.push({
      id: "absensi-guru",
      level: "perhatian",
      icon: UserX,
      title: `${belumAbsen} guru belum tercatat`,
      subtitle: "Absensi hari ini belum lengkap",
      link: "/akademik/absensi/hari-ini",
    });

    // ── 3. Jadwal bentrok ────────────────────────────────────────────────────
    const slotMap = new Map<string, string[]>();
    jadwalList.forEach(j => {
      if (!j.guruId) return;
      const key = `${j.guruId}-${j.hari}-${j.jam}`;
      const prev = slotMap.get(key) ?? [];
      slotMap.set(key, [...prev, j.kelas]);
    });
    const bentrokCount = [...slotMap.values()].filter(k => k.length > 1).length;
    if (bentrokCount > 0) alerts.push({
      id: "jadwal-bentrok",
      level: "waspada",
      icon: Calendar,
      title: `${bentrokCount} slot jadwal bentrok`,
      subtitle: "Satu guru dijadwalkan di dua kelas sekaligus",
      link: "/akademik/kelas-jadwal/jadwal",
    });

    // ── 4. Saldo minimum ─────────────────────────────────────────────────────
    const computedAkun = akunData.map(akun => {
      const deltaMasuk = transaksiList.reduce((sum, t) =>
        metodeToAkun(t.metode) === akun.nama ? sum + t.nominal : sum, 0);
      const deltaManualMasuk = manualTransaksiList
        .filter(t => t.akun === akun.nama && t.tipe === "masuk")
        .reduce((s, t) => s + t.jumlah, 0);
      const deltaManualKeluar = manualTransaksiList
        .filter(t => t.akun === akun.nama && t.tipe === "keluar")
        .reduce((s, t) => s + t.jumlah, 0);
      return { ...akun, saldo: akun.saldo + deltaMasuk + deltaManualMasuk - deltaManualKeluar };
    });

    computedAkun.forEach(akun => {
      if (akun.saldo < SALDO_MINIMUM) alerts.push({
        id: `saldo-${akun.id}`,
        level: "kritis",
        icon: Wallet,
        title: `Saldo ${akun.nama} rendah`,
        subtitle: `Rp ${akun.saldo.toLocaleString("id-ID")} — di bawah batas minimum`,
        link: "/keuangan/kas-bank/transaksi",
      });
    });

    return alerts;
  }, [tagihanList, siswaList, jadwalList, guruList, absensiGuruHariIni, transaksiList, manualTransaksiList]);
}

// ─── notification panel ───────────────────────────────────────────────────────

function NotifPanel({ onClose }: { onClose: () => void }) {
  const alerts = useAlerts();
  const navigate = useNavigate();

  function go(link: string) {
    navigate(link);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed top-14 right-0 md:right-4 bottom-0 md:bottom-auto w-full md:w-[380px] z-50 flex flex-col bg-white md:rounded-xl md:max-h-[calc(100vh-5rem)]"
        style={{ border: "1px solid #E2E8DE", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#3E8A2F]" />
            <span className="font-bold text-sm text-[#1C2517]">Notifikasi</span>
            {alerts.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold tabular-nums">
                {alerts.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7769] hover:bg-[#F5F9F4] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EDF7EC] flex items-center justify-center">
                <CheckCircle size={22} className="text-[#3E8A2F]" />
              </div>
              <div>
                <p className="font-semibold text-[#1C2517] text-sm">Semua kondisi normal</p>
                <p className="text-xs text-[#6B7769] mt-0.5">Tidak ada peringatan saat ini</p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {alerts.map(alert => {
                const Icon = alert.icon;
                const style = LEVEL_STYLE[alert.level];
                return (
                  <button
                    key={alert.id}
                    onClick={() => go(alert.link)}
                    className="w-full flex items-start gap-3 px-3.5 py-3 rounded-xl text-left transition-colors hover:brightness-95"
                    style={{ background: style.bg }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${style.dot}20` }}
                    >
                      <Icon size={14} style={{ color: style.dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: style.text }}>
                        {alert.title}
                      </p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: `${style.text}b0` }}>
                        {alert.subtitle}
                      </p>
                    </div>
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                      style={{ background: style.dot }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 shrink-0 text-center" style={{ borderTop: "1px solid #E2E8DE" }}>
          <p className="text-[11px] text-[#9CA3A0]">
            Alert dihitung otomatis dari data aktif
          </p>
        </div>
      </div>
    </>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const { tahunAjaran, setTahunAjaran, refreshAllCloudData, isSyncing } = useAppContext();
  const { user, signOut, updatePassword } = useAuth();
  const alerts = useAlerts();

  const [yearOpen, setYearOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [passError, setPassError] = useState("");
  const [passInfo, setPassInfo]   = useState("");
  const [passBusy, setPassBusy]   = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  function openPassModal() {
    setUserOpen(false);
    setNewPass(""); setConfirmPass(""); setShowPass(false);
    setPassError(""); setPassInfo(""); setPassBusy(false);
    setPassModal(true);
  }

  async function handleChangePass(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    if (newPass.length < 8) { setPassError("Password minimal 8 karakter."); return; }
    if (newPass !== confirmPass) { setPassError("Konfirmasi tidak cocok."); return; }
    setPassBusy(true);
    const err = await updatePassword(newPass);
    setPassBusy(false);
    if (err) { setPassError("Gagal menyimpan. Silakan coba lagi."); return; }
    setPassInfo("Password berhasil diubah!");
    setTimeout(() => setPassModal(false), 1800);
  }

  const initials = (user?.nama ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setYearOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <header
      className="h-14 bg-white flex items-center px-6 gap-4 shrink-0 z-30"
      style={{ borderBottom: "1px solid #E2E8DE" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#F0F7EE] transition-colors"
          style={{ background: "#F5F9F4", border: "1px solid #E2E8DE" }}
        >
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <span className="text-sm text-[#9CA3A0] flex-1 select-none">
            Cari siswa, transaksi...
          </span>
          <div className="flex items-center gap-0.5">
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘
            </kbd>
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Tombol Sinkronisasi Cloud */}
        <button
          onClick={() => refreshAllCloudData()}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:bg-[#EDF7EC] text-[#3E8A2F] border border-[#3E8A2F]/30 disabled:opacity-50"
          title="Sinkronkan data dengan server Supabase"
        >
          <RefreshCw size={13} className={isSyncing ? "animate-spin text-[#3E8A2F]" : "text-[#3E8A2F]"} />
          <span className="hidden sm:inline">{isSyncing ? "Menyinkronkan..." : "Sinkron Server"}</span>
        </button>

        {/* Academic year selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[#EDF7EC]"
            style={{ border: "1.5px solid #3E8A2F", color: "#3E8A2F" }}
          >
            {`TA ${tahunAjaran}`}
            <ChevronDown
              size={13}
              className="transition-transform"
              style={{ transform: yearOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {yearOpen && (
            <div
              className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl py-1 z-50 min-w-[164px]"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {tahunAjaranOptions.map((ta) => (
                <button
                  key={ta}
                  onClick={() => { setTahunAjaran(ta); setYearOpen(false); }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#EDF7EC]",
                    ta === tahunAjaran ? "text-[#3E8A2F] font-semibold" : "text-[#374040]",
                  ].join(" ")}
                >
                  TA {ta}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button
          onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
          className={`relative p-2 rounded-lg transition-colors ${notifOpen ? "bg-[#EDF7EC]" : "hover:bg-[#F5F9F4]"}`}
        >
          <Bell size={18} className={notifOpen ? "text-[#3E8A2F]" : "text-[#6B7769]"} />
          {alerts.length > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center tabular-nums ring-2 ring-white"
            >
              {alerts.length > 9 ? "9+" : alerts.length}
            </span>
          )}
        </button>

        {/* Avatar + user menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg hover:bg-[#F5F9F4] transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.nama} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="hidden lg:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-[#1C2517] leading-none mb-0.5 truncate">
                {user?.nama ?? "—"}
              </p>
              <p className="text-[10px] text-[#6B7769] leading-none">{user?.role ?? "—"}</p>
            </div>
            <ChevronDown
              size={13}
              className="text-[#9CA3A0] hidden lg:block transition-transform"
              style={{ transform: userOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {userOpen && (
            <div
              className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl py-1 z-50 min-w-[200px]"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: "1px solid #E2E8DE" }}>
                <p className="text-xs font-semibold text-[#1C2517] truncate">{user?.nama}</p>
                <p className="text-[10px] text-[#9CA3A0] truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={openPassModal}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
              >
                <KeyRound size={14} className="text-[#6B7769]" />
                Ganti Password
              </button>
              <a
                href="/Petunjuk_Penggunaan_MTs_Al-Ittihad.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setUserOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
              >
                <FileText size={14} className="text-[#6B7769]" />
                Buku Petunjuk (PDF)
              </a>
              <button
                onClick={() => { setUserOpen(false); setExitDialogOpen(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                style={{ borderTop: "1px solid #F0F7EE" }}
              >
                <LogOut size={14} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Notification panel */}
    {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}

    {/* Modal Ganti Password */}
    {passModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4" style={{ border: "1px solid #E2E8DE" }}>
          <div>
            <p className="font-semibold text-[#1C2517]">Ganti Password</p>
            <p className="text-xs text-[#6B7769] mt-0.5">Password baru minimal 8 karakter.</p>
          </div>

          {passInfo ? (
            <p className="text-sm font-semibold text-[#3E8A2F] text-center py-2">{passInfo}</p>
          ) : (
            <form onSubmit={handleChangePass} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#374040]">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={newPass}
                    onChange={e => setNewPass(e.target.value)} required autoFocus
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10"
                    style={{ border: "1.5px solid #E2E8DE" }}
                    placeholder="Min. 8 karakter"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0]">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#374040]">Konfirmasi</label>
                <input
                  type="password" value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #E2E8DE" }}
                  placeholder="Ulangi password baru"
                />
              </div>
              {passError && <p className="text-xs text-[#DC2626] font-medium">{passError}</p>}
              <div className="flex gap-2.5 pt-1">
                <button type="button" onClick={() => setPassModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#374040]"
                  style={{ border: "1.5px solid #E2E8DE" }}>
                  Batal
                </button>
                <button type="submit" disabled={passBusy}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#3E8A2F" }}>
                  {passBusy ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}

    {/* Dialog Konfirmasi Keluar */}
    <ExitConfirmDialog
      open={exitDialogOpen}
      onOpenChange={setExitDialogOpen}
      onConfirm={async () => {
        await signOut();
        toast.info("Anda telah berhasil keluar dari sistem.");
      }}
    />
  </>
  );
}
