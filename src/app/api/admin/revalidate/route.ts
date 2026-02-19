// API for ISR revalidation
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { path, paths } = body

    // Revalidate single path
    if (path) {
      revalidatePath(path)
    }

    // Revalidate multiple paths
    if (paths && Array.isArray(paths)) {
      paths.forEach((p: string) => {
        revalidatePath(p)
      })
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      message: 'Cache cleared successfully. Website will update shortly.',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Revalidation error:', error)

    return NextResponse.json(
      {
        success: false,
        message: `Revalidation failed: ${error.message}`
      },
      { status: 500 }
    )
  }
}
