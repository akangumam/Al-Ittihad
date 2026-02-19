# Information Architecture - MTs Al-Ittihad Financial Management System

## 1. Struktur Navigasi Utama (Sidebar)

### 🏠 Dashboard

- **Route**: `/apps/academy/dashboard`
- **Icon**: `ri-home-smile-line`
- **Deskripsi**: Pusat monitoring kondisi keuangan madrasah

### 💰 Manajemen Keuangan

**Icon**: `ri-wallet-3-line`

Sub-menu:

1. **Pemasukan** (`/keuangan/pemasukan`)
   - Daftar pemasukan
   - Filter tanggal, kategori, sumber dana
   - Aksi: tambah, edit, hapus

2. **Pengeluaran** (`/keuangan/pengeluaran`)
   - Daftar pengeluaran
   - Kategori: Gaji guru, Operasional, Kegiatan, Sarpras

3. **Kas & Bank** (`/keuangan/kas-bank`)
   - Daftar akun kas/bank
   - Saldo terkini
   - Riwayat transaksi per akun

4. **Mutasi Kas** (`/keuangan/mutasi`)
   - Transfer antar akun
   - Log history
   - Validasi saldo

### 📚 Modul SPP

**Icon**: `ri-money-dollar-circle-line`

Sub-menu:

1. **Data Siswa** (`/spp/data-siswa`)
   - NIS, Nama, Kelas, Orang tua, Kontak
   - Status aktif/non-aktif

2. **Data Kelas** (`/spp/data-kelas`)
   - Nama kelas, Wali kelas
   - Tahun ajaran, Jumlah siswa

3. **Penetapan Nominal SPP** (`/spp/penetapan-nominal`)
   - Nominal per kelas/tahun ajaran
   - Perubahan efektif
   - Riwayat perubahan

4. **Pembayaran SPP** (`/spp/pembayaran`)
   - Form input pembayaran
   - History pembayaran

5. **Tunggakan SPP** (`/spp/tunggakan`)
   - Filter per kelas/siswa/bulan
   - Total tunggakan

### 📊 Anggaran (RAB)

**Icon**: `ri-file-list-3-line`

Sub-menu:

1. **Rencana Anggaran Tahunan** (`/rab/rencana-tahunan`)
   - Tahun ajaran
   - Jenis anggaran (BOS, Operasional, Sarpras)
   - Total anggaran

2. **Realisasi Anggaran** (`/rab/realisasi`)
   - Hubungan dengan transaksi
   - Sisa anggaran

3. **Approval Anggaran** (`/rab/approval`)
   - Status (pending, approved, rejected)
   - Persetujuan Kepala Madrasah

### 📈 Laporan

**Icon**: `ri-file-chart-line`

Sub-menu:

1. **Laporan Pemasukan** (`/laporan/pemasukan`)
2. **Laporan Pengeluaran** (`/laporan/pengeluaran`)
3. **Buku Kas Umum (BKU)** (`/laporan/bku`)
4. **Laporan BOS** (`/laporan/bos`)
5. **Anggaran vs Realisasi** (`/laporan/anggaran-vs-realisasi`)
6. **Tunggakan SPP** (`/laporan/tunggakan-spp`)
7. **Neraca Sederhana** (`/laporan/neraca`)

**Fitur Umum Laporan:**

- Filter tanggal
- Filter kelas
- Export PDF
- Export Excel

### ⚙️ Pengaturan

**Icon**: `ri-settings-3-line`

Sub-menu:

1. **User & Roles** (`/apps/roles`)
   - Administrator, Bendahara, Kepala Madrasah, Staf TU
   - Permissions per role

2. **Kategori Transaksi** (`/pengaturan/kategori-transaksi`)
   - Kategori pemasukan/pengeluaran

3. **Akun Kas/Bank** (`/pengaturan/akun-kas-bank`)
   - Nomor rekening
   - Saldo awal
   - Jenis akun

4. **Tahun Ajaran** (`/pengaturan/tahun-ajaran`)
   - Tahun aktif
   - Nominal SPP per tahun

5. **Backup & Restore** (`/pengaturan/backup-restore`)
   - Backup database
   - Restore data
   - Export JSON/SQL

---

## 2. Dashboard Components

### A. Key Financial Indicators (Cards)

1. Total Pemasukan Bulan Ini
2. Total Pengeluaran Bulan Ini
3. Saldo Kas & Bank
   - Kas Utama
   - Bank Syariah
   - Bank BNI/BRI
4. Total Tunggakan SPP
5. Total SPP Dibayarkan Bulan Ini

### B. Grafik & Visualisasi

1. **Grafik Pemasukan vs Pengeluaran** (Bar/Line Chart)
   - Per bulan (12 bulan)

2. **Grafik Tren Pembayaran SPP**
   - Persentase siswa yang sudah bayar

3. **Distribusi Pengeluaran** (Pie Chart)
   - Gaji
   - Operasional
   - Sarpras
   - Kegiatan

### C. Aktivitas Terbaru (48 jam terakhir)

1. Transaksi Keuangan Terbaru (5-10 item)
2. Pembayaran SPP Terbaru
3. Status Anggaran (RAB)

### D. Alert / Notifikasi

- Saldo kas menipis
- Pengeluaran melebihi budget
- Siswa dengan tunggakan besar
- Anggaran RAB belum disetujui
- SPP bulanan < 70% terbayar

### E. Quick Actions

- Tambah Pemasukan
- Tambah Pengeluaran
- Pembayaran SPP
- Tambah Siswa
- Buat Anggaran

---

## 3. Role-Based Access Control

| Role            | Akses Menu                             | Pembatasan                           |
| --------------- | -------------------------------------- | ------------------------------------ |
| Administrator   | Semua menu                             | Full control                         |
| Bendahara       | Dashboard, Keuangan, SPP, RAB, Laporan | Tidak bisa mengelola user            |
| Kepala Madrasah | Dashboard, Laporan, Approval RAB       | Tidak input transaksi                |
| Staf TU         | Data Siswa, Kelas, Pembayaran SPP      | Tidak bisa menghapus transaksi besar |

---

## 4. Layout Structure (Desktop App)

### Left Sidebar (Navigation)

- Dashboard
- Manajemen Keuangan
- SPP
- RAB
- Laporan
- Pengaturan

### Top Bar (Secondary Actions)

- Quick Actions (Tambah Transaksi, SPP)
- Search bar
- User profile
- Notifikasi

### Content Area (Main Panel)

- Tabel
- Form
- Charts
- Summary cards

### Right Panel (Optional)

- Detail transaksi
- Informasi siswa
- Filter cepat

---

## 5. Data Models (Key Entities)

### Transactions (Pemasukan/Pengeluaran)

```typescript
interface Transaction {
  id: string
  date: Date
  category: string
  sourceAccount: string // Kas/Bank
  amount: number
  description: string
  operator: string
  attachments?: string[]
}
```

### SPP Payment

```typescript
interface SPPPayment {
  id: string
  studentId: string
  classId: string
  month: number
  year: number
  amount: number
  paymentMethod: 'cash' | 'bank'
  paymentDate: Date
  notes?: string
}
```

### Budget (RAB)

```typescript
interface Budget {
  id: string
  academicYear: string
  budgetType: 'BOS' | 'Operasional' | 'Sarpras'
  totalBudget: number
  items: BudgetItem[]
  status: 'pending' | 'approved' | 'rejected'
}

interface BudgetItem {
  id: string
  activity: string
  category: string
  plannedAmount: number
  realizedAmount: number
  remainingAmount: number
}
```

### Student

```typescript
interface Student {
  id: string
  nis: string
  fullName: string
  classId: string
  parentName: string
  contact: string
  isActive: boolean
}
```

### Class

```typescript
interface Class {
  id: string
  className: string
  homeRoomTeacher: string
  academicYear: string
  studentCount: number
}
```

---

## 6. Next Steps untuk Implementasi

### Phase 1: Core Structure (Week 1-2)

✅ Setup navigasi menu (DONE)

- [ ] Buat placeholder pages untuk semua route
- [ ] Setup layout dengan sidebar, topbar, content area
- [ ] Implement role-based routing

### Phase 2: Dashboard (Week 3)

- [ ] Key Financial Indicators cards
- [ ] Grafik Pemasukan vs Pengeluaran
- [ ] Aktivitas Terbaru list
- [ ] Quick Actions buttons
- [ ] Alert/Notifikasi component

### Phase 3: Manajemen Keuangan (Week 4-5)

- [ ] CRUD Pemasukan
- [ ] CRUD Pengeluaran
- [ ] Kas & Bank management
- [ ] Mutasi Kas

### Phase 4: Modul SPP (Week 6-7)

- [ ] Data Siswa (CRUD)
- [ ] Data Kelas (CRUD)
- [ ] Penetapan Nominal SPP
- [ ] Form Pembayaran SPP
- [ ] Laporan Tunggakan

### Phase 5: RAB & Laporan (Week 8-9)

- [ ] Rencana Anggaran
- [ ] Realisasi Anggaran
- [ ] Approval flow
- [ ] Semua laporan dengan export PDF/Excel

### Phase 6: Pengaturan & Polish (Week 10)

- [ ] User & Roles management
- [ ] Kategori Transaksi
- [ ] Akun Kas/Bank
- [ ] Tahun Ajaran
- [ ] Backup & Restore
- [ ] Testing & bug fixes

---

## 7. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: Material-UI (MUI)
- **Charts**: ApexCharts / Recharts
- **Forms**: React Hook Form + Valibot
- **State**: React Context / Redux Toolkit
- **Database**: MySQL / PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Export**: jsPDF, xlsx

---

## 8. Design Guidelines

- **Primary Color**: `#5DA554` (Green - already set)
- **Typography**: Inter / Roboto
- **Spacing**: 8px grid system
- **Border Radius**: 8px
- **Shadows**: Material Design elevation
- **Icons**: Remix Icon

---

Dokumen ini akan diupdate seiring development progress.
