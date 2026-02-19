import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDataIntegrity() {
  console.log('🔍 VERIFIKASI INTEGRITAS DATA\n')
  console.log('='.repeat(60))

  try {
    // 1. Cek jumlah siswa
    const studentsCount = await prisma.student.count()

    console.log(`\n📊 SISWA:`)
    console.log(`   Total Siswa: ${studentsCount}`)

    if (studentsCount > 0) {
      const students = await prisma.student.findMany({
        select: {
          id: true,
          nis: true,
          name: true,
          grade: true,
          class: true,
          status: true
        },
        take: 5
      })

      console.log(`\n   Sample Data (5 siswa pertama):`)
      students.forEach(s => {
        console.log(`   - ${s.nis} | ${s.name} | ${s.grade}${s.class} | ${s.status}`)
      })
    }

    // 2. Cek StudentFee (old system)
    console.log(`\n📊 STUDENT FEE (OLD SYSTEM):`)
    const studentFeesCount = await prisma.studentFee.count()

    console.log(`   Total StudentFee: ${studentFeesCount}`)

    if (studentFeesCount > 0) {
      const fees = await prisma.studentFee.findMany({
        include: {
          student: {
            select: { nis: true, name: true }
          },
          category: {
            select: { name: true }
          }
        },
        take: 5
      })

      console.log(`\n   Sample Data (5 pertama):`)
      fees.forEach(f => {
        const studentInfo = f.student ? `${f.student.nis} - ${f.student.name}` : '❌ SISWA TIDAK ADA'

        console.log(`   - ${studentInfo} | ${f.category.name} | Rp ${f.amountDue}`)
      })

      // Note: Orphan fees are checked separately via studentId validation
    }

    // 3. Cek StudentFeeNew
    console.log(`\n📊 STUDENT FEE NEW (SISTEM BARU):`)
    const studentFeesNewCount = await prisma.studentFeeNew.count()

    console.log(`   Total StudentFeeNew: ${studentFeesNewCount}`)

    if (studentFeesNewCount > 0) {
      const feesNew = await prisma.studentFeeNew.findMany({
        include: {
          student: {
            select: { nis: true, name: true }
          },
          template: {
            select: { name: true }
          }
        },
        take: 5
      })

      console.log(`\n   Sample Data (5 pertama):`)
      feesNew.forEach(f => {
        const studentInfo = f.student ? `${f.student.nis} - ${f.student.name}` : '❌ SISWA TIDAK ADA'

        console.log(`   - ${studentInfo} | ${f.template.name} | Rp ${f.totalAmount}`)
      })
    }

    // 4. Cek Payment Categories
    console.log(`\n📊 PAYMENT CATEGORIES:`)
    const categoriesCount = await prisma.paymentCategory.count()

    console.log(`   Total Categories: ${categoriesCount}`)

    if (categoriesCount > 0) {
      const categories = await prisma.paymentCategory.findMany({
        select: {
          name: true,
          amount: true,
          priority: true,
          isActive: true
        }
      })

      console.log(`\n   Daftar Kategori:`)
      categories.forEach(c => {
        const status = c.isActive ? '✅ Aktif' : '❌ Tidak Aktif'

        console.log(`   - ${c.name} | Rp ${c.amount} | Priority: ${c.priority} | ${status}`)
      })
    }

    // 5. Cek Fee Templates
    console.log(`\n📊 FEE TEMPLATES (SISTEM BARU):`)
    const templatesCount = await prisma.feeTemplate.count()

    console.log(`   Total Templates: ${templatesCount}`)

    if (templatesCount > 0) {
      const templates = await prisma.feeTemplate.findMany({
        include: {
          components: {
            select: {
              name: true,
              amount: true
            }
          }
        },
        take: 3
      })

      console.log(`\n   Sample Templates:`)
      templates.forEach(t => {
        const totalAmount = t.components.reduce((sum, c) => sum + c.amount, 0)

        console.log(`   - ${t.name} | ${t.grade || 'Semua'} | Total: Rp ${totalAmount}`)
        t.components.forEach(c => {
          console.log(`     • ${c.name}: Rp ${c.amount}`)
        })
      })
    }

    // 6. Cek data yang tidak konsisten
    console.log(`\n\n⚙️  CEK KONSISTENSI DATA:\n`)

    // Cek StudentFee yang studentId-nya tidak ada di tabel Student
    const allStudents = await prisma.student.findMany({
      select: { id: true }
    })

    const validStudentIds = allStudents.map(s => s.id)

    const inconsistentFees = await prisma.studentFee.count({
      where: {
        studentId: {
          notIn: validStudentIds.length > 0 ? validStudentIds : ['dummy']
        }
      }
    })

    const inconsistentFeesNew = await prisma.studentFeeNew.count({
      where: {
        studentId: {
          notIn: validStudentIds.length > 0 ? validStudentIds : ['dummy']
        }
      }
    })

    const inconsistentPayments = await prisma.feePayment.count({
      where: {
        studentId: {
          notIn: validStudentIds.length > 0 ? validStudentIds : ['dummy']
        }
      }
    })

    const inconsistentPaymentsNew = await prisma.feePaymentNew.count({
      where: {
        studentId: {
          notIn: validStudentIds.length > 0 ? validStudentIds : ['dummy']
        }
      }
    })

    if (inconsistentFees > 0) {
      console.log(`   ❌ StudentFee dengan studentId invalid: ${inconsistentFees}`)
    } else {
      console.log(`   ✅ StudentFee: Semua data konsisten`)
    }

    if (inconsistentFeesNew > 0) {
      console.log(`   ❌ StudentFeeNew dengan studentId invalid: ${inconsistentFeesNew}`)
    } else {
      console.log(`   ✅ StudentFeeNew: Semua data konsisten`)
    }

    if (inconsistentPayments > 0) {
      console.log(`   ❌ FeePayment dengan studentId invalid: ${inconsistentPayments}`)
    } else {
      console.log(`   ✅ FeePayment: Semua data konsisten`)
    }

    if (inconsistentPaymentsNew > 0) {
      console.log(`   ❌ FeePaymentNew dengan studentId invalid: ${inconsistentPaymentsNew}`)
    } else {
      console.log(`   ✅ FeePaymentNew: Semua data konsisten`)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('\n✅ Verifikasi selesai!')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyDataIntegrity()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Verifikasi gagal:', error)
    process.exit(1)
  })
