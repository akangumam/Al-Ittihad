import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET single student by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  } catch (error: any) {
    console.error('Error fetching student:', error)

    return NextResponse.json({ error: 'Failed to fetch student', details: error.message }, { status: 500 })
  }
}

// PUT - Update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()

    const student = await prisma.student.update({
      where: { id },
      data: body
    })

    return NextResponse.json(student, { status: 200 })
  } catch (error: any) {
    console.error('Error updating student:', error)

    return NextResponse.json({ error: 'Failed to update student', details: error.message }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const { id } = params

    // Check if student exists first
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

    // Use transaction for reliable deletion of student and all related records
    await prisma.$transaction(async tx => {
      // 1. Delete associated allocations (often prevents parent deletion)
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

      // 2. Delete fees and payments
      await tx.studentFeeNew.deleteMany({ where: { studentId: id } })
      await tx.feePaymentNew.deleteMany({ where: { studentId: id } })
      await tx.sPPPayment.deleteMany({ where: { studentId: id } })
      await tx.studentFee.deleteMany({ where: { studentId: id } })
      await tx.feePayment.deleteMany({ where: { studentId: id } })

      // 3. Final student deletion
      await tx.student.delete({
        where: { id }
      })

      // 4. Cleanup PortalUser if exists (Indonesian naming 'siswaId')
      await tx.portalUser.deleteMany({
        where: { siswaId: id }
      })
    })

    // Log activity
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
  } catch (error: any) {
    console.error('Error deleting student:', error)

    // Return the actual error message in the 'error' field so fetchAPI picks it up
    return NextResponse.json(
      {
        error: `Gagal menghapus data siswa: ${error.message}`,
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        target: error.meta?.target || null
      },
      { status: 500 }
    )
  }
}
