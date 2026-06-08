import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// GET all students or search by query
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const grade = searchParams.get('grade')
    const classParam = searchParams.get('class')
    const status = searchParams.get('status')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nis: { contains: search } },
        { nisn: { contains: search } }
      ]
    }

    if (grade) where.grade = grade
    if (classParam) where.class = classParam
    if (status) where.status = status

    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 1000

    const students = await prisma.student.findMany({
      where,
      orderBy: [{ grade: 'asc' }, { class: 'asc' }, { name: 'asc' }],
      take: limit
    })

    return NextResponse.json(students, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching students:', error)
    
return NextResponse.json({ error: 'Failed to fetch students', details: error.message }, { status: 500 })
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const student = await prisma.student.create({
      data: {
        nis: body.nis,
        nisn: body.nisn,
        name: body.name,
        nickname: body.nickname,
        grade: body.grade,
        class: body.class,
        birthPlace: body.birthPlace,
        birthDate: body.birthDate,
        gender: body.gender,
        religion: body.religion,
        address: body.address,
        rt: body.rt,
        rw: body.rw,
        kelurahan: body.kelurahan,
        kecamatan: body.kecamatan,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        parentName: body.parentName,
        fatherName: body.fatherName,
        motherName: body.motherName,
        guardianName: body.guardianName,
        guardianRelation: body.guardianRelation,
        phone: body.phone,
        parentPhone: body.parentPhone,
        email: body.email,
        enrollmentDate: body.enrollmentDate,
        sppStartDate: body.sppStartDate,
        previousSchool: body.previousSchool,
        status: body.status,
        photo: body.photo
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error('Error creating student:', error)
    
return NextResponse.json({ error: 'Failed to create student', details: error.message }, { status: 500 })
  }
}
