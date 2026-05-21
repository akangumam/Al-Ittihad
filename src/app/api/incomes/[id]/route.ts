import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single income by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const income = await prisma.income.findUnique({
      where: { id },
      include: { bankAccount: true }
    })

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}

// DELETE - Delete income
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const income = await prisma.income.findUnique({ where: { id } })

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    await prisma.$transaction(async tx => {
      await tx.income.delete({ where: { id } })

      if (income.account) {
        await tx.bankAccount.update({
          where: { id: income.account },
          data: { balance: { decrement: income.amount } }
        })
      }
    })

    await logActivity({
      activityType: 'INCOME_DELETE',
      description: `Menghapus data pemasukan: ${income.description} - Rp ${income.amount.toLocaleString('id-ID')}`,
      metadata: { incomeId: id, amount: income.amount, description: income.description }
    })

    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting income:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'INCOME_DELETE',
      description: `Gagal menghapus data pemasukan dengan ID: ${id}`,
      metadata: { error: msg, incomeId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 })
  }
}
