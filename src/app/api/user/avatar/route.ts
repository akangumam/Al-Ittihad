import { existsSync } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only images are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `avatar-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filepath, buffer)

    // Generate public URL
    const fileUrl = `/uploads/avatars/${filename}`

    // Update user's image in database - upsert if user doesn't exist
    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: { image: fileUrl },
      create: {
        email: session.user.email,
        name: session.user.name || 'Admin User',
        image: fileUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      url: fileUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)

    return NextResponse.json({ success: false, error: 'Failed to upload avatar' }, { status: 500 })
  }
}
