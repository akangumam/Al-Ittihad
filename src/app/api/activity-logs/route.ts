import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const activityType = searchParams.get('activityType') || ''
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { username: { contains: search } },
        { activityType: { contains: search } }
      ]
    }

    if (activityType) {
      where.activityType = activityType
    }

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.timestamp = {}

      if (startDate) {
        where.timestamp.gte = new Date(startDate)
      }

      if (endDate) {
        where.timestamp.lte = new Date(endDate)
      }
    }

    // Fetch data with pagination
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching activity logs:', error)

    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data log aktivitas' },
      { status: 500 }
    )
  }
}
