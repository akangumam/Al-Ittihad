import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// GET - Get attendance recap/report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // 01-12
    const year = searchParams.get('year') // 2026
    const teacherId = searchParams.get('teacherId')
    const academicYear = searchParams.get('academicYear')

    console.log('📊 Fetching recap:', { month, year, teacherId, academicYear })

    // Build where clause
    const where: any = {}

    if (month && year) {
      // Filter by month and year
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    if (teacherId) {
      where.teacherId = teacherId
    }

    if (academicYear) {
      where.academicYear = academicYear
    }

    // Get attendance records
    const attendances = await prisma.teacherAttendance.findMany({
      where,
      orderBy: [{ date: 'desc' }, { teacherName: 'asc' }]
    })

    // Calculate summary statistics
    const summary = {
      totalRecords: attendances.length,
      byStatus: {
        hadir: attendances.filter((a: any) => a.status === 'Hadir').length,
        izin: attendances.filter((a: any) => a.status === 'Izin').length,
        sakit: attendances.filter((a: any) => a.status === 'Sakit').length,
        alpa: attendances.filter((a: any) => a.status === 'Alpa').length,
        terlambat: attendances.filter((a: any) => a.status === 'Terlambat').length,
        dinasLuar: attendances.filter((a: any) => a.status === 'Dinas Luar').length
      },
      lateCount: attendances.filter((a: any) => a.isLate).length,
      totalLateMinutes: attendances.reduce((sum: number, a: any) => sum + a.lateMinutes, 0)
    }

    // Group by teacher if getting all teachers
    let byTeacher = null

    if (!teacherId) {
      const teacherMap = new Map()

      attendances.forEach((att: any) => {
        if (!teacherMap.has(att.teacherId)) {
          teacherMap.set(att.teacherId, {
            teacherId: att.teacherId,
            teacherName: att.teacherName,
            nip: att.nip,
            total: 0,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpa: 0,
            terlambat: 0,
            dinasLuar: 0,
            lateCount: 0,
            totalLateMinutes: 0
          })
        }

        const teacher = teacherMap.get(att.teacherId)

        teacher.total++

        // Map status to key (handle spaces)
        const statusKey = att.status === 'Dinas Luar' ? 'dinasLuar' : att.status.toLowerCase()

        if (teacher[statusKey] !== undefined) {
          teacher[statusKey]++
        }

        if (att.isLate || att.status === 'Terlambat') {
          teacher.lateCount++
          teacher.totalLateMinutes += att.lateMinutes || 0
        }
      })

      byTeacher = Array.from(teacherMap.values()).sort((a, b) => a.teacherName.localeCompare(b.teacherName))
    }

    console.log('✅ Recap generated:', summary)

    return NextResponse.json({
      period: { month, year },
      summary,
      byTeacher,
      records: attendances,
      recordCount: attendances.length
    })
  } catch (error: any) {
    console.error('❌ Error fetching recap:', error)

    return NextResponse.json(
      {
        error: 'Gagal mengambil rekap absensi',
        details: error.message
      },
      { status: 500 }
    )
  }
}
