import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { Role } from "@/types";
import { 
  tunggakanRows as initialTunggakan, 
  initialTagihanSiswa, 
  initialTransaksiPembayaran,
  type TagihanSiswa,
  type TransaksiPembayaran
} from "@/data/pembayaran";
import { absensiGuruList } from "@/data/absensi";
import { siswaData, type SiswaRow } from "@/data/siswa";
import { alumniData, type AlumniRow } from "@/data/alumni";
import { guruData, type GuruRow } from "@/data/guru";
import { type JadwalRow, type WaktuJam, DEFAULT_WAKTU_JAM, type KelasRow, kelasData, type JadwalOverride } from "@/data/kelas";

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
  bulkUpdateSiswa: (ids: number[], data: Partial<SiswaRow>) => void;
  bulkDeleteSiswa: (ids: number[]) => void;
  graduateSiswa: (ids: number[], tahunLulus: string) => void;
  alumniList: AlumniRow[];
  addAlumni: (alumni: AlumniRow) => void;
  updateAlumni: (id: number, data: Partial<AlumniRow>) => void;
  deleteAlumni: (id: number) => void;
  guruList: GuruRow[];
  addGuru: (guru: GuruRow) => void;
  updateGuru: (id: number, data: Partial<GuruRow>) => void;
  deleteGuru: (id: number) => void;

  kelasList: KelasRow[];
  addKelas: (kelas: KelasRow) => void;
  updateKelas: (id: string, data: Partial<KelasRow>) => void;
  deleteKelas: (id: string) => void;

  jadwalList: JadwalRow[];
  addJadwal: (jadwal: JadwalRow) => void;
  updateJadwal: (id: number, data: Partial<JadwalRow>) => void;
  deleteJadwal: (id: number) => void;

  jadwalOverridesList: JadwalOverride[];
  setJadwalOverride: (override: JadwalOverride) => void;
  clearJadwalOverride: (id: string) => void;

  waktuJamList: WaktuJam[];
  updateWaktuJam: (newList: WaktuJam[]) => void;

  absensiSiswaHariIni: Record<string, string>; // nis -> status (Hadir, Izin, Sakit, Alpa)
  setAbsensiSiswaHariIni: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  tagihanList: TagihanSiswa[];
  transaksiList: TransaksiPembayaran[];
  addTagihan: (tagihan: TagihanSiswa[]) => void;
  addTransaksi: (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tunggakanRows, setTunggakanRows] = useState(initialTunggakan);
  const [siswaList, setSiswaList] = useState<SiswaRow[]>(siswaData);
  const [alumniList, setAlumniList] = useState<AlumniRow[]>(alumniData);
  const [guruList, setGuruList] = useState<GuruRow[]>(guruData);
  const [kelasList, setKelasList] = useState<KelasRow[]>(kelasData);
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>([]);
  const [jadwalOverridesList, setJadwalOverridesList] = useState<JadwalOverride[]>([]);
  const [waktuJamList, setWaktuJamList] = useState<WaktuJam[]>(DEFAULT_WAKTU_JAM);
  const [absensiSiswaHariIni, setAbsensiSiswaHariIni] = useState<Record<string, string>>({});
  const [tagihanList, setTagihanList] = useState<TagihanSiswa[]>(initialTagihanSiswa);
  const [transaksiList, setTransaksiList] = useState<TransaksiPembayaran[]>(initialTransaksiPembayaran);

  const isElectron = !!(window as any).electronAPI;

  useEffect(() => {
    const loadData = async () => {
      try {
        let savedSiswa, savedAlumni, savedAbsensi, savedGuru;
        if (isElectron) {
          savedSiswa = await (window as any).electronAPI.getStoreValue("alittihad_siswa");
          savedAlumni = await (window as any).electronAPI.getStoreValue("alittihad_alumni");
          savedAbsensi = await (window as any).electronAPI.getStoreValue("alittihad_absensi_siswa");
          savedGuru = await (window as any).electronAPI.getStoreValue("alittihad_guru");
        } else {
          const s1 = localStorage.getItem("alittihad_siswa");
          const s2 = localStorage.getItem("alittihad_alumni");
          const s3 = localStorage.getItem("alittihad_absensi_siswa");
          const s4 = localStorage.getItem("alittihad_tagihan");
          const s5 = localStorage.getItem("alittihad_transaksi");
          const s6 = localStorage.getItem("alittihad_jadwal");
          const s7 = localStorage.getItem("alittihad_waktujam");
          const s8 = localStorage.getItem("alittihad_guru");
          const s9 = localStorage.getItem("alittihad_kelas");
          const s10 = localStorage.getItem("alittihad_jadwal_overrides");
          
          if (s1) savedSiswa = JSON.parse(s1);
          if (s2) savedAlumni = JSON.parse(s2);
          if (s3) savedAbsensi = JSON.parse(s3);
          if (s4) setTagihanList(JSON.parse(s4));
          if (s5) setTransaksiList(JSON.parse(s5));
          if (s6) setJadwalList(JSON.parse(s6));
          if (s7) setWaktuJamList(JSON.parse(s7));
          if (s8) savedGuru = JSON.parse(s8);
          if (s9) setKelasList(JSON.parse(s9));
          if (s10) setJadwalOverridesList(JSON.parse(s10));
        }

        if (savedSiswa) setSiswaList(savedSiswa);
        if (savedAlumni) setAlumniList(savedAlumni);
        if (savedGuru) setGuruList(savedGuru);
        if (savedAbsensi) {
          const today = new Date().toISOString().split("T")[0];
          if (savedAbsensi.date === today) {
            setAbsensiSiswaHariIni(savedAbsensi.data);
          }
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_siswa", siswaList);
    } else {
      localStorage.setItem("alittihad_siswa", JSON.stringify(siswaList));
    }
  }, [siswaList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_alumni", alumniList);
    } else {
      localStorage.setItem("alittihad_alumni", JSON.stringify(alumniList));
    }
  }, [alumniList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_guru", guruList);
    } else {
      localStorage.setItem("alittihad_guru", JSON.stringify(guruList));
    }
  }, [guruList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_jadwal", jadwalList);
    } else {
      localStorage.setItem("alittihad_jadwal", JSON.stringify(jadwalList));
    }
  }, [jadwalList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_jadwal_overrides", jadwalOverridesList);
    } else {
      localStorage.setItem("alittihad_jadwal_overrides", JSON.stringify(jadwalOverridesList));
    }
  }, [jadwalOverridesList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_kelas", kelasList);
    } else {
      localStorage.setItem("alittihad_kelas", JSON.stringify(kelasList));
    }
  }, [kelasList, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_waktujam", waktuJamList);
    } else {
      localStorage.setItem("alittihad_waktujam", JSON.stringify(waktuJamList));
    }
  }, [waktuJamList, isElectron]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const payload = { date: today, data: absensiSiswaHariIni };
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_siswa", payload);
    } else {
      localStorage.setItem("alittihad_absensi_siswa", JSON.stringify(payload));
    }
  }, [absensiSiswaHariIni, isElectron]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem("alittihad_tagihan", JSON.stringify(tagihanList));
    } else {
      (window as any).electronAPI.setStoreValue("alittihad_tagihan", tagihanList);
    }
  }, [tagihanList, isElectron]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem("alittihad_transaksi", JSON.stringify(transaksiList));
    } else {
      (window as any).electronAPI.setStoreValue("alittihad_transaksi", transaksiList);
    }
  }, [transaksiList, isElectron]);

  const addKelas = (kelas: KelasRow) => setKelasList(prev => [...prev, kelas]);
  const updateKelas = (id: string, data: Partial<KelasRow>) => {
    setKelasList(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
  };
  const deleteKelas = (id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
  };

  const addSiswa = (siswa: SiswaRow) => setSiswaList(prev => [siswa, ...prev]);
  const updateSiswa = (id: number, data: Partial<SiswaRow>) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteSiswa = (id: number) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
  };

  const bulkUpdateSiswa = (ids: number[], data: Partial<SiswaRow>) => {
    setSiswaList(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...data } : s));
  };

  const bulkDeleteSiswa = (ids: number[]) => {
    setSiswaList(prev => prev.filter(s => !ids.includes(s.id)));
  };

  const graduateSiswa = (ids: number[], tahunLulus: string) => {
    const toGraduate = siswaList.filter(s => ids.includes(s.id));
    if (toGraduate.length === 0) return;

    const newAlumni: AlumniRow[] = toGraduate.map(s => ({
      ...s,
      tahunLulus,
      angkatan: new Date().getFullYear() - 1990, // example logic
      keterangan: "Lulus Reguler"
    }));

    setAlumniList(prev => [...newAlumni, ...prev]);
    setSiswaList(prev => prev.filter(s => !ids.includes(s.id)));
  };

  const addAlumni = (alumni: AlumniRow) => setAlumniList(prev => [alumni, ...prev]);
  const updateAlumni = (id: number, data: Partial<AlumniRow>) => {
    setAlumniList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const deleteAlumni = (id: number) => {
    setAlumniList(prev => prev.filter(a => a.id !== id));
  };

  const addGuru = (guru: GuruRow) => setGuruList(prev => [guru, ...prev]);
  const updateGuru = (id: number, data: Partial<GuruRow>) => setGuruList(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  const deleteGuru = (id: number) => setGuruList(prev => prev.filter(a => a.id !== id));

  const addJadwal = (jadwal: JadwalRow) => setJadwalList(prev => [...prev, jadwal]);
  const updateJadwal = (id: number, data: Partial<JadwalRow>) => setJadwalList(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  const deleteJadwal = (id: number) => setJadwalList(prev => prev.filter(a => a.id !== id));

  const setJadwalOverride = (override: JadwalOverride) => {
    setJadwalOverridesList(prev => {
      const idx = prev.findIndex(o => o.id === override.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = override;
        return next;
      }
      return [...prev, override];
    });
  };

  const clearJadwalOverride = (id: string) => {
    setJadwalOverridesList(prev => prev.filter(o => o.id !== id));
  };

  const updateWaktuJam = (newList: WaktuJam[]) => setWaktuJamList(newList);

  const addTagihan = (newTagihan: TagihanSiswa[]) => {
    setTagihanList(prev => [...newTagihan, ...prev]);
  };

  const addTransaksi = (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => {
    setTransaksiList(prev => [transaksi, ...prev]);
    // update state tagihan dengan yang baru (yang sudah lunas / bertambah terbayar)
    setTagihanList(prev => prev.map(t => {
      const up = updatedTagihan.find(ut => ut.id === t.id);
      return up ? up : t;
    }));
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
        siswaList, addSiswa, updateSiswa, deleteSiswa, bulkUpdateSiswa, bulkDeleteSiswa, graduateSiswa,
        alumniList, addAlumni, updateAlumni, deleteAlumni,
        guruList, addGuru, updateGuru, deleteGuru,
        kelasList, addKelas, updateKelas, deleteKelas,
        jadwalList, addJadwal, updateJadwal, deleteJadwal,
        jadwalOverridesList, setJadwalOverride, clearJadwalOverride,
        waktuJamList, updateWaktuJam,
        absensiSiswaHariIni, setAbsensiSiswaHariIni,
        tagihanList, transaksiList, addTagihan, addTransaksi
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
