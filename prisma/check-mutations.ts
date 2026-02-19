// Cek dan hapus data mutasi kas
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndClear() {
  console.log('\n📊 CEK DATA MUTASI KAS...\n')

  // Cek jumlah data
  const mutations = await prisma.cashMutation.findMany()

  console.log(`Total Mutasi Kas: ${mutations.length}`)

  if (mutations.length > 0) {
    console.log('\n📋 Data yang ditemukan:')
    mutations.forEach(m => {
      console.log(`  - ${m.id}: ${m.fromAccount} → ${m.toAccount} (Rp ${m.amount.toLocaleString('id-ID')})`)
    })

    console.log('\n🗑️ MENGHAPUS SEMUA DATA...')
    const deleted = await prisma.cashMutation.deleteMany()

    console.log(`✅ ${deleted.count} data mutasi dihapus`)
  } else {
    console.log('✅ Database sudah kosong')
  }

  // Verifikasi
  const verify = await prisma.cashMutation.count()

  console.log(`\n🔍 Verifikasi: ${verify} mutasi kas tersisa\n`)

  await prisma.$disconnect()
}

checkAndClear()
