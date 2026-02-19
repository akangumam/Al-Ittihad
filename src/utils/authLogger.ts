// Utility functions for authentication logging
// Place this in src/utils/authLogger.ts

import type { ActivityType } from '@/types/activityLog'

/**
 * Get current user from localStorage
 * This is a temporary solution until full NextAuth integration
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  const currentUser = localStorage.getItem('currentUser')

  return currentUser ? JSON.parse(currentUser) : null
}

/**
 * Save current user to localStorage
 */
export const saveCurrentUser = (userData: { id: string; username: string; name?: string; email?: string }) => {
  if (typeof window === 'undefined') return

  localStorage.setItem('currentUser', JSON.stringify(userData))
}

/**
 * Clear current user from localStorage
 */
export const clearCurrentUser = () => {
  if (typeof window === 'undefined') return

  localStorage.removeItem('currentUser')
}

/**
 * Example function to log login attempt
 * You should call this from your login page/component
 */
export const logLoginAttempt = async (
  logActivity: (
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>,
    status?: 'success' | 'failed',
    userOverride?: { id?: string; username?: string }
  ) => void,
  username: string,
  success: boolean,
  errorMessage?: string
) => {
  if (success) {
    await logActivity(
      'user_login',
      `User "${username}" berhasil login ke sistem`,
      {
        username,
        loginTime: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      },
      'success',
      { username } // Pass username as override
    )
  } else {
    await logActivity(
      'user_login_failed',
      `Percobaan login gagal untuk username: "${username}"`,
      {
        username,
        attemptTime: new Date().toISOString(),
        reason: errorMessage || 'Unknown error',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      },
      'failed',
      { username } // Pass username as override even for failed attempts
    )
  }
}

/**
 * Example function to log logout
 * You should call this before signing out
 */
export const logLogout = async (
  logActivity: (
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>,
    status?: 'success' | 'failed',
    userOverride?: { id?: string; username?: string }
  ) => void,
  sessionUser?: { name?: string | null; email?: string | null } | null
) => {
  const userData = getCurrentUser()

  // Determine username from session or localStorage
  const username = sessionUser?.email || sessionUser?.name || userData?.username || 'Unknown'
  const userId = userData?.id || null

  // Log logout activity (non-blocking)
  logActivity(
    'user_logout',
    `User "${username}" logout dari sistem`,
    {
      userId,
      username,
      logoutTime: new Date().toISOString()
    },
    'success',
    { id: userId, username } // Pass override
  )

  // Clear user data
  clearCurrentUser()
}
