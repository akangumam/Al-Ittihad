import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'

// GET all bank accounts
export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { accountName: 'asc' }
    })

    return NextResponse.json(accounts, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching accounts:', error)

    return NextResponse.json({ error: 'Failed to fetch accounts', details: error.message }, { status: 500 })
  }
}

// POST - Create new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const account = await prisma.bankAccount.create({
      data: body
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    console.error('Error creating account:', error)

    return NextResponse.json({ error: 'Failed to create account', details: error.message }, { status: 500 })
  }
}
