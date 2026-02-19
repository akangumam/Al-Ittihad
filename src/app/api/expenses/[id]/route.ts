import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single expense by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        bankAccount: true,
        budget: true
      }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch expense', details: error.message }, { status: 500 })
  }
}

// DELETE - Delete expense
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    // Get expense first to know the amount, account, and budget
    const expense = await prisma.expense.findUnique({
      where: { id }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Transaction to delete expense and revert balance + budget
    await prisma.$transaction(async tx => {
      // 1. Delete expense record
      await tx.expense.delete({
        where: { id }
      })

      // 2. Revert account balance (increment because we're reversing an expense)
      if (expense.account) {
        await tx.bankAccount.update({
          where: { id: expense.account },
          data: {
            balance: {
              increment: expense.amount
            }
          }
        })
      }

      // 3. Revert budget realization (decrement)
      if (expense.budgetId) {
        await tx.budget.update({
          where: { id: expense.budgetId },
          data: {
            realization: {
              decrement: expense.amount
            }
          }
        })
      }
    })

    // Log activity
    await logActivity({
      activityType: 'EXPENSE_DELETE',
      description: `Menghapus data pengeluaran: ${expense.description} - Rp ${expense.amount.toLocaleString('id-ID')}`,
      metadata: { expenseId: id, amount: expense.amount, description: expense.description }
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting expense:', error)

    await logActivity({
      activityType: 'EXPENSE_DELETE',
      description: `Gagal menghapus data pengeluaran dengan ID: ${id}`,
      metadata: { error: error.message, expenseId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete expense', details: error.message }, { status: 500 })
  }
}
