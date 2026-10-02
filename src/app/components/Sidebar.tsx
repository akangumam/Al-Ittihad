import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, Users, GraduationCap, BookOpen,
  ClipboardList, CreditCard, AlertTriangle, FileText, Landmark,
  BarChart3, Calculator, Shield, Activity, Settings,
  ChevronLeft, ChevronRight, IdCard, Archive, UserCheck, Award, Scan,
  ChevronDown, Folder
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
  /** Sub-items untuk membuat dropdown menu / accordion */
  subItems?: NavItem[];
}

interface NavGroup {
  group: string | null;
  items: NavItem[];
}

const getNavGroups = (absensiCount: number, tunggakanCount: number): NavGroup[] => [
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
      { icon: Scan,          label: "Gerbang Absensi",path: "/akademik/gerbang",       roles: ["Admin", "TU"] },
      { icon: Users,         label: "Siswa",         path: "/akademik/siswa",         roles: ["Admin", "Bendahara"] },
      { icon: UserCheck,     label: "Absensi Siswa", path: "/akademik/absensi-siswa", roles: ["Admin", "TU"] },
      { icon: Award,         label: "Nilai Siswa",   path: "/akademik/nilai-siswa",   roles: ["Admin", "TU"] },
      { icon: Archive,       label: "Data Alumni",   path: "/akademik/alumni",        roles: ["Admin"] },
      { icon: GraduationCap, label: "Guru",          path: "/akademik/guru",          roles: ["Admin", "TU"] },
      { icon: ClipboardList, label: "Absensi Guru",  path: "/akademik/absensi",       roles: ["Admin", "TU"], badge: absensiCount },
      { icon: BookOpen,      label: "Kelas & Jadwal", path: "/akademik/kelas-jadwal",  roles: ["Admin", "TU"] },
      { icon: IdCard,        label: "Kartu Digital", path: "/akademik/kartu-digital", roles: ["Admin", "TU"] },
    ],
  },
  {
    group: "KEUANGAN",
    items: [
      {
        icon: Folder,
        label: "Keuangan Siswa",
        roles: ["Admin", "Bendahara"],
        subItems: [
          { icon: CreditCard,    label: "Kasir (Terima Bayar)", path: "/keuangan/pembayaran" },
          { icon: AlertTriangle, label: "Pantau Tunggakan",     path: "/keuangan/tunggakan", badge: tunggakanCount },
          { icon: FileText,      label: "Penetapan Tagihan",    path: "/keuangan/tagihan" },
        ]
      },
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
  const { sidebarCollapsed: collapsed, setSidebarCollapsed, role, absensiCount, tunggakanCount } = useAppContext();
  const navGroups = getNavGroups(absensiCount, tunggakanCount);

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
            <div key={gi} className="mb-2">
              {group.group && (
                <>
                  {!collapsed ? (
                    <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest px-3 pt-3 pb-2">
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
  const location = useLocation();
  const { setSidebarCollapsed } = useAppContext();
  
  const hasSubItems = !!item.subItems && item.subItems.length > 0;
  const isGroupActive = hasSubItems && item.subItems!.some(sub => sub.path && location.pathname.startsWith(sub.path));
  
  const [open, setOpen] = useState(isGroupActive);

  // Inherit badges from children if it's a group
  const totalBadge = item.badge ?? (hasSubItems ? item.subItems!.reduce((acc, sub) => acc + (sub.badge || 0), 0) : 0);

  useEffect(() => {
    if (!collapsed && isGroupActive) setOpen(true);
  }, [location.pathname, collapsed, isGroupActive]);

  if (hasSubItems) {
    return (
      <div className="flex flex-col mb-1 relative">
        <button
          onClick={() => {
            if (collapsed) {
              setSidebarCollapsed(false);
              setOpen(true);
            } else {
              setOpen(!open);
            }
          }}
          className={[
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
            collapsed ? "justify-center" : "",
            isGroupActive && !open
              ? "bg-[#EDF7EC] text-[#3E8A2F]" 
              : "text-[#374040] hover:bg-[#FAFBF9]",
          ].join(" ")}
        >
          <Icon size={15} className={`shrink-0 ${isGroupActive && !open ? "text-[#3E8A2F]" : "text-[#6B7769]"}`} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {totalBadge > 0 && !open && (
                <span className="ml-auto mr-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {totalBadge}
                </span>
              )}
              {open ? <ChevronDown size={14} className="text-[#9CA3A0]" /> : <ChevronRight size={14} className="text-[#9CA3A0]" />}
            </>
          )}
          {collapsed && totalBadge > 0 && (
            <span className="absolute right-1 top-1 text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
              {totalBadge}
            </span>
          )}
        </button>
        
        {/* Render subitems */}
        {!collapsed && open && (
          <div className="flex flex-col mt-1 ml-4 pl-3 space-y-1 mb-2" style={{ borderLeft: "1px solid #E2E8DE" }}>
            {item.subItems!.map((sub, idx) => {
              const SubIcon = sub.icon;
              return (
                <NavLink
                  key={idx}
                  to={sub.path!}
                  end={sub.end}
                  className={({ isActive }) =>
                    [
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                      isActive
                        ? "bg-[#3E8A2F] text-white"
                        : "text-[#6B7769] hover:bg-[#EDF7EC] hover:text-[#3E8A2F]",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <SubIcon size={14} className={`shrink-0 ${isActive ? "text-white" : "text-[#9CA3A0]"}`} />
                      <span className="flex-1 text-left truncate text-[13px]">{sub.label}</span>
                      {sub.badge !== undefined && sub.badge > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                          {sub.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Normal items
  if (!item.path) {
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
    <div className="relative mb-px">
      <NavLink
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          [
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
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
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </>
        )}
      </NavLink>
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute right-1 top-1 text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none pointer-events-none">
          {item.badge}
        </span>
      )}
    </div>
  );
}

