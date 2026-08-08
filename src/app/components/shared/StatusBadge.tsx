import { cn } from "@/lib/utils";

type BadgeVariant =
  | "Lunas" | "Mencicil" | "Menunggak"
  | "Hadir" | "Izin" | "Alpa" | "Terlambat"
  | "Perhatian" | "Waspada" | "Kritis"
  | "PNS" | "GTY" | "Honorer"
  | "Aktif" | "Nonaktif"
  | "Selesai" | "Lengkap" | "Pending"
  | "Tuntas" | "Belum Tuntas";

const COLORS: Record<BadgeVariant, string> = {
  // Tagihan
  Lunas:       "bg-[#DCFCE7] text-[#166534]",
  Mencicil:    "bg-[#FEF3C7] text-[#92400E]",
  Menunggak:   "bg-[#FEE2E2] text-[#991B1B]",
  // Kehadiran
  Hadir:       "bg-[#DCFCE7] text-[#166534]",
  Izin:        "bg-[#FEF3C7] text-[#92400E]",
  Alpa:        "bg-[#FEE2E2] text-[#991B1B]",
  Terlambat:   "bg-[#FEF3C7] text-[#92400E]",
  // Aging
  Perhatian:   "bg-[#FEF3C7] text-[#92400E]",
  Waspada:     "bg-[#FED7AA] text-[#7C2D12]",
  Kritis:      "bg-[#FEE2E2] text-[#991B1B]",
  // Kepegawaian
  PNS:         "bg-[#DBEAFE] text-[#1E40AF]",
  GTY:         "bg-[#DCFCE7] text-[#166534]",
  Honorer:     "bg-[#FEF3C7] text-[#92400E]",
  // Status siswa/akun
  Aktif:       "bg-[#DCFCE7] text-[#166534]",
  Nonaktif:    "bg-[#F3F4F6] text-[#6B7280]",
  // Lain-lain
  Selesai:     "bg-[#DCFCE7] text-[#166534]",
  Lengkap:     "bg-[#DCFCE7] text-[#166534]",
  Pending:     "bg-[#FEF3C7] text-[#92400E]",
  Tuntas:      "bg-[#DCFCE7] text-[#166534]",
  "Belum Tuntas": "bg-[#FEE2E2] text-[#991B1B]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COLORS[status],
        className
      )}
    >
      {status}
    </span>
  );
}
