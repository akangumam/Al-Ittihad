import type React from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MobileShell } from "./components/MobileShell";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAppContext } from "@/context/AppContext";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const { sidebarCollapsed } = useAppContext();

  if (isMobile) {
    return (
      <MobileShell>
        <Outlet />
      </MobileShell>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#FAFBF9",
        fontFamily: "'Space Grotesk', sans-serif",
        "--sidebar-w": sidebarCollapsed ? "64px" : "260px",
      } as React.CSSProperties}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
