# ===========================================

# PANDUAN DEPLOYMENT SIMPLIFIED - MySQL + Git

# ===========================================

**Strategi:** MySQL Domainesia + Git Clone  
**Timeline:** 1-2 jam total  
**Kesulitan:** ⭐⭐⭐ Mudah!

---

# ✅ HARI INI: PERSIAPAN (30 MENIT)

## Step 1: Update Database ke MySQL ✅ SELESAI!

**Yang sudah dilakukan:**

- ✅ Prisma schema diubah dari SQLite ke MySQL
- ✅ File `schema.prisma` updated

---

## Step 2: Update Environment Variable

**Buka file:** `.env`

**Cari baris:**

```env
DATABASE_URL=file:./dev.db
```

**Ganti dengan:**

```env
# Development - MySQL Local (opsional, bisa skip kalau tidak punya MySQL lokal)
DATABASE_URL=mysql://root:@localhost:3306/al_ittihad_dev

# Atau tetap pakai SQLite untuk development
DATABASE_URL=file:./dev.db
```

**Note:** Untuk development lokal, Anda bisa tetap pakai SQLite. MySQL hanya untuk production.

---

## Step 3: Generate Migration Baru

**Buka terminal PowerShell, ketik:**

```bash
# Generate Prisma Client untuk MySQL
npx prisma generate
```

**Tunggu...** (30 detik)

**Lalu:**

```bash
# Create migration untuk MySQL
npx prisma migrate dev --name switch_to_mysql
```

**Akan muncul warning tentang data loss (karena ganti provider)**

- Ketik: `yes`
- Enter

**Tunggu...** (1-2 menit)

**Expected:** Migration berhasil, database lokal ter-reset dengan MySQL schema.

---

## Step 4: Test Lokal (Pastikan Tidak Error)

**Ketik:**

```bash
npm run dev
```

**Tunggu aplikasi start...**

**Test:**

1. Buka browser: `http://localhost:3000`
2. Aplikasi loading?
3. Tidak ada error di console?

**Kalau OK:** ✅ Siap push ke GitHub!

**Kalau error:** Stop, kasih tau error nya!

---

## Step 5: Commit & Push ke GitHub

**Di terminal:**

```bash
# Stop dev server (Ctrl+C)

# Add files
git add .

# Commit
git commit -m "Update schema untuk MySQL production deployment"

# Push ke GitHub
git push origin main
```

(Ganti `main` dengan nama branch Anda kalau beda)

**✅ PERSIAPAN SELESAI!**

---

# 🚀 BESOK: DEPLOYMENT (1 JAM)

## Step 1: Buat Database MySQL di cPanel (5 menit)

**1.** Login ke cPanel Domainesia:

- Go to: `https://panel.domainesia.com`
- Login

**2.** Cari menu **"MySQL Databases"** atau **"Database MySQL"**

**3.** Buat database baru:

- **Create New Database**
- Nama: `alittihad_db` (atau nama lain, catat!)
- Klik "Create Database"

**4.** Buat user database:

- **Create New User**
- Username: `alittihad_user`
- Password: (bikin password kuat, catat!)
- Klik "Create User"

**5.** Hubungkan user ke database:

- Di bagian "Add User to Database"
- Pilih user: `alittihad_user`
- Pilih database: `alittihad_db`
- Klik "Add"

**6.** Set Privileges:

- Centang **"ALL PRIVILEGES"**
- Klik "Make Changes"

**7.** Catat info ini di Notepad:

```
Database Name: alittihad_db
Database User: alittihad_user
Database Password: (password yang dibuat)
Database Host: localhost
```

**✅ Database MySQL siap!**

---

## Step 2: SSH ke Server (2 menit)

**Buka PowerShell:**

```bash
ssh username@alittihad.khaerulumam.id
```

(Ganti `username` dengan username cPanel Anda)

**Masukkan password cPanel**

**✅ Logged in!**

---

## Step 3: Clone Repository dari GitHub (2 menit)

**Ketik:**

```bash
# Pindah ke folder web
cd ~/public_html

# Clone repository
git clone https://github.com/YOUR-USERNAME/al-ittihad.git app

# Masuk ke folder app
cd app
```

**Ganti:** `YOUR-USERNAME` dengan username GitHub Anda

**✅ Kode ter-download!**

---

## Step 4: Buat File Environment (5 menit)

**Ketik:**

```bash
nano .env.production
```

**Ketik persis ini:**

```env
NODE_ENV=production

# Database MySQL Domainesia
DATABASE_URL=mysql://alittihad_user:PASSWORD@localhost:3306/alittihad_db

# URL Production
NEXTAUTH_URL=https://alittihad.khaerulumam.id
NEXTAUTH_BASEPATH=/api/auth

# Secret Key (akan generate)
NEXTAUTH_SECRET=AKAN_GENERATE

# Email
RESEND_API_KEY=re_7vgetu6B_MAP5E8EyiDqCQKPN76ZSVxbg
EMAIL_FROM=noreply@alittihad.khaerulumam.id
APP_NAME=MTs Al-Ittihad

# API
NEXT_PUBLIC_API_URL=/api
BASEPATH=
```

**GANTI:**

- `PASSWORD` → Password MySQL yang dibuat tadi
- `alittihad_user` → Username MySQL (kalau beda)
- `alittihad_db` → Nama database (kalau beda)

**Simpan:**

- `Ctrl + O`
- `Enter`
- `Ctrl + X`

---

**Generate NEXTAUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copy output!**

**Edit lagi .env.production:**

```bash
nano .env.production
```

**Ganti `AKAN_GENERATE` dengan secret yang di-copy**

**Simpan:** `Ctrl+O`, `Enter`, `Ctrl+X`

**✅ Environment configured!**

---

## Step 5: Install Dependencies (5 menit)

```bash
npm install
```

**Tunggu...** (3-5 menit)

**✅ Dependencies installed!**

---

## Step 6: Setup Database (5 menit)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed-complete
```

**⚠️ PENTING:** Saat seed, akan muncul password!

**COPY semua password yang muncul!**

```
🔐 KREDENSIAL LOGIN
👤 admin@alittihad.sch.id : xxxxxxxxx@Al
👤 tu@alittihad.sch.id : xxxxxxxxx@Tu
👤 guru@alittihad.sch.id : xxxxxxxxx@Gr
```

**Simpan di Notepad!**

**✅ Database ready!**

---

## Step 7: Build Aplikasi (5 menit)

```bash
npm run build
```

**Tunggu...** (3-5 menit)

**Harus muncul:** `✓ Compiled successfully`

**✅ Build success!**

---

## Step 8: Start Aplikasi dengan PM2 (2 menit)

```bash
# Install PM2 global
npm install -g pm2

# Start aplikasi
pm2 start npm --name "al-ittihad" -- start

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

**Cek status:**

```bash
pm2 status
```

**Harus:** Status = **online** ✅

**✅ Aplikasi running!**

---

## Step 9: Configure Domain (20 menit)

**Pilihan A: Via cPanel (Mudah)**

**1.** Buka cPanel Domainesia

**2.** Cari menu **"Setup Node.js App"** atau **"Application Manager"**

**3.** Add application:

- **Application Root:** `/public_html/app`
- **Application URL:** `https://alittihad.khaerulumam.id`
- **Application Startup File:** `npm start`
- **Port:** `3000`

**4.** Save configuration

---

**Pilihan B: Contact Domainesia Support (Paling Mudah!)**

**Kalau bingung configure Nginx:**

**1.** Buka live chat Domainesia

**2.** Kasih tau:

```
Halo, saya deploy aplikasi Next.js di hosting Cirrus 2GB.
Aplikasi sudah running di port 3000 via PM2.
Mohon bantuannya configure Nginx reverse proxy
agar domain alittihad.khaerulumam.id
pointing ke localhost:3000

Location aplikasi: /public_html/app
PM2 process: al-ittihad
```

**3.** CS Domainesia akan bantu configure!

**✅ Domain configured!**

---

## Step 10: Setup SSL (5 menit)

**Di cPanel:**

**1.** Cari menu **"SSL/TLS Status"**

**2.** Find domain: `alittihad.khaerulumam.id`

**3.** Klik **"Run AutoSSL"**

**4.** Tunggu 1-2 menit

**5.** SSL certificate ter-install otomatis (Let's Encrypt)

**✅ HTTPS aktif!**

---

# 🎉 TESTING

**Buka browser:**

```
https://alittihad.khaerulumam.id
```

**Test:**

- ✅ Homepage muncul?
- ✅ HTTPS (gembok hijau)?
- ✅ Login page bisa diakses?
- ✅ Login berhasil?
- ✅ Dashboard muncul?

**KALAU SEMUA ✅ → SUKSES! APLIKASI LIVE!** 🎊

---

# 🔄 UPDATE APLIKASI NANTI (SUPER MUDAH!)

**Di komputer lokal:**

```bash
# Edit code
# (buat changes)

# Commit
git add .
git commit -m "Update fitur X"
git push
```

**Di server (SSH):**

```bash
cd ~/public_html/app
git pull
npm install  # Kalau ada dependency baru
npm run build
pm2 restart al-ittihad
```

**Done! Update selesai!** 4 command saja! 🚀

---

# 📋 CHECKLIST LENGKAP

## Hari Ini (Persiapan):

- [ ] Update Prisma schema ke MySQL
- [ ] Generate migration
- [ ] Test lokal (npm run dev)
- [ ] Commit & push ke GitHub

## Besok (Deployment):

- [ ] Buat MySQL database di cPanel
- [ ] SSH ke server
- [ ] Git clone repository
- [ ] Create .env.production
- [ ] npm install
- [ ] Prisma migrate & seed
- [ ] npm run build
- [ ] PM2 start
- [ ] Configure domain/Nginx
- [ ] Setup SSL
- [ ] Testing

---

# 🆘 TROUBLESHOOTING

**Error saat build:**

- Pastikan .env.production sudah benar
- Cek DATABASE_URL format: `mysql://user:pass@host:3306/dbname`

**Aplikasi tidak bisa diakses via domain:**

- Cek PM2 status: `pm2 status` (harus online)
- Cek Nginx config
- Contact Domainesia support

**Database connection error:**

- Cek username, password MySQL
- Cek nama database
- Test connection: `npx prisma db pull`

---

**Total Waktu:** ~1-2 jam  
**Kesulitan:** ⭐⭐⭐ Mudah dengan panduan ini!

**Siap deploy besok!** 💪
