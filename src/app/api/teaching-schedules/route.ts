import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'
import { logActivity } from '@/utils/activityLogger'

// GET all teaching schedules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const teacherId = searchParams.get('teacherId')
    const day = searchParams.get('day')
    const academicYear = searchParams.get('academicYear')

    const where: any = {}

    if (teacherId) where.teacherId = teacherId
    if (day) where.day = day
    if (academicYear) where.academicYear = academicYear

    const schedules = await prisma.teachingSchedule.findMany({
      where,
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }]
    })

    return NextResponse.json(schedules, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching teaching schedules:', error)

    return NextResponse.json({ error: 'Failed to fetch teaching schedules', details: error.message }, { status: 500 })
  }
}

// POST create new teaching schedule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (
      !body.teacherId ||
      !body.teacherName ||
      !body.day ||
      !body.startTime ||
      !body.endTime ||
      !body.grade ||
      !body.class ||
      !body.academicYear
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const schedule = await prisma.teachingSchedule.create({
      data: body
    })

    await logActivity({
      activityType: 'TEACHING_SCHEDULE_CREATE',
      description: `Menambah jadwal mengajar: ${schedule.subject} - ${schedule.teacherName} (${schedule.day}, ${schedule.startTime}-${schedule.endTime})`,
      module: 'Jadwal Mengajar',
      targetId: schedule.id,
      targetName: `${schedule.subject} - ${schedule.teacherName}`,
      metadata: { teacherId: schedule.teacherId, subject: schedule.subject, day: schedule.day, grade: schedule.grade, class: schedule.class }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    console.error('Error creating teaching schedule:', error)

    return NextResponse.json({ error: 'Failed to create teaching schedule', details: error.message }, { status: 500 })
  }
}
