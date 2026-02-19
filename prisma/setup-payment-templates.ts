import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupPaymentTemplates() {
  console.log('🏫 SETUP TEMPLATE PEMBAYARAN MTS AL-ITTIHAD\n')
  console.log('='.repeat(60))

  try {
    const academicYear = '2025/2026'

    // 1. ADMINISTRASI PPDB (Untuk Siswa Baru)
    console.log('\n📝 Membuat Template: Administrasi PPDB...')

    const ppdbTemplate = await prisma.feeTemplate.upsert({
      where: {
        id: 'ppdb-2025-2026' // ID custom untuk mudah diidentifikasi
      },
      update: {},
      create: {
        id: 'ppdb-2025-2026',
        name: 'Administrasi PPDB 2025/2026',
        type: 'REGISTRATION',
        academicYear: academicYear,
        grade: null, // Berlaku untuk semua tingkat
        description: 'Biaya Pendaftaran untuk Siswa Baru',
        isActive: true
      }
    })

    // Komponen PPDB dengan prioritas
    const ppdbComponents = [
      { name: 'Seragam Batik, Kaos Olahraga & Atribut', amount: 200000, priority: 1 },
      { name: 'LKS Semester 1', amount: 130000, priority: 2 },
      { name: 'Iuran Semester 1 & 2', amount: 120000, priority: 3 },
      { name: 'Map Raport', amount: 50000, priority: 4 },
      { name: 'Pemeliharaan Lab Komputer', amount: 50000, priority: 5 },
      { name: 'Infaq Gedung', amount: 200000, priority: 6 }
    ]

    // Hapus komponen lama jika ada (untuk update)
    await prisma.feeComponent.deleteMany({
      where: { templateId: ppdbTemplate.id }
    })

    // Buat komponen baru
    for (const comp of ppdbComponents) {
      await prisma.feeComponent.create({
        data: {
          templateId: ppdbTemplate.id,
          ...comp,
          isActive: true
        }
      })
    }

    const totalPPDB = ppdbComponents.reduce((sum, c) => sum + c.amount, 0)

    console.log(`   ✅ Template PPDB berhasil dibuat`)
    console.log(`   💰 Total: Rp ${totalPPDB.toLocaleString('id-ID')}`)

    // 2. DAFTAR ULANG (Untuk Siswa Lama)
    console.log('\n📝 Membuat Template: Daftar Ulang...')

    const daftarUlangTemplate = await prisma.feeTemplate.upsert({
      where: {
        id: 'daftar-ulang-2025-2026'
      },
      update: {},
      create: {
        id: 'daftar-ulang-2025-2026',
        name: 'Daftar Ulang 2025/2026',
        type: 'ANNUAL_REREGISTRATION',
        academicYear: academicYear,
        grade: null, // Berlaku untuk kelas 7 & 8
        description: 'Biaya Daftar Ulang untuk Siswa Lama (Kelas 7 & 8)',
        isActive: true
      }
    })

    const daftarUlangComponents = [
      { name: 'LKS Semester 1', amount: 130000, priority: 1 },
      { name: 'Iuran Semester 1 & 2', amount: 170000, priority: 2 },
      { name: 'Pemeliharaan Lab Komputer', amount: 50000, priority: 3 }
    ]

    await prisma.feeComponent.deleteMany({
      where: { templateId: daftarUlangTemplate.id }
    })

    for (const comp of daftarUlangComponents) {
      await prisma.feeComponent.create({
        data: {
          templateId: daftarUlangTemplate.id,
          ...comp,
          isActive: true
        }
      })
    }

    const totalDaftarUlang = daftarUlangComponents.reduce((sum, c) => sum + c.amount, 0)

    console.log(`   ✅ Template Daftar Ulang berhasil dibuat`)
    console.log(`   💰 Total: Rp ${totalDaftarUlang.toLocaleString('id-ID')}`)

    // 3. ADMINISTRASI KELAS 9 (Untuk Kelas 9)
    console.log('\n📝 Membuat Template: Administrasi Kelas 9...')

    const kelas9Template = await prisma.feeTemplate.upsert({
      where: {
        id: 'kelas-9-2025-2026'
      },
      update: {},
      create: {
        id: 'kelas-9-2025-2026',
        name: 'Administrasi Kelas 9 - 2025/2026',
        type: 'ANNUAL_REREGISTRATION',
        academicYear: academicYear,
        grade: '9', // Khusus kelas 9
        description: 'Biaya Administrasi untuk Kelas 9 (Termasuk Kelulusan)',
        isActive: true
      }
    })

    const kelas9Components = [
      { name: 'Photo', amount: 40000, priority: 1 },
      { name: 'Iuran Ujian', amount: 200000, priority: 2 },
      { name: 'Album', amount: 80000, priority: 3 },
      { name: 'Medali', amount: 80000, priority: 4 },
      { name: 'Sampul Ijazah', amount: 50000, priority: 5 },
      { name: 'Pemeliharaan Lab Komputer', amount: 100000, priority: 6 },
      { name: 'Perpisahan', amount: 150000, priority: 7 }
    ]

    await prisma.feeComponent.deleteMany({
      where: { templateId: kelas9Template.id }
    })

    for (const comp of kelas9Components) {
      await prisma.feeComponent.create({
        data: {
          templateId: kelas9Template.id,
          ...comp,
          isActive: true
        }
      })
    }

    const totalKelas9 = kelas9Components.reduce((sum, c) => sum + c.amount, 0)

    console.log(`   ✅ Template Kelas 9 berhasil dibuat`)
    console.log(`   💰 Total: Rp ${totalKelas9.toLocaleString('id-ID')}`)

    // Summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('\n✅ SEMUA TEMPLATE BERHASIL DIBUAT!\n')
    console.log('📊 Ringkasan:')
    console.log(`   1. PPDB (Siswa Baru)        : Rp ${totalPPDB.toLocaleString('id-ID')}`)
    console.log(`   2. Daftar Ulang (Kls 7 & 8) : Rp ${totalDaftarUlang.toLocaleString('id-ID')}`)
    console.log(`   3. Administrasi Kelas 9     : Rp ${totalKelas9.toLocaleString('id-ID')}`)

    console.log('\n📝 Langkah Selanjutnya:')
    console.log('   1. Pergi ke menu "Biaya Sekolah" > "Template Biaya"')
    console.log('   2. Verifikasi template yang sudah dibuat')
    console.log('   3. Assign template ke siswa sesuai status:')
    console.log('      - Siswa Baru → PPDB')
    console.log('      - Siswa Kelas 7 & 8 → Daftar Ulang')
    console.log('      - Siswa Kelas 9 → Administrasi Kelas 9')
    console.log(`\n${'='.repeat(60)}`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupPaymentTemplates()
  .then(() => {
    console.log('\n🎉 Setup selesai!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Setup gagal:', error)
    process.exit(1)
  })
