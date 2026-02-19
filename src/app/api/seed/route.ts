import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

/**
 * API endpoint to seed initial data to database
 * This creates default categories, academic years, and accounts
 */
export async function POST() {
  try {
    // const body = await request.json()
    // const { includeTestData = false } = body

    const result = await prisma.$transaction(async tx => {
      // Create default categories
      const categories = await tx.transactionCategory.createMany({
        data: [
          { id: 'CAT-001', name: 'SPP', type: 'Pemasukan', description: 'Pembayaran SPP Siswa', isActive: true },
          {
            id: 'CAT-002',
            name: 'Donasi',
            type: 'Pemasukan',
            description: 'Donasi dari orang tua/wali',
            isActive: true
          },
          {
            id: 'CAT-003',
            name: 'Dana BOS',
            type: 'Pemasukan',
            description: 'Bantuan Operasional Sekolah',
            isActive: true
          },
          { id: 'CAT-004', name: 'Lain-lain', type: 'Pemasukan', description: 'Pemasukan lainnya', isActive: true },
          {
            id: 'CAT-101',
            name: 'Gaji Guru',
            type: 'Pengeluaran',
            description: 'Pembayaran gaji guru',
            isActive: true
          },
          {
            id: 'CAT-102',
            name: 'ATK',
            type: 'Pengeluaran',
            description: 'Alat Tulis Kantor',
            isActive: true
          },
          { id: 'CAT-103', name: 'Listrik', type: 'Pengeluaran', description: 'Tagihan listrik', isActive: true },
          { id: 'CAT-104', name: 'Air', type: 'Pengeluaran', description: 'Tagihan air', isActive: true },
          {
            id: 'CAT-105',
            name: 'Pemeliharaan',
            type: 'Pengeluaran',
            description: 'Pemeliharaan gedung dan fasilitas',
            isActive: true
          },
          {
            id: 'CAT-106',
            name: 'Lain-lain',
            type: 'Pengeluaran',
            description: 'Pengeluaran lainnya',
            isActive: true
          }
        ]
      })

      // Create default bank accounts
      const accounts = await tx.bankAccount.createMany({
        data: [
          {
            id: 'ACC-001',
            accountName: 'Kas Sekolah',
            accountNumber: 'KAS-001',
            bankName: 'Kas',
            accountType: 'Kas',
            balance: 0,
            isActive: true
          },
          {
            id: 'ACC-002',
            accountName: 'Bank BRI - Operasional',
            accountNumber: '1234567890',
            bankName: 'BRI',
            accountType: 'Bank',
            balance: 0,
            isActive: true
          },
          {
            id: 'ACC-003',
            accountName: 'Bank Mandiri - Dana BOS',
            accountNumber: '0987654321',
            bankName: 'Mandiri',
            accountType: 'Bank',
            balance: 0,
            isActive: true
          }
        ]
      })

      // Create default academic year
      const academicYears = await tx.academicYear.createMany({
        data: [
          {
            id: 'AY-001',
            name: '2024/2025',
            startDate: '2024-07-01',
            endDate: '2025-06-30',
            isActive: true
          },
          {
            id: 'AY-002',
            name: '2025/2026',
            startDate: '2025-07-01',
            endDate: '2026-06-30',
            isActive: false
          }
        ]
      })

      // Create default SPP rates
      const sppRates = await tx.sPPRate.createMany({
        data: [
          { grade: '7', amount: 250000, academicYear: '2024/2025', isActive: true },
          { grade: '8', amount: 275000, academicYear: '2024/2025', isActive: true },
          { grade: '9', amount: 300000, academicYear: '2024/2025', isActive: true }
        ]
      })

      return {
        categories: categories.count,
        accounts: accounts.count,
        academicYears: academicYears.count,
        sppRates: sppRates.count
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Initial data seeded successfully',
        results: result
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error seeding data:', error)

    return NextResponse.json({ error: 'Failed to seed data', details: error.message }, { status: 500 })
  }
}

// GET - Check if data already exists
export async function GET() {
  try {
    const counts = {
      students: await prisma.student.count(),
      classes: await prisma.class.count(),
      teachers: await prisma.teacher.count(),
      categories: await prisma.transactionCategory.count(),
      accounts: await prisma.bankAccount.count(),
      academicYears: await prisma.academicYear.count(),
      sppRates: await prisma.sPPRate.count(),
      incomes: await prisma.income.count(),
      expenses: await prisma.expense.count(),
      sppPayments: await prisma.sPPPayment.count()
    }

    return NextResponse.json(
      {
        counts,
        isEmpty: Object.values(counts).every(count => count === 0)
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error checking data:', error)

    return NextResponse.json({ error: 'Failed to check data', details: error.message }, { status: 500 })
  }
}
