import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/app/components/ui/alert-dialog";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";

interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function ExitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: ExitConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (e) {
      console.error("Gagal saat keluar:", e);
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent
        className="sm:max-w-[420px] p-6 rounded-2xl bg-white border border-[#E2E8DE] shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        <AlertDialogHeader className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0 shadow-sm">
            <LogOut size={22} className="stroke-[2.2]" />
          </div>
          <div className="space-y-1.5">
            <AlertDialogTitle className="text-lg font-bold text-[#1C2517] tracking-tight">
              Konfirmasi Keluar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#6B7769] leading-relaxed">
              Apakah Anda yakin ingin keluar dari sistem MTs Al-Ittihad? Anda perlu memasukkan email dan kata sandi kembali untuk mengakses data madrasah.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-2 sm:justify-end pt-4 mt-1 border-t border-[#F0F7EE]">
          <AlertDialogCancel
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2E8DE] text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors cursor-pointer"
          >
            Batal
          </AlertDialogCancel>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>Ya, Keluar</span>
              </>
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
