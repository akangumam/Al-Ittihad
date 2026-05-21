/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'
import { createWelcomeToken } from '@/lib/tokens'
import { sendWelcomeEmail } from '@/lib/email'
import { db } from '@/fake-db/apps/userList'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  return NextResponse.json(db)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { fullName, username, email, password, role, status } = body

    // Validasi data
    if (!fullName || !username || !password) {
      return NextResponse.json({ error: 'Nama lengkap, username, dan password wajib diisi' }, { status: 400 })
    }

    // Cek apakah email sudah terdaftar (jika email diisi)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: email || `${username}@internal.local`,
        password: hashedPassword

        // Note: username, role, status might need to be handled based on your schema
      }
    })

    // Log aktivitas
    await logActivity({
      activityType: 'USER_CREATE',
      description: `Menambahkan pengguna baru: ${fullName}`,
      metadata: { userId: newUser.id, username, name: fullName }
    })

    // Kirim welcome email dengan link set password (jika email valid)
    if (email && !email.includes('@internal.local')) {
      try {
        const welcomeToken = await createWelcomeToken(newUser.id)

        await sendWelcomeEmail(email, fullName, username, welcomeToken)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)

        // Don't fail the user creation if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pengguna berhasil ditambahkan',
        user: {
          id: newUser.id,
          fullName: newUser.name,
          username: username,
          email: email || '',
          role: role || 'subscriber',
          currentPlan: 'basic',
          status: status || 'active',
          avatar: ''
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating user:', error)

    await logActivity({
      activityType: 'USER_CREATE',
      description: 'Gagal menambahkan pengguna baru',
      metadata: { error: error.message },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Gagal menambahkan pengguna' }, { status: 500 })
  }
}
