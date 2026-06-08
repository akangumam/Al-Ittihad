import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// PUT - Update academic year
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const body = await request.json()

    // Protected fields
    delete body.id
    delete body.createdAt
    delete body.updatedAt

    // If making this one active, deactivate others
    if (body.isActive) {
      await prisma.academicYear.updateMany({
        where: {
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      })
    }

    const year = await prisma.academicYear.update({
      where: { id },
      data: body
    })

    await logActivity({
      activityType: 'ACADEMIC_YEAR_UPDATE',
      description: `Memperbarui tahun ajaran: ${year.name}`,
      module: 'Tahun Ajaran',
      targetId: year.id,
      targetName: year.name,
      metadata: { name: year.name, semester: year.semester, isActive: year.isActive }
    })

    return NextResponse.json(year, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating academic year ${id}:`, error)

    return NextResponse.json({ error: 'Failed to update academic year', details: error.message }, { status: 500 })
  }
}

// DELETE - Delete academic year
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    // Fetch details for logging
    const year = await prisma.academicYear.findUnique({
      where: { id }
    })

    if (!year) {
      return NextResponse.json({ error: 'Academic year not found' }, { status: 404 })
    }

    await prisma.academicYear.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'ACADEMIC_YEAR_DELETE',
      description: `Menghapus tahun ajaran: ${year.name}`,
      metadata: { yearId: id, name: year.name }
    })

    return NextResponse.json({ message: 'Academic year deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error(`Error deleting academic year ${id}:`, error)

    await logActivity({
      activityType: 'ACADEMIC_YEAR_DELETE',
      description: `Gagal menghapus tahun ajaran dengan ID: ${id}`,
      metadata: { error: error.message, yearId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete academic year', details: error.message }, { status: 500 })
  }
}
