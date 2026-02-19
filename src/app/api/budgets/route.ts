import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET all budgets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const fiscalYear = searchParams.get('fiscalYear')

    const where: any = {}

    if (status) where.status = status
    if (fiscalYear) where.fiscalYear = fiscalYear

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { budgetCode: 'asc' }
    })

    return NextResponse.json(budgets, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching budgets:', error)

    return NextResponse.json({ error: 'Failed to fetch budgets', details: error.message }, { status: 500 })
  }
}

// POST - Create new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const budget = await prisma.budget.create({
      data: body
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    console.error('Error creating budget:', error)

    return NextResponse.json({ error: 'Failed to create budget', details: error.message }, { status: 500 })
  }
}

// DELETE - Cleanup all budgets (for development/testing)
export async function DELETE() {
  try {
    const result = await prisma.budget.deleteMany({})

    // Log activity
    await logActivity({
      activityType: 'BUDGET_CLEANUP',
      description: `Melakukan pembersihan anggaran: Menghapus ${result.count} data anggaran`,
      metadata: { count: result.count }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${result.count} budget records`,
        count: result.count
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting budgets:', error)

    await logActivity({
      activityType: 'BUDGET_CLEANUP',
      description: `Gagal melakukan pembersihan anggaran`,
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete budgets', details: error.message }, { status: 500 })
  }
}
