# 🎯 Priority-Based Fee Payment System

## Quick Start Guide

### 📚 Background

Berdasarkan meeting dengan Yayasan (17 Januari 2026), sistem pembayaran telah diredesign:

- ❌ **Tidak ada SPP bulanan lagi**
- ✅ **Biaya Pendaftaran** (Registrasi siswa baru)
- ✅ **Biaya Daftar Ulang** (Tahunan)
- ✅ **Sistem Prioritas Otomatis** untuk alokasi cicilan

### 🚀 Getting Started

```bash
# 1. Update database schema
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed sample fee templates
npx tsx prisma/seeds/seedFeeSystem.ts

# 4. Test payment allocation
npx tsx scripts/testPaymentAllocation.ts
```

### 📋 Fee Structure Example

**Biaya Pendaftaran 2025/2026: Rp 900.000**

| Priority | Komponen           | Harga      |
| -------- | ------------------ | ---------- |
| 1        | Seragam Olahraga   | Rp 200.000 |
| 2        | Seragam Batik      | Rp 150.000 |
| 3        | Buku LKS           | Rp 150.000 |
| 4        | Uang Gedung        | Rp 300.000 |
| 5        | Biaya Administrasi | Rp 100.000 |

### 💡 How Priority Allocation Works

**Scenario 1: Bayar Rp 200.000**

```
→ Seragam Olahraga: Rp 200.000 ✓ LUNAS
→ Seragam Batik:    Rp 0 (belum bayar)
→ Buku LKS:         Rp 0 (belum bayar)
→ Uang Gedung:      Rp 0 (belum bayar)
→ Biaya Administrasi: Rp 0 (belum bayar)

Sisa: Rp 700.000
```

**Scenario 2: Bayar lagi Rp 350.000**

```
✓ Seragam Olahraga: Rp 200.000 (sudah lunas)
→ Seragam Batik:    Rp 150.000 ✓ LUNAS (dari cicilan ini)
→ Buku LKS:         Rp 150.000 ✓ LUNAS (dari cicilan ini)
→ Uang Gedung:      Rp 50.000 (sebagian, sisa Rp 250.000)
→ Biaya Administrasi: Rp 0 (belum bayar)

Sisa: Rp 350.000
```

### 📦 Files Created

#### Database Schema

- `prisma/schema.prisma` - Updated with new models

**New Models:**

- `FeeTemplate` - Template biaya (Pendaftaran/Daftar Ulang)
- `FeeComponent` - Komponen biaya dengan prioritas
- `StudentFeeNew` - Biaya yang dikenakan ke siswa
- `FeePaymentNew` - Record pembayaran
- `ComponentAllocation` - Tracking alokasi otomatis

#### Services

- `src/services/feeAllocationService.ts` - Core payment logic
  - `processPaymentWithAllocation()` - Process + auto-allocate
  - `getStudentFeeBreakdown()` - Get detailed breakdown
  - `simulatePaymentAllocation()` - Preview allocation

#### Scripts

- `prisma/seeds/seedFeeSystem.ts` - Seed sample data
- `scripts/testPaymentAllocation.ts` - Test & demo script

#### Documentation

- `PAYMENT_SYSTEM_REDESIGN.md` - Full technical documentation

### 🔑 Key Features

✅ **Automatic Priority Allocation**

- Sistem otomatis alokasikan pembayaran ke komponen berdasarkan prioritas
- Tidak perlu manual pilih komponen mana yang dibayar

✅ **Flexible Installments**

- Siswa bisa bayar cicilan dengan nominal bebas
- Tidak ada cicilan minimum
- Tidak ada denda keterlambatan

✅ **Transparent Breakdown**

- Orang tua bisa lihat detail komponen mana yang sudah dibayar
- Tracking lengkap per komponen

✅ **Overpayment Protection**

- Sistem validasi agar tidak bisa bayar lebih dari total
- Mencegah error pembayaran

### 🎨 Next Steps (Frontend)

TODO: Create UI components for:

- [ ] Fee Template Builder (Admin)
- [ ] Payment Form with Live Preview
- [ ] Student Fee Dashboard
- [ ] Payment Receipt Generator
- [ ] Reports & Analytics

### 📖 API Usage Example

```typescript
import { processPaymentWithAllocation } from '@/services/feeAllocationService'

// Process a payment
const result = await processPaymentWithAllocation(
  'student-fee-id',
  200000, // Rp 200.000
  {
    paymentDate: '2026-01-18',
    paymentMethod: 'Tunai',
    account: 'bank-account-id',
    receiptNo: 'RCP-2026-001',
    notes: 'Cicilan pertama',
    paidBy: 'Bapak Ahmad'
  }
)

if (result.success) {
  console.log('Payment ID:', result.paymentId)
  console.log('Allocated:', result.totalAllocated)
  console.log('Remaining:', result.remainingBalance)

  // Show allocation details
  result.allocations.forEach(alloc => {
    if (alloc.allocatedNow > 0) {
      console.log(`${alloc.componentName}: ${alloc.allocatedNow}`)
    }
  })
}
```

### 📞 Questions?

See `PAYMENT_SYSTEM_REDESIGN.md` for full technical documentation and implementation details.

---

**Status:** ✅ Core Logic Complete  
**Next:** Create API endpoints and frontend UI  
**Last Updated:** 2026-01-18
