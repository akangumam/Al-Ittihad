import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// GET all mutations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const mutations = await prisma.cashMutation.findMany({
      where,
      include: {
        fromBankAccount: {
          select: { id: true, accountName: true }
        },
        toBankAccount: {
          select: { id: true, accountName: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(mutations, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching mutations:', error)

    return NextResponse.json({ error: 'Failed to fetch mutations', details: error.message }, { status: 500 })
  }
}

// POST - Create new mutation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Use transaction to ensure both accounts are updated and mutation is created
    const result = await prisma.$transaction(async tx => {
      // 1. Create the mutation record
      const mutation = await tx.cashMutation.create({
        data: {
          date: body.date,
          fromAccount: body.fromAccount,
          toAccount: body.toAccount,
          amount: parseFloat(body.amount),
          description: body.description,
          referenceNo: body.referenceNo || `MUT-${Date.now()}`
        }
      })

      // 2. Subtract from source account
      await tx.bankAccount.update({
        where: { id: body.fromAccount },
        data: {
          balance: {
            decrement: parseFloat(body.amount)
          }
        }
      })

      // 3. Add to destination account
      await tx.bankAccount.update({
        where: { id: body.toAccount },
        data: {
          balance: {
            increment: parseFloat(body.amount)
          }
        }
      })

      return mutation
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating mutation:', error)

    return NextResponse.json({ error: 'Failed to create mutation', details: error.message }, { status: 500 })
  }
}
