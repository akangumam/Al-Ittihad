import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// GET all expenses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (category) where.category = category

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            id: true,
            accountName: true,
            accountType: true
          }
        },
        budget: {
          select: {
            id: true,
            name: true,
            budgetCode: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(expenses, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching expenses:', error)
    
return NextResponse.json({ error: 'Failed to fetch expenses', details: error.message }, { status: 500 })
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const expense = await prisma.expense.create({
      data: body
    })

    // Update account balance
    await prisma.bankAccount.update({
      where: { id: body.account },
      data: {
        balance: {
          decrement: body.amount
        }
      }
    })

    // Update budget realization if linked
    if (body.budgetId) {
      await prisma.budget.update({
        where: { id: body.budgetId },
        data: {
          realization: {
            increment: body.amount
          }
        }
      })
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error('Error creating expense:', error)
    
return NextResponse.json({ error: 'Failed to create expense', details: error.message }, { status: 500 })
  }
}
