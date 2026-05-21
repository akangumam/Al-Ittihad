import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { authOptions } from '@/libs/auth'
import { logActivity } from '@/utils/activityLogger'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  let id: string | undefined

  try {
    const resolvedParams = await params

    id = resolvedParams.id

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    }

    const body = await request.json()
    const { fullName, username, email } = body

    // Validasi data
    if (!fullName || !username) {
      return NextResponse.json({ error: 'Nama lengkap dan username wajib diisi' }, { status: 400 })
    }

    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: fullName,
        ...(email && { email: email })

        // Note: username, role, status might need to be handled based on your schema
      }
    })

    // Log aktivitas
    await logActivity({
      activityType: 'USER_UPDATE',
      description: `Memperbarui data pengguna: ${fullName}`,
      metadata: { userId: id, email, name: fullName }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Pengguna berhasil diperbarui',
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating user:', error)

    await logActivity({
      activityType: 'USER_UPDATE',
      description: `Gagal memperbarui pengguna dengan ID: ${id || 'unknown'}`,
      metadata: { error: error.message, userId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Gagal memperbarui pengguna' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let id: string | undefined // Declare id outside try block for catch access

  try {
    const resolvedParams = await params

    id = resolvedParams.id

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    }

    // Ambil data user sebelum dihapus untuk logging
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    // Cek apakah user mencoba menghapus diri sendiri
    const session = await getServerSession(authOptions)

    if (session?.user?.id === id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan.' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id }
    })

    // Log aktivitas penghapusan
    await logActivity({
      activityType: 'USER_DELETE',
      description: `Menghapus pengguna: ${user.name || user.email}`,
      metadata: { deletedUserId: id, email: user.email, name: user.name }
    })

    return NextResponse.json({ success: true, message: 'Pengguna berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting user:', error)

    await logActivity({
      activityType: 'USER_DELETE',
      description: `Gagal menghapus pengguna dengan ID: ${id || 'unknown'}`,
      metadata: { error: error.message, deletedUserId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 })
  }
}
