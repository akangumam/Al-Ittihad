import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// GET all teachers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const subject = searchParams.get('subject')

    const where: any = {}

    if (search) {
      where.OR = [{ name: { contains: search } }, { nip: { contains: search } }, { email: { contains: search } }]
    }

    if (status) {
      where.status = status
    }

    if (subject) {
      where.subject = subject
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(teachers, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching teachers:', error)

    return NextResponse.json({ error: 'Failed to fetch teachers', details: error.message }, { status: 500 })
  }
}

// POST create new teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.nip) {
      return NextResponse.json({ error: 'Name and NIP are required' }, { status: 400 })
    }

    // Check if NIP already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { nip: body.nip }
    })

    if (existingTeacher) {
      return NextResponse.json({ error: 'NIP already exists' }, { status: 400 })
    }

    const teacher = await prisma.teacher.create({
      data: body
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error: any) {
    console.error('Error creating teacher:', error)

    return NextResponse.json({ error: 'Failed to create teacher', details: error.message }, { status: 500 })
  }
}
