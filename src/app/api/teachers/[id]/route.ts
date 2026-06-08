import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// GET single teacher by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const params = await props.params

  try {
    const { id } = params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { schedules: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json(teacher, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching teacher:', error)

    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 })
  }
}

// PUT - Update teacher
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const params = await props.params

  try {
    const { id } = params
    const body = await request.json()

    const str = (v: unknown) => (v !== undefined && v !== null && v !== '' ? String(v) : null)
    const req = (v: unknown) => (v !== undefined && v !== null ? String(v) : '')

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        nip: req(body.nip),
        nuptk: req(body.nuptk),
        name: req(body.name),
        subject: req(body.subject),
        position: req(body.position),
        gender: req(body.gender),
        birthPlace: str(body.birthPlace),
        birthDate: str(body.birthDate),
        phone: req(body.phone),
        email: req(body.email),
        address: req(body.address),
        education: str(body.education),
        status: req(body.status),
        photo: body.photo && typeof body.photo === 'string' ? body.photo : undefined
      }
    })

    return NextResponse.json(teacher, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating teacher:', error)
    const code = (error as any)?.code
    const msg = error instanceof Error ? error.message : 'Unknown error'

    if (code === 'P2002') {
      return NextResponse.json({ error: 'NIP sudah digunakan guru lain' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Gagal memperbarui data guru', details: msg }, { status: 500 })
  }
}

// DELETE teacher
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const params = await props.params

  try {
    const { id } = params

    const teacher = await prisma.teacher.findUnique({ where: { id } })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    await prisma.teacher.delete({ where: { id } })

    await logActivity({
      activityType: 'TEACHER_DELETE',
      description: `Menghapus data guru: ${teacher.name} (${teacher.nip})`,
      metadata: { teacherId: id, name: teacher.name, nip: teacher.nip }
    })

    return NextResponse.json({ message: 'Teacher deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting teacher:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'TEACHER_DELETE',
      description: `Gagal menghapus data guru`,
      metadata: { error: msg },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}
