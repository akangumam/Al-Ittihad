# 🔐 Sistem Reset Password & Email Notifikasi

Dokumentasi lengkap untuk fitur reset password dan notifikasi email menggunakan Resend.

## ✨ Fitur yang Tersedia

### 1. **Welcome Email** (Otomatis saat tambah user baru)

- ✅ Email otomatis terkirim saat admin membuat user baru
- ✅ Berisi link untuk set password pertama kali
- ✅ Token berlaku 24 jam

### 2. **Forgot Password** (User lupa password)

- ✅ User request reset password via email
- ✅ Link reset password dikirim ke email
- ✅ Token berlaku 1 jam

### 3. **Reset Password** (Set password baru)

- ✅ User klik link di email
- ✅ Form untuk input password baru
- ✅ Email konfirmasi setelah berhasil

---

## 🚀 Cara Setup

### 1. Daftar Resend (GRATIS)

1. Kunjungi: https://resend.com
2. Klik **Sign Up** (gratis, tidak perlu kartu kredit)
3. Verifikasi email Anda
4. Login ke dashboard

### 2. Dapatkan API Key

1. Di dashboard Resend, klik **API Keys**
2. Klik **Create API Key**
3. Beri nama: `Al-Ittihad School`
4. Pilih permission: `Sending access`
5. Klik **Add**
6. **COPY API KEY** (hanya tampil sekali!)

### 3. Setup Environment Variables

Tambahkan ke file `.env`:

```env
# Resend Email
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="onboarding@resend.dev"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Keterangan:**

- `RESEND_API_KEY`: API key dari Resend
- `EMAIL_FROM`: Email pengirim
  - Development: `onboarding@resend.dev` (default Resend)
  - Production: `noreply@namadomainanda.com` (setelah verify domain)
- `NEXT_PUBLIC_APP_URL`: URL aplikasi Anda

### 4. Setup Database

Migration sudah otomatis jalan. Jika ada masalah, jalankan:

\`\`\`bash
npx prisma db push
\`\`\`

---

## 📧 Cara Pakai

### A. Tambah User Baru (Auto Email)

1. Login sebagai admin
2. Ke menu **Pengguna & Hak Akses**
3. Klik **Tambah Pengguna**
4. Isi form:
   - Nama Lengkap ✅ (wajib)
   - Username ✅ (wajib)
   - Email ✅ (opsional, tapi wajib untuk kirim email)
   - Password ✅ (wajib)
   - Role ✅
   - Status ✅
5. Klik **Tambah Pengguna**

**Yang terjadi:**

- ✅ User dibuat di database
- ✅ Email welcome otomatis terkirim (jika email diisi)
- ✅ Email berisi link untuk set password
- ✅ Link berlaku 24 jam

### B. User Lupa Password

1. User ke halaman login: `/login`
2. Klik **Lupa password?**
3. Masukkan email
4. Klik **Kirim Link Reset**
5. Cek email (inbox atau spam)
6. Klik link di email
7. Masukkan password baru
8. Login dengan password baru

### C. Reset Password Manual (Admin)

Admin juga bisa generate link reset untuk user:

1. Ke API endpoint: `/api/auth/forgot-password`
2. POST dengan body:
   \`\`\`json
   {
   "email": "user@example.com"
   }
   \`\`\`

---

## 🎯 Testing

### Test Welcome Email (Development)

\`\`\`bash

# Tambah user baru via API

curl -X POST http://localhost:3000/api/apps/user-list \\
-H "Content-Type: application/json" \\
-d '{
"fullName": "Test User",
"username": "testuser",
"email": "test@example.com",
"password": "password123",
"role": "subscriber",
"status": "active"
}'
\`\`\`

### Test Forgot Password

\`\`\`bash

# Request reset password

curl -X POST http://localhost:3000/api/auth/forgot-password \\
-H "Content-Type: application/json" \\
-d '{
"email": "test@example.com"
}'
\`\`\`

---

## 📊 Limit & Biaya

### Resend Free Tier (Gratis Selamanya)

- ✅ **3,000 email/bulan** gratis
- ✅ **100 email/hari**
- ✅ Tidak perlu kartu kredit
- ✅ Cocok untuk sekolah < 500 user

### Estimasi Penggunaan

Untuk sekolah dengan **300 user**:

- Welcome email: 50 user baru/bulan = **50 email**
- Reset password: 30 user/bulan = **30 email**
- Notifikasi lain: 100 email/bulan
- **Total: ~200 email/bulan** ✅ Masih jauh di bawah limit!

### Upgrade (Jika Perlu)

Jika melebihi limit gratis:

- **Paid Plan**: $20/bulan untuk 50,000 email
- **AWS SES**: $0.10 per 1,000 email (lebih murah)

---

## 🔧 Kustomisasi Email

### Edit Template Email

File: `src/lib/email.ts`

**Welcome Email:**
\`\`\`typescript
export async function sendWelcomeEmail(to: string, name: string, username: string, token: string) {
// Edit HTML template di sini
}
\`\`\`

**Reset Password Email:**
\`\`\`typescript
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
// Edit HTML template di sini
}
\`\`\`

### Ganti Logo/Warna

Di file `src/lib/email.ts`, cari:

- `background-color: #4CAF50` → Ganti warna primary
- `APP_NAME` → Ganti nama sekolah
- Tambahkan logo: `<img src="URL_LOGO" />`

---

## 🌐 Production Setup

### 1. Verify Domain (Opsional)

Agar email dari domain sendiri (bukan `@resend.dev`):

1. Di Resend dashboard, klik **Domains**
2. Klik **Add Domain**
3. Masukkan domain: `alittihad.sch.id`
4. Tambahkan DNS records sesuai instruksi
5. Tunggu verifikasi (1-24 jam)
6. Update `.env`:
   \`\`\`env
   EMAIL_FROM="noreply@alittihad.sch.id"
   \`\`\`

### 2. Update App URL

Update URL production di `.env`:

\`\`\`env
NEXT_PUBLIC_APP_URL="https://alittihad.sch.id"
\`\`\`

---

## 🐛 Troubleshooting

### Email tidak terkirim

1. **Cek API Key**
   \`\`\`bash
   echo $RESEND_API_KEY
   \`\`\`
   Pastikan ada dan benar

2. **Cek logs**
   Di server console, cari error message

3. **Cek Resend Dashboard**
   - Buka https://resend.com/emails
   - Lihat status pengiriman

### Link expired

- Welcome email: Token berlaku **24 jam**
- Reset password: Token berlaku **1 jam**
- Generate link baru jika expired

### Email masuk spam

Solusi:

1. Verify domain di Resend
2. Setup SPF, DKIM, DMARC records
3. Minta user tambahkan ke whitelist

---

## 📝 API Endpoints

### Create User (dengan email)

\`\`\`
POST /api/apps/user-list
Body: {
"fullName": "John Doe",
"username": "johndoe",
"email": "john@example.com",
"password": "password123",
"role": "subscriber",
"status": "active"
}
\`\`\`

### Forgot Password

\`\`\`
POST /api/auth/forgot-password
Body: {
"email": "user@example.com"
}
\`\`\`

### Reset Password

\`\`\`
POST /api/auth/reset-password
Body: {
"token": "xxxxxx",
"password": "newpassword123"
}
\`\`\`

---

## 📖 Halaman

- **Login**: `/login`
- **Forgot Password**: `/auth/forgot-password`
- **Reset Password**: `/auth/reset-password?token=xxx`
- **Set Password** (welcome): `/auth/set-password?token=xxx`

---

## 🔒 Keamanan

✅ **Token Security:**

- Disimpan di database (encrypted)
- Expire otomatis
- Dihapus setelah digunakan
- Tidak bisa digunakan 2x

✅ **Password Security:**

- Hash dengan bcrypt (12 rounds)
- Minimal 6 karakter
- Tidak disimpan plain text

✅ **Email Security:**

- Rate limiting (100 email/hari)
- Prevent email enumeration
- Token acak (32 bytes)

---

## 💡 Tips

1. **Test di Development dulu** dengan `onboarding@resend.dev`
2. **Verify domain** untuk production
3. **Monitor usage** di Resend dashboard
4. **Backup database** sebelum migration
5. **Setup SPF/DKIM** untuk deliverability

---

## 📞 Support

- **Resend Docs**: https://resend.com/docs
- **Resend Status**: https://resend.com/status
- **Community**: https://resend.com/community

---

**🎉 Selesai!** Sistem email notifikasi siap digunakan.
