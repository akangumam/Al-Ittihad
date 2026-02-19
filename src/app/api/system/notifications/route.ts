import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const notifications = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // 1. Check Teacher Attendance (Urgent)
    // Find teachers who haven't recorded attendance today
    const totalTeachers = await prisma.teacher.count({ where: { status: 'Aktif' } })

    const attendanceToday = await prisma.teacherAttendance.count({
      where: { date: todayStr }
    })

    if (attendanceToday < totalTeachers && totalTeachers > 0) {
      notifications.push({
        title: 'Pengingat Absensi Guru',
        subtitle: `${totalTeachers - attendanceToday} Guru belum melakukan presensi hari ini.`,
        time: 'Hari Ini',
        read: false,
        avatarIcon: 'ri-user-follow-line',
        avatarColor: 'error',
        avatarSkin: 'light'
      })
    }

    // 2. Check System Backup/Last Activity (Urgent)
    // If no activity in 24 hours, might be a sign to check system
    const lastLog = await prisma.activityLog.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (lastLog) {
      const lastActivityDate = new Date(lastLog.createdAt)
      const hoursSinceLastActivity = (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastActivity > 24) {
        notifications.push({
          title: 'Pengingat Backup Data',
          subtitle: 'Sudah lebih dari 24 jam tidak ada aktivitas sistem. Disarankan melakukan backup berkala.',
          time: `${Math.floor(hoursSinceLastActivity)} jam lalu`,
          read: false,
          avatarIcon: 'ri-database-2-line',
          avatarColor: 'warning',
          avatarSkin: 'light'
        })
      }
    }

    // 3. Incomplete Student Data Alert (Manual Entry Workflow)
    // Check for students with missing critical info since entry is manual
    const incompleteStudents = await prisma.student.count({
      where: {
        OR: [{ parentPhone: '' }, { address: '' }, { birthDate: '' }]
      }
    })

    if (incompleteStudents > 0) {
      notifications.push({
        title: 'Data Siswa Belum Lengkap',
        subtitle: `${incompleteStudents} siswa memiliki data utama yang masih kosong.`,
        time: 'Perlu Update',
        read: false,
        avatarIcon: 'ri-file-edit-line',
        avatarColor: 'info',
        avatarSkin: 'light'
      })
    }

    // 4. Low Capacity Warning
    const fullClasses = await prisma.class.findMany({
      where: {
        AND: [
          { currentStudents: { gte: 34 } } // Assuming capacity around 36
        ]
      }
    })

    if (fullClasses.length > 0) {
      notifications.push({
        title: 'Kapasitas Kelas Hampir Penuh',
        subtitle: `${fullClasses.length} kelas telah mencapai >95% kapasitas.`,
        time: 'Peringatan',
        read: false,
        avatarIcon: 'ri-error-warning-line',
        avatarColor: 'warning',
        avatarSkin: 'light'
      })
    }

    return NextResponse.json(notifications)
  } catch (error: any) {
    console.error('Error fetching dashboard notifications:', error)

    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
