/**
 * Priority-Based Fee Payment Service
 *
 * This service handles automatic payment allocation based on component priority.
 * Based on meeting requirements 2026-01-17:
 * - No SPP (monthly tuition)
 * - Registration Fee + Annual Re-registration Fee
 * - Priority-based installment allocation
 *
 * See PAYMENT_SYSTEM_REDESIGN.md for full documentation
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PaymentAllocationResult {
  success: boolean
  paymentId?: string
  allocations: ComponentAllocationDetail[]
  totalAllocated: number
  remainingBalance: number
  message: string
}

export interface ComponentAllocationDetail {
  componentId: string
  componentName: string
  priority: number
  amountDue: number
  previouslyPaid: number
  allocatedNow: number
  remainingAfter: number
  isFullyPaid: boolean
}

/**
 * Process a payment and automatically allocate to components based on priority
 *
 * @param studentFeeId - The StudentFeeNew ID
 * @param paymentAmount - Amount being paid
 * @param paymentData - Payment metadata (date, method, account, etc.)
 * @returns PaymentAllocationResult with breakdown
 */
export async function processPaymentWithAllocation(
  studentFeeId: string,
  paymentAmount: number,
  paymentData: {
    paymentDate: string
    paymentMethod: string
    account: string
    receiptNo: string
    notes?: string
    paidBy?: string
  }
): Promise<PaymentAllocationResult> {
  try {
    // 1. Fetch StudentFee with template and components, ordered by priority
    const studentFee = await prisma.studentFeeNew.findUnique({
      where: { id: studentFeeId },
      include: {
        student: true,
        template: {
          include: {
            components: {
              where: { isActive: true },
              orderBy: { priority: 'asc' } // Priority 1 first
            }
          }
        },
        allocations: {
          include: {
            component: true
          }
        }
      }
    })

    if (!studentFee) {
      return {
        success: false,
        allocations: [],
        totalAllocated: 0,
        remainingBalance: 0,
        message: 'Student fee not found'
      }
    }

    // 2. Validate payment amount doesn't exceed remaining balance
    const currentRemaining = studentFee.totalAmount - studentFee.paidAmount

    if (paymentAmount > currentRemaining) {
      return {
        success: false,
        allocations: [],
        totalAllocated: 0,
        remainingBalance: currentRemaining,
        message: `Payment amount (${paymentAmount}) exceeds remaining balance (${currentRemaining}). Cannot overpay.`
      }
    }

    // 3. Calculate component balances
    const componentBalances: ComponentAllocationDetail[] = studentFee.template.components.map((component: any) => {
      // Sum all previous allocations for this component
      const previouslyPaid = studentFee.allocations
        .filter((a: any) => a.componentId === component.id)
        .reduce((sum: number, a: any) => sum + a.amount, 0)

      return {
        componentId: component.id,
        componentName: component.name,
        priority: component.priority,
        amountDue: component.amount,
        previouslyPaid,
        allocatedNow: 0,
        remainingAfter: component.amount - previouslyPaid,
        isFullyPaid: previouslyPaid >= component.amount
      }
    })

    // 4. Allocate payment to components based on priority
    let remainingPayment = paymentAmount
    const allocations: ComponentAllocationDetail[] = []

    for (const component of componentBalances) {
      if (remainingPayment <= 0) break
      if (component.isFullyPaid) continue // Skip already paid components

      // Allocate as much as possible to this component
      const allocatedAmount = Math.min(remainingPayment, component.remainingAfter)

      component.allocatedNow = allocatedAmount
      component.remainingAfter -= allocatedAmount
      component.isFullyPaid = component.remainingAfter === 0

      allocations.push(component)
      remainingPayment -= allocatedAmount
    }

    // 5. Create payment record and allocations in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create payment record
      const payment = await tx.feePaymentNew.create({
        data: {
          studentFeeId,
          studentId: studentFee.studentId,
          amount: paymentAmount,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          account: paymentData.account,
          receiptNo: paymentData.receiptNo,
          notes: paymentData.notes,
          paidBy: paymentData.paidBy
        }
      })

      // Create component allocations
      const allocationRecords = allocations.map(alloc => ({
        paymentId: payment.id,
        studentFeeId,
        componentId: alloc.componentId,
        componentName: alloc.componentName,
        componentPriority: alloc.priority,
        amount: alloc.allocatedNow
      }))

      await tx.componentAllocation.createMany({
        data: allocationRecords
      })

      // Update StudentFee totals
      const newPaidAmount = studentFee.paidAmount + paymentAmount
      const newStatus = newPaidAmount >= studentFee.totalAmount ? 'LUNAS' : 'CICILAN'

      await tx.studentFeeNew.update({
        where: { id: studentFeeId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus
        }
      })

      // 3. Create corresponding Income record
      await tx.income.create({
        data: {
          date: paymentData.paymentDate,
          category: 'Biaya Sekolah',
          description: `Pembayaran ${studentFee.template.name} - ${studentFee.student.name}`,
          amount: paymentAmount,
          account: paymentData.account,
          paymentMethod: paymentData.paymentMethod,
          referenceNo: paymentData.receiptNo
        }
      })

      // 4. Update BankAccount balance
      await tx.bankAccount.update({
        where: { id: paymentData.account },
        data: {
          balance: {
            increment: paymentAmount
          }
        }
      })

      return payment
    })

    return {
      success: true,
      paymentId: result.id,
      allocations: componentBalances,
      totalAllocated: paymentAmount,
      remainingBalance: currentRemaining - paymentAmount,
      message: 'Payment processed successfully'
    }
  } catch (error) {
    console.error('Error processing payment:', error)

    return {
      success: false,
      allocations: [],
      totalAllocated: 0,
      remainingBalance: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Get payment breakdown for a student fee
 * Shows which components are paid, partially paid, or unpaid
 */
export async function getStudentFeeBreakdown(studentFeeId: string) {
  const studentFee = await prisma.studentFeeNew.findUnique({
    where: { id: studentFeeId },
    include: {
      student: true,
      template: {
        include: {
          components: {
            where: { isActive: true },
            orderBy: { priority: 'asc' }
          }
        }
      },
      allocations: {
        include: {
          component: true
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!studentFee) {
    return null
  }

  // Calculate breakdown per component
  const componentBreakdown = studentFee.template.components.map((component: any) => {
    const paidAmount = studentFee.allocations
      .filter((a: any) => a.componentId === component.id)
      .reduce((sum: number, a: any) => sum + a.amount, 0)

    const remaining = component.amount - paidAmount
    const percentage = (paidAmount / component.amount) * 100

    return {
      id: component.id,
      name: component.name,
      priority: component.priority,
      amount: component.amount,
      paidAmount,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      status: remaining === 0 ? 'LUNAS' : paidAmount > 0 ? 'CICILAN' : 'BELUM_BAYAR'
    }
  })

  return {
    studentFee: {
      id: studentFee.id,
      student: {
        id: studentFee.student.id,
        nis: studentFee.student.nis,
        name: studentFee.student.name,
        grade: studentFee.student.grade,
        class: studentFee.student.class
      },
      template: {
        id: studentFee.template.id,
        name: studentFee.template.name,
        type: studentFee.template.type,
        academicYear: studentFee.template.academicYear
      },
      totalAmount: studentFee.totalAmount,
      paidAmount: studentFee.paidAmount,
      remaining: studentFee.totalAmount - studentFee.paidAmount,
      status: studentFee.status
    },
    componentBreakdown,
    paymentHistory: studentFee.payments.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      receiptNo: payment.receiptNo,
      paidBy: payment.paidBy,
      notes: payment.notes
    }))
  }
}

/**
 * Simulate payment allocation without actually saving
 * Useful for preview/what-if scenarios
 */
export async function simulatePaymentAllocation(
  studentFeeId: string,
  paymentAmount: number
): Promise<ComponentAllocationDetail[]> {
  const studentFee = await prisma.studentFeeNew.findUnique({
    where: { id: studentFeeId },
    include: {
      template: {
        include: {
          components: {
            where: { isActive: true },
            orderBy: { priority: 'asc' }
          }
        }
      },
      allocations: true
    }
  })

  if (!studentFee) {
    return []
  }

  // Calculate component balances
  const componentBalances: ComponentAllocationDetail[] = studentFee.template.components.map((component: any) => {
    const previouslyPaid = studentFee.allocations
      .filter((a: any) => a.componentId === component.id)
      .reduce((sum: number, a: any) => sum + a.amount, 0)

    return {
      componentId: component.id,
      componentName: component.name,
      priority: component.priority,
      amountDue: component.amount,
      previouslyPaid,
      allocatedNow: 0,
      remainingAfter: component.amount - previouslyPaid,
      isFullyPaid: previouslyPaid >= component.amount
    }
  })

  // Simulate allocation
  let remainingPayment = paymentAmount

  for (const component of componentBalances) {
    if (remainingPayment <= 0) break
    if (component.isFullyPaid) continue

    const allocatedAmount = Math.min(remainingPayment, component.remainingAfter)

    component.allocatedNow = allocatedAmount
    component.remainingAfter -= allocatedAmount
    component.isFullyPaid = component.remainingAfter === 0

    remainingPayment -= allocatedAmount
  }

  return componentBalances
}

const feeAllocationService = {
  processPaymentWithAllocation,
  getStudentFeeBreakdown,
  simulatePaymentAllocation
}

export default feeAllocationService
