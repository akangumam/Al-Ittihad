import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// GET: Fetch all fee templates with components
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.feeTemplate.findMany({
      include: {
        components: {
          orderBy: {
            priority: 'asc'
          }
        },
        _count: {
          select: {
            studentFees: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching fee templates:', error)

    return NextResponse.json({ error: 'Failed to fetch fee templates' }, { status: 500 })
  }
}

// POST: Create a new fee template with components
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, academicYear, grade, description, components } = body

    if (!name || !type || !academicYear) {
      return NextResponse.json({ error: 'Missing required fields: name, type, academicYear' }, { status: 400 })
    }

    // Validate type
    const validTypes = [
      'REGISTRATION',
      'ANNUAL_REREGISTRATION',
      'GRADUATION',
      'CLASS_SPECIFIC',
      'EXAM',
      'ACTIVITY',
      'OTHER'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Create template with components in a transaction
    const newTemplate = await prisma.feeTemplate.create({
      data: {
        name,
        type,
        academicYear,
        grade: grade || null,
        description: description || null,
        isActive: true,
        components: {
          create: (components || []).map((comp: any, index: number) => ({
            name: comp.name,
            amount: Number(comp.amount),
            priority: comp.priority !== undefined ? Number(comp.priority) : index + 1,
            description: comp.description || null,
            isActive: true
          }))
        }
      },
      include: {
        components: {
          orderBy: {
            priority: 'asc'
          }
        }
      }
    })

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating fee template:', error)

    return NextResponse.json({ error: 'Failed to create fee template' }, { status: 500 })
  }
}
