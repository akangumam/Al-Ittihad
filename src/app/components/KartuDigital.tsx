import { useState, useMemo } from "react";
import QRCode from "react-qr-code";
import { Printer, Search, ChevronDown, User, X, ZoomIn } from "lucide-react";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";
import { kelasOptions } from "@/data/constants";
import { defaultSettings } from "@/data/settings";

export function KartuPelajar({
  siswa,
  isModal = false,
  onZoom,
  onClick,
}: {
  siswa: any;
  isModal?: boolean;
  onZoom?: (s: any) => void;
  onClick?: () => void;
}) {
  const { tahunAjaran } = useAppContext();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden relative flex flex-col items-center ${
        isModal 
          ? 'shadow-2xl w-[90vw] max-w-[300px] h-[480px] mx-auto' 
          : 'w-[240px] h-[382px] shadow-sm print:shadow-none print:border-gray-300 cursor-pointer transition-transform hover:scale-[1.02]'
      }`}
      style={{ 
        border: "1px solid #E2E8DE", 
        breakInside: "avoid",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      {/* Header Kartu */}
      <div className="bg-[#3E8A2F] w-full flex flex-col items-center pt-5 pb-16 shrink-0 relative overflow-hidden">
        {/* Pattern Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: "url('/card_pattern.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        
        <div className={`relative z-10 rounded-full bg-white flex items-center justify-center p-1 ${isModal ? 'w-14 h-14' : 'w-12 h-12'} mb-2 shadow-sm`}>
          <img src={logoEmblem} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h3 className={`relative z-10 text-white font-bold tracking-wide text-center leading-tight ${isModal ? 'text-[13px]' : 'text-[11px]'}`}>
          {defaultSettings.namaMadrasah.toUpperCase()}
        </h3>
        <p className={`relative z-10 text-white/90 text-center mt-0.5 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Kartu Identitas Siswa - TP {tahunAjaran}</p>
      </div>

      {/* Foto over the header */}
      <div className={`bg-gray-100 border-[3px] border-white shadow-sm rounded-xl overflow-hidden shrink-0 absolute ${isModal ? 'w-[96px] h-[128px] top-[125px]' : 'w-[84px] h-[112px] top-[105px]'} left-1/2 -translate-x-1/2 z-20`}>
        <img 
          src={siswa.foto || (siswa.jk === "L" ? "/foto_L.png" : "/foto_P.png")} 
          alt={`Foto ${siswa.nama}`} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Spacer to push content down below photo */}
      <div className={`${isModal ? 'h-[90px]' : 'h-[75px]'} shrink-0`} />

      {/* Data Siswa */}
      <div className="w-full flex flex-col items-center px-4 mt-1 shrink-0">
        <h4 className={`font-bold text-[#1C2517] leading-tight text-center mb-1.5 w-full line-clamp-2 ${isModal ? 'text-lg' : 'text-base'}`}>
          {siswa.nama}
        </h4>
        <div className={`text-[#6B7769] font-medium text-center ${isModal ? 'text-xs' : 'text-[10px]'}`}>
          NIS: {siswa.nis} • Kelas {siswa.kelas}
        </div>
      </div>

      {/* Footer Codes */}
      <div className={`w-full flex flex-col items-center justify-center gap-2 mt-auto ${isModal ? 'pb-5' : 'pb-4'} shrink-0`}>
        <div 
          className={`relative p-1 bg-white border border-[#E2E8DE] rounded-lg shrink-0 shadow-sm ${isModal ? 'cursor-pointer group' : ''}`}
          onClick={(e) => {
            if (isModal && onZoom) {
              e.stopPropagation();
              onZoom(siswa);
            }
          }}
          title={isModal ? "Perbesar QR Code" : undefined}
        >
          <QRCode
            value={`${defaultSettings.namaMadrasah.toUpperCase()}|${siswa.nis}|${siswa.nama}`}
            size={isModal ? 64 : 56}
            level="M"
          />
          {isModal && (
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border border-[#E2E8DE] shadow-sm rounded-full flex items-center justify-center text-[#3E8A2F] group-hover:scale-110 transition-transform">
              <ZoomIn size={12} />
            </div>
          )}
        </div>
        <p className={`font-medium text-[#374040] tracking-widest ${isModal ? 'text-[11px]' : 'text-[9px]'}`}>{siswa.nis}</p>
      </div>

      {/* Footer Text */}
      <div className={`w-full bg-[#3E8A2F] text-center shrink-0 ${isModal ? 'py-2' : 'py-1.5'}`}>
        <p className={`text-white/90 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Berlaku selama menjadi siswa</p>
      </div>
    </div>
  );
}

export function KartuDigital() {
  const { siswaList } = useAppContext();
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<typeof siswaList[0] | null>(null);
  const [qrZoomSiswa, setQrZoomSiswa] = useState<typeof siswaList[0] | null>(null);

  const filteredSiswa = useMemo(() => {
    const q = search.toLowerCase();
    return siswaList.filter((s) => {
      const matchSearch = !q || s.nama.toLowerCase().includes(q) || s.nis.includes(q);
      const matchKelas = kelasFilter === "Semua Kelas" || s.kelas === kelasFilter.replace("Kelas ", "");
      return matchSearch && matchKelas;
    });
  }, [siswaList, search, kelasFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-0 pb-20 md:pb-0 relative">
      {/* ── Header & Toolbar (Sembunyikan saat print) ── */}
      <div className="print:hidden relative md:sticky md:-top-6 md:-mt-6 md:pt-8 z-30 bg-[#FAFBF9]/95 backdrop-blur-md -mx-4 px-4 pt-4 pb-4 md:px-0 md:mx-0 md:pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8DE]/50">
        <div>
          <h2 className="text-[#1C2517] text-2xl font-bold">Kartu Digital Siswa</h2>
          <p className="text-sm text-[#6B7769]">Kartu identitas dengan QR Code & Barcode siap cetak</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 md:mt-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 sm:max-w-xs bg-white"
            style={{ border: "1px solid #E2E8DE" }}
          >
            <Search size={14} className="text-[#9CA3A0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
            />
          </div>

          <div className="relative">
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="appearance-none bg-white pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {kelasOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3E8A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#2E6B22] transition-colors"
          >
            <Printer size={16} />
            Cetak
          </button>
        </div>
      </div>

      {/* ── Grid Kartu ── */}
      {filteredSiswa.length === 0 ? (
        <div className="print:hidden flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E2E8DE]">
          <p className="text-[#6B7769]">Siswa tidak ditemukan.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center print:justify-start print:gap-4 print:gap-y-8">
          {filteredSiswa.map((siswa) => (
            <KartuPelajar 
              key={siswa.id} 
              siswa={siswa} 
              onClick={() => setSelectedCard(siswa)} 
            />
          ))}
        </div>
      )}

      {/* ── Mobile Modal ── */}
      {selectedCard && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center overflow-hidden md:hidden">
          <button 
            onClick={() => setSelectedCard(null)}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-full">
            <KartuPelajar 
              key={`modal-${selectedCard.id}`}
              siswa={selectedCard} 
              isModal={true} 
              onZoom={(s) => setQrZoomSiswa(s)}
            />
          </div>
        </div>
      )}

      {/* ── QR Zoom Modal ── */}
      {qrZoomSiswa && (
        <div 
          className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-6"
          onClick={() => setQrZoomSiswa(null)}
        >
          <div 
            className="bg-white p-6 rounded-2xl flex flex-col items-center max-w-sm w-full relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setQrZoomSiswa(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F9F4] flex items-center justify-center text-[#6B7769] hover:bg-[#E2E8DE] transition-colors"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-[#1C2517] font-bold mb-5 text-center text-lg leading-tight">
              Scan QR Code
              <br/>
              <span className="text-sm font-normal text-[#6B7769]">{qrZoomSiswa.nama}</span>
            </h3>
            
            <div className="p-3 border-2 border-[#E2E8DE] rounded-xl bg-white shadow-sm mb-6">
              <QRCode
                value={`MADRASAH AL-ITTIHAD|${qrZoomSiswa.nis}|${qrZoomSiswa.nama}`}
                size={220}
                level="M"
              />
            </div>
            
            <button 
              onClick={() => setQrZoomSiswa(null)}
              className="w-full py-2.5 bg-[#3E8A2F] text-white font-semibold rounded-xl hover:bg-[#2E6B22] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── Style CSS Khusus Print ── */}
      <style>{`
        @media print {
          @page {
            margin: 10mm;
            size: A4 portrait;
          }
          body * {
            visibility: hidden;
          }
          .flex-1.overflow-y-auto, .flex-1.overflow-y-auto * {
            visibility: visible;
          }
          .flex-1.overflow-y-auto {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
