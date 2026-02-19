/**
 * Test Script for Priority-Based Payment Allocation
 *
 * This script demonstrates how the installment payment allocation works
 * based on component priorities.
 */

import { PrismaClient } from '@prisma/client'

import { getStudentFeeBreakdown, simulatePaymentAllocation } from '../src/services/feeAllocationService'

const prisma = new PrismaClient()

async function testPaymentAllocation() {
  console.log('🧪 Testing Priority-Based Payment Allocation System\n')
  console.log('='.repeat(80) + '\n')

  try {
    // 1. Find a student to test with
    const student = await prisma.student.findFirst({
      where: { status: 'Aktif' }
    })

    if (!student) {
      console.log('❌ No active student found. Please create a student first.')

      return
    }

    console.log(`👤 Testing with Student: ${student.name} (${student.nis})`)
    console.log(`   Grade: ${student.grade} - Class: ${student.class}\n`)

    // 2. Get registration template
    const template = await prisma.feeTemplate.findFirst({
      where: {
        type: 'REGISTRATION',
        academicYear: '2025/2026',
        isActive: true
      },
      include: {
        components: {
          where: { isActive: true },
          orderBy: { priority: 'asc' }
        }
      }
    })

    if (!template) {
      console.log('❌ No fee template found. Please run seed script first.')
      console.log('   Run: npx tsx prisma/seeds/seedFeeSystem.ts')

      return
    }

    console.log(`📋 Fee Template: ${template.name}`)
    console.log(`   Total components: ${template.components.length}\n`)

    console.log('💰 Fee Breakdown (by priority):')
    const totalAmount = template.components.reduce((sum, c) => sum + c.amount, 0)

    template.components.forEach(comp => {
      console.log(`   [Priority ${comp.priority}] ${comp.name}: Rp ${comp.amount.toLocaleString('id-ID')}`)
    })
    console.log(`   ${'─'.repeat(60)}`)
    console.log(`   TOTAL: Rp ${totalAmount.toLocaleString('id-ID')}\n`)

    // 3. Create or find StudentFee
    let studentFee = await prisma.studentFeeNew.findFirst({
      where: {
        studentId: student.id,
        templateId: template.id,
        academicYear: template.academicYear
      }
    })

    if (!studentFee) {
      console.log('📝 Creating new StudentFee record...')
      studentFee = await prisma.studentFeeNew.create({
        data: {
          studentId: student.id,
          templateId: template.id,
          totalAmount,
          academicYear: template.academicYear,
          status: 'BELUM_LUNAS'
        }
      })
      console.log(`✅ StudentFee created: ${studentFee.id}\n`)
    } else {
      console.log(`ℹ️  Using existing StudentFee: ${studentFee.id}\n`)
    }

    // 4. Get current breakdown
    console.log('📊 Current Payment Status:')
    const currentBreakdown = await getStudentFeeBreakdown(studentFee.id)

    if (currentBreakdown) {
      console.log(`   Total Amount: Rp ${currentBreakdown.studentFee.totalAmount.toLocaleString('id-ID')}`)
      console.log(`   Paid Amount:  Rp ${currentBreakdown.studentFee.paidAmount.toLocaleString('id-ID')}`)
      console.log(`   Remaining:    Rp ${currentBreakdown.studentFee.remaining.toLocaleString('id-ID')}`)
      console.log(`   Status:       ${currentBreakdown.studentFee.status}\n`)
    }

    // 5. Simulate payment scenarios
    console.log('🎯 SCENARIO 1: Simulate payment Rp 200.000')
    console.log('─'.repeat(80))
    const simulation1 = await simulatePaymentAllocation(studentFee.id, 200000)

    console.log('Allocation preview:')
    simulation1.forEach(comp => {
      if (comp.allocatedNow > 0) {
        console.log(`   → ${comp.componentName}: Rp ${comp.allocatedNow.toLocaleString('id-ID')}`)
        console.log(
          `      (Remaining after: Rp ${comp.remainingAfter.toLocaleString('id-ID')} ${comp.isFullyPaid ? '✓ LUNAS' : ''})`
        )
      }
    })
    console.log()

    console.log('🎯 SCENARIO 2: Simulate payment Rp 350.000')
    console.log('─'.repeat(80))
    const simulation2 = await simulatePaymentAllocation(studentFee.id, 350000)

    console.log('Allocation preview:')
    simulation2.forEach(comp => {
      if (comp.allocatedNow > 0) {
        console.log(`   → ${comp.componentName}: Rp ${comp.allocatedNow.toLocaleString('id-ID')}`)
        console.log(
          `      (Remaining after: Rp ${comp.remainingAfter.toLocaleString('id-ID')} ${comp.isFullyPaid ? '✓ LUNAS' : ''})`
        )
      }
    })
    console.log()

    // 6. Ask user if they want to process actual payment
    console.log('💡 To actually process a payment, use:')
    console.log('   processPaymentWithAllocation(studentFeeId, amount, paymentData)')
    console.log()

    // Example: Process actual payment (commented out)
    /*
    console.log('💳 Processing actual payment of Rp 200.000...');
    const bankAccount = await prisma.bankAccount.findFirst({ where: { isActive: true } });
    if (bankAccount) {
      const result = await processPaymentWithAllocation(
        studentFee.id,
        200000,
        {
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Tunai',
          account: bankAccount.id,
          receiptNo: `RCP-TEST-${Date.now()}`,
          notes: 'Test payment from script',
          paidBy: student.parentName
        }
      );

      if (result.success) {
        console.log('✅ Payment processed successfully!');
        console.log(`   Payment ID: ${result.paymentId}`);
        console.log(`   Total Allocated: Rp ${result.totalAllocated.toLocaleString('id-ID')}`);
        console.log(`   Remaining Balance: Rp ${result.remainingBalance.toLocaleString('id-ID')}`);
        console.log('\nAllocation details:');
        result.allocations.forEach(alloc => {
          if (alloc.allocatedNow > 0) {
            console.log(`   - ${alloc.componentName}: Rp ${alloc.allocatedNow.toLocaleString('id-ID')}`);
          }
        });
      } else {
        console.log('❌ Payment failed:', result.message);
      }
    }
    */

    console.log('✅ Test completed!\n')
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testPaymentAllocation()
