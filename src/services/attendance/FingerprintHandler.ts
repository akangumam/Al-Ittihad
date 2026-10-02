export interface FingerprintHandler {
  isAvailable(): Promise<boolean>;
  startListening(onMatch: (personId: string) => void): void;
  stopListening(): void;
  enroll(personId: string): Promise<boolean>;
}

/**
 * FingerprintStub
 * Placeholder untuk implementasi SDK fingerprint yang sesungguhnya (mis. ZKTeco/DigitalPersona)
 * Bisa diaktifkan di kemudian hari tanpa harus mengubah UI Gerbang Absensi.
 */
export class FingerprintStub implements FingerprintHandler {
  async isAvailable() { 
    return false; // Saat ini belum ada hardware
  }
  
  startListening(onMatch: (personId: string) => void) { 
    // no-op
    // Di masa depan: panggil DLL/SDK untuk mulai mendengarkan scan
  }
  
  stopListening() { 
    // no-op
  }
  
  async enroll(personId: string) { 
    return false; // Belum diimplementasikan
  }
}
