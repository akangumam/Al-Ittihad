/**
 * Seed script for Priority-Based Fee System
 *
 * This creates sample data for testing the new fee system:
 * - Fee templates (Registration, Annual Re-registration)
 * - Fee components with priorities
 * - Sample student fees
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedFeeSystem() {
  console.log('🌱 Seeding Priority-Based Fee System...\n')

  // 1. Create Fee Template for Registration 2025/2026
  console.log('📋 Creating Fee Templates...')

  const registrationTemplate = await prisma.feeTemplate.create({
    data: {
      name: 'Biaya Pendaftaran Siswa Baru 2025/2026',
      type: 'REGISTRATION',
      academicYear: '2025/2026',
      description: 'Biaya pendaftaran untuk siswa baru tahun ajaran 2025/2026',
      isActive: true
    }
  })

  console.log(`✅ Created: ${registrationTemplate.name}`)

  const reregistrationTemplate = await prisma.feeTemplate.create({
    data: {
      name: 'Biaya Daftar Ulang 2025/2026',
      type: 'ANNUAL_REREGISTRATION',
      academicYear: '2025/2026',
      description: 'Biaya daftar ulang untuk siswa lama tahun ajaran 2025/2026',
      isActive: true
    }
  })

  console.log(`✅ Created: ${reregistrationTemplate.name}\n`)

  // 2. Create Fee Components for Registration
  console.log('🧩 Creating Fee Components for Registration...')

  const registrationComponents = await Promise.all([
    prisma.feeComponent.create({
      data: {
        templateId: registrationTemplate.id,
        name: 'Seragam Olahraga',
        amount: 200000,
        priority: 1,
        description: 'Seragam olahraga lengkap (baju + celana)',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: registrationTemplate.id,
        name: 'Seragam Batik',
        amount: 150000,
        priority: 2,
        description: 'Seragam batik sekolah',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: registrationTemplate.id,
        name: 'Buku LKS',
        amount: 150000,
        priority: 3,
        description: 'Lembar Kerja Siswa (LKS) 1 tahun',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: registrationTemplate.id,
        name: 'Uang Gedung',
        amount: 300000,
        priority: 4,
        description: 'Kontribusi pembangunan gedung',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: registrationTemplate.id,
        name: 'Biaya Administrasi',
        amount: 100000,
        priority: 5,
        description: 'Biaya administrasi dan pemrosesan',
        isActive: true
      }
    })
  ])

  const totalRegistration = registrationComponents.reduce((sum, c) => sum + c.amount, 0)

  console.log(`✅ Created ${registrationComponents.length} components`)
  console.log(`💰 Total Registration Fee: Rp ${totalRegistration.toLocaleString('id-ID')}\n`)

  registrationComponents.forEach((comp, idx) => {
    console.log(`   ${idx + 1}. [P${comp.priority}] ${comp.name}: Rp ${comp.amount.toLocaleString('id-ID')}`)
  })

  // 3. Create Fee Components for Re-registration
  console.log('\n🧩 Creating Fee Components for Re-registration...')

  const reregistrationComponents = await Promise.all([
    prisma.feeComponent.create({
      data: {
        templateId: reregistrationTemplate.id,
        name: 'Buku LKS',
        amount: 150000,
        priority: 1,
        description: 'Lembar Kerja Siswa (LKS) tahun ajaran baru',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: reregistrationTemplate.id,
        name: 'Uang Gedung',
        amount: 200000,
        priority: 2,
        description: 'Kontribusi pemeliharaan gedung tahunan',
        isActive: true
      }
    }),
    prisma.feeComponent.create({
      data: {
        templateId: reregistrationTemplate.id,
        name: 'Biaya Administrasi',
        amount: 50000,
        priority: 3,
        description: 'Biaya administrasi daftar ulang',
        isActive: true
      }
    })
  ])

  const totalReregistration = reregistrationComponents.reduce((sum, c) => sum + c.amount, 0)

  console.log(`✅ Created ${reregistrationComponents.length} components`)
  console.log(`💰 Total Re-registration Fee: Rp ${totalReregistration.toLocaleString('id-ID')}\n`)

  reregistrationComponents.forEach((comp, idx) => {
    console.log(`   ${idx + 1}. [P${comp.priority}] ${comp.name}: Rp ${comp.amount.toLocaleString('id-ID')}`)
  })

  console.log('\n✅ Fee System Seed Complete!\n')
  console.log('📊 Summary:')
  console.log(`   - Fee Templates: 2`)
  console.log(
    `   - Registration Components: ${registrationComponents.length} (Total: Rp ${totalRegistration.toLocaleString('id-ID')})`
  )
  console.log(
    `   - Re-registration Components: ${reregistrationComponents.length} (Total: Rp ${totalReregistration.toLocaleString('id-ID')})`
  )

  return {
    registrationTemplate,
    reregistrationTemplate,
    registrationComponents,
    reregistrationComponents
  }
}

// Run seed
seedFeeSystem()
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!')
  })
  .catch(error => {
    console.error('❌ Error seeding:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
