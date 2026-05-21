import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// GET: Fetch all SPP rates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rates = await prisma.sPPRate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(rates)
  } catch (error) {
    console.error('Error fetching SPP rates:', error)

    return NextResponse.json({ error: 'Failed to fetch SPP rates' }, { status: 500 })
  }
}

// POST: Create a new SPP rate
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { grade, amount, academicYear } = body

    // Validation
    if (!grade || !amount || !academicYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing rate to avoid duplicates (based on unique constraint)
    const existingRate = await prisma.sPPRate.findFirst({
      where: {
        grade,
        academicYear
      }
    })

    if (existingRate) {
      return NextResponse.json({ error: 'Tarif SPP untuk tingkat dan tahun ajaran ini sudah ada.' }, { status: 409 })
    }

    // Create new rate
    const newRate = await prisma.sPPRate.create({
      data: {
        grade,
        amount: Number(amount),
        academicYear,
        isActive: true
      }
    })

    return NextResponse.json(newRate, { status: 201 })
  } catch (error) {
    console.error('Error creating SPP rate:', error)

    return NextResponse.json({ error: 'Failed to create SPP rate' }, { status: 500 })
  }
}
