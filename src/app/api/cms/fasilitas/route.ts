import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    const result = facilities.map(f => ({
      id: f.id,
      nama: f.nama,
      deskripsi: f.deskripsi,
      foto: f.foto ? [f.foto] : [],
      kategori: f.kategori,
      status: f.kondisi === 'Baik' ? 'aktif' : 'maintenance',
      kapasitas: f.kapasitas ? `${f.kapasitas} orang` : null,
      createdAt: f.createdAt.toISOString()
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const kapasitasStr = body.kapasitas as string | undefined
    const kapasitas = kapasitasStr ? parseInt(kapasitasStr.replace(/\D/g, ''), 10) || null : null

    const foto = Array.isArray(body.foto) ? (body.foto[0] ?? null) : (body.foto ?? null)
    const kondisi = body.status === 'maintenance' ? 'Perlu Perbaikan' : 'Baik'

    const facility = await prisma.facility.create({
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        kategori: body.kategori ?? 'Lainnya',
        kapasitas,
        kondisi,
        foto,
        isActive: true
      }
    })

    return NextResponse.json(
      {
        id: facility.id,
        nama: facility.nama,
        deskripsi: facility.deskripsi,
        foto: facility.foto ? [facility.foto] : [],
        kategori: facility.kategori,
        status: facility.kondisi === 'Baik' ? 'aktif' : 'maintenance',
        createdAt: facility.createdAt.toISOString()
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save facility' }, { status: 500 })
  }
}
