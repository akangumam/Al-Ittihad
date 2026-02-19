import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTemplates() {
  console.log('🧹 CLEANUP TEMPLATE DUPLIKAT\n')
  console.log('='.repeat(60))

  try {
    // Ambil semua template
    const allTemplates = await prisma.feeTemplate.findMany({
      include: {
        components: true,
        _count: {
          select: {
            studentFees: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`\n📊 Total template ditemukan: ${allTemplates.length}\n`)

    allTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`)
      console.log(`   ID: ${template.id}`)
      console.log(`   Type: ${template.type}`)
      console.log(`   Components: ${template.components.length}`)
      console.log(`   Used by: ${template._count.studentFees} siswa`)
      console.log(`   Created: ${template.createdAt.toLocaleString('id-ID')}`)
      console.log('')
    })

    // Hapus template yang BUKAN template resmi
    const officialIds = ['ppdb-2025-2026', 'daftar-ulang-2025-2026', 'kelas-9-2025-2026']

    const templatesToDelete = allTemplates.filter(t => !officialIds.includes(t.id))

    if (templatesToDelete.length > 0) {
      console.log(`\n🗑️  Menghapus ${templatesToDelete.length} template duplikat/lama...\n`)

      for (const template of templatesToDelete) {
        if (template._count.studentFees > 0) {
          console.log(`   ⚠️  Skip: ${template.name} (digunakan oleh ${template._count.studentFees} siswa)`)
        } else {
          await prisma.feeTemplate.delete({
            where: { id: template.id }
          })
          console.log(`   ✅ Dihapus: ${template.name}`)
        }
      }
    } else {
      console.log('\n✅ Tidak ada template duplikat yang perlu dihapus')
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('\n✅ Cleanup selesai!')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTemplates()
  .then(() => {
    console.log('\n🎉 Selesai!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Gagal:', error)
    process.exit(1)
  })
