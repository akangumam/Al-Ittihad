// Script untuk membersihkan data transaksi
// Menghapus: Mutasi Kas, Pemasukan, Pengeluaran, Pembayaran SPP, Activity Log
// Mempertahankan: Siswa, Guru, Kelas, Akun Bank, Budget, dll

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTransactions() {
  console.log('🧹 Membersihkan data transaksi...\n')

  try {
    // Hapus Activity Log
    const deletedLogs = await prisma.activityLog.deleteMany()

    console.log(`✅ Menghapus ${deletedLogs.count} activity log`)

    // Hapus Pembayaran SPP
    const deletedSPP = await prisma.sPPPayment.deleteMany()

    console.log(`✅ Menghapus ${deletedSPP.count} pembayaran SPP`)

    // Hapus Pengeluaran
    const deletedExpenses = await prisma.expense.deleteMany()

    console.log(`✅ Menghapus ${deletedExpenses.count} pengeluaran`)

    // Hapus Pemasukan
    const deletedIncomes = await prisma.income.deleteMany()

    console.log(`✅ Menghapus ${deletedIncomes.count} pemasukan`)

    // Hapus Mutasi Kas
    const deletedMutations = await prisma.cashMutation.deleteMany()

    console.log(`✅ Menghapus ${deletedMutations.count} mutasi kas`)

    // Reset saldo akun bank ke nilai awal
    console.log('\n💰 Reset saldo akun bank ke nilai awal...')
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
    console.log('✅ Saldo akun bank berhasil di-reset')

    // Reset realisasi budget
    console.log('\n📊 Reset realisasi anggaran...')
    await prisma.budget.updateMany({
      data: { realization: 0 }
    })
    console.log('✅ Realisasi anggaran berhasil di-reset')

    console.log('\n✅ Semua data transaksi berhasil dibersihkan!')
    console.log('📌 Data master (Siswa, Guru, Kelas, Akun Bank, Budget) tetap dipertahankan\n')
  } catch (error) {
    console.error('❌ Error saat membersihkan data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearTransactions().catch(e => {
  console.error(e)
  process.exit(1)
})
