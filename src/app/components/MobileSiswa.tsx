import { useState, useMemo } from "react";
import {
  Search, Users, MessageCircle, Phone, Info, X, ChevronDown,
  Eye, Calendar, MapPin, Home, GraduationCap, CheckCircle2,
  Clock, AlertCircle, User, Shield
} from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";
import { SiswaRow } from "@/data/siswa";
import { kelasOptions } from "@/data/constants";

const KELAS_BADGE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "7": { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  "8": { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
  "9": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
};

function formatPhoneForWA(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) return "62" + clean.slice(1);
  if (clean.startsWith("62")) return clean;
  return clean ? "62" + clean : "";
}

export function MobileSiswa() {
  const { siswaList, absensiSiswaHariIni, role } = useAppContext();
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaRow | null>(null);

  // Filter siswa
  const filteredSiswa = useMemo(() => {
    const q = search.trim().toLowerCase();
    return siswaList.filter((s) => {
      // Filter status
      if (statusFilter !== "Semua" && s.status !== statusFilter) return false;

      // Filter kelas
      if (kelasFilter !== "Semua Kelas") {
        const targetKelas = kelasFilter.replace("Kelas ", "");
        if (s.kelas !== targetKelas) return false;
      }

      // Filter pencarian (Nama / NIS / NISN / Wali)
      if (q) {
        const matchNama = s.nama.toLowerCase().includes(q);
        const matchNis = s.nis.toLowerCase().includes(q);
        const matchNisn = (s.nisn || "").toLowerCase().includes(q);
        const matchWali = (s.waliNama || "").toLowerCase().includes(q);
        return matchNama || matchNis || matchNisn || matchWali;
      }

      return true;
    });
  }, [siswaList, search, kelasFilter, statusFilter]);

  // Status counts
  const counts = useMemo(() => {
    let aktif = 0, nonaktif = 0;
    siswaList.forEach(s => {
      if (s.status === "Aktif") aktif++;
      else nonaktif++;
    });
    return { Total: siswaList.length, Aktif: aktif, Nonaktif: nonaktif };
  }, [siswaList]);

  return (
    <div className="flex flex-col gap-3 px-4 py-3 pb-24" style={{ fontFamily: "inherit" }}>
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDF7EC] text-[#3E8A2F] flex items-center justify-center font-bold">
              <Users size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C2517] leading-none">Data Siswa</h2>
              <p className="text-[11px] text-[#6B7769] mt-0.5">Direktori profil & kontak wali siswa</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-0.5 rounded-full shrink-0">
            View-Only
          </span>
        </div>

        {/* Info Banner Mobile */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[11px] text-[#166534] mt-1">
          <Info size={14} className="shrink-0 mt-0.5 text-[#16A34A]" />
          <p className="leading-tight">
            Mode HP difokuskan untuk <strong>mencari data & menghubungi wali murid</strong>. Tambah, edit, dan mutasi siswa dikelola di laptop/PC demi keamanan data.
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col gap-2">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E2E8DE] shadow-xs">
          <Search size={16} className="text-[#9CA3A0] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIS, atau nama wali..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#1C2517] outline-none placeholder:text-[#9CA3A0]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-full text-[#9CA3A0] hover:text-[#1C2517] transition-colors"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns Filter: Kelas & Status */}
        <div className="grid grid-cols-2 gap-2">
          {/* Filter Kelas */}
          <div className="relative">
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-white rounded-xl border border-[#E2E8DE] text-xs font-medium text-[#1C2517] outline-none shadow-xs"
            >
              {kelasOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-white rounded-xl border border-[#E2E8DE] text-xs font-medium text-[#1C2517] outline-none shadow-xs"
            >
              <option value="Semua">Semua Status ({counts.Total})</option>
              <option value="Aktif">Status: Aktif ({counts.Aktif})</option>
              <option value="Nonaktif">Status: Nonaktif ({counts.Nonaktif})</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" />
          </div>
        </div>

        {/* Result Counter */}
        <div className="flex items-center justify-between text-[11px] text-[#6B7769] px-0.5">
          <span>Menampilkan <strong className="text-[#1C2517]">{filteredSiswa.length}</strong> siswa</span>
          {search && <span>Hasil filter "{search}"</span>}
        </div>
      </div>

      {/* ── Student Cards List ── */}
      <div className="flex flex-col gap-2.5">
        {filteredSiswa.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Users size={22} />
            </div>
            <p className="text-sm font-semibold text-[#1C2517]">Siswa Tidak Ditemukan</p>
            <p className="text-xs text-[#6B7769] max-w-xs">
              Tidak ada data siswa yang cocok dengan kata kunci pencarian atau filter kelas yang dipilih.
            </p>
            {(search || kelasFilter !== "Semua Kelas" || statusFilter !== "Semua") && (
              <button
                onClick={() => {
                  setSearch("");
                  setKelasFilter("Semua Kelas");
                  setStatusFilter("Semua");
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#F5F9F4] text-[#3E8A2F] text-xs font-semibold hover:bg-[#E8F2E6] transition-colors border border-[#3E8A2F]"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          filteredSiswa.map((siswa) => {
            const kelasNum = (siswa.kelas || "").charAt(0);
            const badgeStyle = KELAS_BADGE_STYLE[kelasNum] || { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
            const todayAbsensi = absensiSiswaHariIni?.[siswa.nis];
            const waFormatted = formatPhoneForWA(siswa.waliHp);
            const waDefaultText = encodeURIComponent(
              `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali dari ${siswa.nama} (Kelas ${siswa.kelas}), kami dari pihak MTs Al-Ittihad Pedaleman...`
            );

            return (
              <div
                key={siswa.id}
                className="bg-white rounded-xl border border-[#E2E8DE] shadow-xs p-3.5 flex flex-col gap-2.5 transition-all hover:border-[#3E8A2F]/40"
              >
                {/* Header: Photo, Name, Class & Status */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-[#EDF7EC] border border-[#E2E8DE] shrink-0">
                    <img
                      src={siswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'}
                      alt={siswa.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[13px] font-bold text-[#1C2517] truncate leading-tight">
                        {siswa.nama}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border"
                        style={{
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.text,
                          borderColor: badgeStyle.border,
                        }}
                      >
                        Kelas {siswa.kelas}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#6B7769] font-medium tabular-nums">
                        NIS: {siswa.nis}
                      </span>
                      {siswa.nisn && (
                        <>
                          <span className="text-[10px] text-[#9CA3A0]">•</span>
                          <span className="text-[11px] text-[#6B7769] tabular-nums">
                            NISN: {siswa.nisn}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub info: Wali & Today's Attendance status */}
                <div className="bg-[#FAFBF9] rounded-lg p-2 border border-[#F0F7EE] flex items-center justify-between text-xs gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#6B7769]">Wali Murid:</span>
                    <span className="font-semibold text-[#1C2517] truncate">
                      {siswa.waliNama || "—"} {siswa.waliHp ? `(${siswa.waliHp})` : ""}
                    </span>
                  </div>

                  {/* Today attendance badge */}
                  <div className="shrink-0 flex flex-col items-end">
                    <span className="text-[10px] text-[#6B7769]">Presensi Hari Ini:</span>
                    {todayAbsensi ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          todayAbsensi.status === "Hadir"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : todayAbsensi.status === "Terlambat"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : todayAbsensi.status === "Alpa"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#DBEAFE] text-[#1E40AF]"
                        }`}
                      >
                        {todayAbsensi.status} ({todayAbsensi.jam || "—"})
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#9CA3A0] bg-neutral-100 px-2 py-0.5 rounded-full">
                        Belum Absen
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Call, WA, Detail */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#F0F7EE]">
                  {/* Tombol WhatsApp */}
                  {siswa.waliHp ? (
                    <a
                      href={`https://wa.me/${waFormatted}?text=${waDefaultText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-bold transition-colors"
                      title="Kirim pesan WhatsApp ke wali"
                    >
                      <MessageCircle size={14} className="text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-neutral-100 text-neutral-400 text-xs font-semibold cursor-not-allowed"
                    >
                      <MessageCircle size={14} />
                      <span>No WA</span>
                    </button>
                  )}

                  {/* Tombol Telepon */}
                  {siswa.waliHp ? (
                    <a
                      href={`tel:${siswa.waliHp}`}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                      title="Panggil nomor wali"
                    >
                      <Phone size={13} />
                      <span>Telepon</span>
                    </a>
                  ) : null}

                  {/* Tombol Detail Profil */}
                  <button
                    onClick={() => setSelectedSiswa(siswa)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#F5F9F4] hover:bg-[#E8F2E6] text-[#3E8A2F] text-xs font-bold transition-colors border border-[#D4EDD0]"
                    title="Lihat profil lengkap siswa"
                  >
                    <Eye size={13} />
                    <span>Detail</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Detail Siswa (Read-Only Drawer/Sheet) ── */}
      {selectedSiswa && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-[#E2E8DE] animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8DE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EDF7EC] border border-[#E2E8DE] shrink-0">
                  <img
                    src={selectedSiswa.jk === 'L' ? '/foto_L.png' : '/foto_P.png'}
                    alt={selectedSiswa.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C2517] leading-tight">
                    {selectedSiswa.nama}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#6B7769]">NIS: {selectedSiswa.nis}</span>
                    <span className="text-[10px] text-[#9CA3A0]">•</span>
                    <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Kelas {selectedSiswa.kelas}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSiswa(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Informasi Lengkap */}
            <div className="py-4 space-y-4">
              {/* Kontak Wali Utama */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-[#166534] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone size={13} /> Kontak Orang Tua / Wali
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7769]">Nama Wali:</span>
                    <span className="font-bold text-[#1C2517]">{selectedSiswa.waliNama || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7769]">Nomor HP:</span>
                    <span className="font-bold text-[#1C2517] tabular-nums">{selectedSiswa.waliHp || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7769]">Nama Ayah:</span>
                    <span className="font-medium text-[#1C2517]">{selectedSiswa.namaAyah || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7769]">Nama Ibu:</span>
                    <span className="font-medium text-[#1C2517]">{selectedSiswa.namaIbu || "—"}</span>
                  </div>
                </div>

                {selectedSiswa.waliHp && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`https://wa.me/${formatPhoneForWA(selectedSiswa.waliHp)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle size={14} />
                      <span>Chat WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${selectedSiswa.waliHp}`}
                      className="py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Phone size={13} />
                      <span>Telepon</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Data Pribadi */}
              <div className="bg-[#FAFBF9] border border-[#E2E8DE] rounded-xl p-3.5 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-[#1C2517] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-[#3E8A2F]" /> Data Pribadi Siswa
                </p>
                <div className="flex justify-between border-b border-[#F0F7EE] pb-1.5">
                  <span className="text-[#6B7769]">NISN:</span>
                  <span className="font-medium text-[#1C2517] tabular-nums">{selectedSiswa.nisn || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#F0F7EE] pb-1.5">
                  <span className="text-[#6B7769]">Jenis Kelamin:</span>
                  <span className="font-medium text-[#1C2517]">
                    {selectedSiswa.jk === "L" ? "Laki-laki" : "Perempuan"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0F7EE] pb-1.5">
                  <span className="text-[#6B7769]">Tempat, Tgl Lahir:</span>
                  <span className="font-medium text-[#1C2517] text-right">
                    {selectedSiswa.tempatLahir ? `${selectedSiswa.tempatLahir}, ` : ""}
                    {selectedSiswa.tanggalLahir || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0F7EE] pb-1.5">
                  <span className="text-[#6B7769]">Status Siswa:</span>
                  <span className="font-bold text-[#166534]">{selectedSiswa.status}</span>
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[#6B7769] mb-1">Alamat Tinggal:</span>
                  <span className="font-medium text-[#1C2517] leading-relaxed">
                    {selectedSiswa.alamat || "—"}
                    {selectedSiswa.kelurahan ? `, Kel. ${selectedSiswa.kelurahan}` : ""}
                    {selectedSiswa.kecamatan ? `, Kec. ${selectedSiswa.kecamatan}` : ""}
                  </span>
                </div>
              </div>

              {/* Status Pembayaran SPP / Tagihan (Jika Role Admin / Bendahara) */}
              {(role === "Admin" || role === "Bendahara") && (
                <div className="bg-[#FAFBF9] border border-[#E2E8DE] rounded-xl p-3.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#6B7769] block">Status Tagihan SPP:</span>
                    <span
                      className={`font-bold ${
                        selectedSiswa.statusTagihan === "Lunas"
                          ? "text-[#166534]"
                          : "text-[#B91C1C]"
                      }`}
                    >
                      {selectedSiswa.statusTagihan}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B7769] bg-white px-2 py-1 rounded border border-[#E2E8DE]">
                    Khusus Keuangan
                  </span>
                </div>
              )}
            </div>

            {/* Tombol Tutup */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedSiswa(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1C2517] text-xs font-bold transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
