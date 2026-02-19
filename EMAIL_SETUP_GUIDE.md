# 📧 Email System Setup Guide

Panduan lengkap untuk setup dan menggunakan email system di MTs Al-Ittihad.

## 📋 Daftar Isi

1. [Setup Resend](#setup-resend)
2. [Konfigurasi Environment](#konfigurasi-environment)
3. [Testing Email System](#testing-email-system)
4. [Cara Penggunaan](#cara-penggunaan)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Resend

### 1. Daftar Akun Resend (Gratis)

1. Buka [https://resend.com](https://resend.com)
2. Klik **"Sign Up"** atau **"Get Started"**
3. Daftar dengan GitHub atau email
4. Verifikasi email Anda

**✨ Free Plan:**

- ✅ 3,000 emails per bulan
- ✅ 100 emails per hari
- ✅ Cukup untuk development & sekolah kecil-menengah

### 2. Dapatkan API Key

1. Login ke dashboard Resend
2. Klik menu **"API Keys"** di sidebar
3. Klik **"Create API Key"**
4. Beri nama: `al-ittihad-dev` (atau sesuai keinginan)
5. **COPY** API key yang muncul ⚠️ (hanya muncul 1x!)
6. Simpan di tempat aman

### 3. Setup Domain (Optional - untuk Production)

**Untuk Development/Testing:**

- Gunakan `onboarding@resend.dev` (sudah otomatis verified)
- Bisa langsung kirim email tanpa setup domain

**Untuk Production:**

1. Di dashboard Resend, klik **"Domains"**
2. Klik **"Add Domain"**
3. Masukkan domain sekolah (misal: `mts-alittihad.sch.id`)
4. Ikuti instruksi untuk add DNS records
5. Tunggu verifikasi (biasanya 5-30 menit)

---

## ⚙️ Konfigurasi Environment

### 1. Update File `.env`

```bash
# Email Configuration
RESEND_API_KEY=re_123456789_PASTE_YOUR_KEY_HERE

# Untuk Testing (gunakan resend test email)
EMAIL_FROM=onboarding@resend.dev

# Untuk Production (setelah domain verified)
# EMAIL_FROM=noreply@mts-alittihad.sch.id

APP_NAME=MTs Al-Ittihad
```

### 2. Restart Development Server

```bash
# Ctrl+C untuk stop server
npm run dev
```

---

## 🧪 Testing Email System

### Cara Test

```bash
# Test dengan email Anda sendiri
npm run test-email your.email@gmail.com

# Atau dengan Node
node scripts/test-email.js your.email@gmail.com
```

### Yang Akan Terjadi

Script akan:

1. ✅ Check apakah RESEND_API_KEY sudah diset
2. ✅ Kirim 2 email test:
   - Welcome email (dengan link set password)
   - Password reset email
3. ✅ Tampilkan hasil di console

### Expected Output

```
🧪 Testing Email System...

📧 Test email will be sent to: your.email@gmail.com

1️⃣ Checking environment variables...
✅ RESEND_API_KEY is set

2️⃣ Testing Welcome Email...
✅ Welcome email sent successfully!
   Email ID: abc123...

3️⃣ Testing Password Reset Email...
✅ Password reset email sent successfully!
   Email ID: def456...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 All email tests passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📬 Please check your inbox at: your.email@gmail.com
```

---

## 📖 Cara Penggunaan

### A. Membuat User Baru (By Admin)

**Admin akan:**

1. Login sebagai admin
2. Buka menu **"Manajemen Pengguna"** atau **"Roles & Permissions"**
3. Klik tombol **"Tambah Pengguna"**
4. Isi form:
   ```
   Nama Lengkap: Ahmad Zaky
   Email: ahmad.zaky@example.com  ⭐ PENTING!
   Username: ahmadzaky
   Password: temporary123  (user bisa ganti nanti)
   Role: Guru / Admin / dll
   ```
5. Klik **"Simpan"**

**Yang Terjadi Otomatis:**

- ✉️ Email "Welcome" terkirim ke `ahmad.zaky@example.com`
- 📝 Berisi link untuk set password (valid 24 jam)
- 🔐 User klik link → set password sendiri → bisa login

**Email yang Diterima User:**

```
Subject: Selamat Datang di MTs Al-Ittihad - Buat Password Anda

Halo Ahmad Zaky,

Selamat datang di MTs Al-Ittihad!

Akun Anda telah berhasil dibuat:
- Username: ahmadzaky
- Email: ahmad.zaky@example.com

[Tombol: Buat Password] ← Link ke set password

Link ini akan kadaluarsa dalam 24 jam.
```

### B. Reset Password (By User)

**User yang lupa password:**

1. Buka halaman login: `/login`
2. Klik **"Lupa Password?"**
3. Masukkan email yang terdaftar
4. Klik **"Kirim Link Reset"**
5. Cek email → klik link
6. Masukkan password baru (2x untuk konfirmasi)
7. Klik **"Reset Password"**
8. ✅ Selesai! Login dengan password baru

**Email yang Diterima:**

```
Subject: Reset Password - MTs Al-Ittihad

Halo Ahmad Zaky,

Kami menerima permintaan untuk mereset password akun Anda.

[Tombol: Reset Password] ← Link untuk ganti password

Link ini akan kadaluarsa dalam 1 jam.
Jika Anda tidak meminta reset, abaikan email ini.
```

---

## 🐛 Troubleshooting

### Problem 1: Email Tidak Terkirim

**Cek:**

```bash
# 1. Pastikan API key sudah benar
cat .env | grep RESEND_API_KEY

# 2. Test koneksi ke Resend
npm run test-email your@email.com
```

**Solusi:**

- ✅ Pastikan `RESEND_API_KEY` tidak kosong
- ✅ Pastikan tidak ada spasi di awal/akhir API key
- ✅ Pastikan format API key benar: `re_xxxxxxxxxxxx`
- ✅ Restart development server

### Problem 2: Email Masuk Spam

**Solusi:**

- ✅ **Development**: Wajar jika menggunakan `onboarding@resend.dev`
- ✅ **Production**: Setup domain verification + SPF/DKIM records
- ✅ Minta user whitelist email dari domain Anda

### Problem 3: Link Reset Tidak Berfungsi

**Cek:**

- ✅ Pastikan `NEXTAUTH_URL` di `.env` sesuai dengan URL aktual
- ✅ Untuk localhost: `http://localhost:3000`
- ✅ Untuk production: `https://yourdomain.com`

**Update jika perlu:**

```bash
# .env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### Problem 4: Token Expired

**Durasi Token:**

- Welcome token: 24 jam
- Reset token: 1 jam

**Solusi:**

- User perlu minta kirim ulang email
- Admin bisa resend dari UI (fitur opsional)

---

## 📊 Monitoring

### Cek Status Email di Resend Dashboard

1. Login ke [resend.com](https://resend.com)
2. Klik menu **"Emails"** atau **"Logs"**
3. Lihat status setiap email:
   - ✅ **Delivered** - Berhasil terkirim
   - ⏳ **Pending** - Sedang diproses
   - ❌ **Bounced** - Email tidak valid
   - 🚫 **Rejected** - Ditolak (spam/invalid)

### Email Analytics

Dashboard Resend menampilkan:

- Total emails sent
- Delivery rate
- Bounce rate
- Spam complaints

---

## 🔐 Security Best Practices

1. **JANGAN** commit `.env` ke Git

   ```bash
   # Sudah ada di .gitignore
   .env
   .env.local
   ```

2. **Gunakan** environment variables berbeda untuk prod/dev

   ```bash
   # .env.local (development)
   RESEND_API_KEY=re_dev_xxx

   # Production (di server/hosting)
   RESEND_API_KEY=re_prod_xxx
   ```

3. **Batasi** API key permissions (jika memungkinkan)
   - Hanya permission "Send Emails"

4. **Monitor** usage di dashboard Resend
   - Set alert jika mendekati limit

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)

---

## ❓ FAQ

**Q: Berapa biaya Resend?**
A: Gratis untuk 3,000 email/bulan. Cukup untuk sekolah kecil-menengah.

**Q: Apakah bisa pakai Gmail/SMTP lain?**
A: Bisa, tapi perlu modifikasi kode di `src/lib/email.ts`. Resend lebih mudah dan reliable.

**Q: Apakah email aman?**
A: Ya, Resend menggunakan TLS encryption dan comply dengan standar email security.

**Q: Bagaimana jika user tidak punya email?**
A: Admin bisa buat akun dengan email dummy (`username@internal.local`), tapi user tidak akan terima email welcome. Password harus diset manual oleh admin.

---

## 📞 Support

Jika ada masalah:

1. Cek troubleshooting guide di atas
2. Cek Resend dashboard untuk error logs
3. Hubungi developer atau buka issue di repository

---

**Last Updated:** 2026-02-03
**Version:** 1.0
