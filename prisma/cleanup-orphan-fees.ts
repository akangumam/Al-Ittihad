import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOrphanFees() {
  console.log('🔍 Memeriksa data orphan...\n')

  try {
    // 1. Get all student IDs
    const students = await prisma.student.findMany({
      select: { id: true }
    })

    const studentIds = students.map(s => s.id)

    console.log(`✅ Jumlah siswa aktif: ${studentIds.length}\n`)

    // 2. Cek StudentFee (old system) yang tidak memiliki student
    const orphanStudentFees = await prisma.studentFee.findMany({
      where: {
        studentId: {
          notIn: studentIds
        }
      }
    })

    console.log(`❌ StudentFee (old) orphan: ${orphanStudentFees.length} records`)

    // 3. Cek StudentFeeNew yang tidak memiliki student
    const orphanStudentFeesNew = await prisma.studentFeeNew.findMany({
      where: {
        studentId: {
          notIn: studentIds
        }
      }
    })

    console.log(`❌ StudentFeeNew orphan: ${orphanStudentFeesNew.length} records`)

    // 4. Cek FeePayment (old) yang tidak memiliki student
    const orphanFeePayments = await prisma.feePayment.findMany({
      where: {
        studentId: {
          notIn: studentIds
        }
      }
    })

    console.log(`❌ FeePayment (old) orphan: ${orphanFeePayments.length} records`)

    // 5. Cek FeePaymentNew yang tidak memiliki student
    const orphanFeePaymentsNew = await prisma.feePaymentNew.findMany({
      where: {
        studentId: {
          notIn: studentIds
        }
      }
    })

    console.log(`❌ FeePaymentNew orphan: ${orphanFeePaymentsNew.length} records`)

    // 6. Cek SPPPayment yang tidak memiliki student
    const orphanSPPPayments = await prisma.sPPPayment.findMany({
      where: {
        studentId: {
          notIn: studentIds
        }
      }
    })

    console.log(`❌ SPPPayment orphan: ${orphanSPPPayments.length} records\n`)

    const totalOrphans =
      orphanStudentFees.length +
      orphanStudentFeesNew.length +
      orphanFeePayments.length +
      orphanFeePaymentsNew.length +
      orphanSPPPayments.length

    if (totalOrphans === 0) {
      console.log('✅ Tidak ada data orphan ditemukan!')

      return
    }

    console.log(`\n⚠️  Total data orphan: ${totalOrphans} records\n`)
    console.log('🗑️  Membersihkan data orphan...\n')

    // Hapus data orphan dalam transaction
    await prisma.$transaction(async tx => {
      // Delete ComponentAllocations first (has FK to payments)
      if (orphanFeePaymentsNew.length > 0) {
        const deletedAllocations = await tx.componentAllocation.deleteMany({
          where: {
            paymentId: { in: orphanFeePaymentsNew.map(p => p.id) }
          }
        })

        console.log(`  🗑️  ComponentAllocation: ${deletedAllocations.count} deleted`)
      }

      // Delete FeeAllocations (old system)
      if (orphanFeePayments.length > 0) {
        const deletedOldAllocations = await tx.feeAllocation.deleteMany({
          where: {
            paymentId: { in: orphanFeePayments.map(p => p.id) }
          }
        })

        console.log(`  🗑️  FeeAllocation (old): ${deletedOldAllocations.count} deleted`)
      }

      // Delete orphan payments
      if (orphanFeePaymentsNew.length > 0) {
        const deletedPaymentsNew = await tx.feePaymentNew.deleteMany({
          where: { id: { in: orphanFeePaymentsNew.map(p => p.id) } }
        })

        console.log(`  🗑️  FeePaymentNew: ${deletedPaymentsNew.count} deleted`)
      }

      if (orphanFeePayments.length > 0) {
        const deletedPayments = await tx.feePayment.deleteMany({
          where: { id: { in: orphanFeePayments.map(p => p.id) } }
        })

        console.log(`  🗑️  FeePayment (old): ${deletedPayments.count} deleted`)
      }

      if (orphanSPPPayments.length > 0) {
        const deletedSPP = await tx.sPPPayment.deleteMany({
          where: { id: { in: orphanSPPPayments.map(p => p.id) } }
        })

        console.log(`  🗑️  SPPPayment: ${deletedSPP.count} deleted`)
      }

      // Delete orphan fees
      if (orphanStudentFeesNew.length > 0) {
        const deletedFeesNew = await tx.studentFeeNew.deleteMany({
          where: { id: { in: orphanStudentFeesNew.map(f => f.id) } }
        })

        console.log(`  🗑️  StudentFeeNew: ${deletedFeesNew.count} deleted`)
      }

      if (orphanStudentFees.length > 0) {
        const deletedFees = await tx.studentFee.deleteMany({
          where: { id: { in: orphanStudentFees.map(f => f.id) } }
        })

        console.log(`  🗑️  StudentFee (old): ${deletedFees.count} deleted`)
      }
    })

    console.log('\n✅ Data orphan berhasil dibersihkan!')

    // Verifikasi setelah cleanup - need to get fresh student IDs
    console.log('\n🔍 Verifikasi setelah cleanup...')

    const studentsAfter = await prisma.student.findMany({
      select: { id: true }
    })

    const studentIdsAfter = studentsAfter.map(s => s.id)

    const remainingOrphanFees = await prisma.studentFee.count({
      where: {
        studentId: {
          notIn: studentIdsAfter
        }
      }
    })

    const remainingOrphanFeesNew = await prisma.studentFeeNew.count({
      where: {
        studentId: {
          notIn: studentIdsAfter
        }
      }
    })

    console.log(`  StudentFee (old) orphan: ${remainingOrphanFees}`)
    console.log(`  StudentFeeNew orphan: ${remainingOrphanFeesNew}`)

    if (remainingOrphanFees === 0 && remainingOrphanFeesNew === 0) {
      console.log('\n✅ Semua data orphan berhasil dibersihkan!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupOrphanFees()
  .then(() => {
    console.log('\n🎉 Cleanup selesai!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Cleanup gagal:', error)
    process.exit(1)
  })
