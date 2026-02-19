import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET: Fetch single fee template with components
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
        },
        _count: {
          select: {
            studentFees: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching fee template:', error)

    return NextResponse.json({ error: 'Failed to fetch fee template' }, { status: 500 })
  }
}

// PUT: Update fee template and components
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, type, academicYear, grade, description, isActive, components } = body

    // Check if template exists
    const existing = await prisma.feeTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studentFees: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Validate type if provided
    const validTypes = [
      'REGISTRATION',
      'ANNUAL_REREGISTRATION',
      'GRADUATION',
      'CLASS_SPECIFIC',
      'EXAM',
      'ACTIVITY',
      'OTHER'
    ]

    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Update template and components in transaction
    const updatedTemplate = await prisma.$transaction(async tx => {
      // Update template
      await tx.feeTemplate.update({
        where: { id },
        data: {
          name: name || existing.name,
          type: type || existing.type,
          academicYear: academicYear || existing.academicYear,
          grade: grade !== undefined ? grade : existing.grade,
          description: description !== undefined ? description : existing.description,
          isActive: isActive !== undefined ? isActive : existing.isActive
        }
      })

      // If components provided, update them
      if (components && Array.isArray(components)) {
        // Delete existing components
        await tx.feeComponent.deleteMany({
          where: { templateId: id }
        })

        // Create new components
        await tx.feeComponent.createMany({
          data: components.map((comp: any, index: number) => ({
            templateId: id,
            name: comp.name,
            amount: Number(comp.amount),
            priority: comp.priority !== undefined ? Number(comp.priority) : index + 1,
            description: comp.description || null,
            isActive: comp.isActive !== undefined ? comp.isActive : true
          }))
        })
      }

      // Fetch updated template with components
      return await tx.feeTemplate.findUnique({
        where: { id },
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
        }
      })
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating fee template:', error)

    return NextResponse.json({ error: 'Failed to update fee template' }, { status: 500 })
  }
}

// DELETE: Delete fee template (with cascade to components)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Check if template exists and count student fees
    const existing = await prisma.feeTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studentFees: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if template is being used by students
    if (existing._count.studentFees > 0) {
      return NextResponse.json(
        {
          error: `Template tidak bisa dihapus karena sudah digunakan oleh ${existing._count.studentFees} siswa. Nonaktifkan template jika tidak ingin digunakan lagi.`
        },
        { status: 400 }
      )
    }

    // Delete template (components will be deleted automatically with CASCADE)
    await prisma.feeTemplate.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'FEE_TEMPLATE_DELETE',
      description: `Menghapus template biaya: ${existing.name} (${existing.academicYear})`,
      metadata: { templateId: id, name: existing.name, academicYear: existing.academicYear }
    })

    return NextResponse.json({ success: true, message: 'Template berhasil dihapus' })
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
