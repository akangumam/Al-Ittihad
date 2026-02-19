import { NextResponse } from 'next/server'

import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { verifyResetToken, consumeResetToken } from '@/lib/tokens'
import { sendPasswordChangedEmail } from '@/lib/email'
import { logActivity } from '@/utils/activityLogger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token dan password wajib diisi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Verify token
    const userId = await verifyResetToken(token)

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah kadaluarsa' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // Consume (delete) the token
    await consumeResetToken(token)

    // Send confirmation email
    if (user.email) {
      await sendPasswordChangedEmail(user.email, user.name || 'User')
    }

    // Log activity
    await logActivity({
      activityType: 'PASSWORD_RESET',
      description: `Password berhasil direset untuk: ${user.email || user.name}`,
      metadata: { userId, email: user.email }
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah. Silakan login dengan password baru Anda.'
    })
  } catch (error: any) {
    console.error('Error in reset password:', error)

    await logActivity({
      activityType: 'PASSWORD_RESET',
      description: 'Gagal reset password',
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 })
  }
}
