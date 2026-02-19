// Script untuk membersihkan SEMUA data transaksi dan reset database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllData() {
  console.log('\n🧹 MEMBERSIHKAN DATABASE...\n')

  try {
    // 1. Hapus Activity Log
    console.log('1️⃣ Menghapus Activity Log...')
    const logs = await prisma.activityLog.deleteMany()

    console.log(`   ✅ ${logs.count} activity log dihapus\n`)

    // 2. Hapus Pembayaran SPP
    console.log('2️⃣ Menghapus Pembayaran SPP...')
    const spp = await prisma.sPPPayment.deleteMany()

    console.log(`   ✅ ${spp.count} pembayaran SPP dihapus\n`)

    // 3. Hapus Pengeluaran
    console.log('3️⃣ Menghapus Pengeluaran...')
    const expenses = await prisma.expense.deleteMany()

    console.log(`   ✅ ${expenses.count} pengeluaran dihapus\n`)

    // 4. Hapus Pemasukan
    console.log('4️⃣ Menghapus Pemasukan...')
    const incomes = await prisma.income.deleteMany()

    console.log(`   ✅ ${incomes.count} pemasukan dihapus\n`)

    // 5. Hapus Mutasi Kas
    console.log('5️⃣ Menghapus Mutasi Kas...')
    const mutations = await prisma.cashMutation.deleteMany()

    console.log(`   ✅ ${mutations.count} mutasi kas dihapus\n`)

    // 6. Reset Saldo Bank
    console.log('6️⃣ Reset Saldo Akun Bank...')

    await prisma.bankAccount.updateMany({
      where: { accountName: 'Kas Tunai' },
      data: { balance: 5000000 }
    })

    await prisma.bankAccount.updateMany({
      where: { accountName: 'Bank BSI' },
      data: { balance: 25000000 }
    })

    await prisma.bankAccount.updateMany({
      where: { accountName: 'Bank Mandiri Syariah' },
      data: { balance: 15000000 }
    })

    console.log(`   ✅ Kas Tunai: Rp 5.000.000`)
    console.log(`   ✅ Bank BSI: Rp 25.000.000`)
    console.log(`   ✅ Bank Mandiri: Rp 15.000.000\n`)

    // 7. Reset Realisasi Budget
    console.log('7️⃣ Reset Realisasi Anggaran...')

    const budgets = await prisma.budget.updateMany({
      data: { realization: 0 }
    })

    console.log(`   ✅ ${budgets.count} anggaran di-reset\n`)

    // Verifikasi
    console.log('🔍 VERIFIKASI HASIL:\n')
    const verifyMutations = await prisma.cashMutation.count()
    const verifyIncomes = await prisma.income.count()
    const verifyExpenses = await prisma.expense.count()
    const verifySPP = await prisma.sPPPayment.count()

    console.log(`   Mutasi Kas    : ${verifyMutations} record`)
    console.log(`   Pemasukan     : ${verifyIncomes} record`)
    console.log(`   Pengeluaran   : ${verifyExpenses} record`)
    console.log(`   Pembayaran SPP: ${verifySPP} record\n`)

    console.log('✅ DATABASE BERHASIL DIBERSIHKAN!')
    console.log('📌 Silakan refresh halaman browser Anda (Ctrl+F5 atau Cmd+Shift+R)\n')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearAllData()
