import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

// PPDB Registration API
// Helper to generate registration number — uses a transaction to prevent race condition
async function generateRegistrationNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PPDB-${year}-`

  return await prisma.$transaction(async tx => {
    const last = await tx.pPDBRegistration.findFirst({
      where: { registrationNumber: { startsWith: prefix } },
      orderBy: { registrationNumber: 'desc' }
    })

    let next = 1

    if (last) {
      const parts = last.registrationNumber.split('-')
      const lastNum = parseInt(parts[parts.length - 1], 10)

      if (!isNaN(lastNum)) next = lastNum + 1
    }

    return `${prefix}${String(next).padStart(3, '0')}`
  })
}

// Helper to save uploaded file — stored outside public/ to prevent direct access
async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Store in private_uploads (outside public/) so files are not publicly accessible
  const uploadDir = join(process.cwd(), 'private_uploads', 'ppdb', folder)

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, buffer)

  // Return internal path — served via /api/ppdb/files/[...path] with auth check
  return `ppdb/${folder}/${filename}`
}

// POST - Create new PPDB registration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Generate registration number
    const registrationNumber = await generateRegistrationNumber()

    // Process file uploads
    let kartuKeluargaPath = null
    let ijazahPath = null
    let skhunPath = null
    let pasFotoPath = null

    const kartuKeluargaFile = formData.get('kartuKeluarga') as File | null

    if (kartuKeluargaFile) {
      kartuKeluargaPath = await saveFile(kartuKeluargaFile, 'kk')
    }

    const ijazahFile = formData.get('ijazah') as File | null

    if (ijazahFile) {
      ijazahPath = await saveFile(ijazahFile, 'ijazah')
    }

    const skhunFile = formData.get('skhun') as File | null

    if (skhunFile) {
      skhunPath = await saveFile(skhunFile, 'skhun')
    }

    const pasFotoFile = formData.get('pasFoto') as File | null

    if (pasFotoFile) {
      pasFotoPath = await saveFile(pasFotoFile, 'foto')
    }

    // Create registration record
    const registration = await prisma.pPDBRegistration.create({
      data: {
        registrationNumber,
        jalur: formData.get('jalur') as string,

        // Data Pribadi
        namaLengkap: formData.get('namaLengkap') as string,
        nik: formData.get('nik') as string,
        nisn: formData.get('nisn') as string,
        jenisKelamin: formData.get('jenisKelamin') as string,
        tempatLahir: formData.get('tempatLahir') as string,
        tanggalLahir: formData.get('tanggalLahir') as string,
        alamatRumah: formData.get('alamatRumah') as string,
        desa: formData.get('desa') as string,
        kecamatan: formData.get('kecamatan') as string,
        kota: formData.get('kota') as string,

        // Data Keluarga
        noKartuKeluarga: formData.get('noKartuKeluarga') as string,
        namaAyah: formData.get('namaAyah') as string,
        nikAyah: formData.get('nikAyah') as string,
        tempatLahirAyah: formData.get('tempatLahirAyah') as string,
        tanggalLahirAyah: formData.get('tanggalLahirAyah') as string,
        pekerjaanAyah: formData.get('pekerjaanAyah') as string,
        penghasilanAyah: formData.get('penghasilanAyah') as string,
        namaIbu: formData.get('namaIbu') as string,
        nikIbu: formData.get('nikIbu') as string,
        tempatLahirIbu: formData.get('tempatLahirIbu') as string,
        tanggalLahirIbu: formData.get('tanggalLahirIbu') as string,
        pekerjaanIbu: formData.get('pekerjaanIbu') as string,
        penghasilanIbu: formData.get('penghasilanIbu') as string,
        alamatOrangTua: formData.get('alamatOrangTua') as string,

        // Informasi Kontak
        noWhatsApp: formData.get('noWhatsApp') as string,
        email: (formData.get('email') as string) || null,

        // Data Sekolah Asal
        namaSekolah: formData.get('namaSekolah') as string,
        statusSekolah: formData.get('statusSekolah') as string,
        nsmNss: (formData.get('nsmNss') as string) || null,
        npsn: (formData.get('npsn') as string) || null,
        alamatSekolah: formData.get('alamatSekolah') as string,

        // Upload Berkas
        kartuKeluarga: kartuKeluargaPath,
        ijazah: ijazahPath,
        skhun: skhunPath,
        pasFoto: pasFotoPath,

        status: 'Pending'
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil!',
        data: {
          registrationNumber: registration.registrationNumber,
          id: registration.id
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating PPDB registration:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to create registration', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get all registrations (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jalur = searchParams.get('jalur')
    const status = searchParams.get('status')

    const where: any = {}

    if (jalur) where.jalur = jalur
    if (status) where.status = status

    const registrations = await prisma.pPDBRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(registrations, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching PPDB registrations:', error)

    return NextResponse.json({ error: 'Failed to fetch registrations', details: error.message }, { status: 500 })
  }
}
