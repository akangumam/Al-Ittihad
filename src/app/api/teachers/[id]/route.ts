import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET single teacher by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const { id } = params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        schedules: true
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json(teacher, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching teacher:', error)

    return NextResponse.json({ error: 'Failed to fetch teacher', details: error.message }, { status: 500 })
  }
}

// PUT - Update teacher
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const { id } = params

    const body = await request.json()

    const teacher = await prisma.teacher.update({
      where: { id },
      data: body
    })

    return NextResponse.json(teacher, { status: 200 })
  } catch (error: any) {
    console.error('Error updating teacher:', error)

    return NextResponse.json({ error: 'Failed to update teacher', details: error.message }, { status: 500 })
  }
}

// DELETE teacher
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const { id } = params

    // Fetch teacher first for logging
    const teacher = await prisma.teacher.findUnique({
      where: { id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    await prisma.teacher.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'TEACHER_DELETE',
      description: `Menghapus data guru: ${teacher.name} (${teacher.nip})`,
      metadata: { teacherId: id, name: teacher.name, nip: teacher.nip }
    })

    return NextResponse.json({ message: 'Teacher deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting teacher:', error)

    await logActivity({
      activityType: 'TEACHER_DELETE',
      description: `Gagal menghapus data guru dengan ID: ${params.id}`,
      metadata: { error: error.message, teacherId: params.id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete teacher', details: error.message }, { status: 500 })
  }
}
