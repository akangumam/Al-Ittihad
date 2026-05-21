import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET all SPP payments
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: Record<string, unknown> = {}

    if (studentId) where.studentId = studentId
    if (month) where.month = month
    if (year) where.year = year

    const payments = await prisma.sPPPayment.findMany({
      where,
      include: {
        student: {
          select: { id: true, nis: true, name: true, grade: true, class: true }
        }
      },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json(payments, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching SPP payments:', error)

    return NextResponse.json({ error: 'Failed to fetch SPP payments' }, { status: 500 })
  }
}

// POST - Create new SPP payment
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()

    if (!body.studentId || !body.month || !body.year || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      select: { name: true, grade: true, class: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const studentName = body.studentName || student.name
    const paymentYear = parseInt(body.year)

    const monthIndex = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ].indexOf(body.month)

    const academicYearStart = monthIndex >= 6 ? paymentYear : paymentYear - 1
    const academicYear = `${academicYearStart}/${academicYearStart + 1}`

    const sppRate = await prisma.sPPRate.findFirst({
      where: { grade: student.grade, academicYear, isActive: true }
    })

    if (!sppRate) {
      return NextResponse.json(
        { error: `SPP rate not found for grade ${student.grade} and academic year ${academicYear}. Please create an SPP rate first.` },
        { status: 404 }
      )
    }

    const accountId = body.accountId || body.account

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const result = await prisma.$transaction(async tx => {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
      const prefix = `SPP-${dateStr}-`

      const lastPayment = await tx.sPPPayment.findFirst({
        where: { id: { startsWith: prefix } },
        orderBy: { id: 'desc' }
      })

      let nextNumber = '0001'

      if (lastPayment) {
        const lastNum = parseInt(lastPayment.id.split('-')[2])

        nextNumber = (lastNum + 1).toString().padStart(4, '0')
      }

      const transactionId = `${prefix}${nextNumber}`
      const isCash = body.paymentMethod === 'Tunai' || body.paymentMethod === 'cash'
      const initialStatus = isCash ? 'Lunas' : 'Verifikasi'

      const payment = await tx.sPPPayment.create({
        data: {
          id: transactionId,
          student: { connect: { id: body.studentId } },
          studentName,
          grade: student.grade,
          class: student.class,
          sppRate: { connect: { id: sppRate.id } },
          month: body.month,
          year: body.year,
          academicYear,
          amount: parseFloat(body.amount),
          paymentDate: body.paymentDate || new Date().toISOString(),
          bankAccount: accountId ? { connect: { id: accountId } } : undefined,
          paymentMethod: body.paymentMethod || 'Tunai',
          receiptNo: transactionId,
          status: initialStatus,
          notes: body.notes || null,
          paidBy: body.paidBy || null
        }
      })

      if (initialStatus === 'Lunas') {
        await tx.income.create({
          data: {
            date: body.paymentDate || new Date().toISOString(),
            category: 'SPP',
            description: `Pembayaran SPP ${body.month} ${body.year} - ${studentName}`,
            amount: parseFloat(body.amount),
            account: accountId,
            paymentMethod: body.paymentMethod || 'Tunai',
            referenceNo: transactionId
          }
        })

        await tx.bankAccount.update({
          where: { id: accountId },
          data: { balance: { increment: parseFloat(body.amount) } }
        })
      }

      return payment
    })

    await logActivity({
      activityType: 'SPP_PAYMENT_CREATE',
      description: `Mencatat pembayaran SPP ${studentName} - ${body.month} ${body.year}`,
      metadata: { paymentId: result.id, studentId: body.studentId, studentName, amount: body.amount, month: body.month, year: body.year },
      status: 'success'
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating SPP payment:', error)
    const code = (error as any)?.code

    await logActivity({
      activityType: 'SPP_PAYMENT_CREATE',
      description: `Gagal mencatat pembayaran SPP`,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed'
    })

    if (code === 'P2002') {
      return NextResponse.json({ error: 'Pembayaran untuk bulan ini sudah ada.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create SPP payment' }, { status: 500 })
  }
}
