// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  // Dashboard
  {
    label: 'Dashboard',
    icon: 'ri-home-smile-line',
    href: '/apps/academy/dashboard'
  },

  // Kalender
  {
    label: 'Kalender',
    icon: 'ri-calendar-line',
    href: '/apps/calendar'
  },

  // Akademik
  {
    label: 'Akademik',
    icon: 'ri-graduation-cap-line',
    children: [
      {
        label: 'Data Siswa',
        href: '/akademik/data-siswa',
        icon: 'ri-user-3-line'
      },
      {
        label: 'Data Guru',
        href: '/akademik/data-guru',
        icon: 'ri-user-star-line'
      },
      {
        label: 'Data Kelas',
        href: '/akademik/data-kelas',
        icon: 'ri-building-4-line'
      },
      {
        label: 'Jadwal Mengajar',
        href: '/akademik/jadwal-mengajar',
        icon: 'ri-calendar-schedule-line'
      },
      {
        label: 'Tahun Ajaran',
        href: '/akademik/tahun-ajaran',
        icon: 'ri-calendar-2-line'
      }
    ]
  },

  // Absensi
  {
    label: 'Absensi Guru',
    icon: 'ri-user-follow-line',
    children: [
      {
        label: 'Input Kehadiran',
        href: '/akademik/absensi-guru',
        icon: 'ri-edit-box-line'
      },
      {
        label: 'Rekapitulasi Absensi',
        href: '/akademik/absensi-guru/rekap',
        icon: 'ri-file-chart-line'
      }
    ]
  },

  // Keuangan Sekolah (Daftar Ulang & Pendaftaran)
  {
    label: 'Biaya Sekolah',
    icon: 'ri-money-dollar-circle-line',
    children: [
      {
        label: 'Template Biaya',
        href: '/biaya/template-biaya',
        icon: 'ri-file-list-3-line'
      },
      {
        label: 'Penetapan Tagihan',
        href: '/biaya/tagihan',
        icon: 'ri-file-list-line'
      },
      {
        label: 'Pembayaran Siswa',
        href: '/biaya/pembayaran',
        icon: 'ri-secure-payment-line'
      }
    ]
  },

  // Manajemen Keuangan
  {
    label: 'Manajemen Kas & Bank',
    icon: 'ri-wallet-3-line',
    children: [
      {
        label: 'Pemasukan Kas',
        href: '/keuangan/pemasukan',
        icon: 'ri-arrow-down-circle-line'
      },
      {
        label: 'Pengeluaran Kas',
        href: '/keuangan/pengeluaran',
        icon: 'ri-arrow-up-circle-line'
      },
      {
        label: 'Data Kas & Bank',
        href: '/keuangan/kas-bank',
        icon: 'ri-safe-line'
      },
      {
        label: 'Mutasi Antar Kas',
        href: '/keuangan/mutasi',
        icon: 'ri-exchange-line'
      }
    ]
  },

  // Laporan
  {
    label: 'Laporan Keuangan',
    icon: 'ri-file-chart-line',
    children: [
      {
        label: 'Laporan Pemasukan',
        href: '/laporan/pemasukan',
        icon: 'ri-money-dollar-circle-line'
      },
      {
        label: 'Laporan Pengeluaran',
        href: '/laporan/pengeluaran',
        icon: 'ri-shopping-cart-line'
      },
      {
        label: 'Buku Kas Umum (BKU)',
        href: '/laporan/bku',
        icon: 'ri-book-open-line'
      },
      {
        label: 'Laporan Dana BOS',
        href: '/laporan/bos',
        icon: 'ri-government-line'
      },
      {
        label: 'Perbandingan Anggaran',
        href: '/laporan/anggaran-vs-realisasi',
        icon: 'ri-pie-chart-line'
      },
      {
        label: 'Tunggakan Siswa',
        href: '/laporan/tunggakan',
        icon: 'ri-file-warning-line'
      },
      {
        label: 'Neraca Keuangan',
        href: '/laporan/neraca',
        icon: 'ri-scales-3-line'
      }
    ]
  },

  // Pengguna & Hak Akses (Main Menu)
  {
    label: 'Pengguna & Hak Akses',
    icon: 'ri-shield-user-line',
    href: '/apps/roles'
  },

  // Log Aktivitas (Main Menu)
  {
    label: 'Log Aktivitas',
    icon: 'ri-history-line',
    href: '/system/activity-log'
  },

  // Pengaturan
  {
    label: 'Pengaturan Sistem',
    icon: 'ri-settings-3-line',
    children: [
      {
        label: 'Kategori Transaksi',
        href: '/pengaturan/kategori-transaksi',
        icon: 'ri-list-settings-line'
      },
      {
        label: 'Manajemen Kas/Bank',
        href: '/pengaturan/akun-kas-bank',
        icon: 'ri-bank-card-line'
      },
      {
        label: 'Tahun Pelajaran',
        href: '/pengaturan/tahun-ajaran',
        icon: 'ri-calendar-2-line'
      },
      {
        label: 'Cadangkan & Pulihkan',
        href: '/pengaturan/backup-restore',
        icon: 'ri-database-2-line'
      }
    ]
  }
]

export default verticalMenuData
