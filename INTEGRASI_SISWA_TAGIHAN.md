# 📋 HALAMAN YANG TERINTEGRASI DENGAN DATA SISWA

Berikut adalah daftar halaman yang terintegrasi dengan data siswa dan cara kerjanya:

## ✅ Halaman yang Sudah Dicek

### 1. **Penetapan Tagihan** (`/biaya/tagihan`)

**File:** `src/views/biaya/StudentFeeTable.tsx`

**Cara Kerja:**

- Menampilkan **DAFTAR SISWA** (bukan tagihan yang sudah ada)
- Digunakan untuk **menetapkan** kategori pembayaran ke siswa
- Tombol "Tetapkan Tagihan Massal" untuk assign tagihan ke banyak siswa sekaligus
- Tombol "Lihat Tagihan" pada setiap baris siswa

**Status:**

- ✅ Sudah diperbaiki dengan label yang lebih jelas
- ✅ Menampilkan pesan jika tidak ada data siswa atau kategori

**Dependensi:**

- Tabel: `Student`, `PaymentCategory`, `AcademicYear`
- API: `/api/students`, `/api/payment-categories`, `/api/academic-years`

---

### 2. **Form Pembayaran** (`/biaya/pembayaran`)

**File:** `src/views/biaya/FeePaymentForm.tsx`

**Cara Kerja:**

- Form untuk mencatat pembayaran siswa
- Select siswa dari dropdown
- Menampilkan tagihan yang belum dibayar (unpaid fees)
- Alokasi pembayaran ke kategori berdasarkan prioritas

**Status:**

- ⚠️ Akan menampilkan empty jika tidak ada tagihan yang di-assign

**Dependensi:**

- Tabel: `Student`, `StudentFee`, `BankAccount`, `AcademicYear`
- API: `/api/students`, `/api/student-fees`, `/api/accounts`, `/api/fee-payments`

---

### 3. **Laporan Tunggakan SPP** (`/laporan/tunggakan-spp`)

**File:** `src/views/spp/OutstandingTable.tsx`

**Cara Kerja:**

- Menampilkan daftar tunggakan SPP siswa
- Filter berdasarkan kelas dan status pembayaran

**Status:**

- ⚠️ Akan kosong jika tidak ada data SPP

**Dependensi:**

- Tabel: `Student`, `SPPPayment`
- API: `/api/spp-payments`, `/api/students`

---

### 4. **Sistem Pembayaran Prioritas** (Sistem Baru)

**File:** `src/views/financial/fees/`

**Komponen:**

- `StudentFeeAssignment.tsx` - Penetapan fee template ke siswa
- `StudentFeeList.tsx` - Daftar tagihan siswa
- `PaymentForm.tsx` - Form pembayaran dengan alokasi otomatis

**Cara Kerja:**

- Menggunakan `FeeTemplate` dan `FeeComponent`
- Alokasi pembayaran otomatis berdasarkan prioritas komponen
- Sistem lebih modern dan fleksibel

**Status:**

- ✅ Sistem baru sudah ada (2 template terdeteksi)
- ⚠️ Belum ada data `StudentFeeNew` yang di-assign

**Dependensi:**

- Tabel: `Student`, `StudentFeeNew`, `FeeTemplate`, `FeeComponent`, `FeePaymentNew`
- API: `/api/fees/student-fees`, `/api/fees/templates`, `/api/fees/payments`

---

### 5. **Dashboard Keuangan** (`/apps/academy/dashboard`)

**File:** `src/views/financial/dashboard/FinanceDashboard.tsx`

**Cara Kerja:**

- Menampilkan indikator keuangan
- Chart pembayaran SPP
- Total tunggakan
- Quick actions

**Status:**

- ✅ Akan menampilkan data sesuai dengan yang ada di database

**Dependensi:**

- Semua data transaksi keuangan
- Data siswa dan pembayaran

---

## ⚙️ Rekomendasi Setup Awal

Untuk menggunakan sistem pembayaran, ikuti langkah berikut:

### Opsi 1: Sistem Lama (PaymentCategory)

1. **Buat Payment Categories**
   - Pergi ke `/biaya/kategori`
   - Tambahkan kategori: SPP, Uang Gedung, Seragam, dll
   - Set prioritas dan nominal

2. **Assign Tagihan ke Siswa**
   - Pergi ke `/biaya/tagihan`
   - Gunakan "Tetapkan Tagihan Massal"
   - Pilih kategori dan target siswa

3. **Catat Pembayaran**
   - Pergi ke `/biaya/pembayaran`
   - Pilih siswa
   - Masukkan nominal pembayaran
   - Sistem otomatis alokasi berdasarkan prioritas

### Opsi 2: Sistem Baru (FeeTemplate) - **DIREKOMENDASIKAN**

1. **Buat Fee Template**
   - Sudah ada 2 template:
     - Biaya Pendaftaran Siswa Baru 2025/2026
     - Biaya Daftar Ulang 2025/2026
   - Bisa tambah template baru di API

2. **Assign Template ke Siswa**
   - Gunakan API atau UI (jika ada)
   - Sistem otomatis hitung total dari komponen

3. **Catat Pembayaran**
   - Sistem otomatis alokasi ke komponen berdasarkan prioritas
   - Tracking lebih detail per komponen

---

## 🔍 Cara Verifikasi Data

Jalankan script verifikasi:

```bash
npx tsx prisma/verify-data.ts
```

Untuk membersihkan data orphan:

```bash
npx tsx prisma/cleanup-orphan-fees.ts
```

---

## 📊 Status Saat Ini (dari Verifikasi)

- ✅ **43 Siswa aktif** di database
- ✅ **Tidak ada data orphan**
- ✅ **2 Fee Templates** tersedia (sistem baru)
- ❌ **0 Payment Categories** (sistem lama)
- ❌ **0 StudentFee / StudentFeeNew** (belum ada tagihan yang di-assign)

---

## 💡 Kesimpulan

Halaman "Tagihan Siswa" menampilkan **daftar siswa** untuk penetapan tagihan, BUKAN tagihan yang sudah ada. Ini adalah halaman untuk **manajemen tagihan**, bukan untuk melihat data tagihan.

Jika ingin melihat tagihan yang sudah di-assign:

1. Sistem Lama: Perlu assign categories dulu di `/biaya/tagihan`
2. Sistem Baru: Perlu assign fee templates dulu

**Tidak ada bug atau data inconsistency** - sistem berjalan sesuai desain! ✅
