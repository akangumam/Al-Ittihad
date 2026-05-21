import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

// PUT - Update category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const body = await request.json()

    delete body.id
    delete body.createdAt
    delete body.updatedAt

    const category = await prisma.transactionCategory.update({ where: { id }, data: body })

    return NextResponse.json(category, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating category:', error)

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const category = await prisma.transactionCategory.findUnique({ where: { id } })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await prisma.transactionCategory.delete({ where: { id } })

    await logActivity({
      activityType: 'TRANSACTION_CATEGORY_DELETE',
      description: `Menghapus kategori transaksi: ${category.name}`,
      metadata: { categoryId: id, name: category.name }
    })

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting category:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await logActivity({
      activityType: 'TRANSACTION_CATEGORY_DELETE',
      description: `Gagal menghapus kategori transaksi dengan ID: ${id}`,
      metadata: { error: msg, categoryId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
