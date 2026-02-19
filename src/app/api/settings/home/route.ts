import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

// GET - Retrieve home settings
export async function GET() {
  try {
    // Get first (or only) home settings record
    // @ts-ignore - homeSettings will be available after prisma generate
    let homeSettings = await prisma.homeSettings.findFirst()

    // If no settings exist, create default
    if (!homeSettings) {
      // @ts-ignore
      homeSettings = await prisma.homeSettings.create({
        data: {
          heroTitle: 'Selamat Datang di Al-Ittihad',
          heroSubtitle: 'Sekolah Unggulan Berkarakter Islami',
          schoolName: 'Al-Ittihad'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: homeSettings
    })
  } catch (error) {
    console.error('Error fetching home settings:', error)

    return NextResponse.json({ success: false, error: 'Failed to fetch home settings' }, { status: 500 })
  }
}

// PUT - Update home settings (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Get existing settings or create new
    // @ts-ignore
    let homeSettings = await prisma.homeSettings.findFirst()

    if (homeSettings) {
      // Update existing
      // @ts-ignore
      homeSettings = await prisma.homeSettings.update({
        where: { id: homeSettings.id },
        data: {
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          heroDescription: data.heroDescription,
          heroImage: data.heroImage,
          principalName: data.principalName,
          principalTitle: data.principalTitle,
          principalPhoto: data.principalPhoto,
          principalMessage: data.principalMessage,
          aboutTitle: data.aboutTitle,
          aboutDescription: data.aboutDescription,
          aboutImage: data.aboutImage,
          schoolName: data.schoolName,
          schoolAddress: data.schoolAddress,
          schoolPhone: data.schoolPhone,
          schoolEmail: data.schoolEmail,
          schoolWebsite: data.schoolWebsite,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          twitterUrl: data.twitterUrl,
          youtubeUrl: data.youtubeUrl
        }
      })
    } else {
      // Create new
      // @ts-ignore
      homeSettings = await prisma.homeSettings.create({
        data: {
          heroTitle: data.heroTitle || 'Selamat Datang di Al-Ittihad',
          heroSubtitle: data.heroSubtitle,
          heroDescription: data.heroDescription,
          heroImage: data.heroImage,
          principalName: data.principalName,
          principalTitle: data.principalTitle,
          principalPhoto: data.principalPhoto,
          principalMessage: data.principalMessage,
          aboutTitle: data.aboutTitle,
          aboutDescription: data.aboutDescription,
          aboutImage: data.aboutImage,
          schoolName: data.schoolName || 'Al-Ittihad',
          schoolAddress: data.schoolAddress,
          schoolPhone: data.schoolPhone,
          schoolEmail: data.schoolEmail,
          schoolWebsite: data.schoolWebsite,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          twitterUrl: data.twitterUrl,
          youtubeUrl: data.youtubeUrl
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: homeSettings,
      message: 'Home settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating home settings:', error)

    return NextResponse.json({ success: false, error: 'Failed to update home settings' }, { status: 500 })
  }
}
