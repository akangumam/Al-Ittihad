import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

// GET - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert user - create if doesn't exist
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || 'Admin User',
        image: session.user.image || '/images/avatars/1.png'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        phoneNumber: true,
        address: true,
        rt: true,
        rw: true,
        kelurahan: true,
        kecamatan: true,
        city: true,
        province: true,
        postalCode: true,
        role: true,
        organization: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)

    return NextResponse.json({ success: false, error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const {
      name,
      image,
      phoneNumber,
      address,
      rt,
      rw,
      kelurahan,
      kecamatan,
      city,
      province,
      postalCode,
      organization
    } = data

    // Upsert user - create if doesn't exist, update if exists
    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: name || undefined,
        image: image || undefined,
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        rt: rt || undefined,
        rw: rw || undefined,
        kelurahan: kelurahan || undefined,
        kecamatan: kecamatan || undefined,
        city: city || undefined,
        province: province || undefined,
        postalCode: postalCode || undefined,
        organization: organization || undefined
      },
      create: {
        email: session.user.email,
        name: name || session.user.name || 'Admin User',
        image: image || session.user.image || '/images/avatars/1.png',
        phoneNumber: phoneNumber || null,
        address: address || null,
        rt: rt || null,
        rw: rw || null,
        kelurahan: kelurahan || null,
        kecamatan: kecamatan || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        organization: organization || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
        address: true,
        rt: true,
        rw: true,
        kelurahan: true,
        kecamatan: true,
        city: true,
        province: true,
        postalCode: true,
        role: true,
        organization: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating user profile:', error)

    return NextResponse.json({ success: false, error: 'Failed to update user profile' }, { status: 500 })
  }
}
