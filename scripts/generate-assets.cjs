const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('🚀 Starting Favicon & Open Graph generation...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load logo as base64
  const logoPath = path.resolve(__dirname, '../public/aliet_logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');
  const logoDataUri = 'data:image/png;base64,' + logoBase64;

  // 1. GENERATE FAVICONS
  console.log('📦 Generating Favicon variants...');
  const faviconSizes = [
    { file: '../public/favicon-16x16.png', size: 16 },
    { file: '../public/favicon-32x32.png', size: 32 },
    { file: '../public/favicon.png', size: 48 },
    { file: '../public/apple-touch-icon.png', size: 180 },
    { file: '../public/icon-192.png', size: 192 },
    { file: '../public/icon-512.png', size: 512 },
  ];

  for (const item of faviconSizes) {
    const outPath = path.resolve(__dirname, item.file);
    await page.setViewportSize({ width: item.size, height: item.size });
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: transparent; width: ${item.size}px; height: ${item.size}px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${logoDataUri}" />
        </body>
      </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`  ✓ Created ${item.file} (${item.size}x${item.size})`);
  }

  // Create favicon.ico containing 32x32 and 16x16
  const png32 = fs.readFileSync(path.resolve(__dirname, '../public/favicon-32x32.png'));
  const png16 = fs.readFileSync(path.resolve(__dirname, '../public/favicon-16x16.png'));

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(2, 4); // 2 images

  const entry32 = Buffer.alloc(16);
  entry32.writeUInt8(32, 0); // width
  entry32.writeUInt8(32, 1); // height
  entry32.writeUInt8(0, 2);  // palette
  entry32.writeUInt8(0, 3);  // reserved
  entry32.writeUInt16LE(1, 4);  // planes
  entry32.writeUInt16LE(32, 6); // bpp
  entry32.writeUInt32LE(png32.length, 8); // image size
  entry32.writeUInt32LE(6 + 32, 12);     // offset

  const entry16 = Buffer.alloc(16);
  entry16.writeUInt8(16, 0);
  entry16.writeUInt8(16, 1);
  entry16.writeUInt8(0, 2);
  entry16.writeUInt8(0, 3);
  entry16.writeUInt16LE(1, 4);
  entry16.writeUInt16LE(32, 6);
  entry16.writeUInt32LE(png16.length, 8);
  entry16.writeUInt32LE(6 + 32 + png32.length, 12);

  const icoBuffer = Buffer.concat([header, entry32, entry16, png32, png16]);
  fs.writeFileSync(path.resolve(__dirname, '../public/favicon.ico'), icoBuffer);
  console.log('  ✓ Created public/favicon.ico (Multi-size 32x32 & 16x16)');

  // 2. GENERATE OPEN GRAPH THUMBNAIL (1200 x 630)
  console.log('🖼️ Generating Open Graph Thumbnail (1200x630)...');
  await page.setViewportSize({ width: 1200, height: 630 });

  const ogHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px;
            height: 630px;
            overflow: hidden;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background: #062817;
            color: #FFFFFF;
            position: relative;
          }

          /* Ambient Background Gradients */
          .bg-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #052012 0%, #0A3D22 45%, #062817 100%);
          }
          .glow-emerald {
            position: absolute;
            top: -120px;
            left: 200px;
            width: 550px;
            height: 550px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0) 70%);
            filter: blur(40px);
          }
          .glow-gold {
            position: absolute;
            bottom: -150px;
            right: 80px;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0) 70%);
            filter: blur(50px);
          }
          .glow-corner {
            position: absolute;
            top: 40px;
            right: -60px;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%);
            filter: blur(40px);
          }

          /* Grid pattern lines */
          .grid-overlay {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, #000 50%, transparent 100%);
          }

          /* Geometric Islamic Star Accents */
          .gold-accent-line {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, transparent 0%, #F59E0B 25%, #10B981 50%, #F59E0B 75%, transparent 100%);
          }

          /* Main Container */
          .container {
            position: relative;
            z-index: 10;
            width: 1200px;
            height: 630px;
            padding: 56px 68px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          /* Header Bar */
          .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .institution-badge {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 8px 18px 8px 14px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.16);
            backdrop-filter: blur(12px);
            border-radius: 9999px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .institution-badge img {
            width: 28px;
            height: 28px;
            object-fit: contain;
          }

          .institution-text {
            display: flex;
            flex-direction: column;
          }

          .institution-name {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #FBBF24;
          }

          .institution-sub {
            font-size: 11px;
            font-weight: 500;
            color: #A7F3D0;
            letter-spacing: 0.02em;
          }

          .live-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.35);
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            color: #34D399;
            letter-spacing: 0.04em;
          }

          .live-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10B981;
            box-shadow: 0 0 10px #10B981;
          }

          /* Body Section (2 Columns) */
          .main-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
            margin-top: 10px;
          }

          .left-col {
            flex: 1;
            max-width: 680px;
          }

          .hero-tag {
            display: inline-block;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #34D399;
            margin-bottom: 12px;
            text-shadow: 0 2px 10px rgba(52, 211, 153, 0.3);
          }

          .hero-title {
            font-size: 44px;
            font-weight: 900;
            line-height: 1.12;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            margin-bottom: 14px;
          }

          .hero-title span {
            background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-desc {
            font-size: 17px;
            font-weight: 400;
            line-height: 1.5;
            color: #D1FAE5;
            margin-bottom: 28px;
            max-width: 620px;
          }

          /* Feature Pills Grid */
          .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            font-size: 13.5px;
            font-weight: 600;
            color: #ECFDF5;
          }

          .feature-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            shrink: 0;
          }

          /* Right Col / Brand Card */
          .right-col {
            position: relative;
            width: 340px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .logo-card {
            position: relative;
            width: 290px;
            height: 290px;
            border-radius: 36px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
            border: 2px solid rgba(251, 191, 36, 0.35);
            backdrop-filter: blur(16px);
            box-shadow: 
              0 20px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.3),
              0 0 40px rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
          }

          .logo-card img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.35));
          }

          .floating-tag {
            position: absolute;
            bottom: -14px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: #FFFFFF;
            padding: 8px 18px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.05em;
            box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.3);
            white-space: nowrap;
          }

          .stat-floating-card {
            position: absolute;
            top: -16px;
            right: -16px;
            left: auto;
            z-index: 30;
            background: rgba(4, 30, 17, 0.94);
            border: 1px solid rgba(245, 158, 11, 0.5);
            backdrop-filter: blur(14px);
            padding: 9px 16px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          }

          .stat-icon {
            font-size: 18px;
          }

          .stat-text {
            display: flex;
            flex-direction: column;
          }

          .stat-label {
            font-size: 10px;
            font-weight: 600;
            color: #A7F3D0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .stat-val {
            font-size: 13px;
            font-weight: 800;
            color: #FDE68A;
          }

          /* Bottom Bar */
          .bottom-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .footer-url {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.04em;
            color: #6EE7B7;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .footer-badges {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 12px;
            color: #9CA3AF;
          }

          .footer-badges span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #D1FAE5;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="bg-base"></div>
        <div class="glow-emerald"></div>
        <div class="glow-gold"></div>
        <div class="glow-corner"></div>
        <div class="grid-overlay"></div>
        <div class="gold-accent-line"></div>

        <div class="container">
          <!-- Top Row -->
          <div class="top-bar">
            <div class="institution-badge">
              <img src="${logoDataUri}" alt="Logo Al-Ittihad" />
              <div class="institution-text">
                <span class="institution-name">MTs Al-Ittihad Pedaleman</span>
                <span class="institution-sub">Kec. Tanara, Kab. Serang — Banten</span>
              </div>
            </div>

            <div class="live-badge">
              <div class="live-dot"></div>
              <span>PORTAL MADRASAH DIGITAL</span>
            </div>
          </div>

          <!-- Main Hero -->
          <div class="main-content">
            <div class="left-col">
              <span class="hero-tag">Sistem Informasi Manajemen Madrasah</span>
              <h1 class="hero-title">
                Digitalisasi Madrasah <span>Modern & Terpadu</span>
              </h1>
              <p class="hero-desc">
                Platform terpusat untuk absensi digital QR code siswa & dewan guru, administrasi pembayaran SPP, jadwal pelajaran, dan pelaporan otomatis.
              </p>

              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon-box">⚡</div>
                  <span>Presensi Digital QR Code</span>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-box">💳</div>
                  <span>Manajemen SPP & Keuangan</span>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-box">📅</div>
                  <span>Jadwal Pelajaran Terpadu</span>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-box">📊</div>
                  <span>Buku Induk & Rekap Absensi</span>
                </div>
              </div>
            </div>

            <!-- Right Visual Logo Card -->
            <div class="right-col">
              <div class="logo-card">
                <img src="${logoDataUri}" alt="Logo Al-Ittihad Besar" />
              </div>

              <div class="stat-floating-card">
                <span class="stat-icon">✨</span>
                <div class="stat-text">
                  <span class="stat-label">Sistem Berjalan</span>
                  <span class="stat-val">Online & Terkoneksi</span>
                </div>
              </div>

              <div class="floating-tag">
                E-Madrasah Terakreditasi
              </div>
            </div>
          </div>

          <!-- Bottom Footer Row -->
          <div class="bottom-bar">
            <div class="footer-url">
              <span>🌐</span>
              <span>mts.alittihadpedaleman.web.id</span>
            </div>

            <div class="footer-badges">
              <span>🔒 Database Terproteksi</span>
              <span>⚡ Cloud Supabase</span>
              <span>📱 Responsif Desktop & Mobile</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(ogHtml);
  // Wait for Google Fonts to finish loading
  await page.evaluateHandle('document.fonts.ready');
  await page.waitForTimeout(500);

  const ogPngPath = path.resolve(__dirname, '../public/og-image.png');
  const ogJpgPath = path.resolve(__dirname, '../public/og-image.jpg');

  await page.screenshot({ path: ogPngPath });
  console.log('  ✓ Created public/og-image.png (1200x630)');

  await page.screenshot({ path: ogJpgPath, type: 'jpeg', quality: 86 });
  console.log('  ✓ Created public/og-image.jpg (1200x630, optimized for WhatsApp < 300KB)');

  await browser.close();
  console.log('✨ All assets successfully generated!');
}

run().catch(err => {
  console.error('❌ Error during asset generation:', err);
  process.exit(1);
});
