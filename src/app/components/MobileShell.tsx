import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Bell, Search, X,
  LayoutDashboard, CreditCard, AlertTriangle, ClipboardList, MoreHorizontal,
  Calendar, Users, GraduationCap, BookOpen,
  FileText, Landmark, BarChart3, Calculator,
  Shield, Activity, Settings,
} from "lucide-react";
import type { ElementType } from "react";
import logoEmblem from "../../imports/aliet_logo.png";

// ─── bottom nav data ──────────────────────────────────────────────────────────

interface BottomNavItem {
  id: string;
  path?: string;
  Icon: ElementType;
  label: string;
  badge?: number;
}

const BOTTOM_NAV: BottomNavItem[] = [
  { id: "dashboard",  path: "/",                    Icon: LayoutDashboard, label: "Dashboard" },
  { id: "pembayaran", path: "/keuangan/pembayaran", Icon: CreditCard,       label: "Pembayaran" },
  { id: "tunggakan",  path: "/keuangan/tunggakan",  Icon: AlertTriangle,    label: "Tunggakan", badge: 12 },
  { id: "absensi",    path: "/akademik/absensi",    Icon: ClipboardList,    label: "Absensi",   badge: 3 },
  { id: "menu",                                     Icon: MoreHorizontal,   label: "Menu" },
];

// ─── menu sheet data ──────────────────────────────────────────────────────────

const MENU_GROUPS: Array<{
  group: string | null;
  items: Array<{ Icon: ElementType; label: string; path: string }>;
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
      { Icon: Users,         label: "Siswa",         path: "/akademik/siswa" },
      { Icon: GraduationCap, label: "Guru",           path: "/akademik/guru" },
      { Icon: BookOpen,      label: "Kelas & Jadwal", path: "/akademik/kelas-jadwal" },
    ],
  },
  {
    group: "KEUANGAN",
    items: [
      { Icon: FileText,   label: "Tagihan",    path: "/keuangan/tagihan" },
      { Icon: Landmark,   label: "Kas & Bank", path: "/keuangan/kas-bank" },
      { Icon: BarChart3,  label: "Laporan",    path: "/keuangan/laporan" },
      { Icon: Calculator, label: "Anggaran",   path: "/keuangan/anggaran" },
    ],
  },
  {
    group: "SISTEM",
    items: [
      { Icon: Shield,   label: "Pengguna & Akses", path: "/sistem/pengguna" },
      { Icon: Activity, label: "Log Aktivitas",    path: "/sistem/log-aktivitas" },
      { Icon: Settings, label: "Pengaturan",       path: "/sistem/pengaturan" },
    ],
  },
];

// ─── bottom menu sheet ────────────────────────────────────────────────────────

function BottomMenuSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

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
      {MENU_GROUPS.map((group, gi) => (
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
          {group.items.map((item) => {
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
      ))}

      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── shell ────────────────────────────────────────────────────────────────────

export function MobileShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* ── Top App Bar · 56px ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 56, background: "#fff", borderBottom: "1px solid #E2E8DE" }}
      >
        <img src={logoEmblem} alt="MTs Al-Ittihad" className="object-contain" style={{ width: 32, height: 32 }} />
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold text-[#3E8A2F]"
            style={{ background: "#EDF7EC", padding: "4px 10px", borderRadius: 99 }}
          >
            25/26
          </span>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#F5F9F4", border: "none", cursor: "pointer" }}
            aria-label="Notifikasi"
          >
            <Bell size={17} color="#374040" />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
            style={{ background: "#3E8A2F" }}
          >
            AU
          </div>
        </div>
      </div>

      {/* ── Search bar · 44px ── */}
      <div
        className="shrink-0"
        style={{ background: "#fff", borderBottom: "1px solid #E2E8DE", padding: "8px 16px" }}
      >
        <div
          className="flex items-center gap-2.5 rounded-[10px]"
          style={{ height: 44, background: "#F5F9F4", border: "1px solid #E2E8DE", padding: "0 14px" }}
        >
          <Search size={16} color="#9CA3A0" className="shrink-0" />
          <input
            type="text"
            placeholder="Cari siswa, transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[#1C2517]"
            style={{ fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 64 }}>
        {children}
      </div>

      {/* ── Bottom Navigation · 64px ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex z-40"
        style={{ height: 64, background: "#fff", borderTop: "1px solid #E2E8DE" }}
      >
        {BOTTOM_NAV.map((item) => {
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
                {item.badge !== undefined && (
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
                    {item.badge}
                  </span>
                )}
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
      </div>

      {/* ── Menu Bottom Sheet + dim overlay ── */}
      {menuOpen && (
        <>
          <div
            className="absolute inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMenuOpen(false)}
          />
          <BottomMenuSheet onClose={() => setMenuOpen(false)} />
        </>
      )}
    </div>
  );
}
