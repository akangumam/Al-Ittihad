import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import prisma from '@/lib/prisma'

interface LogActivityParams {
  activityType: string
  description: string
  metadata?: Record<string, any>
  status?: 'success' | 'failed'
}

export async function logActivity({ activityType, description, metadata, status = 'success' }: LogActivityParams) {
  try {
    const session = await getServerSession(authOptions)

    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id || null,
        username: session?.user?.name || 'System',
        activityType,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)

    // Don't throw error to prevent breaking main flow
  }
}

// Client-side logging via API
export async function logActivityClient(params: LogActivityParams) {
  try {
    await fetch('/api/system/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
