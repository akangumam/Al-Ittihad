import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// GET all activity logs
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const logs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(logs, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching activity logs:', error)

    return NextResponse.json({ error: 'Failed to fetch activity logs', details: error.message }, { status: 500 })
  }
}

// POST - Create new activity log
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()

    const log = await prisma.activityLog.create({
      data: {
        activityType: body.activityType,
        description: body.description,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
        status: body.status || 'success',
        username: body.username,
        userId: body.userId
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    console.error('Error creating activity log:', error)

    return NextResponse.json({ error: 'Failed to create activity log', details: error.message }, { status: 500 })
  }
}
