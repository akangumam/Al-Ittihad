// @ts-nocheck
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

import studentsDataRaw from '../src/data/students_data.json'
import classesDataRaw from '../src/data/classes_data.json'
import sppRatesDataRaw from '../src/data/spp_rates_data.json'

const studentsData = studentsDataRaw as any[]
const classesData = classesDataRaw as any[]
const sppRatesData = sppRatesDataRaw as any[]

if (process.env.NODE_ENV === 'production') {
  throw new Error('Seed script cannot run in production environment!')
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional)
  console.log('🗑️  Clearing existing data...')
  await prisma.activityLog.deleteMany()
  await prisma.sPPPayment.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.income.deleteMany()
  await prisma.cashMutation.deleteMany()
  await prisma.teachingSchedule.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.sPPRate.deleteMany()
  await prisma.academicYear.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.transactionCategory.deleteMany()
  await prisma.user.deleteMany()

  // Seed Users
  console.log('👥 Seeding users...')

  // Default passwords — WAJIB diganti setelah seed pertama via menu Pengguna & Hak Akses
  const hashedAdminPassword = await bcrypt.hash('AlIttihad@2025!', 10)
  const hashedGuruPassword = await bcrypt.hash('Guru@AlIttihad25!', 10)

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@alittihad.sch.id',
        name: 'Administrator',
        emailVerified: new Date(),
        password: hashedAdminPassword,
        role: 'admin'
      },
      {
        email: 'guru@alittihad.sch.id',
        name: 'Guru',
        emailVerified: new Date(),
        password: hashedGuruPassword,
        role: 'teacher'
      }
    ]
  })

  // Seed Academic Years
  console.log('📅 Seeding academic years...')
  await prisma.academicYear.createMany({
    data: [
      {
        name: '2024/2025',
        startDate: '2024-07-01',
        endDate: '2025-06-30',
        isActive: true
      },
      {
        name: '2023/2024',
        startDate: '2023-07-01',
        endDate: '2024-06-30',
        isActive: false
      }
    ]
  })

  // Seed Classes
  console.log('🏫 Seeding classes...')
  await prisma.class.createMany({
    data: classesData.map((cls: any) => ({
      grade: cls.grade,
      className: cls.className,
      capacity: cls.capacity,
      currentStudents: cls.currentStudents,
      teacher: cls.teacher,
      academicYear: cls.academicYear
    }))
  })

  // Seed SPP Rates
  console.log('💰 Seeding SPP rates...')

  // Filter to only unique grade + academicYear since the schema doesn't support 'class' in SPPRate
  const uniqueSppRates = sppRatesData.reduce((acc: any[], current: any) => {
    const x = acc.find(item => item.grade === current.grade && item.academicYear === current.academicYear)

    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  await prisma.sPPRate.createMany({
    data: uniqueSppRates.map((rate: any) => ({
      grade: rate.grade,
      amount: rate.amount,
      academicYear: rate.academicYear,
      isActive: rate.isActive
    }))
  })

  // Seed Students
  console.log('👨‍🎓 Seeding students...')

  for (const studentDataRaw of studentsData.slice(0, 50)) {
    const student = studentDataRaw as any

    // Seed first 50 students
    await (prisma.student as any).create({
      data: {
        nis: student.nis,
        nisn: student.nisn,
        name: student.name,
        nickname: student.nickname,
        grade: student.grade,
        class: student.class,
        birthPlace: student.birthPlace,
        birthDate: student.birthDate,
        gender: student.gender,
        religion: student.religion,
        address: student.address,
        rt: student.rt,
        rw: student.rw,
        kelurahan: student.kelurahan,
        kecamatan: student.kecamatan,
        city: student.city,
        province: student.province,
        postalCode: student.postalCode,
        parentName: student.parentName,
        fatherName: student.fatherName,
        motherName: student.motherName,
        guardianName: student.guardianName,
        guardianRelation: student.guardianRelation,
        phone: student.phone,
        parentPhone: student.parentPhone,
        email: student.email,
        enrollmentDate: undefined, // Set undefined to avoid automatic arrears calculation
        sppStartDate: undefined, // Students will start SPP from first payment
        previousSchool: student.previousSchool,
        status: student.status,
        photo: student.photo
      } as any
    })
  }

  // Seed Teachers
  console.log('👨‍🏫 Seeding teachers...')
  await prisma.teacher.createMany({
    data: [
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
      }
    ]
  })

  // Seed Bank Accounts
  console.log('🏦 Seeding bank accounts...')
  await prisma.bankAccount.createMany({
    data: [
      {
        accountName: 'Kas Tunai',
        accountNumber: 'CASH-001',
        bankName: 'Kas',
        accountType: 'Kas',
        balance: 0,
        isActive: true
      },
      {
        accountName: 'Bank BSI',
        accountNumber: '7001234567',
        bankName: 'Bank Syariah Indonesia',
        accountType: 'Bank',
        balance: 0,
        isActive: true
      },
      {
        accountName: 'Bank Mandiri Syariah',
        accountNumber: '1234567890',
        bankName: 'Bank Mandiri Syariah',
        accountType: 'Bank',
        balance: 0,
        isActive: true
      }
    ]
  })

  // Seed Transaction Categories
  console.log('📊 Seeding transaction categories...')
  await prisma.transactionCategory.createMany({
    data: [
      { name: 'SPP', type: 'Pemasukan', description: 'Sumbangan Pembinaan Pendidikan', isActive: true },
      { name: 'BOS', type: 'Pemasukan', description: 'Bantuan Operasional Sekolah', isActive: true },
      { name: 'Infak', type: 'Pemasukan', description: 'Infak dan Sedekah', isActive: true },
      { name: 'Donasi', type: 'Pemasukan', description: 'Donasi dan Hibah', isActive: true },
      { name: 'Pemasukan Lain-lain', type: 'Pemasukan', description: 'Pemasukan Lain-lain', isActive: true },
      { name: 'Gaji Guru', type: 'Pengeluaran', description: 'Gaji dan Tunjangan Guru', isActive: true },
      { name: 'Operasional', type: 'Pengeluaran', description: 'Biaya Operasional Sekolah', isActive: true },
      { name: 'Pemeliharaan', type: 'Pengeluaran', description: 'Pemeliharaan and Perbaikan', isActive: true },
      {
        name: 'Pengembangan',
        type: 'Pengeluaran',
        description: 'Pengembangan Sarana Prasarana',
        isActive: true
      },
      { name: 'Pengeluaran Lain-lain', type: 'Pengeluaran', description: 'Pengeluaran Lain-lain', isActive: true }
    ]
  })

  // Seed Budgets
  console.log('💼 Seeding budgets...')
  await prisma.budget.createMany({
    data: [
      {
        budgetCode: 'BDG-2024-001',
        name: 'Operasional Sekolah 2024/2025',
        category: 'Operasional',
        amount: 50000000,
        source: 'BOS',
        fiscalYear: '2024/2025',
        status: 'Active',
        realization: 15000000
      },
      {
        budgetCode: 'BDG-2024-002',
        name: 'Pengadaan Alat Tulis',
        category: 'Operasional',
        amount: 5000000,
        source: 'BOS',
        fiscalYear: '2024/2025',
        status: 'Active',
        realization: 1500000
      },
      {
        budgetCode: 'BDG-2024-003',
        name: 'Pemeliharaan Gedung',
        category: 'Pemeliharaan',
        amount: 15000000,
        source: 'BOS',
        fiscalYear: '2024/2025',
        status: 'Active',
        realization: 3500000
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
