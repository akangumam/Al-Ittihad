import { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertCircle, Scan, Search, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { QRInputHandler } from "@/services/attendance/QRInputHandler";
import type { AbsensiGerbangRecord } from "@/types";
import type { SiswaRow } from "@/data/siswa";
import type { GuruRow } from "@/data/guru";

interface ScanPanelProps {
  onScan: (data: string) => void;
  onManualInput: (personId: string, type: "siswa" | "guru") => void;
  lastScanned: AbsensiGerbangRecord | null;
  siswaList: SiswaRow[];
  guruList: GuruRow[];
}

export function ScanPanel({ onScan, onManualInput, lastScanned, siswaList, guruList }: ScanPanelProps) {
  const [manualInput, setManualInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup QR handler (global keydown listener yang mengabaikan input form)
  useEffect(() => {
    const handler = new QRInputHandler((data) => {
      onScan(data);
    });
    
    handler.startListening();
    
    // Auto focus ke input tersembunyi jika diperlukan, 
    // tapi handler kita sudah bekerja di tingkat document.
    return () => {
      handler.stopListening();
    };
  }, [onScan]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Cari di data siswa berdasarkan NIS
    const siswa = siswaList.find(s => s.nis === manualInput.trim());
    if (siswa) {
      onManualInput(siswa.nis, "siswa");
      setManualInput("");
      return;
    }

    // Cari di data guru berdasarkan NUPTK / NIP
    const guru = guruList.find(g => (g.nuptk === manualInput.trim()) || (g.nip === manualInput.trim()));
    if (guru) {
      onManualInput(String(guru.id), "guru");
      setManualInput("");
      return;
    }

    toast.error(`Data "${manualInput}" tidak ditemukan — periksa NIS atau NUPTK`);
  };

  // Resolve user info dari lastScanned
  let scannedName = "";
  let scannedInfo = "";
  if (lastScanned) {
    if (lastScanned.personType === "siswa") {
      const s = siswaList.find(x => x.nis === lastScanned.personId);
      if (s) {
        scannedName = s.nama;
        scannedInfo = `Siswa Kelas ${s.kelas}`;
      }
    } else {
      const g = guruList.find(x => String(x.id) === lastScanned.personId);
      if (g) {
        scannedName = g.nama;
        scannedInfo = `Guru ${g.mapel.join(", ") || "Pegawai"}`;
      }
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Status Overlay (saat sukses scan) ── */}
      {lastScanned && (
        <div 
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200 ${
            lastScanned.status === "Hadir" 
              ? "bg-[#3E8A2F]/95 backdrop-blur-sm" 
              : "bg-[#F6B31E]/95 backdrop-blur-sm"
          }`}
        >
          <div className="text-white flex flex-col items-center text-center p-8">
            {lastScanned.status === "Hadir" ? (
              <CheckCircle2 size={100} className="mb-6 drop-shadow-md" />
            ) : (
              <AlertCircle size={100} className="mb-6 drop-shadow-md" />
            )}
            <h2 className="text-4xl font-bold mb-2 tracking-tight shadow-black/10 text-shadow-sm">{scannedName}</h2>
            <p className="text-xl opacity-90 mb-6">{scannedInfo}</p>
            
            <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/30">
              <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Status Absensi</p>
              <p className="text-2xl font-bold font-mono">{lastScanned.status.toUpperCase()} — {lastScanned.waktuScan}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Scan Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white" onClick={() => inputRef.current?.focus()}>
        <div className="w-48 h-48 rounded-3xl border-4 border-dashed border-[#E2E8DE] flex flex-col items-center justify-center text-[#9CA3A0] mb-8 relative overflow-hidden group">
          <Scan size={64} className="mb-4 text-[#C1CEC0]" />
          <p className="text-sm font-semibold tracking-wider text-center">ARAHKAN QR<br/>KE SCANNER</p>
          
          {/* Laser animation simulation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
        
        <p className="text-center text-[#6B7769]">
          Sistem otomatis mendeteksi scan dari alat.<br/>Pastikan kursor tidak berada di dalam kolom pencarian lain.
        </p>
      </div>

      {/* ── Manual Input Area ── */}
      <div className="p-6 bg-[#FAFAFA] border-t border-[#E2E8DE] shrink-0">
        <h3 className="text-sm font-semibold text-[#6B7769] mb-4 flex items-center gap-2">
          <Keyboard size={16} />
          Input Manual (Darurat)
        </h3>
        
        <form onSubmit={handleManualSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3A0]" />
            <input 
              ref={inputRef}
              type="text" 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Masukkan NIS atau NUPTK..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8DE] rounded-xl text-sm font-medium text-[#1C2517] focus:outline-none focus:border-[#3E8A2F] focus:ring-1 focus:ring-[#3E8A2F] transition-all qr-focus"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-[#1C2517] hover:bg-[#374040] text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
          >
            Catat
          </button>
        </form>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(192px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
