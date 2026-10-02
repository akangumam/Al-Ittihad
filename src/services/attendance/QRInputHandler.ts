/**
 * QRInputHandler
 * Mendengarkan input dari USB QR/Barcode scanner.
 * Karena scanner bertindak seperti keyboard, kita menangkap tombol (keydown)
 * dan menunggunya mengirim "Enter". Jika input terlalu lambat, kita anggap itu
 * input manual, bukan scanner.
 */
export class QRInputHandler {
  private buffer: string = "";
  private lastKeyTime: number = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly TIMEOUT_MS = 100; // Jika jeda antar karakter > 100ms, anggap bukan scanner

  constructor(private onScan: (data: string) => void) {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public startListening() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  public stopListening() {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.timer) clearTimeout(this.timer);
    this.buffer = "";
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Abaikan input jika user sedang fokus ke input form atau textarea (kecuali khusus class 'qr-focus')
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      if (!target.classList.contains("qr-focus")) {
        return;
      }
    }

    const currentTime = Date.now();

    // Reset buffer jika input lambat (bukan alat scanner)
    if (currentTime - this.lastKeyTime > this.TIMEOUT_MS && this.buffer.length > 0) {
      this.buffer = "";
    }
    
    this.lastKeyTime = currentTime;

    if (e.key === "Enter") {
      if (this.buffer.length > 3) {
        // Jika format adalah MADRASAH AL-ITTIHAD|ID|NAMA
        this.onScan(this.buffer);
      }
      this.buffer = "";
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      this.buffer += e.key;
    }
  }
}
