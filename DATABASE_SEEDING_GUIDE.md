# 🌱 Database Seeding Guide

Panduan lengkap untuk generate sample data untuk testing dan development.

---

## 📋 Available Seed Scripts

### **1. Basic Seed** (Existing)

```bash
npm run db:seed
```

**Isi:**

- Users (2)
- Academic Years (2)
- Classes (from JSON)
- Teachers (3)
- Students (50 from JSON)
- Bank Accounts (3)
- Transaction Categories
- Budgets

---

### **2. Complete Seed** ⭐ **RECOMMENDED**

```bash
npm run db:seed-complete
```

**Isi LENGKAP:**

- ✅ **Users:** 3 (Admin, TU, Guru)
- ✅ **Academic Years:** 3 (2023/2024, 2024/2025, 2025/2026 aktif)
- ✅ **Teachers:** 8 guru dengan berbagai mata pelajaran
- ✅ **Classes:** 8 kelas (7A-7C, 8A-8C, 9A-9B)
- ✅ **Students:** 60 siswa (distributed across classes)
  - Kelas 7: 8 siswa x 3 = 24 siswa
  - Kelas 8: 8 siswa x 3 = 24 siswa
  - Kelas 9: 6 siswa x 2 = 12 siswa
- ✅ **Bank Accounts:** 4 akun (Kas Tunai, BRI, Mandiri Syariah, Dana BOS)
- ✅ **Transaction Categories:** 11 kategori (Pemasukan + Pengeluaran)
- ✅ **Fee Templates:** 3 template dengan components
  1. Daftar Ulang 2025/2026 (Rp 500.000)
  2. Seragam Lengkap (Rp 350.000)
  3. Kegiatan Ekstrakurikuler (Rp 200.000)
- ✅ **Budgets:** 3 budget untuk tahun 2025/2026

---

## 🚀 How to Use

### **First Time Setup** (Fresh Database)

1. **Reset & Seed Complete Database:**

   ```bash
   npm run db:reset-complete
   ```

   Ini akan:
   - ❌ Hapus semua data existing
   - ✅ Generate sample data lengkap
   - ⏱️ Waktu: ~30 detik

2. **Start Development Server:**

   ```bash
   npm run dev
   ```

3. **Login:**
   - Email: `admin@alittihad.sch.id`
   - (Password belum di-set, gunakan auth next sesuai setup)

---

### **Only Seed (Tanpa Reset)**

Jika database kosong dan ingin seed saja:

```bash
npm run db:seed-complete
```

---

### **Re-seed (Refresh Data)**

Jika ingin hapus data lama dan seed ulang:

```bash
npm run db:reset-complete
```

⚠️ **WARNING:** Ini akan menghapus SEMUA data!

---

## 📊 Sample Data Details

### 👥 **Students Distribution**

| Kelas     | Jumlah Siswa | Wali Kelas                     |
| --------- | ------------ | ------------------------------ |
| 7A        | 8            | Dr. Ahmad Hidayat, S.Pd., M.Pd |
| 7B        | 8            | Siti Aminah, S.Pd              |
| 7C        | 8            | Muhammad Rizki, S.Si           |
| 8A        | 8            | Dewi Sartika, S.Pd             |
| 8B        | 8            | Abdul Rahman, S.Ag             |
| 8C        | 8            | Nur Azizah, S.Pd               |
| 9A        | 6            | Farhan Maulana, S.Pd           |
| 9B        | 6            | Indah Permata, S.Pd            |
| **Total** | **60**       | **8 guru**                     |

### 💰 **Fee Templates**

| Template                   | Total Amount | Components                                                                                          |
| -------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| **Daftar Ulang 2025/2026** | Rp 500.000   | - Administrasi (Rp 200.000)<br>- Pengembangan (Rp 300.000)                                          |
| **Seragam Lengkap**        | Rp 350.000   | - Putih Abu-abu (Rp 150.000)<br>- Batik (Rp 100.000)<br>- OSIS (Rp 50.000)<br>- Pramuka (Rp 50.000) |
| **Kegiatan Ekskul**        | Rp 200.000   | - Biaya Ekskul (Rp 200.000)                                                                         |

### 🏦 **Bank Accounts**

| Akun                 | Saldo Awal        |
| -------------------- | ----------------- |
| Kas Tunai            | Rp 5.000.000      |
| Bank BRI             | Rp 25.000.000     |
| Bank Mandiri Syariah | Rp 15.000.000     |
| Dana BOS             | Rp 50.000.000     |
| **Total**            | **Rp 95.000.000** |

---

## 🎯 What to Test After Seeding

### ✅ **Checklist Testing**

**1. Akademik**

- [ ] View daftar siswa per kelas
- [ ] View detail siswa
- [ ] Edit data siswa
- [ ] View daftar guru
- [ ] View data kelas dengan wali kelas

**2. Biaya Sekolah**

- [ ] View fee templates
- [ ] Assign tagihan ke siswa (pilih dari 60 siswa)
- [ ] Input pembayaran siswa
- [ ] Lihat tunggakan siswa

**3. Kas & Bank**

- [ ] View saldo semua akun
- [ ] Input pemasukan baru
- [ ] Input pengeluaran baru
- [ ] Mutasi antar kas

**4. Laporan**

- [ ] Generate Buku Kas Umum
- [ ] Laporan Tunggakan Siswa
- [ ] Laporan Pemasukan
- [ ] Laporan Pengeluaran

---

## 🧪 Testing Scenarios

### **Scenario 1: Assign Tagihan Massal**

1. Buka: **Biaya Sekolah → Penetapan Tagihan**
2. Pilih **"Tagihan Massal"**
3. Filter: Kelas **7A** (8 siswa)
4. Template: **Daftar Ulang 2025/2026**
5. Jatuh Tempo: **31 Juli 2025**
6. Klik **"Buat Tagihan"**

✅ **Expected:** 8 siswa kelas 7A dapat tagihan Rp 500.000

---

### **Scenario 2: Input Pembayaran**

1. Buka: **Biaya Sekolah → Pembayaran Siswa**
2. Pilih salah satu siswa dari dropdown
3. Akan muncul daftar tagihan (jika sudah assign)
4. Centang tagihan yang akan dibayar
5. Input jumlah bayar
6. Pilih akun: **Kas Tunai**
7. Simpan

✅ **Expected:** Saldo Kas Tunai bertambah, tagihan lunas/sebagian

---

### **Scenario 3: Catat Pemasukan Dana BOS**

1. Buka: **Kas & Bank → Pemasukan Kas**
2. Kategori: **Dana BOS**
3. Nominal: **Rp 10.000.000**
4. Akun: **Dana BOS**
5. Keterangan: **Pencairan BOS Triwulan 1**
6. Simpan

✅ **Expected:** Saldo Dana BOS bertambah jadi Rp 60.000.000

---

### **Scenario 4: Generate Laporan**

1. Buka: **Laporan Keuangan → Buku Kas Umum**
2. Filter: **Bulan ini**
3. Akun: **Semua** atau pilih spesifik
4. Klik **"Generate"** atau **"Export PDF"**

✅ **Expected:** Laporan muncul dengan semua transaksi

---

## 📝 Sample Data Format

### **Student Data Example:**

```json
{
  "nis": "20250001",
  "nisn": "0012345678",
  "name": "Ahmad Hidayat",
  "nickname": "Ahmad",
  "grade": "7",
  "class": "7A",
  "gender": "L",
  "parentPhone": "081234567801",
  "status": "Aktif"
}
```

### **Teacher Data Example:**

```json
{
  "nip": "197501012000031001",
  "name": "Dr. Ahmad Hidayat, S.Pd., M.Pd",
  "subject": "Matematika",
  "position": "Guru Utama",
  "gender": "L",
  "status": "Aktif"
}
```

---

## 🔧 Troubleshooting

### **Problem: Error saat db:seed-complete**

**Solution:**

```bash
# 1. Regenerate Prisma Client
npx prisma generate

# 2. Try reset-complete
npm run db:reset-complete
```

---

### **Problem: Data tidak muncul setelah seed**

**Solution:**

1. Refresh halaman browser (Ctrl + F5)
2. Check di Prisma Studio:
   ```bash
   npx prisma studio
   ```
3. Verify data di database

---

### **Problem: Constraint error saat seed**

**Solution:**

```bash
# Force reset database
npm run db:reset-complete
```

---

## 🎓 Best Practices

### **✅ DO:**

1. ✅ Gunakan **db:seed-complete** untuk development
2. ✅ Test fitur dengan sample data dulu
3. ✅ Backup database sebelum reset
4. ✅ Gunakan data real setelah yakin fitur works

### **❌ DON'T:**

1. ❌ Jangan run **db:reset-complete** di production!
2. ❌ Jangan mix sample data dengan data real
3. ❌ Jangan lupa backup sebelum reset

---

## 📞 Need More Data?

Jika butuh lebih banyak data untuk testing:

### **Edit Script:**

1. Buka: `prisma/seed-complete.ts`
2. Ubah jumlah di line:
   ```typescript
   const studentsPerClass = kelas.startsWith('9') ? 6 : 8
   // Ganti jadi:
   const studentsPerClass = kelas.startsWith('9') ? 10 : 15
   ```
3. Save dan run:
   ```bash
   npm run db:reset-complete
   ```

---

## 🎉 Ready to Use!

Setelah seed complete, Anda punya:

- ✅ 60 siswa untuk testing
- ✅ 8 kelas dengan wali kelas
- ✅ 3 fee templates siap assign
- ✅ 4 akun kas/bank dengan saldo
- ✅ Data lengkap untuk semua modul

**Next:** Ikuti **TUTORIAL_SETUP_AWAL.md** untuk panduan lengkap!

---

**Last Updated:** 2026-02-03  
**Version:** 1.0
