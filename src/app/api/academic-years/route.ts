import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'

// GET all academic years
export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { name: 'desc' }
    })

    return NextResponse.json(years, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching academic years:', error)

    return NextResponse.json({ error: 'Failed to fetch academic years', details: error.message }, { status: 500 })
  }
}

// POST - Create new academic year
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Protected fields - ensure we don't accidentally use an empty string as ID
    delete body.id
    delete body.createdAt
    delete body.updatedAt

    // If making this one active, deactivate others
    if (body.isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const year = await prisma.academicYear.create({
      data: body
    })

    return NextResponse.json(year, { status: 201 })
  } catch (error: any) {
    console.error('Error creating academic year:', error)

    return NextResponse.json({ error: 'Failed to create academic year', details: error.message }, { status: 500 })
  }
}
