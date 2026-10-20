import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE  = 'http://localhost:5173';
const OUT   = new URL('./screenshots/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

mkdirSync(OUT, { recursive: true });

const PAGES = [
  // Halaman umum / auth
  { name: '00-dashboard',            url: '/' },
  { name: '01-kalender',             url: '/kalender' },

  // Akademik
  { name: '02-siswa-daftar',         url: '/akademik/siswa' },
  { name: '03-guru-daftar',          url: '/akademik/guru' },
  { name: '04-kelas-data',           url: '/akademik/kelas-jadwal/data' },
  { name: '05-kelas-jadwal',         url: '/akademik/kelas-jadwal/jadwal' },
  { name: '06-absensi-hari-ini',     url: '/akademik/absensi/hari-ini' },
  { name: '07-absensi-rekap',        url: '/akademik/absensi/rekapitulasi' },

  // Keuangan
  { name: '08-pembayaran',           url: '/keuangan/pembayaran' },
  { name: '09-tunggakan',            url: '/keuangan/tunggakan' },
  { name: '10-tagihan-template',     url: '/keuangan/tagihan/template' },
  { name: '11-tagihan-penetapan',    url: '/keuangan/tagihan/penetapan' },
  { name: '12-kas-bank-transaksi',   url: '/keuangan/kas-bank/transaksi' },
  { name: '13-kas-bank-akun',        url: '/keuangan/kas-bank/akun' },
  { name: '14-kas-bank-mutasi',      url: '/keuangan/kas-bank/mutasi' },
  { name: '15-laporan-bku',          url: '/keuangan/laporan/bku' },
  { name: '16-laporan-bos',          url: '/keuangan/laporan/dana-bos' },
  { name: '17-laporan-neraca',       url: '/keuangan/laporan/neraca' },
  { name: '18-anggaran-rab',         url: '/keuangan/anggaran/rab' },
  { name: '19-anggaran-realisasi',   url: '/keuangan/anggaran/realisasi' },

  // Sistem
  { name: '20-pengguna',             url: '/sistem/pengguna' },
  { name: '21-log-aktivitas',        url: '/sistem/log-aktivitas' },
  { name: '22-pengaturan',           url: '/sistem/pengaturan' },
];

(async () => {
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  // ── Dev bypass aktif — langsung ke halaman tanpa login ─────────────────────
  await page.setViewportSize({ width: 1440, height: 900 });

  // Screenshot halaman login dulu (dari URL /login)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}00-login.png` });
  console.log('✓  00-login');

  for (const { name, url } of PAGES) {
    try {
      await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
      // Tunggu render selesai
      await page.waitForTimeout(800);
      const dest = `${OUT}${name}.png`;
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`✓  ${name}`);
    } catch (e) {
      console.error(`✗  ${name}: ${e.message}`);
    }
  }

  // Mobile viewport — ambil halaman utama + pembayaran
  await page.setViewportSize({ width: 390, height: 844 });
  for (const { name, url } of [
    { name: '23-mobile-dashboard',   url: '/' },
    { name: '24-mobile-pembayaran',  url: '/keuangan/pembayaran' },
  ]) {
    try {
      await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}${name}.png` });
      console.log(`✓  ${name}`);
    } catch (e) {
      console.error(`✗  ${name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nSelesai! Screenshot tersimpan di: ' + OUT);
})();
