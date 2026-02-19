'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useState, useEffect } from 'react'

// Types Imports
import type { ActivityLogType, ActivityType } from '@/types/activityLog'

// ==================== TYPES ====================

// Academic Types
export type StudentType = {
  id: string
  nis: string
  nisn: string
  name: string
  nickname?: string
  grade: string
  class: string
  birthPlace?: string
  birthDate: string
  gender: 'L' | 'P'
  religion?: string
  address: string
  rt?: string
  rw?: string
  kelurahan?: string
  kecamatan?: string
  city?: string
  province?: string
  postalCode?: string
  parentName: string
  fatherName?: string
  motherName?: string
  guardianName?: string
  guardianRelation?: string
  phone?: string
  parentPhone: string
  email?: string
  enrollmentDate?: string
  sppStartDate?: string
  status: 'Aktif' | 'Lulus' | 'Keluar' | 'Cuti'
  photo?: string
  academicYear?: string
  previousSchool?: string
}

export type ClassType = {
  id: string
  grade: string
  className: string
  capacity: number
  currentStudents: number
  teacher: string
  academicYear: string
}

export type AcademicYearType = {
  id: string
  name: string
  startDate: string
  endDate: string
  semester?: 'Ganjil' | 'Genap'
  isActive: boolean
}

export type TeacherType = {
  id: string
  nip: string
  nuptk: string
  name: string
  subject: string
  position: string
  gender: 'L' | 'P'
  birthPlace?: string
  birthDate?: string
  phone: string
  email: string
  address: string
  education?: string
  status: 'Aktif' | 'Cuti' | 'Pensiun' | 'Keluar'
  photo?: string
}

export type TeachingScheduleType = {
  id: string
  teacherId: string
  teacherName: string
  subject: string
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'
  startTime: string
  endTime: string
  grade: string
  class: string
  academicYear: string
  room?: string
  notes?: string
}

// Finance Types
export type TransactionCategoryType = {
  id: string
  name: string
  type: 'Pemasukan' | 'Pengeluaran'
  description: string
  isActive: boolean
}

export type BankAccountType = {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  accountType: 'Kas' | 'Bank'
  balance: number
  isActive: boolean
}

export type IncomeType = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  account: string
  paymentMethod: string
  referenceNo: string
}

export type ExpenseType = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  account: string
  paymentMethod: string
  budgetId?: string
  referenceNo: string
}

export type CashMutationType = {
  id: string
  date: string
  fromAccount: string
  toAccount: string
  amount: number
  description: string
  referenceNo: string
}

// Old Fee Management Types (Deprecated)
export type PaymentCategoryType = {
  id: string
  name: string
  amount: number
  priority: number
  isActive: boolean
}

export type StudentFeeType = {
  id: string
  studentId: string
  paymentCategoryId: string
  amountDue: number
  amountPaid: number
  status: string
  academicYear: string
  category?: PaymentCategoryType
}

export type FeePaymentType = {
  student?: StudentType
}

export type SPPRateType = {
  id: string
  academicYear: string
  grade: string
  amount: number
  description?: string
  isActive: boolean
}

export type SPPPaymentType = {
  id: string
  studentId: string
  studentName: string
  grade: string
  class: string
  sppRateId: string
  month: string
  year: string
  academicYear: string
  amount: number
  paymentDate?: string
  status: string
  paymentMethod?: string
  transactionId?: string
  notes?: string
  receiptNo?: string
  account?: string
}

// New Fee Management Types (Priority-Based)
export type FeeComponentType = {
  id: string
  templateId: string
  name: string
  amount: number
  priority: number
  description?: string
  isActive: boolean
}

export type FeeTemplateType = {
  id: string
  name: string
  type: 'REGISTRATION' | 'ANNUAL_REREGISTRATION'
  academicYear: string
  grade?: string
  description?: string
  isActive: boolean
  components: FeeComponentType[]
}

export type ComponentAllocationType = {
  id: string
  paymentId: string
  studentFeeId: string
  componentId: string
  amount: number
  componentName: string
  componentPriority: number
  component?: FeeComponentType
}

export type StudentFeeNewType = {
  id: string
  studentId: string
  templateId: string
  totalAmount: number
  paidAmount: number
  status: 'LUNAS' | 'BELUM_LUNAS' | 'CICILAN'
  academicYear: string
  dueDate?: string
  template?: FeeTemplateType
  student?: StudentType
  allocations?: ComponentAllocationType[]
}

export type FeePaymentNewType = {
  id: string
  studentFeeId: string
  studentId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  account: string
  receiptNo: string
  notes?: string
  paidBy?: string
  allocations?: ComponentAllocationType[]
  student?: StudentType
  studentFee?: StudentFeeNewType
}

// Budget Types
export type BudgetType = {
  id: string
  budgetCode: string
  name: string
  category: 'Operasional' | 'Modal' | 'Pemeliharaan' | 'Pengembangan'
  amount: number
  source: 'BOS' | 'APBN' | 'APBD' | 'Donasi' | 'Lainnya'
  fiscalYear: string
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed'
  realization: number
}

// ==================== CONTEXT TYPE ====================

type AppContextType = {
  students: StudentType[]
  setStudents: (students: StudentType[]) => void
  classes: ClassType[]
  setClasses: (classes: ClassType[]) => void
  academicYears: AcademicYearType[]
  setAcademicYears: (years: AcademicYearType[]) => void
  teachers: TeacherType[]
  setTeachers: (teachers: TeacherType[]) => void
  teachingSchedules: TeachingScheduleType[]
  setTeachingSchedules: (schedules: TeachingScheduleType[]) => void

  categories: TransactionCategoryType[]
  setCategories: (categories: TransactionCategoryType[]) => void
  accounts: BankAccountType[]
  setAccounts: (accounts: BankAccountType[]) => void

  incomes: IncomeType[]
  setIncomes: (incomes: IncomeType[]) => void
  expenses: ExpenseType[]
  setExpenses: (expenses: ExpenseType[]) => void
  mutations: CashMutationType[]
  setMutations: (mutations: CashMutationType[]) => void

  paymentCategories: PaymentCategoryType[]
  setPaymentCategories: (categories: PaymentCategoryType[]) => void
  studentFees: StudentFeeType[]
  setStudentFees: (fees: StudentFeeType[]) => void
  feePayments: FeePaymentType[]
  setFeePayments: (payments: FeePaymentType[]) => void
  sppRates: SPPRateType[]
  setSppRates: (rates: SPPRateType[]) => void
  sppPayments: SPPPaymentType[]
  setSppPayments: (payments: SPPPaymentType[]) => void

  budgets: BudgetType[]
  setBudgets: (budgets: BudgetType[]) => void

  feeTemplates: FeeTemplateType[]
  setFeeTemplates: (templates: FeeTemplateType[]) => void
  priorityStudentFees: StudentFeeNewType[]
  setPriorityStudentFees: (fees: StudentFeeNewType[]) => void
  priorityFeePayments: FeePaymentNewType[]
  setPriorityFeePayments: (payments: FeePaymentNewType[]) => void

  activityLogs: ActivityLogType[]
  setActivityLogs: (logs: ActivityLogType[]) => void

  addSPPPayment: (
    payment: { studentId: string; amount: number; month: string; year: string } & Partial<SPPPaymentType>
  ) => void
  addIncome: (income: Omit<IncomeType, 'id' | 'referenceNo'>) => void
  addExpense: (expense: Omit<ExpenseType, 'id' | 'referenceNo'>) => void
  addMutation: (mutation: Omit<CashMutationType, 'id' | 'referenceNo'>) => void
  getAccountBalance: (accountId: string) => number
  getBudgetRealization: (budgetId: string) => number

  logActivity: (
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>,
    status?: 'success' | 'failed',
    userOverride?: { id?: string; username?: string }
  ) => void
  getActivityLogs: (filter?: {
    userId?: string
    activityType?: ActivityType
    startDate?: string
    endDate?: string
    status?: 'success' | 'failed'
  }) => ActivityLogType[]
  clearOldActivityLogs: (daysToKeep?: number) => void

  deleteStudent: (studentId: string) => boolean
  deleteIncome: (incomeId: string) => boolean
  deleteExpense: (expenseId: string) => boolean
  deleteClass: (classId: string) => boolean

  updateStudent: (studentId: string, updates: Partial<StudentType>) => boolean
  updateIncome: (incomeId: string, updates: Partial<IncomeType>) => boolean
  updateExpense: (expenseId: string, updates: Partial<ExpenseType>) => boolean
  updateClass: (classId: string, updates: Partial<ClassType>) => boolean
  getStudentArrears: (studentId: string) => { total: number; months: string[] }
  refreshData: () => Promise<void>
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// ==================== PROVIDER ====================

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  const [students, setStudents] = useState<StudentType[]>([])
  const [classes, setClasses] = useState<ClassType[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYearType[]>([])
  const [teachers, setTeachers] = useState<TeacherType[]>([])
  const [teachingSchedules, setTeachingSchedules] = useState<TeachingScheduleType[]>([])
  const [categories, setCategories] = useState<TransactionCategoryType[]>([])
  const [accounts, setAccounts] = useState<BankAccountType[]>([])
  const [incomes, setIncomes] = useState<IncomeType[]>([])
  const [expenses, setExpenses] = useState<ExpenseType[]>([])
  const [mutations, setMutations] = useState<CashMutationType[]>([])
  const [paymentCategories, setPaymentCategories] = useState<PaymentCategoryType[]>([])
  const [studentFees, setStudentFees] = useState<StudentFeeType[]>([])
  const [feePayments, setFeePayments] = useState<FeePaymentType[]>([])
  const [sppRates, setSppRates] = useState<SPPRateType[]>([])
  const [sppPayments, setSppPayments] = useState<SPPPaymentType[]>([])
  const [budgets, setBudgets] = useState<BudgetType[]>([])
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplateType[]>([])
  const [priorityStudentFees, setPriorityStudentFees] = useState<StudentFeeNewType[]>([])
  const [priorityFeePayments, setPriorityFeePayments] = useState<FeePaymentNewType[]>([])

  const [activityLogs, setActivityLogs] = useState<ActivityLogType[]>([])

  const refreshData = async () => {
    try {
      setIsLoading(true)

      const {
        studentAPI,
        classAPI,
        teacherAPI,
        incomeAPI,
        expenseAPI,
        accountAPI,
        teachingScheduleAPI,
        categoryAPI,
        academicYearAPI,
        activityLogAPI,
        budgetAPI,
        mutationAPI,
        paymentCategoryAPI,
        studentFeeAPI,
        feePaymentAPI,
        priorityFeeTemplateAPI,
        priorityStudentFeeAPI,
        priorityFeePaymentAPI,
        sppRateAPI,
        sppPaymentAPI
      } = await import('@/services/api')

      const [
        apiStudents,
        apiClasses,
        apiTeachers,
        apiIncomes,
        apiExpenses,
        apiAccounts,
        apiSchedules,
        apiCategories,
        apiAcademicYears,
        apiLogs,
        apiBudgets,
        apiMutations,
        apiPaymentCategories,
        apiFeePayments,
        apiStudentFees,
        apiFeeTemplates,
        apiPriorityStudentFees,
        apiPriorityFeePayments,
        apiSppRates,
        apiSppPayments
      ] = await Promise.all([
        studentAPI.getAll(),
        classAPI.getAll(),
        teacherAPI.getAll(),
        incomeAPI.getAll(),
        expenseAPI.getAll(),
        accountAPI.getAll(),
        teachingScheduleAPI.getAll(),
        categoryAPI.getAll(),
        academicYearAPI.getAll(),
        activityLogAPI.getAll({ limit: 100 }),
        budgetAPI.getAll(),
        mutationAPI.getAll(),
        paymentCategoryAPI.getAll(),
        feePaymentAPI.getAll(),
        studentFeeAPI.getByStudentId('all'),
        priorityFeeTemplateAPI.getAll(),
        priorityStudentFeeAPI.getByStudentId('all'),
        priorityFeePaymentAPI.getAll(),
        sppRateAPI.getAll(),
        sppPaymentAPI.getAll()
      ])

      setStudents(apiStudents || [])
      setClasses(apiClasses || [])
      setTeachers(apiTeachers || [])
      setIncomes(apiIncomes || [])
      setExpenses(apiExpenses || [])
      setAccounts(apiAccounts || [])
      setTeachingSchedules(apiSchedules || [])
      setCategories(apiCategories || [])
      setAcademicYears(apiAcademicYears || [])
      setActivityLogs(apiLogs || [])
      setBudgets(apiBudgets || [])
      setMutations(apiMutations || [])
      setPaymentCategories(apiPaymentCategories || [])
      setStudentFees(apiStudentFees || [])
      setFeePayments(apiFeePayments || [])
      setFeeTemplates(apiFeeTemplates || [])
      setPriorityStudentFees(apiPriorityStudentFees || [])
      setPriorityFeePayments(apiPriorityFeePayments || [])
      setSppRates(apiSppRates || [])
      setSppPayments(apiSppPayments || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const generateReferenceNo = (prefix: string) => `${prefix}-${Date.now()}`

  const addSPPPayment = (
    payment: { studentId: string; amount: number; month: string; year: string } & Partial<SPPPaymentType>
  ) => {
    const student = students.find(s => s.id === payment.studentId)

    const newPayment: SPPPaymentType = {
      studentName: student?.name || 'Siswa',
      grade: student?.grade || '7',
      class: student?.class || 'A',
      status: 'Lunas',
      ...payment,
      id: `SPP-${Date.now()}`,
      sppRateId: `RATE-${student?.grade || '7'}`,
      academicYear: student?.academicYear || '2024/2025'
    } as SPPPaymentType

    setSppPayments(prev => [newPayment, ...prev])
  }

  const addIncome = (income: Omit<IncomeType, 'id' | 'referenceNo'>) => {
    const newIncome: IncomeType = { ...income, id: `INC-${Date.now()}`, referenceNo: generateReferenceNo('REF-INC') }

    setIncomes(prev => [newIncome, ...prev])
    setAccounts(prev =>
      prev.map(acc => (acc.id === income.account ? { ...acc, balance: acc.balance + income.amount } : acc))
    )
  }

  const addExpense = (expense: Omit<ExpenseType, 'id' | 'referenceNo'>) => {
    const newExpense: ExpenseType = { ...expense, id: `EXP-${Date.now()}`, referenceNo: generateReferenceNo('REF-EXP') }

    setExpenses(prev => [newExpense, ...prev])
    setAccounts(prev =>
      prev.map(acc => (acc.id === expense.account ? { ...acc, balance: acc.balance - expense.amount } : acc))
    )

    if (expense.budgetId) {
      setBudgets(prev =>
        prev.map(b => (b.id === expense.budgetId ? { ...b, realization: b.realization + expense.amount } : b))
      )
    }
  }

  const addMutation = (mutation: Omit<CashMutationType, 'id' | 'referenceNo'>) => {
    const newMutation: CashMutationType = {
      ...mutation,
      id: `MUT-${Date.now()}`,
      referenceNo: generateReferenceNo('REF-MUT')
    }

    setMutations(prev => [newMutation, ...prev])
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === mutation.fromAccount) return { ...acc, balance: acc.balance - mutation.amount }
        if (acc.id === mutation.toAccount) return { ...acc, balance: acc.balance + mutation.amount }

        return acc
      })
    )
  }

  const getAccountBalance = (accountId: string) => accounts.find(acc => acc.id === accountId)?.balance || 0
  const getBudgetRealization = (budgetId: string) => budgets.find(b => b.id === budgetId)?.realization || 0

  const logActivity = async (
    type: ActivityType,
    desc: string,
    meta?: any,
    status: 'success' | 'failed' = 'success',
    userOverride?: { id?: string; username?: string }
  ) => {
    try {
      const { activityLogAPI } = await import('@/services/api')

      const savedLog = await activityLogAPI.create({
        activityType: type,
        description: desc,
        metadata: meta,
        status,
        userId: userOverride?.id,
        username: userOverride?.username
      })

      setActivityLogs(prev => [savedLog, ...prev])
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  const getActivityLogs = (filter?: any) => {
    let filtered = [...activityLogs]

    if (filter) {
      if (filter.activityType) filtered = filtered.filter(l => l.activityType === filter.activityType)
      if (filter.status) filtered = filtered.filter(l => l.status === filter.status)
    }

    return filtered
  }

  const clearOldActivityLogs = (days = 90) => {
    const cutoff = new Date()

    cutoff.setDate(cutoff.getDate() - days)
    setActivityLogs(prev => prev.filter(l => new Date(l.timestamp) >= cutoff))
  }

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))

    return true
  }

  const deleteIncome = (id: string) => {
    const inc = incomes.find(i => i.id === id)

    if (inc) {
      setAccounts(prev =>
        prev.map(acc => (acc.id === inc.account ? { ...acc, balance: acc.balance - inc.amount } : acc))
      )
      setIncomes(prev => prev.filter(i => i.id !== id))
    }

    return true
  }

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id)

    if (exp) {
      setAccounts(prev =>
        prev.map(acc => (acc.id === exp.account ? { ...acc, balance: acc.balance + exp.amount } : acc))
      )
      setExpenses(prev => prev.filter(e => e.id !== id))
    }

    return true
  }

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id))

    return true
  }

  const updateStudent = (id: string, updates: any) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))

    return true
  }

  const updateIncome = (id: string, updates: any) => {
    setIncomes(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)))

    return true
  }

  const updateExpense = (id: string, updates: any) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)))

    return true
  }

  const updateClass = (id: string, updates: any) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)))

    return true
  }

  const getStudentArrears = () => {
    // SPP payments are not used in this system
    // Only fee templates are used for registration and other payments
    return { total: 0, months: [] }
  }

  const value: AppContextType = {
    students,
    setStudents,
    classes,
    setClasses,
    academicYears,
    setAcademicYears,
    teachers,
    setTeachers,
    teachingSchedules,
    setTeachingSchedules,
    categories,
    setCategories,
    accounts,
    setAccounts,
    incomes,
    setIncomes,
    expenses,
    setExpenses,
    mutations,
    setMutations,
    paymentCategories,
    setPaymentCategories,
    studentFees,
    setStudentFees,
    feePayments,
    setFeePayments,
    feeTemplates,
    setFeeTemplates,
    priorityStudentFees,
    setPriorityStudentFees,
    priorityFeePayments,
    setPriorityFeePayments,
    sppRates,
    setSppRates,
    sppPayments,
    setSppPayments,
    budgets,
    setBudgets,
    activityLogs,
    setActivityLogs,
    addSPPPayment,
    addIncome,
    addExpense,
    addMutation,
    getAccountBalance,
    getBudgetRealization,
    logActivity,
    getActivityLogs,
    clearOldActivityLogs,
    deleteStudent,
    deleteIncome,
    deleteExpense,
    deleteClass,
    updateStudent,
    updateIncome,
    updateExpense,
    updateClass,
    getStudentArrears,
    refreshData,
    isLoading
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)

  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider')

  return context
}
