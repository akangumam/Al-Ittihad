# 🔑 Login Credentials - Al-Ittihad System

## Default User Accounts

Setelah menjalankan seed database (`npm run db:seed-complete` atau `npm run db:reset-complete`), sistem akan membuat 3 akun default dengan credentials berikut:

### 1. **Administrator** 👨‍💼

```
Email: admin@alittihad.sch.id
Password: password123
Role: Admin (Full Access)
```

**Akses:**

- ✅ Semua modul
- ✅ Manajemen user
- ✅ Pengaturan sistem
- ✅ Semua laporan
- ✅ Data akademik
- ✅ Data keuangan

---

### 2. **Tata Usaha** 👨‍💼

```
Email: tu@alittihad.sch.id
Password: password123
Role: Staff
```

**Akses:**

- ✅ Data siswa
- ✅ Data kelas
- ✅ Absensi
- ✅ Keuangan (Pembayaran, Pemasukan, Pengeluaran)
- ✅ Laporan keuangan
- ❌ Pengaturan sistem
- ❌ Manajemen user

---

### 3. **Guru** 👨‍🏫

```
Email: guru@alittihad.sch.id
Password: password123
Role: Teacher
```

**Akses:**

- ✅ Lihat data siswa
- ✅ Input absensi siswa
- ✅ Lihat jadwal mengajar
- ❌ Edit data siswa
- ❌ Keuangan
- ❌ Pengaturan

---

## 🔒 Keamanan

### **Password Default Harus Diganti!**

⚠️ **PENTING:** Password default (`password123`) hanya untuk development/testing. Untuk production:

1. **Setelah login pertama kali**, segera ganti password via:
   - Navigate ke **Profile** → **Change Password**
   - Atau gunakan fitur **Forgot Password** di login page

2. **Buat password yang kuat:**
   - Minimal 8 karakter
   - Kombinasi huruf besar & kecil
   - Gunakan angka dan simbol
   - Contoh: `Al!tt1had@2026`

---

## 📖 Cara Login

### **Step-by-Step:**

1. **Buka aplikasi**: `http://localhost:3000` (development)
2. **Pilih salah satu email** dari list di atas
3. **Masukkan password**: `password123`
4. **Klik "Login"**
5. **Ganti password** (recommended untuk production)

---

## 🔄 Reset Password Jika Lupa

Jika lupa password yang sudah diganti:

### **Option 1: Via Database Reset** (Development Only)

```bash
npm run db:reset-complete
```

⚠️ **WARNING:** Ini akan reset SEMUA data ke default!

### **Option 2: Via Forgot Password Feature**

1. Klik "Forgot Password?" di login page
2. Masukkan email
3. Check email untuk link reset
4. Buat password baru

### **Option 3: Via Database Manual** (Advanced)

```bash
# Reset password via Prisma Studio
npx prisma studio

# 1. Buka table "User"
# 2. Cari user yang ingin di-reset
# 3. Update field "password" dengan hash baru
```

---

## 🛡️ Best Practices

### **Untuk Production:**

1. ✅ **Hapus/disable akun default** setelah buat akun admin sendiri
2. ✅ **Gunakan email resmi sekolah**
3. ✅ **Aktifkan email verification**
4. ✅ **Enforce password policy** (min length, complexity)
5. ✅ **Enable 2FA** (jika tersedia)
6. ✅ **Regular password rotation** (ganti setiap 3-6 bulan)
7. ✅ **Monitor activity logs** untuk aktivitas mencurigakan

---

## 📝 Troubleshooting

### **Problem: "Password salah" meskipun sudah benar**

**Solusi:**

1. Check CAPS LOCK tidak aktif
2. Pastikan tidak ada spasi di awal/akhir password
3. Copy-paste password dari document ini: `password123`
4. Clear browser cache & cookies
5. Try incognitomode

### **Problem: "Email tidak ditemukan"**

**Solusi:**

1. Check database sudah di-seed: `npm run db:seed-complete`
2. Verify dengan Prisma Studio: `npx prisma studio`
3. Check table "User" ada 3 records

### **Problem: "Account locked"**

**Solusi:**

1. Wait 15 menit (auto unlock)
2. Atau reset via database (development only)

---

## 📚 Related Documents

- [TUTORIAL_SETUP_AWAL.md](./TUTORIAL_SETUP_AWAL.md) - Setup panduan lengkap
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference
- [DATABASE_SEEDING_GUIDE.md](./DATABASE_SEEDING_GUIDE.md) - Database seeding guide

---

## 🆘 Need Help?

Jika masih ada masalah login:

1. Check console browser (F12) untuk error messages
2. Check terminal server untuk backend errors
3. Verify `.env` file configured correctly
4. Contact system administrator

---

**Last Updated:** 2026-02-04
**Version:** 1.0
