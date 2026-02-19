// Script untuk reset saldo bank accounts ke 0
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetBankBalances() {
  console.log('\n💰 RESET SALDO BANK ACCOUNTS...\n')

  try {
    // Update all bank accounts to 0 balance
    const updated = await prisma.bankAccount.updateMany({
      data: { balance: 0 }
    })

    console.log(`✅ ${updated.count} akun bank berhasil di-reset ke Rp 0`)

    // Verify
    const accounts = await prisma.bankAccount.findMany()

    console.log('\n📋 Saldo Akun Bank:')
    accounts.forEach(acc => {
      console.log(`   - ${acc.accountName}: Rp ${acc.balance.toLocaleString('id-ID')}`)
    })

    console.log('\n✅ Semua saldo sudah di-reset!\n')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetBankBalances()
