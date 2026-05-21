import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logActivity } from '@/utils/activityLogger'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const category = await prisma.paymentCategory.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params

  try {
    const body = await request.json()
    const { name, amount, priority, isActive } = body

    const updated = await prisma.paymentCategory.update({
      where: { id },
      data: {
        name,
        amount: amount !== undefined ? Number(amount) : undefined,
        priority: priority !== undefined ? Number(priority) : undefined,
        isActive
      }
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'

  try {
    // Check if category is being used by any student fees
    const usageCount = await prisma.studentFee.count({
      where: { paymentCategoryId: id }
    })

    if (usageCount > 0 && !force) {
      return NextResponse.json(
        {
          error: 'Tidak dapat menghapus kategori',
          message: `Kategori ini sedang digunakan oleh ${usageCount} tagihan siswa.`,
          usageCount,
          canForceDelete: true
        },
        { status: 400 }
      )
    }

    // Fetch category details for logging
    const category = await prisma.paymentCategory.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // If force=true, delete related student fees first (cascade will handle this after migration)
    if (force && usageCount > 0) {
      await prisma.$transaction(async tx => {
        // ... (transaction code)
        const relatedFees = await tx.studentFee.findMany({
          where: { paymentCategoryId: id },
          select: { id: true }
        })

        const feeIds = relatedFees.map(f => f.id)

        if (feeIds.length > 0) {
          await tx.feeAllocation.deleteMany({
            where: { studentFeeId: { in: feeIds } }
          })

          await tx.studentFee.deleteMany({
            where: { paymentCategoryId: id }
          })
        }

        await tx.paymentCategory.delete({
          where: { id }
        })
      })

      // Log activity
      await logActivity({
        activityType: 'PAYMENT_CATEGORY_DELETE',
        description: `Menghapus kategori biaya: ${category.name} (Paksa - Menghapus ${usageCount} tagihan terkait)`,
        metadata: { categoryId: id, name: category.name, force: true, deletedFees: usageCount }
      })

      return NextResponse.json({
        message: 'Category and related fees deleted successfully',
        deletedFees: usageCount
      })
    }

    // Delete the category (no related fees)
    await prisma.paymentCategory.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'PAYMENT_CATEGORY_DELETE',
      description: `Menghapus kategori biaya: ${category.name}`,
      metadata: { categoryId: id, name: category.name, force: false }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting category:', error)

    await logActivity({
      activityType: 'PAYMENT_CATEGORY_DELETE',
      description: `Gagal menghapus kategori biaya dengan ID: ${id}`,
      metadata: { error: error.message, categoryId: id },
      status: 'failed'
    })

    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: error.message
      },
      { status: 500 }
    )
  }
}
