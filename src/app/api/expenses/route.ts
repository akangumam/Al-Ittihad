import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// GET all expenses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 2000

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
      orderBy: { date: 'desc' },
      take: limit
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Support both field name conventions from different forms
    const accountId = body.account || body.accountId
    const category = body.category || body.categoryId
    const amount = Number(body.amount)

    if (!accountId || !category || !amount || !body.date) {
      return NextResponse.json({ error: 'Field wajib: date, amount, category/categoryId, account/accountId' }, { status: 400 })
    }

    // Generate referenceNo if not provided
    let referenceNo = body.referenceNo
    if (!referenceNo) {
      const dateStr = new Date(body.date).toISOString().slice(0, 10).replace(/-/g, '')
      const last = await prisma.expense.findFirst({
        where: { referenceNo: { startsWith: `EXP-${dateStr}` } },
        orderBy: { createdAt: 'desc' }
      })
      const seq = last ? parseInt(last.referenceNo.split('-')[2] || '0') + 1 : 1
      referenceNo = `EXP-${dateStr}-${seq.toString().padStart(3, '0')}`
    }

    const result = await prisma.$transaction(async tx => {
      const expense = await tx.expense.create({
        data: {
          date: new Date(body.date).toISOString(),
          category,
          description: body.description || '',
          amount,
          account: accountId,
          paymentMethod: body.paymentMethod || 'Tunai',
          referenceNo,
          budgetId: body.budgetId || null
        }
      })

      await tx.bankAccount.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
      })

      if (body.budgetId) {
        await tx.budget.update({
          where: { id: body.budgetId },
          data: { realization: { increment: amount } }
        })
      }

      return expense
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating expense:', error)

    return NextResponse.json({ error: 'Failed to create expense', details: error.message }, { status: 500 })
  }
}
