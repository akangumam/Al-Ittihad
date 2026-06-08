import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// GET all incomes
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

    const incomes = await prisma.income.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            id: true,
            accountName: true,
            accountType: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json(incomes, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching incomes:', error)

    return NextResponse.json({ error: 'Failed to fetch incomes', details: error.message }, { status: 500 })
  }
}

// POST - Create new income
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, amount, categoryId, accountId, description } = body

    // Validate required fields
    if (!date || !amount || !categoryId || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields: date, amount, categoryId, accountId' },
        { status: 400 }
      )
    }

    // Generate reference number (format: INC-YYYYMMDD-XXX)
    const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, '')

    const lastIncome = await prisma.income.findFirst({
      where: {
        referenceNo: {
          startsWith: `INC-${dateStr}`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let sequence = 1

    if (lastIncome && lastIncome.referenceNo) {
      const lastSequence = parseInt(lastIncome.referenceNo.split('-')[2])

      sequence = lastSequence + 1
    }

    const referenceNo = `INC-${dateStr}-${sequence.toString().padStart(3, '0')}`

    // Create income record
    const income = await prisma.income.create({
      data: {
        date: new Date(date).toISOString(),
        amount: Number(amount),
        category: categoryId,
        account: accountId, // Field name is 'account' not 'accountId'
        description: description || '',
        paymentMethod: 'Transfer/Tunai',
        referenceNo: referenceNo
      }
    })

    // Update account balance
    await prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: Number(amount)
        }
      }
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error: any) {
    console.error('Error creating income:', error)

    return NextResponse.json({ error: 'Failed to create income', details: error.message }, { status: 500 })
  }
}
