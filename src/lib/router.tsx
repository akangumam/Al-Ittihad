import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "@/app/App";
import { LoginPage } from "@/app/components/LoginPage";
import { ResetPasswordPage } from "@/app/components/ResetPasswordPage";
import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/app/components/Dashboard";
import { Siswa } from "@/app/components/Siswa";
import { Alumni } from "@/app/components/Alumni";
import { KartuDigital } from "@/app/components/KartuDigital";
import { Guru } from "@/app/components/Guru";
import { KelasJadwal } from "@/app/components/KelasJadwal";
import { Absensi } from "@/app/components/Absensi";
import { AbsensiSiswa } from "@/app/components/AbsensiSiswa";
import { GerbangAbsensi } from "@/app/components/GerbangAbsensi";
import { NilaiSiswaComponent } from "@/app/components/NilaiSiswa";
import { MobileAbsensi } from "@/app/components/MobileAbsensi";
import { Pembayaran } from "@/app/components/Pembayaran";
import { MobilePembayaran } from "@/app/components/MobilePembayaran";
import { Tunggakan } from "@/app/components/Tunggakan";
import { Tagihan } from "@/app/components/Tagihan";
import { KasBank } from "@/app/components/KasBank";
import { Laporan } from "@/app/components/Laporan";
import { Anggaran } from "@/app/components/Anggaran";
import { Pengaturan } from "@/app/components/Pengaturan";
import { LogAktivitas } from "@/app/components/LogAktivitas";
import { Pengguna } from "@/app/components/Pengguna";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Role } from "@/types";

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

function FullPageLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-3"
      style={{ background: "#FAFBF9", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "#3E8A2F", borderTopColor: "transparent" }}
      />
      <p className="text-sm text-[#6B7769]">Memuat...</p>
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user || !user.role) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

/** Redirect ke "/" jika role aktif tidak termasuk dalam daftar `roles`. */
function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "kalender", element: <Placeholder label="Kalender" /> },

      // Akademik
      {
        path: "akademik/gerbang",
        element: <RequireRole roles={["Admin", "TU"]}><GerbangAbsensi /></RequireRole>,
      },
      {
        path: "akademik/siswa",
        element: <RequireRole roles={["Admin", "Bendahara"]}><Siswa /></RequireRole>,
      },
      {
        path: "akademik/alumni",
        element: <RequireRole roles={["Admin"]}><Alumni /></RequireRole>,
      },
      {
        path: "akademik/kartu-digital",
        element: <RequireRole roles={["Admin", "TU"]}><KartuDigital /></RequireRole>,
      },
      {
        path: "akademik/guru",
        element: <RequireRole roles={["Admin", "TU"]}><Guru /></RequireRole>,
      },
      { path: "akademik/kelas-jadwal", element: <Navigate to="/akademik/kelas-jadwal/data" replace /> },
      {
        path: "akademik/kelas-jadwal/:tab",
        element: <RequireRole roles={["Admin", "TU"]}><KelasJadwal /></RequireRole>,
      },
      { path: "akademik/absensi", element: <Navigate to="/akademik/absensi/scan" replace /> },
      {
        path: "akademik/absensi/:tab",
        element: <RequireRole roles={["Admin", "TU"]}><AbsensiRoute /></RequireRole>,
      },
      { path: "akademik/absensi-siswa", element: <Navigate to="/akademik/absensi-siswa/scan" replace /> },
      {
        path: "akademik/absensi-siswa/:tab",
        element: <RequireRole roles={["Admin", "TU"]}><AbsensiSiswa /></RequireRole>,
      },
      {
        path: "akademik/nilai-siswa",
        element: <RequireRole roles={["Admin", "TU"]}><NilaiSiswaComponent /></RequireRole>,
      },

      // Keuangan
      {
        path: "keuangan/pembayaran",
        element: <RequireRole roles={["Admin", "Bendahara"]}><PembayaranRoute /></RequireRole>,
      },
      {
        path: "keuangan/tunggakan",
        element: <RequireRole roles={["Admin", "Bendahara"]}><Tunggakan /></RequireRole>,
      },
      { path: "keuangan/tagihan", element: <Navigate to="/keuangan/tagihan/template" replace /> },
      {
        path: "keuangan/tagihan/:tab",
        element: <RequireRole roles={["Admin", "Bendahara"]}><Tagihan /></RequireRole>,
      },
      { path: "keuangan/kas-bank", element: <Navigate to="/keuangan/kas-bank/transaksi" replace /> },
      {
        path: "keuangan/kas-bank/:tab",
        element: <RequireRole roles={["Admin", "Bendahara"]}><KasBank /></RequireRole>,
      },
      { path: "keuangan/laporan", element: <Navigate to="/keuangan/laporan/bku" replace /> },
      {
        path: "keuangan/laporan/:tab",
        element: <RequireRole roles={["Admin", "Bendahara"]}><Laporan /></RequireRole>,
      },
      { path: "keuangan/anggaran", element: <Navigate to="/keuangan/anggaran/rab" replace /> },
      {
        path: "keuangan/anggaran/:tab",
        element: <RequireRole roles={["Admin", "Bendahara"]}><Anggaran /></RequireRole>,
      },

      // Sistem
      {
        path: "sistem/pengguna",
        element: <RequireRole roles={["Admin"]}><Pengguna /></RequireRole>,
      },
      {
        path: "sistem/log-aktivitas",
        element: <RequireRole roles={["Admin"]}><LogAktivitas /></RequireRole>,
      },
      {
        path: "sistem/pengaturan",
        element: <RequireRole roles={["Admin"]}><Pengaturan /></RequireRole>,
      },
    ],
  },
]);
