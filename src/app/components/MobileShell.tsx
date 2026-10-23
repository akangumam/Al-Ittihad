import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Bell, X, LogOut,
  LayoutDashboard, CreditCard, AlertTriangle, ClipboardList, MoreHorizontal,
  Calendar, Users, GraduationCap, BookOpen,
  FileText, Landmark, BarChart3, Calculator,
  Shield, Activity, Settings, IdCard, Archive, UserCheck, Megaphone,
} from "lucide-react";
import type { ElementType } from "react";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { useAlerts, NotifPanel } from "./TopBar";
import { toast } from "sonner";

// ─── bottom nav data ──────────────────────────────────────────────────────────

interface BottomNavItem {
  id: string;
  path?: string;
  Icon: ElementType;
  label: string;
  badge?: number;
  roles?: Role[];
}

const BOTTOM_NAV: BottomNavItem[] = [
  { id: "dashboard",  path: "/",                    Icon: LayoutDashboard, label: "Dashboard" },
  { id: "pembayaran", path: "/keuangan/pembayaran", Icon: CreditCard,      label: "Kasir",        roles: ["Admin", "Bendahara"] },
  { id: "tunggakan",  path: "/keuangan/tunggakan",  Icon: AlertTriangle,   label: "Tunggakan",    roles: ["Admin", "Bendahara"] },
  { id: "absensi",    path: "/akademik/absensi",    Icon: ClipboardList,   label: "Absensi Guru", roles: ["Admin", "TU"] },
  { id: "menu",                                     Icon: MoreHorizontal,  label: "Menu" },
];

// ─── menu sheet data ──────────────────────────────────────────────────────────

interface MenuItem {
  Icon: ElementType;
  label: string;
  path: string;
  roles?: Role[];
}

const MENU_GROUPS: Array<{
  group: string | null;
  items: MenuItem[];
}> = [
  {
    group: null,
    items: [
      { Icon: Calendar, label: "Kalender", path: "/kalender" },
    ],
  },
  {
    group: "AKADEMIK",
    items: [
      { Icon: Users,         label: "Siswa",          path: "/akademik/siswa",         roles: ["Admin", "Bendahara"] },
      { Icon: UserCheck,     label: "Absensi Siswa",  path: "/akademik/absensi-siswa", roles: ["Admin", "TU"] },
{ Icon: Archive,       label: "Data Alumni",    path: "/akademik/alumni",        roles: ["Admin"] },
      { Icon: GraduationCap, label: "Guru",           path: "/akademik/guru",          roles: ["Admin", "TU"] },
      { Icon: ClipboardList, label: "Absensi Guru",   path: "/akademik/absensi",       roles: ["Admin", "TU"] },
      { Icon: BookOpen,      label: "Kelas & Jadwal", path: "/akademik/kelas-jadwal",  roles: ["Admin", "TU"] },
      { Icon: IdCard,        label: "Kartu Digital",  path: "/akademik/kartu-digital", roles: ["Admin", "TU"] },
    ],
  },
  {
    group: "KEUANGAN SISWA",
    items: [
      { Icon: CreditCard,    label: "Kasir (Terima Bayar)", path: "/keuangan/pembayaran", roles: ["Admin", "Bendahara"] },
      { Icon: AlertTriangle, label: "Pantau Tunggakan",     path: "/keuangan/tunggakan",  roles: ["Admin", "Bendahara"] },
      { Icon: FileText,      label: "Penetapan Tagihan",    path: "/keuangan/tagihan",    roles: ["Admin", "Bendahara"] },
    ],
  },
  {
    group: "KEUANGAN YAYASAN",
    items: [
      { Icon: Landmark,   label: "Kas & Bank", path: "/keuangan/kas-bank",  roles: ["Admin", "Bendahara"] },
      { Icon: BarChart3,  label: "Laporan",    path: "/keuangan/laporan",   roles: ["Admin", "Bendahara"] },
      { Icon: Calculator, label: "Anggaran",   path: "/keuangan/anggaran",  roles: ["Admin", "Bendahara"] },
    ],
  },
  {
    group: "SISTEM",
    items: [
      { Icon: Shield,    label: "Pengguna & Akses", path: "/sistem/pengguna",      roles: ["Admin"] },
      { Icon: Activity,  label: "Log Aktivitas",    path: "/sistem/log-aktivitas", roles: ["Admin"] },
      { Icon: Megaphone, label: "WA Blast",          path: "/sistem/wa-blast",      roles: ["Admin"] },
      { Icon: Settings,  label: "Pengaturan",        path: "/sistem/pengaturan",    roles: ["Admin"] },
    ],
  },
];

// ─── bottom menu sheet ────────────────────────────────────────────────────────

function BottomMenuSheet({ onClose, onExitClick }: { onClose: () => void; onExitClick?: () => void }) {
  const navigate = useNavigate();
  const { role } = useAppContext();
  const { user, signOut } = useAuth();

  function go(path: string) {
    void navigate(path);
    onClose();
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50 bg-white overflow-y-auto"
      style={{ borderRadius: "16px 16px 0 0", maxHeight: "84%" }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="rounded-full bg-[#D1D5DB]" style={{ width: 32, height: 4 }} />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-5"
        style={{ paddingTop: 10, paddingBottom: 12 }}
      >
        <p className="font-semibold text-[#1C2517]">Menu</p>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#F5F9F4", border: "none", cursor: "pointer" }}
          aria-label="Tutup menu"
        >
          <X size={15} color="#374040" />
        </button>
      </div>

      {/* Groups */}
      {MENU_GROUPS.map((group, gi) => {
        const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(role));
        if (visibleItems.length === 0) return null;
        return (
          <div key={gi}>
            {gi === 1 && (
              <div className="h-px mx-5 bg-[#F0F7EE]" style={{ marginBottom: 4 }} />
            )}
            {group.group && (
              <p
                className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide px-5"
                style={{ paddingTop: 12, paddingBottom: 2 }}
              >
                {group.group}
              </p>
            )}
            {visibleItems.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="w-full flex items-center gap-3.5 px-5 hover:bg-[#F5F9F4] transition-colors"
                  style={{
                    height: 48,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <Icon size={18} color="#6B7769" />
                  <span className="text-[14px] text-[#374040]">{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}

      {/* Divider + info user + tombol panduan & keluar */}
      <div className="mx-5 mt-3" style={{ borderTop: "1px solid #F0F7EE" }}>
        <div className="py-2.5">
          <p className="text-[13px] font-semibold text-[#1C2517]">{user?.nama ?? "—"}</p>
          <p className="text-[11px] text-[#6B7769]">{user?.email ?? ""}</p>
        </div>
        <div className="flex items-center gap-2 pt-1 pb-2">
          <a
            href="/Petunjuk_Penggunaan_MTs_Al-Ittihad.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#374040]"
            style={{ background: "#F5F9F4", border: "1px solid #E2E8DE" }}
          >
            <FileText size={14} className="text-[#6B7769]" />
            Buku Panduan
          </a>
          <button
            onClick={() => {
              onClose();
              if (onExitClick) {
                onExitClick();
              } else {
                void signOut();
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] cursor-pointer"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ─── shell ────────────────────────────────────────────────────────────────────

export function MobileShell({ children }: { children: ReactNode }) {
  const { absensiCount, tunggakanCount, appSettings, role } = useAppContext();
  const { user } = useAuth();
  const shortYear = appSettings.tahunAjaran.split("/").map(y => y.slice(-2)).join("/");
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const alerts = useAlerts();

  const initials = user?.nama
    ? user.nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AU";

  const visibleBottomNav = BOTTOM_NAV.filter(item => !item.roles || item.roles.includes(role));

  function isNavActive(item: BottomNavItem): boolean {
    if (!item.path) return false;
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  }

  return (
    <div
      className="flex flex-col relative overflow-hidden"
      style={{ height: "100dvh", background: "#FAFBF9", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Top App Bar · 56px + safe-area ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: "calc(56px + env(safe-area-inset-top, 0px))",
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: "#fff",
          borderBottom: "1px solid #E2E8DE",
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src={logoEmblem} alt="MTs Al-Ittihad" className="object-contain" style={{ width: 32, height: 32 }} />
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold text-[#1C2517]">MTs Al-Ittihad</span>
            <span className="text-[10px] text-[#6B7769]">Pedaleman</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold text-[#3E8A2F]"
            style={{ background: "#EDF7EC", padding: "3px 8px", borderRadius: 99 }}
          >
            {shortYear}
          </span>
          <button
            onClick={() => setNotifOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center relative transition-colors hover:bg-[#F5F9F4]"
            style={{ background: notifOpen ? "#EDF7EC" : "#F5F9F4", border: "none", cursor: "pointer" }}
            aria-label="Notifikasi"
          >
            <Bell size={16} color={notifOpen ? "#3E8A2F" : "#374040"} />
            {alerts.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#DC2626] text-white text-[8px] font-bold flex items-center justify-center tabular-nums ring-1 ring-white"
              >
                {alerts.length > 9 ? "9+" : alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none shadow-sm"
            style={{ background: "#3E8A2F", border: "none", cursor: "pointer" }}
            aria-label="Profil & Keluar"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </div>

      {/* ── Bottom Navigation · 60px + safe-area ── */}
      <nav
        aria-label="Navigasi Bawah"
        className="absolute bottom-0 left-0 right-0 flex z-40 items-center justify-around"
        style={{
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "#fff",
          borderTop: "1px solid #E2E8DE",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
        }}
      >
        {visibleBottomNav.map((item) => {
          const isActive = item.id === "menu" ? menuOpen : isNavActive(item);
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "menu") {
                  setMenuOpen(true);
                } else {
                  if (menuOpen) setMenuOpen(false);
                  if (item.path) void navigate(item.path);
                }
              }}
              className="flex-1 flex flex-col items-center justify-center"
              style={{
                gap: 3,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                minHeight: 44,
              }}
            >
              <div className="relative">
                <Icon
                  size={22}
                  color={isActive ? "#3E8A2F" : "#9CA3A0"}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                {(() => {
                  let badgeVal = item.badge;
                  if (item.id === "tunggakan") badgeVal = tunggakanCount;
                  if (item.id === "absensi") badgeVal = absensiCount;

                  if (badgeVal !== undefined && badgeVal > 0) {
                    return (
                      <span
                        className="absolute flex items-center justify-center font-bold"
                        style={{
                          top: -4, right: -5,
                          minWidth: 15, height: 15,
                          borderRadius: 99,
                          background: "#DC2626", color: "#fff",
                          fontSize: 8, padding: "0 3px", lineHeight: 1,
                          fontFamily: "inherit",
                        }}
                      >
                        {badgeVal}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isActive ? "#3E8A2F" : "#9CA3A0", fontFamily: "inherit" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Menu Bottom Sheet + dim overlay ── */}
      {menuOpen && (
        <>
          <div
            className="absolute inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMenuOpen(false)}
          />
          <BottomMenuSheet
            onClose={() => setMenuOpen(false)}
            onExitClick={() => {
              setMenuOpen(false);
              setExitDialogOpen(true);
            }}
          />
        </>
      )}

      {/* ── Notification Panel ── */}
      {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}

      {/* Dialog Konfirmasi Keluar */}
      <ExitConfirmDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        onConfirm={async () => {
          await signOut();
          toast.info("Anda telah berhasil keluar dari sistem.");
        }}
      />
    </div>
  );
}
