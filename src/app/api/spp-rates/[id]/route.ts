import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// PUT: Update SPP rate
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const body = await request.json()

    const updatedRate = await prisma.sPPRate.update({ where: { id }, data: body })

    return NextResponse.json(updatedRate)
  } catch (error: unknown) {
    console.error('Error updating SPP rate:', error)

    return NextResponse.json({ error: 'Failed to update SPP rate' }, { status: 500 })
  }
}

// DELETE: Delete SPP rate
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await props.params

  try {
    const rate = await prisma.sPPRate.findUnique({ where: { id } })

    if (!rate) {
      return NextResponse.json({ error: 'SPP rate not found' }, { status: 404 })
    }

    await prisma.sPPRate.delete({ where: { id } })

    await logActivity({
      activityType: 'SPP_RATE_DELETE',
      description: `Menghapus tarif SPP: ${rate.grade} (${rate.academicYear}) - Rp ${rate.amount.toLocaleString('id-ID')}`,
      metadata: { rateId: id, grade: rate.grade, academicYear: rate.academicYear, amount: rate.amount }
    })

    return NextResponse.json({ message: 'SPP rate deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting SPP rate:', error)

    return NextResponse.json({ error: 'Failed to delete SPP rate' }, { status: 500 })
  }
}
