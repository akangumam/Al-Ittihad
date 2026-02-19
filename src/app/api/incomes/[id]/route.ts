import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single income by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const income = await prisma.income.findUnique({
      where: { id },
      include: {
        bankAccount: true
      }
    })

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch income', details: error.message }, { status: 500 })
  }
}

// DELETE - Delete income
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    // Get income first to know the amount and account
    const income = await prisma.income.findUnique({
      where: { id }
    })

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    // Transaction to delete income and revert balance
    await prisma.$transaction(async tx => {
      // 1. Delete income record
      await tx.income.delete({
        where: { id }
      })

      // 2. Revert account balance (decrement)
      if (income.account) {
        await tx.bankAccount.update({
          where: { id: income.account },
          data: {
            balance: {
              decrement: income.amount
            }
          }
        })
      }
    })

    // Log activity
    await logActivity({
      activityType: 'INCOME_DELETE',
      description: `Menghapus data pemasukan: ${income.description} - Rp ${income.amount.toLocaleString('id-ID')}`,
      metadata: { incomeId: id, amount: income.amount, description: income.description }
    })

    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting income:', error)

    await logActivity({
      activityType: 'INCOME_DELETE',
      description: `Gagal menghapus data pemasukan dengan ID: ${id}`,
      metadata: { error: error.message, incomeId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete income', details: error.message }, { status: 500 })
  }
}
