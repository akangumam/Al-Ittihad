import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

import {
  processPaymentWithAllocation,
  getStudentFeeBreakdown,
  simulatePaymentAllocation
} from '@/services/feeAllocationService'

// GET: Fetch payment history
export async function GET(request: Request) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const studentFeeId = searchParams.get('studentFeeId')
    const studentId = searchParams.get('studentId')

    // If studentFeeId is provided, return a detailed breakdown
    if (studentFeeId) {
      const breakdown = await getStudentFeeBreakdown(studentFeeId)

      if (!breakdown) {
        return NextResponse.json({ error: 'Student fee not found' }, { status: 404 })
      }

      return NextResponse.json(breakdown)
    }

    // If studentFeeId is not provided, return all payments with student and template info
    const where: any = {}

    if (studentId && studentId !== 'all') {
      where.studentId = studentId
    }

    const payments = await prisma.feePaymentNew.findMany({
      where,
      include: {
        student: true,
        studentFee: {
          include: {
            template: true
          }
        },
        allocations: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)

    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST: Process a new payment or simulate allocation
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { studentFeeId, amount, paymentData, simulate } = body

    if (!studentFeeId || amount === undefined) {
      return NextResponse.json({ error: 'Missing studentFeeId or amount' }, { status: 400 })
    }

    // Handle Simulation
    if (simulate) {
      const preview = await simulatePaymentAllocation(studentFeeId, parseFloat(amount))

      return NextResponse.json({ preview })
    }

    // Handle Actual Payment
    if (
      !paymentData ||
      !paymentData.paymentMethod ||
      !paymentData.account ||
      !paymentData.receiptNo ||
      !paymentData.paymentDate
    ) {
      return NextResponse.json(
        { error: 'Missing required payment metadata (method, account, receiptNo, date)' },
        { status: 400 }
      )
    }

    const result = await processPaymentWithAllocation(studentFeeId, parseFloat(amount), {
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      account: paymentData.account,
      receiptNo: paymentData.receiptNo,
      notes: paymentData.notes,
      paidBy: paymentData.paidBy
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error processing payment:', error)

    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
