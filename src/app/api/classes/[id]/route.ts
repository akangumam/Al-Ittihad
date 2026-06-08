import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET single class by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const classData = await prisma.class.findUnique({ where: { id } })

    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(classData, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching class:', error)

    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 })
  }
}

// PUT - Update class
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const body = await request.json()

    const existingClass = await prisma.class.findUnique({ where: { id } })

    if (!existingClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.grade !== undefined) updateData.grade = body.grade
    if (body.className !== undefined) updateData.className = body.className
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity)
    if (body.teacher !== undefined) updateData.teacher = body.teacher
    if (body.academicYear !== undefined) updateData.academicYear = body.academicYear

    const classData = await prisma.class.update({ where: { id }, data: updateData })

    await logActivity({
      activityType: 'CLASS_UPDATE',
      description: `Memperbarui kelas: ${classData.grade}-${classData.className} (${classData.academicYear})`,
      module: 'Kelas',
      targetId: classData.id,
      targetName: `${classData.grade}-${classData.className}`,
      metadata: { grade: classData.grade, className: classData.className, academicYear: classData.academicYear }
    })

    return NextResponse.json(classData, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating class:', error)
    const code = (error as any)?.code

    if (code === 'P2002') {
      return NextResponse.json({ error: 'Kelas dengan kombinasi ini sudah ada' }, { status: 400 })
    }

    if (code === 'P2025') {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Gagal mengupdate kelas' }, { status: 500 })
  }
}

// DELETE class
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const classData = await prisma.class.findUnique({ where: { id } })

    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    await prisma.class.delete({ where: { id } })

    await logActivity({
      activityType: 'CLASS_DELETE',
      description: `Menghapus kelas: ${classData.grade}-${classData.className} (${classData.academicYear})`,
      metadata: { classId: id, grade: classData.grade, className: classData.className, academicYear: classData.academicYear }
    })

    return NextResponse.json({ message: 'Kelas berhasil dihapus' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting class:', error)
    const code = (error as any)?.code

    if (code === 'P2025') {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    if (code === 'P2003') {
      return NextResponse.json({ error: 'Tidak dapat menghapus kelas yang masih memiliki siswa' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Gagal menghapus kelas' }, { status: 500 })
  }
}
