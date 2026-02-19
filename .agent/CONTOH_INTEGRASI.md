## 📁 Contoh Komponen Terintegrasi

File ini menunjukkan contoh konkret bagaimana update komponen untuk menggunakan AppContext.

---

## CONTOH 1: SPPPaymentForm (Priority 1)

### SEBELUM (Isolated):

```tsx
'use client'

import { useState } from 'react'

export default function SPPPaymentForm() {
  // ❌ Local state isolated
  const [payments, setPayments] = useState([])
  const [formData, setFormData] = useState({
    studentName: '',
    month: '',
    amount: 0,
    account: '',
    paymentMethod: ''
  })

  const handleSubmit = () => {
    const newPayment = {
      id: `SPP-${Date.now()}`,
      ...formData,
      paymentDate: new Date().toISOString()
    }

    // ❌ Only updates local state
    setPayments(prev => [newPayment, ...prev])

    // ❌ No balance update
    // ❌ No income record
    // ❌ No arrears reduction
  }

  return (
    // Form JSX
  )
}
```

### ✅ SESUDAH (Integrated):

```tsx
'use client'

import { useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'

export default function SPPPaymentForm() {
  // ✅ Get context
  const {
    students, // For student selection
    accounts, // For account selection
    sppRates, // For amount calculation
    addSPPPayment // Helper function
  } = useAppContext()

  // ✅ Only keep UI state locally
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    month: '',
    year: '',
    amount: 0,
    account: '',
    paymentMethod: ''
  })

  // ✅ Auto-calculate amount when student/month changes
  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    const rate = sppRates.find(r => r.grade === student.grade && r.class === student.class && r.isActive)

    setFormData(prev => ({
      ...prev,
      studentId,
      studentName: student.name,
      amount: rate?.amount || 0
    }))
  }

  const handleSubmit = () => {
    // ✅ Use helper function - auto updates everything!
    addSPPPayment({
      studentId: formData.studentId,
      studentName: formData.studentName,
      month: formData.month,
      year: formData.year,
      amount: formData.amount,
      paymentDate: new Date().toISOString(),
      account: formData.account,
      paymentMethod: formData.paymentMethod
    })

    // ✅ AUTOMATIC UPDATES:
    // - sppPayments array updated
    // - incomes array updated (auto-added)
    // - account balance increased
    // - localStorage saved
    // - All related components re-render

    // Reset form
    setFormData({
      studentId: '',
      studentName: '',
      month: '',
      year: '',
      amount: 0,
      account: '',
      paymentMethod: ''
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Student Select - use students from context */}
      <select value={formData.studentId} onChange={e => handleStudentChange(e.target.value)}>
        <option value=''>Pilih Siswa</option>
        {students.map(student => (
          <option key={student.id} value={student.id}>
            {student.name} - {student.grade}
            {student.class}
          </option>
        ))}
      </select>

      {/* Account Select - use accounts from context */}
      <select value={formData.account} onChange={e => setFormData({ ...formData, account: e.target.value })}>
        <option value=''>Pilih Akun</option>
        {accounts
          .filter(acc => acc.isActive)
          .map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.accountName} - Balance: {acc.balance.toLocaleString()}
            </option>
          ))}
      </select>

      {/* Amount - auto-filled from SPP rate */}
      <input type='number' value={formData.amount} readOnly placeholder='Amount (auto)' />

      <button type='submit'>Bayar SPP</button>
    </form>
  )
}
```

**KEY CHANGES:**

1. ✅ Import `useAppContext`
2. ✅ Get `students`, `accounts`, `sppRates`, `addSPPPayment` from context
3. ✅ Use `addSPPPayment()` instead of `setPayments()`
4. ✅ Auto-calculate amount from SPP rates
5. ✅ Show real accounts with real balances

---

## CONTOH 2: CashBankTable (Priority 1)

### ❌ SEBELUM:

```tsx
const [accounts, setAccounts] = useState(dummyAccounts)

// ❌ Balance is static from initialData
// ❌ Doesn't update when transactions happen
```

### ✅ SESUDAH:

```tsx
import { useAppContext } from '@/contexts/AppContext'

export default function CashBankTable() {
  const { accounts } = useAppContext()

  // ✅ accounts.balance is LIVE!
  // ✅ Updates automatically when:
  //    - Income added
  //    - Expense added
  //    - SPP payment received
  //    - Mutation executed

  const totalBalance = accounts.filter(acc => acc.isActive).reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div>
      <h2>Total: Rp {totalBalance.toLocaleString()}</h2>

      <table>
        {accounts.map(account => (
          <tr key={account.id}>
            <td>{account.accountName}</td>
            <td>Rp {account.balance.toLocaleString()}</td>
            {/* ✅ Real-time balance! */}
          </tr>
        ))}
      </table>
    </div>
  )
}
```

---

## CONTOH 3: OutstandingTable (Priority 2)

### ❌ SEBELUM:

```tsx
const [data, setData] = useState(dummyArrears)

// ❌ Manual array of outstanding
// ❌ Not calculated from actual payments
```

### ✅ SESUDAH:

```tsx
import { useAppContext } from '@/contexts/AppContext'

export default function OutstandingTable() {
  const { students, getStudentArrears } = useAppContext()

  // ✅ Calculate arrears for all students
  const arrearsData = students
    .map(student => {
      const arrears = getStudentArrears(student.id)

      return {
        id: student.id,
        studentName: student.name,
        studentNIS: student.nis,
        grade: student.grade,
        class: student.class,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        outstandingMonths: arrears.months,
        totalOutstanding: arrears.total,
        status: arrears.months.length > 2 ? 'Berat' : arrears.months.length > 0 ? 'Sedang' : 'Ringan'
      }
    })
    .filter(student => student.outstandingMonths.length > 0)

  // ✅ Auto-calculated!
  // ✅ Updates when payment is made!

  return (
    <table>
      {arrearsData.map(student => (
        <tr key={student.id}>
          <td>{student.studentName}</td>
          <td>{student.outstandingMonths.join(', ')}</td>
          <td>Rp {student.totalOutstanding.toLocaleString()}</td>
          <td>
            <span className={`badge-${student.status.toLowerCase()}`}>{student.status}</span>
          </td>
        </tr>
      ))}
    </table>
  )
}
```

---

## CONTOH 4: BudgetRealizationTable (Priority 2)

### ❌ SEBELUM:

```tsx
const [budgets, setBudgets] = useState(dummyBudgets)

// ❌ realization is static
// ❌ Doesn't update when expenses added
```

### ✅ SESUDAH:

```tsx
import { useAppContext } from '@/contexts/AppContext'

export default function BudgetRealizationTable() {
  const { budgets } = useAppContext()

  // ✅ budget.realization updates automatically!
  // ✅ When expense is linked to budget

  return (
    <table>
      <thead>
        <tr>
          <th>Budget</th>
          <th>Planned</th>
          <th>Realization</th>
          <th>Remaining</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {budgets.map(budget => {
          const percentage = (budget.realization / budget.amount) * 100
          const remaining = budget.amount - budget.realization

          return (
            <tr key={budget.id}>
              <td>{budget.name}</td>
              <td>Rp {budget.amount.toLocaleString()}</td>
              <td>Rp {budget.realization.toLocaleString()}</td>
              <td>Rp {remaining.toLocaleString()}</td>
              <td>
                <span className={percentage > 90 ? 'text-error' : 'text-success'}>{percentage.toFixed(1)}%</span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

---

## CONTOH 5: AddExpenseForm (Priority 1)

### ❌ SEBELUM:

```tsx
const [expenses, setExpenses] = useState([])

const handleSubmit = () => {
  const newExpense = { id: `EXP-${Date.now()}`, ...formData }
  setExpenses(prev => [newExpense, ...prev])

  // ❌ Balance not updated
  // ❌ Budget not updated
}
```

### ✅ SESUDAH:

```tsx
import { useAppContext } from '@/contexts/AppContext'

export default function AddExpenseForm() {
  const {
    categories, // For category select
    accounts, // For account select
    budgets, // For budget linking
    addExpense // Helper function
  } = useAppContext()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    account: '',
    paymentMethod: 'Tunai',
    budgetId: ''
  })

  const handleSubmit = () => {
    addExpense({
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      account: formData.account,
      paymentMethod: formData.paymentMethod,
      budgetId: formData.budgetId || undefined
    })

    // ✅ AUTOMATIC UPDATES:
    // - expenses array updated
    // - account balance decreased
    // - budget realization increased (if budgetId provided)
    // - localStorage saved

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      account: '',
      paymentMethod: 'Tunai',
      budgetId: ''
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Category from context */}
      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
        <option value=''>Pilih Kategori</option>
        {categories
          .filter(cat => cat.type === 'Pengeluaran' && cat.isActive)
          .map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
      </select>

      {/* Account from context */}
      <select value={formData.account} onChange={e => setFormData({ ...formData, account: e.target.value })}>
        <option value=''>Pilih Akun</option>
        {accounts
          .filter(acc => acc.isActive)
          .map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.accountName} - Saldo: Rp {acc.balance.toLocaleString()}
            </option>
          ))}
      </select>

      {/* Optional: Link to budget */}
      <select value={formData.budgetId} onChange={e => setFormData({ ...formData, budgetId: e.target.value })}>
        <option value=''>Tidak terkait budget</option>
        {budgets
          .filter(b => b.status === 'Active')
          .map(budget => (
            <option key={budget.id} value={budget.id}>
              {budget.name} - Tersisa: Rp {(budget.amount - budget.realization).toLocaleString()}
            </option>
          ))}
      </select>

      {/* Amount */}
      <input
        type='number'
        value={formData.amount}
        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
        placeholder='Jumlah'
      />

      <button type='submit'>Simpan Pengeluaran</button>
    </form>
  )
}
```

---

## POLA UMUM UPDATE

Untuk setiap komponen, ikuti pola ini:

```tsx
// 1. Import useAppContext
import { useAppContext } from '@/contexts/AppContext'

export default function YourComponent() {
  // 2. Get what you need from context
  const {
    dataYouNeed, // e.g., students, accounts
    setterIfNeeded, // e.g., setStudents
    helperFunction // e.g., addIncome
  } = useAppContext()

  // 3. Keep only UI state locally
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({})

  // 4. Use helper functions
  const handleSubmit = () => {
    helperFunction(formData)
    // Magic happens automatically!
  }

  // 5. For update/delete, use setters directly
  const handleUpdate = (id, updates) => {
    setterIfNeeded(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)))
  }

  // 6. Use context data in render
  return (
    <div>
      {dataYouNeed.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

## CHECKLIST UPDATE KOMPONEN

Untuk setiap file yang diupdate:

- [ ] Import `useAppContext`
- [ ] Replace `useState(dummyData)` dengan data from context
- [ ] Replace manual state updates dengan helper functions
- [ ] Test CRUD operations masih berfungsi
- [ ] Test data persist setelah refresh
- [ ] Test integration dengan modul lain
- [ ] Commit changes

---

Gunakan contoh-contoh di atas sebagai reference saat update komponen!
