# 📝 Panduan Integrasi Activity Logging ke CRUD Operations

## 🎯 Objective

Memastikan **SEMUA operasi CRUD** (Create, Read, Update, Delete) tercatat dalam activity log.

---

## ✅ **Status Implementasi**

### **Already Implemented:** ✅

| Operation  | Entity      | Function          | Status    |
| ---------- | ----------- | ----------------- | --------- |
| **CREATE** | Income      | `addIncome()`     | ✅ Logged |
| **CREATE** | Expense     | `addExpense()`    | ✅ Logged |
| **CREATE** | SPP Payment | `addSPPPayment()` | ✅ Logged |

### **TODO - Perlu Ditambahkan:** ⚠️

| Operation  | Entity      | Function            | Status             |
| ---------- | ----------- | ------------------- | ------------------ |
| **CREATE** | Student     | Manual di component | ❌ Not logged      |
| **UPDATE** | Student     | Manual di component | ❌ Not logged      |
| **DELETE** | Student     | **TIDAK ADA**       | ❌ Not implemented |
| **DELETE** | Income      | **TIDAK ADA**       | ❌ Not implemented |
| **DELETE** | Expense     | **TIDAK ADA**       | ❌ Not implemented |
| **DELETE** | SPP Payment | **TIDAK ADA**       | ❌ Not implemented |
| **UPDATE** | Income      | **TIDAK ADA**       | ❌ Not implemented |
| **UPDATE** | Expense     | **TIDAK ADA**       | ❌ Not implemented |
| **CREATE** | Class       | Manual di component | ❌ Not logged      |
| **UPDATE** | Class       | Manual di component | ❌ Not logged      |
| **DELETE** | Class       | **TIDAK ADA**       | ❌ Not implemented |

---

## 🚀 **Cara Implementasi**

### **Step 1: Tambahkan Fungsi DELETE ke AppContext**

Buka `src/contexts/AppContext.tsx` dan tambahkan fungsi-fungsi ini:

```typescript
// ==================== DELETE FUNCTIONS ====================

const deleteStudent = (studentId: string) => {
  const student = students.find(s => s.id === studentId)

  if (!student) {
    logActivity('student_deleted', `Gagal menghapus siswa - ID tidak ditemukan: ${studentId}`, { studentId }, 'failed')
    return false
  }

  // Delete from state
  setStudents(prev => prev.filter(s => s.id !== studentId))

  // Log activity
  logActivity(
    'student_deleted',
    `Siswa "${student.name}" (NIS: ${student.nis}) telah dihapus dari sistem`,
    {
      studentId: student.id,
      studentName: student.name,
      nis: student.nis,
      grade: student.grade,
      class: student.class
    },
    'success'
  )

  return true
}

const deleteIncome = (incomeId: string) => {
  const income = incomes.find(i => i.id === incomeId)

  if (!income) {
    logActivity('income_deleted', `Gagal menghapus pemasukan - ID tidak ditemukan: ${incomeId}`, { incomeId }, 'failed')
    return false
  }

  // Reverse account balance
  setAccounts(prev =>
    prev.map(acc => (acc.id === income.account ? { ...acc, balance: acc.balance - income.amount } : acc))
  )

  // Delete from state
  setIncomes(prev => prev.filter(i => i.id !== incomeId))

  // Log activity
  logActivity(
    'income_deleted',
    `Pemasukan dihapus: ${income.description} - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(income.amount)}`,
    {
      incomeId: income.id,
      referenceNo: income.referenceNo,
      amount: income.amount,
      description: income.description,
      category: income.category
    },
    'success'
  )

  return true
}

const deleteExpense = (expenseId: string) => {
  const expense = expenses.find(e => e.id === expenseId)

  if (!expense) {
    logActivity(
      'expense_deleted',
      `Gagal menghapus pengeluaran - ID tidak ditemukan: ${expenseId}`,
      { expenseId },
      'failed'
    )
    return false
  }

  // Reverse account balance
  setAccounts(prev =>
    prev.map(acc => (acc.id === expense.account ? { ...acc, balance: acc.balance + expense.amount } : acc))
  )

  // Reverse budget realization if linked
  if (expense.budgetId) {
    setBudgets(prev =>
      prev.map(budget =>
        budget.id === expense.budgetId ? { ...budget, realization: budget.realization - expense.amount } : budget
      )
    )
  }

  // Delete from state
  setExpenses(prev => prev.filter(e => e.id !== expenseId))

  // Log activity
  logActivity(
    'expense_deleted',
    `Pengeluaran dihapus: ${expense.description} - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(expense.amount)}`,
    {
      expenseId: expense.id,
      referenceNo: expense.referenceNo,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      budgetId: expense.budgetId
    },
    'success'
  )

  return true
}

const deleteSPPPayment = (paymentId: string) => {
  const payment = sppPayments.find(p => p.id === paymentId)

  if (!payment) {
    logActivity('other', `Gagal menghapus pembayaran SPP - ID tidak ditemukan: ${paymentId}`, { paymentId }, 'failed')
    return false
  }

  // Reverse account balance
  setAccounts(prev =>
    prev.map(acc => (acc.id === payment.account ? { ...acc, balance: acc.balance - payment.amount } : acc))
  )

  // Also delete the auto-generated income
  const relatedIncome = incomes.find(
    i =>
      i.description.includes(`Pembayaran SPP ${payment.month} ${payment.year}`) &&
      i.description.includes(payment.studentName)
  )

  if (relatedIncome) {
    deleteIncome(relatedIncome.id)
  }

  // Delete from state
  setSPPPayments(prev => prev.filter(p => p.id !== paymentId))

  // Log activity
  logActivity(
    'other',
    `Pembayaran SPP dihapus: ${payment.studentName} - ${payment.month} ${payment.year}`,
    {
      paymentId: payment.id,
      receiptNo: payment.receiptNo,
      studentId: payment.studentId,
      studentName: payment.studentName,
      month: payment.month,
      year: payment.year,
      amount: payment.amount
    },
    'success'
  )

  return true
}

const deleteClass = (classId: string) => {
  const classData = classes.find(c => c.id === classId)

  if (!classData) {
    logActivity('class_deleted', `Gagal menghapus kelas - ID tidak ditemukan: ${classId}`, { classId }, 'failed')
    return false
  }

  // Delete from state
  setClasses(prev => prev.filter(c => c.id !== classId))

  // Log activity
  logActivity(
    'class_deleted',
    `Kelas "${classData.grade} ${classData.className}" telah dihapus`,
    {
      classId: classData.id,
      grade: classData.grade,
      className: classData.className,
      teacher: classData.teacher,
      academicYear: classData.academicYear
    },
    'success'
  )

  return true
}
```

### **Step 2: Tambahkan Fungsi UPDATE**

```typescript
// ==================== UPDATE FUNCTIONS ====================

const updateStudent = (studentId: string, updates: Partial<StudentType>) => {
  const oldStudent = students.find(s => s.id === studentId)

  if (!oldStudent) {
    logActivity('student_updated', `Gagal update siswa - ID tidak ditemukan: ${studentId}`, { studentId }, 'failed')
    return false
  }

  // Update state
  setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, ...updates } : s)))

  // Track what changed
  const changes = Object.keys(updates).filter(
    key => oldStudent[key as keyof StudentType] !== updates[key as keyof StudentType]
  )

  // Log activity
  logActivity(
    'student_updated',
    `Data siswa "${oldStudent.name}" (NIS: ${oldStudent.nis}) telah diupdate`,
    {
      studentId,
      studentName: oldStudent.name,
      changedFields: changes,
      oldData: { ...oldStudent },
      newData: { ...oldStudent, ...updates }
    },
    'success'
  )

  return true
}

const updateIncome = (incomeId: string, updates: Partial<IncomeType>) => {
  const oldIncome = incomes.find(i => i.id === incomeId)

  if (!oldIncome) {
    logActivity('income_updated', `Gagal update pemasukan - ID tidak ditemukan: ${incomeId}`, { incomeId }, 'failed')
    return false
  }

  // If amount changed, update account balance
  if (updates.amount && updates.amount !== oldIncome.amount) {
    const difference = updates.amount - oldIncome.amount

    setAccounts(prev =>
      prev.map(acc => (acc.id === oldIncome.account ? { ...acc, balance: acc.balance + difference } : acc))
    )
  }

  // Update state
  setIncomes(prev => prev.map(i => (i.id === incomeId ? { ...i, ...updates } : i)))

  // Log activity
  logActivity(
    'income_updated',
    `Pemasukan diupdate: ${oldIncome.description}`,
    {
      incomeId,
      referenceNo: oldIncome.referenceNo,
      oldAmount: oldIncome.amount,
      newAmount: updates.amount || oldIncome.amount
    },
    'success'
  )

  return true
}

const updateExpense = (expenseId: string, updates: Partial<ExpenseType>) => {
  const oldExpense = expenses.find(e => e.id === expenseId)

  if (!oldExpense) {
    logActivity(
      'expense_updated',
      `Gagal update pengeluaran - ID tidak ditemukan: ${expenseId}`,
      { expenseId },
      'failed'
    )
    return false
  }

  // If amount changed, update account balance
  if (updates.amount && updates.amount !== oldExpense.amount) {
    const difference = updates.amount - oldExpense.amount

    setAccounts(prev =>
      prev.map(acc => (acc.id === oldExpense.account ? { ...acc, balance: acc.balance - difference } : acc))
    )
  }

  // Update state
  setExpenses(prev => prev.map(e => (e.id === expenseId ? { ...e, ...updates } : e)))

  // Log activity
  logActivity(
    'expense_updated',
    `Pengeluaran diupdate: ${oldExpense.description}`,
    {
      expenseId,
      referenceNo: oldExpense.referenceNo,
      oldAmount: oldExpense.amount,
      newAmount: updates.amount || oldExpense.amount
    },
    'success'
  )

  return true
}

const updateClass = (classId: string, updates: Partial<ClassType>) => {
  const oldClass = classes.find(c => c.id === classId)

  if (!oldClass) {
    logActivity('class_updated', `Gagal update kelas - ID tidak ditemukan: ${classId}`, { classId }, 'failed')
    return false
  }

  // Update state
  setClasses(prev => prev.map(c => (c.id === classId ? { ...c, ...updates } : c)))

  // Log activity
  logActivity(
    'class_updated',
    `Kelas "${oldClass.grade} ${oldClass.className}" telah diupdate`,
    {
      classId,
      oldData: { ...oldClass },
      newData: { ...oldClass, ...updates }
    },
    'success'
  )

  return true
}
```

### **Step 3: Export Fungsi di AppContext**

Tambahkan ke `AppContextType`:

```typescript
type AppContextType = {
  // ... existing properties

  // DELETE Functions
  deleteStudent: (studentId: string) => boolean
  deleteIncome: (incomeId: string) => boolean
  deleteExpense: (expenseId: string) => boolean
  deleteSPPPayment: (paymentId: string) => boolean
  deleteClass: (classId: string) => boolean

  // UPDATE Functions
  updateStudent: (studentId: string, updates: Partial<StudentType>) => boolean
  updateIncome: (incomeId: string, updates: Partial<IncomeType>) => boolean
  updateExpense: (expenseId: string, updates: Partial<ExpenseType>) => boolean
  updateClass: (classId: string, updates: Partial<ClassType>) => boolean
}
```

Dan export di value:

```typescript
const value: AppContextType = {
  // ... existing values

  // DELETE
  deleteStudent,
  deleteIncome,
  deleteExpense,
  deleteSPPPayment,
  deleteClass,

  // UPDATE
  updateStudent,
  updateIncome,
  updateExpense,
  updateClass
}
```

---

## 📋 **Cara Menggunakan di Component**

### **Contoh: Delete Student**

```typescript
// Di StudentDataTable.tsx
import { useAppContext } from '@/contexts/AppContext'

const StudentDataTable = () => {
  const { deleteStudent } = useAppContext()

  const handleDelete = (studentId: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      const success = deleteStudent(studentId)

      if (success) {
        toast.success('Siswa berhasil dihapus')
        // Delete akan otomatis tercatat di activity log!
      } else {
        toast.error('Gagal menghapus siswa')
      }
    }
  }

  return (
    // ... table with delete button
    <Button onClick={() => handleDelete(student.id)}>
      Hapus
    </Button>
  )
}
```

### **Contoh: Update Student**

```typescript
// Di EditStudentForm.tsx
const EditStudentForm = ({ studentId }: { studentId: string }) => {
  const { students, updateStudent } = useAppContext()
  const student = students.find(s => s.id === studentId)

  const handleSubmit = (formData) => {
    const success = updateStudent(studentId, formData)

    if (success) {
      toast.success('Data siswa berhasil diupdate')
      // Update akan otomatis tercatat di activity log!
      router.push('/akademik/data-siswa')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### **Contoh: Manual Logging untuk CREATE Student**

Jika create student tidak melalui helper function di AppContext:

```typescript
// Di AddStudentForm.tsx
const AddStudentForm = () => {
  const { students, setStudents, logActivity } = useAppContext()

  const handleSubmit = (formData) => {
    const newStudent = {
      id: `STD-${Date.now()}`,
      ...formData
    }

    setStudents(prev => [newStudent, ...prev])

    // MANUAL LOGGING
    logActivity(
      'student_created',
      `Siswa baru "${newStudent.name}" (NIS: ${newStudent.nis}) telah ditamb ahkan`,
      {
        studentId: newStudent.id,
        studentName: newStudent.name,
        nis: newStudent.nis,
        grade: newStudent.grade,
        class: newStudent.class
      },
      'success'
    )

    toast.success('Siswa berhasil ditambahkan')
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## ✅ **Checklist Implementasi**

### **AppContext.tsx:**

- [ ] Add `deleteStudent()` function
- [ ] Add `deleteIncome()` function
- [ ] Add `deleteExpense()` function
- [ ] Add `deleteSPPPayment()` function
- [ ] Add `deleteClass()` function
- [ ] Add `updateStudent()` function
- [ ] Add `updateIncome()` function
- [ ] Add `updateExpense()` function
- [ ] Add `updateClass()` function
- [ ] Export all functions in `AppContextType`
- [ ] Export all functions in `value` object

### **Components:**

- [ ] Update `StudentDataTable.tsx` - use `deleteStudent()`
- [ ] Update `EditStudentForm.tsx` - use `updateStudent()`
- [ ] Update `AddStudentForm.tsx` - add manual logging
- [ ] Update `IncomeListTable.tsx` - use `deleteIncome()`
- [ ] Update `ExpenseListTable.tsx` - use `deleteExpense()`
- [ ] Update income/expense edit forms - use update functions

---

## 🎯 **Expected Result**

Setelah implementasi lengkap, di halaman **Log Aktivitas** akan tercatat:

```
✅ Login/Logout
✅ Siswa dibuat / diupdate / dihapus
✅ Kelas dibuat / diupdate / dihapus
✅ Pemasukan dibuat / diupdate / dihapus
✅ Pengeluaran dibuat / diupdate / dihapus
✅ Pembayaran SPP dibuat / dihapus
✅ Mutasi kas
✅ Tahun ajaran dibuat / diupdate
```

Dengan metadata lengkap untuk audit trail!

---

## 📊 **Sample Log Output**

```json
{
  "id": "LOG-1733022438000-abc123",
  "timestamp": "2025-12-01T09:40:38+07:00",
  "userId": "admin-001",
  "username": "Admin",
  "activityType": "student_deleted",
  "description": "Siswa \"Ahmad Fauzi\" (NIS: 12345) telah dihapus dari sistem",
  "metadata": {
    "studentId": "STD-001",
    "studentName": "Ahmad Fauzi",
    "nis": "12345",
    "grade": "7",
    "class": "A"
  },
  "status": "success"
}
```

---

Setelah semua ini diimplementasikan, **SEMUA aktivitas user akan tercatat**! 🎉
