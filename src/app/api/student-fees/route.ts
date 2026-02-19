import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// GET: Fetch fees for a specific student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYear = searchParams.get('academicYear')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    const where: any = { studentId }

    if (academicYear) where.academicYear = academicYear

    const studentFees = await prisma.studentFee.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        category: {
          priority: 'asc'
        }
      }
    })

    return NextResponse.json(studentFees)
  } catch (error) {
    console.error('Error fetching student fees:', error)
    
return NextResponse.json({ error: 'Failed to fetch student fees' }, { status: 500 })
  }
}

// POST: Assign categories to a student (Bulk)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, academicYear, categoryIds } = body

    if (!studentId || !academicYear || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const categories = await prisma.paymentCategory.findMany({
      where: {
        id: { in: categoryIds }
      }
    })

    const studentFeeData = categories.map(cat => ({
      studentId,
      paymentCategoryId: cat.id,
      amountDue: cat.amount,
      academicYear,
      status: 'Belum Lunas'
    }))

    // Use createMany with skipDuplicates or individual creates
    // SQLite doesn't support skipDuplicates in createMany sometimes depending on version/prisma
    // We'll use a transaction with individual upserts or check existence
    const results = await prisma.$transaction(
      studentFeeData.map(data =>
        prisma.studentFee.upsert({
          where: {
            studentId_paymentCategoryId_academicYear: {
              studentId: data.studentId,
              paymentCategoryId: data.paymentCategoryId,
              academicYear: data.academicYear
            }
          },
          update: {}, // Don't overwrite if already exists
          create: data
        })
      )
    )

    return NextResponse.json(results, { status: 201 })
  } catch (error) {
    console.error('Error assigning student fees:', error)
    
return NextResponse.json({ error: 'Failed to assign student fees' }, { status: 500 })
  }
}
