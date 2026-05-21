import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// GET all academic years
export async function GET() {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { name: 'desc' }
    })

    return NextResponse.json(years, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching academic years:', error)

    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 })
  }
}

// POST - Create new academic year
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()

    delete body.id
    delete body.createdAt
    delete body.updatedAt

    if (body.isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const year = await prisma.academicYear.create({ data: body })

    return NextResponse.json(year, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating academic year:', error)

    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 })
  }
}
