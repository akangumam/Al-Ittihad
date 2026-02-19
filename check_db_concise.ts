import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const classes = await prisma.class.findMany()

  console.log('--- CLASSES ---')
  classes.forEach(c => console.log(`${c.grade}${c.className} (${c.academicYear})`))

  const academicYears = await prisma.academicYear.findMany()

  console.log('--- ACADEMIC YEARS ---')
  academicYears.forEach(y => console.log(`${y.name} (Active: ${y.isActive})`))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
