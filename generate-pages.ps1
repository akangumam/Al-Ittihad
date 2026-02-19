$pages = @(
    @{Path="keuangan\kas-bank"; Title="Kas & Bank"; Description="Kelola akun kas dan bank madrasah. Lihat saldo, riwayat transaksi, dan rekonsiliasi untuk setiap akun."; Icon="ri-safe-line"},
    @{Path="keuangan\mutasi"; Title="Mutasi Kas"; Description="Transfer dan mutasi dana antar akun kas/bank. Pantau perpindahan dana dengan log history lengkap."; Icon="ri-exchange-line"},

    @{Path="spp\data-siswa"; Title="Data Siswa"; Description="Kelola data siswa termasuk NIS, nama lengkap, kelas, orang tua, dan kontak."; Icon="ri-user-3-line"},
    @{Path="spp\data-kelas"; Title="Data Kelas"; Description="Kelola data kelas termasuk nama kelas, wali kelas, tahun ajaran, dan jumlah siswa."; Icon="ri-building-4-line"},
    @{Path="spp\penetapan-nominal"; Title="Penetapan Nominal SPP"; Description="Tetapkan nominal SPP per kelas dan tahun ajaran. Lihat riwayat perubahan nominal."; Icon="ri-price-tag-3-line"},
    @{Path="spp\pembayaran"; Title="Pembayaran SPP"; Description="Catat pembayaran SPP siswa. Input bulan dibayar, nominal, dan metode pembayaran."; Icon="ri-secure-payment-line"},
    @{Path="spp\tunggakan"; Title="Tunggakan SPP"; Description="Lihat dan kelola tunggakan SPP per siswa, kelas, atau bulan. Export laporan tunggakan."; Icon="ri-file-warning-line"},

    @{Path="rab\rencana-tahunan"; Title="Rencana Anggaran Tahunan"; Description="Buat dan kelola rencana anggaran tahunan untuk BOS, operasional, dan sarpras."; Icon="ri-calendar-check-line"},
    @{Path="rab\realisasi"; Title="Realisasi Anggaran"; Description="Pantau realisasi anggaran terhadap rencana. Lihat sisa anggaran per item."; Icon="ri-bar-chart-box-line"},
    @{Path="rab\approval"; Title="Approval Anggaran"; Description="Proses persetujuan anggaran dari Kepala Madrasah. Status pending, approved, atau rejected."; Icon="ri-check-double-line"},

    @{Path="laporan\pemasukan"; Title="Laporan Pemasukan"; Description="Laporan pemasukan bulanan/tahunan per sumber dana. Export ke PDF/Excel."; Icon="ri-money-dollar-circle-line"},
    @{Path="laporan\pengeluaran"; Title="Laporan Pengeluaran"; Description="Laporan pengeluaran bulanan/tahunan per kategori. Export ke PDF/Excel."; Icon="ri-shopping-cart-line"},
    @{Path="laporan\bku"; Title="Buku Kas Umum (BKU)"; Description="Laporan standar BOS dengan format Kemdikbud. Nomor urut, tanggal, uraian, penerimaan, pengeluaran, saldo."; Icon="ri-book-open-line"},
    @{Path="laporan\bos"; Title="Laporan BOS"; Description="Laporan BOS format standar Kemdikbud dengan kode akun, komponen, realisasi, dan sisa."; Icon="ri-government-line"},
    @{Path="laporan\anggaran-vs-realisasi"; Title="Anggaran vs Realisasi"; Description="Bandingkan anggaran yang direncanakan dengan realisasi per item RAB. Lihat persentase realisasi."; Icon="ri-pie-chart-line"},
    @{Path="laporan\tunggakan-spp"; Title="Laporan Tunggakan SPP"; Description="Laporan tunggakan SPP per kelas atau seluruh sekolah. Export ke PDF/Excel."; Icon="ri-file-warning-line"},
    @{Path="laporan\neraca"; Title="Neraca Sederhana"; Description="Laporan neraca dengan aset lancar (kas, bank, piutang), liabilitas, dan ekuitas."; Icon="ri-scales-3-line"},

    @{Path="pengaturan\kategori-transaksi"; Title="Kategori Transaksi"; Description="Kelola kategori pemasukan dan pengeluaran. Tambah, edit, atau hapus kategori."; Icon="ri-list-settings-line"},
    @{Path="pengaturan\akun-kas-bank"; Title="Akun Kas/Bank"; Description="Kelola akun kas dan bank. Tambah nomor rekening, set saldo awal, dan jenis akun."; Icon="ri-bank-card-line"},
    @{Path="pengaturan\tahun-ajaran"; Title="Tahun Ajaran"; Description="Kelola tahun ajaran aktif dan historis. Nominal SPP mengikuti tahun ajaran."; Icon="ri-calendar-2-line"},
    @{Path="pengaturan\backup-restore"; Title="Backup & Restore"; Description="Backup database secara manual atau terjadwal. Restore data dari backup sebelumnya."; Icon="ri-database-2-line"}
)

$basePath = "src\app\[lang]\(dashboard)\(private)"

foreach ($page in $pages) {
    $content = @"
import PlaceholderPage from '@/components/PlaceholderPage'

export default function Page() {
  return (
    <PlaceholderPage
      title='$($page.Title)'
      description='$($page.Description)'
      icon='$($page.Icon)'
    />
  )
}
"@

    $fullPath = Join-Path $basePath $page.Path
    $filePath = Join-Path $fullPath "page.tsx"

    Set-Content -Path $filePath -Value $content -Encoding UTF8
    Write-Host "Created: $filePath"
}

Write-Host "`nAll pages created successfully!"
