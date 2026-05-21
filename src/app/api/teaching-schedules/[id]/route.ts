import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// PUT update teaching schedule
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const updatedSchedule = await prisma.teachingSchedule.update({ where: { id }, data: body })

    return NextResponse.json(updatedSchedule, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating teaching schedule:', error)

    return NextResponse.json({ error: 'Failed to update teaching schedule' }, { status: 500 })
  }
}

// DELETE teaching schedule
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const schedule = await prisma.teachingSchedule.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    await prisma.teachingSchedule.delete({ where: { id } })

    await logActivity({
      activityType: 'TEACHING_SCHEDULE_DELETE',
      description: `Menghapus jadwal mengajar: ${schedule.subject} - Guru: ${schedule.teacher.name} (${schedule.day}, ${schedule.startTime}-${schedule.endTime})`,
      metadata: { scheduleId: id, subject: schedule.subject, teacherName: schedule.teacher.name }
    })

    return NextResponse.json({ message: 'Teaching schedule deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting teaching schedule:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'TEACHING_SCHEDULE_DELETE',
      description: `Gagal menghapus jadwal mengajar dengan ID: ${id}`,
      metadata: { error: msg, scheduleId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete teaching schedule' }, { status: 500 })
  }
}
