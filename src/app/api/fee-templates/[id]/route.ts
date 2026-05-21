import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET: Fetch single fee template with components
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const template = await prisma.feeTemplate.findUnique({
      where: { id },
      include: {
        components: { orderBy: { priority: 'asc' } },
        _count: { select: { studentFees: true } }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error: unknown) {
    console.error('Error fetching fee template:', error)

    return NextResponse.json({ error: 'Failed to fetch fee template' }, { status: 500 })
  }
}

// PUT: Update fee template and components
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const body = await request.json()
    const { name, type, academicYear, grade, description, isActive, components } = body

    const existing = await prisma.feeTemplate.findUnique({
      where: { id },
      include: { _count: { select: { studentFees: true } } }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const validTypes = ['REGISTRATION', 'ANNUAL_REREGISTRATION', 'GRADUATION', 'CLASS_SPECIFIC', 'EXAM', 'ACTIVITY', 'OTHER']

    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const updatedTemplate = await prisma.$transaction(async tx => {
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

      if (components && Array.isArray(components)) {
        await tx.feeComponent.deleteMany({ where: { templateId: id } })

        await tx.feeComponent.createMany({
          data: components.map((comp: { name: string; amount: number; priority?: number; description?: string; isActive?: boolean }, index: number) => ({
            templateId: id,
            name: comp.name,
            amount: Number(comp.amount),
            priority: comp.priority !== undefined ? Number(comp.priority) : index + 1,
            description: comp.description || null,
            isActive: comp.isActive !== undefined ? comp.isActive : true
          }))
        })
      }

      return await tx.feeTemplate.findUnique({
        where: { id },
        include: {
          components: { orderBy: { priority: 'asc' } },
          _count: { select: { studentFees: true } }
        }
      })
    })

    return NextResponse.json(updatedTemplate)
  } catch (error: unknown) {
    console.error('Error updating fee template:', error)

    return NextResponse.json({ error: 'Failed to update fee template' }, { status: 500 })
  }
}

// DELETE: Delete fee template
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const existing = await prisma.feeTemplate.findUnique({
      where: { id },
      include: { _count: { select: { studentFees: true } } }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (existing._count.studentFees > 0) {
      return NextResponse.json(
        { error: `Template tidak bisa dihapus karena sudah digunakan oleh ${existing._count.studentFees} siswa.` },
        { status: 400 }
      )
    }

    await prisma.feeTemplate.delete({ where: { id } })

    await logActivity({
      activityType: 'FEE_TEMPLATE_DELETE',
      description: `Menghapus template biaya: ${existing.name} (${existing.academicYear})`,
      metadata: { templateId: id, name: existing.name, academicYear: existing.academicYear }
    })

    return NextResponse.json({ success: true, message: 'Template berhasil dihapus' })
  } catch (error: unknown) {
    console.error('Error deleting fee template:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'FEE_TEMPLATE_DELETE',
      description: `Gagal menghapus template biaya dengan ID: ${id}`,
      metadata: { error: msg, templateId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete fee template' }, { status: 500 })
  }
}
