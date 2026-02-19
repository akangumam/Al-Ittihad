import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up invalid academic years...')

  const deleted = await prisma.academicYear.deleteMany({
    where: { id: '' }
  })

  console.log(`Deleted ${deleted.count} records with empty ID.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
