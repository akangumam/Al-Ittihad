import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const categories = await prisma.transactionCategory.findMany({
      where: type ? { type } : {},
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching categories:', error)

    return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Remove ID if provided as Prisma will generate it or we use cuid
    if (body.id?.includes('CAT-')) delete body.id

    const category = await prisma.transactionCategory.create({
      data: body
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)

    return NextResponse.json({ error: 'Failed to create category', details: error.message }, { status: 500 })
  }
}
