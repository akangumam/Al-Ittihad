const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst()

  if (user) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'superadmin' }
    })

    console.log(`Updated user ${updated.email} to role: ${updated.role}`)
  } else {
    console.log('No user found')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
