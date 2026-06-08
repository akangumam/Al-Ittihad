import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tampilkan semua user yang ada di database
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, password: true }
  })

  if (users.length === 0) {
    console.log('❌ Tidak ada user di database. Jalankan: npm run db:seed')
    return
  }

  console.log(`✅ Ditemukan ${users.length} user:\n`)

  for (const user of users) {
    console.log(`👤 ${user.name}`)
    console.log(`   Email : ${user.email}`)
    console.log(`   Role  : ${user.role}`)
    console.log(`   Hash  : ${user.password ? user.password.substring(0, 20) + '...' : '(kosong)'}`)

    // Cek password umum
    const commonPasswords = ['admin123', 'guru123', 'AlIttihad@2025!', 'Guru@AlIttihad25!']
    for (const pwd of commonPasswords) {
      const match = await bcrypt.compare(pwd, user.password || '')
      if (match) {
        console.log(`   🔑 Password saat ini: "${pwd}"`)
        break
      }
    }
    console.log()
  }
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect())
