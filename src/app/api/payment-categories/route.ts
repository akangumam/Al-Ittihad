import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// GET: Fetch all payment categories
export async function GET() {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const categories = await prisma.paymentCategory.findMany({
      orderBy: { priority: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error: unknown) {
    console.error('Error fetching payment categories:', error)

    return NextResponse.json({ error: 'Failed to fetch payment categories' }, { status: 500 })
  }
}

// POST: Create a new payment category
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { name, amount, priority } = body

    if (!name || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.paymentCategory.findUnique({ where: { name } })

    if (existing) {
      return NextResponse.json({ error: 'Kategori dengan nama ini sudah ada.' }, { status: 409 })
    }

    const newCategory = await prisma.paymentCategory.create({
      data: {
        name,
        amount: Number(amount),
        priority: Number(priority || 0),
        isActive: true
      }
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating payment category:', error)

    return NextResponse.json({ error: 'Failed to create payment category' }, { status: 500 })
  }
}
