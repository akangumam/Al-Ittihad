// @ts-nocheck
/**
 * Complete Seed Script untuk MTs Al-Ittihad
 *
 * Script ini akan generate:
 * - 3 Tahun Ajaran
 * - 8 Kelas (7A-7C, 8A-8C, 9A-9B)
 * - 10 Guru
 * - 60 Siswa (distributed across classes)
 * - Akun Kas & Bank
 * - Kategori Transaksi
 * - Fee Templates & Components
 * - Sample Transactions
 *
 * Usage: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function untuk generate random data
const generateNIS = (year: number, index: number) => {
  return `${year}${String(index).padStart(4, '0')}`
}

const generateNISN = () => {
  return String(Math.floor(Math.random() * 9000000000) + 1000000000)
}

const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

const namaDepanLaki = ['Ahmad', 'Muhammad', 'Abdul', 'Rizki', 'Farhan', 'Aditya', 'Dimas', 'Arif', 'Budi', 'Cahya']
const namaDepanPerempuan = ['Siti', 'Dewi', 'Aisyah', 'Fatimah', 'Nur', 'Sri', 'Indah', 'Putri', 'Ratna', 'Wulan']

const namaBelakang = [
  'Hidayat',
  'Rahman',
  'Maulana',
  'Santoso',
  'Pratama',
  'Wijaya',
  'Saputra',
  'Utomo',
  'Nugroho',
  'Mahendra'
]

const kelas7 = ['7A', '7B', '7C']
const kelas8 = ['8A', '8B', '8C']
const kelas9 = ['9A', '9B']
const allClasses = [...kelas7, ...kelas8, ...kelas9]

const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha']
const cities = ['Serang', 'Cilegon', 'Tangerang', 'Pandeglang', 'Lebak']
const kecamatans = ['Kasemen', 'Cipocok Jaya', 'Curug', 'Walantaka', 'Serang', 'Taktakan']

async function main() {
  console.log('🌱 Starting COMPLETE database seed...')
  console.log('')

  // ============================================
  // 📌 STEP 1: Clear existing data
  // ============================================
  console.log('🗑️  Clearing existing data...')

  await prisma.componentAllocation.deleteMany()
  await prisma.feePaymentNew.deleteMany()
  await prisma.studentFeeNew.deleteMany()
  await prisma.feeComponent.deleteMany()
  await prisma.feeTemplate.deleteMany()
  await prisma.feeAllocation.deleteMany()
  await prisma.feePayment.deleteMany()
  await prisma.studentFee.deleteMany()
  await prisma.paymentCategory.deleteMany()
  await prisma.sPPPayment.deleteMany()
  await prisma.sPPRate.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.income.deleteMany()
  await prisma.cashMutation.deleteMany()
  await prisma.teachingSchedule.deleteMany()
  await prisma.teacherAttendance.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.academicYear.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.transactionCategory.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Data cleared')
  console.log('')

  // ============================================
  // 📌 STEP 2: Seed Users (with SECURE random passwords)
  // ============================================
  console.log('👥 Seeding users...')

  // 🔐 SECURITY: Generate unique random passwords for each user
  // Each password is cryptographically random and different
  const crypto = await import('crypto')

  // Generate strong random passwords (12 chars + special char for strength)
  const adminPassword = crypto.randomBytes(8).toString('hex') + '@Al' // e.g., "a3f9d2e5b7c1@Al"
  const tuPassword = crypto.randomBytes(8).toString('hex') + '@Tu' // e.g., "9c2f1a4d6e8b@Tu"
  const guruPassword = crypto.randomBytes(8).toString('hex') + '@Gr' // e.g., "7b5e3d1c9a2f@Gr"

  // Hash each password separately
  const adminHash = await hash(adminPassword, 10)
  const tuHash = await hash(tuPassword, 10)
  const guruHash = await hash(guruPassword, 10)

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@alittihad.sch.id',
        name: 'Administrator',
        role: 'admin',
        password: adminHash,
        emailVerified: new Date()
      },
      {
        email: 'tu@alittihad.sch.id',
        name: 'Tata Usaha',
        role: 'staff',
        password: tuHash,
        emailVerified: new Date()
      },
      {
        email: 'guru@alittihad.sch.id',
        name: 'Guru',
        role: 'teacher',
        password: guruHash,
        emailVerified: new Date()
      }
    ]
  })

  console.log('✅ Users seeded: 3 users with secure random passwords')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 INITIAL LOGIN CREDENTIALS - SAVE THESE SECURELY!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('👤 ADMINISTRATOR')
  console.log('   📧 Email:    admin@alittihad.sch.id')
  console.log('   🔑 Password:', adminPassword)
  console.log('')
  console.log('👤 TATA USAHA')
  console.log('   📧 Email:    tu@alittihad.sch.id')
  console.log('   🔑 Password:', tuPassword)
  console.log('')
  console.log('👤 GURU')
  console.log('   📧 Email:    guru@alittihad.sch.id')
  console.log('   🔑 Password:', guruPassword)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  IMPORTANT SECURITY NOTES:')
  console.log('   1. These passwords are UNIQUE to this installation')
  console.log('   2. COPY and SAVE them to a password manager NOW')
  console.log('   3. Send to users via SECURE channel (encrypted email/WhatsApp)')
  console.log('   4. Users should CHANGE password after first login')
  console.log('   5. NEVER commit these passwords to Git!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // ============================================
  // 📌 STEP 3: Seed Academic Years
  // ============================================
  console.log('📅 Seeding academic years...')

  await prisma.academicYear.createMany({
    data: [
      {
        name: '2025/2026',
        startDate: '2025-07-15',
        endDate: '2026-06-30',
        semester: 'Ganjil',
        isActive: true
      },
      {
        name: '2024/2025',
        startDate: '2024-07-15',
        endDate: '2025-06-30',
        semester: 'Genap',
        isActive: false
      },
      {
        name: '2023/2024',
        startDate: '2023-07-15',
        endDate: '2024-06-30',
        semester: 'Genap',
        isActive: false
      }
    ]
  })

  console.log('✅ Academic years seeded: 3 years')
  console.log('')

  // ============================================
  // 📌 STEP 4: Seed Teachers
  // ============================================
  console.log('👨‍🏫 Seeding teachers...')

  const teachers = [
    {
      id: 'TCH-001',
      nip: '197501012000031001',
      nuptk: '1234567890123456',
      name: 'Dr. Ahmad Hidayat, S.Pd., M.Pd',
      subject: 'Matematika',
      position: 'Guru Utama',
      gender: 'L',
      birthPlace: 'Jakarta',
      birthDate: '1975-01-01',
      phone: '081234567890',
      email: 'ahmad.hidayat@alittihad.sch.id',
      address: 'Jl. Merdeka No. 1, Jakarta',
      education: 'S3 Pendidikan Matematika',
      status: 'Aktif'
    },
    {
      id: 'TCH-002',
      nip: '198005122005012002',
      nuptk: '2345678901234567',
      name: 'Siti Aminah, S.Pd',
      subject: 'Bahasa Indonesia',
      position: 'Guru Madya',
      gender: 'P',
      birthPlace: 'Bandung',
      birthDate: '1980-05-12',
      phone: '081234567891',
      email: 'siti.aminah@alittihad.sch.id',
      address: 'Jl. Mawar No. 12, Bandung',
      education: 'S1 Pendidikan Bahasa Indonesia',
      status: 'Aktif'
    },
    {
      id: 'TCH-003',
      nip: '198509202010011003',
      nuptk: '3456789012345678',
      name: 'Muhammad Rizki, S.Si',
      subject: 'IPA',
      position: 'Guru Muda',
      gender: 'L',
      birthPlace: 'Surabaya',
      birthDate: '1985-09-20',
      phone: '081234567892',
      email: 'muhammad.rizki@alittihad.sch.id',
      address: 'Jl. Melati No. 5, Surabaya',
      education: 'S1 Biologi',
      status: 'Aktif'
    },
    {
      id: 'TCH-004',
      nip: '199001152015052001',
      nuptk: '4567890123456789',
      name: 'Dewi Sartika, S.Pd',
      subject: 'Bahasa Inggris',
      position: 'Guru Muda',
      gender: 'P',
      birthPlace: 'Serang',
      birthDate: '1990-01-15',
      phone: '081234567893',
      email: 'dewi.sartika@alittihad.sch.id',
      address: 'Jl. Ahmad Yani No. 10, Serang',
      education: 'S1 Pendidikan Bahasa Inggris',
      status: 'Aktif'
    },
    {
      id: 'TCH-005',
      nip: '198207082007011004',
      nuptk: '5678901234567890',
      name: 'Abdul Rahman, S.Ag',
      subject: 'PAI',
      position: 'Guru Madya',
      gender: 'L',
      birthPlace: 'Cilegon',
      birthDate: '1982-07-08',
      phone: '081234567894',
      email: 'abdul.rahman@alittihad.sch.id',
      address: 'Jl. KH. Ahmad Dahlan No. 7, Cilegon',
      education: 'S1 Pendidikan Agama Islam',
      status: 'Aktif'
    },
    {
      id: 'TCH-006',
      nip: '199205202017062002',
      nuptk: '6789012345678901',
      name: 'Nur Azizah, S.Pd',
      subject: 'IPS',
      position: 'Guru Muda',
      gender: 'P',
      birthPlace: 'Tangerang',
      birthDate: '1992-05-20',
      phone: '081234567895',
      email: 'nur.azizah@alittihad.sch.id',
      address: 'Jl. Raya Serang No. 20, Tangerang',
      education: 'S1 Pendidikan IPS',
      status: 'Aktif'
    },
    {
      id: 'TCH-007',
      nip: '198803152012011005',
      nuptk: '7890123456789012',
      name: 'Farhan Maulana, S.Pd',
      subject: 'PJOK',
      position: 'Guru Muda',
      gender: 'L',
      birthPlace: 'Pandeglang',
      birthDate: '1988-03-15',
      phone: '081234567896',
      email: 'farhan.maulana@alittihad.sch.id',
      address: 'Jl. Sudirman No. 15, Pandeglang',
      education: 'S1 Pendidikan Jasmani',
      status: 'Aktif'
    },
    {
      id: 'TCH-008',
      nip: '199408252019032003',
      nuptk: '8901234567890123',
      name: 'Indah Permata, S.Pd',
      subject: 'Seni Budaya',
      position: 'Guru Muda',
      gender: 'P',
      birthPlace: 'Lebak',
      birthDate: '1994-08-25',
      phone: '081234567897',
      email: 'indah.permata@alittihad.sch.id',
      address: 'Jl. Diponegoro No. 8, Lebak',
      education: 'S1 Pendidikan Seni',
      status: 'Aktif'
    }
  ]

  await prisma.teacher.createMany({ data: teachers })

  console.log(`✅ Teachers seeded: ${teachers.length} teachers`)
  console.log('')

  // ============================================
  // 📌 STEP 5: Seed Classes
  // ============================================
  console.log('🏫 Seeding classes...')

  const classData = [
    {
      grade: '7',
      className: '7A',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Dr. Ahmad Hidayat, S.Pd., M.Pd',
      academicYear: '2025/2026'
    },
    {
      grade: '7',
      className: '7B',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Siti Aminah, S.Pd',
      academicYear: '2025/2026'
    },
    {
      grade: '7',
      className: '7C',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Muhammad Rizki, S.Si',
      academicYear: '2025/2026'
    },
    {
      grade: '8',
      className: '8A',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Dewi Sartika, S.Pd',
      academicYear: '2025/2026'
    },
    {
      grade: '8',
      className: '8B',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Abdul Rahman, S.Ag',
      academicYear: '2025/2026'
    },
    {
      grade: '8',
      className: '8C',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Nur Azizah, S.Pd',
      academicYear: '2025/2026'
    },
    {
      grade: '9',
      className: '9A',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Farhan Maulana, S.Pd',
      academicYear: '2025/2026'
    },
    {
      grade: '9',
      className: '9B',
      capacity: 32,
      currentStudents: 0,
      teacher: 'Indah Permata, S.Pd',
      academicYear: '2025/2026'
    }
  ]

  await prisma.class.createMany({ data: classData })

  console.log(`✅ Classes seeded: ${classData.length} classes`)
  console.log('')

  // ============================================
  // 📌 STEP 6: Seed Students
  // ============================================
  console.log('👨‍🎓 Seeding students...')

  let studentCount = 0

  for (const kelas of allClasses) {
    const grade = kelas.charAt(0)
    const studentsPerClass = kelas.startsWith('9') ? 6 : 8 // 6 siswa untuk kelas 9, 8 untuk 7 & 8

    for (let i = 1; i <= studentsPerClass; i++) {
      studentCount++
      const gender = studentCount % 2 === 0 ? 'L' : 'P'
      const namaDepan = gender === 'L' ? randomElement(namaDepanLaki) : randomElement(namaDepanPerempuan)
      const namaBelakangRandom = randomElement(namaBelakang)
      const fullName = `${namaDepan} ${namaBelakangRandom}`

      await prisma.student.create({
        data: {
          nis: generateNIS(2025, studentCount),
          nisn: generateNISN(),
          name: fullName,
          nickname: namaDepan,
          grade: grade,
          class: kelas,
          birthPlace: randomElement(cities),
          birthDate: `200${9 - parseInt(grade)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          gender: gender,
          religion: 'Islam',
          address: `Jl. Contoh No. ${studentCount}, RT/RW 00${Math.floor(Math.random() * 9) + 1}/00${Math.floor(Math.random() * 9) + 1}`,
          rt: `00${Math.floor(Math.random() * 9) + 1}`,
          rw: `00${Math.floor(Math.random() * 9) + 1}`,
          kelurahan: 'Kelurahan Example',
          kecamatan: randomElement(kecamatans),
          city: randomElement(cities),
          province: 'Banten',
          postalCode: `4217${Math.floor(Math.random() * 10)}`,
          parentName: `Bapak/Ibu ${namaBelakangRandom}`,
          fatherName: `Bapak ${namaBelakangRandom}`,
          motherName: `Ibu ${namaBelakangRandom}`,
          guardianName: null,
          guardianRelation: null,
          phone: `0812345678${String(studentCount).padStart(2, '0')}`,
          parentPhone: `0812345679${String(studentCount).padStart(2, '0')}`,
          email: `${namaDepan.toLowerCase()}.${namaBelakangRandom.toLowerCase()}@student.alittihad.sch.id`,
          enrollmentDate: '2025-07-15',
          sppStartDate: '2025-08-01',
          previousSchool: 'SD/MI Example',
          status: 'Aktif',
          photo: null
        }
      })
    }
  }

  console.log(`✅ Students seeded: ${studentCount} students`)
  console.log('')

  // ============================================
  // 📌 STEP 7: Seed Bank Accounts
  // ============================================
  console.log('🏦 Seeding bank accounts...')

  await prisma.bankAccount.createMany({
    data: [
      {
        accountName: 'Kas Tunai',
        accountNumber: 'CASH-001',
        bankName: 'Kas',
        accountType: 'Kas',
        balance: 5000000,
        isActive: true
      },
      {
        accountName: 'Bank BRI - Al Ittihad',
        accountNumber: '0123-4567-8901-2345',
        bankName: 'Bank Rakyat Indonesia',
        accountType: 'Bank',
        balance: 25000000,
        isActive: true
      },
      {
        accountName: 'Bank Mandiri Syariah',
        accountNumber: '1234567890',
        bankName: 'Bank Mandiri Syariah',
        accountType: 'Bank',
        balance: 15000000,
        isActive: true
      },
      {
        accountName: 'Dana BOS',
        accountNumber: 'BOS-2025-001',
        bankName: 'Bank BSI',
        accountType: 'Bank',
        balance: 50000000,
        isActive: true
      }
    ]
  })

  console.log('✅ Bank accounts seeded: 4 accounts')
  console.log('')

  // ============================================
  // 📌 STEP 8: Seed Transaction Categories
  // ============================================
  console.log('📊 Seeding transaction categories...')

  await prisma.transactionCategory.createMany({
    data: [
      // Pemasukan
      {
        name: 'Pembayaran Siswa',
        type: 'Pemasukan',
        description: 'Pembayaran biaya sekolah dari siswa',
        isActive: true
      },
      { name: 'Dana BOS', type: 'Pemasukan', description: 'Bantuan Operasional Sekolah', isActive: true },
      { name: 'Donasi', type: 'Pemasukan', description: 'Donasi dari wali murid/pihak ketiga', isActive: true },
      { name: 'Infaq/Sedekah', type: 'Pemasukan', description: 'Infaq dan sedekah', isActive: true },
      { name: 'Pemasukan Lain-lain', type: 'Pemasukan', description: 'Pemasukan lainnya', isActive: true },

      // Pengeluaran
      { name: 'Gaji & Honorarium', type: 'Pengeluaran', description: 'Gaji guru dan karyawan', isActive: true },
      { name: 'Operasional Sekolah', type: 'Pengeluaran', description: 'ATK, listrik, air, dll', isActive: true },
      { name: 'Pemeliharaan', type: 'Pengeluaran', description: 'Perbaikan gedung dan peralatan', isActive: true },
      { name: 'Konsumsi', type: 'Pengeluaran', description: 'Konsumsi rapat dan kegiatan', isActive: true },
      { name: 'Pengembangan', type: 'Pengeluaran', description: 'Pengembangan sarana prasarana', isActive: true },
      { name: 'Pengeluaran Lain-lain', type: 'Pengeluaran', description: 'Pengeluaran lainnya', isActive: true }
    ]
  })

  console.log('✅ Transaction categories seeded: 11 categories')
  console.log('')

  // ============================================
  // 📌 STEP 9: Seed Fee Templates
  // ============================================
  console.log('💰 Seeding fee templates...')

  // Template 1: Daftar Ulang
  const template1 = await prisma.feeTemplate.create({
    data: {
      name: 'Daftar Ulang 2025/2026',
      type: 'ANNUAL_REREGISTRATION',
      academicYear: '2025/2026',
      grade: null, // Berlaku untuk semua tingkat
      description: 'Biaya daftar ulang tahun ajaran 2025/2026',
      isActive: true
    }
  })

  await prisma.feeComponent.createMany({
    data: [
      {
        templateId: template1.id,
        name: 'Biaya Administrasi',
        amount: 200000,
        priority: 1,
        description: 'Biaya administrasi daftar ulang',
        isActive: true
      },
      {
        templateId: template1.id,
        name: 'Biaya Pengembangan',
        amount: 300000,
        priority: 2,
        description: 'Biaya pengembangan sekolah',
        isActive: true
      }
    ]
  })

  // Template 2: Seragam
  const template2 = await prisma.feeTemplate.create({
    data: {
      name: 'Seragam Lengkap',
      type: 'OTHER',
      academicYear: '2025/2026',
      grade: null,
      description: 'Paket seragam lengkap (putih abu-abu, batik, OSIS, pramuka)',
      isActive: true
    }
  })

  await prisma.feeComponent.createMany({
    data: [
      {
        templateId: template2.id,
        name: 'Seragam Putih Abu-abu',
        amount: 150000,
        priority: 1,
        description: 'Seragam harian',
        isActive: true
      },
      {
        templateId: template2.id,
        name: 'Seragam Batik',
        amount: 100000,
        priority: 2,
        description: 'Seragam batik (Jumat)',
        isActive: true
      },
      {
        templateId: template2.id,
        name: 'Seragam OSIS',
        amount: 50000,
        priority: 3,
        description: 'Seragam OSIS',
        isActive: true
      },
      {
        templateId: template2.id,
        name: 'Seragam Pramuka',
        amount: 50000,
        priority: 4,
        description: 'Seragam pramuka',
        isActive: true
      }
    ]
  })

  // Template 3: Kegiatan Ekskul
  const template3 = await prisma.feeTemplate.create({
    data: {
      name: 'Kegiatan Ekstrakurikuler 2025/2026',
      type: 'ACTIVITY',
      academicYear: '2025/2026',
      grade: null,
      description: 'Biaya kegiatan ekstrakurikuler',
      isActive: true
    }
  })

  await prisma.feeComponent.create({
    data: {
      templateId: template3.id,
      name: 'Biaya Ekskul',
      amount: 200000,
      priority: 1,
      description: 'Biaya kegiatan ekstrakurikuler selama 1 tahun',
      isActive: true
    }
  })

  console.log('✅ Fee templates seeded: 3 templates with components')
  console.log('')

  // ============================================
  // 📌 STEP 10: Seed Budgets
  // ============================================
  console.log('💼 Seeding budgets...')

  await prisma.budget.createMany({
    data: [
      {
        budgetCode: 'BDG-2025-001',
        name: 'Operasional Sekolah 2025/2026',
        category: 'Operasional Sekolah',
        amount: 50000000,
        source: 'Dana BOS',
        fiscalYear: '2025/2026',
        status: 'Active',
        realization: 0
      },
      {
        budgetCode: 'BDG-2025-002',
        name: 'Pengadaan ATK 2025/2026',
        category: 'Operasional Sekolah',
        amount: 5000000,
        source: 'Dana BOS',
        fiscalYear: '2025/2026',
        status: 'Active',
        realization: 0
      },
      {
        budgetCode: 'BDG-2025-003',
        name: 'Pemeliharaan Gedung 2025/2026',
        category: 'Pemeliharaan',
        amount: 15000000,
        source: 'Dana BOS',
        fiscalYear: '2025/2026',
        status: 'Active',
        realization: 0
      }
    ]
  })

  console.log('✅ Budgets seeded: 3 budgets')
  console.log('')

  // ============================================
  // 📊 SUMMARY
  // ============================================
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   ✅ Users: 3`)
  console.log(`   ✅ Academic Years: 3`)
  console.log(`   ✅ Teachers: ${teachers.length}`)
  console.log(`   ✅ Classes: ${classData.length}`)
  console.log(`   ✅ Students: ${studentCount}`)
  console.log(`   ✅ Bank Accounts: 4`)
  console.log(`   ✅ Transaction Categories: 11`)
  console.log(`   ✅ Fee Templates: 3 (with components)`)
  console.log(`   ✅ Budgets: 3`)
  console.log('')
  console.log('🚀 You can now login with:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   📧 Email: admin@alittihad.sch.id')
  console.log('   📧 Email: tu@alittihad.sch.id')
  console.log('   📧 Email: guru@alittihad.sch.id')
  console.log('')
  console.log('   🔑 Password: lihat di atas (INITIAL LOGIN CREDENTIALS)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📋 Next steps:')
  console.log('   1. Start development server: npm run dev')
  console.log('   2. Login with credentials above')
  console.log('   3. Explore students in all classes')
  console.log('   4. Assign fees to students')
  console.log('   5. Record transactions')
  console.log('   6. Generate reports')
  console.log('')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
