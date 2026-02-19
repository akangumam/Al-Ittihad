import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET all SPP payments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}

    if (studentId) where.studentId = studentId
    if (month) where.month = month
    if (year) where.year = year

    const payments = await prisma.sPPPayment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            nis: true,
            name: true,
            grade: true,
            class: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json(payments, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching SPP payments:', error)

    return NextResponse.json({ error: 'Failed to fetch SPP payments', details: error.message }, { status: 500 })
  }
}

// POST - Create new SPP payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.studentId || !body.month || !body.year || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      select: {
        name: true,
        grade: true,
        class: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const studentName = body.studentName || student.name

    // Determine academic year based on year and month
    // Academic year typically starts in July/August
    const paymentYear = parseInt(body.year)

    const monthIndex = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ].indexOf(body.month)

    // If month is July-December, academic year starts with current year
    // If month is January-June, academic year started previous year
    const academicYearStart = monthIndex >= 6 ? paymentYear : paymentYear - 1
    const academicYear = `${academicYearStart}/${academicYearStart + 1}`

    // Find appropriate SPP rate
    const sppRate = await prisma.sPPRate.findFirst({
      where: {
        grade: student.grade,
        academicYear: academicYear,
        isActive: true
      }
    })

    if (!sppRate) {
      return NextResponse.json(
        {
          error: `SPP rate not found for grade ${student.grade} and academic year ${academicYear}. Please create an SPP rate first.`
        },
        { status: 404 }
      )
    }

    // Extract account ID (handle both account and accountId from different form versions)
    const accountId = body.accountId || body.account

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Use transaction to ensure both payment and income are created, and account updated
    const result = await prisma.$transaction(async tx => {
      // 1. Generate sequential Transaction ID / Receipt Number
      // Format: SPP-YYYYMMDD-XXXX
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
      const prefix = `SPP-${dateStr}-`

      // Find the last payment for today to get the next sequence number
      const lastPayment = await tx.sPPPayment.findFirst({
        where: {
          id: {
            startsWith: prefix
          }
        },
        orderBy: {
          id: 'desc'
        }
      })

      let nextNumber = '0001'

      if (lastPayment) {
        const lastId = lastPayment.id
        const lastNum = parseInt(lastId.split('-')[2])

        nextNumber = (lastNum + 1).toString().padStart(4, '0')
      }

      const transactionId = `${prefix}${nextNumber}`

      // Determine initial status based on payment method
      const isCash = body.paymentMethod === 'Tunai' || body.paymentMethod === 'cash'
      const initialStatus = isCash ? 'Lunas' : 'Verifikasi'

      // 2. Create SPP payment with all required fields
      const payment = await tx.sPPPayment.create({
        data: {
          id: transactionId,
          student: {
            connect: { id: body.studentId }
          },
          studentName: studentName,
          grade: student.grade,
          class: student.class,
          sppRate: {
            connect: { id: sppRate.id }
          },
          month: body.month,
          year: body.year,
          academicYear: academicYear,
          amount: parseFloat(body.amount),
          paymentDate: body.paymentDate || new Date().toISOString(),
          bankAccount: accountId
            ? {
                connect: { id: accountId }
              }
            : undefined,
          paymentMethod: body.paymentMethod || 'Tunai',
          receiptNo: transactionId,
          status: initialStatus,
          notes: body.notes || null,
          paidBy: body.paidBy || null
        }
      })

      // 3. ONLY Create Income and Update balance if status is Lunas (Cash payment)
      if (initialStatus === 'Lunas') {
        // Create corresponding Income record
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

        // Update account balance
        await tx.bankAccount.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: parseFloat(body.amount)
            }
          }
        })
      }

      return payment
    })

    // Log activity
    await logActivity({
      activityType: 'SPP_PAYMENT_CREATE',
      description: `Mencatat pembayaran SPP ${studentName} - ${body.month} ${body.year}`,
      metadata: {
        paymentId: result.id,
        transactionId: result.receiptNo,
        studentId: body.studentId,
        studentName: studentName,
        amount: body.amount,
        month: body.month,
        year: body.year
      },
      status: 'success'
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating SPP payment:', error)

    // Log failed activity
    await logActivity({
      activityType: 'SPP_PAYMENT_CREATE',
      description: `Gagal mencatat pembayaran SPP`,
      metadata: { error: error.message },
      status: 'failed'
    })

    // Check for unique constraint violation (duplicate payment)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Pembayaran untuk bulan ini sudah ada.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create SPP payment', details: error.message }, { status: 500 })
  }
}
