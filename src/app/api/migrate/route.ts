import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

/**
 * API endpoint to migrate data from localStorage to database
 * This endpoint accepts the current localStorage data and saves it to the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      students = [],
      classes = [],
      academicYears = [],
      teachers = [],
      teachingSchedules = [],
      categories = [],
      accounts = [],
      incomes = [],
      expenses = [],
      mutations = [],
      sppRates = [],
      sppPayments = [],
      budgets = []
    } = body

    // Use transaction to ensure all or nothing
    const result = await prisma.$transaction(async tx => {
      // Clear existing data (optional - comment out if you want to keep existing data)
      await tx.student.deleteMany()
      await tx.class.deleteMany()
      await tx.academicYear.deleteMany()
      await tx.teacher.deleteMany()
      await tx.teachingSchedule.deleteMany()
      await tx.transactionCategory.deleteMany()
      await tx.sPPPayment.deleteMany()
      await tx.income.deleteMany()
      await tx.expense.deleteMany()
      await tx.cashMutation.deleteMany()
      await tx.bankAccount.deleteMany()
      await tx.sPPRate.deleteMany()
      await tx.budget.deleteMany()

      // Insert new data
      const results = {
        students: 0,
        classes: 0,
        academicYears: 0,
        teachers: 0,
        teachingSchedules: 0,
        categories: 0,
        accounts: 0,
        incomes: 0,
        expenses: 0,
        mutations: 0,
        sppRates: 0,
        sppPayments: 0,
        budgets: 0
      }

      // Insert accounts first (required by other tables)
      if (accounts.length > 0) {
        await tx.bankAccount.createMany({
          data: accounts
        })
        results.accounts = accounts.length
      }

      // Insert students
      if (students.length > 0) {
        await tx.student.createMany({
          data: students
        })
        results.students = students.length
      }

      // Insert classes
      if (classes.length > 0) {
        await tx.class.createMany({
          data: classes.map((c: any) => ({
            ...c,
            id: c.id || undefined // Let Prisma generate if not provided
          }))
        })
        results.classes = classes.length
      }

      // Insert academic years
      if (academicYears.length > 0) {
        await tx.academicYear.createMany({
          data: academicYears
        })
        results.academicYears = academicYears.length
      }

      // Insert teachers
      if (teachers.length > 0) {
        await tx.teacher.createMany({
          data: teachers
        })
        results.teachers = teachers.length
      }

      // Insert teaching schedules
      if (teachingSchedules.length > 0) {
        for (const schedule of teachingSchedules) {
          await tx.teachingSchedule.create({
            data: schedule
          })
        }

        results.teachingSchedules = teachingSchedules.length
      }

      // Insert categories
      if (categories.length > 0) {
        await tx.transactionCategory.createMany({
          data: categories
        })
        results.categories = categories.length
      }

      // Insert budgets
      if (budgets.length > 0) {
        await tx.budget.createMany({
          data: budgets
        })
        results.budgets = budgets.length
      }

      // Insert incomes
      if (incomes.length > 0) {
        for (const income of incomes) {
          await tx.income.create({
            data: income
          })
        }

        results.incomes = incomes.length
      }

      // Insert expenses
      if (expenses.length > 0) {
        for (const expense of expenses) {
          await tx.expense.create({
            data: expense
          })
        }

        results.expenses = expenses.length
      }

      // Insert mutations
      if (mutations.length > 0) {
        for (const mutation of mutations) {
          await tx.cashMutation.create({
            data: mutation
          })
        }

        results.mutations = mutations.length
      }

      // Insert SPP rates
      if (sppRates.length > 0) {
        await tx.sPPRate.createMany({
          data: sppRates
        })
        results.sppRates = sppRates.length
      }

      // Insert SPP payments
      if (sppPayments.length > 0) {
        for (const payment of sppPayments) {
          await tx.sPPPayment.create({
            data: payment
          })
        }

        results.sppPayments = sppPayments.length
      }

      return results
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Data migrated successfully',
        results: result
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error migrating data:', error)
    
return NextResponse.json({ error: 'Failed to migrate data', details: error.message }, { status: 500 })
  }
}
