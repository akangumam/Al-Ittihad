import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single SPP payment by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const payment = await prisma.sPPPayment.findUnique({
      where: { id },
      include: {
        student: true,
        bankAccount: true
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch payment', details: error.message }, { status: 500 })
  }
}

// PATCH - Update SPP payment
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const body = await request.json()

    // Get existing payment for logging
    const existingPayment = await prisma.sPPPayment.findUnique({
      where: { id },
      include: { student: true }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Calculate balance difference if amount changed
    const amountDiff = body.amount ? parseFloat(body.amount) - existingPayment.amount : 0

    const result = await prisma.$transaction(async tx => {
      // Update payment
      const updatedPayment = await tx.sPPPayment.update({
        where: { id },
        data: {
          amount: body.amount ? parseFloat(body.amount) : undefined,
          paymentDate: body.paymentDate ? body.paymentDate : undefined,
          notes: body.notes !== undefined ? body.notes : undefined
        },
        include: {
          student: true
        }
      })

      // Update account balance if amount changed
      if (amountDiff !== 0 && existingPayment.account) {
        await tx.bankAccount.update({
          where: { id: existingPayment.account },
          data: {
            balance: {
              increment: amountDiff
            }
          }
        })
      }

      return updatedPayment
    })

    // Log activity
    await logActivity({
      activityType: 'SPP_PAYMENT_UPDATE',
      description: `Mengubah pembayaran SPP ${existingPayment.student.name} - ${existingPayment.month} ${existingPayment.year}`,
      metadata: {
        paymentId: id,
        transactionId: existingPayment.receiptNo,
        studentId: existingPayment.studentId,
        studentName: existingPayment.student.name,
        changes: {
          oldAmount: existingPayment.amount,
          newAmount: body.amount || existingPayment.amount,
          amountDiff
        }
      },
      status: 'success'
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error updating SPP payment:', error)

    await logActivity({
      activityType: 'SPP_PAYMENT_UPDATE',
      description: `Gagal mengubah pembayaran SPP`,
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to update SPP payment', details: error.message }, { status: 500 })
  }
}

// DELETE - Delete/Cancel SPP payment
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const body = await request.json().catch(() => ({}))
    const { reason } = body // Require reason for cancellation

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Alasan pembatalan wajib diisi' }, { status: 400 })
    }

    // Get payment first to know the amount and account
    const payment = await prisma.sPPPayment.findUnique({
      where: { id },
      include: { student: true }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Transaction to delete payment and revert balance
    await prisma.$transaction(async tx => {
      // 1. Delete payment record
      await tx.sPPPayment.delete({
        where: { id }
      })

      // 2. Revert account balance (decrement because we're reversing income)
      if (payment.account) {
        await tx.bankAccount.update({
          where: { id: payment.account },
          data: {
            balance: {
              decrement: payment.amount
            }
          }
        })
      }
    })

    // Log activity with reason
    await logActivity({
      activityType: 'SPP_PAYMENT_CANCEL',
      description: `Membatalkan pembayaran SPP ${payment.student.name} - ${payment.month} ${payment.year}`,
      metadata: {
        paymentId: id,
        transactionId: payment.receiptNo,
        studentId: payment.studentId,
        studentName: payment.student.name,
        amount: payment.amount,
        reason: reason
      },
      status: 'success'
    })

    return NextResponse.json({ message: 'SPP payment cancelled successfully' })
  } catch (error: any) {
    console.error('Error deleting SPP payment:', error)

    await logActivity({
      activityType: 'SPP_PAYMENT_CANCEL',
      description: `Gagal membatalkan pembayaran SPP`,
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to cancel payment', details: error.message }, { status: 500 })
  }
}
