import { createContext, useContext, useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import type { Role, AppSettings, ActivityLogEntry, MutasiRecord, ManualTransaksiRow, BankTransferRow } from "@/types";
import { RABRow, RAB_DATA, mutasiData } from "@/data/keuangan";
import { useAuth } from "@/context/AuthContext";
import { fmt } from "@/lib/formatters";
import { isGhostEmail } from "@/lib/ghost";
import {
  loadSiswaFromDB, loadAlumniFromDB,
  insertSiswaDB, updateSiswaDB, deleteSiswaDB, bulkDeleteSiswaDB, bulkUpdateSiswaDB, graduateSiswaDB,
  insertAlumniDB, updateAlumniDB, deleteAlumniDB,
} from "@/lib/supabase-siswa";
import { toast } from "sonner";
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

interface AppContextValue {
  tahunAjaran: string;
  setTahunAjaran: (ta: string) => void;
  role: Role;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  tunggakanCount: number;
  absensiCount: number;
  siswaList: SiswaRow[];
  siswaLoading: boolean;
  addSiswa: (siswa: Omit<SiswaRow, "id">) => void;
  updateSiswa: (id: number, data: Partial<SiswaRow>) => void;
  deleteSiswa: (id: number) => void;
  bulkUpdateSiswa: (ids: number[], data: Partial<SiswaRow>) => void;
  bulkDeleteSiswa: (ids: number[]) => void;
  graduateSiswa: (ids: number[], tahunLulus: string) => void;
  alumniList: AlumniRow[];
  addAlumni: (alumni: Omit<AlumniRow, "id">) => void;
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

  absensiSiswaHariIni: Record<string, { status: string; jam: string }>;
  setAbsensiSiswaHariIni: React.Dispatch<React.SetStateAction<Record<string, { status: string; jam: string }>>>;

  absensiGuruHariIni: Record<number, { status: string; jam: string }>;
  setAbsensiGuruHariIni: React.Dispatch<React.SetStateAction<Record<number, { status: string; jam: string }>>>;

  tagihanList: TagihanSiswa[];
  transaksiList: TransaksiPembayaran[];
  addTagihan: (tagihan: TagihanSiswa[]) => void;
  updateTagihanSiswa: (id: string, newNominal: number, keterangan?: string) => void;
  deleteTagihanSiswa: (id: string) => void;
  addTagihanSiswaManual: (nis: string, namaTagihan: string, nominal: number, jatuhTempo: string, kategori?: string) => void;
  addTransaksi: (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => void;

  absensiGuruHistory: Record<string, Record<number, { status: string; jam: string }>>;
  absensiSiswaHistory: Record<string, Record<string, { status: string; jam: string }>>;
  logActivity: (entry: Omit<ActivityLogEntry, "id" | "waktu" | "pelaku">) => void;

  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isElectron: boolean;

  activityLogs: ActivityLogEntry[];
  mutasiList: MutasiRecord[];
  addMutasi: (mutasi: MutasiRecord) => void;

  manualTransaksiList: ManualTransaksiRow[];
  addManualTransaksi: (t: ManualTransaksiRow) => void;
  nextBVRef: (tipe: "masuk" | "keluar") => string;

  rabList: RABRow[];
  addRab: (row: Omit<RABRow, "id">) => void;
  updateRab: (id: number, data: Partial<RABRow>) => void;
  deleteRab: (id: number) => void;

  bankTransferList: BankTransferRow[];
  addBankTransfer: (row: Omit<BankTransferRow, "id" | "dicatatOleh" | "waktuCatat">) => void;
  resetToCleanData: () => void;
}

const MANUAL_TRANSAKSI_SEED: ManualTransaksiRow[] = [];
const BANK_TRANSFER_SEED: BankTransferRow[] = [];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // tahunAjaran is derived from appSettings — see below
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [siswaList, setSiswaList] = useState<SiswaRow[]>([]);
  const [siswaLoading, setSiswaLoading] = useState(true);
  const [alumniList, setAlumniList] = useState<AlumniRow[]>([]);
  const [guruList, setGuruList] = useState<GuruRow[]>(guruData);
  const [kelasList, setKelasList] = useState<KelasRow[]>(kelasData);
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>(jadwalData);
  const [jadwalOverridesList, setJadwalOverridesList] = useState<JadwalOverride[]>([]);
  const [waktuProfiles, setWaktuProfiles] = useState<WaktuProfile[]>([defaultWaktuProfile]);
  const [absensiSiswaHariIni, setAbsensiSiswaHariIni] = useState<Record<string, { status: string; jam: string }>>({});
  const [absensiGuruHariIni, setAbsensiGuruHariIni] = useState<Record<number, { status: string; jam: string }>>({});
  const [absensiGuruHistory, setAbsensiGuruHistory] = useState<Record<string, Record<number, { status: string; jam: string }>>>({});
  const [absensiSiswaHistory, setAbsensiSiswaHistory] = useState<Record<string, Record<string, { status: string; jam: string }>>>({});
  const [tagihanList, setTagihanList] = useState<TagihanSiswa[]>(initialTagihanSiswa);
  const [transaksiList, setTransaksiList] = useState<TransaksiPembayaran[]>(initialTransaksiPembayaran);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  const [manualTransaksiList, setManualTransaksiList] = useState<ManualTransaksiRow[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_manual_transaksi");
      const existing: ManualTransaksiRow[] = s ? JSON.parse(s) : [];
      const existingIds = new Set(existing.map(t => t.id));
      const missing = MANUAL_TRANSAKSI_SEED.filter(t => !existingIds.has(t.id));
      return [...existing, ...missing];
    } catch { return MANUAL_TRANSAKSI_SEED; }
  });

  const [mutasiList, setMutasiList] = useState<MutasiRecord[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_mutasi");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [rabList, setRabList] = useState<RABRow[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_rab");
      return s ? JSON.parse(s) : RAB_DATA;
    } catch { return RAB_DATA; }
  });

  const [bankTransferList, setBankTransferList] = useState<BankTransferRow[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_bank_transfer");
      const existing: BankTransferRow[] = s ? JSON.parse(s) : [];
      const existingIds = new Set(existing.map(t => t.id));
      const missing = BANK_TRANSFER_SEED.filter(t => !existingIds.has(t.id));
      return [...existing, ...missing];
    } catch { return BANK_TRANSFER_SEED; }
  });

  const defaultAppSettings: AppSettings = {
    tahunAjaran: "2025/2026",
    jamMasukGuru: "07:00",
    jamMasukSiswa: "07:00",
    kapasitasKelas: 32,
    formatKuitansi: "KW/{TAHUN}/{BULAN}/{URUT}",
    namaMadrasah: "MTs Al-Ittihad Pedaleman",
    alamatMadrasah: "Jl. Syekh Nawawi Kp. Pesisir Pedaleman, Kec. Tanara, Kab. Serang, Prov. Banten 42194",
    kirimWA: true,
    wahaEnabled: false,
    wahaUrl: "",
    wahaApiKey: "",
    wahaSession: "alittihad",
  };
  // Lazy init: read from localStorage immediately so the save effect never overwrites with stale defaults.
  // Merge with defaultAppSettings so fields added later (kirimWA, alamatMadrasah, etc.) are always populated.
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const s = localStorage.getItem("alittihad_app_settings");
      if (s) return { ...defaultAppSettings, ...JSON.parse(s) };
    } catch {}
    return defaultAppSettings;
  });
  // tahunAjaran is the canonical source from appSettings, not a separate state.
  const tahunAjaran = appSettings.tahunAjaran;
  const setTahunAjaran = (ta: string) => setAppSettings(s => ({ ...s, tahunAjaran: ta }));

  const isElectron = !!(window as any).electronAPI;

  useEffect(() => {
    const loadData = async () => {
      try {
        let savedAbsensi, savedGuru;
        if (isElectron) {
          savedAbsensi = await (window as any).electronAPI.getStoreValue("alittihad_absensi_siswa");
          savedGuru = await (window as any).electronAPI.getStoreValue("alittihad_guru");
        } else {
          // Versioning: auto-clean old test/mock data from previous browser sessions
          const CLEAN_VERSION = "2026_clean_v2";
          const currentCleanV = localStorage.getItem("alittihad_db_v");
          if (currentCleanV !== CLEAN_VERSION) {
            localStorage.removeItem("alittihad_guru");
            localStorage.removeItem("alittihad_jadwal");
            localStorage.removeItem("alittihad_jadwal_overrides");
            localStorage.removeItem("alittihad_absensi_siswa");
            localStorage.removeItem("alittihad_absensi_siswa_history");
            localStorage.removeItem("alittihad_absensi_guru");
            localStorage.removeItem("alittihad_absensi_guru_history");
            localStorage.removeItem("alittihad_tagihan");
            localStorage.removeItem("alittihad_transaksi");
            localStorage.removeItem("alittihad_mutasi");
            localStorage.removeItem("alittihad_manual_transaksi");
            localStorage.removeItem("alittihad_bank_transfer");
            localStorage.removeItem("alittihad_activity_log");
            localStorage.setItem("alittihad_db_v", CLEAN_VERSION);
          }

          const s3 = localStorage.getItem("alittihad_absensi_siswa");
          const s4 = localStorage.getItem("alittihad_tagihan");
          const s5 = localStorage.getItem("alittihad_transaksi");
          const s6 = localStorage.getItem("alittihad_jadwal");
          const s8 = localStorage.getItem("alittihad_guru");
          const s9 = localStorage.getItem("alittihad_kelas");
          const s10 = localStorage.getItem("alittihad_jadwal_overrides");
          if (s3) savedAbsensi = JSON.parse(s3);
          if (s4) {
            try {
              const parsed = JSON.parse(s4);
              if (Array.isArray(parsed)) setTagihanList(parsed);
            } catch {}
          }
          if (s5) {
            try {
              const parsed = JSON.parse(s5);
              if (Array.isArray(parsed)) setTransaksiList(parsed);
            } catch {}
          }
          // Jadwal format version guard — clears stale data if format changed
          const jadwalV = localStorage.getItem("alittihad_jadwal_v");
          if (jadwalV !== "2") {
            localStorage.removeItem("alittihad_jadwal");
            localStorage.removeItem("alittihad_jadwal_overrides");
            localStorage.setItem("alittihad_jadwal_v", "2");
          } else if (s6) {
            try {
              const parsed = JSON.parse(s6);
              if (Array.isArray(parsed)) setJadwalList(parsed);
            } catch {}
          }
          if (s8) {
            try {
              const parsed = JSON.parse(s8);
              if (Array.isArray(parsed)) savedGuru = parsed;
            } catch {}
          }
          if (s9) {
            try {
              const parsed = JSON.parse(s9);
              if (Array.isArray(parsed)) setKelasList(parsed);
            } catch {}
          }
          if (s10) {
            try {
              const parsed = JSON.parse(s10);
              if (Array.isArray(parsed)) setJadwalOverridesList(parsed);
            } catch {}
          }

          const s15 = localStorage.getItem("alittihad_waktu_profiles");
          if (s15) {
            const parsed = JSON.parse(s15);
            if (Array.isArray(parsed) && parsed.length >= 1) setWaktuProfiles(parsed);
          }

          const s16 = localStorage.getItem("alittihad_activity_log");
          if (s16) {
            try {
              const parsed = JSON.parse(s16);
              if (Array.isArray(parsed)) setActivityLogs(parsed);
            } catch {}
          }
        }

        if (savedGuru) setGuruList(savedGuru);
        if (savedAbsensi) {
          const today = new Date().toISOString().split("T")[0];
          if (savedAbsensi.date === today) {
            const rawSiswa = savedAbsensi.data || {};
            const normalizedSiswa: Record<string, { status: string; jam: string }> = {};
            for (const [k, v] of Object.entries(rawSiswa)) {
              if (typeof v === "string") {
                normalizedSiswa[k] = { status: v, jam: "—" };
              } else if (v && typeof v === "object") {
                normalizedSiswa[k] = v as { status: string; jam: string };
              }
            }
            setAbsensiSiswaHariIni(normalizedSiswa);
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
        }

        // Load Siswa History
        let savedSiswaHistory: Record<string, Record<string, { status: string; jam: string }>> | null = null;
        if (isElectron) {
          savedSiswaHistory = await (window as any).electronAPI.getStoreValue("alittihad_absensi_siswa_history");
        } else {
          const raw = localStorage.getItem("alittihad_absensi_siswa_history");
          if (raw) savedSiswaHistory = JSON.parse(raw);
        }

        if (savedSiswaHistory && Object.keys(savedSiswaHistory).length > 0) {
          setAbsensiSiswaHistory(savedSiswaHistory);
        }

      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setSiswaLoading(true);
    Promise.all([loadSiswaFromDB(), loadAlumniFromDB()])
      .then(([siswa, alumni]) => {
        setSiswaList(siswa);
        setAlumniList(alumni);
      })
      .catch(e => console.error("Failed to load siswa/alumni from Supabase", e))
      .finally(() => setSiswaLoading(false));
  }, []);

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

    // Sync current day siswa attendance to history
    if (Object.keys(absensiSiswaHariIni).length > 0) {
      setAbsensiSiswaHistory(prev => {
        const currentDay = prev[today] || {};
        const mergedDay = { ...currentDay, ...absensiSiswaHariIni };

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
    if (Object.keys(absensiSiswaHistory).length === 0) return;
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_siswa_history", absensiSiswaHistory);
    } else {
      localStorage.setItem("alittihad_absensi_siswa_history", JSON.stringify(absensiSiswaHistory));
    }
  }, [absensiSiswaHistory, isElectron]);

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
      localStorage.setItem("alittihad_activity_log", JSON.stringify(activityLogs));
    } else {
      (window as any).electronAPI.setStoreValue("alittihad_activity_log", activityLogs);
    }
  }, [activityLogs, isElectron]);

  // ─── Activity log helper ───────────────────────────────────────────────────
  const logActivity = (entry: Omit<ActivityLogEntry, "id" | "waktu" | "pelaku">) => {
    if (isGhostEmail(authUser?.email)) return;
    setActivityLogs(prev => [{
      id: crypto.randomUUID(),
      waktu: new Date().toISOString(),
      pelaku: authUser?.nama ?? "Sistem",
      ...entry,
    }, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem("alittihad_mutasi", JSON.stringify(mutasiList));
  }, [mutasiList]);

  const addMutasi = (mutasi: MutasiRecord) => {
    setMutasiList(prev => [mutasi, ...prev]);
    logActivity({
      tipe: "Mutasi Siswa",
      deskripsi: `${mutasi.nama} (${mutasi.kelas}) — ${
        mutasi.jenisMutasi === "masuk" ? "Mutasi Masuk" :
        mutasi.jenisMutasi === "pindah" ? `Pindah ke ${mutasi.sekolahTujuan || "sekolah lain"}` :
        mutasi.jenisMutasi === "dikeluarkan" ? "Dikeluarkan" : "Meninggal Dunia"
      }`,
      ref: "—",
    });
  };

  useEffect(() => {
    localStorage.setItem("alittihad_manual_transaksi", JSON.stringify(manualTransaksiList));
  }, [manualTransaksiList]);

  useEffect(() => {
    localStorage.setItem("alittihad_rab", JSON.stringify(rabList));
  }, [rabList]);

  useEffect(() => {
    localStorage.setItem("alittihad_bank_transfer", JSON.stringify(bankTransferList));
  }, [bankTransferList]);

  const nextBVRef = (tipe: "masuk" | "keluar"): string => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `BV/${yyyy}/${mm}/`;
    const existing = manualTransaksiList.filter(t => t.ref.startsWith(prefix));
    const next = String(existing.length + 1).padStart(3, "0");
    return `${prefix}${next}`;
  };

  const addBankTransfer = (row: Omit<BankTransferRow, "id" | "dicatatOleh" | "waktuCatat">) => {
    const id = `BT-${Date.now()}`;
    setBankTransferList(prev => [{ ...row, id, dicatatOleh: authUser?.nama ?? "Admin", waktuCatat: new Date().toISOString() }, ...prev]);
  };

  const addRab = (row: Omit<RABRow, "id">) => {
    const id = rabList.length > 0 ? Math.max(...rabList.map(r => r.id)) + 1 : 1;
    setRabList(prev => [...prev, { ...row, id }]);
  };
  const updateRab = (id: number, data: Partial<RABRow>) =>
    setRabList(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  const deleteRab = (id: number) =>
    setRabList(prev => prev.filter(r => r.id !== id));

  const addManualTransaksi = (t: ManualTransaksiRow) => {
    setManualTransaksiList(prev => [t, ...prev]);
    logActivity({
      tipe: t.tipe === "masuk" ? "Pembayaran" : "Pembatalan",
      deskripsi: `[${t.tipe === "masuk" ? "Pemasukan" : "Pengeluaran"} Manual] ${t.keterangan} — ${fmt(t.jumlah)}`,
      ref: t.ref,
    });
  };

  const resetToCleanData = () => {
    setSiswaList([]);
    setAlumniList([]);
    setGuruList([]);
    setJadwalList([]);
    setJadwalOverridesList([]);
    setTagihanList([]);
    setTransaksiList([]);
    setAbsensiSiswaHariIni({});
    setAbsensiGuruHariIni({});
    setAbsensiSiswaHistory({});
    setAbsensiGuruHistory({});
    setMutasiList([]);
    setManualTransaksiList([]);
    setBankTransferList([]);
    setActivityLogs([]);

    localStorage.removeItem("alittihad_siswa");
    localStorage.removeItem("alittihad_alumni");
    localStorage.removeItem("alittihad_guru");
    localStorage.removeItem("alittihad_jadwal");
    localStorage.removeItem("alittihad_jadwal_overrides");
    localStorage.removeItem("alittihad_tagihan");
    localStorage.removeItem("alittihad_transaksi");
    localStorage.removeItem("alittihad_absensi_siswa");
    localStorage.removeItem("alittihad_absensi_siswa_history");
    localStorage.removeItem("alittihad_absensi_guru_history");
    localStorage.removeItem("alittihad_mutasi");
    localStorage.removeItem("alittihad_manual_transaksi");
    localStorage.removeItem("alittihad_bank_transfer");
    localStorage.removeItem("alittihad_activity_log");
    localStorage.setItem("alittihad_db_v", "2026_clean_v2");

    if (isElectron) {
      (window as any).electronAPI?.setStoreValue("alittihad_siswa", []);
      (window as any).electronAPI?.setStoreValue("alittihad_alumni", []);
      (window as any).electronAPI?.setStoreValue("alittihad_tagihan", []);
      (window as any).electronAPI?.setStoreValue("alittihad_transaksi", []);
      (window as any).electronAPI?.setStoreValue("alittihad_absensi_siswa", { date: "", data: {}, dataGuru: {} });
      (window as any).electronAPI?.setStoreValue("alittihad_absensi_siswa_history", {});
    }
  };

  const addKelas = (kelas: KelasRow) => setKelasList(prev => [...prev, kelas]);
  const updateKelas = (id: string, data: Partial<KelasRow>) => {
    setKelasList(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
  };
  const deleteKelas = (id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
  };

  const addSiswa = (siswa: Omit<SiswaRow, "id">) => {
    const tempId = Date.now();
    const optimistic: SiswaRow = { ...siswa, id: tempId } as SiswaRow;
    setSiswaList(prev => [optimistic, ...prev]);
    insertSiswaDB(siswa).then(saved => {
      setSiswaList(prev => prev.map(s => s.id === tempId ? saved : s));
    }).catch(() => {
      setSiswaList(prev => prev.filter(s => s.id !== tempId));
      toast.error("Gagal menyimpan data siswa");
    });
  };
  const updateSiswa = (id: number, data: Partial<SiswaRow>) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    updateSiswaDB(id, data).catch(() => {
      toast.error("Gagal memperbarui data siswa");
      loadSiswaFromDB().then(setSiswaList).catch(() => {});
    });
  };
  const deleteSiswa = (id: number) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
    deleteSiswaDB(id).catch(() => {
      toast.error("Gagal menghapus data siswa");
      loadSiswaFromDB().then(setSiswaList).catch(() => {});
    });
  };

  const bulkUpdateSiswa = (ids: number[], data: Partial<SiswaRow>) => {
    setSiswaList(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...data } : s));
    bulkUpdateSiswaDB(ids, data).catch(() => {
      toast.error("Gagal memperbarui data siswa");
      loadSiswaFromDB().then(setSiswaList).catch(() => {});
    });
  };

  const bulkDeleteSiswa = (ids: number[]) => {
    setSiswaList(prev => prev.filter(s => !ids.includes(s.id)));
    bulkDeleteSiswaDB(ids).catch(() => {
      toast.error("Gagal menghapus data siswa");
      loadSiswaFromDB().then(setSiswaList).catch(() => {});
    });
  };

  const graduateSiswa = (ids: number[], tahunLulus: string) => {
    const toGraduate = siswaList.filter(s => ids.includes(s.id));
    if (toGraduate.length === 0) return;

    setSiswaList(prev => prev.filter(s => !ids.includes(s.id)));
    graduateSiswaDB(toGraduate, tahunLulus).then(newAlumni => {
      setAlumniList(prev => [...newAlumni, ...prev]);
    }).catch(() => {
      toast.error("Gagal meluluskan siswa");
      loadSiswaFromDB().then(setSiswaList).catch(() => {});
    });
  };

  const addAlumni = (alumni: Omit<AlumniRow, "id">) => {
    const tempId = Date.now();
    const optimistic: AlumniRow = { ...alumni, id: tempId } as AlumniRow;
    setAlumniList(prev => [optimistic, ...prev]);
    insertAlumniDB(alumni).then(saved => {
      setAlumniList(prev => prev.map(a => a.id === tempId ? saved : a));
    }).catch(() => {
      setAlumniList(prev => prev.filter(a => a.id !== tempId));
      toast.error("Gagal menyimpan data alumni");
    });
  };
  const updateAlumni = (id: number, data: Partial<AlumniRow>) => {
    setAlumniList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    updateAlumniDB(id, data).catch(() => {
      toast.error("Gagal memperbarui data alumni");
      loadAlumniFromDB().then(setAlumniList).catch(() => {});
    });
  };
  const deleteAlumni = (id: number) => {
    setAlumniList(prev => prev.filter(a => a.id !== id));
    deleteAlumniDB(id).catch(() => {
      toast.error("Gagal menghapus data alumni");
      loadAlumniFromDB().then(setAlumniList).catch(() => {});
    });
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

    if (!prev?.role && authUser?.role && !isGhostEmail(authUser.email)) {
      setActivityLogs(logs => [{
        id: crypto.randomUUID(),
        waktu: new Date().toISOString(),
        tipe: "Login",
        deskripsi: `${authUser.nama} masuk ke sistem`,
        ref: "—",
        pelaku: authUser.nama,
      }, ...logs]);
    } else if (prev?.role && !authUser && !isGhostEmail(prev.email)) {
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
        siswaList, siswaLoading, addSiswa, updateSiswa, deleteSiswa, bulkUpdateSiswa, bulkDeleteSiswa, graduateSiswa,
        alumniList, addAlumni, updateAlumni, deleteAlumni,
        guruList, addGuru, updateGuru, deleteGuru,
        kelasList, addKelas, updateKelas, deleteKelas,
        jadwalList, addJadwal, updateJadwal, deleteJadwal,
        jadwalOverridesList, setJadwalOverride, clearJadwalOverride,
        waktuProfiles, setWaktuProfiles,
        absensiSiswaHariIni, setAbsensiSiswaHariIni,
        absensiGuruHariIni, setAbsensiGuruHariIni,
        absensiGuruHistory,
        absensiSiswaHistory,
        logActivity,
        tagihanList, transaksiList, addTagihan, updateTagihanSiswa, deleteTagihanSiswa, addTagihanSiswaManual, addTransaksi,
        isElectron,
        appSettings,
        setAppSettings,
        activityLogs,
        mutasiList, addMutasi,
        manualTransaksiList, addManualTransaksi, nextBVRef,
        rabList, addRab, updateRab, deleteRab,
        bankTransferList, addBankTransfer,
        resetToCleanData,
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
