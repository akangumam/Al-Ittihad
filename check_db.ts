import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const classes = await prisma.class.findMany()

  console.log('Classes in DB:', JSON.stringify(classes, null, 2))

  const teachers = await prisma.teacher.findMany()

  console.log('Teachers in DB:', JSON.stringify(teachers, null, 2))

  const academicYears = await prisma.academicYear.findMany()

  console.log('Academic Years in DB:', JSON.stringify(academicYears, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
