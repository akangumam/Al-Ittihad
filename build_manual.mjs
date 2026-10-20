import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;

const MD_PATH = path.join(ROOT, 'Petunjuk Penggunaan — Sistem Manajemen MTs Al-Ittihad.md');
const PDF_PATH = path.join(ROOT, 'Petunjuk Penggunaan — Sistem Manajemen MTs Al-Ittihad.pdf');
const HTML_DEBUG_PATH = path.join(ROOT, 'docs', 'manual_preview.html');

console.log('1. Membaca dan memproses Markdown...');
let mdContent = fs.readFileSync(MD_PATH, 'utf8');

// Peta penggantian placeholder gambar ke sintaks Markdown Image
const IMAGE_REPLACEMENTS = [
  {
    target: '`[Gambar: halaman login]`',
    replacement: `![Halaman Login Sistem](docs/screenshots/00-login.png)\n*Gambar 1.1: Halaman Login Sistem Manajemen MTs Al-Ittihad*`
  },
  {
    target: '`[Gambar: sidebar desktop]`',
    replacement: `![Navigasi Sidebar Desktop](docs/screenshots/00-dashboard.png)\n*Gambar 1.2: Navigasi Sidebar Desktop dengan pengelompokan Akademik, Keuangan, dan Sistem*`
  },
  {
    target: '`[Gambar: bottom nav mobile]`',
    replacement: `<div style="text-align: center;"><img src="docs/screenshots/23-mobile-dashboard.png" alt="Navigasi Mobile" style="max-width: 280px; margin: 0 auto; display: block;" />\n*Gambar 1.3: Tampilan Aplikasi pada Layar Mobile dengan Bottom Navigation Bar*</div>`
  },
  {
    target: '`[Gambar: halaman Pengaturan]`',
    replacement: `![Halaman Pengaturan](docs/screenshots/22-pengaturan.png)\n*Gambar 2.1: Halaman Pengaturan Sistem (Identitas Madrasah, Tahun Ajaran, dan Jam Masuk)*`
  },
  {
    target: '`[Gambar: form tambah akun]`',
    replacement: `![Pengelolaan Akun Kas & Bank](docs/screenshots/13-kas-bank-akun.png)\n*Gambar 2.2: Pengelolaan Akun Kas & Bank dan Form Penambahan Rekening*`
  },
  {
    target: '`[Gambar: halaman daftar guru]`',
    replacement: `![Daftar Guru](docs/screenshots/03-guru-daftar.png)\n*Gambar 3.1: Halaman Data Guru dan Tenaga Kependidikan*`
  },
  {
    target: '`[Gambar: Sheet form tambah guru]`',
    replacement: `![Panel Penambahan Guru](docs/screenshots/03-guru-daftar.png)\n*Gambar 3.2: Panel Penambahan dan Pengeditan Data Guru*`
  },
  {
    target: '`[Gambar: halaman daftar siswa]`',
    replacement: `![Daftar Siswa](docs/screenshots/02-siswa-daftar.png)\n*Gambar 4.1: Halaman Data Siswa Aktif dengan Filter Kelas dan Status*`
  },
  {
    target: '`[Gambar: Sheet form tambah siswa]`',
    replacement: `![Formulir Tambah Siswa](docs/screenshots/02-siswa-daftar.png)\n*Gambar 4.2: Formulir Pendaftaran Siswa Baru (PPDB)*`
  },
  {
    target: '`[Gambar: Sheet detail siswa]`',
    replacement: `![Detail Profil Siswa](docs/screenshots/02-siswa-daftar.png)\n*Gambar 4.3: Tampilan Profil Detail Siswa dan Rekapitulasi Tagihan*`
  },
  {
    target: '`[Gambar: tab Data Kelas]`',
    replacement: `![Tab Data Kelas](docs/screenshots/04-kelas-data.png)\n*Gambar 5.1: Tab Data Kelas, Kapasitas Rombel, dan Penugasan Wali Kelas*`
  },
  {
    target: '`[Gambar: tab Jadwal — grid kelas]`',
    replacement: `![Tab Jadwal Pelajaran](docs/screenshots/05-kelas-jadwal.png)\n*Gambar 5.2: Matriks Jadwal Pelajaran Mingguan per Jam Pelajaran*`
  },
  {
    target: '`[Gambar: tab Template]`',
    replacement: `![Template Tagihan](docs/screenshots/10-tagihan-template.png)\n*Gambar 6.1: Template Paket Biaya (PPDB, Daftar Ulang, dan Kelas 9)*`
  },
  {
    target: '`[Gambar: drag & drop urutan komponen]`',
    replacement: `![Urutan Komponen Tagihan](docs/screenshots/10-tagihan-template.png)\n*Gambar 6.2: Pengaturan Urutan Prioritas Waterfall Komponen Biaya*`
  },
  {
    target: '`[Gambar: tab Penetapan]`',
    replacement: `![Penetapan Tagihan](docs/screenshots/11-tagihan-penetapan.png)\n*Gambar 6.3: Penetapan Tagihan Massal per Angkatan / Kelas*`
  },
  {
    target: '`[Gambar: halaman kasir pembayaran]`',
    replacement: `![Kasir Pembayaran](docs/screenshots/08-pembayaran.png)\n*Gambar 7.1: Antarmuka Kasir Pembayaran Siswa dan Alokasi Otomatis*\n\n<div style="text-align: center; margin-top: 15px;"><img src="docs/screenshots/24-mobile-pembayaran.png" alt="Kasir Mobile" style="max-width: 280px; margin: 0 auto; display: block;" />\n*Gambar 7.2: Tampilan Kasir Pembayaran Cepat pada Perangkat Smartphone / Tablet*</div>`
  },
  {
    target: '`[Gambar: halaman tunggakan]`',
    replacement: `![Halaman Tunggakan](docs/screenshots/09-tunggakan.png)\n*Gambar 8.1: Daftar Tunggakan Siswa dengan Status Aging (Perhatian, Waspada, Kritis)*`
  },
  {
    target: '`[Gambar: tab Absensi Hari Ini]`',
    replacement: `![Presensi Harian](docs/screenshots/06-absensi-hari-ini.png)\n*Gambar 9.1: Pencatatan Presensi Harian Siswa & Guru*`
  },
  {
    target: '`[Gambar: tab Rekapitulasi Absensi]`',
    replacement: `![Rekapitulasi Presensi](docs/screenshots/07-absensi-rekap.png)\n*Gambar 9.2: Rekapitulasi Kehadiran Bulanan dan Persentase Presensi*`
  },
  {
    target: '`[Gambar: tab Transaksi]`',
    replacement: `![Buku Transaksi Kas & Bank](docs/screenshots/12-kas-bank-transaksi.png)\n*Gambar 10.1: Buku Transaksi Kas & Bank Terpadu*`
  },
  {
    target: '`[Gambar: tab Akun]`',
    replacement: `![Ringkasan Saldo Akun](docs/screenshots/13-kas-bank-akun.png)\n*Gambar 10.2: Ringkasan Saldo Berjalan per Rekening Bank dan Kas Tunai*`
  },
  {
    target: '`[Gambar: tab Mutasi]`',
    replacement: `![Mutasi Kas](docs/screenshots/14-kas-bank-mutasi.png)\n*Gambar 10.3: Laporan Mutasi dan Perpindahan Saldo Antar Akun*`
  },
  {
    target: '`[Gambar: tab RAB]`',
    replacement: `![Penyusunan RAB](docs/screenshots/18-anggaran-rab.png)\n*Gambar 11.1: Rencana Anggaran Biaya (RAB) per Program & Kegiatan*`
  },
  {
    target: '`[Gambar: tab Realisasi]`',
    replacement: `![Realisasi Anggaran](docs/screenshots/19-anggaran-realisasi.png)\n*Gambar 11.2: Monitoring Realisasi Anggaran dan Peringatan Over-Budget*`
  },
  {
    target: '`[Gambar: tab BKU]`',
    replacement: `![Buku Kas Umum](docs/screenshots/15-laporan-bku.png)\n*Gambar 12.1: Buku Kas Umum (BKU) dengan Saldo Berjalan Kronologis*`
  },
  {
    target: '`[Gambar: tab Dana BOS]`',
    replacement: `![Laporan Dana BOS](docs/screenshots/16-laporan-bos.png)\n*Gambar 12.2: Laporan Pertanggungjawaban Realisasi Dana BOS*`
  },
  {
    target: '`[Gambar: tab Neraca]`',
    replacement: `![Neraca Keuangan](docs/screenshots/17-laporan-neraca.png)\n*Gambar 12.3: Laporan Neraca Keuangan Madrasah (Aset vs Kewajiban)*`
  },
  {
    target: '`[Gambar: halaman kalender]`',
    replacement: `![Kalender Akademik](docs/screenshots/01-kalender.png)\n*Gambar 13.1: Kalender Akademik Madrasah dan Penandaan Hari Libur*`
  },
  {
    target: '`[Gambar: halaman Pengguna]`',
    replacement: `![Manajemen Pengguna](docs/screenshots/20-pengguna.png)\n*Gambar 14.1: Manajemen Akun Pengguna dan Penetapan Hak Akses (Role)*`
  },
  {
    target: '`[Gambar: halaman Log Aktivitas]`',
    replacement: `![Log Aktivitas](docs/screenshots/21-log-aktivitas.png)\n*Gambar 14.2: Rekam Jejak Audit Trail dan Riwayat Aktivitas Sistem*`
  }
];

for (const item of IMAGE_REPLACEMENTS) {
  if (mdContent.includes(item.target)) {
    mdContent = mdContent.replace(item.target, item.replacement);
  }
}

// Simpan kembali Markdown
fs.writeFileSync(MD_PATH, mdContent, 'utf8');

// Logo Base64
const logoPath = path.join(ROOT, 'public', 'aliet_logo_color.png');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  const logoBuf = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuf.toString('base64')}`;
}

// Buat versi markdown yang sudah dibersihkan dari duplikat header judul utama
// karena judul utama sudah ada di Cover Page
let bodyMd = mdContent;
// Hilangkan "# Petunjuk Penggunaan\n\n## Sistem Manajemen MTs Al-Ittihad\n\nVersi 1.0 · 19 Oktober 2026\n\n---"
bodyMd = bodyMd.replace(/^# Petunjuk Penggunaan\s+## Sistem Manajemen MTs Al-Ittihad\s+Versi[^\n]+\n+---\s*/i, '');

// Format Role tags menjadi badges HTML
bodyMd = bodyMd
  .replace(/`\[Admin\]`/g, '<span class="role-badge role-admin">Admin</span>')
  .replace(/`\[Bendahara\]`/g, '<span class="role-badge role-bendahara">Bendahara</span>')
  .replace(/`\[TU\]`/g, '<span class="role-badge role-tu">TU</span>');

// Custom Renderer
const renderer = new marked.Renderer();

renderer.image = function ({ href, title, text }) {
  let imgPath = href;
  if (!imgPath.startsWith('http') && !imgPath.startsWith('data:')) {
    const absPath = path.resolve(ROOT, imgPath).replace(/\\/g, '/');
    imgPath = `file:///${absPath}`;
  }
  return `
    <figure class="screenshot-figure">
      <div class="img-frame">
        <img src="${imgPath}" alt="${text || ''}" />
      </div>
      ${text ? `<figcaption class="caption">${text}</figcaption>` : ''}
    </figure>
  `;
};

renderer.blockquote = function ({ tokens }) {
  const body = this.parser.parse(tokens);
  let type = 'info';
  let title = 'Catatan';
  let icon = '💡';

  if (body.includes('Perhatian')) {
    type = 'warning';
    title = 'Perhatian';
    icon = '⚠️';
  } else if (body.includes('Penting')) {
    type = 'danger';
    title = 'Penting';
    icon = '🛑';
  }

  return `
    <div class="callout callout-${type}">
      <div class="callout-header"><span class="callout-icon">${icon}</span> <strong>${title}</strong></div>
      <div class="callout-body">${body}</div>
    </div>
  `;
};

marked.setOptions({ renderer, gfm: true, breaks: true });
let parsedHtml = marked.parse(bodyMd);

// Sisipkan penutup page-break setelah Daftar Isi
parsedHtml = parsedHtml.replace(
  /<hr>/,
  '<div class="page-break"></div>'
);

// Tambahkan class chapter-heading untuk setiap H2 Bab agar selalu mulai di halaman baru
parsedHtml = parsedHtml.replace(
  /<h2 id="(bab-[^"]+|lampiran-[^"]+)">/g,
  '<div class="chapter-break"></div><h2 id="$1" class="chapter-title">'
);

const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Petunjuk Penggunaan — Sistem Manajemen MTs Al-Ittihad</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.6;
      color: #1E281F;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Space Grotesk', sans-serif;
      color: #121A11;
      font-weight: 700;
      line-height: 1.25;
      margin-top: 1.4em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Chapter Title Break */
    .chapter-break {
      page-break-before: always;
      break-before: always;
      height: 0;
    }

    .chapter-title {
      margin-top: 0;
      padding-top: 5px;
      padding-bottom: 8px;
      border-bottom: 2px solid #3E8A2F;
      color: #265B1C;
      font-size: 16pt;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    h3 {
      font-size: 12pt;
      color: #182B17;
      margin-top: 1.3em;
      border-left: 3.5px solid #3E8A2F;
      padding-left: 9px;
    }

    h4 {
      font-size: 10.5pt;
      color: #374735;
      margin-top: 1.1em;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.8em;
      text-align: justify;
    }

    /* Role Badges */
    .role-badge {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      vertical-align: middle;
      margin-left: 4px;
    }

    .role-admin {
      background: #EDF7EC !important;
      color: #166534 !important;
      border: 1px solid #BBF7D0;
    }

    .role-bendahara {
      background: #FEF3C7 !important;
      color: #92400E !important;
      border: 1px solid #FDE68A;
    }

    .role-tu {
      background: #EFF6FF !important;
      color: #1E40AF !important;
      border: 1px solid #BFDBFE;
    }

    /* Inline Code */
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      padding: 2px 5px;
      border-radius: 4px;
      background: #F0F4EF;
      color: #1E381A;
    }

    /* Cover Page */
    .cover-page {
      height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 50px 30px 30px 30px;
      page-break-after: always;
      break-after: always;
      border: 1.5px solid #D6DFD3;
      border-radius: 12px;
      background: radial-gradient(circle at 50% 10%, #F5FAF4 0%, #FFFFFF 70%);
      box-shadow: 0 4px 24px rgba(62, 138, 47, 0.06);
    }

    .cover-header {
      margin-top: 20px;
    }

    .cover-logo {
      width: 130px;
      height: 130px;
      object-fit: contain;
      margin-bottom: 15px;
      filter: drop-shadow(0 6px 14px rgba(62, 138, 47, 0.18));
    }

    .cover-institution {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13.5pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #3E8A2F;
      margin-bottom: 4px;
    }

    .cover-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 27pt;
      font-weight: 800;
      color: #131E12;
      line-height: 1.15;
      margin: 15px 0 12px 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 11.5pt;
      color: #556653;
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.55;
    }

    .cover-badges {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 25px;
    }

    .cover-badge {
      font-size: 8.5pt;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 20px;
      background: #EDF7EC;
      color: #265B1C;
      border: 1px solid #C7E3C0;
    }

    .cover-footer {
      width: 100%;
      border-top: 1px solid #E2E8DE;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #6C7D69;
    }

    /* Page Break */
    .page-break {
      page-break-after: always;
      break-after: always;
      height: 0;
      margin: 0;
      padding: 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      border: 1px solid #DCE5D9;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #F2F7F1;
      color: #1B291A;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) td {
      background: #FAFDF9;
    }

    /* Images & Figures */
    .screenshot-figure {
      margin: 14px auto 16px auto;
      page-break-inside: avoid;
      break-inside: avoid;
      text-align: center;
      max-width: 95%;
    }

    .img-frame {
      border: 1px solid #D6DFD3;
      border-radius: 7px;
      overflow: hidden;
      background: #FAFBF9;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      display: inline-block;
      max-width: 100%;
    }

    .img-frame img {
      max-width: 100%;
      max-height: 420px;
      height: auto;
      display: block;
      margin: 0 auto;
    }

    .caption {
      font-size: 8pt;
      color: #4C5C4A;
      font-style: italic;
      margin-top: 5px;
      display: block;
      font-weight: 500;
    }

    /* Callouts */
    .callout {
      border-radius: 6px;
      padding: 10px 14px;
      margin: 12px 0 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .callout-header {
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .callout-body p:last-child {
      margin-bottom: 0;
    }

    .callout-warning {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-left: 4px solid #D97706;
      color: #92400E;
    }

    .callout-danger {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-left: 4px solid #DC2626;
      color: #991B1B;
    }

    .callout-info {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-left: 4px solid #3E8A2F;
      color: #166534;
    }

    /* Lists */
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 22px;
    }

    li {
      margin-bottom: 4px;
    }

    hr {
      border: none;
      border-top: 1px solid #E2E8DE;
      margin: 22px 0;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-header">
      ${logoBase64 ? `<img src="${logoBase64}" class="cover-logo" alt="Logo MTs Al-Ittihad" />` : ''}
      <div class="cover-institution">MTs Al-Ittihad Pedaleman</div>
      <div style="font-size: 8.5pt; color: #6E7F6B; margin-top: 3px;">JL. Syekh Nawawi Kp. Pesisir Pedaleman, Kec. Tanara, Kab. Serang, Prov. Banten 42194</div>
    </div>

    <div>
      <h1 class="cover-title">Petunjuk Penggunaan<br>Sistem Manajemen</h1>
      <p class="cover-subtitle">
        Buku Panduan Operasional Lengkap untuk Administrator, Bendahara Keuangan, dan Staf Tata Usaha Madrasah
      </p>
      <div class="cover-badges">
        <span class="cover-badge">Edisi Resmi & Cetak</span>
        <span class="cover-badge">Versi 1.0</span>
        <span class="cover-badge">Tahun Ajaran 2026/2027</span>
      </div>
    </div>

    <div class="cover-footer">
      <div><strong>Disusun oleh:</strong> Tim Pengembang Sistem & IT Madrasah</div>
      <div><strong>Rilis:</strong> Oktober 2026</div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="content-container">
    ${parsedHtml}
  </div>

</body>
</html>
`;

fs.writeFileSync(HTML_DEBUG_PATH, fullHtml, 'utf8');
console.log('✓ File HTML preview berhasil diperbarui.');

console.log('2. Memulai proses konversi PDF dengan Playwright...');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const fileUrl = `file:///${HTML_DEBUG_PATH.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  await page.pdf({
    path: PDF_PATH,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '16mm',
      right: '16mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'Space Grotesk', sans-serif; font-size: 7.5pt; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; color: #7B8B78; border-bottom: 0.5px solid #E2E8DE; padding-bottom: 4px;">
        <span>Sistem Manajemen MTs Al-Ittihad Pedaleman</span>
        <span>Buku Petunjuk Penggunaan</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: 'Space Grotesk', sans-serif; font-size: 7.5pt; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; color: #7B8B78; border-top: 0.5px solid #E2E8DE; padding-top: 4px;">
        <span>MTs Al-Ittihad Pedaleman</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 PDF SELESAI DIBUAT DENGAN SEMPURNA:');
  console.log(PDF_PATH);
  console.log('======================================================\n');
})();
