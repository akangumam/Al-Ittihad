import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { Role } from "@/types";
import { tunggakanRows as initialTunggakan } from "@/data/pembayaran";
import { absensiGuruList } from "@/data/absensi";
import { siswaData, type SiswaRow } from "@/data/siswa";
import { alumniData, type AlumniRow } from "@/data/alumni";

interface AppContextValue {
  tahunAjaran: string;
  setTahunAjaran: (ta: string) => void;
  role: Role;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  tunggakanCount: number;
  absensiCount: number;
  siswaList: SiswaRow[];
  addSiswa: (siswa: SiswaRow) => void;
  updateSiswa: (id: number, data: Partial<SiswaRow>) => void;
  deleteSiswa: (id: number) => void;
  
  alumniList: AlumniRow[];
  addAlumni: (alumni: AlumniRow) => void;
  updateAlumni: (id: number, data: Partial<AlumniRow>) => void;
  deleteAlumni: (id: number) => void;

  absensiSiswaHariIni: Record<string, string>; // nis -> status (Hadir, Izin, Sakit, Alpa)
  setAbsensiSiswaHariIni: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tunggakanRows, setTunggakanRows] = useState(initialTunggakan);
  const [siswaList, setSiswaList] = useState<SiswaRow[]>(() => {
    const saved = localStorage.getItem("alittihad_siswa");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return siswaData;
      }
    }
    return siswaData;
  });

  const [alumniList, setAlumniList] = useState<AlumniRow[]>(() => {
    const saved = localStorage.getItem("alittihad_alumni");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return alumniData;
      }
    }
    return alumniData;
  });

  const [absensiSiswaHariIni, setAbsensiSiswaHariIni] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("alittihad_absensi_siswa");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Cek apakah tanggal hari ini sama dengan tanggal simpanan.
        // Jika beda hari, reset absensi
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today) {
          return parsed.data;
        }
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("alittihad_siswa", JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem("alittihad_alumni", JSON.stringify(alumniList));
  }, [alumniList]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("alittihad_absensi_siswa", JSON.stringify({ date: today, data: absensiSiswaHariIni }));
  }, [absensiSiswaHariIni]);

  const addSiswa = (siswa: SiswaRow) => setSiswaList(prev => [siswa, ...prev]);
  const updateSiswa = (id: number, data: Partial<SiswaRow>) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteSiswa = (id: number) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
  };

  const addAlumni = (alumni: AlumniRow) => setAlumniList(prev => [...prev, alumni]);
  const updateAlumni = (id: number, data: Partial<AlumniRow>) => {
    setAlumniList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const deleteAlumni = (id: number) => {
    setAlumniList(prev => prev.filter(a => a.id !== id));
  };

  // Derived counts for sidebar badges
  const tunggakanCount = useMemo(() => tunggakanRows.filter(r => r.badge === "Kritis" || r.badge === "Waspada").length, [tunggakanRows]);
  const absensiCount = useMemo(() => absensiGuruList.filter(g => g.defaultStatus === "Belum Absen").length, []);

  // TODO: ambil dari session/auth saat login diimplementasikan
  const role: Role = "Admin";

  return (
    <AppContext.Provider
      value={{ 
        tahunAjaran, setTahunAjaran, 
        role, 
        sidebarCollapsed, setSidebarCollapsed,
        tunggakanCount, absensiCount,
        siswaList, addSiswa, updateSiswa, deleteSiswa,
        alumniList, addAlumni, updateAlumni, deleteAlumni,
        absensiSiswaHariIni, setAbsensiSiswaHariIni
      }}
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
