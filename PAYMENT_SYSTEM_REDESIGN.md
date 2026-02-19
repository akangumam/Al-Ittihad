# Redesign Sistem Pembayaran - Al-Ittihad

**Tanggal Meeting:** 17 Januari 2026
**Status:** Planning Phase

## Ringkasan Perubahan Requirement

Berdasarkan hasil meeting dengan pihak yayasan:

### ❌ Yang Dihapus:

- **SPP bulanan** dihapus sepenuhnya dari sistem

### ✅ Yang Ada:

1. **Biaya Pendaftaran (Registration Fee)**
   - Dibayar sekali saat siswa pertama kali mendaftar
   - Terdiri dari komponen: Seragam Olahraga, Batik, LKS, dll
   - Contoh total: Rp 900.000

2. **Biaya Daftar Ulang (Annual Re-registration Fee)**
   - Dibayar setiap tahun ajaran baru
   - Komponen bisa berbeda dengan biaya pendaftaran awal

### 🎯 Sistem Prioritas Pembayaran:

- Yayasan menentukan urutan prioritas komponen yang harus dilunasi terlebih dahulu
- Contoh prioritas: `1. Seragam` → `2. Buku (LKS)` → `3. Uang Gedung` → `4. Lainnya`
- Sistem cicilan otomatis mengalokasikan pembayaran sesuai urutan prioritas

### 💡 Contoh Alokasi Otomatis:

**Skenario 1:**

- Total Biaya: Rp 900.000
- Komponen Prioritas:
  1. Seragam: Rp 200.000 (Prioritas 1)
  2. Buku: Rp 150.000 (Prioritas 2)
  3. Gedung: Rp 300.000 (Prioritas 3)
  4. Lain-lain: Rp 250.000 (Prioritas 4)

**Pembayaran 1:** Siswa bayar Rp 200.000

- ✅ Seragam: Rp 200.000 (LUNAS)
- ⏳ Buku: Rp 0 (Belum bayar)
- ⏳ Gedung: Rp 0 (Belum bayar)
- ⏳ Lain-lain: Rp 0 (Belum bayar)

**Pembayaran 2:** Siswa bayar lagi Rp 350.000

- ✅ Seragam: Rp 200.000 (Sudah lunas)
- ✅ Buku: Rp 150.000 (LUNAS dari cicilan ini)
- ⚡ Gedung: Rp 200.000 (Bayar sebagian dari sisa Rp 200.000)
- ⏳ Lain-lain: Rp 0 (Belum bayar)

---

## Struktur Database Baru

### 1. FeeTemplate (Template Biaya)

Template yang mendefinisikan jenis-jenis biaya (Pendaftaran, Daftar Ulang):

```prisma
model FeeTemplate {
  id            String   @id @default(cuid())
  name          String   // "Biaya Pendaftaran 2026", "Daftar Ulang 2026"
  type          String   // "REGISTRATION" or "ANNUAL_REREGISTRATION"
  academicYear  String   // "2025/2026"
  grade         String?  // Optional: untuk tingkatan tertentu

  // Metadata
  description   String?
  isActive      Boolean  @default(true)

  // Relations
  components    FeeComponent[]
  studentFees   StudentFee[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([academicYear])
  @@index([type])
  @@index([isActive])
}
```

### 2. FeeComponent (Komponen Biaya dengan Prioritas)

Komponen individual dalam setiap template (Seragam, Gedung, LKS):

```prisma
model FeeComponent {
  id            String   @id @default(cuid())
  templateId    String

  name          String   // "Seragam Olahraga", "Buku LKS", "Uang Gedung"
  amount        Float    // Rp 200.000
  priority      Int      // 1 = prioritas tertinggi (dibayar duluan)

  description   String?
  isActive      Boolean  @default(true)

  // Relations
  template      FeeTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  allocations   ComponentAllocation[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([templateId])
  @@index([priority])
}
```

### 3. StudentFee (Biaya yang Dikenakan ke Siswa)

Biaya aktual yang ditagihkan ke siswa berdasarkan template:

```prisma
model StudentFee {
  id            String   @id @default(cuid())
  studentId     String
  templateId    String

  totalAmount   Float    // Total yang harus dibayar
  paidAmount    Float    @default(0) // Total yang sudah dibayar
  status        String   @default("BELUM_LUNAS") // "LUNAS", "BELUM_LUNAS", "CICILAN"

  academicYear  String
  dueDate       String?  // Tanggal jatuh tempo (optional)

  // Relations
  student       Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  template      FeeTemplate @relation(fields: [templateId], references: [id])
  payments      FeePayment[]
  allocations   ComponentAllocation[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([studentId, templateId, academicYear])
  @@index([studentId])
  @@index([status])
  @@index([academicYear])
}
```

### 4. FeePayment (Pembayaran Cicilan)

Record setiap kali siswa melakukan pembayaran:

```prisma
model FeePayment {
  id            String   @id @default(cuid())
  studentFeeId  String
  studentId     String   // Denormalized untuk query cepat

  amount        Float    // Jumlah yang dibayar
  paymentDate   String
  paymentMethod String   // "Tunai", "Transfer"

  account       String   // Bank account ID
  receiptNo     String   @unique

  notes         String?
  paidBy        String?  // Nama yang melakukan pembayaran

  // Relations
  studentFee    StudentFee @relation(fields: [studentFeeId], references: [id], onDelete: Cascade)
  student       Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  bankAccount   BankAccount @relation(fields: [account], references: [id])
  allocations   ComponentAllocation[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([studentFeeId])
  @@index([studentId])
  @@index([paymentDate])
}
```

### 5. ComponentAllocation (Alokasi Pembayaran ke Komponen)

Mencatat bagaimana setiap pembayaran dialokasikan ke komponen berdasarkan prioritas:

```prisma
model ComponentAllocation {
  id              String   @id @default(cuid())
  paymentId       String
  studentFeeId    String
  componentId     String

  amount          Float    // Jumlah yang dialokasikan ke komponen ini

  // Denormalized untuk reporting
  componentName   String
  componentPriority Int

  // Relations
  payment         FeePayment    @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  studentFee      StudentFee    @relation(fields: [studentFeeId], references: [id], onDelete: Cascade)
  component       FeeComponent  @relation(fields: [componentId], references: [id])

  createdAt       DateTime @default(now())

  @@index([paymentId])
  @@index([studentFeeId])
  @@index([componentId])
}
```

---

## Logika Alokasi Otomatis

### Algorithm: Priority-Based Payment Allocation

```typescript
async function allocatePayment(studentFeeId: string, paymentAmount: number, paymentId: string): Promise<void> {
  // 1. Ambil StudentFee dengan komponen yang sudah diurutkan berdasarkan prioritas
  const studentFee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
    include: {
      template: {
        include: {
          components: {
            orderBy: { priority: 'asc' } // Prioritas 1 dulu
          }
        }
      },
      allocations: true // Alokasi yang sudah ada
    }
  })

  // 2. Hitung sisa yang perlu dibayar untuk setiap komponen
  const componentBalances = studentFee.template.components.map(component => {
    // Total yang sudah dibayar untuk komponen ini
    const paid = studentFee.allocations
      .filter(a => a.componentId === component.id)
      .reduce((sum, a) => sum + a.amount, 0)

    return {
      id: component.id,
      name: component.name,
      priority: component.priority,
      amount: component.amount,
      paid: paid,
      remaining: component.amount - paid
    }
  })

  // 3. Alokasikan payment berdasarkan prioritas
  let remainingPayment = paymentAmount
  const allocations = []

  for (const component of componentBalances) {
    if (remainingPayment <= 0) break
    if (component.remaining <= 0) continue // Komponen sudah lunas

    // Alokasikan sebanyak mungkin ke komponen ini
    const allocatedAmount = Math.min(remainingPayment, component.remaining)

    allocations.push({
      paymentId: paymentId,
      studentFeeId: studentFeeId,
      componentId: component.id,
      componentName: component.name,
      componentPriority: component.priority,
      amount: allocatedAmount
    })

    remainingPayment -= allocatedAmount
  }

  // 4. Simpan semua alokasi
  await prisma.componentAllocation.createMany({
    data: allocations
  })

  // 5. Update total paid amount di StudentFee
  await prisma.studentFee.update({
    where: { id: studentFeeId },
    data: {
      paidAmount: {
        increment: paymentAmount
      },
      status: remainingPayment === 0 && componentBalances.every(c => c.remaining <= 0) ? 'LUNAS' : 'CICILAN'
    }
  })
}
```

---

## Migration Plan

### Phase 1: Schema Update

1. ✅ Backup database saat ini
2. ✅ Tambahkan model baru (FeeTemplate, FeeComponent, ComponentAllocation)
3. ✅ Update relasi di model Student
4. ⚠️ **DEPRECATE** (jangan hapus dulu): SPPPayment, SPPRate

### Phase 2: Data Migration

1. Migrasi data pembayaran yang sudah ada (jika ada)
2. Setup template default untuk tahun ajaran saat ini

### Phase 3: API & Frontend Update

1. Update API endpoints
2. Update form pembayaran
3. Update laporan pembayaran
4. Update dashboard

### Phase 4: Testing & Deployment

1. Testing sistem cicilan
2. Testing laporan
3. User acceptance testing
4. Production deployment

---

## API Endpoints (Planned)

### Fee Template Management

- `GET /api/fee-templates` - List semua template
- `POST /api/fee-templates` - Buat template baru
- `PUT /api/fee-templates/:id` - Update template
- `DELETE /api/fee-templates/:id` - Hapus template

### Fee Component Management

- `GET /api/fee-templates/:id/components` - List komponen
- `POST /api/fee-templates/:id/components` - Tambah komponen
- `PUT /api/fee-components/:id` - Update komponen (termasuk prioritas)
- `DELETE /api/fee-components/:id` - Hapus komponen

### Student Fee Assignment

- `POST /api/student-fees/assign` - Assign fee template ke siswa/kelas
- `GET /api/students/:id/fees` - List biaya siswa
- `GET /api/student-fees/:id/breakdown` - Detail breakdown pembayaran

### Payment Processing

- `POST /api/fee-payments` - Process pembayaran (dengan auto-allocation)
- `GET /api/fee-payments/:id/receipt` - Cetak kwitansi
- `GET /api/students/:id/payment-history` - Riwayat pembayaran

### Reports

- `GET /api/reports/fee-collection` - Laporan pemasukan biaya
- `GET /api/reports/unpaid-fees` - Laporan tunggakan
- `GET /api/reports/component-breakdown` - Breakdown per komponen

---

## UI/UX Considerations

### Admin Side:

1. **Fee Template Builder**
   - Drag-and-drop untuk atur prioritas komponen
   - Preview total biaya
   - Clone template dari tahun sebelumnya

2. **Payment Form**
   - Real-time preview alokasi
   - Show remaining balance per komponen
   - Auto-generate receipt

3. **Dashboard**
   - Card untuk setiap komponen biaya
   - Progress bar untuk setiap siswa
   - Alert untuk yang mendekati deadline

### Parent/Student Portal:

1. View biaya yang harus dibayar
2. Breakdown per komponen dengan status
3. History pembayaran
4. Download kwitansi

---

## Questions for Yayasan ✅ CONFIRMED

1. **Prioritas Default:** Apakah urutan prioritas sama untuk semua siswa atau bisa berbeda per kelas/tingkat?  
   ✅ **JAWABAN: YA, sama untuk semua siswa**

2. **Pembayaran Lebih:** Bagaimana jika ada siswa bayar lebih dari total? Dikembalikan atau dicatat sebagai kredit?  
   ✅ **JAWABAN: TIDAK AKAN TERJADI** (sistem akan validasi agar tidak bisa bayar lebih)

3. **Diskon/Beasiswa:** Apakah ada sistem diskon atau beasiswa? Jika ada, diterapkan ke komponen tertentu atau proporsional?  
   ✅ **JAWABAN: TIDAK ADA (BELUM ADA)** (bisa ditambahkan nanti jika diperlukan)

4. **Deadline:** Apakah ada deadline pembayaran? Ada denda keterlambatan?  
   ✅ **JAWABAN: TIDAK ADA** (pembayaran fleksibel tanpa denda)

5. **Perubahan Harga:** Bagaimana jika harga komponen berubah di tengah tahun? (misal: harga seragam naik)  
   ✅ **JAWABAN: INI BELUM TERFIKIRKAN** (untuk saat ini, harga fixed setelah template dibuat)

6. **Cicilan Minimum:** Apakah ada aturan cicilan minimum? (misal: minimal bayar 100rb per cicilan)  
   ✅ **JAWABAN: TIDAK ADA** (siswa bisa bayar cicilan dengan nominal bebas)

---

## Next Steps

### ✅ Phase 1: Schema Update (COMPLETED)

- ✅ Backup database saat ini
- ✅ Tambahkan model baru (FeeTemplate, FeeComponent, StudentFeeNew, FeePaymentNew, ComponentAllocation)
- ✅ Update relasi di model Student dan BankAccount
- ✅ Mark as DEPRECATED: SPPPayment, SPPRate, PaymentCategory, StudentFee (old)
- ✅ Run `npx prisma db push` untuk update schema

### ✅ Phase 2: Core Services (COMPLETED)

- ✅ Created `src/services/feeAllocationService.ts` dengan fungsi:
  - `processPaymentWithAllocation()` - Process payment dengan auto-allocation
  - `getStudentFeeBreakdown()` - Get detail breakdown pembayaran
  - `simulatePaymentAllocation()` - Simulate allocation tanpa save
- ✅ Created seed script `prisma/seeds/seedFeeSystem.ts`
- ✅ Created test script `scripts/testPaymentAllocation.ts`

### 🔄 Phase 3: Testing Core Logic

Run the following commands to test:

```bash
# 1. Seed the fee templates and components
npx tsx prisma/seeds/seedFeeSystem.ts

# 2. Test payment allocation (simulation only)
npx tsx scripts/testPaymentAllocation.ts
```

Expected output:

- Fee templates created (Registration & Re-registration)
- Components with priorities shown
- Simulation of how Rp 200.000 and Rp 350.000 payments would be allocated

### ⏳ Phase 4: API Endpoints (TODO)

Create API routes for:

- [ ] `POST /api/fee-templates` - Create template
- [ ] `GET /api/fee-templates` - List templates
- [ ] `POST /api/fee-templates/:id/components` - Add components
- [ ] `POST /api/student-fees/assign` - Assign fee to student/class
- [ ] `POST /api/fee-payments/process` - Process payment
- [ ] `GET /api/student-fees/:id/breakdown` - Get breakdown
- [ ] `POST /api/fee-payments/simulate` - Simulate allocation

### ⏳ Phase 5: Frontend UI (TODO)

Create UI components:

- [ ] Fee Template Builder (Admin)
- [ ] Component Priority Manager (Drag & Drop)
- [ ] Payment Form with Live Preview
- [ ] Student Fee Dashboard
- [ ] Payment History & Receipt

### ⏳ Phase 6: Reports (TODO)

- [ ] Fee collection report
- [ ] Outstanding balance report
- [ ] Component-wise breakdown report
- [ ] Payment history report

### ⏳ Phase 7: Data Migration (TODO)

- [ ] Migrate existing payment data (if any)
- [ ] Archive old SPP data
- [ ] Clean up deprecated models

### ⏳ Phase 8: User Acceptance Testing

- [ ] Test with sample data
- [ ] Training for admin staff
- [ ] Feedback & refinement

### ⏳ Phase 9: Production Deployment

- [ ] Final testing
- [ ] Database backup
- [ ] Deploy to production
- [ ] Monitor for issues

**Current Status:** Phase 2 Complete - Core services ready for testing!  
**Next Milestone:** Create API endpoints for fee management

**Estimasi Waktu Total:** 2-3 minggu untuk development + testing lengkap  
**Time Spent:** ~4 hours (Schema + Core Services)
