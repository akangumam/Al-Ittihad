import { useState, useEffect } from "react";
import { Search, Check, ChevronDown, X, MessageCircle, Printer } from "lucide-react";
import { useSearchParams } from "react-router";
import { fmt, fmtNum } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/components/ui/dialog";

import { useAppContext } from "@/context/AppContext";
import { KAS_BANK_LIST, METODE_PEMBAYARAN_LIST } from "@/data/pembayaran";

// ─── allocation logic ─────────────────────────────────────────────────────────

function computeAlokasi(nominal: number, tagihanSiswa: any[]) {
  let rem = nominal;
  // Sort tagihan by prioritas (kecil = utama), if same then by jatuhTempo (earliest first)
  const sortedTagihan = [...tagihanSiswa].sort((a, b) => {
    const prioA = a.prioritas ?? 999;
    const prioB = b.prioritas ?? 999;
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.jatuhTempo).getTime() - new Date(b.jatuhTempo).getTime();
  });
  
  return sortedTagihan.map((t) => {
    const sisaTagihan = t.nominal - t.terbayar;
    const alloc = Math.min(rem, sisaTagihan);
    rem -= alloc;
    return { ...t, alloc, lunas: alloc > 0 && alloc >= sisaTagihan };
  });
}

// ─── form components ──────────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const up = focused || value.length > 0 || type === "date";

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          "w-full px-4 rounded-lg bg-white text-[#1C2517] outline-none transition-all text-sm",
          up ? "pt-6 pb-2" : "pt-4 pb-4",
        ].join(" ")}
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        }}
      />
      <label
        htmlFor={id}
        className={[
          "absolute left-4 pointer-events-none transition-all duration-150",
          up
            ? "top-1.5 text-[10px] text-[#6B7769]"
            : "top-4 text-sm text-[#9CA3A0]",
        ].join(" ")}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2 pr-9 rounded-lg bg-white text-[#1C2517] text-sm appearance-none outline-none transition-all"
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-4 top-1.5 text-[10px] text-[#6B7769] pointer-events-none"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
      />
    </div>
  );
}

// ─── receipt dialog ───────────────────────────────────────────────────────────

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNextTransaction?: () => void;
  student: { nama: string; nis: string; kelas: string; waliNama: string; waliHp: string; inits?: string };
  nominal: number;
  tanggal: string;
  metode: string;
  nomorKuitansi: string;
  alokasi: Array<{ kategori: string; alloc: number; lunas: boolean }>;
  tahunAjaran: string;
  namaMadrasah: string;
}

function ReceiptDialog({
  open, onOpenChange, onNextTransaction, student, nominal, tanggal, metode, nomorKuitansi, alokasi, tahunAjaran, namaMadrasah
}: ReceiptDialogProps) {
  const waNumber = student.waliHp.replace(/\D/g, "").replace(/^0/, "62");
  const waLines = [
    `Assalamu'alaikum Bapak/Ibu ${student.waliNama},`,
    ``,
    `Berikut kuitansi pembayaran TA ${tahunAjaran}:`,
    ``,
    `No. Kuitansi : ${nomorKuitansi}`,
    `Siswa        : ${student.nama} (Kelas ${student.kelas})`,
    `Nominal      : ${fmt(nominal)}`,
    `Tanggal      : ${tanggal}`,
    `Metode       : ${metode}`,
    ``,
    `Rincian Alokasi:`,
    ...alokasi
      .filter((a) => a.alloc > 0)
      .map((a) => `• ${a.kategori}: ${fmt(a.alloc)}${a.lunas ? " (LUNAS)" : ""}`),
    ``,
    `Terima kasih atas kepercayaan Bapak/Ibu.`,
    namaMadrasah,
  ];
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waLines.join("\n"))}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-8">
        <DialogTitle className="sr-only">Pembayaran Tercatat</DialogTitle>

        <div className="flex flex-col items-center text-center">
          {/* Green check */}
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
            <Check size={30} className="text-[#3E8A2F]" />
          </div>

          <p className="font-bold text-[#1C2517] mb-1" style={{ fontSize: "1.125rem" }}>
            Pembayaran Tercatat
          </p>
          <p className="text-xs text-[#9CA3A0] mb-6">
            No. Kuitansi{" "}
            <span className="font-mono font-semibold text-[#374040]">{nomorKuitansi}</span>
          </p>

          {/* Summary block */}
          <div
            className="w-full rounded-xl p-4 mb-5 text-left space-y-2.5"
            style={{ background: "#F5F9F4" }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Siswa</span>
              <span className="font-semibold text-[#1C2517]">{student.nama}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Nominal</span>
              <span className="font-bold text-[#3E8A2F] tabular-nums">{fmt(nominal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Tanggal</span>
              <span className="font-semibold text-[#1C2517]">{tanggal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7769]">Metode</span>
              <span className="font-semibold text-[#1C2517]">{metode}</span>
            </div>
          </div>

          {/* Allocation recap */}
          <div className="w-full mb-6 text-left">
            <p className="text-[10px] font-medium text-[#9CA3A0] uppercase tracking-wide mb-2">
              Alokasi Pembayaran
            </p>
            {alokasi.filter((a) => a.alloc > 0).map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-2"
                style={{ borderBottom: "1px solid #F0F7EE" }}
              >
                <span className="text-[#374040]">{item.kategori}</span>
                <span className="tabular-nums text-[#374040]">{fmt(item.alloc)}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full space-y-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-lg bg-[#3E8A2F] text-white font-semibold text-sm hover:bg-[#2E6B22] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Kirim Kuitansi via WA
            </a>
            <button
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#FAFBF9] transition-colors flex items-center justify-center gap-2"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <Printer size={15} />
              Cetak Kuitansi
            </button>
            <button
              onClick={() => {
                onOpenChange(false);
                if (onNextTransaction) onNextTransaction();
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#6B7769] hover:text-[#374040] transition-colors"
            >
              Transaksi Berikutnya
            </button>
          </div>

          <p className="text-xs text-[#9CA3A0] mt-4">
            Dikirim ke {student.waliNama} — {student.waliHp}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── page component ───────────────────────────────────────────────────────────

export function Pembayaran() {
  const { siswaList, tagihanList, addTransaksi, appSettings } = useAppContext();
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get("siswaId") ? Number(searchParams.get("siswaId")) : null;
  
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudentId);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);
  
  const [nominal, setNominal] = useState(0);
  const [metode, setMetode] = useState(METODE_PEMBAYARAN_LIST[0] || "Tunai");
  const [akun, setAkun] = useState(KAS_BANK_LIST[0]?.nama || "Kas Tunai");
  const today = new Date();
  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [tanggal, setTanggal] = useState(formattedToday);
  const [catatan, setCatatan] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTx, setLastTx] = useState<any>(null);

  const [isManual, setIsManual] = useState(false);
  const [manualAlloc, setManualAlloc] = useState<Record<string, number>>({});

  // Derived state for Search Results
  const searchResults = query.trim() === "" ? [] : siswaList.filter(s => 
    s.status === "Aktif" && 
    (s.nama.toLowerCase().includes(query.toLowerCase()) || s.nis.includes(query))
  ).slice(0, 5);

  const rawSelectedStudent = selectedStudentId ? siswaList.find(s => s.id === selectedStudentId) : null;
  
  // Derived state for the selected student's bills
  const studentTagihans = rawSelectedStudent ? tagihanList.filter(t => t.nis === rawSelectedStudent.nis) : [];
  const totalTagihan = studentTagihans.reduce((sum, t) => sum + t.nominal, 0);
  const totalDibayar = studentTagihans.reduce((sum, t) => sum + t.terbayar, 0);
  const totalSisa = totalTagihan - totalDibayar;

  const selectedStudent = rawSelectedStudent ? {
    ...rawSelectedStudent,
    totalTagihan,
    dibayar: totalDibayar,
    sisa: totalSisa,
  } : null;

  const alokasi = isManual
    ? studentTagihans.map(t => ({
        ...t,
        alloc: manualAlloc[t.id] || 0,
        lunas: (manualAlloc[t.id] || 0) >= (t.nominal - t.terbayar)
      }))
    : (studentTagihans ? computeAlokasi(nominal, studentTagihans) : []);
    
  const sisaSetelah = selectedStudent ? Math.max(0, selectedStudent.sisa - nominal) : 0;
  
  const handleCatatPembayaran = () => {
    if (!rawSelectedStudent || nominal <= 0) return;
    
    // Create new transaction
    const newTx = {
      id: "TX-" + Date.now(),
      nis: rawSelectedStudent.nis,
      tanggal: new Date().toISOString(), // Use real ISO string for storing
      nominal,
      metode,
      nomorKuitansi: "KWT-" + Date.now().toString().slice(-6),
      alokasi: alokasi.filter(a => a.alloc > 0).map(a => ({
        tagihanId: a.id,
        nominalAlokasi: a.alloc,
        namaTagihan: a.namaTagihan
      }))
    };
    
    // Create updated tagihans for context
    const updatedTagihans = alokasi.filter(a => a.alloc > 0).map(a => ({
      ...tagihanList.find(t => t.id === a.id)!,
      terbayar: a.terbayar + a.alloc,
      isLunas: (a.terbayar + a.alloc) >= a.nominal
    }));
    
    addTransaksi(newTx, updatedTagihans);
    setLastTx(newTx);
    setShowSuccess(true);
  };

  const handleNominalChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setNominal(parseInt(digits) || 0);
  };

  const resetForm = () => {
    setQuery("");
    setSelectedStudentId(null);
    setNominal(0);
    setCatatan("");
    setIsManual(false);
    setManualAlloc({});
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Page heading */}
      <div className="mb-5">
        <h2 className="text-[#1C2517]">Pembayaran</h2>
        <p className="text-sm text-[#6B7769]">Catat pembayaran siswa</p>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4 min-w-0">

          {/* 1 · Student search combobox */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8DE" }}>
            <div className="relative">
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg"
                style={{ border: "1.5px solid #3E8A2F", background: "#FAFBF9" }}
              >
                <Search size={15} className="text-[#6B7769] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  className="flex-1 bg-transparent outline-none text-[#1C2517] text-sm"
                  placeholder="Ketik nama atau NIS siswa..."
                />
                {query && (
                  <button
                    onMouseDown={() => { setQuery(""); setDropdownOpen(true); }}
                    className="ml-1 text-[#9CA3A0] hover:text-[#374040] transition-colors"
                    tabIndex={-1}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl z-30 overflow-hidden"
                  style={{ border: "1px solid #E2E8DE" }}
                >
                  {searchResults.map((s, i) => (
                    <button
                      key={s.id}
                      onMouseDown={() => {
                        setQuery(s.nama);
                        setSelectedStudentId(s.id);
                        // setNominal(400_000); // we will leave it empty initially
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EDF7EC] transition-colors text-left"
                      style={{
                        background: i === 0 ? "#EDF7EC" : undefined,
                        borderBottom:
                          i < searchResults.length - 1
                            ? "1px solid #F0F7EE"
                            : undefined,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {s.inits}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C2517] truncate">
                          {s.nama}
                        </p>
                        <p className="text-xs text-[#6B7769]">
                          {s.nis} · Kelas {s.kelas}
                        </p>
                      </div>
                      {(() => {
                        const rTagihans = tagihanList.filter(t => t.nis === s.nis);
                        const rSisa = rTagihans.reduce((sum, t) => sum + (t.nominal - t.terbayar), 0);
                        return rSisa > 0 ? (
                          <span className="text-xs font-semibold tabular-nums text-[#DC2626] ml-3 shrink-0">
                            {fmt(rSisa)}
                          </span>
                        ) : null;
                      })()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2 · Student context card + bill table */}
          {selectedStudent ? (
            <>
            <div
              className="bg-white rounded-xl p-6 space-y-5"
              style={{ border: "1px solid #E2E8DE" }}
            >
            {/* Student info */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {rawSelectedStudent?.inits}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1C2517]">{selectedStudent?.nama}</p>
                <p className="text-sm text-[#6B7769]">
                  Kelas {selectedStudent?.kelas} · NIS {selectedStudent?.nis}
                </p>
                <p className="text-xs text-[#6B7769] mt-0.5">
                  <span className="font-medium">Wali:</span> {selectedStudent?.waliNama} —{" "}
                  {selectedStudent?.waliHp}
                </p>
              </div>
            </div>

            {/* Summary row */}
            <div
              className="grid grid-cols-3 rounded-xl overflow-hidden"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {[
                { label: "Total Tagihan", value: selectedStudent.totalTagihan, red: false },
                { label: "Dibayar", value: selectedStudent.dibayar, red: false },
                { label: "Sisa", value: selectedStudent.sisa, red: true },
              ].map((col, ci) => (
                <div
                  key={ci}
                  className="px-4 py-3"
                  style={{
                    background: col.red ? "#FFF5F5" : "#FAFBF9",
                    borderRight: ci < 2 ? "1px solid #E2E8DE" : undefined,
                  }}
                >
                  <p className="text-[10px] font-semibold text-[#6B7769] uppercase tracking-wide mb-1">
                    {col.label}
                  </p>
                  <p
                    className={`tabular-nums font-bold ${
                      col.red
                        ? "text-[#DC2626] text-base"
                        : "text-[#1C2517] text-sm"
                    }`}
                  >
                    {fmt(col.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Bill table */}
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-widest mb-3">
                Tagihan Belum Lunas
              </p>
              <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 8 }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                      <th className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3 w-10">
                        Prio
                      </th>
                      <th className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                        Kategori
                      </th>
                      <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                        Total
                      </th>
                      <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5 pr-3">
                        Dibayar
                      </th>
                      <th className="text-right text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide pb-2.5">
                        Sisa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentTagihans.filter(t => t.nominal - t.terbayar > 0)
                      .sort((a, b) => {
                        const prioA = a.prioritas ?? 999;
                        const prioB = b.prioritas ?? 999;
                        if (prioA !== prioB) return prioA - prioB;
                        return new Date(a.jatuhTempo).getTime() - new Date(b.jatuhTempo).getTime();
                      })
                      .map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#FAFBF9] transition-colors"
                        style={{
                          borderBottom:
                            i < studentTagihans.filter(t => t.nominal - t.terbayar > 0).length - 1
                              ? "1px solid #F0F7EE"
                              : undefined,
                        }}
                      >
                        <td className="py-3 pr-3">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EDF7EC] text-[#3E8A2F] text-[10px] font-bold">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-sm font-medium text-[#1C2517]">
                          {row.namaTagihan}
                        </td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-[#1C2517] text-right">
                          {fmt(row.nominal)}
                        </td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-[#6B7769] text-right">
                          {fmt(row.terbayar)}
                        </td>
                        <td className="py-3 text-sm tabular-nums font-semibold text-[#DC2626] text-right">
                          {fmt(row.nominal - row.terbayar)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-10 flex flex-col items-center justify-center text-center" style={{ border: "1px solid #E2E8DE", minHeight: "300px" }}>
              <div className="w-16 h-16 rounded-full bg-[#F5F9F4] flex items-center justify-center mb-4">
                <Search size={28} className="text-[#9CA3A0]" />
              </div>
              <p className="text-[#374040] font-semibold text-lg mb-1">Belum ada siswa terpilih</p>
              <p className="text-[#6B7769] text-sm">Gunakan kolom pencarian di atas untuk menemukan siswa dan melihat rincian tagihannya.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — sticky ── */}
        <div className="sticky top-6 self-start space-y-5">
          {selectedStudent && (
            <>
          {/* 3 · Payment form */}
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
            <p className="text-sm font-semibold text-[#1C2517] mb-4">
              Detail Pembayaran
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => { setIsManual(false); setNominal(selectedStudent.sisa); }}
                className="flex items-center px-3.5 py-2 rounded-lg text-sm transition-colors hover:border-[#3E8A2F] hover:text-[#3E8A2F]"
                style={{ border: "1px solid #E2E8DE", color: "#374040" }}
              >
                Lunasi semua
                <span className="ml-1.5 font-semibold text-[#3E8A2F] tabular-nums">
                  — {fmt(selectedStudent.sisa)}
                </span>
              </button>
              {(() => {
                const unpaid = studentTagihans.filter(t => t.nominal - t.terbayar > 0);
                
                // Group unpaid tags by kategori
                const byKategori = unpaid.reduce((acc, curr) => {
                  const cat = curr.kategori || curr.namaTagihan;
                  if (!acc[cat]) acc[cat] = 0;
                  acc[cat] += (curr.nominal - curr.terbayar);
                  return acc;
                }, {} as Record<string, number>);

                return Object.entries(byKategori).slice(0, 3).map(([cat, sisaCat]) => (
                  <button
                    key={cat}
                    onClick={() => { setIsManual(false); setNominal(sisaCat); }}
                    className="flex items-center px-3.5 py-2 rounded-lg text-sm transition-colors hover:border-[#3E8A2F] hover:text-[#3E8A2F]"
                    style={{ border: "1px solid #E2E8DE", color: "#374040" }}
                  >
                    Lunasi {cat}
                    <span className="ml-1.5 font-semibold tabular-nums text-[#374040]">
                      — {fmt(sisaCat)}
                    </span>
                  </button>
                ));
              })()}
            </div>

            <div className="space-y-3">
              {/* Nominal — large input with inline Rp prefix */}
              <div
                className="relative flex items-center px-4 rounded-lg bg-white"
                style={{
                  border: "1.5px solid #3E8A2F",
                  paddingTop: "22px",
                  paddingBottom: "8px",
                }}
              >
                <span className="text-[#6B7769] mr-1.5 text-sm shrink-0">Rp</span>
                <input
                  type="text"
                  value={isManual ? fmtNum(nominal) : (nominal > 0 ? fmtNum(nominal) : "")}
                  onChange={(e) => { setIsManual(false); handleNominalChange(e.target.value); }}
                  placeholder="0"
                  className="flex-1 outline-none bg-transparent text-[#1C2517] tabular-nums"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                />
                <label className="absolute left-4 top-1.5 text-[10px] text-[#3E8A2F] pointer-events-none">
                  Nominal Bayar
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  id="metode"
                  label="Metode Pembayaran"
                  value={metode}
                  onChange={setMetode}
                  options={METODE_PEMBAYARAN_LIST}
                  required
                />
                <FloatingSelect
                  id="akun"
                  label="Akun Tujuan"
                  value={akun}
                  onChange={setAkun}
                  options={KAS_BANK_LIST.map((k) => k.nama)}
                  required
                />
              </div>

              <FloatingInput
                type="date"
                id="tanggal"
                label="Tanggal"
                value={tanggal}
                onChange={setTanggal}
                required
              />

              <FloatingInput
                id="catatan"
                label="Catatan"
                value={catatan}
                onChange={setCatatan}
              />

              <button
                onClick={handleCatatPembayaran}
                className="w-full py-3.5 rounded-lg bg-[#3E8A2F] text-white font-semibold text-sm hover:bg-[#2E6B22] transition-colors"
                style={{ marginTop: 4 }}
              >
                Catat Pembayaran
              </button>

              <div className="text-center pt-0.5">
                <button
                  onClick={() => {
                    setIsManual(!isManual);
                    if (!isManual) {
                      setNominal(0);
                      setManualAlloc({});
                    }
                  }}
                  className="text-xs text-[#3E8A2F] hover:underline"
                >
                  {isManual ? "Kembali ke alokasi otomatis" : "Atur alokasi manual"}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Alokasi card */}
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-[#1C2517]">
                {isManual ? "Alokasi Manual" : "Preview Alokasi"}
              </p>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF7EC] text-[#3E8A2F] tabular-nums">
                {fmt(nominal)}
              </span>
            </div>

            {/* Allocation rows */}
            <div className="space-y-4">
              {alokasi.filter(a => isManual ? a.nominal > a.terbayar : true).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {/* Icon */}
                  {item.lunas ? (
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-[#166534]" />
                    </div>
                  ) : item.alloc > 0 ? (
                    <div
                      className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5 text-[#92400E]"
                      style={{ fontSize: 14, lineHeight: 1 }}
                    >
                      ◐
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                      <span
                        className="text-[#9CA3A0]"
                        style={{ fontSize: 12, lineHeight: 1 }}
                      >
                        —
                      </span>
                    </div>
                  )}

                  {/* Label & Input */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-[#1C2517]">
                        {item.kategori || item.namaTagihan}
                      </p>
                      {isManual && (
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3A0]">Rp</span>
                          <input
                            type="text"
                            value={manualAlloc[item.id] ? fmtNum(manualAlloc[item.id]) : ""}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/\D/g, "")) || 0;
                              const maxSisa = item.nominal - item.terbayar;
                              const clamped = Math.min(val, maxSisa);
                              setManualAlloc(prev => {
                                const next = { ...prev, [item.id]: clamped };
                                setNominal((Object.values(next) as number[]).reduce((a, b) => a + b, 0));
                                return next;
                              });
                            }}
                            className="w-full pl-7 pr-2 py-1.5 rounded bg-[#FAFBF9] border border-[#E2E8DE] outline-none text-xs tabular-nums text-right font-medium text-[#1C2517] focus:border-[#3E8A2F]"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>

                    {!isManual && (
                      <>
                        {item.lunas && (
                          <p className="text-xs font-semibold text-[#3E8A2F] tabular-nums mt-0.5">
                            {fmt(item.alloc)} → LUNAS
                          </p>
                        )}
                        {!item.lunas && item.alloc > 0 && (
                          <p className="text-xs text-[#92400E] tabular-nums mt-0.5">
                            {fmt(item.alloc)} dari {fmt(item.nominal - item.terbayar)}
                          </p>
                        )}
                        {item.alloc === 0 && (
                          <p className="text-xs text-[#9CA3A0] mt-0.5">
                            Belum dialokasikan
                          </p>
                        )}
                      </>
                    )}
                    {isManual && (
                      <p className="text-[10px] text-[#9CA3A0] mt-1 tabular-nums">
                        Sisa: {fmt(item.nominal - item.terbayar - (manualAlloc[item.id] || 0))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
              <p className="text-xs text-[#6B7769] mb-1">
                Sisa tagihan setelah bayar:
              </p>
              <p className="tabular-nums font-bold text-[#1C2517]" style={{ fontSize: "1rem" }}>
                {fmt(sisaSetelah)}
              </p>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* ── Receipt dialog ── */}
      {rawSelectedStudent && lastTx && (
        <ReceiptDialog
          open={showSuccess}
          onOpenChange={setShowSuccess}
          onNextTransaction={resetForm}
          student={rawSelectedStudent}
          nominal={lastTx.nominal}
          tanggal={tanggal}
          metode={lastTx.metode}
          nomorKuitansi={lastTx.nomorKuitansi}
          alokasi={lastTx.alokasi.map((a: any) => ({
            kategori: a.namaTagihan,
            alloc: a.nominalAlokasi,
            lunas: false // compute lunas status if needed
          }))}
          tahunAjaran={appSettings.tahunAjaran}
          namaMadrasah={appSettings.namaMadrasah}
        />
      )}

    </div>
  );
}
