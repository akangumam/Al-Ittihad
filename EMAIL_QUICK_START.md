# 🚀 Quick Start - Email System

Setup email system dalam 5 menit!

## Step 1: Daftar Resend (2 menit)

1. Buka https://resend.com
2. Sign up (gratis!)
3. Klik "API Keys" → "Create API Key"
4. Copy API key yang muncul

## Step 2: Update .env (1 menit)

```bash
# Paste API key Anda di sini
RESEND_API_KEY=re_YOUR_API_KEY_HERE

# Untuk testing, gunakan:
EMAIL_FROM=onboarding@resend.dev

# Sudah ada:
APP_NAME=MTs Al-Ittihad
```

## Step 3: Test Email (2 menit)

```bash
# Restart server jika sudah running
Ctrl+C
npm run dev

# Di terminal baru, test email
npm run test-email your.email@gmail.com
```

## Expected Result ✅

```
🧪 Testing Email System...
✅ RESEND_API_KEY is set
✅ Welcome email sent successfully!
✅ Password reset email sent successfully!
🎉 All email tests passed!

📬 Please check your inbox at: your.email@gmail.com
```

## Step 4: Cek Email Anda 📧

Anda harus menerima 2 email:

1. **Welcome email** - dengan tombol "Buat Password"
2. **Reset password email** - dengan tombol "Reset Password"

---

## ✅ Selesai!

Email system sudah siap digunakan.

### Selanjutnya:

- Baca [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) untuk panduan lengkap
- Test buat user baru di aplikasi
- Setup domain untuk production (opsional)

---

## ❌ Jika Gagal:

**Email tidak terkirim?**

```bash
# Cek API key
cat .env | grep RESEND_API_KEY

# Pastikan tidak kosong dan format benar: re_xxxxx
```

**Error "RESEND_API_KEY is not set"?**

- Pastikan `.env` sudah disimpan
- Restart development server
- Coba lagi

**Masih error?**

- Baca [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) - Troubleshooting section
- Check Resend dashboard untuk error logs

---

**Need help?** Buka EMAIL_SETUP_GUIDE.md untuk panduan lengkap!
