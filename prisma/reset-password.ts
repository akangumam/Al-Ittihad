import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@alittihad.sch.id' },
    update: {
      password: hashedPassword,
      emailVerified: new Date()
    },
    create: {
      email: 'admin@alittihad.sch.id',
      name: 'Administrator',
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date()
    }
  })

  console.log('✅ Password reset successfully!')
  console.log('Email:', user.email)
  console.log('Password: admin123')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
