# 📚 Tutorial Setup Awal Sistem MTs Al-Ittihad

Panduan lengkap step-by-step untuk setup sistem dari nol hingga siap digunakan.

---

## 📋 Daftar Isi

1. [Persiapan Awal](#1-persiapan-awal)
2. [Setup Master Data Akademik](#2-setup-master-data-akademik)
3. [Setup Master Data Keuangan](#3-setup-master-data-keuangan)
4. [Input Data Operasional](#4-input-data-operasional)
5. [Setup Biaya & Tagihan](#5-setup-biaya--tagihan)
6. [Mulai Transaksi Harian](#6-mulai-transaksi-harian)
7. [Checklist Verifikasi](#7-checklist-verifikasi)

---

## 1. Persiapan Awal

### ✅ **Before You Start**

Pastikan Anda sudah:

- ✅ Login sebagai Admin/Superuser
- ✅ Memiliki data-data berikut siap:
  - Daftar kelas yang akan dibuka
  - Daftar siswa (minimal data: NIS, Nama, Kelas)
  - Daftar guru & mata pelajaran
  - Struktur biaya sekolah (daftar ulang, seragam, dll)
  - Akun bank/kas yang digunakan

### 🎯 **Tujuan Setup Awal**

Setelah selesai tutorial ini, Anda akan memiliki:

- ✅ Master data akademik lengkap
- ✅ Master data keuangan siap pakai
- ✅ Data siswa & guru terorganisir
- ✅ Sistem tagihan siap dijalankan
- ✅ Pencatatan kas & bank berjalan

**Estimasi Waktu:** 2-3 jam (tergantung jumlah data)

---

## 2. Setup Master Data Akademik

### **STEP 1: Setup Tahun Ajaran**

**📍 Menu:** `Akademik → Tahun Ajaran`

1. Klik tombol **"Tambah Tahun Ajaran"**
2. Isi form:
   ```
   Tahun Ajaran: 2025/2026
   Semester: Ganjil
   Tanggal Mulai: 15/07/2025
   Tanggal Selesai: 31/12/2025
   Status: ✅ Aktif
   ```
3. Klik **"Simpan"**

**💡 Tips:**

- Hanya 1 tahun ajaran yang boleh aktif
- Tahun ajaran aktif otomatis terseleksi saat input data

---

### **STEP 2: Setup Data Kelas**

**📍 Menu:** `Akademik → Data Kelas`

**Buat kelas untuk setiap tingkat:**

#### Kelas 7 (3 rombel):

1. Klik **"Tambah Kelas"**
2. Isi form:
   ```
   Nama Kelas: 7A
   Tingkat: 7
   Tahun Ajaran: 2025/2026 (Aktif)
   Kapasitas: 32
   Wali Kelas: [Pilih dari dropdown guru - bisa dikosongkan dulu]
   ```
3. Klik **"Simpan"**
4. **Ulangi** untuk kelas **7B** dan **7C**

#### Kelas 8 (3 rombel):

- Buat: **8A**, **8B**, **8C**
- Tingkat: **8**
- Kapasitas: **32** (sesuaikan)

#### Kelas 9 (2 rombel):

- Buat: **9A**, **9B**
- Tingkat: **9**
- Kapasitas: **32**

**✅ Total: 8 kelas**

**💡 Tips:**

- Atur kapasitas sesuai kondisi sekolah
- Wali kelas bisa diisi nanti setelah data guru lengkap

---

### **STEP 3: Setup Data Guru**

**📍 Menu:** `Akademik → Data Guru`

**Minimal input:**

1. Klik **"Tambah Guru"**
2. Isi form (contoh):
   ```
   NIP/NUPTK: 197801012006041001
   Nama Lengkap: Ahmad Fauzi, S.Pd
   Jenis Kelamin: Laki-laki
   Mata Pelajaran: Matematika
   Status: Aktif
   No. HP: 081234567890
   Email: ahmad.fauzi@gmail.com (optional)
   ```
3. Klik **"Simpan"**

**📊 Rekomendasi Guru Minimal:**

- Guru Matematika
- Guru Bahasa Indonesia
- Guru Bahasa Inggris
- Guru IPA
- Guru IPS
- Guru PAI
- Guru PJOK
- Guru Seni Budaya

**💡 Tips:**

- Email penting jika ingin kirim notifikasi via email
- Satu guru bisa mengajar beberapa kelas

---

## 3. Setup Master Data Keuangan

### **STEP 4: Setup Akun Kas & Bank**

**📍 Menu:** `Pengaturan Sistem → Manajemen Kas/Bank`

Buat minimal 2 akun:

#### Akun 1: Kas Tunai

```
Nama Akun: Kas Tunai
Jenis: Kas
Kode Akun: KAS-01 (optional)
Saldo Awal: 1,000,000
Tanggal Saldo Awal: 01/07/2025
Deskripsi: Kas tunai utama sekolah
Status: ✅ Aktif
```

#### Akun 2: Bank BRI

```
Nama Akun: Bank BRI - Al Ittihad
Jenis: Bank
Nomor Rekening: 0123-4567-8901
Nama Pemilik: MTs Al Ittihad
Saldo Awal: 5,000,000
Tanggal Saldo Awal: 01/07/2025
Status: ✅ Aktif
```

**💡 Tips:**

- Saldo awal = saldo kas/bank per tanggal mulai menggunakan sistem
- Bisa tambah akun lain sesuai kebutuhan (Dana BOS, dll)

---

### **STEP 5: Setup Kategori Transaksi**

**📍 Menu:** `Pengaturan Sistem → Kategori Transaksi`

#### A. Kategori Pemasukan

Minimal buat kategori:

| Nama Kategori        | Tipe      | Deskripsi                             |
| -------------------- | --------- | ------------------------------------- |
| **Pembayaran Siswa** | Pemasukan | Pembayaran daftar ulang, seragam, dll |
| **Dana BOS**         | Pemasukan | Dana Bantuan Operasional Sekolah      |
| **Donasi/Infaq**     | Pemasukan | Sumbangan dari wali murid/donatur     |
| **Lain-lain**        | Pemasukan | Pemasukan lainnya                     |

**Cara input:**

1. Klik **"Tambah Kategori"**
2. Isi:
   ```
   Nama: Pembayaran Siswa
   Tipe: Pemasukan
   Deskripsi: Pembayaran dari siswa/wali murid
   ```
3. Simpan
4. Ulangi untuk kategori lain

---

#### B. Kategori Pengeluaran

Minimal buat kategori:

| Nama Kategori           | Tipe        | Deskripsi                   |
| ----------------------- | ----------- | --------------------------- |
| **Operasional Sekolah** | Pengeluaran | ATK, listrik, air, dll      |
| **Gaji & Honorarium**   | Pengeluaran | Gaji guru & karyawan        |
| **Pemeliharaan**        | Pengeluaran | Perbaikan gedung, peralatan |
| **Konsumsi**            | Pengeluaran | Konsumsi rapat, kegiatan    |
| **Lain-lain**           | Pengeluaran | Pengeluaran lainnya         |

**💡 Tips:**

- Kategori bisa ditambah sesuai kebutuhan
- Gunakan nama kategori yang jelas dan konsisten

---

## 4. Input Data Operasional

### **STEP 6: Input Data Siswa**

**📍 Menu:** `Akademik → Data Siswa`

**Cara Input:**

1. Klik **"Tambah Siswa Baru"**
2. Isi form lengkap (minimal field required):

   ```
   === Data Pribadi ===
   NIS: 2025001
   NISN: 0012345678
   Nama Lengkap: Ahmad Zaky Mubarak
   Jenis Kelamin: Laki-laki

   === Data Kontak ===
   No. HP Orang Tua/Wali: 081234567890 (WAJIB!)

   === Informasi Akademik ===
   Tingkat/Kelas: Kelas 7
   Kelas: 7A
   Tahun Ajaran: 2025/2026 (Aktif)
   Status Siswa: Aktif
   ```

3. Klik **"Simpan Data Siswa"**

**⚠️ PENTING:**

- **NIS** dan **NISN** harus unik (tidak boleh sama)
- **Kelas** wajib dipilih (tidak boleh kosong)
- **No. HP Orang Tua** wajib diisi (untuk notifikasi tagihan via WA nanti)

**📊 Rekomendasi:**

- Input minimal 5 siswa per kelas untuk testing
- Atau import dari Excel (jika tersedia)

**💡 Tips:**

- Data bisa dilengkapi bertahap
- Field optional (email, alamat, dll) bisa diisi nanti

---

### **STEP 7: Assign Wali Kelas**

**📍 Menu:** `Akademik → Data Kelas`

Setelah guru & siswa sudah ada:

1. Klik **Edit** pada kelas (misal: 7A)
2. Pilih **Wali Kelas** dari dropdown
3. Klik **"Simpan"**

**💡 Tips:**

- Satu guru bisa jadi wali kelas di 1 kelas saja
- Wali kelas bisa lihat data siswanya di dashboard

---

## 5. Setup Biaya & Tagihan

### **STEP 8: Buat Template Biaya**

**📍 Menu:** `Biaya Sekolah → Template Biaya`

Buat template untuk biaya-biaya yang akan ditagihkan ke siswa.

#### Contoh Template 1: Daftar Ulang

```
Nama Template: Daftar Ulang 2025/2026
Kode: DU-2025 (optional)
Deskripsi: Biaya daftar ulang tahun ajaran 2025/2026
Nominal: 500,000
Kategori: Daftar Ulang
Status: Aktif
```

#### Contoh Template 2: Seragam

```
Nama Template: Seragam Lengkap
Nominal: 350,000
Deskripsi: Seragam putih abu-abu, batik, OSIS, pramuka
Kategori: Seragam
Status: Aktif
```

#### Contoh Template 3: Biaya Kegiatan

```
Nama Template: Kegiatan Ekskul 2025/2026
Nominal: 200,000
Deskripsi: Biaya kegiatan ekstrakurikuler
Kategori: Kegiatan
Status: Aktif
```

**💡 Tips:**

- Buat template untuk setiap jenis biaya yang berbeda
- Nominal bisa disesuaikan saat assign ke siswa

---

### **STEP 9: Assign Tagihan ke Siswa**

**📍 Menu:** `Biaya Sekolah → Penetapan Tagihan`

Setelah template biaya siap, assign ke siswa:

#### Cara Manual (Per Siswa):

1. Klik **"Buat Tagihan Baru"**
2. Pilih **Siswa** (misal: Ahmad Zaky - 7A)
3. Pilih **Template Biaya**: Daftar Ulang 2025/2026
4. **Nominal** otomatis terisi (bisa diubah jika ada diskon)
5. **Jatuh Tempo**: 31/07/2025
6. Klik **"Simpan"**

#### Cara Massal (Batch):

1. Klik **"Tagihan Massal"**
2. Filter siswa:
   - Tingkat: **7** (semua kelas 7)
   - Atau pilih kelas tertentu: **7A**
3. Pilih **Template Biaya**: Daftar Ulang 2025/2026
4. Set **Jatuh Tempo**: 31/07/2025
5. **Preview** daftar siswa yang akan ditagih
6. Klik **"Buat Tagihan"**

**💡 Tips:**

- Tagihan massal lebih cepat untuk biaya yang sama
- Bisa bikin beberapa tagihan untuk 1 siswa (Daftar Ulang + Seragam + dll)

---

### **STEP 10: Record Pembayaran Siswa**

**📍 Menu:** `Biaya Sekolah → Pembayaran Siswa`

Saat siswa bayar:

1. Klik **"Input Pembayaran"**
2. Pilih **Siswa** atau scan **NIS**
3. Muncul **daftar tagihan** siswa yang belum lunas
4. Pilih tagihan yang dibayar (bisa centang beberapa)
5. Input:
   ```
   Jumlah Bayar: 500,000
   Metode: Tunai / Transfer
   Akun Penerima: Kas Tunai / Bank BRI
   Tanggal: (otomatis hari ini)
   Keterangan: Pembayaran daftar ulang (optional)
   ```
6. Klik **"Simpan Pembayaran"**

**✅ Yang Terjadi:**

- Status tagihan berubah jadi **Lunas** (jika full)
- Saldo kas/bank otomatis bertambah
- Tercatat di laporan pemasukan
- Bisa cetak kwitansi/bukti bayar

**💡 Tips:**

- Bisa bayar cicil (misal: tagihan 500rb, bayar 250rb dulu)
- Cetak kwitansi untuk bukti pembayaran

---

## 6. Mulai Transaksi Harian

### **STEP 11: Catat Pemasukan Lain**

**📍 Menu:** `Manajemen Kas & Bank → Pemasukan Kas`

Untuk pemasukan selain pembayaran siswa (misal: Dana BOS, Donasi):

1. Klik **"Tambah Pemasukan"**
2. Isi form:
   ```
   Tanggal: 05/08/2025
   Kategori: Dana BOS
   Nominal: 10,000,000
   Akun Penerima: Bank BRI
   Sumber: Pemerintah/Kemdikbud
   Keterangan: Pencairan BOS Triwulan 1
   Bukti: [Upload bukti transfer] (optional)
   ```
3. Klik **"Simpan"**

**✅ Saldo Bank BRI otomatis bertambah Rp 10.000.000**

---

### **STEP 12: Catat Pengeluaran**

**📍 Menu:** `Manajemen Kas & Bank → Pengeluaran Kas`

Untuk setiap pengeluaran operasional:

1. Klik **"Tambah Pengeluaran"**
2. Isi form:
   ```
   Tanggal: 06/08/2025
   Kategori: Operasional Sekolah
   Nominal: 500,000
   Akun Pengeluaran: Kas Tunai
   Penerima: Toko ATK Jaya
   Keterangan: Pembelian ATK untuk semester ganjil
   Bukti: [Upload nota/kwitansi] (optional)
   ```
3. Klik **"Simpan"**

**✅ Saldo Kas Tunai otomatis berkurang Rp 500.000**

**💡 Tips:**

- Lampirkan bukti (foto nota) untuk audit
- Gunakan kategori yang sesuai untuk laporan

---

### **STEP 13: Mutasi Antar Kas**

**📍 Menu:** `Manajemen Kas & Bank → Mutasi Antar Kas`

Jika transfer uang dari kas ke bank (atau sebaliknya):

1. Klik **"Tambah Mutasi"**
2. Isi form:
   ```
   Tanggal: 07/08/2025
   Dari: Kas Tunai
   Ke: Bank BRI
   Nominal: 2,000,000
   Keterangan: Setoran kas ke bank
   ```
3. Klik **"Simpan"**

**✅ Yang Terjadi:**

- Kas Tunai: **-Rp 2.000.000**
- Bank BRI: **+Rp 2.000.000**
- Tercatat di history transaksi

---

### **STEP 14: Monitoring Dashboard**

**📍 Menu:** `Dashboard`

Dashboard menampilkan:

- 💰 **Total Saldo** (semua kas & bank)
- 📊 **Grafik** pemasukan vs pengeluaran
- 📈 **Tunggakan siswa**
- 👥 **Statistik** siswa & guru
- 📅 **Transaksi terakhir**

**💡 Tips:**

- Cek dashboard setiap hari untuk monitoring
- Export laporan untuk arsip

---

## 7. Checklist Verifikasi

### ✅ **Checklist Setup Awal**

Pastikan sudah selesai:

**Master Data Akademik:**

- [ ] ✅ Tahun ajaran aktif sudah dibuat
- [ ] ✅ Minimal 3 kelas sudah dibuat (7A, 7B, 7C)
- [ ] ✅ Minimal 5 guru sudah diinput
- [ ] ✅ Wali kelas sudah di-assign

**Master Data Keuangan:**

- [ ] ✅ Minimal 2 akun kas/bank aktif (Kas Tunai + Bank)
- [ ] ✅ Saldo awal kas/bank sudah diinput
- [ ] ✅ Kategori pemasukan minimal 3
- [ ] ✅ Kategori pengeluaran minimal 3

**Data Operasional:**

- [ ] ✅ Minimal 10 siswa sudah diinput
- [ ] ✅ Siswa sudah masuk ke kelas yang benar

**Biaya & Tagihan:**

- [ ] ✅ Minimal 2 template biaya dibuat
- [ ] ✅ Tagihan sudah di-assign ke siswa
- [ ] ✅ Sudah test input pembayaran

**Transaksi:**

- [ ] ✅ Sudah test catat pemasukan
- [ ] ✅ Sudah test catat pengeluaran
- [ ] ✅ Sudah test mutasi antar kas
- [ ] ✅ Saldo kas/bank sesuai dengan transaksi

---

## 📊 Laporan yang Bisa Digunakan

Setelah setup selesai, Anda bisa generate:

**📍 Menu:** `Laporan Keuangan`

1. **Buku Kas Umum (BKU)**
   - Semua transaksi kas & bank
   - Filter: per tanggal, per akun

2. **Laporan Pemasukan**
   - Detail semua pemasukan
   - Filter: per kategori, per periode

3. **Laporan Pengeluaran**
   - Detail semua pengeluaran
   - Filter: per kategori, per periode

4. **Laporan Tunggakan Siswa**
   - Daftar siswa yang belum bayar
   - Total tunggakan per kelas

5. **Neraca Keuangan**
   - Total aset (kas + bank)
   - Total pemasukan & pengeluaran

---

## 🆘 Troubleshooting

### **Problem 1: Tidak bisa pilih "Kelas" saat tambah siswa**

**Solusi:**

- Pastikan sudah buat kelas di menu "Data Kelas"
- Pastikan kelas sesuai dengan tingkat yang dipilih
- Refresh halaman

### **Problem 2: Saldo kas/bank tidak update**

**Solusi:**

- Pastikan pilih akun kas/bank saat input transaksi
- Refresh halaman atau logout-login lagi
- Cek di "Data Kas & Bank" → History Transaksi

### **Problem 3: Template biaya tidak muncul**

**Solusi:**

- Pastikan template statusnya **Aktif**
- Refresh halaman

### **Problem 4: Email welcome tidak terkirim**

**Solusi:**

- Pastikan RESEND_API_KEY sudah diset di `.env`
- Cek spam folder
- Lihat guide: `EMAIL_SETUP_GUIDE.md`

---

## 📞 Need Help?

Jika ada kendala:

1. Cek dokumentasi lengkap di folder `docs/`
2. Lihat Log Aktivitas untuk trace error
3. Hubungi developer/administrator sistem

---

## 🎯 Next Steps

Setelah setup awal selesai:

1. **Training User**
   - Admin TU untuk input transaksi
   - Guru untuk absensi
   - Kasir untuk terima pembayaran

2. **Backup Rutin**
   - Menu: `Pengaturan → Cadangkan & Pulihkan`
   - Backup minimal 1x seminggu

3. **Review Laporan**
   - Cek BKU setiap akhir bulan
   - Review tunggakan siswa
   - Monitoring neraca keuangan

---

**🎉 Selamat! Sistem sudah siap digunakan!**

**Last Updated:** 2026-02-03  
**Version:** 1.0

---

## 📝 Catatan Penting

1. **Data Testing vs Data Real:**
   - Gunakan data testing dulu untuk belajar
   - Setelah lancar, baru input data real
   - Bisa reset database jika perlu

2. **Backup Sebelum Import Massal:**
   - Jika akan import ratusan siswa
   - Backup dulu untuk jaga-jaga

3. **Konsistensi Data:**
   - Gunakan format NIS yang konsisten (misal: 2025001, 2025002, dst)
   - Gunaan nama kategori yang jelas
   - Atur kode akun yang terstruktur

---

**Happy Managing! 🎓💼**
