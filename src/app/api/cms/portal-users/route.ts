import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.portalUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portal users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const hashedPassword = await bcrypt.hash(body.password || 'ChangeMe123!', 10)

    const user = await prisma.portalUser.create({
      data: {
        username: body.username,
        password: hashedPassword,
        nama: body.fullName ?? body.nama,
        email: body.email ?? null,
        noHp: body.noHp ?? null,
        role: body.role ?? 'viewer',
        isActive: body.status !== 'inactive',
        mustChangePassword: true
      },
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save portal user' }, { status: 500 })
  }
}
