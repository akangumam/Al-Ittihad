import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if ((session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang dapat melakukan backup' }, { status: 403 })
  }

  try {
    const [
      students,
      teachers,
      classes,
      academicYears,
      bankAccounts,
      incomes,
      expenses,
      mutations,
      sppRates,
      sppPayments,
      budgets,
      categories,
      users
    ] = await Promise.all([
      prisma.student.findMany(),
      prisma.teacher.findMany(),
      prisma.class.findMany(),
      prisma.academicYear.findMany(),
      prisma.bankAccount.findMany(),
      prisma.income.findMany(),
      prisma.expense.findMany(),
      prisma.cashMutation.findMany(),
      prisma.sPPRate.findMany(),
      prisma.sPPPayment.findMany(),
      prisma.budget.findMany(),
      prisma.transactionCategory.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } })
    ])

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      tables: {
        students,
        teachers,
        classes,
        academicYears,
        bankAccounts,
        incomes,
        expenses,
        cashMutations: mutations,
        sppRates,
        sppPayments,
        budgets,
        categories,
        users
      }
    }

    const json = JSON.stringify(backup, null, 2)
    const filename = `backup-alittihad-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: unknown) {
    console.error('Backup error:', error)

    return NextResponse.json({ error: 'Gagal membuat backup' }, { status: 500 })
  }
}
