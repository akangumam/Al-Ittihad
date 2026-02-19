import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@alittihad.com' },
    update: {
      password: hashedPassword
    },
    create: {
      email: 'admin@alittihad.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Admin password set successfully!')
  console.log('Email:', user.email)
  console.log('Password: admin')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
