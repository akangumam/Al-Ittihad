import type { AbsensiGerbangRecord, AbsensiSettings, StatusKehadiran } from "@/types";

/**
 * AttendanceService
 * Menangani logika bisnis untuk absensi gerbang (menentukan status berdasarkan waktu).
 */
export class AttendanceService {
  /**
   * Menghasilkan record absensi baru berdasarkan waktu saat ini dan pengaturan.
   */
  static createRecord(
    personId: string,
    personType: "siswa" | "guru",
    method: "qr" | "fingerprint" | "manual",
    settings: AbsensiSettings,
    adminId?: string
  ): AbsensiGerbangRecord {
    const now = new Date();
    const tanggal = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const waktuScan = now.toLocaleTimeString("id-ID", { hour12: false }); // "HH:mm:ss"
    
    // Tentukan status berdasarkan jam
    let status: StatusKehadiran = "Hadir";
    
    // Parse settings.batasHadir (e.g. "08:00")
    const timeScanVal = this.timeToMinutes(waktuScan);
    const batasHadirVal = this.timeToMinutes(settings.batasHadir);
    
    if (timeScanVal > batasHadirVal) {
      status = "Terlambat";
    }

    return {
      id: crypto.randomUUID(),
      tanggal,
      personId,
      personType,
      waktuScan,
      status,
      method,
      adminId,
    };
  }

  /**
   * Konversi string "HH:mm" atau "HH:mm:ss" menjadi menit (untuk perbandingan).
   */
  private static timeToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] || "0", 10);
    const m = parseInt(parts[1] || "0", 10);
    return h * 60 + m;
  }
}
