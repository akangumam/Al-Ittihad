# 📋 IMPLEMENTASI SISTEM PEMBAYARAN MTS AL-ITTIHAD

## ✅ Status: Sudah Terimplementasi

Sistem pembayaran sudah mendukung semua ketentuan dari yayasan **tanpa perlu perubahan form atau logic**.

---

## 📊 Template Pembayaran yang Sudah Dibuat

### 1. **ADMINISTRASI PPDB (Siswa Baru)** - Rp 1.500.000

| No  | Komponen                               | Nominal    | Prioritas     |
| --- | -------------------------------------- | ---------- | ------------- |
| 1   | Administrasi PPDB                      | Rp 750.000 | 1 (Tertinggi) |
| 2   | Seragam Batik, Kaos Olahraga & Atribut | Rp 200.000 | 2             |
| 3   | LKS Semester 1                         | Rp 130.000 | 3             |
| 4   | Iuran Semester 1 & 2                   | Rp 120.000 | 4             |
| 5   | Map Raport                             | Rp 50.000  | 5             |
| 6   | Pemeliharaan Lab Komputer              | Rp 50.000  | 6             |
| 7   | Infaq Gedung                           | Rp 200.000 | 7 (Terendah)  |

**Untuk:** Siswa baru yang mendaftar

---

### 2. **DAFTAR ULANG (Kelas 7 & 8)** - Rp 700.000

| No  | Komponen                  | Nominal    | Prioritas     |
| --- | ------------------------- | ---------- | ------------- |
| 1   | Daftar Ulang              | Rp 350.000 | 1 (Tertinggi) |
| 2   | LKS Semester 1            | Rp 130.000 | 2             |
| 3   | Iuran Semester 1 & 2      | Rp 170.000 | 3             |
| 4   | Pemeliharaan Lab Komputer | Rp 50.000  | 4 (Terendah)  |

**Untuk:** Siswa lama kelas 7 dan 8 yang naik kelas

---

### 3. **ADMINISTRASI KELAS 9** - Rp 1.400.000

| No  | Komponen                  | Nominal    | Prioritas     |
| --- | ------------------------- | ---------- | ------------- |
| 1   | Administrasi Kelas 9      | Rp 700.000 | 1 (Tertinggi) |
| 2   | Photo                     | Rp 40.000  | 2             |
| 3   | Iuran Ujian               | Rp 200.000 | 3             |
| 4   | Album                     | Rp 80.000  | 4             |
| 5   | Medali                    | Rp 80.000  | 5             |
| 6   | Sampul Ijazah             | Rp 50.000  | 6             |
| 7   | Pemeliharaan Lab Komputer | Rp 100.000 | 7             |
| 8   | Perpisahan                | Rp 150.000 | 8 (Terendah)  |

**Untuk:** Siswa kelas 9 (kelulusan)

---

## 🔧 Cara Kerja Sistem

### **1. Assign Template ke Siswa**

Admin bisa assign template pembayaran ke siswa melalui UI atau bulk assign:

**Via UI:**

1. Buka menu **Biaya Sekolah** > **Penetapan Tagihan Siswa**
2. Pilih siswa
3. Pilih template yang sesuai (PPDB/Daftar Ulang/Kelas 9)
4. Sistem otomatis hitung total dari semua komponen

**Via Bulk:**

- Assign ke banyak siswa sekaligus berdasarkan filter kelas/tingkat

### **2. Pembayaran dengan Alokasi Otomatis**

Ketika siswa/orang tua membayar:

1. **Input nominal pembayaran** (bisa lebih kecil dari total = cicilan)
2. **Sistem otomatis alokasi** berdasarkan prioritas:
   - Prioritas 1 dibayar dulu (sampai lunas)
   - Baru ke prioritas 2, dst.
3. **Track detail per komponen**:
   - Berapa yang sudah dibayar untuk setiap item
   - Berapa sisa yang belum dibayar
4. **Status otomatis update**:
   - `BELUM_LUNAS` - Masih ada sisa
   - `CICILAN` - Sebagian sudah dibayar
   - `LUNAS` - Semua komponen sudah terbayar

### **3. Laporan Detail**

Sistem menyediakan laporan:

- Rincian pembayaran per siswa per komponen
- Total yang sudah dibayar vs yang belum
- History pembayaran dengan nomor kwitansi
- Laporan tunggakan

---

## 📱 Alur Penggunaan

### **A. Untuk Siswa Baru (PPDB)**

```
1. Input data siswa baru
2. Assign template "Administrasi PPDB 2025/2026"
3. Siswa bisa bayar cicilan:
   - Bayar Rp 500.000 → Lunas: Admin PPDB (750rb), Sisanya ke Seragam
   - Bayar lagi Rp 500.000 → Lunas: Seragam, LKS, dst
   - Bayar lagi Rp 500.000 → LUNAS semua
```

### **B. Untuk Siswa Lama Naik Kelas (7→8 atau 8→9)**

**Kelas 7 & 8:**

```
1. Assign template "Daftar Ulang 2025/2026"
2. Total: Rp 700.000
3. Bisa dicicil sesuai kemampuan
```

**Kelas 9:**

```
1. Assign template "Administrasi Kelas 9 - 2025/2026"
2. Total: Rp 1.400.000
3. Pembayaran bisa bertahap selama tahun ajaran
```

---

## ❓ Apakah Ada Perubahan Form/Logic?

### ✅ **TIDAK ADA** perubahan yang diperlukan!

Sistem sudah support semua kebutuhan:

| Fitur                             | Status       | Keterangan                                  |
| --------------------------------- | ------------ | ------------------------------------------- |
| Template dengan multiple komponen | ✅ Sudah ada | Setiap template bisa punya banyak item      |
| Prioritas pembayaran              | ✅ Sudah ada | Alokasi otomatis berdasarkan prioritas      |
| Pembayaran cicilan                | ✅ Sudah ada | Bisa bayar sebagian, tracking per komponen  |
| Filter by grade                   | ✅ Sudah ada | Template bisa spesifik untuk kelas tertentu |
| Laporan detail                    | ✅ Sudah ada | Track per komponen                          |
| Bulk assign                       | ✅ Sudah ada | Assign ke banyak siswa                      |

---

## 🎯 Fitur Tambahan (Opsional)

Jika diperlukan, bisa tambahkan:

### 1. **Batas Waktu Pembayaran**

- Set deadline untuk setiap template
- Notifikasi otomatis mendekati deadline

### 2. **Diskon Otomatis**

- Diskon untuk pembayaran lunas di awal
- Diskon untuk saudara kandung

### 3. **Export Laporan**

- Export ke Excel per template
- Export per kelas/tingkat

### 4. **Notifikasi WhatsApp**

- Notifikasi saat tagihan dibuat
- Reminder pembayaran
- Konfirmasi pembayaran diterima

---

## 📞 Cara Menggunakan

### 1. Verifikasi Template

Buka menu **Biaya Sekolah** > **Template Biaya** untuk melihat 3 template yang sudah dibuat

### 2. Assign ke Siswa

**Option A: Manual per siswa**

- Buka profil siswa
- Tab "Tagihan"
- Klik "Tambah Tagihan"
- Pilih template yang sesuai

**Option B: Bulk assign**

- Menu **Penetapan Tagihan Siswa**
- Filter siswa (by kelas/status)
- Pilih template
- Klik "Assign ke semua"

### 3. Catat Pembayaran

- Menu **Pembayaran**
- Pilih siswa
- Lihat rincian tagihan (breakdown per komponen)
- Input nominal yang dibayar
- Sistem otomatis alokasi ke komponen berdasarkan prioritas
- Cetak kwitansi

---

## 📝 Script Maintenance

Untuk update template di masa depan:

```bash
# Setup ulang template (jika ada perubahan nominal)
npx tsx prisma/setup-payment-templates.ts

# Verifikasi data
npx tsx prisma/verify-data.ts
```

---

## ✨ Kesimpulan

**Sistem sudah siap digunakan!** Tidak perlu perubahan form atau logic.

Template pembayaran sudah dibuat sesuai ketentuan yayasan dengan fitur:

- ✅ Breakdown detail per komponen
- ✅ Pembayaran cicilan dengan alokasi otomatis
- ✅ Tracking per komponen
- ✅ Laporan lengkap
- ✅ Bulk operations

Tinggal assign template ke siswa dan mulai terima pembayaran! 🎉
