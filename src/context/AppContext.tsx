import { createContext, useContext, useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import type { Role, AppSettings, ActivityLogEntry, MutasiRecord, ManualTransaksiRow, BankTransferRow } from "@/types";
import { WA_TEMPLATE_DEFAULTS } from "@/lib/waTemplates";
import { RABRow, RAB_DATA, mutasiData } from "@/data/keuangan";
import { useAuth } from "@/context/AuthContext";
import { fmt, getTodayDateString } from "@/lib/formatters";
import { isGhostEmail } from "@/lib/ghost";
import { supabase } from "@/lib/supabase";
import {
  loadSiswaFromDB, loadAlumniFromDB,
  insertSiswaDB, updateSiswaDB, deleteSiswaDB, bulkDeleteSiswaDB, bulkUpdateSiswaDB, graduateSiswaDB,
  insertAlumniDB, updateAlumniDB, deleteAlumniDB, bulkInsertSiswaDB, rowToSiswa,
} from "@/lib/supabase-siswa";
import {
  loadGuruFromDB,
  insertGuruDB,
  updateGuruDB,
  deleteGuruDB,
  bulkInsertGuruDB,
} from "@/lib/supabase-guru";
import {
  loadAbsensiSiswaHariIniDB,
  loadAbsensiSiswaHistoryDB,
  bulkUpsertAbsensiSiswaDB,
  loadAbsensiGuruHariIniDB,
  loadAbsensiGuruHistoryDB,
  bulkUpsertAbsensiGuruDB,
} from "@/lib/supabase-absensi";
import {
  loadTagihanFromDB,
  loadTransaksiFromDB,
  bulkUpsertTagihanDB,
  updateTagihanNominalDB,
  deleteTagihanSiswaDB,
  insertTransaksiDB,
  transaksiToPayload,
} from "@/lib/supabase-pembayaran";
import {
  loadManualTransaksiFromDB,
  insertManualTransaksiDB,
  manualTransaksiToPayload,
  loadBankTransferFromDB,
  insertBankTransferDB,
  bankTransferToPayload,
  loadRabFromDB,
  insertRabDB,
  updateRabDB,
  deleteRabDB,
  bulkInsertRabDB,
} from "@/lib/supabase-keuangan";
import {
  loadAppSettingsFromDB,
  saveAppSettingsDB,
  loadKelasFromDB,
  bulkInsertKelasDB,
  insertKelasDB,
  updateKelasDB,
  deleteKelasDB,
  loadJadwalFromDB,
  bulkInsertJadwalDB,
  insertJadwalDB,
  updateJadwalDB,
  deleteJadwalDB,
  loadLogAktivitasFromDB,
  insertLogAktivitasDB,
} from "@/lib/supabase-akademik";
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
import { guruData, type GuruRow, SEED_GURU } from "@/data/guru";
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
  guruLoading: boolean;
  addGuru: (guru: GuruRow | Omit<GuruRow, "id">) => void;
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
  refreshAllCloudData: () => Promise<void>;
  isSyncing: boolean;
}

const MANUAL_TRANSAKSI_SEED: ManualTransaksiRow[] = [];
const BANK_TRANSFER_SEED: BankTransferRow[] = [];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // tahunAjaran is derived from appSettings — see below
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [siswaList, setSiswaList] = useState<SiswaRow[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_siswa");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [siswaLoading, setSiswaLoading] = useState(true);
  const [alumniList, setAlumniList] = useState<AlumniRow[]>([]);
  const [guruList, setGuruList] = useState<GuruRow[]>(() => {
    try {
      const s = localStorage.getItem("alittihad_guru");
      return s ? JSON.parse(s) : guruData;
    } catch { return guruData; }
  });
  const [guruLoading, setGuruLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isLoadedFromDB = useRef(false);
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
    waTemplates: WA_TEMPLATE_DEFAULTS,
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

          const sSiswa = localStorage.getItem("alittihad_siswa");
          const s3 = localStorage.getItem("alittihad_absensi_siswa");
          const s4 = localStorage.getItem("alittihad_tagihan");
          const s5 = localStorage.getItem("alittihad_transaksi");
          const s6 = localStorage.getItem("alittihad_jadwal");
          const s8 = localStorage.getItem("alittihad_guru");
          const s9 = localStorage.getItem("alittihad_kelas");
          const s10 = localStorage.getItem("alittihad_jadwal_overrides");
          if (sSiswa) {
            try {
              const parsed = JSON.parse(sSiswa);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSiswaList(prev => prev.length === 0 ? parsed : prev);
              }
            } catch {}
          }
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
          const today = getTodayDateString();
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

  // ─── Cloud Data Initial Load (Siswa, Alumni, Guru, Absensi) ───────────────
  useEffect(() => {
    setSiswaLoading(true);
    setGuruLoading(true);

    const initCloudData = async () => {
      // 1. Siswa & Alumni
      try {
        const [siswaRes, alumniRes] = await Promise.allSettled([
          loadSiswaFromDB(),
          loadAlumniFromDB(),
        ]);

        let siswa: SiswaRow[] = [];
        if (siswaRes.status === "fulfilled") {
          siswa = siswaRes.value;
        } else {
          console.error("Gagal load siswa dari Supabase", siswaRes.reason);
        }

        let alumni: AlumniRow[] = [];
        if (alumniRes.status === "fulfilled") {
          alumni = alumniRes.value;
          setAlumniList(alumni);
        } else {
          console.error("Gagal load alumni dari Supabase", alumniRes.reason);
        }

        if (siswa.length > 0) {
          setSiswaList(siswa);
          try {
            localStorage.setItem("alittihad_siswa", JSON.stringify(siswa));
          } catch {}
        } else {
          // Fallback ke localStorage jika Supabase kosong atau fetch gagal
          const localSiswaStr = localStorage.getItem("alittihad_siswa");
          if (localSiswaStr) {
            try {
              const parsed = JSON.parse(localSiswaStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Jika Supabase sukses tapi 0 baris, coba seed ke Supabase
                if (siswaRes.status === "fulfilled" && siswaRes.value.length === 0) {
                  try {
                    const toSeed = parsed.map(({ id, ...rest }: any) => rest);
                    siswa = await bulkInsertSiswaDB(toSeed);
                  } catch (seedErr) {
                    console.error("Gagal seed siswa ke Supabase", seedErr);
                    siswa = parsed;
                  }
                } else {
                  siswa = parsed;
                }
                setSiswaList(siswa);
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error("Gagal init siswa/alumni", e);
      } finally {
        setSiswaLoading(false);
      }

      // 2. Guru
      try {
        let gurus = await loadGuruFromDB();
        if (gurus.length === 0) {
          const localGuruStr = localStorage.getItem("alittihad_guru");
          let toSeed = SEED_GURU;
          if (localGuruStr) {
            try {
              const parsed = JSON.parse(localGuruStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                toSeed = parsed.map(({ id, ...rest }: any) => rest);
              }
            } catch {}
          }
          try {
            gurus = await bulkInsertGuruDB(toSeed);
          } catch (seedErr) {
            console.error("Gagal seed guru ke Supabase", seedErr);
            gurus = toSeed.map((g, idx) => ({ ...g, id: idx + 1 } as GuruRow));
          }
        }
        setGuruList(gurus);
      } catch (e) {
        console.error("Gagal load guru dari Supabase", e);
      } finally {
        setGuruLoading(false);
      }

      // 3. Absensi (Hari Ini & History)
      try {
        const today = getTodayDateString();
        const [absSiswaToday, absGuruToday, absSiswaHist, absGuruHist] = await Promise.all([
          loadAbsensiSiswaHariIniDB(today),
          loadAbsensiGuruHariIniDB(today),
          loadAbsensiSiswaHistoryDB(),
          loadAbsensiGuruHistoryDB(),
        ]);

        if (Object.keys(absSiswaToday).length > 0) {
          setAbsensiSiswaHariIni(absSiswaToday);
        }
        if (Object.keys(absGuruToday).length > 0) {
          setAbsensiGuruHariIni(absGuruToday);
        }
        if (Object.keys(absSiswaHist).length > 0) {
          setAbsensiSiswaHistory(absSiswaHist);
        }
        if (Object.keys(absGuruHist).length > 0) {
          setAbsensiGuruHistory(absGuruHist);
        }
      } catch (e) {
        console.error("Gagal load absensi dari Supabase", e);
      }

      // 4. Tagihan & Transaksi Pembayaran
      try {
        const [dbTagihan, dbTransaksi] = await Promise.all([
          loadTagihanFromDB(),
          loadTransaksiFromDB(),
        ]);

        if (dbTagihan.length > 0) {
          setTagihanList(dbTagihan);
        } else {
          const localTagihanStr = localStorage.getItem("alittihad_tagihan");
          if (localTagihanStr) {
            try {
              const parsed = JSON.parse(localTagihanStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTagihanList(parsed);
                bulkUpsertTagihanDB(parsed).catch(console.error);
              }
            } catch {}
          }
        }

        if (dbTransaksi.length > 0) {
          setTransaksiList(dbTransaksi);
        } else {
          const localTrxStr = localStorage.getItem("alittihad_transaksi");
          if (localTrxStr) {
            try {
              const parsed = JSON.parse(localTrxStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTransaksiList(parsed);
                supabase
                  .from("transaksi_pembayaran")
                  .insert(parsed.map(transaksiToPayload))
                  .then(({ error }) => {
                    if (error) console.error(error);
                  });
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error("Gagal load tagihan/transaksi dari Supabase", e);
      }

      // 5. Kas & Bank (Buku Kas Umum), Bank Transfer, dan RAB
      try {
        const [dbManualTrx, dbBankTransfer, dbRab] = await Promise.all([
          loadManualTransaksiFromDB(),
          loadBankTransferFromDB(),
          loadRabFromDB(),
        ]);

        if (dbManualTrx.length > 0) {
          setManualTransaksiList(dbManualTrx);
        } else {
          const localManualStr = localStorage.getItem("alittihad_manual_transaksi");
          if (localManualStr) {
            try {
              const parsed = JSON.parse(localManualStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setManualTransaksiList(parsed);
                supabase
                  .from("manual_transaksi")
                  .insert(parsed.map(manualTransaksiToPayload))
                  .then(({ error }) => {
                    if (error) console.error(error);
                  });
              }
            } catch {}
          }
        }

        if (dbBankTransfer.length > 0) {
          setBankTransferList(dbBankTransfer);
        } else {
          const localBtStr = localStorage.getItem("alittihad_bank_transfer");
          if (localBtStr) {
            try {
              const parsed = JSON.parse(localBtStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBankTransferList(parsed);
                supabase
                  .from("bank_transfer")
                  .insert(parsed.map(bankTransferToPayload))
                  .then(({ error }) => {
                    if (error) console.error(error);
                  });
              }
            } catch {}
          }
        }

        if (dbRab.length > 0) {
          setRabList(dbRab);
        } else {
          try {
            const seeded = await bulkInsertRabDB(RAB_DATA);
            setRabList(seeded);
          } catch (seedErr) {
            console.error("Gagal seed RAB ke Supabase", seedErr);
            setRabList(RAB_DATA);
          }
        }
      } catch (e) {
        console.error("Gagal load kas/bank/rab dari Supabase", e);
      }

      // 6. Pengaturan Madrasah, Kelas, Jadwal Pelajaran, dan Log Aktivitas
      try {
        const [dbSettings, dbKelas, dbJadwal, dbLogs] = await Promise.all([
          loadAppSettingsFromDB(),
          loadKelasFromDB(),
          loadJadwalFromDB(),
          loadLogAktivitasFromDB(),
        ]);

        if (dbSettings) {
          setAppSettings(s => ({ ...s, ...dbSettings }));
        } else {
          saveAppSettingsDB(defaultAppSettings).catch(console.error);
        }

        if (dbKelas.length > 0) {
          setKelasList(dbKelas);
        } else {
          try {
            const seededKelas = await bulkInsertKelasDB(kelasData);
            setKelasList(seededKelas);
          } catch (seedErr) {
            console.error("Gagal seed kelas ke Supabase", seedErr);
          }
        }

        if (dbJadwal.length > 0) {
          setJadwalList(dbJadwal);
        } else {
          try {
            const seededJadwal = await bulkInsertJadwalDB(jadwalData);
            setJadwalList(seededJadwal);
          } catch (seedErr) {
            console.error("Gagal seed jadwal ke Supabase", seedErr);
          }
        }

        if (dbLogs.length > 0) {
          setActivityLogs(dbLogs);
        }
      } catch (e) {
        console.error("Gagal load settings/kelas/jadwal/log dari Supabase", e);
      }

      isLoadedFromDB.current = true;
    };

    initCloudData();
  }, []);

  // ─── Realtime Subscription for Absensi (Siswa & Guru) ────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("alittihad_absensi_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "absensi_siswa" },
        (payload) => {
          const today = getTodayDateString();
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as any;
            if (row && (row.tanggal === today || String(row.tanggal).startsWith(today))) {
              setAbsensiSiswaHariIni(prev => {
                if (prev[row.nis]?.status === row.status && prev[row.nis]?.jam === (row.jam || "—")) {
                  return prev;
                }
                return {
                  ...prev,
                  [row.nis]: { status: row.status, jam: row.jam || "—" }
                };
              });
            }
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as any;
            if (row?.nis) {
              setAbsensiSiswaHariIni(prev => {
                if (!prev[row.nis]) return prev;
                const next = { ...prev };
                delete next[row.nis];
                return next;
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "absensi_guru" },
        (payload) => {
          const today = getTodayDateString();
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as any;
            if (row && (row.tanggal === today || String(row.tanggal).startsWith(today))) {
              const guruId = Number(row.guru_id);
              setAbsensiGuruHariIni(prev => {
                if (prev[guruId]?.status === row.status && prev[guruId]?.jam === (row.jam || "—")) {
                  return prev;
                }
                return {
                  ...prev,
                  [guruId]: { status: row.status, jam: row.jam || "—" }
                };
              });
            }
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as any;
            if (row?.guru_id) {
              const guruId = Number(row.guru_id);
              setAbsensiGuruHariIni(prev => {
                if (!prev[guruId]) return prev;
                const next = { ...prev };
                delete next[guruId];
                return next;
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "siswa" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = rowToSiswa(payload.new);
            setSiswaList(prev => {
              if (prev.some(s => s.id === row.id || s.nis === row.nis)) return prev;
              return [row, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const row = rowToSiswa(payload.new);
            setSiswaList(prev => prev.map(s => s.id === row.id ? row : s));
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as any)?.id;
            if (oldId) {
              setSiswaList(prev => prev.filter(s => s.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── Auto-Polling & Visibility Sync (Sinkronisasi Laptop & HP Tanpa Refresh) ───
  useEffect(() => {
    let isMounted = true;
    let pollCount = 0;

    const syncCloudData = async () => {
      if (!isLoadedFromDB.current) return;
      pollCount++;
      const shouldSyncSiswa = (siswaList.length === 0) || (pollCount % 4 === 0);

      try {
        const today = getTodayDateString();
        const promises: Promise<any>[] = [
          loadAbsensiSiswaHariIniDB(today).catch(() => null),
          loadAbsensiGuruHariIniDB(today).catch(() => null),
        ];
        if (shouldSyncSiswa) {
          promises.push(loadSiswaFromDB().catch(() => null));
        }

        const [absSiswa, absGuru, cloudSiswa] = await Promise.all(promises);

        if (!isMounted) return;

        if (absSiswa) {
          setAbsensiSiswaHariIni(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [nis, val] of Object.entries(absSiswa)) {
              if (prev[nis]?.status !== val.status || prev[nis]?.jam !== val.jam) {
                next[nis] = val;
                changed = true;
              }
            }
            return changed ? next : prev;
          });
        }

        if (absGuru) {
          setAbsensiGuruHariIni(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [id, val] of Object.entries(absGuru)) {
              const numId = Number(id);
              if (prev[numId]?.status !== val.status || prev[numId]?.jam !== val.jam) {
                next[numId] = val;
                changed = true;
              }
            }
            return changed ? next : prev;
          });
        }

        if (cloudSiswa && Array.isArray(cloudSiswa) && cloudSiswa.length > 0) {
          setSiswaList(prev => {
            if (prev.length === 0 || prev.length !== cloudSiswa.length) {
              try {
                localStorage.setItem("alittihad_siswa", JSON.stringify(cloudSiswa));
              } catch {}
              return cloudSiswa;
            }
            return prev;
          });
        }
      } catch {
        // silent fallback
      }
    };

    // Polling setiap 3.5 detik agar antar device (Laptop & HP) selalu up-to-date otomatis
    const interval = setInterval(syncCloudData, 3500);

    // Sync instan ketika window mendapatkan fokus atau tab dibuka kembali
    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        pollCount = 3; // force siswa sync pada tick berikutnya
        syncCloudData();
      }
    };

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [siswaList.length]);

  // Simpan siswaList ke localStorage sebagai offline fallback
  useEffect(() => {
    if (siswaList.length > 0) {
      if (isElectron) {
        (window as any).electronAPI.setStoreValue("alittihad_siswa", siswaList);
      } else {
        localStorage.setItem("alittihad_siswa", JSON.stringify(siswaList));
      }
    }
  }, [siswaList, isElectron]);

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

  // Sync current day Siswa attendance to history & Supabase
  useEffect(() => {
    const today = getTodayDateString();
    const payload = { date: today, data: absensiSiswaHariIni, dataGuru: absensiGuruHariIni };
    if (isElectron) {
      (window as any).electronAPI.setStoreValue("alittihad_absensi_siswa", payload);
    } else {
      localStorage.setItem("alittihad_absensi_siswa", JSON.stringify(payload));
    }

    if (!isLoadedFromDB.current) return;
    const entries = Object.entries(absensiSiswaHariIni);
    if (entries.length === 0) return;

    setAbsensiSiswaHistory(prev => {
      const currentDay = prev[today] || {};
      const mergedDay = { ...currentDay, ...absensiSiswaHariIni };
      if (JSON.stringify(currentDay) === JSON.stringify(mergedDay)) return prev;
      return { ...prev, [today]: mergedDay };
    });

    const records = entries.map(([nis, v]) => ({
      tanggal: today,
      nis,
      status: v.status,
      jam: v.jam,
    }));
    bulkUpsertAbsensiSiswaDB(records).catch(err => {
      console.error("Gagal sync absensi siswa ke Supabase:", err);
    });
  }, [absensiSiswaHariIni, isElectron]);

  // Sync current day Guru attendance to history & Supabase
  useEffect(() => {
    if (!isLoadedFromDB.current) return;
    const today = getTodayDateString();
    const entries = Object.entries(absensiGuruHariIni);
    if (entries.length === 0) return;

    setAbsensiGuruHistory(prev => {
      const currentDay = prev[today] || {};
      const mergedDay = { ...currentDay, ...absensiGuruHariIni };
      if (JSON.stringify(currentDay) === JSON.stringify(mergedDay)) return prev;
      return { ...prev, [today]: mergedDay };
    });

    const records = entries.map(([guruIdStr, v]) => ({
      tanggal: today,
      guruId: Number(guruIdStr),
      status: v.status,
      jam: v.jam,
    }));
    bulkUpsertAbsensiGuruDB(records).catch(err => {
      console.error("Gagal sync absensi guru ke Supabase:", err);
    });
  }, [absensiGuruHariIni]);

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

    if (!isLoadedFromDB.current) return;
    saveAppSettingsDB(appSettings).catch(err => {
      console.error("Gagal sync appSettings ke Supabase:", err);
    });
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
    const newEntry: ActivityLogEntry = {
      id: crypto.randomUUID(),
      waktu: new Date().toISOString(),
      pelaku: authUser?.nama ?? "Sistem",
      ...entry,
    };
    setActivityLogs(prev => [newEntry, ...prev]);
    insertLogAktivitasDB(newEntry).catch(err => {
      console.error("Gagal simpan log aktivitas ke Supabase:", err);
    });
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
    const newRow: BankTransferRow = {
      ...row,
      id,
      dicatatOleh: authUser?.nama ?? "Admin",
      waktuCatat: new Date().toISOString(),
    };
    setBankTransferList(prev => [newRow, ...prev]);
    insertBankTransferDB(newRow).catch(err => {
      console.error("Gagal simpan bank transfer ke Supabase:", err);
      toast.error("Gagal menyimpan mutasi transfer ke server");
    });
  };

  const addRab = (row: Omit<RABRow, "id">) => {
    const tempId = rabList.length > 0 ? Math.max(...rabList.map(r => r.id)) + 1 : 1;
    const optimistic: RABRow = { ...row, id: tempId };
    setRabList(prev => [...prev, optimistic]);
    insertRabDB(row)
      .then(saved => {
        setRabList(prev => prev.map(r => (r.id === tempId ? saved : r)));
        toast.success("Item anggaran berhasil ditambahkan");
      })
      .catch(err => {
        console.error("Gagal simpan RAB ke Supabase:", err);
        setRabList(prev => prev.filter(r => r.id !== tempId));
        toast.error("Gagal menyimpan item anggaran ke server");
      });
  };
  const updateRab = (id: number, data: Partial<RABRow>) => {
    setRabList(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));
    updateRabDB(id, data).catch(err => {
      console.error("Gagal update RAB di Supabase:", err);
      toast.error("Gagal memperbarui anggaran di server");
    });
  };
  const deleteRab = (id: number) => {
    setRabList(prev => prev.filter(r => r.id !== id));
    deleteRabDB(id).catch(err => {
      console.error("Gagal delete RAB di Supabase:", err);
      toast.error("Gagal menghapus anggaran di server");
    });
  };

  const addManualTransaksi = (t: ManualTransaksiRow) => {
    setManualTransaksiList(prev => [t, ...prev]);
    insertManualTransaksiDB(t).catch(err => {
      console.error("Gagal simpan manual transaksi ke Supabase:", err);
      toast.error("Gagal menyimpan transaksi ke server");
    });
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

    // Hapus dari Supabase (fire-and-forget — tidak perlu await)
    supabase.from("siswa").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus siswa dari Supabase", error.message);
    });
    supabase.from("alumni").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus alumni dari Supabase", error.message);
    });
    supabase.from("guru").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus guru dari Supabase", error.message);
    });
    supabase.from("absensi_siswa").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus absensi siswa dari Supabase", error.message);
    });
    supabase.from("absensi_guru").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus absensi guru dari Supabase", error.message);
    });
    supabase.from("tagihan_siswa").delete().neq("id", "").then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus tagihan_siswa dari Supabase", error.message);
    });
    supabase.from("transaksi_pembayaran").delete().neq("id", "").then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus transaksi_pembayaran dari Supabase", error.message);
    });
    supabase.from("manual_transaksi").delete().neq("id", "").then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus manual_transaksi dari Supabase", error.message);
    });
    supabase.from("bank_transfer").delete().neq("id", "").then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus bank_transfer dari Supabase", error.message);
    });
    supabase.from("rab_anggaran").delete().gt("id", 0).then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus rab_anggaran dari Supabase", error.message);
    });
    supabase.from("log_aktivitas").delete().neq("id", "00000000-0000-0000-0000-000000000000").then(({ error }) => {
      if (error) console.error("resetToCleanData: gagal hapus log_aktivitas dari Supabase", error.message);
    });
  };

  const addKelas = (kelas: KelasRow) => {
    setKelasList(prev => [...prev, kelas]);
    insertKelasDB(kelas).catch(err => {
      console.error("Gagal insert kelas ke Supabase:", err);
      toast.error("Gagal menyimpan kelas ke server");
    });
  };
  const updateKelas = (id: string, data: Partial<KelasRow>) => {
    setKelasList(prev => prev.map(k => (k.id === id ? { ...k, ...data } : k)));
    updateKelasDB(id, data).catch(err => {
      console.error("Gagal update kelas di Supabase:", err);
    });
  };
  const deleteKelas = (id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
    deleteKelasDB(id).catch(err => {
      console.error("Gagal delete kelas di Supabase:", err);
    });
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

  const addGuru = (guru: GuruRow | Omit<GuruRow, "id">) => {
    const tempId = Date.now();
    const optimistic: GuruRow = { ...guru, id: ("id" in guru && guru.id ? guru.id : tempId) } as GuruRow;
    setGuruList(prev => [optimistic, ...prev]);
    insertGuruDB(guru).then(saved => {
      setGuruList(prev => prev.map(g => g.id === optimistic.id ? saved : g));
      toast.success("Data guru berhasil disimpan");
    }).catch(err => {
      setGuruList(prev => prev.filter(g => g.id !== optimistic.id));
      toast.error("Gagal menyimpan data guru");
      console.error(err);
    });
  };

  const updateGuru = (id: number, data: Partial<GuruRow>) => {
    setGuruList(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
    updateGuruDB(id, data).catch(err => {
      toast.error("Gagal memperbarui data guru");
      console.error(err);
      loadGuruFromDB().then(setGuruList).catch(() => {});
    });
  };

  const deleteGuru = (id: number) => {
    setGuruList(prev => prev.filter(a => a.id !== id));
    deleteGuruDB(id).catch(err => {
      toast.error("Gagal menghapus data guru");
      console.error(err);
      loadGuruFromDB().then(setGuruList).catch(() => {});
    });
  };

  const addJadwal = (jadwal: JadwalRow) => {
    const tempId = Date.now();
    const optimistic: JadwalRow = { ...jadwal, id: tempId };
    setJadwalList(prev => [...prev, optimistic]);
    insertJadwalDB(jadwal)
      .then(saved => {
        setJadwalList(prev => prev.map(j => (j.id === tempId ? saved : j)));
        toast.success("Jadwal pelajaran berhasil ditambahkan");
      })
      .catch(err => {
        console.error("Gagal simpan jadwal ke Supabase:", err);
        setJadwalList(prev => prev.filter(j => j.id !== tempId));
        toast.error("Gagal menyimpan jadwal ke server");
      });
  };
  const updateJadwal = (id: number, data: Partial<JadwalRow>) => {
    setJadwalList(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
    updateJadwalDB(id, data).catch(err => {
      console.error("Gagal update jadwal di Supabase:", err);
    });
  };
  const deleteJadwal = (id: number) => {
    setJadwalList(prev => prev.filter(a => a.id !== id));
    deleteJadwalDB(id).catch(err => {
      console.error("Gagal delete jadwal di Supabase:", err);
    });
  };

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
    bulkUpsertTagihanDB(tagihan).catch(err => {
      console.error("Gagal sync penetapan tagihan ke Supabase:", err);
      toast.error("Gagal menyimpan penetapan tagihan ke server");
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
    const isLunas = tagihan ? tagihan.terbayar >= newNominal && newNominal > 0 : undefined;
    setTagihanList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, nominal: newNominal, keterangan, isLunas: t.terbayar >= newNominal && newNominal > 0 };
      }
      return t;
    }));
    updateTagihanNominalDB(id, newNominal, keterangan, isLunas).catch(err => {
      console.error("Gagal update tagihan di Supabase:", err);
      toast.error("Gagal memperbarui tagihan di server");
    });
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
    deleteTagihanSiswaDB(id).catch(err => {
      console.error("Gagal delete tagihan di Supabase:", err);
      toast.error("Gagal menghapus tagihan di server");
    });
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
    bulkUpsertTagihanDB([newTagihan]).catch(err => {
      console.error("Gagal simpan tagihan manual ke Supabase:", err);
      toast.error("Gagal menyimpan penyesuaian tagihan ke server");
    });
  };

  const addTransaksi = (transaksi: TransaksiPembayaran, updatedTagihan: TagihanSiswa[]) => {
    setTransaksiList(prev => [transaksi, ...prev]);
    const updatedMap = new Map(updatedTagihan.map(t => [t.id, t]));
    setTagihanList(prev => prev.map(t => updatedMap.has(t.id) ? updatedMap.get(t.id)! : t));

    insertTransaksiDB(transaksi, updatedTagihan).catch(err => {
      console.error("Gagal simpan transaksi pembayaran ke Supabase:", err);
      toast.error("Gagal menyimpan transaksi pembayaran ke server");
    });

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

  const refreshAllCloudData = async () => {
    setIsSyncing(true);
    try {
      const today = getTodayDateString();
      const [siswaRes, alumniRes, guruRes, absSiswaRes, absGuruRes, tagihanRes, trxRes] = await Promise.allSettled([
        loadSiswaFromDB(),
        loadAlumniFromDB(),
        loadGuruFromDB(),
        loadAbsensiSiswaHariIniDB(today),
        loadAbsensiGuruHariIniDB(today),
        loadTagihanFromDB(),
        loadTransaksiFromDB(),
      ]);

      const summary: string[] = [];

      if (siswaRes.status === "fulfilled" && siswaRes.value.length > 0) {
        setSiswaList(siswaRes.value);
        localStorage.setItem("alittihad_siswa", JSON.stringify(siswaRes.value));
        summary.push(`${siswaRes.value.length} Siswa`);
      }
      if (alumniRes.status === "fulfilled" && alumniRes.value.length > 0) {
        setAlumniList(alumniRes.value);
      }
      if (guruRes.status === "fulfilled" && guruRes.value.length > 0) {
        setGuruList(guruRes.value);
        localStorage.setItem("alittihad_guru", JSON.stringify(guruRes.value));
        summary.push(`${guruRes.value.length} Guru`);
      }
      if (absSiswaRes.status === "fulfilled" && absSiswaRes.value) {
        setAbsensiSiswaHariIni(absSiswaRes.value);
      }
      if (absGuruRes.status === "fulfilled" && absGuruRes.value) {
        setAbsensiGuruHariIni(absGuruRes.value);
      }
      if (tagihanRes.status === "fulfilled" && tagihanRes.value.length > 0) {
        setTagihanList(tagihanRes.value);
      }
      if (trxRes.status === "fulfilled" && trxRes.value.length > 0) {
        setTransaksiList(trxRes.value);
      }

      toast.success(`Data server berhasil disinkronkan (${summary.join(", ") || "Terbaru"})`);
    } catch (e) {
      console.error("Gagal refresh cloud data", e);
      toast.error("Gagal sinkronisasi data dari server");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{ 
        tahunAjaran, setTahunAjaran, 
        role, 
        sidebarCollapsed, setSidebarCollapsed,
        tunggakanCount, absensiCount,
        siswaList, siswaLoading, addSiswa, updateSiswa, deleteSiswa, bulkUpdateSiswa, bulkDeleteSiswa, graduateSiswa,
        alumniList, addAlumni, updateAlumni, deleteAlumni,
        guruList, guruLoading, addGuru, updateGuru, deleteGuru,
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
        refreshAllCloudData,
        isSyncing,
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
