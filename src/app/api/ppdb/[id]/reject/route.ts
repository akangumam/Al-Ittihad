import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// PUT - Reject PPDB
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const body = await request.json()

    // Get PPDB registration
    const ppdb = await prisma.pPDBRegistration.findUnique({
      where: { id }
    })

    if (!ppdb) {
      return NextResponse.json({ success: false, error: 'PPDB registration not found' }, { status: 404 })
    }

    if (ppdb.status !== 'Pending' && ppdb.status !== 'Verified') {
      return NextResponse.json({ success: false, error: 'PPDB sudah diproses sebelumnya' }, { status: 400 })
    }

    // Update PPDB status to Rejected
    await prisma.pPDBRegistration.update({
      where: { id },
      data: {
        status: 'Rejected',
        reviewNote: body.reviewNote || 'Pendaftaran ditolak'
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'PPDB berhasil ditolak'
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error rejecting PPDB:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to reject PPDB', details: error.message },
      { status: 500 }
    )
  }
}
