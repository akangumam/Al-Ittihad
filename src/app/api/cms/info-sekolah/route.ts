import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

function parseSection(entries: Record<string, { content: string }>, key: string) {
  try {
    return entries[key] ? JSON.parse(entries[key].content) : null
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const rows = await prisma.schoolInfo.findMany()
    const byKey = Object.fromEntries(rows.map(r => [r.key, r]))

    const data = {
      sambutan: parseSection(byKey, 'sambutan'),
      visiMisi: parseSection(byKey, 'visiMisi'),
      sejarah: parseSection(byKey, 'sejarah'),
      kontak: parseSection(byKey, 'kontak')
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch school info' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const sections = [
      { key: 'sambutan', title: 'Sambutan Kepala Sekolah', category: 'profile', data: body.sambutan },
      { key: 'visiMisi', title: 'Visi dan Misi', category: 'profile', data: body.visiMisi },
      { key: 'sejarah', title: 'Sejarah Sekolah', category: 'profile', data: body.sejarah },
      { key: 'kontak', title: 'Kontak Sekolah', category: 'kontak', data: body.kontak }
    ]

    for (const section of sections) {
      if (section.data !== undefined) {
        await prisma.schoolInfo.upsert({
          where: { key: section.key },
          update: { content: JSON.stringify(section.data), title: section.title },
          create: {
            key: section.key,
            title: section.title,
            content: JSON.stringify(section.data),
            category: section.category
          }
        })
      }
    }

    return NextResponse.json({ message: 'School info updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save school info' }, { status: 500 })
  }
}
