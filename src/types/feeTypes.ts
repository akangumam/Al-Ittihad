export type PaymentCategory = {
  id: string
  name: string
  amount: number
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type StudentFee = {
  id: string
  studentId: string
  paymentCategoryId: string
  amountDue: number
  amountPaid: number
  status: 'Lunas' | 'Belum Lunas'
  academicYear: string
  createdAt: Date
  updatedAt: Date
  category?: PaymentCategory
}

export type FeePayment = {
  id: string
  studentId: string
  amount: number
  paymentDate: string
  account: string
  paymentMethod: string
  receiptNo: string
  notes?: string
  status: string
  createdAt: Date
  updatedAt: Date
  allocations?: FeeAllocation[]
}

export type FeeAllocation = {
  id: string
  paymentId: string
  studentFeeId: string
  amount: number
  createdAt: Date
  studentFee?: StudentFee
}

// New Fee System Types
export type FeeTemplate = {
  id: string
  name: string
  type: 'REGISTRATION' | 'ANNUAL_REREGISTRATION' | 'GRADUATION' | 'CLASS_SPECIFIC' | 'EXAM' | 'ACTIVITY' | 'OTHER'
  academicYear: string
  grade?: string | null
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  components?: FeeComponent[]
  _count?: {
    studentFees: number
  }
}

export type FeeComponent = {
  id: string
  templateId: string
  name: string
  amount: number
  priority: number
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type FeeTemplateWithComponents = FeeTemplate & {
  components: FeeComponent[]
}
