# 📋 Refactoring Log: Restrukturisasi Modul Akademik

**Tanggal:** 29 November 2025  
**Tujuan:** Memisahkan Master Data (Data Siswa, Data Guru, Data Kelas) dari Modul SPP ke dalam Modul Akademik yang terpisah, mengikuti _best practice_ arsitektur sistem manajemen sekolah.

---

## 🎯 Motivasi

Sebelumnya, Data Siswa dan Data Kelas berada di dalam **Modul SPP**, yang secara konseptual kurang tepat karena:

1. Data Siswa dan Data Kelas adalah **Master Data** global yang digunakan oleh banyak modul (SPP, Akademik, Perpustakaan, Absensi, dll).
2. Menempatkannya di dalam Modul SPP membuat coupling yang terlalu tinggi dan arsitektur yang kurang _scalable_.
3. Data Guru juga diperlukan sebagai Master Data tapi belum ada tempatnya.

---

## ✅ Perubahan yang Dilakukan

### 1. **Struktur Menu Navigasi**

**File:** `src/data/navigation/verticalMenuData.tsx`

#### **Perubahan:**

- ✨ **Menambahkan Grup Menu Baru:** `Akademik` (icon: `ri-graduation-cap-line`)
- ➡️ **Memindahkan Menu:**
  - `Data Siswa` → dari "Modul SPP" ke "Akademik"
  - `Data Kelas` → dari "Modul SPP" ke "Akademik"
- ➕ **Menambahkan Menu Baru:**
  - `Data Guru` (href: `/akademik/data-guru`)
  - `Tahun Ajaran` (href: `/akademik/tahun-ajaran`)
- 🏷️ **Rename:** "Modul SPP" → "Keuangan Sekolah" (lebih deskriptif)

#### **Struktur Menu Setelah Refactoring:**

```
📂 Akademik
  ├── 👤 Data Siswa (/akademik/data-siswa)
  ├── 👨‍🏫 Data Guru (/akademik/data-guru)
  ├── 🏫 Data Kelas (/akademik/data-kelas)
  └── 📅 Tahun Ajaran (/akademik/tahun-ajaran)

📂 Keuangan Sekolah (SPP)
  ├── 🏷️ Penetapan Nominal SPP
  ├── 💸 Pembayaran SPP
  └── ⚠️ Tunggakan SPP
```

---

### 2. **Pemindahan File & Folder**

#### **A. Routing (Pages)**

**Operasi: `robocopy` (copy) + manual cleanup**

| **Dari**                                               | **Ke**                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `src/app/[lang]/(dashboard)/(private)/spp/data-siswa/` | `src/app/[lang]/(dashboard)/(private)/akademik/data-siswa/` |
| `src/app/[lang]/(dashboard)/(private)/spp/data-kelas/` | `src/app/[lang]/(dashboard)/(private)/akademik/data-kelas/` |

**File yang dipindahkan:**

- `data-siswa/page.tsx`
- `data-siswa/tambah/page.tsx`
- `data-siswa/[id]/page.tsx`
- `data-siswa/[id]/edit/page.tsx`
- `data-kelas/page.tsx`
- `data-kelas/[id]/page.tsx`

#### **B. View Components**

**Operasi: `Move-Item` (PowerShell)**

| **Dari**                             | **Ke**                                    |
| ------------------------------------ | ----------------------------------------- |
| `src/views/spp/AddStudentForm.tsx`   | `src/views/akademik/AddStudentForm.tsx`   |
| `src/views/spp/EditStudentForm.tsx`  | `src/views/akademik/EditStudentForm.tsx`  |
| `src/views/spp/StudentDataTable.tsx` | `src/views/akademik/StudentDataTable.tsx` |
| `src/views/spp/StudentDetail.tsx`    | `src/views/akademik/StudentDetail.tsx`    |
| `src/views/spp/ClassDataTable.tsx`   | `src/views/akademik/ClassDataTable.tsx`   |
| `src/views/spp/ClassDetail.tsx`      | `src/views/akademik/ClassDetail.tsx`      |

---

### 3. **Perbaikan Import Paths**

Semua file **Page** yang telah dipindahkan diperbaiki import-nya:

#### **Sebelum:**

```tsx
import StudentDataTable from '@/views/spp/StudentDataTable'
```

#### **Sesudah:**

```tsx
import StudentDataTable from '@/views/akademik/StudentDataTable'
```

**File yang diperbaiki:**

- ✅ `akademik/data-siswa/page.tsx`
- ✅ `akademik/data-siswa/tambah/page.tsx`
- ✅ `akademik/data-siswa/[id]/page.tsx`
- ✅ `akademik/data-siswa/[id]/edit/page.tsx`
- ✅ `akademik/data-kelas/page.tsx`
- ✅ `akademik/data-kelas/[id]/page.tsx`

---

###4. **Perbaikan URL/Link Internal**

Semua komponen **View** diperbaiki agar link mengarah ke route yang baru (`/akademik/...` bukan `/spp/...`).

#### **Pattern Find & Replace:**

- `/spp/data-siswa` → `/akademik/data-siswa`
- `/spp/data-kelas` → `/akademik/data-kelas` (tidak ada yang perlu diubah)

**File yang diperbaiki:**
| File | Baris yang Diubah | Jenis |
|------|-------------------|-------|
| `StudentDetail.tsx` | 154 | Link `href` (Edit Button) |
| `StudentDataTable.tsx` | 224, 318, 388 | Link `href` (Detail, Option Menu, Add Button) |
| `EditStudentForm.tsx` | 194 | `router.push` (After Save) |
| `ClassDetail.tsx` | 168 | Link `href` (Student Detail) |
| `AddStudentForm.tsx` | 146, 150 | `router.push` (After Save & Cancel) |

**Total:** **8 lokasi** diperbaiki.

---

### 5. **Halaman Placeholder Baru**

Dibuat placeholder page untuk fitur yang akan dikembangkan ke depan:

#### **A. Data Guru**

**File:** `src/app/[lang]/(dashboard)/(private)/akademik/data-guru/page.tsx`  
**Konten:** Placeholder dengan keterangan bahwa fitur sedang dalam pengembangan (CRUD Guru, Upload Foto, Data Kepegawaian).

#### **B. Tahun Ajaran**

**File:** `src/app/[lang]/(dashboard)/(private)/akademik/tahun-ajaran/page.tsx`  
**Konten:** Placeholder untuk manajemen tahun ajaran aktif dan semester.

---

## 🧪 Testing & Verifikasi

### **Checklist Manual Testing:**

- [ ] Menu "Akademik" muncul di sidebar dengan icon yang benar
- [ ] Sub-menu "Data Siswa", "Data Guru", "Data Kelas", "Tahun Ajaran" terlihat
- [ ] Klik menu "Data Siswa" → Tabel siswa muncul
- [ ] Klik "Tambah Siswa" → Form add muncul
- [ ] Klik salah satu row siswa → Halaman detail siswa muncul
- [ ] Klik "Edit" dari detail siswa → Form edit siswa muncul
- [ ] Submit form add/edit berfungsi dan redirect ke list siswa
- [ ] Klik menu "Data Kelas" → Tabel kelas muncul
- [ ] Klik salah satu row kelas → Halaman detail kelas muncul
- [ ] Link dari "Detail Kelas" ke "Detail Siswa" berfungsi
- [ ] Klik menu "Data Guru" → Placeholder page muncul
- [ ] Klik menu "Tahun Ajaran" → Placeholder page muncul
- [ ] Menu "Keuangan Sekolah" masih ada dan berisi 3 item (Penetapan Nominal, Pembayaran, Tunggakan)

---

## 📊 Metrics

| Metric                        | Value                       |
| ----------------------------- | --------------------------- |
| **Files Moved (Views)**       | 6                           |
| **Folders Moved (Pages)**     | 2                           |
| **Import Paths Fixed**        | 6                           |
| **URL Links Fixed**           | 8                           |
| **Menu Items Added**          | 2 (Data Guru, Tahun Ajaran) |
| **Menu Items Moved**          | 2 (Data Siswa, Data Kelas)  |
| **Placeholder Pages Created** | 2                           |

---

## 🚀 Next Steps

Setelah refactoring ini, langkah berikutnya untuk Frontend:

1. **✅ DONE:** Restrukturisasi menu dan routing ✓
2. **TODO:** Implementasi CRUD Data Guru (komponen lengkap seperti Data Siswa)
3. **TODO:** Implementasi Manajemen Tahun Ajaran
4. **TODO:** Integrasi Backend API untuk semua modul Akademik
5. **TODO:** Setup relasi data antar modul (Siswa ↔ Kelas ↔ Guru ↔ SPP)

---

## 🛡️ Catatan Teknis

### **Masalah yang Ditemui:**

1. **PowerShell Wildcard Issue:** Path `[lang]` di PowerShell diinterpretasikan sebagai wildcard character. Solusi: gunakan `robocopy` yang lebih reliable untuk Windows file operations.

### **Lessons Learned:**

1. Selalu gunakan `robocopy` untuk operasi file/folder yang penting di Windows, terutama jika path mengandung karakter spesial (`[]`, `()`, dll).
2. Pemisahan Master Data dari modul bisnis sejak awal sangat penting untuk scalability aplikasi.

---

**Dokumentasi ini dibuat untuk referensi tim dan audit trail perubahan arsitektur aplikasi.**
