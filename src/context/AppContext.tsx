import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "@/types";

interface AppContextValue {
  tahunAjaran: string;
  setTahunAjaran: (ta: string) => void;
  role: Role;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // TODO: ambil dari session/auth saat login diimplementasikan
  const role: Role = "Admin";

  return (
    <AppContext.Provider
      value={{ tahunAjaran, setTahunAjaran, role, sidebarCollapsed, setSidebarCollapsed }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
