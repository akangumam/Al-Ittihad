# 🔗 Panduan Integrasi Modul - Global State Management

**Tanggal**: 29 November 2024  
**Status**: Ready for Implementation

---

## 📚 OVERVIEW

Saya telah membuat **Central State Management** menggunakan React Context untuk menghubungkan semua modul. Setiap perubahan data akan otomatis tersinkronisasi ke semua modul terkait.

### Struktur File Baru:

```
src/
├── contexts/
│   └── AppContext.tsx         # Central state management
├── data/
│   └── initialData.ts         # Initial dummy data
└── app/
    └── [lang]/
        └── layout.tsx         # Updated dengan AppProvider
```

---

## ✅ YANG SUDAH DIKERJAKAN

### 1. AppContext dengan Fitur:

- ✅ **Global State** untuk semua data
- ✅ **localStorage** untuk persistence
- ✅ **Automatic Calculations**:
  - Account balance otomatis update
  - Budget realization otomatis terhitung
  - SPP arrears otomatis kalkulasi
- ✅ **Helper Functions**:
  - `addIncome()` - Auto update balance
  - `addExpense()` - Auto update balance & budget
  - `addSPPPayment()` - Auto add to income & update balance
  - `addMutation()` - Auto update both accounts
  - `getAccountBalance()` - Get real-time balance
  - `getStudentArrears()` - Calculate unpaid months
  - `getBudgetRealization()` - Get budget usage

### 2. Data Types Lengkap:

- `StudentType`
- `ClassType`
- `AcademicYearType`
- `TransactionCategoryType`
- `BankAccountType`
- `IncomeType`
- `ExpenseType`
- `CashMutationType`
- `SPPRateType`
- `SPPPaymentType`
- `BudgetType`

### 3. Initial Data:

- Students (3 sample)
- Classes (4 sample)
- Academic Years (2 sample)
- Categories (6 sample)
- Accounts (3 sample)
- SPP Rates (5 sample)
- Budgets (3 sample)

---

## 🚀 CARA MENGGUNAKAN CONTEXT

### A. Import Hook

```tsx
import { useAppContext } from '@/contexts/AppContext'
```

### B. Gunakan di Component

```tsx
'use client'

import { useAppContext } from '@/contexts/AppContext'

export default function MyComponent() {
  const {
    // Data states
    students,
    accounts,
    incomes,

    // Setter functions
    setStudents,

    // Helper functions
    addIncome,
    getAccountBalance
  } = useAppContext()

  // Rest of your component
}
```

---

## 📝 CONTOH IMPLEMENTASI

### Contoh 1: Update SPPPaymentTable

**SEBELUM** (Isolated State):

```tsx
const [data, setData] = useState(dummyPayments)

const handleSave = () => {
  const newPayment = { ...formData, id: `SPP-${Date.now()}` }
  setData(prev => [newPayment, ...prev])
  // ❌ Saldo tidak update
  // ❌ Income tidak tercatat
}
```

**SESUDAH** (Integrated):

```tsx
import { useAppContext } from '@/contexts/AppContext'

const { sppPayments, addSPPPayment } = useAppContext()

const handleSave = () => {
  addSPPPayment({
    studentId: formData.studentId,
    studentName: formData.studentName,
    month: formData.month,
    year: formData.year,
    amount: formData.amount,
    paymentDate: formData.paymentDate,
    account: formData.account,
    paymentMethod: formData.paymentMethod
  })
  // ✅ Saldo otomatis update!
  // ✅ Income otomatis tercatat!
  // ✅ Tunggakan otomatis berkurang!
}

// Use sppPayments instead of local data
const table = useReactTable({ data: sppPayments, ... })
```

### Contoh 2: Update CashBankTable

**SEBELUM**:

```tsx
const [accounts, setAccounts] = useState(dummyAccounts)
```

**SESUDAH**:

```tsx
import { useAppContext } from '@/contexts/AppContext'

const { accounts } = useAppContext()

// ✅ Balance otomatis update saat ada transaksi!
// ✅ Data sync dengan /pengaturan/akun-kas-bank
```

### Contoh 3: Update BudgetRealization

**SEBELUM**:

```tsx
const [data, setData] = useState(dummyBudgets)
// ❌ Realization tidak otomatis update
```

**SESUDAH**:

```tsx
import { useAppContext } from '@/contexts/AppContext'

const { budgets, getBudgetRealization } = useAppContext()

// Display real-time realization
{
  budgets.map(budget => (
    <tr>
      <td>{budget.name}</td>
      <td>{budget.amount}</td>
      <td>{budget.realization}</td> {/* ✅ Auto-calculated! */}
      <td>{((budget.realization / budget.amount) * 100).toFixed(1)}%</td>
    </tr>
  ))
}
```

### Contoh 4: Update Tunggakan SPP

**SEBELUM**:

```tsx
const [data, setData] = useState(dummyArrears)
// ❌ Manual calculation
```

**SESUDAH**:

```tsx
import { useAppContext } from '@/contexts/AppContext'

const { students, getStudentArrears } = useAppContext()

const arrearsData = students
  .map(student => {
    const arrears = getStudentArrears(student.id)

    return {
      ...student,
      outstandingMonths: arrears.months,
      totalOutstanding: arrears.total,
      status: arrears.months.length > 2 ? 'Berat' : arrears.months.length > 0 ? 'Sedang' : 'Ringan'
    }
  })
  .filter(s => s.outstandingMonths.length > 0)

// ✅ Auto-calculated based on payments!
```

---

## 🔄 DATA FLOW EXAMPLES

### Flow 1: SPP Payment

```
User pays SPP
    ↓
addSPPPayment() called
    ↓
├─ Add to sppPayments ✅
├─ Add to incomes (auto) ✅
├─ Update account balance (auto) ✅
└─ Save to localStorage ✅
    ↓
All modules re-render with new data:
├─ SPP Payment Table shows new payment ✅
├─ Kas & Bank shows updated balance ✅
├─ Income List shows new income ✅
├─ Tunggakan shows reduced arrears ✅
└─ BKU shows new transaction ✅
```

### Flow 2: Add Expense

```
User adds expense
    ↓
addExpense() called
    ↓
├─ Add to expenses ✅
├─ Deduct from account balance (auto) ✅
├─ Update budget realization (if linked) (auto) ✅
└─ Save to localStorage ✅
    ↓
All modules re-render:
├─ Expense List shows new expense ✅
├─ Kas & Bank shows reduced balance ✅
├─ Budget Realization shows updated % ✅
└─ BKU shows new transaction ✅
```

### Flow 3: Account Mutation

```
User transfers money
    ↓
addMutation() called
    ↓
├─ Add to mutations ✅
├─ Deduct from source account (auto) ✅
├─ Add to destination account (auto) ✅
└─ Save to localStorage ✅
    ↓
All modules re-render:
├─ Mutation List shows transfer ✅
├─ Kas & Bank shows updated balances ✅
└─ BKU shows mutation entry ✅
```

---

## 📋 CHECKLIST UPDATE KOMPONEN

Untuk setiap komponen, lakukan:

### 1. Remove Local State

```tsx
// ❌ HAPUS INI
const [data, setData] = useState(initialData)

// ✅ GANTI DENGAN
const { dataFromContext } = useAppContext()
```

### 2. Replace CRUD Functions

**Create:**

```tsx
// ❌ SEBELUM
setData(prev => [...prev, newItem])

// ✅ SESUDAH
addIncome(newItem) // atau addExpense, addSPPPayment, dll
```

**Update:**

```tsx
// ❌ SEBELUM
setData(prev => prev.map(item => (item.id === id ? updatedItem : item)))

// ✅ SESUDAH
setIncomes(prev => prev.map(item => (item.id === id ? updatedItem : item)))
```

**Delete:**

```tsx
// ❌ SEBELUM
setData(prev => prev.filter(item => item.id !== id))

// ✅ SESUDAH
setIncomes(prev => prev.filter(item => item.id !== id))
```

### 3. Use Real-Time Calculations

```tsx
// Instead of manual calculations
const balance = getAccountBalance('ACC-001')
const arrears = getStudentArrears('STD-001')
const realization = getBudgetRealization('BDG-001')
```

---

## 🎯 PRIORITAS UPDATE KOMPONEN

### PRIORITY 1 - Core Finance (Update Dulu)

1. [ ] `SPPPaymentForm.tsx` - Use `addSPPPayment()`
2. [ ] `AddIncomeForm.tsx` - Use `addIncome()`
3. [ ] `AddExpenseForm.tsx` - Use `addExpense()`
4. [ ] `CashMutationTable.tsx` - Use `addMutation()`
5. [ ] `CashBankTable.tsx` - Use `accounts` from context

### PRIORITY 2 - Display Components

6. [ ] `IncomeListTable.tsx` - Use `incomes` from context
7. [ ] `ExpenseListTable.tsx` - Use `expenses` from context
8. [ ] `OutstandingTable.tsx` - Use `getStudentArrears()`
9. [ ] `BudgetRealizationTable.tsx` - Use `budgets` from context

### PRIORITY 3 - Settings

10. [ ] `TransactionCategoryTable.tsx` - Use `categories`
11. [ ] `BankAccountTable.tsx` - Use `accounts`
12. [ ] `SPPRateTable.tsx` - Use `sppRates`

### PRIORITY 4 - Academic

13. [ ] `StudentDataTable.tsx` - Use `students`
14. [ ] `ClassDataTable.tsx` - Use `classes`
15. [ ] `AcademicYearTable.tsx` - Use `academicYears`

### PRIORITY 5 - Budget

16. [ ] `AnnualBudgetTable.tsx` - Use `budgets`
17. [ ] `BudgetApprovalTable.tsx` - Use `budgets`

### PRIORITY 6 - Reports (Already Integrated)

Reports akan otomatis ter-update karena menggunakan data dari context!

---

## 💾 DATA PERSISTENCE

### localStorage Structure:

```json
{
  "students": [],
  "classes": [],
  "academicYears": [],
  "categories": [],
  "accounts": [],
  "incomes": [],
  "expenses": [],
  "mutations": [],
  "sppRates": [],
  "sppPayments": [],
  "budgets": []
}
```

### Cara Reset Data:

```javascript
// Di browser console:
localStorage.removeItem('app_data')
// Refresh page untuk load initial data
```

### Cara Export Data:

```javascript
// Di browser console:
const data = localStorage.getItem('app_data')
console.log(JSON.parse(data))
// Copy to file
```

---

## 🔧 TROUBLESHOOTING

### Error: "useAppContext must be used within an AppProvider"

**Solution**: Pastikan component ada di dalam `<AppProvider>`

### Data tidak persist setelah refresh

**Solution**: Check localStorage di DevTools → Application → Local Storage

### Balance tidak update

**Solution**: Pastikan pakai `addIncome()` / `addExpense()` bukan direct `setIncomes()`

### Duplicate data saat refresh

**Solution**: Check kalau ada yang `useEffect` double-add data

---

## 🚀 NEXT STEPS

1. **Update Priority 1 Components** (Core Finance)
   - Test SPP payment flow end-to-end
   - Verify account balance updates

2. **Update Priority 2 Components** (Display)
   - Verify data appears correctly
   - Test filtering still works

3. **Update Priority 3-5** (Settings, Academic, Budget)
   - Replace local state with context
   - Test CRUD operations

4. **Integration Testing**
   - Test complete flows (SPP → Balance → Report)
   - Verify calculations
   - Test edge cases

5. **Documentation**
   - Add JSDoc comments
   - Create user guide
   - Record demo video

---

## 📝 TEMPLATE UPDATE COMPONENT

Copy template ini untuk update setiap komponen:

```tsx
'use client'

import { useAppContext } from '@/contexts/AppContext'
import { useState } from 'react'

// [Your other imports]

const YourComponent = () => {
  // 1. Get data from context (REPLACE local useState)
  const {
    yourData,           // e.g., students, accounts, incomes
    setYourData,        // Direct setter if needed
    helperFunction      // e.g., addIncome, getAccountBalance
  } = useAppContext()

  // 2. Keep only UI state locally
  const [openDialog, set OpenDialog] = useState(false)
  const [formData, setFormData] = useState({})

  // 3. Use helper functions for CUD operations
  const handleSave = () => {
    helperFunction(formData)  // This will auto-update related data
    setOpenDialog(false)
  }

  // 4. For update/delete, use setters
  const handleUpdate = (id: string, updates: any) => {
    setYourData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const handleDelete = (id: string) => {
    setYourData(prev => prev.filter(item => item.id !== id))
  }

  // 5. Use context data in table
  const table = useReactTable({
    data: yourData,  // From context, not local state
    columns,
    // ... other config
  })

  return (
    // Your JSX
  )
}

export default YourComponent
```

---

## ✅ BENEFITS INTEGRASI INI

1. **Data Consistency** ✅
   - Satu sumber data untuk semua modul
   - Tidak ada duplikasi data

2. **Automatic Updates** ✅
   - Balance otomatis ter-update
   - Calculations otomatis
   - Reports selalu real-time

3. **Data Persistence** ✅
   - Save to localStorage otomatis
   - Data tidak hilang saat refresh

4. **Easy Debugging** ✅
   - Semua data di satu tempat
   - Mudah di-track di console

5. **Ready for Backend** ✅
   - Tinggal replace helper functions dengan API calls
   - Structure sudah siap

---

Dokumentasi lengkap sudah siap! Silakan mulai update komponen satu per satu sesuai prioritas. 🚀
