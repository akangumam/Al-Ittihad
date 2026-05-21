import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single expense by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { bankAccount: true, budget: true }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
  }
}

// DELETE - Delete expense
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const expense = await prisma.expense.findUnique({ where: { id } })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    await prisma.$transaction(async tx => {
      await tx.expense.delete({ where: { id } })

      if (expense.account) {
        await tx.bankAccount.update({
          where: { id: expense.account },
          data: { balance: { increment: expense.amount } }
        })
      }

      if (expense.budgetId) {
        await tx.budget.update({
          where: { id: expense.budgetId },
          data: { realization: { decrement: expense.amount } }
        })
      }
    })

    await logActivity({
      activityType: 'EXPENSE_DELETE',
      description: `Menghapus data pengeluaran: ${expense.description} - Rp ${expense.amount.toLocaleString('id-ID')}`,
      metadata: { expenseId: id, amount: expense.amount, description: expense.description }
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting expense:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'EXPENSE_DELETE',
      description: `Gagal menghapus data pengeluaran dengan ID: ${id}`,
      metadata: { error: msg, expenseId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
