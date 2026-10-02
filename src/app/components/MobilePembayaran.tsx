import { useState } from "react";
import { toast } from "sonner";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { fmt, fmtNum } from "@/lib/formatters";
import { useAppContext } from "@/context/AppContext";
import { KAS_BANK_LIST, METODE_PEMBAYARAN_LIST } from "@/data/pembayaran";

function computeAlokasi(nominal: number, tagihanSiswa: any[]) {
  let rem = nominal;
  // Sort tagihan by prioritas (kecil = utama), if same then by jatuhTempo
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

// ─── form primitives ──────────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, required, type = "text"
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const up = focused || value.length > 0 || type === "date";
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-4 rounded-lg bg-white text-[#1C2517] outline-none text-sm ${up ? "pt-6 pb-2" : "py-4"}`}
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
          fontFamily: "inherit",
          minHeight: 52,
        }}
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-150 ${up ? "top-1.5 text-[10px] text-[#6B7769]" : "top-[15px] text-sm text-[#9CA3A0]"}`}
      >
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex-1 min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pt-6 pb-2 pl-4 pr-8 rounded-lg bg-white text-[#1C2517] text-sm appearance-none outline-none"
        style={{
          border: focused ? "1.5px solid #3E8A2F" : "1px solid #E2E8DE",
          fontFamily: "inherit",
          minHeight: 52,
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <label className="absolute left-4 top-1.5 text-[10px] text-[#6B7769] pointer-events-none">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none"
      />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MobilePembayaran() {
  const { siswaList, tagihanList, addTransaksi, appSettings } = useAppContext();

  const [query, setQuery]       = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [nominal, setNominal]   = useState(0);
  const [metode, setMetode]     = useState(METODE_PEMBAYARAN_LIST[0] || "Tunai");
  const [akun, setAkun]         = useState(KAS_BANK_LIST[0]?.nama || "Kas Tunai");
  const today = new Date();
  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [tanggal, setTanggal]   = useState(formattedToday);
  const [catatan, setCatatan]   = useState("");
  
  const [isManual, setIsManual] = useState(false);
  const [manualAlloc, setManualAlloc] = useState<Record<string, number>>({});

  const searchResults = query.trim() === "" ? [] : siswaList.filter(s => 
    s.status === "Aktif" && 
    (s.nama.toLowerCase().includes(query.toLowerCase()) || s.nis.includes(query))
  ).slice(0, 5);

  const rawSelectedStudent = selectedStudentId ? siswaList.find(s => s.id === selectedStudentId) : null;
  const isSelected = !!rawSelectedStudent && query === rawSelectedStudent.nama;
  
  const studentTagihans = rawSelectedStudent ? tagihanList.filter(t => t.nis === rawSelectedStudent.nis) : [];
  const totalTagihan = studentTagihans.reduce((sum, t) => sum + t.nominal, 0);
  const totalDibayar = studentTagihans.reduce((sum, t) => sum + t.terbayar, 0);
  const totalSisa = totalTagihan - totalDibayar;

  const student = rawSelectedStudent ? {
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
  const sisaSetelah = student ? Math.max(0, student.sisa - nominal) : 0;

  const handleNominalChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setNominal(parseInt(digits) || 0);
  };

  const handleCatatPembayaran = () => {
    if (!rawSelectedStudent || nominal <= 0) return;
    
    // Create new transaction
    const newTx = {
      id: "TX-" + Date.now(),
      nis: rawSelectedStudent.nis,
      tanggal: new Date().toISOString(),
      nominal,
      metode,
      nomorKuitansi: "KWT-" + Date.now().toString().slice(-6),
      alokasi: alokasi.filter(a => a.alloc > 0).map(a => ({
        tagihanId: a.id,
        nominalAlokasi: a.alloc,
        namaTagihan: a.namaTagihan
      }))
    };
    
    const updatedTagihans = alokasi.filter(a => a.alloc > 0).map(a => ({
      ...tagihanList.find(t => t.id === a.id)!,
      terbayar: a.terbayar + a.alloc,
      isLunas: (a.terbayar + a.alloc) >= a.nominal
    }));
    
    addTransaksi(newTx, updatedTagihans);

    // Reset after success
    toast.success(`Pembayaran berhasil dicatat! No. Kuitansi: ${newTx.nomorKuitansi}`);
    setQuery("");
    setSelectedStudentId(null);
    setNominal(0);
    setCatatan("");
    setIsManual(false);
    setManualAlloc({});
  };

  return (
    <>
      {/* ── Scrollable content ── */}
      <div
        className="px-4 py-3 flex flex-col gap-3"
        style={{ paddingBottom: 84 }}
      >

        {/* ── 1 · Student search ── */}
        <div className="relative">
          <div
            className="flex items-center gap-2.5 rounded-lg bg-white"
            style={{
              height: 48,
              padding: "0 12px",
              border: isSelected
                ? "1.5px solid #3E8A2F"
                : dropOpen
                ? "1.5px solid #3E8A2F"
                : "1px solid #E2E8DE",
            }}
          >
            <Search size={16} color={isSelected ? "#3E8A2F" : "#9CA3A0"} className="shrink-0" />

            {isSelected && student ? (
              <>
                <span className="flex-1 text-sm font-medium text-[#1C2517] truncate">
                  {student.nama}
                </span>
                <button
                  onClick={() => { setQuery(""); setSelectedStudentId(null); setDropOpen(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#F3F4F6]"
                  style={{ background: "#F3F4F6", border: "none", cursor: "pointer" }}
                  aria-label="Hapus pilihan"
                >
                  <X size={12} color="#374040" />
                </button>
              </>
            ) : (
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                className="flex-1 bg-transparent outline-none text-sm text-[#1C2517]"
                style={{ fontFamily: "inherit" }}
              />
            )}
          </div>

          {/* Dropdown */}
          {dropOpen && !isSelected && query.trim() !== "" && (
            <div
              className="absolute left-0 right-0 z-20 bg-white rounded-xl overflow-hidden"
              style={{ top: 52, border: "1px solid #E2E8DE", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            >
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#9CA3A0] text-center">Siswa tidak ditemukan</div>
              ) : (
                searchResults.map((r, i, arr) => {
                  const rTagihans = tagihanList.filter(t => t.nis === r.nis);
                  const rSisa = rTagihans.reduce((sum, t) => sum + (t.nominal - t.terbayar), 0);
                  
                  return (
                    <button
                      key={r.id}
                      onMouseDown={() => { 
                        setQuery(r.nama); 
                        setSelectedStudentId(r.id);
                        setDropOpen(false); 
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F9F4] transition-colors"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        borderBottom: i < arr.length - 1 ? "1px solid #F0F7EE" : "none",
                        minHeight: 52,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1C2517] truncate">{r.nama}</p>
                        <p className="text-[11px] text-[#6B7769]">{r.nis} · Kelas {r.kelas}</p>
                      </div>
                      {rSisa > 0 && (
                        <span className="text-xs font-semibold tabular-nums text-[#DC2626] ml-3 shrink-0">
                          {fmt(rSisa)}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── 2 · Student context card ── */}
        {isSelected && student && (
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
            {/* Name + class row */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: "#3E8A2F" }}
              >
                {student.inits}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#1C2517] leading-none truncate">
                  {student.nama}
                </p>
                <p className="text-[11px] text-[#6B7769] mt-0.5">
                  {student.nis} · Kelas {student.kelas}
                </p>
              </div>
            </div>

            {/* Summary: Total / Dibayar / Sisa */}
            <div
              className="grid grid-cols-3 mt-3 pt-3"
              style={{ borderTop: "1px solid #E2E8DE" }}
            >
              <div style={{ paddingRight: 12, borderRight: "1px solid #E2E8DE" }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Total</p>
                <p className="text-[12px] font-bold tabular-nums text-[#1C2517] leading-none">
                  {fmt(student.totalTagihan)}
                </p>
              </div>
              <div style={{ paddingLeft: 12, paddingRight: 12, borderRight: "1px solid #E2E8DE" }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Dibayar</p>
                <p className="text-[12px] font-bold tabular-nums text-[#3E8A2F] leading-none">
                  {fmt(student.dibayar)}
                </p>
              </div>
              <div style={{ paddingLeft: 12 }}>
                <p className="text-[10px] text-[#6B7769] font-medium mb-0.5">Sisa</p>
                <p className="text-[15px] font-bold tabular-nums text-[#DC2626] leading-none">
                  {fmt(student.sisa)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3 · Tagihan Belum Lunas ── */}
        {isSelected && student && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-[#9CA3A0] uppercase tracking-wide px-0.5">
              Tagihan Belum Lunas
            </p>
            {studentTagihans.filter(t => t.nominal - t.terbayar > 0)
              .sort((a, b) => {
                const prioA = a.prioritas ?? 999;
                const prioB = b.prioritas ?? 999;
                if (prioA !== prioB) return prioA - prioB;
                return new Date(a.jatuhTempo).getTime() - new Date(b.jatuhTempo).getTime();
              })
              .map((item, i) => (
              <div
                key={item.id}
                className="bg-white rounded-xl flex items-center gap-3"
                style={{
                  border: "1px solid #E2E8DE",
                  padding: "12px 16px",
                  minHeight: 52,
                }}
              >
                {/* Prio chip */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: "#EDF7EC", color: "#3E8A2F" }}
                >
                  {i + 1}
                </div>
                {/* Kategori */}
                <p className="flex-1 text-[13px] font-semibold text-[#1C2517]">
                  {item.namaTagihan}
                </p>
                {/* Sisa */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#9CA3A0]">Sisa</p>
                  <p className="text-[13px] font-bold tabular-nums text-[#DC2626]">
                    {fmt(item.nominal - item.terbayar)}
                  </p>
                </div>
              </div>
            ))}
            {studentTagihans.filter(t => t.nominal - t.terbayar > 0).length === 0 && (
              <div className="text-sm text-[#9CA3A0] text-center py-4">Tidak ada tagihan tertunggak.</div>
            )}
          </div>
        )}

        {/* ── 4 · Payment form ── */}
        {isSelected && student && (
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
            <p className="text-[13px] font-semibold text-[#1C2517]" style={{ marginBottom: 14 }}>
              Detail Pembayaran
            </p>

            {/* Quick chips — horizontal scroll */}
            <div
              className="flex gap-2"
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                paddingBottom: 2,
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => { setIsManual(false); setNominal(student.sisa); }}
                className="flex items-center shrink-0 rounded-lg text-sm transition-colors hover:border-[#3E8A2F]"
                style={{
                  border: "1px solid #E2E8DE",
                  color: "#374040",
                  padding: "10px 14px",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  minHeight: 44,
                }}
              >
                Lunasi semua
                <span className="ml-1.5 font-semibold text-[#3E8A2F] tabular-nums">
                  — {fmt(student.sisa)}
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
                    className="flex items-center shrink-0 rounded-lg text-sm transition-colors hover:border-[#3E8A2F]"
                    style={{
                      border: "1px solid #E2E8DE",
                      color: "#374040",
                      padding: "10px 14px",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    Lunasi {cat}
                    <span className="ml-1.5 font-semibold tabular-nums text-[#374040]">
                      — {fmt(sisaCat)}
                    </span>
                  </button>
                ));
              })()}
            </div>

            <div className="flex flex-col gap-3">
              {/* Nominal Bayar — large filled */}
              <div
                className="relative flex items-center px-4 rounded-lg bg-white"
                style={{
                  border: "1.5px solid #3E8A2F",
                  paddingTop: 22,
                  paddingBottom: 9,
                }}
              >
                <label className="absolute left-4 top-1.5 text-[10px] text-[#3E8A2F] pointer-events-none">
                  Nominal Bayar<span className="text-red-500 ml-0.5">*</span>
                </label>
                <span className="text-[#6B7769] mr-1.5 text-sm shrink-0 select-none">Rp</span>
                <input
                  type="text"
                  value={isManual ? fmtNum(nominal) : (nominal > 0 ? fmtNum(nominal) : "")}
                  onChange={(e) => { setIsManual(false); handleNominalChange(e.target.value); }}
                  placeholder="0"
                  className="flex-1 outline-none bg-transparent text-[#1C2517] tabular-nums"
                  style={{ fontSize: "1.125rem", fontWeight: 700, fontFamily: "inherit" }}
                />
              </div>

              {/* Metode + Akun (side by side) */}
              <div className="flex gap-3">
                <FloatingSelect
                  label="Metode"
                  value={metode}
                  onChange={setMetode}
                  options={METODE_PEMBAYARAN_LIST}
                  required
                />
                <FloatingSelect
                  label="Akun Tujuan"
                  value={akun}
                  onChange={setAkun}
                  options={KAS_BANK_LIST.map(k => k.nama)}
                  required
                />
              </div>

              {/* Tanggal */}
              <FloatingInput
                type="date"
                label="Tanggal"
                value={tanggal}
                onChange={setTanggal}
                required
              />

              {/* Catatan — collapsed single line */}
              <FloatingInput
                label="Catatan (opsional)"
                value={catatan}
                onChange={setCatatan}
              />
              
              <div className="text-center mt-2">
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
        )}

        {/* ── 5 · Preview Alokasi ── */}
        {isSelected && student && (
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8DE" }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <p className="text-[13px] font-semibold text-[#1C2517]">
                {isManual ? "Alokasi Manual" : "Preview Alokasi"}
              </p>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums"
                style={{ background: "#EDF7EC", color: "#3E8A2F" }}
              >
                {fmt(nominal)}
              </span>
            </div>

            {/* Allocation waterfall */}
            <div className="flex flex-col gap-4">
              {alokasi.filter(a => isManual ? a.nominal > a.terbayar : true).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.lunas ? (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "#DCFCE7" }}
                    >
                      <Check size={11} color="#166534" />
                    </div>
                  ) : item.alloc > 0 ? (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "#FEF3C7", color: "#92400E", fontSize: 14, lineHeight: 1 }}
                    >
                      ◐
                    </div>
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "#F3F4F6" }}
                    >
                      <span style={{ color: "#9CA3A0", fontSize: 12, lineHeight: 1 }}>—</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-[#1C2517]">{item.namaTagihan}</p>
                      {isManual && (
                        <div className="relative w-24 shrink-0 ml-2">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9CA3A0]">Rp</span>
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
                            className="w-full pl-6 pr-2 py-1.5 rounded bg-[#FAFBF9] border border-[#E2E8DE] outline-none text-xs tabular-nums text-right font-medium text-[#1C2517] focus:border-[#3E8A2F]"
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
                          <p className="text-xs text-[#9CA3A0] mt-0.5">Belum dialokasikan</p>
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
              {alokasi.length === 0 && (
                <div className="text-sm text-[#9CA3A0]">Belum ada data alokasi.</div>
              )}
            </div>

            {/* Sisa setelah bayar */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E2E8DE" }}>
              <p className="text-xs text-[#6B7769] mb-1">Sisa tagihan setelah bayar:</p>
              <p className="font-bold tabular-nums text-[#1C2517]" style={{ fontSize: "1rem" }}>
                {fmt(sisaSetelah)}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── 6 · Sticky "Catat Pembayaran" bar — fixed above bottom nav ── */}
      {isSelected && student && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: 35,
            background: "#fff",
            borderTop: "1px solid #E2E8DE",
            padding: "10px 16px",
          }}
        >
          <button
            onClick={handleCatatPembayaran}
            disabled={nominal <= 0}
            style={{
              width: "100%",
              height: 52,
              background: nominal > 0 ? "#3E8A2F" : "#9CA3A0",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: nominal > 0 ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              letterSpacing: 0,
            }}
          >
            Catat Pembayaran
          </button>
        </div>
      )}
    </>
  );
}
