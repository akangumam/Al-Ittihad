import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import prisma from '@/lib/prisma'

interface LogActivityParams {
  activityType: string
  description: string
  module?: string
  targetId?: string
  targetName?: string
  metadata?: Record<string, any>
  status?: 'success' | 'failed'
}

export async function logActivity({
  activityType,
  description,
  module,
  targetId,
  targetName,
  metadata,
  status = 'success'
}: LogActivityParams) {
  try {
    const session = await getServerSession(authOptions)

    const enriched = {
      ...(module && { module }),
      ...(targetId && { targetId }),
      ...(targetName && { targetName }),
      ...metadata
    }

    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id || null,
        username: session?.user?.name || 'System',
        activityType,
        description,
        metadata: Object.keys(enriched).length > 0 ? JSON.stringify(enriched) : null,
        status,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw — never break the main request flow
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
