const STATUS_ACTIVE: Record<string, string> = {
  Hadir:     "bg-[#3E8A2F] text-white",
  Terlambat: "bg-[#F59E0B] text-white",
  Izin:      "bg-[#F6B31E] text-white",
  Sakit:     "bg-[#3B82F6] text-white",
  Alpa:      "bg-[#DC2626] text-white",
};

const STATUSES = ["Hadir", "Terlambat", "Izin", "Sakit", "Alpa"] as const;

export function AbsensiStatusControl({
  value,
  onChange,
  minH,
}: {
  value: string | null;
  onChange: (v: string) => void;
  minH?: number;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
      {STATUSES.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={[
            "px-2 py-1.5 text-[11px] font-semibold transition-colors flex-1",
            i > 0 ? "border-l border-[#E2E8DE]" : "",
            value === s ? STATUS_ACTIVE[s] : "text-[#6B7769] hover:bg-[#F5F9F4]",
          ].join(" ")}
          style={minH ? { minHeight: minH } : undefined}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
