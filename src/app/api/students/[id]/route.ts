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

    const str = (v: unknown) => (v !== undefined && v !== null && v !== '' ? String(v) : null)
    const req = (v: unknown) => (v !== undefined && v !== null ? String(v) : '')

    const student = await prisma.student.update({
      where: { id },
      data: {
        nis: req(body.nis),
        nisn: req(body.nisn),
        name: req(body.name),
        nickname: str(body.nickname),
        grade: req(body.grade),
        class: req(body.class),
        birthPlace: str(body.birthPlace),
        birthDate: req(body.birthDate),
        gender: req(body.gender),
        religion: str(body.religion),
        address: req(body.address),
        rt: str(body.rt),
        rw: str(body.rw),
        kelurahan: str(body.kelurahan),
        kecamatan: str(body.kecamatan),
        city: str(body.city),
        province: str(body.province),
        postalCode: str(body.postalCode),
        parentName: req(body.parentName),
        fatherName: str(body.fatherName),
        motherName: str(body.motherName),
        guardianName: str(body.guardianName),
        guardianRelation: str(body.guardianRelation),
        phone: str(body.phone),
        parentPhone: req(body.parentPhone),
        email: str(body.email),
        enrollmentDate: str(body.enrollmentDate),
        sppStartDate: str(body.sppStartDate),
        previousSchool: str(body.previousSchool),
        status: req(body.status),
        photo: body.photo && typeof body.photo === 'string' ? body.photo : undefined
      }
    })

    return NextResponse.json(student, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating student:', error)
    const code = (error as any)?.code
    const msg = error instanceof Error ? error.message : 'Unknown error'

    if (code === 'P2002') {
      return NextResponse.json({ error: 'NIS atau NISN sudah digunakan siswa lain' }, { status: 400 })
    }

    if (code === 'P2025') {
      return NextResponse.json({ error: 'Data siswa tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Gagal memperbarui data siswa', details: msg }, { status: 500 })
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
