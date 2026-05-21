import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET single student by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        sppPayments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching student:', error)

    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

// PUT - Update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const student = await prisma.student.update({
      where: { id },
      data: body
    })

    return NextResponse.json(student, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating student:', error)

    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const params = await props.params

  try {
    const { id } = params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        sppPayments: true,
        studentFeesNew: true,
        feePaymentsNew: true,
        studentFees: true,
        feePayments: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Data siswa tidak ditemukan' }, { status: 404 })
    }

    await prisma.$transaction(async tx => {
      await tx.componentAllocation.deleteMany({
        where: {
          OR: [{ studentFee: { studentId: id } }, { payment: { studentId: id } }]
        }
      })

      await tx.feeAllocation.deleteMany({
        where: {
          OR: [{ studentFee: { studentId: id } }, { payment: { studentId: id } }]
        }
      })

      await tx.studentFeeNew.deleteMany({ where: { studentId: id } })
      await tx.feePaymentNew.deleteMany({ where: { studentId: id } })
      await tx.sPPPayment.deleteMany({ where: { studentId: id } })
      await tx.studentFee.deleteMany({ where: { studentId: id } })
      await tx.feePayment.deleteMany({ where: { studentId: id } })
      await tx.student.delete({ where: { id } })
      await tx.portalUser.deleteMany({ where: { siswaId: id } })
    })

    await logActivity({
      activityType: 'STUDENT_DELETE',
      description: `Menghapus data siswa: ${student.name} (${student.nisn})`,
      metadata: {
        studentId: id,
        name: student.name,
        nisn: student.nisn,
        associatedRecords: {
          spp: student.sppPayments.length,
          newFees: student.studentFeesNew.length,
          oldFees: student.studentFees.length
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Data siswa berhasil dihapus selamanya',
        deletedCount: {
          spp: student.sppPayments.length,
          fees: student.studentFeesNew.length
        }
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error deleting student:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code

    return NextResponse.json(
      {
        error: `Gagal menghapus data siswa: ${msg}`,
        code: code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}
