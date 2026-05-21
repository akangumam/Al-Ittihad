import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { requireAuth } from '@/lib/auth-guard'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp'
}

// GET - Serve a private PPDB file (requires auth)
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  try {
    const { path: segments } = await params
    const relativePath = segments.join('/')

    // Prevent path traversal
    if (relativePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'private_uploads', relativePath)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store'
      }
    })
  } catch (error: unknown) {
    console.error('Error serving PPDB file:', error)

    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
