// ==================== ACTIVITY LOG TYPES ====================

export type ActivityType =
  // Auth
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_LOGIN_FAILED'
  // Teacher
  | 'TEACHER_CREATE'
  | 'TEACHER_UPDATE'
  | 'TEACHER_DELETE'
  // Student
  | 'STUDENT_CREATE'
  | 'STUDENT_UPDATE'
  | 'STUDENT_DELETE'
  // Class
  | 'CLASS_CREATE'
  | 'CLASS_UPDATE'
  | 'CLASS_DELETE'
  // Academic Year
  | 'ACADEMIC_YEAR_CREATE'
  | 'ACADEMIC_YEAR_UPDATE'
  | 'ACADEMIC_YEAR_DELETE'
  // Teaching Schedule
  | 'TEACHING_SCHEDULE_CREATE'
  | 'TEACHING_SCHEDULE_UPDATE'
  | 'TEACHING_SCHEDULE_DELETE'
  // Income
  | 'INCOME_CREATE'
  | 'INCOME_DELETE'
  // Expense
  | 'EXPENSE_CREATE'
  | 'EXPENSE_DELETE'
  // SPP Payment
  | 'SPP_PAYMENT_CREATE'
  | 'SPP_PAYMENT_UPDATE'
  | 'SPP_PAYMENT_DELETE'
  // System User
  | 'SYSTEM_USER_CREATE'
  | 'SYSTEM_USER_UPDATE'
  | 'SYSTEM_USER_DELETE'
  | 'SYSTEM_USER_RESET_PASSWORD'
  | 'other'

export type ActivityLogType = {
  id: string
  timestamp: string
  userId: string | null
  username: string | null
  activityType: ActivityType
  description: string
  metadata?: {
    module?: string
    targetId?: string
    targetName?: string
    [key: string]: any
  }
  status: 'success' | 'failed'
}

export type ActivityLogFilter = {
  userId?: string
  activityType?: ActivityType
  startDate?: string
  endDate?: string
  status?: 'success' | 'failed'
}
