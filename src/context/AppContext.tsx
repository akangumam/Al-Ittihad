import { createContext, useContext, useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import type { Role, AbsensiGerbangRecord, AbsensiSettings, AppSettings, ActivityLogEntry } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fmt } from "@/lib/formatters";
import {
  initialTagihanSiswa,
  initialTransaksiPembayaran,
  type TagihanSiswa,
  type TransaksiPembayaran
} from "@/data/pembayaran";
import { absensiGuruList } from "@/data/absensi";
import { siswaData, type SiswaRow } from "@/data/siswa";
import { alumniData, type AlumniRow } from "@/data/alumni";
import { guruData, type GuruRow } from "@/data/guru";
import { type JadwalRow, type KelasRow, kelasData, type JadwalOverride, jadwalData, type WaktuProfile, defaultWaktuProfile } from "@/data/kelas";
import { dataNilaiSiswa, type NilaiSiswa } from "@/data/nilai";

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

  waktuProfiles: WaktuProfile[];
  setWaktuProfiles: (profiles: WaktuProfile[]) => void;

  absensiSiswaHariIni: Record<string, string>; // nis -> status (Hadir, Izin, Sakit, Alpa)
  setAbsensiSiswaHariIni: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  absensiGuruHariIni: Record<number, { status: string; jam: string }>;
  setAbsensiGuruHariIni: React.Dispatch<React.SetStateAction<Record<number, { status: string; jam: string }>>>;

  tagihanList: TagihanSiswa[];
  transaksiList: TransaksiPembayaran[];
  addTagihan: (tagihan: TagihanSiswa[]) => void;
  updateTagihanSiswa: (id: string, newNominal: number, keterangan?: string) => void;
  deleteTagihanSiswa: (id: string) => void;
  addTagihanSiswaManual: (nis: string, namaTagihan: string, nominal: number, jatuhTempo: string, kategori?: string) => void;
  addTransaksi: (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => void;

  nilaiList: NilaiSiswa[];
  bulkUpdateNilai: (updates: Record<string, Partial<NilaiSiswa>>) => void;

  absensiGuruHistory: Record<string, Record<number, { status: string; jam: string }>>;

  absensiGerbangLog: AbsensiGerbangRecord[];
  setAbsensiGerbangLog: React.Dispatch<React.SetStateAction<AbsensiGerbangRecord[]>>;
  absensiSettings: AbsensiSettings;
  setAbsensiSettings: React.Dispatch<React.SetStateAction<AbsensiSettings>>;

  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isElectron: boolean;

  activityLogs: ActivityLogEntry[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [siswaList, setSiswaList] = useState<SiswaRow[]>(siswaData);
  const [alumniList, setAlumniList] = useState<AlumniRow[]>(alumniData);
  const [guruList, setGuruList] = useState<GuruRow[]>(guruData);
  const [kelasList, setKelasList] = useState<KelasRow[]>(kelasData);
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>(jadwalData);
  const [jadwalOverridesList, setJadwalOverridesList] = useState<JadwalOverride[]>([]);
  const [waktuProfiles, setWaktuProfiles] = useState<WaktuProfile[]>([defaultWaktuProfile]);
  const [absensiSiswaHariIni, setAbsensiSiswaHariIni] = useState<Record<string, string>>({});
  const [absensiGuruHariIni, setAbsensiGuruHariIni] = useState<Record<number, { status: string; jam: string }>>({});
  const [absensiGuruHistory, setAbsensiGuruHistory] = useState<Record<string, Record<number, { status: string; jam: string }>>>({});
  const [tagihanList, setTagihanList] = useState<TagihanSiswa[]>(initialTagihanSiswa);
  const [transaksiList, setTransaksiList] = useState<TransaksiPembayaran[]>(initialTransaksiPembayaran);
  const [nilaiList, setNilaiList] = useState<NilaiSiswa[]>(dataNilaiSiswa);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  const defaultAbsensiSettings: AbsensiSettings = {
    batasHadir: "08:00",
    batasTerlambat: "08:15",
    jamBuka: "06:30",
    jamTutupOtomatis: "09:00",
    enableFingerprint: true,
    enableQR: true,
    enableManual: true,
  };
  const [absensiSettings, setAbsensiSettings] = useState<AbsensiSettings>(defaultAbsensiSettings);
  const [absensiGerbangLog, setAbsensiGerbangLog] = useState<AbsensiGerbangRecord[]>([]);

  const defaultAppSettings: AppSettings = {
    tahunAjaran: "2025/2026",
    jamMasukGuru: "07:00",
    kapasitasKelas: 32,
    formatKuitansi: "KWT-YYYYMMDD-XXX",
    namaMadrasah: "MTs Al-Ittihad Pedaleman",
    alamatMadrasah: "Jl. Pendidikan No. 1",
  };
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

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
          if (s1) {
            const parsed = JSON.parse(s1);
            if (parsed.length > 20) {
              savedSiswa = parsed;
            }
          }
          const s2 = localStorage.getItem("alittihad_alumni");
          const s3 = localStorage.getItem("alittihad_absensi_siswa");
          const s4 = localStorage.getItem("alittihad_tagihan");
          const s5 = localStorage.getItem("alittihad_transaksi");
          const s6 = localStorage.getItem("alittihad_jadwal");
          const s8 = localStorage.getItem("alittihad_guru");
          const s9 = localStorage.getItem("alittihad_kelas");
          const s10 = localStorage.getItem("alittihad_jadwal_overrides");
          const s11 = localStorage.getItem("alittihad_nilai");
          // s1 handled above
          if (s2) savedAlumni = JSON.parse(s2);
          if (s3) savedAbsensi = JSON.parse(s3);
          if (s4) {
            const parsed = JSON.parse(s4);
            // Only use stored data if it has entries; otherwise fall back to seed data
            // Also check seed version: if seed was updated, clear stale localStorage
            const storedVersion = localStorage.getItem("alittihad_tagihan_seed_v");
            const CURRENT_SEED_V = "2"; // increment this when initialTagihanSiswa changes
            if (storedVersion !== CURRENT_SEED_V) {
              // Seed version changed — discard old localStorage tagihan so seed takes effect
              localStorage.removeItem("alittihad_tagihan");
              localStorage.setItem("alittihad_tagihan_seed_v", CURRENT_SEED_V);
            } else if (parsed.length > 0) {
              setTagihanList(parsed);
            }
          } else {
            // No stored tagihan at all, set seed version
            localStorage.setItem("alittihad_tagihan_seed_v", "2");
          }
          if (s5) setTransaksiList(JSON.parse(s5));
          // Jadwal format version guard — clears stale data if format changed
          const jadwalV = localStorage.getItem("alittihad_jadwal_v");
          if (jadwalV !== "2") {
            // Format changed from time-strings to slot numbers — discard stale data
            localStorage.removeItem("alittihad_jadwal");
            localStorage.removeItem("alittihad_jadwal_overrides");
            localStorage.setItem("alittihad_jadwal_v", "2");
          } else if (s6) {
            const parsed = JSON.parse(s6);
            if (parsed.length >= 1) setJadwalList(parsed);
          }
          if (s8) {
            const parsed = JSON.parse(s8);
            if (parsed.length >= 13) savedGuru = parsed;
          }
          if (s9) {
            const parsed = JSON.parse(s9);
            if (parsed.length >= 12) setKelasList(parsed);
          }
          if (s10) setJadwalOverridesList(JSON.parse(s10));
          if (s11) setNilaiList(JSON.parse(s11));

          const s15 = localStorage.getItem("alittihad_waktu_profiles");
          if (s15) {
            const parsed = JSON.parse(s15);
            if (Array.isArray(parsed) && parsed.length >= 1) setWaktuProfiles(parsed);
          }
          
          const s12 = localStorage.getItem("alittihad_absensi_settings");
          if (s12) setAbsensiSettings(JSON.parse(s12));
          
          const s13 = localStorage.getItem("alittihad_absensi_gerbang");
          if (s13) setAbsensiGerbangLog(JSON.parse(s13));

          const s14 = localStorage.getItem("alittihad_app_settings");
          if (s14) setAppSettings(JSON.parse(s14));

          const s16 = localStorage.getItem("alittihad_activity_log");
          if (s16) setActivityLogs(JSON.parse(s16));
        }

        if (savedSiswa) setSiswaList(savedSiswa);
        if (savedAlumni) setAlumniList(savedAlumni);
        if (savedGuru) setGuruList(savedGuru);
        if (savedAbsensi) {
          const today = new Date().toISOString().split("T")[0];
          if (savedAbsensi.date === today) {
            setAbsensiSiswaHariIni(savedAbsensi.data || {});
            setAbsensiGuruHariIni(savedAbsensi.dataGuru || {});
          }
        }

        // Load Guru History
        let savedGuruHistory: Record<string, Record<number, { status: string; jam: string }>> | null = null;
        if (isElectron) {
          savedGuruHistory = await (window as any).electronAPI.getStoreValue("alittihad_absensi_guru_history");
        } else {
          const raw = localStorage.getItem("alittihad_absensi_guru_history");
          if (raw) savedGuruHistory = JSON.parse(raw);
        }

        if (savedGuruHistory && Object.keys(savedGuruHistory).length > 0) {
          setAbsensiGuruHistory(savedGuruHistory);
        } else {
          // Generate mock data for Juli and Agustus 2026 if empty
          const mockHistory: Record<string, Record<number, { status: string; jam: string }>> = {};
          
          const generateMockMonth = (year: number, month: number, daysInMonth: number) => {
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d);
              // Skip weekends (0 = Sunday, 6 = Saturday)
              if (date.getDay() === 0 || date.getDay() === 6) continue;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              mockHistory[dateStr] = {};
              
              // Fill with pseudo-random attendance based on guruData
              guruData.forEach(guru => {
                const rand = Math.random();
                let status = "Hadir";
                let jam = "06:45";
                
                if (rand > 0.95) {
                  status = "Alpa"; jam = "";
                } else if (rand > 0.9) {
                  status = "Izin"; jam = "";
                } else if (rand > 0.85) {
                  status = "Sakit"; jam = "";
                } else if (rand > 0.7) {
                  status = "Terlambat"; 
                  const m = Math.floor(Math.random() * 30);
                  jam = `07:${String(m).padStart(2, '0')}`;
                } else {
                  const m = 30 + Math.floor(Math.random() * 29); // 06:30 - 06:59
                  jam = `06:${String(m).padStart(2, '0')}`;
                }
                
                mockHistory[dateStr][guru.id] = { status, jam };
              });
            }
          };

          generateMockMonth(2026, 6, 31); // Juli
          generateMockMonth(2026, 7, 31); // Agustus
          setAbsensiGuruHistory(mockHistory);
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
    if (!isElectron) {
      localStorage.setItem("alittihad_waktu_profiles", JSON.stringify(waktuProfiles));
    }
  }, [waktuProfiles, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_kelas", kelasList);
    } else {
      localStorage.setItem("alittihad_kelas", JSON.stringify(kelasList));
    }
  }, [kelasList, isElectron]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const payload = { date: today, data: absensiSiswaHariIni, dataGuru: absensiGuruHariIni };
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_siswa", payload);
    } else {
      localStorage.setItem("alittihad_absensi_siswa", JSON.stringify(payload));
    }

    // Sync current day guru attendance to history
    if (Object.keys(absensiGuruHariIni).length > 0) {
      setAbsensiGuruHistory(prev => {
        const currentDay = prev[today] || {};
        const mergedDay = { ...currentDay, ...absensiGuruHariIni };
        
        if (JSON.stringify(currentDay) === JSON.stringify(mergedDay)) return prev;
        return { ...prev, [today]: mergedDay };
      });
    }
  }, [absensiSiswaHariIni, absensiGuruHariIni, isElectron]);

  useEffect(() => {
    if (Object.keys(absensiGuruHistory).length === 0) return;
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_guru_history", absensiGuruHistory);
    } else {
      localStorage.setItem("alittihad_absensi_guru_history", JSON.stringify(absensiGuruHistory));
    }
  }, [absensiGuruHistory, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_settings", absensiSettings);
    } else {
      localStorage.setItem("alittihad_absensi_settings", JSON.stringify(absensiSettings));
    }
  }, [absensiSettings, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_gerbang", absensiGerbangLog);
    } else {
      localStorage.setItem("alittihad_absensi_gerbang", JSON.stringify(absensiGerbangLog));
    }
  }, [absensiGerbangLog, isElectron]);

  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_app_settings", appSettings);
    } else {
      localStorage.setItem("alittihad_app_settings", JSON.stringify(appSettings));
    }
  }, [appSettings, isElectron]);

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

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem("alittihad_nilai", JSON.stringify(nilaiList));
    } else {
      (window as any).electronAPI.setStoreValue("alittihad_nilai", nilaiList);
    }
  }, [nilaiList, isElectron]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem("alittihad_activity_log", JSON.stringify(activityLogs));
    } else {
      (window as any).electronAPI.setStoreValue("alittihad_activity_log", activityLogs);
    }
  }, [activityLogs, isElectron]);

  // ─── Activity log helper ───────────────────────────────────────────────────
  const logActivity = (entry: Omit<ActivityLogEntry, "id" | "waktu" | "pelaku">) => {
    setActivityLogs(prev => [{
      id: crypto.randomUUID(),
      waktu: new Date().toISOString(),
      pelaku: authUser?.nama ?? "Sistem",
      ...entry,
    }, ...prev]);
  };

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

  const addTagihan = (tagihan: TagihanSiswa[]) => {
    setTagihanList(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newOnes = tagihan.filter(t => !existingIds.has(t.id));
      return [...newOnes, ...prev];
    });
    if (tagihan.length > 0) {
      const uniqueNis = new Set(tagihan.map(t => t.nis));
      const kategori = tagihan[0].kategori;
      const total = tagihan.reduce((s, t) => s + t.nominal, 0);
      logActivity({
        tipe: "Penetapan Tagihan",
        deskripsi: `${kategori} ditetapkan untuk ${uniqueNis.size} siswa (${fmt(total)})`,
        ref: "—",
      });
    }
  };

  const updateTagihanSiswa = (id: string, newNominal: number, keterangan?: string) => {
    const tagihan = tagihanList.find(t => t.id === id);
    setTagihanList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, nominal: newNominal, keterangan, isLunas: t.terbayar >= newNominal && newNominal > 0 };
      }
      return t;
    }));
    if (tagihan) {
      const siswa = siswaList.find(s => s.nis === tagihan.nis);
      logActivity({
        tipe: "Update Tagihan",
        deskripsi: `${siswa?.nama ?? tagihan.nis} — "${tagihan.namaTagihan}" diubah ke ${fmt(newNominal)}${keterangan ? ` · ${keterangan}` : ""}`,
        ref: "—",
      });
    }
  };

  const deleteTagihanSiswa = (id: string) => {
    const tagihan = tagihanList.find(t => t.id === id);
    setTagihanList(prev => prev.filter(t => t.id !== id));
    if (tagihan) {
      const siswa = siswaList.find(s => s.nis === tagihan.nis);
      logActivity({
        tipe: "Hapus Tagihan",
        deskripsi: `${siswa?.nama ?? tagihan.nis} — "${tagihan.namaTagihan}" dihapus`,
        ref: "—",
      });
    }
  };

  const addTagihanSiswaManual = (nis: string, namaTagihan: string, nominal: number, jatuhTempo: string, kategori = "Penyesuaian Khusus") => {
    const id = `TGH-${nis}-${Date.now().toString().slice(-6)}`;
    const newTagihan: TagihanSiswa = {
      id,
      nis,
      namaTagihan,
      kategori,
      nominal,
      terbayar: 0,
      jatuhTempo,
      isLunas: false,
      prioritas: 99
    };
    setTagihanList(prev => [newTagihan, ...prev]);
  };

  const addTransaksi = (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => {
    setTransaksiList(prev => [transaksi, ...prev]);
    const updatedMap = new Map(updatedTagihan.map(t => [t.id, t]));
    setTagihanList(prev => prev.map(t => updatedMap.has(t.id) ? updatedMap.get(t.id)! : t));
    const siswa = siswaList.find(s => s.nis === transaksi.nis);
    logActivity({
      tipe: "Pembayaran",
      deskripsi: `${siswa?.nama ?? transaksi.nis} — ${fmt(transaksi.nominal)} via ${transaksi.metode}`,
      ref: transaksi.nomorKuitansi,
    });
  };

  const bulkUpdateNilai = (updates: Record<string, Partial<NilaiSiswa>>) => {
    setNilaiList(prev => {
      let next = [...prev];
      Object.keys(updates).forEach(id => {
        const idx = next.findIndex(n => n.id === id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], ...updates[id] } as NilaiSiswa;
        } else {
          next.push(updates[id] as NilaiSiswa);
        }
      });
      return next;
    });
  };

  // Derived counts for sidebar badges
  const tunggakanCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return siswaList.filter(s => s.status === "Aktif").filter(s => {
      const unpaid = tagihanList.filter(t => t.nis === s.nis && t.nominal > t.terbayar);
      if (unpaid.length === 0) return false;
      const oldest = unpaid.reduce((a, b) =>
        new Date(a.jatuhTempo) < new Date(b.jatuhTempo) ? a : b
      );
      const diffDays = Math.floor(
        (today.getTime() - new Date(oldest.jatuhTempo).getTime()) / 86_400_000
      );
      return diffDays > 30; // Waspada (31–60) atau Kritis (60+)
    }).length;
  }, [siswaList, tagihanList]);
  const absensiCount = useMemo(() => {
    const safeData = absensiGuruHariIni || {};
    return guruList.filter(g => !safeData[g.id]).length;
  }, [guruList, absensiGuruHariIni]);

  const { user: authUser } = useAuth();
  const role: Role = authUser?.role ?? "Admin";

  // ─── Catat login / logout ─────────────────────────────────────────────────
  const prevAuthRef = useRef<typeof authUser | undefined>(undefined);
  useEffect(() => {
    if (prevAuthRef.current === undefined) {
      prevAuthRef.current = authUser;
      return;
    }
    const prev = prevAuthRef.current;
    prevAuthRef.current = authUser;

    if (!prev?.role && authUser?.role) {
      setActivityLogs(logs => [{
        id: crypto.randomUUID(),
        waktu: new Date().toISOString(),
        tipe: "Login",
        deskripsi: `${authUser.nama} masuk ke sistem`,
        ref: "—",
        pelaku: authUser.nama,
      }, ...logs]);
    } else if (prev?.role && !authUser) {
      setActivityLogs(logs => [{
        id: crypto.randomUUID(),
        waktu: new Date().toISOString(),
        tipe: "Logout",
        deskripsi: `${prev.nama} keluar dari sistem`,
        ref: "—",
        pelaku: prev.nama,
      }, ...logs]);
    }
  }, [authUser]);

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
        waktuProfiles, setWaktuProfiles,
        absensiSiswaHariIni, setAbsensiSiswaHariIni,
        absensiGuruHariIni, setAbsensiGuruHariIni,
        absensiGuruHistory,
        tagihanList, transaksiList, addTagihan, updateTagihanSiswa, deleteTagihanSiswa, addTagihanSiswaManual, addTransaksi,
        nilaiList, bulkUpdateNilai,
        isElectron,
        absensiGerbangLog,
        setAbsensiGerbangLog,
        absensiSettings,
        setAbsensiSettings,
        appSettings,
        setAppSettings,
        activityLogs,
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
