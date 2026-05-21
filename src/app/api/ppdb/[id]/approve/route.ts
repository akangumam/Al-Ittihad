import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// Use findFirst+orderBy to avoid race condition on NIS generation
async function generateNIS(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)
  const prefix = year

  return await prisma.$transaction(async tx => {
    const last = await tx.student.findFirst({
      where: { nis: { startsWith: prefix } },
      orderBy: { nis: 'desc' }
    })

    let next = 1

    if (last?.nis) {
      const num = parseInt(last.nis.slice(2), 10)

      if (!isNaN(num)) next = num + 1
    }

    return `${prefix}${String(next).padStart(4, '0')}`
  })
}

// Copy photo from private_uploads (PPDB) to public/uploads/students (for display)
async function copyUploadedFile(privatePath: string, destFolder: string): Promise<string> {
  if (!privatePath) return ''

  const sourceFullPath = join(process.cwd(), 'private_uploads', privatePath)

  if (!existsSync(sourceFullPath)) return ''

  const destDir = join(process.cwd(), 'public', 'uploads', 'students', destFolder)

  if (!existsSync(destDir)) {
    await mkdir(destDir, { recursive: true })
  }

  const filename = privatePath.split('/').pop() || ''
  const destPath = join(destDir, filename)

  await copyFile(sourceFullPath, destPath)

  return `/uploads/students/${destFolder}/${filename}`
}

// POST - Approve PPDB and create Student
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const ppdb = await prisma.pPDBRegistration.findUnique({ where: { id } })

    if (!ppdb) {
      return NextResponse.json({ success: false, error: 'PPDB registration not found' }, { status: 404 })
    }

    if (ppdb.status !== 'Pending' && ppdb.status !== 'Verified') {
      return NextResponse.json({ success: false, error: 'PPDB sudah diproses sebelumnya' }, { status: 400 })
    }

    const nis = await generateNIS()
    const enrollmentDate = new Date().toISOString().split('T')[0]

    let photoPath = ''

    if (ppdb.pasFoto) {
      photoPath = await copyUploadedFile(ppdb.pasFoto, 'photos')
    }

    const student = await prisma.student.create({
      data: {
        nis,
        nisn: ppdb.nisn,
        name: ppdb.namaLengkap,
        nickname: ppdb.namaLengkap.split(' ')[0],
        grade: body.grade || 'VII',
        class: body.class || 'A',
        birthPlace: ppdb.tempatLahir,
        birthDate: ppdb.tanggalLahir,
        gender: ppdb.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
        religion: 'Islam',
        address: ppdb.alamatRumah,
        rt: '',
        rw: '',
        kelurahan: ppdb.desa,
        kecamatan: ppdb.kecamatan,
        city: ppdb.kota,
        province: 'Banten',
        postalCode: '',
        parentName: ppdb.namaAyah,
        fatherName: ppdb.namaAyah,
        motherName: ppdb.namaIbu,
        guardianName: '',
        guardianRelation: '',
        phone: ppdb.noWhatsApp,
        parentPhone: ppdb.noWhatsApp,
        email: ppdb.email || '',
        enrollmentDate,
        sppStartDate: enrollmentDate,
        previousSchool: ppdb.namaSekolah,
        status: 'Aktif',
        photo: photoPath
      }
    })

    await prisma.pPDBRegistration.update({
      where: { id },
      data: {
        status: 'Accepted',
        reviewNote: body.reviewNote || 'Diterima sebagai siswa baru'
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'PPDB berhasil di-approve dan siswa telah dibuat',
        data: { studentId: student.id, nis: student.nis, name: student.name }
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error approving PPDB:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({ success: false, error: 'Failed to approve PPDB', details: msg }, { status: 500 })
  }
}
