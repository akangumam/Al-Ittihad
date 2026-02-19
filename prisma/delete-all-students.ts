import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllStudents() {
  console.log('🗑️  HAPUS SEMUA DATA SISWA UJICOBA\n')
  console.log('='.repeat(60))

  try {
    // 1. Tampilkan data yang akan dihapus
    console.log('\n📊 Data yang akan dihapus:\n')

    const studentsCount = await prisma.student.count()
    const studentFeesCount = await prisma.studentFee.count()
    const studentFeesNewCount = await prisma.studentFeeNew.count()
    const feePaymentsCount = await prisma.feePayment.count()
    const feePaymentsNewCount = await prisma.feePaymentNew.count()
    const sppPaymentsCount = await prisma.sPPPayment.count()
    const componentAllocationsCount = await prisma.componentAllocation.count()
    const feeAllocationsCount = await prisma.feeAllocation.count()

    console.log(`   👥 Siswa: ${studentsCount}`)
    console.log(`   📋 StudentFee (old): ${studentFeesCount}`)
    console.log(`   📋 StudentFeeNew: ${studentFeesNewCount}`)
    console.log(`   💰 FeePayment (old): ${feePaymentsCount}`)
    console.log(`   💰 FeePaymentNew: ${feePaymentsNewCount}`)
    console.log(`   💰 SPPPayment: ${sppPaymentsCount}`)
    console.log(`   📊 ComponentAllocation: ${componentAllocationsCount}`)
    console.log(`   📊 FeeAllocation: ${feeAllocationsCount}`)

    const totalRecords =
      studentsCount +
      studentFeesCount +
      studentFeesNewCount +
      feePaymentsCount +
      feePaymentsNewCount +
      sppPaymentsCount +
      componentAllocationsCount +
      feeAllocationsCount

    console.log(`\n   📦 TOTAL RECORDS: ${totalRecords}`)

    if (totalRecords === 0) {
      console.log('\n✅ Tidak ada data untuk dihapus!')

      return
    }

    // Tampilkan sample siswa yang akan dihapus
    if (studentsCount > 0) {
      const sampleStudents = await prisma.student.findMany({
        select: {
          nis: true,
          name: true,
          grade: true,
          class: true
        },
        take: 10
      })

      console.log(`\n   👥 Sample Siswa (max 10):`)
      sampleStudents.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.nis} - ${s.name} (${s.grade}${s.class})`)
      })
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('⚠️  PERHATIAN: Proses ini akan MENGHAPUS SEMUA data di atas!')
    console.log('⚠️  Data yang dihapus TIDAK BISA dikembalikan!')
    console.log(`${'='.repeat(60)}\n`)

    // 2. Hapus semua data dalam transaction
    console.log('🗑️  Memulai proses penghapusan...\n')

    await prisma.$transaction(async tx => {
      // Hapus ComponentAllocation terlebih dahulu (FK ke FeePaymentNew)
      if (componentAllocationsCount > 0) {
        const deleted = await tx.componentAllocation.deleteMany({})

        console.log(`   ✅ ComponentAllocation: ${deleted.count} deleted`)
      }

      // Hapus FeeAllocation (FK ke FeePayment old)
      if (feeAllocationsCount > 0) {
        const deleted = await tx.feeAllocation.deleteMany({})

        console.log(`   ✅ FeeAllocation: ${deleted.count} deleted`)
      }

      // Hapus FeePaymentNew
      if (feePaymentsNewCount > 0) {
        const deleted = await tx.feePaymentNew.deleteMany({})

        console.log(`   ✅ FeePaymentNew: ${deleted.count} deleted`)
      }

      // Hapus FeePayment (old)
      if (feePaymentsCount > 0) {
        const deleted = await tx.feePayment.deleteMany({})

        console.log(`   ✅ FeePayment (old): ${deleted.count} deleted`)
      }

      // Hapus SPPPayment
      if (sppPaymentsCount > 0) {
        const deleted = await tx.sPPPayment.deleteMany({})

        console.log(`   ✅ SPPPayment: ${deleted.count} deleted`)
      }

      // Hapus StudentFeeNew
      if (studentFeesNewCount > 0) {
        const deleted = await tx.studentFeeNew.deleteMany({})

        console.log(`   ✅ StudentFeeNew: ${deleted.count} deleted`)
      }

      // Hapus StudentFee (old)
      if (studentFeesCount > 0) {
        const deleted = await tx.studentFee.deleteMany({})

        console.log(`   ✅ StudentFee (old): ${deleted.count} deleted`)
      }

      // Terakhir, hapus semua siswa
      if (studentsCount > 0) {
        const deleted = await tx.student.deleteMany({})

        console.log(`   ✅ Student: ${deleted.count} deleted`)
      }
    })

    console.log('\n✅ SEMUA DATA SISWA BERHASIL DIHAPUS!')

    // 3. Verifikasi setelah penghapusan
    console.log('\n🔍 Verifikasi setelah penghapusan...')

    const remainingStudents = await prisma.student.count()
    const remainingFees = await prisma.studentFee.count()
    const remainingFeesNew = await prisma.studentFeeNew.count()
    const remainingPayments = await prisma.feePayment.count()
    const remainingPaymentsNew = await prisma.feePaymentNew.count()
    const remainingSPP = await prisma.sPPPayment.count()

    console.log(`   Siswa: ${remainingStudents}`)
    console.log(`   StudentFee: ${remainingFees}`)
    console.log(`   StudentFeeNew: ${remainingFeesNew}`)
    console.log(`   FeePayment: ${remainingPayments}`)
    console.log(`   FeePaymentNew: ${remainingPaymentsNew}`)
    console.log(`   SPPPayment: ${remainingSPP}`)

    const totalRemaining =
      remainingStudents + remainingFees + remainingFeesNew + remainingPayments + remainingPaymentsNew + remainingSPP

    if (totalRemaining === 0) {
      console.log('\n✅ Database bersih! Semua data siswa telah dihapus.')
    } else {
      console.log(`\n⚠️  Masih ada ${totalRemaining} records tersisa.`)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('\n💡 Langkah selanjutnya:')
    console.log('   1. Anda bisa menginput data siswa yang baru')
    console.log('   2. Atau import data siswa dari file Excel/CSV')
    console.log('   3. Jangan lupa setup kategori pembayaran terlebih dahulu')
    console.log(`\n${'='.repeat(60)}`)
  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the deletion
deleteAllStudents()
  .then(() => {
    console.log('\n🎉 Proses penghapusan selesai!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Proses penghapusan gagal:', error)
    process.exit(1)
  })
