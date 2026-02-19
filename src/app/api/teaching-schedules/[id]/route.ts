import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// PUT update teaching schedule
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()

    const updatedSchedule = await prisma.teachingSchedule.update({
      where: { id },
      data: body
    })

    return NextResponse.json(updatedSchedule, { status: 200 })
  } catch (error: any) {
    console.error('Error updating teaching schedule:', error)

    return NextResponse.json({ error: 'Failed to update teaching schedule', details: error.message }, { status: 500 })
  }
}

// DELETE teaching schedule
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Fetch schedule details for logging
    const schedule = await prisma.teachingSchedule.findUnique({
      where: { id },
      include: {
        teacher: true
      }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    await prisma.teachingSchedule.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'TEACHING_SCHEDULE_DELETE',
      description: `Menghapus jadwal mengajar: ${schedule.subject} - Guru: ${schedule.teacher.name} (${schedule.day}, ${schedule.startTime}-${schedule.endTime})`,
      metadata: { scheduleId: id, subject: schedule.subject, teacherName: schedule.teacher.name }
    })

    return NextResponse.json({ message: 'Teaching schedule deleted successfully' }, { status: 200 })
  } catch (error: any) {
    const { id } = await params

    console.error('Error deleting teaching schedule:', error)

    await logActivity({
      activityType: 'TEACHING_SCHEDULE_DELETE',
      description: `Gagal menghapus jadwal mengajar dengan ID: ${id}`,
      metadata: { error: error.message, scheduleId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete teaching schedule', details: error.message }, { status: 500 })
  }
}
