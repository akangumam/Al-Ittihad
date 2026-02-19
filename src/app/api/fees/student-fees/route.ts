import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

/**
 * GET: Fetch assigned fees for a student
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYear = searchParams.get('academicYear')

    const where: any = {}

    if (studentId && studentId !== 'all') {
      where.studentId = studentId
    }

    if (academicYear) where.academicYear = academicYear

    const fees = await prisma.studentFeeNew.findMany({
      where,
      include: {
        template: {
          include: {
            components: {
              orderBy: {
                priority: 'asc'
              }
            }
          }
        },
        allocations: {
          include: {
            component: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(fees)
  } catch (error) {
    console.error('Error fetching student fees:', error)

    return NextResponse.json({ error: 'Failed to fetch student fees' }, { status: 500 })
  }
}

/**
 * POST: Assign a fee template to a student or group of students
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentIds, templateId, academicYear } = body

    if (!studentIds || !templateId || !academicYear || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: studentIds, templateId, academicYear' },
        { status: 400 }
      )
    }

    // 1. Fetch the template to get total amount
    const template = await prisma.feeTemplate.findUnique({
      where: { id: templateId },
      include: { components: true }
    })

    if (!template) {
      return NextResponse.json({ error: 'Fee template not found' }, { status: 404 })
    }

    const totalAmount = template.components.reduce((sum, comp) => sum + comp.amount, 0)

    // 2. Create StudentFeeNew records for each student
    const result = await prisma.$transaction(
      studentIds.map(studentId =>
        prisma.studentFeeNew.upsert({
          where: {
            studentId_templateId_academicYear: {
              studentId,
              templateId,
              academicYear
            }
          },
          update: {
            totalAmount // Update amount if template changed
          },
          create: {
            studentId,
            templateId,
            academicYear,
            totalAmount,
            status: 'BELUM_LUNAS'
          }
        })
      )
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error assigning fee templates:', error)

    return NextResponse.json({ error: 'Failed to assign fee templates' }, { status: 500 })
  }
}
