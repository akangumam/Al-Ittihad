# Penjelasan Masalah Data Pembayaran SPP

## Masalah yang Ditemukan

Berdasarkan screenshot yang Anda berikan, terdapat **inkonsistensi data** antara:

1. **Halaman Detail Siswa** (Tab "Keuangan & SPP") - menampilkan data untuk siswa **Kartika Sari C**
2. **Menu History Pembayaran** - menampilkan data untuk siswa **Ahmad Fauzi Rahman** dan **Aisyah Putri**

---

## Penyebab Masalah

### 1. **Data Hardcoded di Halaman Detail Siswa**

File: `src/views/akademik/StudentDetail.tsx` (baris 61-99)

```typescript
const paymentHistory = [
  {
    id: 'PAY-001',
    date: '10 Juli 2024',
    month: 'Juli 2024',
    amount: 250000,
    status: 'Lunas',
    method: 'Transfer Bank'
  }
  // ... data statis lainnya
]

const outstanding = [
  {
    month: 'Oktober 2024',
    amount: 250000,
    dueDate: '10 Oktober 2024'
  },
  {
    month: 'November 2024',
    amount: 250000,
    dueDate: '10 November 2024'
  }
]
```

**Masalah**: Data pembayaran dan tunggakan di halaman detail siswa adalah **data dummy yang sama untuk semua siswa**. Tidak peduli siswa mana yang dibuka, data yang ditampilkan selalu sama.

---

### 2. **Data Hardcoded di Menu History**

File: `src/views/spp/SPPPaymentTable.tsx` (baris 120-194)

```typescript
const initialData: PaymentType[] = [
  {
    id: 'PMT-001',
    transactionDate: '2025-11-28',
    studentNIS: '2024001',
    studentName: 'Ahmad Fauzi Rahman',
    grade: '7',
    class: 'A',
    paymentMonth: 'November 2024',
    amount: 250000
    // ...
  },
  {
    id: 'PMT-005',
    transactionDate: '2025-11-24',
    studentNIS: '2024001',
    studentName: 'Ahmad Fauzi Rahman',
    grade: '7',
    class: 'A',
    paymentMonth: 'Oktober 2024',
    amount: 250000
    // ...
  }
]
```

**Masalah**: Data di menu history juga hardcoded dengan nama siswa tertentu (Ahmad Fauzi Rahman, Siti Nurhaliza, dll), bukan data siswa yang sebenarnya dari database/context.

---

## Mengapa Data Berbeda?

Kedua halaman menggunakan **sumber data yang berbeda**:

- **Detail Siswa**: Menggunakan array `paymentHistory` dan `outstanding` yang didefinisikan langsung di dalam komponen
- **Menu History**: Menggunakan array `initialData` yang juga didefinisikan langsung di dalam komponen

Karena keduanya adalah data dummy yang berbeda, maka yang ditampilkan juga berbeda.

---

## Solusi yang Diperlukan

### ✅ **Solusi Ideal: Integrasi dengan AppContext**

Aplikasi sudah memiliki `AppContext` yang menyimpan data di `localStorage`, tetapi **data pembayaran SPP belum terintegrasi dengan benar**.

#### Yang Perlu Dilakukan:

1. **Tambahkan field pembayaran SPP ke dalam data siswa** di `AppContext`
2. **Buat sistem untuk menyimpan transaksi pembayaran** yang terhubung dengan ID siswa
3. **Update komponen Detail Siswa** untuk mengambil data dari context berdasarkan ID siswa
4. **Update komponen History** untuk mengambil data dari context

---

## Struktur Data yang Seharusnya

### Di AppContext:

```typescript
type SPPPaymentType = {
  id: string
  studentId: string // Link ke student.id
  studentNIS: string
  studentName: string
  transactionDate: string
  paymentMonth: string
  amount: number
  paymentMethod: 'Tunai' | 'Transfer' | 'EDC'
  accountDestination: string
  status: 'Lunas' | 'Pending' | 'Verifikasi'
  receivedBy: string
  notes?: string
}

// Di AppContext state:
const [sppPayments, setSppPayments] = useState<SPPPaymentType[]>([])
```

### Di StudentDetail.tsx:

```typescript
// Ambil data pembayaran dari context berdasarkan student ID
const paymentHistory = sppPayments.filter(payment => payment.studentId === studentId).slice(0, 3) // 3 terakhir

// Hitung tunggakan berdasarkan tarif SPP vs pembayaran yang sudah ada
const outstanding = calculateOutstanding(student, sppPayments, sppRates)
```

### Di SPPPaymentTable.tsx:

```typescript
// Gunakan data dari context, bukan hardcoded
const { sppPayments } = useAppContext()
const [data] = useState(sppPayments)
```

---

## Kesimpulan

**Masalah utama**: Kedua halaman menggunakan **data dummy yang berbeda dan tidak terhubung dengan data siswa sebenarnya**.

**Solusi**: Perlu membuat sistem pembayaran SPP yang terintegrasi dengan `AppContext` sehingga:

- Data pembayaran tersimpan secara terpusat
- Setiap siswa memiliki riwayat pembayaran sendiri
- Tunggakan dihitung secara dinamis berdasarkan tarif SPP dan pembayaran yang sudah dilakukan
- Data konsisten di semua halaman

---

## Apakah Anda ingin saya perbaiki masalah ini?

Saya bisa:

1. ✅ Membuat struktur data pembayaran SPP yang proper di AppContext
2. ✅ Mengintegrasikan data pembayaran dengan data siswa
3. ✅ Update halaman Detail Siswa untuk menampilkan data yang benar
4. ✅ Update halaman History untuk menggunakan data dari context
5. ✅ Membuat fungsi untuk menghitung tunggakan secara otomatis
