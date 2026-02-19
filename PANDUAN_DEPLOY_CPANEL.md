# 🚀 PANDUAN DEPLOY AL-ITTIHAD KE cPANEL DOMAINESIA

**Domain:** `https://alittihad.khaerulumam.id`  
**Hosting:** Cloud Domainesia (cPanel + Node.js + SSH)  
**Database:** MySQL (via cPanel)  
**Source Code:** GitHub Private → `akangumam/MTs-Al-Ittihad`  
**Flow:** Git Pull dari cPanel Terminal  
**Estimasi Waktu:** 1-2 jam

---

## 📋 ARSITEKTUR DEPLOYMENT

```
┌──────────────┐   git push   ┌──────────────┐   git pull   ┌──────────────────────────┐
│  PC Lokal    │ ──────────→  │   GitHub      │ ←─────────  │  cPanel Domainesia       │
│  Development │              │   (Private)   │             │                          │
└──────────────┘              └──────────────┘             │  ┌─ Node.js App (Next.js) │
                                                           │  ├─ MySQL Database        │
                                                           │  ├─ SSL (AutoSSL)         │
                                                           │  └─ Domain Config         │
                                                           └──────────────────────────┘
```

**Flow Update Nanti:**

```
Lokal: edit → commit → push  →  Server: git pull → build → restart
```

---

## 📝 LANGKAH PER LANGKAH

---

## FASE 1: PERSIAPAN DI PC LOKAL (15 menit)

### Step 1.1: Buat GitHub Personal Access Token

Karena repo **private**, server perlu token untuk `git clone` / `git pull`.

1. Buka: https://github.com/settings/tokens?type=beta
2. Klik **"Generate new token"**
3. Isi:
   - **Token name:** `server-alittihad`
   - **Expiration:** 90 days (atau Custom → 1 year)
   - **Repository access:** → "Only select repositories" → pilih `MTs-Al-Ittihad`
   - **Permissions → Repository permissions:**
     - Contents: **Read-only** ✅
     - Metadata: **Read-only** ✅
4. Klik **"Generate token"**
5. **⚠️ COPY TOKEN! Simpan di Notepad!** (tidak bisa dilihat lagi setelah ditutup)

Token formatnya seperti: `github_pat_xxxxxxxxxxxxxxxxxxxx`

### Step 1.2: Pastikan Code Sudah Push ke GitHub

Code sudah sinkron ✅ (sudah dicek, `main` branch up to date)

Kalau ada perubahan baru, jalankan:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## FASE 2: SETUP DATABASE MYSQL DI cPANEL (10 menit)

### Step 2.1: Login cPanel

1. Buka: `https://panel.domainesia.com` atau URL cPanel hosting Anda
2. Login dengan kredensial hosting

### Step 2.2: Buat Database MySQL

1. Cari menu **"MySQL® Databases"** (atau "Database MySQL")
2. **Create New Database:**
   - Nama database: `alittihad_db`
   - Klik **"Create Database"**
   - ✅ Catat nama lengkap database (biasanya: `cpanelusername_alittihad_db`)

3. **Create New User:**
   - Username: `alittihad_usr`
   - Password: buat password kuat (pakai password generator cPanel)
   - Klik **"Create User"**
   - ✅ Catat username lengkap dan password

4. **Add User to Database:**
   - Pilih user yang baru dibuat
   - Pilih database yang baru dibuat
   - Klik **"Add"**

5. **Set Privileges:**
   - Centang **"ALL PRIVILEGES"**
   - Klik **"Make Changes"**

### Step 2.3: Catat Info Database

```
Database Host:     localhost
Database Name:     cpanelusername_alittihad_db
Database User:     cpanelusername_alittihad_usr
Database Password: (password yang dibuat)
```

> ⚠️ **Penting:** Di cPanel, nama database dan user biasanya diawali `cpanelusername_`.
> Contoh: kalau username cPanel Anda `khaerulum`, maka:
>
> - Database: `khaerulum_alittihad_db`
> - User: `khaerulum_alittihad_usr`

---

## FASE 3: CLONE REPOSITORY DI SERVER (10 menit)

### Step 3.1: Buka Terminal cPanel

1. Di cPanel, cari menu **"Terminal"**
2. Klik untuk buka terminal di browser

### Step 3.2: Clone dari GitHub

```bash
# Masuk ke public_html (atau folder yang diinginkan)
cd ~/

# Clone repository (ganti TOKEN dengan Personal Access Token)
git clone https://TOKEN@github.com/akangumam/MTs-Al-Ittihad.git app

# Masuk ke folder app
cd app

# Verifikasi clone berhasil
ls -la
```

> 💡 **Ganti `TOKEN`** dengan Personal Access Token dari Step 1.1

> 💡 Kita clone ke `~/app` (bukan `~/public_html/`) agar tidak konflik dengan file cPanel default.

### Step 3.3: Simpan Credential agar Git Pull Tidak Perlu Token Lagi

```bash
cd ~/app
git config credential.helper store
```

Dengan ini, setiap kali `git pull` nanti, tidak perlu input token lagi.

---

## FASE 4: KONFIGURASI ENVIRONMENT (10 menit)

### Step 4.1: Buat File `.env.production`

```bash
cd ~/app
nano .env.production
```

**Paste konten berikut** (ganti value sesuai kebutuhan):

```env
# ========================================
# PRODUCTION ENVIRONMENT - Al-Ittihad
# ========================================

NODE_ENV=production

# Database MySQL Domainesia
# Ganti cpanelusername_alittihad_db, cpanelusername_alittihad_usr, dan PASSWORD
DATABASE_URL=mysql://cpanelusername_alittihad_usr:PASSWORD@localhost:3306/cpanelusername_alittihad_db

# URL Production
NEXTAUTH_URL=https://alittihad.khaerulumam.id
NEXTAUTH_BASEPATH=/api/auth

# Secret Key (generate di step berikutnya)
NEXTAUTH_SECRET=AKAN_DIGANTI

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@alittihad.khaerulumam.id
APP_NAME=MTs Al-Ittihad

# API
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_URL=https://alittihad.khaerulumam.id
BASEPATH=
```

**Simpan:** `Ctrl + O` → `Enter` → `Ctrl + X`

### Step 4.2: Generate NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copy output-nya!** Lalu edit `.env.production` lagi:

```bash
nano .env.production
```

Ganti `AKAN_DIGANTI` dengan secret yang di-copy.

**Simpan:** `Ctrl + O` → `Enter` → `Ctrl + X`

### Step 4.3: Buat File `.env` (Symlink ke Production)

```bash
cd ~/app
ln -sf .env.production .env
```

> Prisma membaca dari `.env`, jadi kita perlu symlink atau copy.

---

## FASE 5: INSTALL & BUILD (20-30 menit)

### Step 5.1: Setup Node.js App di cPanel

1. Kembali ke **cPanel** (browser)
2. Cari menu **"Setup Node.js App"**
3. Klik **"Create Application"**
4. Isi:
   - **Node.js Version:** `18.x` atau `20.x` (pilih yang >= 18.17.0)
   - **Application Mode:** `Production`
   - **Application Root:** `app` (folder yang tadi di-clone)
   - **Application URL:** `alittihad.khaerulumam.id` (pilih domain)
   - **Application Startup File:** `server.js`
5. Klik **"Create"**

> ⚠️ **PENTING:** Setelah create, cPanel akan menampilkan command untuk "enter virtual environment".
> **COPY command tersebut!** Biasanya seperti:
>
> ```bash
> source /home/cpanelusername/nodevenv/app/18/bin/activate
> ```
>
> Atau:
>
> ```bash
> source /home/cpanelusername/nodevenv/app/20/bin/activate && cd /home/cpanelusername/app
> ```

### Step 5.2: Install Dependencies via Terminal

```bash
# Buka Terminal cPanel lagi

# ⚠️ WAJIB: Aktifkan Node.js environment dulu!
# Paste command yang di-copy dari Step 5.1, contoh:
source /home/cpanelusername/nodevenv/app/20/bin/activate

# Masuk ke folder app
cd ~/app

# Verifikasi Node.js aktif
node --version  # Harus >= 18.17.0
npm --version

# Install dependencies
npm install

# Ini akan otomatis menjalankan postinstall (prisma generate + build:icons)
```

> ⏳ Proses `npm install` bisa memakan waktu 3-10 menit di server.

### Step 5.3: Setup Database

```bash
# Pastikan masih di ~/app dan Node.js env aktif

# Run database migration
npx prisma migrate deploy

# Seed data awal (users, academic year, dll)
npm run db:seed-complete
```

> ⚠️ **PENTING:** Saat seed, akan muncul kredensial login!
>
> ```
> 🔐 KREDENSIAL LOGIN
> 👤 admin@alittihad.sch.id : xxxxxxxxx
> 👤 tu@alittihad.sch.id    : xxxxxxxxx
> 👤 guru@alittihad.sch.id  : xxxxxxxxx
> ```
>
> **CATAT DAN SIMPAN SEMUA PASSWORD!**

### Step 5.4: Build Aplikasi

```bash
# Build production
npm run build
```

> ⏳ Proses build bisa memakan waktu 3-10 menit.
> Harus muncul: `✓ Compiled successfully` atau `✓ Creating an optimized production build`

---

## FASE 6: START APLIKASI (5 menit)

### Step 6.1: Restart Node.js App via cPanel

1. Kembali ke **cPanel** → **"Setup Node.js App"**
2. Klik tombol **"Restart"** (ikon ↻) pada app yang sudah dibuat
3. Tunggu beberapa detik
4. Status harus menunjukkan **Running** ✅

### Step 6.2: Test Akses

Buka browser:

```
https://alittihad.khaerulumam.id
```

**Checklist:**

- [ ] ✅ Homepage/landing page muncul?
- [ ] ✅ HTTPS aktif (gembok hijau)?
- [ ] ✅ Login page (`/login`) bisa diakses?
- [ ] ✅ Bisa login dengan kredensial seed?
- [ ] ✅ Dashboard muncul setelah login?

---

## FASE 7: SETUP SSL (5 menit)

### Step 7.1: Aktifkan AutoSSL

1. Di cPanel, cari **"SSL/TLS Status"**
2. Temukan domain `alittihad.khaerulumam.id`
3. Klik **"Run AutoSSL"**
4. Tunggu 1-2 menit
5. Status berubah menjadi ✅ (sertifikat ter-install)

> Kalau SSL sudah aktif sebelumnya, skip langkah ini.

---

## 🔄 CARA UPDATE APLIKASI (NANTI)

### Di PC Lokal:

```bash
# Edit kode...

# Commit & Push
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

### Di cPanel Terminal:

```bash
# Aktifkan Node.js env (WAJIB setiap buka terminal baru!)
source /home/cpanelusername/nodevenv/app/20/bin/activate

# Masuk ke folder
cd ~/app

# Pull perubahan terbaru
git pull origin main

# Install dependency baru (kalau ada)
npm install

# Kalau ada perubahan database schema:
npx prisma migrate deploy

# Build ulang
npm run build

# Restart via cPanel → Setup Node.js App → klik Restart
# ATAU bisa touch file:
touch tmp/restart.txt
```

> 💡 **Shortcut update (4 command):**
>
> ```bash
> cd ~/app && git pull && npm run build && touch tmp/restart.txt
> ```

---

## 🆘 TROUBLESHOOTING

### ❌ Error: "Cannot connect to database"

```bash
# Cek DATABASE_URL
cat .env.production | grep DATABASE_URL

# Test koneksi
npx prisma db pull

# Pastikan format benar:
# mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
```

**Penyebab umum:**

- Username/password salah
- Nama database salah (Ingat prefix `cpanelusername_`)
- User belum di-add ke database di cPanel

### ❌ Error: "Application Error" atau 502

```bash
# Cek log error
cat ~/app/logs/error.log   # atau
cat ~/app/.next/server/logs/*

# Pastikan .env.production benar
cat ~/app/.env.production

# Rebuild
cd ~/app
npm run build

# Restart di cPanel → Setup Node.js App
```

### ❌ Error: "Module not found" saat build

```bash
# Re-install dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### ❌ Error: "git pull" permission denied

```bash
# Reset credential
cd ~/app
git remote set-url origin https://TOKEN@github.com/akangumam/MTs-Al-Ittihad.git
git pull origin main
```

### ❌ Halaman 404 / Blank setelah deploy

```bash
# Pastikan startup file benar (server.js)
cat ~/app/server.js

# Cek apakah .next folder ada
ls -la ~/app/.next/

# Kalau .next tidak ada, build lagi:
npm run build
```

### ❌ Error: Prisma binary not found

```bash
# Regenerate prisma client
npx prisma generate

# Kalau masih error, force reinstall
npm install @prisma/client
npx prisma generate
```

---

## 📋 CHECKLIST DEPLOYMENT

### Persiapan:

- [ ] GitHub Personal Access Token sudah dibuat
- [ ] Code terbaru sudah push ke GitHub

### Server:

- [ ] MySQL database + user sudah dibuat di cPanel
- [ ] Repository sudah di-clone di server
- [ ] `.env.production` sudah dibuat dengan credential benar
- [ ] `npm install` berhasil
- [ ] `prisma migrate deploy` berhasil
- [ ] `db:seed-complete` berhasil (password tercatat!)
- [ ] `npm run build` berhasil
- [ ] Node.js App sudah di-setup di cPanel
- [ ] Startup file: `server.js`

### Testing:

- [ ] Website bisa diakses via domain
- [ ] HTTPS aktif (gembok hijau)
- [ ] Login berfungsi
- [ ] Dashboard muncul
- [ ] CRUD operasi berfungsi (tambah/edit/hapus data)

---

## 📞 BANTUAN

**Domainesia Support:**

- Live Chat: https://www.domainesia.com
- Phone: 0274 5305505
- Email: cs@domainesia.com

**Kalau bingung configure Node.js App, sampaikan ini ke CS:**

```
Halo, saya deploy aplikasi Next.js di Cloud Hosting.
Application root: ~/app
Startup file: server.js
Node.js version: 20.x
Mohon bantu pastikan domain alittihad.khaerulumam.id
pointing ke aplikasi Node.js ini.
```

---

**Selamat men-deploy! 🚀**
