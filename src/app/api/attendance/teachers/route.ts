import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// Helper function to get day name in Indonesian
function getDayName(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  return days[date.getDay()]
}

// Helper function to get earliest start time from schedules
function getEarliestStartTime(schedules: any[]): string {
  if (schedules.length === 0) return '07:00' // Default for non-teaching staff

  const times = schedules.map(s => s.startTime).sort()

  return times[0]
}

// Helper function to calculate if late and by how many minutes
function calculateLateness(scheduledTime: string, actualTime: string | null) {
  if (!actualTime) return { isLate: false, lateMinutes: 0 }

  const [schedHour, schedMin] = scheduledTime.split(':').map(Number)
  const [actualHour, actualMin] = actualTime.split(':').map(Number)

  const scheduledMinutes = schedHour * 60 + schedMin
  const actualMinutes = actualHour * 60 + actualMin
  const diff = actualMinutes - scheduledMinutes

  return {
    isLate: diff > 0,
    lateMinutes: diff > 0 ? diff : 0
  }
}

// GET - Get teachers who should be present today (based on schedule)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date') // Format: YYYY-MM-DD
    const academicYear = searchParams.get('academicYear')

    // Use provided date or today
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const dateString = targetDate.toISOString().split('T')[0]
    const dayName = getDayName(targetDate)

    console.log('📅 Fetching attendance for:', { dateString, dayName, academicYear })

    // Get all active teachers
    const teachers = await prisma.teacher.findMany({
      where: {
        status: 'Aktif'
      },
      include: {
        schedules: {
          where: {
            day: dayName,
            ...(academicYear && { academicYear })
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get existing attendance records for this date
    const existingAttendance = await prisma.teacherAttendance.findMany({
      where: {
        date: dateString
      }
    })

    const attendanceMap = new Map(existingAttendance.map((a: any) => [a.teacherId, a]))

    // Build attendance list
    const attendanceList = teachers.map(teacher => {
      const scheduledStartTime = getEarliestStartTime(teacher.schedules)
      const hasSchedule = teacher.schedules.length > 0
      const existing = attendanceMap.get(teacher.id)

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        nip: teacher.nip,
        position: teacher.position,
        hasSchedule,
        scheduleCount: teacher.schedules.length,
        scheduledStartTime,

        // If attendance already recorded, use it; otherwise set defaults
        attendance: existing || {
          id: null,
          status: null,
          checkInTime: null,
          isLate: false,
          lateMinutes: 0,
          notes: null
        }
      }
    })

    console.log('✅ Found', attendanceList.length, 'teachers')

    return NextResponse.json({
      date: dateString,
      day: dayName,
      teachers: attendanceList,
      summary: {
        total: attendanceList.length,
        withSchedule: attendanceList.filter(t => t.hasSchedule).length,
        recorded: existingAttendance.length,
        pending: attendanceList.length - existingAttendance.length
      }
    })
  } catch (error: any) {
    console.error('❌ Error fetching teacher attendance:', error)

    return NextResponse.json(
      {
        error: 'Gagal mengambil data absensi guru',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Create or update attendance records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, attendances, recordedBy, academicYear } = body

    if (!date || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { error: 'Format data tidak valid. Pastikan date dan attendances terisi.' },
        { status: 400 }
      )
    }

    const targetDate = new Date(date)
    const dayName = getDayName(targetDate)

    // Process each attendance record
    const results = await Promise.all(
      attendances.map(async (att: any) => {
        const { teacherId, teacherName, nip, scheduledStartTime, checkInTime, status, notes } = att

        // Calculate lateness
        const { isLate, lateMinutes } = calculateLateness(scheduledStartTime, checkInTime)

        // Upsert attendance record
        const attendance = await prisma.teacherAttendance.upsert({
          where: {
            teacherId_date: {
              teacherId,
              date
            }
          },
          update: {
            status,
            checkInTime,
            isLate,
            lateMinutes,
            notes,
            recordedBy,
            updatedAt: new Date()
          },
          create: {
            teacherId,
            teacherName,
            nip,
            date,
            day: dayName,
            status,
            scheduledStartTime,
            checkInTime,
            isLate,
            lateMinutes,
            notes,
            recordedBy,
            academicYear: academicYear || new Date().getFullYear().toString()
          }
        })

        return attendance
      })
    )

    console.log('✅ Saved', results.length, 'attendance records')

    return NextResponse.json(
      {
        message: 'Absensi berhasil disimpan',
        count: results.length,
        data: results
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error saving attendance:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    })

    return NextResponse.json(
      {
        error: 'Gagal menyimpan absensi',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove attendance record
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')

    if (!teacherId || !date) {
      return NextResponse.json({ error: 'Teacher ID dan Tanggal diperlukan' }, { status: 400 })
    }

    await prisma.teacherAttendance.delete({
      where: {
        teacherId_date: {
          teacherId,
          date
        }
      }
    })

    return NextResponse.json({ message: 'Data absensi berhasil dihapus' }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error deleting attendance:', error)

    return NextResponse.json(
      {
        error: 'Gagal menghapus data absensi',
        details: error.message
      },
      { status: 500 }
    )
  }
}
