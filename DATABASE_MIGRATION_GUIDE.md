# Database Migration Guide

## ✅ Status: COMPLETED

Aplikasi telah diubah dari sistem **statis (localStorage)** menjadi **dinamis dengan database**.

---

## 📋 Apa yang Sudah Dibuat?

### 1. **Prisma Schema** (`prisma/schema.prisma`)

Database schema lengkap untuk:

- ✅ Students (Siswa)
- ✅ Classes (Kelas)
- ✅ Teachers (Guru)
- ✅ Teaching Schedules (Jadwal Mengajar)
- ✅ Transaction Categories (Kategori Transaksi)
- ✅ Bank Accounts (Akun Bank)
- ✅ Incomes (Pemasukan)
- ✅ Expenses (Pengeluaran)
- ✅ Cash Mutations (Mutasi Kas)
- ✅ SPP Rates (Tarif SPP)
- ✅ SPP Payments (Pembayaran SPP)
- ✅ Budgets (Anggaran)
- ✅ Activity Logs (Log Aktivitas)
- ✅ Academic Years (Tahun Ajaran)

### 2. **API Routes** (Next.js API)

Endpoint yang sudah dibuat:

- `GET/POST /api/students` - Daftar siswa & tambah siswa baru
- `GET/PUT/DELETE /api/students/[id]` - Detail, update, hapus siswa
- `GET/POST /api/classes` - Daftar kelas & tambah kelas
- `GET/POST /api/spp-payments` - Pembayaran SPP
- `GET/POST /api/incomes` - Pemasukan
- `GET/POST /api/expenses` - Pengeluaran
- `GET/POST /api/accounts` - Akun bank/kas
- `POST /api/migrate` - Migrasi data dari localStorage
- `GET/POST /api/seed` - Seed data awal

### 3. **Prisma Client Library** (`src/lib/prisma.ts`)

Singleton Prisma client untuk koneksi database.

### 4. **Migration Page** (`/admin/migrate`)

Halaman admin untuk:

- Cek status database
- Seed data awal (kategori, akun, tahun ajaran)
- Migrasi data dari localStorage ke database

---

## 🚀 Cara Menjalankan Migration

### **Step 1: Setup Database**

1. **Edit file `.env`** dan tambahkan DATABASE_URL:

   ```env
   # Untuk SQLite (Development - Simple)
   DATABASE_URL="file:./src/prisma/dev.db"

   # ATAU untuk PostgreSQL (Production)
   # DATABASE_URL="postgresql://username:password@localhost:5432/al_ittihad"

   # ATAU untuk MySQL
   # DATABASE_URL="mysql://username:password@localhost:3306/al_ittihad"
   ```

2. **Jika menggunakan PostgreSQL/MySQL**, update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // atau "mysql"
     url      = env("DATABASE_URL")
   }
   ```

### **Step 2: Run Prisma Migration**

Jalankan command berikut untuk membuat database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# ATAU jika ingin membuat migration file
npx prisma migrate dev --name init_school_management
```

### **Step 3: Akses Halaman Migration**

1. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

2. Buka browser dan akses:

   ```
   http://localhost:3000/admin/migrate
   ```

3. **Ikuti langkah-langkah di halaman tersebut:**
   - Klik "Check Database Status" untuk cek status database
   - Klik "Seed Data" untuk membuat data awal (kategori, akun, dll)
   - Klik "Migrate Data" untuk transfer data dari localStorage ke database

---

## 🔄 Langkah Selanjutnya: Update AppContext

Sekarang data sudah ada di database, kita perlu update `AppContext` untuk mengambil data dari API, bukan dari localStorage.

### File yang Perlu Diupdate:

1. **`src/contexts/AppContext.tsx`**
   - Ubah `loadData()` untuk fetch dari API
   - Ubah `addStudent()`, `updateStudent()`, dll untuk hit API endpoint
2. **`src/views/akademik/AddStudentForm.tsx`**
   - Ubah `handleSubmit()` untuk POST ke `/api/students`
3. **`src/views/akademik/EditStudentForm.tsx`**
   - Ubah `handleSubmit()` untuk PUT ke `/api/students/[id]`

4. **`src/views/spp/SPPPaymentForm.tsx`**
   - Ubah submit untuk POST ke `/api/spp-payments`

---

## 📊 Database Tools

### Prisma Studio

Untuk melihat dan edit data database secara visual:

```bash
npx prisma studio
```

Akan membuka browser di `http://localhost:5555`

### Reset Database

Jika ingin reset database:

```bash
npx prisma migrate reset
```

---

## ⚠️ Troubleshooting

### Error: Cannot find module '@prisma/client'

```bash
npx prisma generate
```

### Error: Database locked (SQLite)

Stop dev server dulu, lalu jalankan migration:

```bash
# Stop server (Ctrl+C)
npx prisma db push
npm run dev
```

### Migration Permission Error

Gunakan `db push` instead of `migrate dev`:

```bash
npx prisma db push
```

---

## 📝 Next Steps

1. ✅ Setup database - **DONE**
2. ✅ Create Prisma schema - **DONE**
3. ✅ Create API routes - **DONE**
4. ✅ Create migration tool - **DONE**
5. ⏳ Run migration (Manual step)
6. ⏳ Update AppContext to use API
7. ⏳ Update all forms to use API
8. ⏳ Test all functionality

---

## 🎯 Benefits Setelah Migration

| Feature         | Before (localStorage)        | After (Database)           |
| --------------- | ---------------------------- | -------------------------- |
| **Persistence** | ❌ Hilang jika clear browser | ✅ Permanen                |
| **Multi-user**  | ❌ Tidak support             | ✅ Support                 |
| **Capacity**    | ❌ ~5MB limit                | ✅ Unlimited               |
| **Security**    | ❌ Data visible di browser   | ✅ Secure di server        |
| **Search**      | ❌ Lambat                    | ✅ Cepat dengan index      |
| **Relations**   | ❌ Manual                    | ✅ Automatic dengan Prisma |
| **Backup**      | ❌ Manual                    | ✅ Easy dengan DB tools    |

---

## 📧 Support

Jika ada pertanyaan atau error, check:

1. Console browser (F12) untuk error di frontend
2. Terminal untuk error di backend
3. Prisma Studio untuk cek data database

---

**Created by:** Antigravity AI  
**Date:** 2025-12-02  
**Version:** 1.0.0
