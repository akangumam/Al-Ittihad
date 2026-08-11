import { useState, useMemo, useRef, useCallback } from "react";
import QRCode from "react-qr-code";
import { Printer, Search, ChevronDown, X, ZoomIn, Download, MessageCircle } from "lucide-react";
import logoEmblem from "../../imports/aliet_logo.png";
import { useAppContext } from "@/context/AppContext";
import { kelasOptions } from "@/data/constants";
import { defaultSettings } from "@/data/settings";
import type { GuruRow } from "@/data/guru";

// ─── Utility: Export elemen kartu sebagai PNG (tanpa library) ───────────────
// Pendekatan: serialize QR sebagai SVG data URL, gambar logo via <img>
// Lalu gabungkan di canvas untuk disimpan sebagai PNG
async function exportQrAsPng(qrValue: string, nama: string, nis: string, fileName: string, themeColor: string, role: "siswa" | "guru"): Promise<void> {
  const SIZE = 600;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Header bar
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, 0, SIZE, 80);

  // Header text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(defaultSettings.namaMadrasah, SIZE / 2, 38);
  ctx.font = "16px Arial";
  ctx.fillText(`Kartu ${role === "siswa" ? "Identitas Siswa" : "Identitas Pegawai"}`, SIZE / 2, 64);

  // Name
  ctx.fillStyle = "#1C2517";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(nama, SIZE / 2, 130);

  // NIS / ID
  ctx.fillStyle = "#6B7769";
  ctx.font = "18px Arial";
  ctx.fillText(nis, SIZE / 2, 160);

  // QR area label
  ctx.fillStyle = "#9CA3A0";
  ctx.font = "14px Arial";
  ctx.fillText("QR Code Absensi", SIZE / 2, 200);

  // Render QR as SVG then draw to canvas
  const svgEl = document.querySelector(".export-qr-target svg") as SVGElement | null;
  if (svgEl) {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, SIZE / 2 - 150, 215, 300, 300);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  // Footer
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, SIZE - 50, SIZE, 50);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Gunakan QR ini untuk presensi elektronik", SIZE / 2, SIZE - 20);

  // Border
  ctx.strokeStyle = "#E2E8DE";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);

  // Download
  const link = document.createElement("a");
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Komponen Kartu Pelajar ───────────────────────────────────────────────────
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
      style={{ border: "1px solid #E2E8DE", breakInside: "avoid", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="bg-[#3E8A2F] w-full flex flex-col items-center pt-5 pb-16 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('/card_pattern.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className={`relative z-10 rounded-full bg-white flex items-center justify-center p-1 ${isModal ? 'w-14 h-14' : 'w-12 h-12'} mb-2 shadow-sm`}>
          <img src={logoEmblem} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h3 className={`relative z-10 text-white font-bold tracking-wide text-center leading-tight ${isModal ? 'text-[13px]' : 'text-[11px]'}`}>
          {defaultSettings.namaMadrasah.toUpperCase()}
        </h3>
        <p className={`relative z-10 text-white/90 text-center mt-0.5 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Kartu Identitas Siswa - TP {tahunAjaran}</p>
      </div>

      <div className={`bg-gray-100 border-[3px] border-white shadow-sm rounded-xl overflow-hidden shrink-0 absolute ${isModal ? 'w-[96px] h-[128px] top-[125px]' : 'w-[84px] h-[112px] top-[105px]'} left-1/2 -translate-x-1/2 z-20`}>
        <img src={siswa.foto || (siswa.jk === "L" ? "/foto_L.png" : "/foto_P.png")} alt={`Foto ${siswa.nama}`} className="w-full h-full object-cover" />
      </div>

      <div className={`${isModal ? 'h-[90px]' : 'h-[75px]'} shrink-0`} />

      <div className="w-full flex flex-col items-center px-4 mt-1 shrink-0">
        <h4 className={`font-bold text-[#1C2517] leading-tight text-center mb-1.5 w-full line-clamp-2 ${isModal ? 'text-lg' : 'text-[15px]'}`}>
          {siswa.nama}
        </h4>
        <div className={`text-[#6B7769] font-medium text-center ${isModal ? 'text-xs' : 'text-[10px]'}`}>
          NIS: {siswa.nis} • Kelas {siswa.kelas}
        </div>
      </div>

      <div className={`w-full flex flex-col items-center justify-center gap-2 mt-auto ${isModal ? 'pb-5' : 'pb-4'} shrink-0`}>
        <div 
          className={`relative p-1 bg-white border border-[#E2E8DE] rounded-lg shrink-0 shadow-sm ${isModal ? 'cursor-pointer group' : ''}`}
          onClick={(e) => { if (isModal && onZoom) { e.stopPropagation(); onZoom(siswa); } }}
          title={isModal ? "Perbesar QR Code" : undefined}
        >
          <QRCode
            value={`MADRASAH AL-ITTIHAD|${siswa.nis}|${siswa.nama}`}
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

      <div className={`w-full bg-[#3E8A2F] text-center shrink-0 ${isModal ? 'py-2' : 'py-1.5'}`}>
        <p className={`text-white/90 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Berlaku selama menjadi siswa</p>
      </div>
    </div>
  );
}

// ─── Komponen Kartu Guru ──────────────────────────────────────────────────────
export function KartuGuru({
  guru,
  isModal = false,
  onZoom,
  onClick,
}: {
  guru: GuruRow;
  isModal?: boolean;
  onZoom?: (g: GuruRow) => void;
  onClick?: () => void;
}) {
  const { tahunAjaran } = useAppContext();
  const themeColor = "#1E3A8A"; // Biru Tua untuk staf/guru

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden relative flex flex-col items-center ${
        isModal 
          ? 'shadow-2xl w-[90vw] max-w-[300px] h-[480px] mx-auto' 
          : 'w-[240px] h-[382px] shadow-sm print:shadow-none print:border-gray-300 cursor-pointer transition-transform hover:scale-[1.02]'
      }`}
      style={{ border: "1px solid #E2E8DE", breakInside: "avoid", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="w-full flex flex-col items-center pt-5 pb-16 shrink-0 relative overflow-hidden" style={{ background: themeColor }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('/card_pattern.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className={`relative z-10 rounded-full bg-white flex items-center justify-center p-1 ${isModal ? 'w-14 h-14' : 'w-12 h-12'} mb-2 shadow-sm`}>
          <img src={logoEmblem} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h3 className={`relative z-10 text-white font-bold tracking-wide text-center leading-tight ${isModal ? 'text-[13px]' : 'text-[11px]'}`}>
          {defaultSettings.namaMadrasah.toUpperCase()}
        </h3>
        <p className={`relative z-10 text-white/90 text-center mt-0.5 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Kartu Identitas Pegawai - TP {tahunAjaran}</p>
      </div>

      <div className={`bg-gray-100 border-[3px] border-white shadow-sm rounded-xl overflow-hidden shrink-0 absolute ${isModal ? 'w-[96px] h-[128px] top-[125px]' : 'w-[84px] h-[112px] top-[105px]'} left-1/2 -translate-x-1/2 z-20 flex items-center justify-center`}>
        <img src={guru.jk === "L" ? "/foto_L.png" : "/foto_P.png"} alt={`Foto ${guru.nama}`} className="w-full h-full object-cover" />
      </div>

      <div className={`${isModal ? 'h-[90px]' : 'h-[75px]'} shrink-0`} />

      <div className="w-full flex flex-col items-center px-4 mt-1 shrink-0">
        <h4 className={`font-bold text-[#1C2517] leading-tight text-center mb-1.5 w-full line-clamp-2 ${isModal ? 'text-lg' : 'text-[15px]'}`}>
          {guru.nama}
        </h4>
        <div className={`text-[#6B7769] font-medium text-center ${isModal ? 'text-xs' : 'text-[10px]'}`}>
          NUPTK: {guru.nuptk || "-"} • {guru.statusKepeg}
        </div>
      </div>

      <div className={`w-full flex flex-col items-center justify-center gap-2 mt-auto ${isModal ? 'pb-5' : 'pb-4'} shrink-0`}>
        <div 
          className={`relative p-1 bg-white border border-[#E2E8DE] rounded-lg shrink-0 shadow-sm ${isModal ? 'cursor-pointer group' : ''}`}
          onClick={(e) => { if (isModal && onZoom) { e.stopPropagation(); onZoom(guru); } }}
          title={isModal ? "Perbesar QR Code" : undefined}
        >
          <QRCode
            value={`MADRASAH AL-ITTIHAD|${guru.id}|${guru.nama}`}
            size={isModal ? 64 : 56}
            level="M"
          />
          {isModal && (
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border border-[#E2E8DE] shadow-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: themeColor }}>
              <ZoomIn size={12} />
            </div>
          )}
        </div>
        <p className={`font-medium text-[#374040] tracking-widest ${isModal ? 'text-[11px]' : 'text-[9px]'}`}>
          {`Guru ${(guru.mapel || []).join(" & ") || "—"}${guru.waliKelas ? ` & WK ${guru.waliKelas}` : ""}`}
        </p>
      </div>

      <div className={`w-full text-center shrink-0 ${isModal ? 'py-2' : 'py-1.5'}`} style={{ background: themeColor }}>
        <p className={`text-white/90 ${isModal ? 'text-[10px]' : 'text-[8px]'}`}>Gunakan untuk presensi elektronik</p>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export function KartuDigital() {
  const { siswaList, guruList } = useAppContext();
  const [activeTab, setActiveTab] = useState<"siswa" | "guru">("siswa");
  const [filterDropdown, setFilterDropdown] = useState("Semua");
  const [search, setSearch] = useState("");
  
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [qrZoomData, setQrZoomData] = useState<any | null>(null);

  // Jika berpindah tab, kembalikan filter ke "Semua"
  const switchTab = (t: "siswa" | "guru") => {
    setActiveTab(t);
    setFilterDropdown("Semua");
    setSearch("");
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === "siswa") {
      return siswaList.filter((s) => {
        const matchSearch = !q || s.nama.toLowerCase().includes(q) || s.nis.includes(q);
        const matchDropdown = filterDropdown === "Semua" || s.kelas === filterDropdown.replace("Kelas ", "");
        return matchSearch && matchDropdown;
      });
    } else {
      return guruList.filter((g) => {
        const matchSearch = !q || g.nama.toLowerCase().includes(q) || (g.nuptk && g.nuptk.includes(q));
        const matchDropdown = filterDropdown === "Semua" || g.statusKepeg === filterDropdown;
        return matchSearch && matchDropdown;
      });
    }
  }, [siswaList, guruList, activeTab, search, filterDropdown]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-0 pb-20 md:pb-0 relative">
      {/* ── Header & Toolbar (Sembunyikan saat print) ── */}
      <div className="print:hidden relative md:sticky md:-top-6 md:-mt-6 md:pt-8 z-30 bg-[#FAFBF9]/95 backdrop-blur-md -mx-4 px-4 pt-4 pb-4 md:px-0 md:mx-0 md:pb-4 mb-6 flex flex-col border-b border-[#E2E8DE]/50">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[#1C2517] text-2xl font-bold">Kartu Digital</h2>
            <p className="text-sm text-[#6B7769]">Kartu identitas dengan QR Code siap cetak</p>
          </div>

          <div className="inline-flex rounded-lg p-1 bg-[#E2E8DE]/40">
            {(["siswa", "guru"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={[
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition-all capitalize",
                  activeTab === t ? "bg-white text-[#1C2517]" : "text-[#6B7769] hover:text-[#374040]",
                ].join(" ")}
                style={activeTab === t ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : undefined}
              >
                Kartu {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 sm:max-w-xs bg-white" style={{ border: "1px solid #E2E8DE" }}>
            <Search size={14} className="text-[#9CA3A0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari nama${activeTab === "siswa" ? " atau NIS" : " atau NUPTK"}...`}
              className="bg-transparent outline-none text-sm text-[#1C2517] w-full"
            />
          </div>

          <div className="relative">
            <select
              value={filterDropdown}
              onChange={(e) => setFilterDropdown(e.target.value)}
              className="appearance-none bg-white pl-3 pr-8 py-2 rounded-lg text-sm text-[#374040] outline-none"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <option value="Semua">Semua {activeTab === "siswa" ? "Kelas" : "Status"}</option>
              {activeTab === "siswa" 
                ? kelasOptions.map((o) => <option key={o} value={o}>{o}</option>)
                : ["PNS", "GTY", "Honorer"].map((o) => <option key={o} value={o}>{o}</option>)
              }
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
      {filteredData.length === 0 ? (
        <div className="print:hidden flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E2E8DE]">
          <p className="text-[#6B7769]">Data tidak ditemukan.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center print:justify-start print:gap-4 print:gap-y-8">
          {filteredData.map((item: any) => (
            activeTab === "siswa" ? (
              <KartuPelajar key={item.id} siswa={item} onClick={() => setSelectedCard(item)} />
            ) : (
              <KartuGuru key={item.id} guru={item} onClick={() => setSelectedCard(item)} />
            )
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
            {activeTab === "siswa" ? (
              <KartuPelajar key={`modal-s-${selectedCard.id}`} siswa={selectedCard} isModal={true} onZoom={(s) => setQrZoomData(s)} />
            ) : (
              <KartuGuru key={`modal-g-${selectedCard.id}`} guru={selectedCard} isModal={true} onZoom={(g) => setQrZoomData(g)} />
            )}
          </div>
        </div>
      )}

      {/* ── QR Zoom Modal ── */}
      {qrZoomData && (
        <div 
          className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-6"
          onClick={() => setQrZoomData(null)}
        >
          <div 
            className="bg-white p-6 rounded-2xl flex flex-col items-center max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setQrZoomData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F9F4] flex items-center justify-center text-[#6B7769] hover:bg-[#E2E8DE] transition-colors"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-[#1C2517] font-bold mb-1 text-center text-lg leading-tight">
              QR Code Absensi
            </h3>
            <p className="text-sm text-[#6B7769] mb-4 text-center">{qrZoomData.nama}</p>
            
            {/* QR Container — diberi class khusus agar bisa di-capture */}
            <div className="export-qr-target p-4 border-2 border-[#E2E8DE] rounded-xl bg-white shadow-sm mb-5">
              <QRCode
                value={`MADRASAH AL-ITTIHAD|${activeTab === "siswa" ? qrZoomData.nis : qrZoomData.id}|${qrZoomData.nama}`}
                size={220}
                level="M"
              />
            </div>

            {/* ID / NIS */}
            <p className="text-[#374040] font-mono font-semibold tracking-widest text-sm mb-5">
              {activeTab === "siswa" ? `NIS: ${qrZoomData.nis}` : `ID: ${qrZoomData.id}`}
            </p>
            
            {/* Action buttons */}
            <div className="w-full flex flex-col gap-2">
              {/* Simpan PNG */}
              <button
                onClick={() => {
                  const qrVal = `MADRASAH AL-ITTIHAD|${activeTab === "siswa" ? qrZoomData.nis : qrZoomData.id}|${qrZoomData.nama}`;
                  const idStr = activeTab === "siswa" ? qrZoomData.nis : String(qrZoomData.id);
                  const color = activeTab === "siswa" ? "#3E8A2F" : "#1E3A8A";
                  exportQrAsPng(qrVal, qrZoomData.nama, idStr, `qr-${qrZoomData.nama.replace(/\s+/g,"-")}`, color, activeTab);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-white font-semibold rounded-xl transition-colors ${
                  activeTab === "siswa" ? "bg-[#3E8A2F] hover:bg-[#2E6B22]" : "bg-[#1E3A8A] hover:bg-[#1E40AF]"
                }`}
              >
                <Download size={16} />
                Simpan Gambar (PNG)
              </button>

              {/* Kirim via WA */}
              {(activeTab === "siswa" ? qrZoomData.waliHp : qrZoomData.hp) && (
                <button
                  onClick={() => {
                    const hp = (activeTab === "siswa" ? qrZoomData.waliHp : qrZoomData.hp)?.replace(/\D/g, "");
                    const pesan = activeTab === "siswa"
                      ? `Assalamu'alaikum, berikut adalah *Kartu Digital* (QR Absensi) untuk *${qrZoomData.nama}* (NIS: ${qrZoomData.nis}).\n\nSilakan simpan QR ini di HP dan tunjukkan kepada petugas gerbang setiap hari saat masuk madrasah.\n\n_Madrasah ${defaultSettings.namaMadrasah}_`
                      : `Assalamu'alaikum Ust/Ibu *${qrZoomData.nama}*, berikut adalah QR Code absensi Anda.\n\nSilakan simpan dan tunjukkan kepada petugas gerbang setiap hari.\n\n_${defaultSettings.namaMadrasah}_`;
                    window.open(`https://wa.me/${hp}?text=${encodeURIComponent(pesan)}`, "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1EB857] transition-colors"
                >
                  <MessageCircle size={16} />
                  Kirim via WhatsApp
                </button>
              )}

              <button 
                onClick={() => setQrZoomData(null)}
                className="w-full py-2 text-[#6B7769] font-medium rounded-xl hover:bg-[#F5F9F4] transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
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
