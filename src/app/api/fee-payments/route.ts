import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const where: any = {}

    if (studentId) where.studentId = studentId

    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        allocations: {
          include: {
            studentFee: {
              include: {
                category: true
              }
            }
          }
        },
        student: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, amount, paymentDate, account, paymentMethod, academicYear, notes } = body

    if (!studentId || !amount || !account || !academicYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payAmount = Number(amount)

    // Start Transaction
    const result = await prisma.$transaction(async tx => {
      // 1. Fetch unpaid fees
      const unpaidFees = await tx.studentFee.findMany({
        where: {
          studentId,
          academicYear,
          status: { not: 'Lunas' }
        },
        include: {
          category: true
        },
        orderBy: {
          category: {
            priority: 'asc'
          }
        }
      })

      if (unpaidFees.length === 0) {
        throw new Error('Semua tagihan untuk tahun ajaran ini sudah lunas.')
      }

      // 2. Generate Receipt No
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
      const prefix = `PAY-${dateStr}-`

      const lastPayment = await tx.feePayment.findFirst({
        where: { id: { startsWith: prefix } },
        orderBy: { id: 'desc' }
      })

      let nextNumber = '0001'

      if (lastPayment) {
        const lastNum = parseInt(lastPayment.id.split('-')[2])

        nextNumber = (lastNum + 1).toString().padStart(4, '0')
      }

      const receiptNo = `${prefix}${nextNumber}`

      // 3. Create FeePayment
      const payment = await tx.feePayment.create({
        data: {
          id: receiptNo,
          studentId,
          amount: payAmount,
          paymentDate: paymentDate || new Date().toISOString(),
          account,
          paymentMethod,
          receiptNo,
          notes,
          status: 'Lunas'
        }
      })

      // 4. Allocate amount
      let remainingToAllocate = payAmount
      const actualAllocations = []

      for (const fee of unpaidFees) {
        if (remainingToAllocate <= 0) break

        const balanceDue = fee.amountDue - fee.amountPaid
        const allocateToThis = Math.min(remainingToAllocate, balanceDue)

        if (allocateToThis > 0) {
          // Update StudentFee
          const newAmountPaid = fee.amountPaid + allocateToThis
          const newStatus = newAmountPaid >= fee.amountDue ? 'Lunas' : 'Belum Lunas'

          await tx.studentFee.update({
            where: { id: fee.id },
            data: {
              amountPaid: newAmountPaid,
              status: newStatus
            }
          })

          // Create Allocation Record
          const allocation = await tx.feeAllocation.create({
            data: {
              paymentId: payment.id,
              studentFeeId: fee.id,
              amount: allocateToThis
            }
          })

          actualAllocations.push(allocation)

          remainingToAllocate -= allocateToThis
        }
      }

      // 5. Create Income record and update balance
      await tx.income.create({
        data: {
          date: paymentDate || new Date().toISOString(),
          category: 'Pendaftaran/Daftar Ulang',
          description: `Pembayaran biaya sekolah - Student ID: ${studentId}`,
          amount: payAmount,
          account,
          paymentMethod,
          referenceNo: receiptNo
        }
      })

      await tx.bankAccount.update({
        where: { id: account },
        data: {
          balance: { increment: payAmount }
        }
      })

      return { payment, allocations: actualAllocations, surplus: remainingToAllocate }
    })

    // Log Activity
    await logActivity({
      activityType: 'FEE_PAYMENT_CREATE',
      description: `Mencatat pembayaran biaya sekolah sebesar ${payAmount}`,
      metadata: { paymentId: result.payment.id, studentId },
      status: 'success'
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating fee payment:', error)

    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 500 })
  }
}
