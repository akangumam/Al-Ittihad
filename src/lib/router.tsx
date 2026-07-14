import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "@/app/App";
import { Dashboard } from "@/app/components/Dashboard";
import { Siswa } from "@/app/components/Siswa";
import { Guru } from "@/app/components/Guru";
import { KelasJadwal } from "@/app/components/KelasJadwal";
import { Absensi } from "@/app/components/Absensi";
import { MobileAbsensi } from "@/app/components/MobileAbsensi";
import { Pembayaran } from "@/app/components/Pembayaran";
import { MobilePembayaran } from "@/app/components/MobilePembayaran";
import { Tunggakan } from "@/app/components/Tunggakan";
import { Tagihan } from "@/app/components/Tagihan";
import { KasBank } from "@/app/components/KasBank";
import { Laporan } from "@/app/components/Laporan";
import { Anggaran } from "@/app/components/Anggaran";
import { Pengaturan } from "@/app/components/Pengaturan";
import { useIsMobile } from "@/hooks/useIsMobile";

// Pembayaran & Absensi keep separate renderers permanently —
// they have fundamentally different compositions, not just layout.
function PembayaranRoute() {
  return useIsMobile() ? <MobilePembayaran /> : <Pembayaran />;
}
function AbsensiRoute() {
  return useIsMobile() ? <MobileAbsensi /> : <Absensi />;
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
      {label} — belum diimplementasikan
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "kalender", element: <Placeholder label="Kalender" /> },

      // Akademik
      { path: "akademik/siswa", element: <Siswa /> },
      { path: "akademik/guru", element: <Guru /> },
      { path: "akademik/kelas-jadwal", element: <Navigate to="/akademik/kelas-jadwal/data" replace /> },
      { path: "akademik/kelas-jadwal/:tab", element: <KelasJadwal /> },
      { path: "akademik/absensi", element: <Navigate to="/akademik/absensi/hari-ini" replace /> },
      { path: "akademik/absensi/:tab", element: <AbsensiRoute /> },

      // Keuangan
      { path: "keuangan/pembayaran", element: <PembayaranRoute /> },
      { path: "keuangan/tunggakan", element: <Tunggakan /> },
      { path: "keuangan/tagihan", element: <Navigate to="/keuangan/tagihan/template" replace /> },
      { path: "keuangan/tagihan/:tab", element: <Tagihan /> },
      { path: "keuangan/kas-bank", element: <Navigate to="/keuangan/kas-bank/transaksi" replace /> },
      { path: "keuangan/kas-bank/:tab", element: <KasBank /> },
      { path: "keuangan/laporan", element: <Laporan /> },
      { path: "keuangan/anggaran", element: <Navigate to="/keuangan/anggaran/rab" replace /> },
      { path: "keuangan/anggaran/:tab", element: <Anggaran /> },

      // Sistem
      { path: "sistem/pengguna", element: <Placeholder label="Pengguna & Akses" /> },
      { path: "sistem/log-aktivitas", element: <Placeholder label="Log Aktivitas" /> },
      { path: "sistem/pengaturan", element: <Pengaturan /> },
    ],
  },
]);
