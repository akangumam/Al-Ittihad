import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { logActivity } from '@/utils/activityLogger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success even if user not found (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset password telah dikirim'
      })
    }

    // Create reset token
    const token = await createPasswordResetToken(user.id)

    // Send email
    const emailResult = await sendPasswordResetEmail(email, user.name || 'User', token)

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)

      return NextResponse.json({ error: 'Gagal mengirim email. Silakan coba lagi.' }, { status: 500 })
    }

    // Log activity
    await logActivity({
      activityType: 'PASSWORD_RESET_REQUEST',
      description: `Request reset password untuk: ${email}`,
      metadata: { email, userId: user.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda'
    })
  } catch (error: any) {
    console.error('Error in forgot password:', error)

    await logActivity({
      activityType: 'PASSWORD_RESET_REQUEST',
      description: 'Gagal request reset password',
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 })
  }
}
