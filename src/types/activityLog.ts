// ==================== ACTIVITY LOG TYPES ====================

export type ActivityType =
  | 'user_login'
  | 'user_logout'
  | 'user_login_failed'
  | 'student_created'
  | 'student_updated'
  | 'student_deleted'
  | 'income_created'
  | 'income_updated'
  | 'income_deleted'
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'spp_payment_created'
  | 'class_created'
  | 'class_updated'
  | 'class_deleted'
  | 'academic_year_created'
  | 'academic_year_updated'
  | 'other'

export type ActivityLogType = {
  id: string
  timestamp: string // ISO string format
  userId: string | null // null for login attempts
  username: string | null
  activityType: ActivityType
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any> // Additional data
  status: 'success' | 'failed'
}

export type ActivityLogFilter = {
  userId?: string
  activityType?: ActivityType
  startDate?: string
  endDate?: string
  status?: 'success' | 'failed'
}
