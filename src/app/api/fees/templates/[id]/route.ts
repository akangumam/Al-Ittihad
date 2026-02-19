import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

/**
 * GET: Fetch a single fee template with its components
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const template = await prisma.feeTemplate.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: {
            priority: 'asc'
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Fee template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching fee template:', error)

    return NextResponse.json({ error: 'Failed to fetch fee template' }, { status: 500 })
  }
}

/**
 * PUT: Update a fee template and its components
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, type, academicYear, grade, description, isActive, components } = body

    const result = await prisma.$transaction(async tx => {
      // 1. Update the template
      await tx.feeTemplate.update({
        where: { id },
        data: {
          name,
          type,
          academicYear,
          grade,
          description,
          isActive
        }
      })

      // 2. Update components if provided
      if (components && Array.isArray(components)) {
        // Delete existing components
        await tx.feeComponent.deleteMany({
          where: { templateId: id }
        })

        // Create new ones
        const componentData = components.map((comp: any) => ({
          templateId: id,
          name: comp.name,
          amount: parseFloat(comp.amount),
          priority: parseInt(comp.priority),
          description: comp.description,
          isActive: comp.isActive !== undefined ? comp.isActive : true
        }))

        await tx.feeComponent.createMany({
          data: componentData
        })
      }

      return await tx.feeTemplate.findUnique({
        where: { id },
        include: {
          components: {
            orderBy: {
              priority: 'asc'
            }
          }
        }
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating fee template:', error)

    return NextResponse.json({ error: 'Failed to update fee template' }, { status: 500 })
  }
}

/**
 * DELETE: Soft delete a fee template
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Fetch details for logging
    const template = await prisma.feeTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Fee template not found' }, { status: 404 })
    }

    // Check if there are any student fees using this template
    const studentFeeCount = await prisma.studentFeeNew.count({
      where: { templateId: id }
    })

    if (studentFeeCount > 0) {
      // Cannot delete if in use, just deactivate
      await prisma.feeTemplate.update({
        where: { id },
        data: { isActive: false }
      })

      // Log activity
      await logActivity({
        activityType: 'FEE_TEMPLATE_DEACTIVATE',
        description: `Menonaktifkan template biaya (sedang digunakan): ${template.name}`,
        metadata: { templateId: id, name: template.name, usageCount: studentFeeCount }
      })

      return NextResponse.json({
        message: 'Template is in use and has been deactivated instead of deleted',
        deactivated: true
      })
    }

    // Hard delete if not in use
    await prisma.feeTemplate.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'FEE_TEMPLATE_DELETE',
      description: `Menghapus template biaya: ${template.name}`,
      metadata: { templateId: id, name: template.name }
    })

    return NextResponse.json({ message: 'Fee template deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting fee template:', error)

    await logActivity({
      activityType: 'FEE_TEMPLATE_DELETE',
      description: `Gagal menghapus template biaya dengan ID: ${id}`,
      metadata: { error: error.message, templateId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete fee template' }, { status: 500 })
  }
}
