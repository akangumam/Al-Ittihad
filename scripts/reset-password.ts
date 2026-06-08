import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Ganti dengan email dan password yang diinginkan sebelum menjalankan script ini
const TARGET_EMAIL = 'admin@example.com'
const NEW_PASSWORD = 'GantiPasswordIni!'

async function main() {
  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } })

  if (!user) {
    console.log(`❌ User tidak ditemukan: ${TARGET_EMAIL}`)
    console.log('\nUser yang ada di database:')
    const allUsers = await prisma.user.findMany({ select: { email: true, name: true, role: true } })
    allUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`))
    return
  }

  const hashed = await bcrypt.hash(NEW_PASSWORD, 10)
  await prisma.user.update({ where: { email: TARGET_EMAIL }, data: { password: hashed } })

  console.log(`✅ Password berhasil direset`)
  console.log(`   Email   : ${TARGET_EMAIL}`)
  console.log(`   Password: ${NEW_PASSWORD}`)
  console.log('\n⚠️  Segera ganti password ini setelah login!')
}

main()
  .catch(e => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
