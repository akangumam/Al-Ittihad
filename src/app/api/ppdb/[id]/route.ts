import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// GET - Get PPDB registration by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const ppdb = await prisma.pPDBRegistration.findUnique({
      where: { id }
    })

    if (!ppdb) {
      return NextResponse.json({ error: 'PPDB registration not found' }, { status: 404 })
    }

    return NextResponse.json(ppdb, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching PPDB registration:', error)

    return NextResponse.json({ error: 'Failed to fetch PPDB registration', details: error.message }, { status: 500 })
  }
}
