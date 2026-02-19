import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET single class by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const classData = await prisma.class.findUnique({
      where: { id }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(classData, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error fetching class:', error)

    return NextResponse.json(
      {
        error: 'Gagal mengambil data kelas',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PUT - Update class
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const body = await request.json()

    console.log('📝 Updating class with ID:', id)
    console.log('📝 Update data:', body)

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id }
    })

    if (!existingClass) {
      console.error('❌ Class not found:', id)

      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    // Build update data with only allowed fields
    const updateData: any = {}

    if (body.grade !== undefined) updateData.grade = body.grade
    if (body.className !== undefined) updateData.className = body.className
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity)
    if (body.teacher !== undefined) updateData.teacher = body.teacher
    if (body.academicYear !== undefined) updateData.academicYear = body.academicYear

    console.log('📝 Filtered update data:', updateData)

    const classData = await prisma.class.update({
      where: { id },
      data: updateData
    })

    console.log('✅ Class updated successfully:', classData)

    return NextResponse.json(classData, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error updating class:', error)
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

    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: 'Gagal mengupdate kelas',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE class
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    console.log('🗑️ Deleting class with ID:', id)

    // Fetch class details for logging
    const classData = await prisma.class.findUnique({
      where: { id }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    await prisma.class.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'CLASS_DELETE',
      description: `Menghapus kelas: ${classData.grade}-${classData.className} (${classData.academicYear})`,
      metadata: {
        classId: id,
        grade: classData.grade,
        className: classData.className,
        academicYear: classData.academicYear
      }
    })

    console.log('✅ Class deleted successfully')

    return NextResponse.json({ message: 'Kelas berhasil dihapus' }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error deleting class:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    // Handle foreign key constraint (students still in class)
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Tidak dapat menghapus kelas yang masih memiliki siswa'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Gagal menghapus kelas',
        details: error.message
      },
      { status: 500 }
    )
  }
}
