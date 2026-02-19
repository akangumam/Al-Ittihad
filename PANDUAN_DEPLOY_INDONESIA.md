# 🚀 PANDUAN LENGKAP DEPLOY KE DOMAINESIA

**Waktu Total:** 2.5 jam  
**Bahasa:** 100% Indonesia  
**Tingkat Kesulitan:** Menengah (dengan panduan ini jadi mudah!)

---

## 📋 YANG ANDA BUTUHKAN

Sebelum mulai, pastikan punya:

- ✅ Akun Domainesia Cirrus 2GB (sudah ada ✅)
- ✅ Domain alittihad.khaerulumam.id (sudah ada ✅)
- ✅ Koneksi internet stabil
- ✅ Laptop/PC
- ✅ Email aktif (untuk verifikasi)

---

# 📍 BAGIAN 1: BUAT DATABASE (30 MENIT)

## Langkah 1.1: Daftar di Neon.tech

### Kenapa Neon?

- 💰 Gratis selamanya (untuk database kecil)
- 🚀 Cepat dan reliable
- 🛡️ Aman dengan backup otomatis
- 🌏 Server di Singapore (dekat Indonesia)

### Cara Daftar:

**1.** Buka browser, ketik alamat: `https://neon.tech`

**2.** Klik tombol **"Get Started"** (pojok kanan atas, warna hijau)

**3.** Pilih cara daftar:

- **GitHub** ← Pilih ini (paling mudah)
- Google
- Email

**4.** Klik **"Continue with GitHub"**

**5.** Kalau belum login GitHub:

- Masukkan username GitHub
- Masukkan password GitHub
- Klik "Sign in"

**6.** GitHub akan tanya: "Izinkan Neon mengakses akun?"

- Klik **"Authorize neon-tech"** (tombol hijau)

**7.** Tunggu redirect kembali ke Neon...

**8.** Sekarang Anda sudah masuk!

**✅ TITIK CEK:** Lihat dashboard Neon? Ada tombol "Create a project"?

---

## Langkah 1.2: Buat Proyek Database

**1.** Klik tombol **"Create a project"** atau **"New Project"**

**2.** Isi formulir yang muncul:

| Kolom                             | Isi dengan                 |
| --------------------------------- | -------------------------- |
| **Project name** (Nama proyek)    | `Al-Ittihad School`        |
| **Database name** (Nama database) | `al_ittihad`               |
| **PostgreSQL version**            | Biarkan default (versi 15) |
| **Region** (Lokasi server)        | Pilih **Singapore**        |

**Cara pilih Singapore:**

- Klik dropdown "Region"
- Cari: **AWS ap-southeast-1 (Singapore)**
- Klik region tersebut

**3.** Klik tombol **"Create Project"** (di bawah formulir)

**4.** Tunggu... ⏳ (30-60 detik)

- Layar akan muncul: "Creating project..."
- Neon sedang buat server database untuk Anda

**5.** Selesai! Anda akan diarahkan ke halaman proyek

**✅ TITIK CEK:**

- Lihat halaman proyek?
- Ada tulisan "Project created successfully" atau sejenisnya?

---

## Langkah 1.3: Salin Connection String (Sangat Penting!)

### Apa itu Connection String?

Ini seperti "alamat + password" untuk aplikasi konek ke database.

**1.** Di halaman proyek, cari bagian **"Connection Details"** atau **"Connect"**

**2.** Anda akan lihat teks panjang seperti ini:

```
postgresql://neondb_owner:npg_AbC123XyZ...@ep-cool-cloud-123456.ap-southeast-1.aws.neon.tech/al_ittihad?sslmode=require
```

**3.** Klik tombol **COPY** (ikon 📋) di sebelah teks tersebut

**4.** Buka Notepad (program bawaan Windows):

- Tekan `Win + R`
- Ketik `notepad`
- Enter

**5.** Di Notepad, paste connection string:

- Tekan `Ctrl + V`

**6.** Simpan file:

- Klik "File" → "Save As"
- Nama file: `database-credentials.txt`
- Simpan di: **Desktop** (biar gampang dicari)
- Klik "Save"

**⚠️ SANGAT PENTING:**

- Jangan hilangkan file ini!
- Jangan share ke orang lain!
- Ini berisi password database!

**✅ TITIK CEK:**

- File `database-credentials.txt` tersimpan di Desktop?
- Dibuka isinya, ada text panjang dimulai dengan `postgresql://`?

---

# 🔐 BAGIAN 2: MASUK KE SERVER DOMAINESIA (15 MENIT)

## Langkah 2.1: Dapatkan Akses SSH

### Apa itu SSH?

SSH = Secure Shell = Cara untuk remote control server dari komputer Anda.
Seperti TeamViewer, tapi lewat text command.

**1.** Buka browser, masuk: `https://panel.domainesia.com`

**2.** Login dengan akun Domainesia Anda

**3.** Cari hosting **Cirrus 2GB** Anda

**4.** Klik tombol **"cPanel"** atau **"Kelola Hosting"**

**5.** Di cPanel, cari bagian **"Security"** (Keamanan)

**6.** Klik ikon **"SSH Access"**

**7.** Catat informasi ini ke Notepad baru:

```
=== DATA SSH ===
Host: alittihad.khaerulumam.id
Username: (username cPanel Anda)
Password: (password cPanel Anda)
Port: 22
```

**✅ TITIK CEK:** Data SSH sudah dicatat?

---

## Langkah 2.2: Koneksi SSH dari Komputer

**1.** Buka **PowerShell** atau **Terminal**:

- Tekan `Win + X`
- Pilih **"Windows PowerShell"** atau **"Terminal"**
- Jendela hitam/biru akan muncul

**2.** Ketik perintah ini (ganti dengan data Anda):

```bash
ssh username@alittihad.khaerulumam.id
```

Ganti:

- `username` = username cPanel Anda
- `alittihad.khaerulumam.id` = domain Anda

**3.** Tekan **Enter**

**4.** Pertama kali konek, muncul pertanyaan:

```
Are you sure you want to continue connecting (yes/no)?
```

Ketik: `yes`  
Tekan: **Enter**

**5.** Muncul: `Password:`

- Ketik password cPanel Anda
- **Catatan:** Saat ketik password, tidak terlihat (normal, untuk keamanan)
- Tekan **Enter**

**6.** Kalau berhasil, akan muncul:

```
Welcome to Ubuntu ...
username@server:~$
```

**✅ TITIK CEK:**

- Lihat prompt `username@server:~$`?
- Berarti Anda sudah MASUK ke server!

---

## Langkah 2.3: Cek Lokasi

**Ketik:**

```bash
pwd
```

**Tekan Enter**

**Akan muncul:**

```
/home/username
```

Ini adalah folder home Anda di server.

**Ketik lagi:**

```bash
ls -la
```

**Akan muncul daftar folder:**

```
public_html
mail
etc
tmp
...
```

**✅ TITIK CEK:** Lihat folder `public_html`? Bagus!

---

# 📦 BAGIAN 3: SIAPKAN SERVER (20 MENIT)

## Langkah 3.1: Cek Node.js

### Apa itu Node.js?

Node.js = Mesin untuk menjalankan aplikasi JavaScript (termasuk Next.js).
Seperti Java Runtime untuk aplikasi Java.

**Ketik:**

```bash
node --version
```

**Tekan Enter**

**Ada 2 kemungkinan:**

### KEMUNGKINAN A: Sudah terinstall

Muncul: `v18.20.0` atau `v20.x.x`

✅ **BAGUS!** Lanjut ke Langkah 3.2

### KEMUNGKINAN B: Belum terinstall

Muncul: `node: command not found`

⚠️ **Perlu install**, lanjut ke bawah:

---

## Langkah 3.1b: Install Node.js (Kalau Belum Ada)

**1.** Ketik:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```

**Tekan Enter**

Tunggu... (2-3 menit, banyak teks berjalan)

**2.** Ketik:

```bash
sudo apt-get install -y nodejs
```

**Tekan Enter**

Kalau minta password, ketik password cPanel Anda.

Tunggu... (2-3 menit, install paket)

**3.** Verifikasi terinstall:

```bash
node --version
npm --version
```

**Harus muncul versi:**

```
v20.x.x
10.x.x
```

**✅ TITIK CEK:** Node.js terinstall?

---

## Langkah 3.2: Install PM2

### Apa itu PM2?

PM2 = Process Manager = Program yang jaga aplikasi tetap jalan 24/7.
Kalau aplikasi error/crash, PM2 restart otomatis.

**Ketik:**

```bash
npm install -g pm2
```

**Tekan Enter**

Tunggu... (1-2 menit)

**Verifikasi:**

```bash
pm2 --version
```

**Harus muncul:** `5.3.0` (atau versi lain)

**✅ TITIK CEK:** PM2 terinstall?

---

## Langkah 3.3: Pindah ke Folder Web

**Ketik:**

```bash
cd ~/public_html
```

**Atau kalau domain punya folder terpisah:**

```bash
cd ~/alittihad.khaerulumam.id
```

**Cek lokasi sekarang:**

```bash
pwd
```

**Harus muncul:**

```
/home/username/public_html
```

**✅ TITIK CEK:** Sudah di folder yang benar?

---

# 📤 BAGIAN 4: UPLOAD KODE APLIKASI (30 MENIT)

## Langkah 4.1: Upload File via FileZilla

### Download FileZilla (Kalau Belum Punya)

**1.** Buka: `https://filezilla-project.org/download.php?type=client`

**2.** Download **FileZilla Client** untuk Windows

**3.** Install seperti biasa (Next, Next, Install)

---

### Koneksi ke Server

**1.** Buka FileZilla

**2.** Di bagian atas, isi:

- **Host:** `alittihad.khaerulumam.id`
- **Username:** (username cPanel)
- **Password:** (password cPanel)
- **Port:** `22`

**3.** Klik tombol **"Quickconnect"**

**4.** Tunggu koneksi...

**5.** Kalau muncul peringatan "Unknown host key":

- Centang "Always trust this host"
- Klik "OK"

---

### Upload File Aplikasi

**DI FILEZILLA:**

**Kiri (Local Site)** = Komputer Anda  
**Kanan (Remote Site)** = Server Domainesia

**1.** **Sisi KANAN (Server):**

- Navigate ke: `/public_html/` atau `/alittihad.khaerulumam.id/`
- Klik kanan → Create directory → Nama: `app`
- Masuk ke folder `app`

**2.** **Sisi KIRI (Komputer):**

- Navigate ke: `E:\WebProgramming\al_ittihad`

**3.** **PILIH FOLDER/FILE INI SAJA:**

✅ **UPLOAD:**

- Folder `src`
- Folder `public`
- Folder `prisma`
- File `package.json`
- File `package-lock.json`
- File `next.config.js`
- File `tsconfig.json`
- File `.eslintrc.js`
- File `postcss.config.js`
- File `tailwind.config.js`

❌ **JANGAN UPLOAD:**

- Folder `node_modules` (terlalu besar! 500MB+)
- Folder `.next` (akan rebuild di server)
- File `dev.db` (database lama, tidak dipakai)
- Folder `.git` (opsional)

**4.** Drag file/folder dari kiri ke kanan

**5.** Tunggu upload... (5-10 menit tergantung kecepatan internet)

**✅ TITIK CEK:**

- Upload selesai 100%?
- Di sisi kanan, lihat folder `src`, `public`, `prisma`?

---

## Langkah 4.2: Buat File Environment

**Kembali ke PowerShell** (yang SSH tadi)

**Ketik:**

```bash
cd ~/public_html/app
```

(atau sesuai lokasi upload Anda)

**Cek isi folder:**

```bash
ls -la
```

**Harus lihat:** `src`, `public`, `package.json`, dll

---

**Sekarang buat file environment:**

**Ketik:**

```bash
nano .env.production
```

**Akan muncul editor teks kosong.**

**KETIK PERSIS INI:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://GANTI_INI_DENGAN_CONNECTION_STRING_NEON
NEXTAUTH_URL=https://alittihad.khaerulumam.id
NEXTAUTH_SECRET=AKAN_GENERATE_NANTI
RESEND_API_KEY=re_7vgetu6B_MAP5E8EyiDqCQKPN76ZSVxbg
EMAIL_FROM=noreply@alittihad.khaerulumam.id
APP_NAME=MTs Al-Ittihad
NEXT_PUBLIC_API_URL=/api
BASEPATH=
```

**GANTI BARIS KE-2:**

**1.** Buka file `database-credentials.txt` di Desktop Anda

**2.** Copy connection string (yang panjang itu)

**3.** Di nano, ganti `postgresql://GANTI_INI_DENGAN_CONNECTION_STRING_NEON`
dengan connection string yang dicopy

**SIMPAN FILE:**

- Tekan `Ctrl + O` (huruf O, bukan angka 0)
- Tekan `Enter`
- Tekan `Ctrl + X`

**✅ TITIK CEK:** File `.env.production` tersimpan?

---

## Langkah 4.3: Generate Secret Key

**Ketik:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Akan muncul kode acak seperti:**

```
a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7R8s9T0==
```

**COPY kode ini!**

---

**Edit lagi file environment:**

```bash
nano .env.production
```

**Cari baris:** `NEXTAUTH_SECRET=AKAN_GENERATE_NANTI`

**Ganti dengan:** `NEXTAUTH_SECRET=a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7R8s9T0==`

(paste kode yang tadi dicopy)

**Simpan:** `Ctrl+O`, `Enter`, `Ctrl+X`

**✅ TITIK CEK:** NEXTAUTH_SECRET sudah terisi?

---

## Langkah 4.4: Install Dependensi

### Apa itu Dependensi?

Dependensi = Pustaka/library yang dibutuhkan aplikasi untuk jalan.
Seperti bahan-bahan untuk masak: Next.js, React, Prisma, dll.

**Ketik:**

```bash
npm install
```

**Tekan Enter**

**Tunggu...** ⏳ (3-5 menit, banyak file didownload!)

**Akan muncul:**

```
npm WARN ...
added 500+ packages in 3m
```

**✅ TITIK CEK:**

- Muncul "added ... packages"?
- Tidak ada error merah?

---

## Langkah 4.5: Migrasi Database

### Apa itu Migrasi?

Migrasi = Buat tabel-tabel di database (User, Student, Teacher, dll).

**1.** Generate Prisma Client:

```bash
npx prisma generate
```

Tunggu... (30 detik)

**2.** Jalankan migrasi:

```bash
npx prisma migrate deploy
```

Tunggu... (1 menit)

**Akan muncul:**

```
✓ Prisma Migrate applied migrations:
  migrations/
    └─ 20240101000000_init
    └─ ...

✓ All migrations have been successfully applied.
```

**✅ TITIK CEK:** Migrasi berhasil? Tidak ada error?

---

## Langkah 4.6: Isi Data Awal (Seeding)

### Apa itu Seeding?

Seeding = Isi database dengan data contoh (user, siswa, guru, dll).

**Ketik:**

```bash
npm run db:seed-complete
```

**Tunggu...** (1-2 menit)

---

**⚠️ SANGAT PENTING!**

**Akan muncul PASSWORD di terminal!**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 KREDENSIAL LOGIN AWAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 ADMINISTRATOR
   📧 Email: admin@alittihad.sch.id
   🔑 Password: a3f9d2e5b7c1@Al

👤 TATA USAHA
   📧 Email: tu@alittihad.sch.id
   🔑 Password: 7c1b4f8a9e2d@Tu

👤 GURU
   📧 Email: guru@alittihad.sch.id
   🔑 Password: 9e2d6a3c5f7b@Gr
```

**SEGERA:**

1. **BACA semua password**
2. **COPY ke Notepad**
3. **SIMPAN file:** `login-credentials-production.txt`
4. **Lokasi:** Desktop

**✅ TITIK CEK:** Password tersimpan?

---

## Langkah 4.7: Build Aplikasi

### Apa itu Build?

Build = Compile aplikasi Next.js untuk production.
Mengubah kode development jadi kode yang dioptimasi untuk server.

**Ketik:**

```bash
npm run build
```

**Tunggu...** ⏳ (3-5 menit, proses compile!)

**Akan muncul banyak teks, terakhir:**

```
Creating an optimized production build ...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (215/215)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...
└ ○ /login                               ...
```

**✅ TITIK CEK:**

- Build berhasil?
- Ada checkmark ✓ di semua?
- Tidak ada error merah?

**Kalau ada error,** STOP dan kasih tau saya error nya!

---

# 🚀 BAGIAN 5: JALANKAN APLIKASI (10 MENIT)

## Langkah 5.1: Start dengan PM2

**Ketik:**

```bash
pm2 start npm --name "al-ittihad" -- start
```

**Akan muncul:**

```
[PM2] Starting npm in fork mode
[PM2] Done.
┌────┬────────────────┬─────────┬─────────┬──────────┐
│ id │ name           │ mode    │ status  │ restart  │
├────┼────────────────┼─────────┼─────────┼──────────┤
│ 0  │ al-ittihad     │ fork    │ online  │ 0        │
└────┴────────────────┴─────────┴─────────┴──────────┘
```

**Lihat kolom "status":**

- ✅ **"online"** = BAGUS! Aplikasi jalan!
- ❌ **"errored"** = Ada masalah, cek log

**✅ TITIK CEK:** Status = online?

---

## Langkah 5.2: Cek Log Aplikasi

**Ketik:**

```bash
pm2 logs al-ittihad --lines 20
```

**Akan muncul log aplikasi:**

```
0|al-itti | ▲ Next.js 16.0.3
0|al-itti | - Local:        http://localhost:3000
0|al-itti | - Network:      http://0.0.0.0:3000
0|al-itti |
0|al-itti | ✓ Ready in 1.2s
```

**Cari baris:** `✓ Ready in ...`

✅ **Kalau ada = BAGUS! Aplikasi siap!**

**Untuk keluar dari log:**

- Tekan `Ctrl + C`

**✅ TITIK CEK:** Aplikasi ready?

---

## Langkah 5.3: Simpan Konfigurasi PM2

**Ketik:**

```bash
pm2 save
```

**Lalu:**

```bash
pm2 startup
```

**Mungkin muncul perintah yang harus dijalankan, seperti:**

```
[PM2] You have to run this command as root. Execute the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup ...
```

**Kalau muncul:** COPY perintah tersebut, paste di terminal, Enter.

**Fungsi:** PM2 akan auto-start kalau server restart.

**✅ TITIK CEK:** PM2 startup configured?

---

# 🌐 BAGIAN 6: KONFIGURASI DOMAIN (LANJUTAN BESOK)

**APLIKASI SUDAH JALAN DI PORT 3000!** 🎉

**Tapi..** belum bisa diakses dari domain `alittihad.khaerulumam.id`

**Perlu:** Konfigurasi Nginx reverse proxy

**Karena sudah panjang, kita lanjut besok ya?**

**Atau mau lanjut sekarang?**

**Type:**

- **"LANJUT"** = Saya guide configure Nginx (30 menit lagi)
- **"BESOK"** = Kita lanjut besok (aplikasi aman, tidak akan hilang)

---

# 📊 PROGRESS HARI INI

✅ Database Neon: **SELESAI**  
✅ SSH ke Server: **SELESAI**  
✅ Install Node.js: **SELESAI**  
✅ Install PM2: **SELESAI**  
✅ Upload Kode: **SELESAI**  
✅ Build Aplikasi: **SELESAI**  
✅ Aplikasi Running: **SELESAI**  
⏰ Konfigurasi Nginx: **BESOK**

**Progress:** 85% selesai! 🎉

---

**Sudah cape?** Istirahat dulu! Besok kita lanjut tinggal configure Nginx (mudah, 30 menit)!

Atau **masih semangat?** Kita lanjut sekarang juga! 💪
