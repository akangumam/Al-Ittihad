import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { tahunAjaranOptions } from "@/data/settings";

export function TopBar() {
  const { tahunAjaran, setTahunAjaran } = useAppContext();
  const [yearOpen, setYearOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setYearOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayYear = `TA ${tahunAjaran}`;

  return (
    <header
      className="h-14 bg-white flex items-center px-6 gap-4 shrink-0 z-30"
      style={{ borderBottom: "1px solid #E2E8DE" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#F0F7EE] transition-colors"
          style={{ background: "#F5F9F4", border: "1px solid #E2E8DE" }}
        >
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <span className="text-sm text-[#9CA3A0] flex-1 select-none">
            Cari siswa, transaksi...
          </span>
          <div className="flex items-center gap-0.5">
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘
            </kbd>
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Academic year selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[#EDF7EC]"
            style={{ border: "1.5px solid #3E8A2F", color: "#3E8A2F" }}
          >
            {displayYear}
            <ChevronDown
              size={13}
              className="transition-transform"
              style={{ transform: yearOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {yearOpen && (
            <div
              className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl py-1 z-50 min-w-[164px]"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {tahunAjaranOptions.map((ta) => (
                <button
                  key={ta}
                  onClick={() => {
                    setTahunAjaran(ta);
                    setYearOpen(false);
                  }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#EDF7EC]",
                    ta === tahunAjaran ? "text-[#3E8A2F] font-semibold" : "text-[#374040]",
                  ].join(" ")}
                >
                  TA {ta}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[#F5F9F4] transition-colors">
          <Bell size={18} className="text-[#6B7769]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg hover:bg-[#F5F9F4] transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            AK
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-[#1C2517] leading-none mb-0.5">Admin Keuangan</p>
            <p className="text-[10px] text-[#6B7769] leading-none">Bendahara</p>
          </div>
          <ChevronDown size={13} className="text-[#9CA3A0] hidden lg:block" />
        </button>
      </div>
    </header>
  );
}
