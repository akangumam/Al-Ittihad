import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Use transaction to update payment status, create income, and update bank account
    const result = await prisma.$transaction(async tx => {
      // 1. Find the payment
      const payment = await tx.sPPPayment.findUnique({
        where: { id },
        include: { bankAccount: true }
      })

      if (!payment) {
        throw new Error('Pembayaran tidak ditemukan')
      }

      if (payment.status === 'Lunas') {
        throw new Error('Pembayaran sudah berstatus Lunas')
      }

      // 2. Update payment status to Lunas
      const updatedPayment = await tx.sPPPayment.update({
        where: { id },
        data: { status: 'Lunas' }
      })

      // 3. Create Income record
      if (!payment.account || !payment.paymentMethod) {
        throw new Error('Informasi akun bank atau metode pembayaran tidak lengkap')
      }

      await tx.income.create({
        data: {
          date: new Date().toISOString(),
          category: 'SPP',
          description: `Pembayaran SPP ${payment.month} ${payment.year} - ${payment.studentName} (Verifikasi)`,
          amount: payment.amount,
          account: payment.account,
          paymentMethod: payment.paymentMethod,
          referenceNo: payment.id
        }
      })

      // 4. Update Bank Account balance
      await tx.bankAccount.update({
        where: { id: payment.account },
        data: {
          balance: {
            increment: payment.amount
          }
        }
      })

      return updatedPayment
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error verifying SPP payment:', error)

    return NextResponse.json({ error: error.message || 'Gagal memverifikasi pembayaran' }, { status: 500 })
  }
}
