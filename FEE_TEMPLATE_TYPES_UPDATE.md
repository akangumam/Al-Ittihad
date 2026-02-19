# Update Tipe Template Biaya

## ✅ Penambahan Tipe Template Baru

Sistem sekarang mendukung **7 tipe template biaya** (sebelumnya hanya 3), untuk mengakomodasi kebutuhan MTs dan MA (Madrasah Aliyah):

### Tipe Template yang Tersedia:

1. **REGISTRATION** - Pendaftaran Baru (PPDB)
   - Untuk siswa baru MTs atau MA
   - Warna: Primary (Biru)
2. **ANNUAL_REREGISTRATION** - Daftar Ulang Tahunan
   - Daftar ulang setiap tahun ajaran
   - Warna: Success (Hijau)
3. **GRADUATION** - Kelulusan
   - Biaya kelulusan untuk Kelas 9 MTs atau Kelas 12 MA
   - Warna: Warning (Oranye)
4. **CLASS_SPECIFIC** - Biaya Khusus Kelas ✨ BARU
   - Untuk biaya spesifik per tingkat (misal: Kelas 7, 8, 9 MTs)
   - Cocok untuk study program tertentu
   - Warna: Info (Biru muda)
5. **EXAM** - Biaya Ujian ✨ BARU
   - UTS, UAS, Try Out, Ujian Praktek
   - Warna: Error (Merah)
6. **ACTIVITY** - Kegiatan ✨ BARU
   - Study Tour, Camping, Ekstrakurikuler berbayar
   - Rihlah, Field Trip
   - Warna: Info (Biru muda)
7. **OTHER** - Lain-lain ✨ BARU
   - Biaya lain yang tidak termasuk kategori di atas
   - Warna: Default (Abu-abu)

## 📋 Contoh Penggunaan untuk MA (Madrasah Aliyah):

### Template PPDB MA:

```
Nama: Administrasi PPDB MA 2026/2027
Tipe: Pendaftaran Baru (PPDB)
Tahun Ajaran: 2026/2027
Grade: 10
Komponen:
  1. Formulir Pendaftaran - Rp 50.000
  2. Seragam (Batik, Olahraga, Putih Abu) - Rp 500.000
  3. Buku LKS - Rp 200.000
  4. Uang Gedung - Rp 1.000.000
  5. Infaq Pembangunan - Rp 500.000
Total: Rp 2.250.000
```

### Template Biaya Kelas Khusus:

```
Nama: Biaya Kelas 11 IPA MA 2026/2027
Tipe: Biaya Khusus Kelas
Tahun Ajaran: 2026/2027
Grade: 11
Komponen:
  1. Praktikum Kimia - Rp 300.000
  2. Praktikum Fisika - Rp 300.000
  3. Praktikum Biologi - Rp 250.000
  4. Alat Lab Pribadi - Rp 150.000
Total: Rp 1.000.000
```

### Template Ujian:

```
Nama: Biaya Try Out UTBK MA 2026/2027
Tipe: Biaya Ujian
Tahun Ajaran: 2026/2027
Grade: 12
Komponen:
  1. Try Out 1 - Rp 50.000
  2. Try Out 2 - Rp 50.000
  3. Try Out 3 - Rp 50.000
  4. Pembahasan & Analisis - Rp 100.000
Total: Rp 250.000
```

### Template Kegiatan:

```
Nama: Study Tour Kelas 11 MA 2026/2027
Tipe: Kegiatan
Tahun Ajaran: 2026/2027
Grade: 11
Komponen:
  1. Transportasi Bus - Rp 300.000
  2. Tiket Masuk Wisata - Rp 150.000
  3. Konsumsi (2 hari) - Rp 200.000
  4. Akomodasi Hotel - Rp 350.000
  5. Tour Guide - Rp 100.000
Total: Rp 1.100.000
```

## 🔧 Perubahan Teknis

### 1. Schema Database (prisma/schema.prisma):

```prisma
enum FeeTemplateType {
  REGISTRATION           // PPDB - Pendaftaran Siswa Baru
  ANNUAL_REREGISTRATION  // Daftar Ulang Tahunan
  GRADUATION             // Biaya Kelulusan (Kelas 9 MTs atau Kelas 12 MA)
  CLASS_SPECIFIC         // Biaya Khusus per Kelas
  EXAM                   // Biaya Ujian
  ACTIVITY               // Kegiatan
  OTHER                  // Lain-lain
}

model FeeTemplate {
  type FeeTemplateType  // Sekarang menggunakan enum
  ...
}
```

### 2. TypeScript Types (src/types/feeTypes.ts):

```typescript
export type FeeTemplate = {
  type: 'REGISTRATION' | 'ANNUAL_REREGISTRATION' | 'GRADUATION' |
        'CLASS_SPECIFIC' | 'EXAM' | 'ACTIVITY' | 'OTHER'
  ...
}
```

### 3. API Validation Updated:

- `POST /api/fee-templates` - Validasi 7 tipe
- `PUT /api/fee-templates/[id]` - Validasi 7 tipe

### 4. UI Updates (FeeTemplateTable.tsx):

- Dropdown pilihan tipe bertambah 4 opsi
- Label Indonesia untuk setiap tipe
- Warna badge sesuai kategori
- Helper text untuk penjelasan

## 🎨 Chip Color Mapping:

| Tipe                  | Warna   | Visual       |
| --------------------- | ------- | ------------ |
| REGISTRATION          | Primary | 🔵 Biru      |
| ANNUAL_REREGISTRATION | Success | 🟢 Hijau     |
| GRADUATION            | Warning | 🟠 Oranye    |
| CLASS_SPECIFIC        | Info    | 🔵 Biru Muda |
| EXAM                  | Error   | 🔴 Merah     |
| ACTIVITY              | Info    | 🔵 Biru Muda |
| OTHER                 | Default | ⚪ Abu-abu   |

## 📱 Cara Menggunakan:

1. Login sebagai admin
2. Buka menu **Biaya Sekolah** → **Template Biaya**
3. Klik **Tambah Template**
4. Pilih salah satu dari 7 tipe template yang tersedia
5. Isi detail template sesuai kebutuhan
6. Tambah komponen biaya dengan drag & drop
7. Klik **Simpan**

## 🏫 Use Case MTs vs MA:

### Untuk MTs (Madrasah Tsanawiyah):

- ✅ REGISTRATION - PPDB Kelas 7
- ✅ ANNUAL_REREGISTRATION - Daftar Ulang Kelas 7, 8, 9
- ✅ GRADUATION - Kelulusan Kelas 9
- ✅ CLASS_SPECIFIC - Biaya khusus kelas tertentu (misal Lab kelas 8)
- ✅ EXAM - Try Out UN
- ✅ ACTIVITY - Camping, Study Tour
- ✅ OTHER - Biaya insidental

### Untuk MA (Madrasah Aliyah):

- ✅ REGISTRATION - PPDB Kelas 10
- ✅ ANNUAL_REREGISTRATION - Daftar Ulang Kelas 10, 11, 12
- ✅ GRADUATION - Kelulusan Kelas 12
- ✅ CLASS_SPECIFIC - Biaya penjurusan (IPA, IPS, Keagamaan)
- ✅ EXAM - Try Out UTBK/SNBT
- ✅ ACTIVITY - Magang, Rihlah Ilmiah
- ✅ OTHER - Biaya tambahan

## 🔄 Backward Compatibility:

Template yang sudah ada tetap berfungsi normal:

- Template PPDB (REGISTRATION) ✅
- Template Daftar Ulang (ANNUAL_REREGISTRATION) ✅
- Template Kelas 9 (GRADUATION) ✅

Tidak ada perubahan data atau struktur yang break existing records.

## ✅ Status: COMPLETED

Server: http://localhost:3000
Database: Updated dengan enum FeeTemplateType
API: Validasi sudah update untuk 7 tipe
UI: Dropdown sudah menampilkan 7 pilihan

---

**Date:** 2026-01-21
**Migration:** `npx prisma db push` - Success ✅
