import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'All password fields are required' }, { status: 400 })
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirm password do not match' },
        { status: 400 }
      )
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, password: true }
    })

    if (!user || !user.password) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)

    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 })
  }
}
