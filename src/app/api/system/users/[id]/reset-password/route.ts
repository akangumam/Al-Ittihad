import { NextResponse } from 'next/server'

import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/libs/auth'
import { logActivity } from '@/utils/activityLogger'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admin can reset other users' passwords
  if ((session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang dapat mereset password pengguna lain' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    await logActivity({
      activityType: 'PASSWORD_RESET',
      description: `Admin mereset password untuk pengguna: ${user.name || user.email}`,
      metadata: { targetUserId: id, adminId: session.user?.id }
    })

    return NextResponse.json({ success: true, message: 'Password berhasil direset' })
  } catch (error: any) {
    console.error('Error resetting password:', error)

    return NextResponse.json({ error: 'Gagal mereset password' }, { status: 500 })
  }
}
