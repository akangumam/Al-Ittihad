# Cara Reset Data untuk Melihat Perubahan

Setelah perbaikan sistem pembayaran SPP, Anda perlu **reset data localStorage** agar data pembayaran yang baru ter-generate.

## Langkah-langkah:

### Opsi 1: Melalui Browser Console (Recommended)

1. Buka aplikasi di browser
2. Tekan `F12` atau klik kanan → **Inspect** untuk membuka Developer Tools
3. Buka tab **Console**
4. Ketik perintah berikut dan tekan Enter:

```javascript
localStorage.removeItem('app_data')
location.reload()
```

5. Halaman akan refresh otomatis dan data baru akan ter-generate

### Opsi 2: Clear All Site Data

1. Buka Developer Tools (`F12`)
2. Buka tab **Application** (Chrome) atau **Storage** (Firefox)
3. Di sidebar kiri, klik **Local Storage**
4. Klik pada URL aplikasi Anda (misalnya `http://localhost:3000`)
5. Klik tombol **Clear All** atau **Delete All**
6. Refresh halaman (`F5` atau `Ctrl+R`)

---

## Apa yang Berubah?

Setelah reset data, sistem akan:

✅ **Generate data pembayaran SPP yang realistis** untuk 50 siswa pertama
✅ **Setiap siswa memiliki riwayat pembayaran yang berbeda-beda**:

- 30% siswa: Sudah bayar semua (Juli - November 2024)
- 30% siswa: Bayar 3-4 bulan (punya tunggakan 1-2 bulan)
- 40% siswa: Bayar 1-2 bulan (punya tunggakan lebih banyak)

✅ **Data konsisten di semua halaman**:

- Detail Siswa → Tab "Keuangan & SPP" akan menampilkan data pembayaran siswa tersebut
- Menu History → Akan menampilkan semua pembayaran dari semua siswa
- Klik "Lihat Semua Riwayat" di detail siswa → Filter otomatis untuk siswa tersebut

✅ **Tunggakan dihitung otomatis** berdasarkan:

- Tarif SPP dari kelas siswa
- Bulan yang belum dibayar (dari Juli 2024 sampai sekarang)

---

## Verifikasi Perbaikan

Setelah reset data, coba:

1. **Buka Detail Siswa** (misalnya "Aisyah Putri")
   - Tab "Keuangan & SPP" akan menampilkan:
     - Riwayat pembayaran yang sesuai dengan siswa tersebut
     - Tunggakan yang dihitung berdasarkan bulan yang belum dibayar

2. **Buka Menu "SPP" → "History Pembayaran"**
   - Akan menampilkan semua pembayaran dari berbagai siswa
   - Klik nama siswa untuk melihat detail

3. **Klik "Lihat Semua Riwayat"** di detail siswa
   - Akan membuka halaman history dengan filter otomatis untuk siswa tersebut

---

## Troubleshooting

**Q: Data masih sama setelah refresh?**
A: Pastikan Anda sudah menjalankan `localStorage.removeItem('app_data')` di console

**Q: Tidak ada data pembayaran?**
A: Cek console browser untuk error. Pastikan file `generate_spp_payments.ts` tidak ada error

**Q: Tunggakan tidak muncul?**
A: Beberapa siswa memang sudah bayar semua, coba buka siswa lain

---

Selamat mencoba! 🎉
