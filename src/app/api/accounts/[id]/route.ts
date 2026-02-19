import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import prisma from '@/lib/prisma'
import { logActivity } from '@/utils/activityLogger'

// GET - Get single account by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const account = await prisma.bankAccount.findUnique({
      where: { id }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json(account, { status: 200 })
  } catch (error: any) {
    console.error(`Error fetching account ${id}:`, error)

    return NextResponse.json({ error: 'Failed to fetch account', details: error.message }, { status: 500 })
  }
}

// PUT - Update account
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    const body = await request.json()

    // Remove protected fields
    delete body.id
    delete body.createdAt
    delete body.updatedAt

    const account = await prisma.bankAccount.update({
      where: { id },
      data: body
    })

    return NextResponse.json(account, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating account ${id}:`, error)

    return NextResponse.json({ error: 'Failed to update account', details: error.message }, { status: 500 })
  }
}

// DELETE - Delete account
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  try {
    // Fetch account for logging
    const account = await prisma.bankAccount.findUnique({
      where: { id }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.bankAccount.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      activityType: 'BANK_ACCOUNT_DELETE',
      description: `Menghapus akun bank: ${account.bankName} - ${account.accountNumber} (${account.accountName})`,
      metadata: { accountId: id, bankName: account.bankName, accountNumber: account.accountNumber }
    })

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error(`Error deleting account ${id}:`, error)

    await logActivity({
      activityType: 'BANK_ACCOUNT_DELETE',
      description: `Gagal menghapus akun bank dengan ID: ${id}`,
      metadata: { error: error.message, accountId: id },
      status: 'failed'
    })

    return NextResponse.json({ error: 'Failed to delete account', details: error.message }, { status: 500 })
  }
}
