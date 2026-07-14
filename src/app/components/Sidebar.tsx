import { NavLink } from "react-router";
import {
  LayoutDashboard, Calendar, Users, GraduationCap, BookOpen,
  ClipboardList, CreditCard, AlertTriangle, FileText, Landmark,
  BarChart3, Calculator, Shield, Activity, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import type { ElementType } from "react";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";
import type { Role } from "@/types";

// ─── nav data ─────────────────────────────────────────────────────────────────

interface NavItem {
  icon: ElementType;
  label: string;
  badge?: number;
  /** URL path. Undefined = belum diimplementasikan (item non-interactive). */
  path?: string;
  /** Gunakan exact match untuk highlight aktif (diperlukan untuk root "/"). */
  end?: boolean;
  /** Jika ada, item hanya tampil untuk role yang terdaftar. Kosong = semua role. */
  roles?: Role[];
}

interface NavGroup {
  group: string | null;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: null,
    items: [
      { icon: LayoutDashboard, label: "Dashboard",  path: "/",           end: true },
      { icon: Calendar,        label: "Kalender",   path: "/kalender" },
    ],
  },
  {
    group: "AKADEMIK",
    items: [
      { icon: Users,         label: "Siswa",         path: "/akademik/siswa",         roles: ["Admin", "Bendahara"] },
      { icon: GraduationCap, label: "Guru",           path: "/akademik/guru",          roles: ["Admin", "TU"] },
      { icon: BookOpen,      label: "Kelas & Jadwal", path: "/akademik/kelas-jadwal",  roles: ["Admin", "TU"] },
      { icon: ClipboardList, label: "Absensi",        path: "/akademik/absensi",       roles: ["Admin", "TU"], badge: 3 },
    ],
  },
  {
    group: "KEUANGAN",
    items: [
      { icon: CreditCard,    label: "Pembayaran", path: "/keuangan/pembayaran", roles: ["Admin", "Bendahara"] },
      { icon: AlertTriangle, label: "Tunggakan",  path: "/keuangan/tunggakan",  roles: ["Admin", "Bendahara"], badge: 12 },
      { icon: FileText,      label: "Tagihan",    path: "/keuangan/tagihan",    roles: ["Admin", "Bendahara"] },
      { icon: Landmark,      label: "Kas & Bank", path: "/keuangan/kas-bank",   roles: ["Admin", "Bendahara"] },
      { icon: BarChart3,     label: "Laporan",    path: "/keuangan/laporan",    roles: ["Admin", "Bendahara"] },
      { icon: Calculator,    label: "Anggaran",   path: "/keuangan/anggaran",   roles: ["Admin", "Bendahara"] },
    ],
  },
  {
    group: "SISTEM",
    items: [
      { icon: Shield,   label: "Pengguna & Akses",  path: "/sistem/pengguna",      roles: ["Admin"] },
      { icon: Activity, label: "Log Aktivitas",      path: "/sistem/log-aktivitas", roles: ["Admin"] },
      { icon: Settings, label: "Pengaturan",         path: "/sistem/pengaturan",    roles: ["Admin"] },
    ],
  },
];

// ─── components ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed, role } = useAppContext();

  return (
    <aside
      className="flex flex-col h-full bg-white shrink-0 transition-all duration-300"
      style={{ width: collapsed ? 64 : 260, borderRight: "1px solid #E2E8DE" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid #E2E8DE" }}
      >
        <img
          src={logoEmblem}
          alt="Al-Ittihad Pedaleman"
          style={{ width: 38, height: 38 }}
          className="object-contain shrink-0"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[9px] font-semibold text-[#6B7769] uppercase tracking-widest leading-none mb-0.5">
              Madrasah
            </p>
            <p className="text-[11px] font-semibold text-[#1C2517] leading-tight">
              Al-Ittihad Pedaleman
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group, gi) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={gi}>
              {group.group && (
                <>
                  {!collapsed ? (
                    <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest px-3 pt-3 pb-1">
                      {group.group}
                    </p>
                  ) : (
                    <div className="h-px mx-2 my-2.5" style={{ background: "#E2E8DE" }} />
                  )}
                </>
              )}
              {visibleItems.map((item, ii) => (
                <NavRow key={ii} item={item} collapsed={collapsed} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 p-3" style={{ borderTop: "1px solid #E2E8DE" }}>
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F] transition-colors"
          title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <>
              <ChevronLeft size={15} />
              <span className="text-xs font-medium">Tutup Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;

  if (!item.path) {
    // Non-interactive placeholder (belum diimplementasikan)
    return (
      <div
        className={[
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-px text-sm font-medium",
          "text-[#C4C9C2] cursor-not-allowed",
          collapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <Icon size={15} className="shrink-0 text-[#C4C9C2]" />
        {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        [
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-px transition-colors text-sm font-medium",
          collapsed ? "justify-center" : "",
          isActive
            ? "bg-[#3E8A2F] text-white"
            : "text-[#374040] hover:bg-[#EDF7EC] hover:text-[#3E8A2F]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={15}
            className={`shrink-0 ${isActive ? "text-white" : "text-[#6B7769]"}`}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {item.badge}
                </span>
              )}
            </>
          )}
          {collapsed && item.badge !== undefined && (
            <span className="text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
