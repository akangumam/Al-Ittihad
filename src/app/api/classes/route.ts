import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'
import { logActivity } from '@/utils/activityLogger'

// GET all classes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const academicYear = searchParams.get('academicYear')

    const where: any = {}

    if (academicYear) where.academicYear = academicYear

    const classes = await prisma.class.findMany({
      where,
      orderBy: [{ grade: 'asc' }, { className: 'asc' }]
    })

    // Get actual student counts for each class
    const classesWithCounts = await Promise.all(
      classes.map(async cls => {
        const count = await prisma.student.count({
          where: {
            grade: cls.grade,
            class: cls.className,
            status: 'Aktif'
          }
        })

        return {
          ...cls,
          currentStudents: count
        }
      })
    )

    return NextResponse.json(classesWithCounts, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching classes:', error)

    return NextResponse.json({ error: 'Failed to fetch classes', details: error.message }, { status: 500 })
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    console.log('📝 Creating class with data:', body)

    // Validate required fields
    if (!body.grade || !body.className || !body.academicYear) {
      console.error('❌ Missing required fields:', {
        grade: body.grade,
        className: body.className,
        academicYear: body.academicYear
      })

      return NextResponse.json(
        {
          error: 'Tingkat, Nama Kelas, dan Tahun Ajaran harus diisi'
        },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findUnique({
      where: {
        grade_className_academicYear: {
          grade: body.grade,
          className: body.className,
          academicYear: body.academicYear
        }
      }
    })

    if (existingClass) {
      console.error('❌ Class already exists:', existingClass)

      return NextResponse.json(
        {
          error: `Kelas ${body.className} untuk tingkat ${body.grade} pada tahun ajaran ${body.academicYear} sudah ada`
        },
        { status: 400 }
      )
    }

    const classData = await prisma.class.create({
      data: {
        grade: body.grade,
        className: body.className,
        capacity: Number(body.capacity) || 36,
        currentStudents: 0,
        teacher: body.teacher || '',
        academicYear: body.academicYear
      }
    })

    console.log('✅ Class created successfully:', classData)

    await logActivity({
      activityType: 'CLASS_CREATE',
      description: `Menambah kelas baru: ${classData.grade}-${classData.className} (${classData.academicYear})`,
      module: 'Kelas',
      targetId: classData.id,
      targetName: `${classData.grade}-${classData.className}`,
      metadata: { grade: classData.grade, className: classData.className, academicYear: classData.academicYear, capacity: classData.capacity }
    })

    return NextResponse.json(classData, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating class:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Kelas dengan kombinasi tingkat, nama kelas, dan tahun ajaran ini sudah ada'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Gagal membuat kelas',
        details: error.message
      },
      { status: 500 }
    )
  }
}
