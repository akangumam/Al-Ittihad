/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */

'use server'

// React Imports
import { cache } from 'react'

// Next Imports
import { getServerSession } from 'next-auth'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as faqData } from '@/fake-db/pages/faq'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'

// Auth & Prisma Imports
import { authOptions } from '@/libs/auth'
import { prisma } from '@/lib/prisma'

export const getEcommerceData = cache(async () => {
  return eCommerceData
})

export const getAcademyData = cache(async () => {
  return academyData
})

export const getLogisticsData = cache(async () => {
  return vehicleData
})

export const getInvoiceData = cache(async () => {
  return invoiceData
})

export const getUserData = cache(async () => {
  try {
    const users = await prisma.user.findMany()

    // Map database users to the format expected by the UI
    return users.map(user => ({
      id: user.id,
      fullName: user.name || 'User Tanpa Nama',
      username: user.email ? user.email.split('@')[0] : 'pengguna',
      email: user.email || '',
      role: (user.role || 'subscriber').toLowerCase(),
      avatar: user.image || '',
      currentPlan: 'Enterprise',
      status: 'active',
      company: user.organization || 'MTs Al-Ittihad',
      country: 'Indonesia',
      contact: user.phoneNumber || ''
    }))
  } catch (error) {
    console.error('Error fetching real users:', error)

    return userData // Fallback ke data dummy jika database bermasalah
  }
})

export const getPermissionsData = cache(async () => {
  return permissionData
})

export const getProfileData = cache(async () => {
  // Get session and fetch user from database
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      // No session, return fake data
      return profileData
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      // User not found, return fake data
      return profileData
    }

    // Format data for profile page with real user data
    return {
      profileHeader: {
        fullName: user.name || 'User',
        designation: user.role || 'Member',
        designationIcon: 'ri-palette-line',
        location: [user.city, user.province].filter(Boolean).join(', ') || 'Indonesia',
        joiningDate: user.emailVerified
          ? new Date(user.emailVerified).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
          : 'Member Al-Ittihad',
        profileImg: user.image || '/images/avatars/1.png',
        coverImg: '/images/pages/profile-banner.png'
      },
      users: {
        profile: {
          about: [
            { property: 'Full Name', value: user.name || 'User', icon: 'ri-user-3-line' },
            { property: 'Status', value: 'active', icon: 'ri-check-line' },
            { property: 'Role', value: user.role || 'Member', icon: 'ri-star-smile-line' },
            { property: 'City', value: user.city || '-', icon: 'ri-map-pin-line' },
            { property: 'Province', value: user.province || '-', icon: 'ri-flag-line' }
          ],
          contacts: [
            { property: 'Email', value: user.email || '', icon: 'ri-mail-open-line' },
            ...(user.phoneNumber ? [{ property: 'Phone', value: user.phoneNumber, icon: 'ri-phone-line' }] : []),
            ...(user.address
              ? [
                  {
                    property: 'Address',
                    value: [
                      user.address,
                      user.rt && user.rw ? `RT ${user.rt}/RW ${user.rw}` : '',
                      user.kelurahan ? `Kel. ${user.kelurahan}` : '',
                      user.kecamatan ? `Kec. ${user.kecamatan}` : '',
                      user.city || '',
                      user.postalCode || ''
                    ]
                      .filter(Boolean)
                      .join(', '),
                    icon: 'ri-map-pin-2-line'
                  }
                ]
              : [])
          ],
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
  } catch (error) {
    console.error('Error fetching profile data:', error)

    // Fallback to fake data
    return profileData
  }
})

export const getFaqData = cache(async () => {
  return faqData
})

export const getPricingData = cache(async () => {
  return pricingData
})

export const getStatisticsData = cache(async () => {
  return statisticsData
})
