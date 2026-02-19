# 🚀 Quick Start Guide - API Integration

## ⚡ TL;DR - Langkah Cepat:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Generate Prisma client
npx prisma generate

# 3. Start dev server
npm run dev

# 4. Akses migration page
# http://localhost:3000/en/admin/migrate
# - Klik "Seed Data"
# - Klik "Migrate Data"

# 5. Test form baru
# http://localhost:3000/en/akademik/data-siswa/tambah
```

---

## 📋 Detailed Steps:

### Step 1: Generate Prisma Client

**Command:**

```bash
cd e:\WebProgramming\al_ittihad
npx prisma generate
```

**Ekspektasi:**

```
✔ Generated Prisma Client
✔ Start time: XXXms
```

### Step 2: Start Development Server

**Command:**

```bash
npm run dev
```

**Ekspektasi:**

```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.5s
```

### Step 3: Migration Data

**Akses:**

```
http://localhost:3000/en/admin/migrate
```

**Di halaman migration:**

1. **Check Database Status**
   - Klik tombol "Refresh"
   - Lihat jumlah data di database

2. **Seed Initial Data**
   - Klik "Seed Data"
   - Tunggu hingga selesai
   - Akan membuat:
     - 10 Transaction Categories
     - 3 Bank Accounts
     - 2 Academic Years
     - 12 SPP Rates

3. **Migrate from localStorage**
   - Klik "Migrate Data"
   - Tunggu proses selesai
   - Data siswa, SPP payments, transaksi akan dipindahkan

### Step 4: Test Form Baru

**Akses:**

```
http://localhost:3000/en/akademik/data-siswa/tambah
```

**Test Cases:**

1. **Test Validation:**
   - Klik "Simpan" tanpa isi form
   - Harusnya muncul error: "NIS wajib diisi"

2. **Test Normal Flow:**
   - Isi semua field yang required (\*):
     - NIS: 2024001
     - NISN: 0012345678
     - Nama: Ahmad Test
     - Jenis Kelamin: Laki-laki
     - Tingkat: Kelas 7
     - No HP Orang Tua: 081234567890
   - Klik "Simpan Data Siswa"
   - Harusnya:
     ✅ Button berubah jadi "Menyimpan..."
     ✅ Loading spinner muncul
     ✅ Success toast muncul
     ✅ Redirect ke halaman list

3. **Test Error Handling:**
   - Coba dengan NIS yang sama (duplicate)
   - Should show error toast

---

## 🔍 Verification Checklist:

### Database Check

**Via Prisma Studio:**

```bash
npx prisma studio
```

Akses `http://localhost:5555` untuk melihat data.

**Check Tables:**

- [ ] Student - ada data?
- [ ] Class - ada data?
- [ ] SPPPayment - ada data?
- [ ] BankAccount - ada 3 accounts?
- [ ] TransactionCategory - ada 10 categories?

### API Check

**Via Browser DevTools (F12):**

1. Buka halaman tambah siswa
2. Buka Network tab
3. Submit form
4. Check:
   - [ ] Request ke `/api/students` method POST
   - [ ] Status code 201 (Created)
   - [ ] Response berisi data siswa baru

### UI/UX Check

**AddStudentForm:**

- [ ] Loading spinner muncul saat submit
- [ ] Button disabled saat loading
- [ ] Text button berubah "Menyimpan..."
- [ ] Error alert muncul jika validasi gagal
- [ ] Success toast muncul setelah berhasil
- [ ] Error toast muncul jika API error
- [ ] Redirect ke list page setelah success

---

## ⚠️ Common Issues & Solutions:

### Issue 1: "Cannot find module '@prisma/client'"

**Solution:**

```bash
npx prisma generate
```

### Issue 2: Migration page shows error

**Check:**

1. Prisma client sudah di-generate?
2. Database file exists? (`src/prisma/dev.db`)
3. Dev server running?

**Solution:**

```bash
npx prisma db push
npx prisma generate
npm run dev
```

### Issue 3: Toast tidak muncul

**Check file:** `src/app/[lang]/layout.tsx`

Make sure there's `<ToastContainer />`:

```tsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// In component:
;<ToastContainer />
```

### Issue 4: Form submit tidak work

**Check:**

1. Buka DevTools Console (F12)
2. Lihat error message
3. Check Network tab untuk API call

**Common causes:**

- API endpoint tidak ditemukan (404)
- Validation error
- Database error

---

## 📊 What's Working Now:

### ✅ Infrastructure:

- Database schema with 14 tables
- 9 API endpoints
- Service layer
- Custom hooks
- Context V2

### ✅ Forms:

- AddStudentForm with API integration
- Loading states
- Error handling
- Data validation
- Toast notifications

### ✅ Migration:

- Migration tool page
- Seed initial data
- Migrate from localStorage

---

## ⏭️ Next Forms to Update:

The following forms still use localStorage and need to be updated:

1. **EditStudentForm** - Update student data
2. **SPPPaymentForm** - Create SPP payment
3. **AddIncomeForm** - Create income record
4. **AddExpenseForm** - Create expense record

**Want me to update these too?** Just ask! 🚀

---

## 📖 Documentation:

- **Full Guide**: `DATABASE_MIGRATION_GUIDE.md`
- **API Details**: `API_INTEGRATION_COMPLETE.md`
- **Migration Summary**: `MIGRATION_SUMMARY.md`

---

## 💡 Tips:

1. **Always backup localStorage data** before migration
2. **Use Prisma Studio** to inspect database: `npx prisma studio`
3. **Check browser console** for error messages
4. **Check Network tab** to see API requests
5. **Use "Inspect" on buttons** to see loading states

---

**Status**: ✅ Ready to use!  
**Created**: 2025-12-02  
**By**: Antigravity AI
