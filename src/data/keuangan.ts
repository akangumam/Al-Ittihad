// ─── KasBank Data ────────────────────────────────────────────────────────────

export interface TransaksiRow {
  id: number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  akun: string;
  ref: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
}

export const transaksiData: TransaksiRow[] = [];

export const BSI_SPARK    = [0, 0, 0];
export const MANDIRI_SPARK= [0, 0, 0];
export const KAS_SPARK    = [0, 0, 0];

export interface AkunRow {
  id: string | number;
  nama: string;
  nomor: string | null;
  atasNama?: string;
  saldo: number;
  spark?: number[];
  sparkColor?: string;
  icon?: "bank" | "wallet";
  rekonsiliasi?: string;
  catatan?: string;
  isDefault?: boolean;
}

export const akunData: AkunRow[] = [
  { id: 1, nama: "Bank BSI",            nomor: "7101-0254-3318", atasNama: "MTs Al-Ittihad Pedaleman", saldo: 0, spark: BSI_SPARK,     sparkColor: "#3E8A2F", icon: "bank",   rekonsiliasi: "—", isDefault: true },
  { id: 2, nama: "Bank Mandiri Syariah",nomor: "1234-5678-9021", atasNama: "MTs Al-Ittihad Pedaleman", saldo: 0, spark: MANDIRI_SPARK, sparkColor: "#57A946", icon: "bank",   rekonsiliasi: "—" },
  { id: 3, nama: "Kas Tunai",           nomor: null,             atasNama: "Bendahara Madrasah",       saldo: 0, spark: KAS_SPARK,     sparkColor: "#F6B31E", icon: "wallet", rekonsiliasi: "—", isDefault: true },
];

export function resolveAkunForPembayaran(
  metode: string,
  akunTerpilih?: string,
  akunList?: AkunRow[]
): string {
  if (akunTerpilih && akunTerpilih.trim()) {
    return akunTerpilih;
  }
  if (akunList && akunList.length > 0) {
    if (metode === "Tunai") {
      const kas = akunList.find(a => a.icon === "wallet" || a.nama.toLowerCase().includes("kas"));
      if (kas) return kas.nama;
    } else {
      const bank = akunList.find(a => a.icon === "bank" || !a.nama.toLowerCase().includes("kas"));
      if (bank) return bank.nama;
    }
    return akunList[0].nama;
  }
  return metode === "Tunai" ? "Kas Tunai" : "Bank BSI";
}

export function computeSaldoAkunList(
  akunList: AkunRow[],
  transaksiList: Array<{ nominal: number; metode: string; akun?: string }>,
  manualTransaksiList: Array<{ akun: string; tipe: "masuk" | "keluar"; jumlah: number }>,
  bankTransferList: Array<{ dari: string; ke: string; nominal: number; status?: string }> = []
): (AkunRow & { saldoBerjalan: number })[] {
  return akunList.map(akun => {
    const deltaMasukTrx = transaksiList.reduce((sum, t) => {
      const targetAkun = resolveAkunForPembayaran(t.metode, t.akun, akunList);
      return targetAkun === akun.nama ? sum + t.nominal : sum;
    }, 0);

    const deltaManualMasuk = manualTransaksiList
      .filter(t => t.akun === akun.nama && t.tipe === "masuk")
      .reduce((sum, t) => sum + t.jumlah, 0);

    const deltaManualKeluar = manualTransaksiList
      .filter(t => t.akun === akun.nama && t.tipe === "keluar")
      .reduce((sum, t) => sum + t.jumlah, 0);

    const deltaTransferMasuk = bankTransferList
      .filter(t => t.ke === akun.nama && (t.status === "Selesai" || !t.status))
      .reduce((sum, t) => sum + t.nominal, 0);

    const deltaTransferKeluar = bankTransferList
      .filter(t => t.dari === akun.nama && (t.status === "Selesai" || !t.status))
      .reduce((sum, t) => sum + t.nominal, 0);

    const saldoBerjalan =
      (Number(akun.saldo) || 0) +
      deltaMasukTrx +
      deltaManualMasuk -
      deltaManualKeluar +
      deltaTransferMasuk -
      deltaTransferKeluar;

    return {
      ...akun,
      saldo: saldoBerjalan,
      saldoBerjalan,
    };
  });
}

export interface MutasiBankRow {
  id: number;
  tanggal: string;
  dari: string;
  ke: string;
  nominal: number;
  catatan: string;
  status: string;
}

export const mutasiData: MutasiBankRow[] = [];

export const kategoriOptions = ["Semua Kategori","Daftar Ulang","PPDB","Kelas 9","Dana BOS","Operasional","Honor","Utilitas","Kegiatan"];


// ─── Anggaran Data ─────────────────────────────────────────────────────────────

export interface RABRow {
  id: number; group: string; nama: string;
  anggaran: number; terpakai: number;
}

export const RAB_DATA: RABRow[] = [];

export const GROUPS = ["OPERASIONAL","KEGIATAN SISWA","SARANA PRASARANA","GAJI & HONOR"];

export const TOTAL_A = 0;
export const TOTAL_T = 0;
export const TOTAL_S = 0;
export const TOTAL_P = 0;

export const MONTHS = ["Jul","Agt","Sep","Okt","Nov","Des","Jan","Feb","Mar","Apr","Mei","Jun"];
export const ANGGARAN_M = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
export const REALISASI_M = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const TOP5: { nama: string; pct: number; anggaran: number; terpakai: number }[] = [];

