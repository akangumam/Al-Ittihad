// API Service Layer for all backend communications

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))

    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// ==================== STUDENT API ====================
export const studentAPI = {
  getAll: async (params?: { search?: string; grade?: string; class?: string; status?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.grade) queryParams.append('grade', params.grade)
    if (params?.class) queryParams.append('class', params.class)
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/students${query ? `?${query}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/students/${id}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/students/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== CLASS API ====================
export const classAPI = {
  getAll: async (params?: { grade?: string; academicYear?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.grade) queryParams.append('grade', params.grade)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/classes${query ? `?${query}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/classes/${id}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/classes/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== TEACHER API ====================
export const teacherAPI = {
  getAll: async (params?: { search?: string; status?: string; subject?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.subject) queryParams.append('subject', params.subject)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/teachers${query ? `?${query}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/teachers/${id}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/teachers/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== SPP (MONTHLY FEE) API ====================
export const sppRateAPI = {
  getAll: async () => {
    return fetchAPI<any[]>('/spp-rates')
  },
  create: async (data: any) => {
    return fetchAPI<any>('/spp-rates', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/spp-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/spp-rates/${id}`, {
      method: 'DELETE'
    })
  }
}

export const sppPaymentAPI = {
  getAll: async (params?: { studentId?: string; status?: string; month?: string; year?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.studentId) queryParams.append('studentId', params.studentId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.month) queryParams.append('month', params.month)
    if (params?.year) queryParams.append('year', params.year)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/spp-payments${query ? `?${query}` : ''}`)
  },
  getById: async (id: string) => {
    return fetchAPI<any>(`/spp-payments/${id}`)
  },
  create: async (data: any) => {
    return fetchAPI<any>('/spp-payments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/spp-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  verify: async (id: string, data: any) => {
    return fetchAPI<any>(`/spp-payments/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  bulkGenerate: async (data: { academicYear: string; month: string; year: string }) => {
    return fetchAPI<any>('/spp-payments/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== PRIORITY-BASED FEE SYSTEM API (NEW) ====================
export const priorityFeeTemplateAPI = {
  getAll: async () => {
    return fetchAPI<any[]>('/fees/templates')
  },
  getById: async (id: string) => {
    return fetchAPI<any>(`/fees/templates/${id}`)
  },
  create: async (data: any) => {
    return fetchAPI<any>('/fees/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/fees/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/fees/templates/${id}`, {
      method: 'DELETE'
    })
  }
}

export const priorityStudentFeeAPI = {
  getByStudentId: async (studentId: string, academicYear?: string) => {
    const queryParams = new URLSearchParams({ studentId })

    if (academicYear) queryParams.append('academicYear', academicYear)

    return fetchAPI<any[]>(`/fees/student-fees?${queryParams.toString()}`)
  },
  assignBulk: async (data: { studentIds: string[]; templateId: string; academicYear: string }) => {
    return fetchAPI<any[]>('/fees/student-fees', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const priorityFeePaymentAPI = {
  getAll: async (params?: { studentId?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.studentId) queryParams.append('studentId', params.studentId)

    return fetchAPI<any[]>(`/fees/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
  },
  getBreakdown: async (studentFeeId: string) => {
    return fetchAPI<any>(`/fees/payments?studentFeeId=${studentFeeId}`)
  },
  process: async (data: { studentFeeId: string; amount: number; paymentData: any }) => {
    return fetchAPI<any>('/fees/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  simulate: async (studentFeeId: string, amount: number) => {
    return fetchAPI<any>('/fees/payments', {
      method: 'POST',
      body: JSON.stringify({ studentFeeId, amount, simulate: true })
    })
  }
}

// ==================== OLD FEE MANAGEMENT API (DEPRECATED) ====================
export const paymentCategoryAPI = {
  getAll: async () => {
    return fetchAPI<any[]>('/payment-categories')
  },
  create: async (data: any) => {
    return fetchAPI<any>('/payment-categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/payment-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },
  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/payment-categories/${id}`, {
      method: 'DELETE'
    })
  }
}

export const studentFeeAPI = {
  getByStudentId: async (studentId: string, academicYear?: string) => {
    const queryParams = new URLSearchParams({ studentId })

    if (academicYear) queryParams.append('academicYear', academicYear)

    return fetchAPI<any[]>(`/student-fees?${queryParams.toString()}`)
  },
  assignBulk: async (data: { studentId: string; academicYear: string; categoryIds: string[] }) => {
    return fetchAPI<any[]>('/student-fees', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const feePaymentAPI = {
  getAll: async (params?: { studentId?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.studentId) queryParams.append('studentId', params.studentId)

    return fetchAPI<any[]>(`/fee-payments?${queryParams.toString()}`)
  },
  create: async (data: any) => {
    return fetchAPI<any>('/fee-payments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== INCOME API ====================
export const incomeAPI = {
  getAll: async (params?: { category?: string; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/incomes${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/incomes', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/incomes/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== EXPENSE API ====================
export const expenseAPI = {
  getAll: async (params?: { category?: string; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/expenses${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== MUTATION API ====================
export const mutationAPI = {
  getAll: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/mutations${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/mutations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== ACCOUNT API ====================
export const accountAPI = {
  getAll: async () => {
    return fetchAPI<any[]>('/accounts')
  },

  create: async (data: any) => {
    return fetchAPI<any>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/accounts/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== CATEGORY API ====================
export const categoryAPI = {
  getAll: async (params?: { type?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.type) queryParams.append('type', params.type)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/categories${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== ACADEMIC YEAR API ====================
export const academicYearAPI = {
  getAll: async () => {
    return fetchAPI<any[]>('/academic-years')
  },

  create: async (data: any) => {
    return fetchAPI<any>('/academic-years', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/academic-years/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== TEACHING SCHEDULE API ====================
export const teachingScheduleAPI = {
  getAll: async (params?: { teacherId?: string; day?: string; academicYear?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.teacherId) queryParams.append('teacherId', params.teacherId)
    if (params?.day) queryParams.append('day', params.day)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/teaching-schedules${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/teaching-schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/teaching-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/teaching-schedules/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== BUDGET API ====================
export const budgetAPI = {
  getAll: async (params?: { status?: string; fiscalYear?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.status) queryParams.append('status', params.status)
    if (params?.fiscalYear) queryParams.append('fiscalYear', params.fiscalYear)

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/budgets${query ? `?${query}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/budgets/${id}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE'
    })
  }
}

// ==================== ACTIVITY LOG API ====================
export const activityLogAPI = {
  getAll: async (params?: { limit?: number }) => {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()

    return fetchAPI<any[]>(`/system/activity-logs${query ? `?${query}` : ''}`)
  },

  create: async (data: any) => {
    return fetchAPI<any>('/system/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== MIGRATION API ====================
export const migrationAPI = {
  checkStatus: async () => {
    return fetchAPI<{ counts: any; isEmpty: boolean }>('/seed')
  },

  seedData: async () => {
    return fetchAPI<{ success: boolean; message: string; results: any }>('/seed', {
      method: 'POST',
      body: JSON.stringify({})
    })
  },

  migrateData: async (data: any) => {
    return fetchAPI<{ success: boolean; message: string; results: any }>('/migrate', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== TEACHER ATTENDANCE API ====================
export const teacherAttendanceAPI = {
  // Get teachers list with their attendance status for a specific date
  getForDate: async (params?: { date?: string; academicYear?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.date) queryParams.append('date', params.date)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)

    const query = queryParams.toString()

    return fetchAPI<any>(`/attendance/teachers${query ? `?${query}` : ''}`)
  },

  // Save/update attendance for multiple teachers
  save: async (data: { date: string; attendances: any[]; recordedBy?: string; academicYear?: string }) => {
    return fetchAPI<any>('/attendance/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Get recap/statistics
  getRecap: async (params?: { month?: string; year?: string; teacherId?: string; academicYear?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.month) queryParams.append('month', params.month)
    if (params?.year) queryParams.append('year', params.year)
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)

    const query = queryParams.toString()

    return fetchAPI<any>(`/attendance/teachers/recap${query ? `?${query}` : ''}`)
  },

  // Delete attendance record
  delete: async (params: { teacherId: string; date: string }) => {
    const queryParams = new URLSearchParams()

    queryParams.append('teacherId', params.teacherId)
    queryParams.append('date', params.date)

    return fetchAPI<any>(`/attendance/teachers?${queryParams.toString()}`, {
      method: 'DELETE'
    })
  }
}
