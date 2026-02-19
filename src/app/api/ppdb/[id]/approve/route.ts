import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'

// Helper to generate NIS
async function generateNIS() {
  const year = new Date().getFullYear().toString().slice(-2)
  const count = await prisma.student.count()
  const number = String(count + 1).padStart(4, '0')

  return `${year}${number}`
}

// Helper to copy file
async function copyUploadedFile(sourcePath: string, destFolder: string): Promise<string> {
  if (!sourcePath) return ''

  const publicDir = join(process.cwd(), 'public')
  const sourceFullPath = join(publicDir, sourcePath)

  if (!existsSync(sourceFullPath)) return ''

  // Create destination directory
  const destDir = join(publicDir, 'uploads', 'students', destFolder)

  if (!existsSync(destDir)) {
    await mkdir(destDir, { recursive: true })
  }

  // Get filename from source
  const filename = sourcePath.split('/').pop() || ''
  const destPath = join(destDir, filename)

  // Copy file
  await copyFile(sourceFullPath, destPath)

  // Return relative path
  return `/uploads/students/${destFolder}/${filename}`
}

// POST - Approve PPDB and create Student
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()

    // Get PPDB registration
    const ppdb = await prisma.pPDBRegistration.findUnique({
      where: { id }
    })

    if (!ppdb) {
      return NextResponse.json({ success: false, error: 'PPDB registration not found' }, { status: 404 })
    }

    if (ppdb.status !== 'Pending' && ppdb.status !== 'Verified') {
      return NextResponse.json({ success: false, error: 'PPDB sudah diproses sebelumnya' }, { status: 400 })
    }

    // Generate NIS
    const nis = await generateNIS()
    const enrollmentDate = new Date().toISOString().split('T')[0]

    // Copy photo if exists
    let photoPath = ''

    if (ppdb.pasFoto) {
      photoPath = await copyUploadedFile(ppdb.pasFoto, 'photos')
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        nis,
        nisn: ppdb.nisn,
        name: ppdb.namaLengkap,
        nickname: ppdb.namaLengkap.split(' ')[0], // First name as nickname
        grade: body.grade || 'VII', // Default to grade VII
        class: body.class || 'A', // Default to class A
        birthPlace: ppdb.tempatLahir,
        birthDate: ppdb.tanggalLahir,
        gender: ppdb.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
        religion: 'Islam', // Default
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

    // Update PPDB status
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
        data: {
          studentId: student.id,
          nis: student.nis,
          name: student.name
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error approving PPDB:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to approve PPDB', details: error.message },
      { status: 500 }
    )
  }
}
