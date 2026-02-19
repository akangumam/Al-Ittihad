import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

/**
 * GET: Fetch all fee templates with their components
 */
export async function GET() {
  try {
    const templates = await prisma.feeTemplate.findMany({
      include: {
        components: {
          orderBy: {
            priority: 'asc'
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

/**
 * POST: Create a new fee template with components
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, academicYear, grade, description, components } = body

    if (!name || !type || !academicYear) {
      return NextResponse.json({ error: 'Missing required fields: name, type, academicYear' }, { status: 400 })
    }

    const result = await prisma.$transaction(async tx => {
      // 1. Create the template
      const template = await tx.feeTemplate.create({
        data: {
          name,
          type,
          academicYear,
          grade,
          description,
          isActive: true
        }
      })

      // 2. Create the components if provided
      if (components && Array.isArray(components) && components.length > 0) {
        const componentData = components.map((comp: any) => ({
          templateId: template.id,
          name: comp.name,
          amount: parseFloat(comp.amount),
          priority: parseInt(comp.priority),
          description: comp.description,
          isActive: true
        }))

        await tx.feeComponent.createMany({
          data: componentData
        })
      }

      // Return the complete template with components
      return await tx.feeTemplate.findUnique({
        where: { id: template.id },
        include: {
          components: {
            orderBy: {
              priority: 'asc'
            }
          }
        }
      })
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating fee template:', error)

    return NextResponse.json({ error: 'Failed to create fee template' }, { status: 500 })
  }
}
