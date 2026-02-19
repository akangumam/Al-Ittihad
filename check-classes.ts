import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const classes = await prisma.class.findMany({
    orderBy: [{ academicYear: 'desc' }, { grade: 'asc' }, { className: 'asc' }]
  })

  console.log('📚 Daftar Kelas yang Ada:')
  console.log(JSON.stringify(classes, null, 2))
  console.log(`\nTotal: ${classes.length} kelas`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
