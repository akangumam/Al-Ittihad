import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format data for profile page
    const profileData = {
      profileHeader: {
        fullName: user.name || 'User',
        designation: 'Member',
        designationIcon: 'ri-palette-line',
        location: 'Indonesia',
        joiningDate: 'January 2024',
        profileImg: user.image || '/images/avatars/1.png',
        coverImg: '/images/pages/profile-banner.png'
      },
      users: {
        profile: {
          about: [
            { property: 'Full Name', value: user.name || 'User', icon: 'ri-user-3-line' },
            { property: 'Status', value: 'active', icon: 'ri-check-line' },
            { property: 'Role', value: 'Member', icon: 'ri-star-smile-line' },
            { property: 'Country', value: 'Indonesia', icon: 'ri-flag-line' },
            { property: 'Language', value: 'Indonesian', icon: 'ri-translate-2' }
          ],
          contacts: [{ property: 'Email', value: user.email || '', icon: 'ri-mail-open-line' }],
          teams: [],
          overview: [],
          connections: [],
          teamsTech: [],
          projectTable: []
        },
        teams: [],
        projects: [],
        connections: []
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching user profile:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
