import type {
  StudentType,
  ClassType,
  AcademicYearType,
  TransactionCategoryType,
  BankAccountType,
  SPPRateType,
  BudgetType,
  TeacherType,
  TeachingScheduleType
} from '@/contexts/AppContext'

// Import pre-generated student data
// import studentsData from './students_data.json'
// import classesData from './classes_data.json'
// import sppRatesData from './spp_rates_data.json'
// import { generateSPPPayments } from './generate_spp_payments'

// Academic Data - Use pre-generated data
export const initialStudents: StudentType[] = []
export const initialClasses: ClassType[] = []
export const initialSPPRates: SPPRateType[] = []
export const initialTeachers: TeacherType[] = []

export const initialAcademicYears: AcademicYearType[] = [
  {
    id: 'AY-001',
    name: '2024/2025',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    semester: 'Ganjil',
    isActive: true
  },
  {
    id: 'AY-002',
    name: '2023/2024',
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    semester: 'Ganjil',
    isActive: false
  }
]

export const initialTeachingSchedules: TeachingScheduleType[] = [
  // Senin
  {
    id: 'SCH-001',
    teacherId: 'TCH-001',
    teacherName: 'Dr. Ahmad Hidayat, S.Pd., M.Pd',
    subject: 'Matematika',
    day: 'Senin',
    startTime: '07:00',
    endTime: '08:30',
    grade: '9',
    class: 'A',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-002',
    teacherId: 'TCH-002',
    teacherName: 'Siti Aminah, S.Pd',
    subject: 'Bahasa Indonesia',
    day: 'Senin',
    startTime: '08:30',
    endTime: '10:00',
    grade: '7',
    class: 'A',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-003',
    teacherId: 'TCH-003',
    teacherName: 'Muhammad Rizki, S.Si',
    subject: 'IPA',
    day: 'Senin',
    startTime: '10:15',
    endTime: '11:45',
    grade: '8',
    class: 'B',
    academicYear: '2024/2025'
  },

  // Selasa
  {
    id: 'SCH-004',
    teacherId: 'TCH-004',
    teacherName: 'Dewi Lestari, S.Pd., M.Pd',
    subject: 'Bahasa Inggris',
    day: 'Selasa',
    startTime: '07:00',
    endTime: '08:30',
    grade: '7',
    class: 'B',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-005',
    teacherId: 'TCH-006',
    teacherName: 'Nur Hasanah, S.Pd',
    subject: 'IPS',
    day: 'Selasa',
    startTime: '08:30',
    endTime: '10:00',
    grade: '8',
    class: 'A',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-006',
    teacherId: 'TCH-001',
    teacherName: 'Dr. Ahmad Hidayat, S.Pd., M.Pd',
    subject: 'Matematika',
    day: 'Selasa',
    startTime: '10:15',
    endTime: '11:45',
    grade: '7',
    class: 'C',
    academicYear: '2024/2025'
  },

  // Rabu
  {
    id: 'SCH-007',
    teacherId: 'TCH-005',
    teacherName: 'Budi Santoso, S.Pd',
    subject: 'Pendidikan Agama Islam',
    day: 'Rabu',
    startTime: '07:00',
    endTime: '08:30',
    grade: '9',
    class: 'B',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-008',
    teacherId: 'TCH-003',
    teacherName: 'Muhammad Rizki, S.Si',
    subject: 'IPA',
    day: 'Rabu',
    startTime: '08:30',
    endTime: '10:00',
    grade: '7',
    class: 'A',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-009',
    teacherId: 'TCH-002',
    teacherName: 'Siti Aminah, S.Pd',
    subject: 'Bahasa Indonesia',
    day: 'Rabu',
    startTime: '10:15',
    endTime: '11:45',
    grade: '8',
    class: 'C',
    academicYear: '2024/2025'
  },

  // Kamis
  {
    id: 'SCH-010',
    teacherId: 'TCH-004',
    teacherName: 'Dewi Lestari, S.Pd., M.Pd',
    subject: 'Bahasa Inggris',
    day: 'Kamis',
    startTime: '07:00',
    endTime: '08:30',
    grade: '9',
    class: 'A',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-011',
    teacherId: 'TCH-006',
    teacherName: 'Nur Hasanah, S.Pd',
    subject: 'IPS',
    day: 'Kamis',
    startTime: '08:30',
    endTime: '10:00',
    grade: '7',
    class: 'B',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-012',
    teacherId: 'TCH-001',
    teacherName: 'Dr. Ahmad Hidayat, S.Pd., M.Pd',
    subject: 'Matematika',
    day: 'Kamis',
    startTime: '10:15',
    endTime: '11:45',
    grade: '8',
    class: 'A',
    academicYear: '2024/2025'
  },

  // Jumat
  {
    id: 'SCH-013',
    teacherId: 'TCH-005',
    teacherName: 'Budi Santoso, S.Pd',
    subject: 'Pendidikan Agama Islam',
    day: 'Jumat',
    startTime: '07:00',
    endTime: '08:30',
    grade: '8',
    class: 'B',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-014',
    teacherId: 'TCH-003',
    teacherName: 'Muhammad Rizki, S.Si',
    subject: 'IPA',
    day: 'Jumat',
    startTime: '08:30',
    endTime: '10:00',
    grade: '9',
    class: 'C',
    academicYear: '2024/2025'
  },

  // Sabtu
  {
    id: 'SCH-015',
    teacherId: 'TCH-002',
    teacherName: 'Siti Aminah, S.Pd',
    subject: 'Bahasa Indonesia',
    day: 'Sabtu',
    startTime: '07:00',
    endTime: '08:30',
    grade: '9',
    class: 'B',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-016',
    teacherId: 'TCH-004',
    teacherName: 'Dewi Lestari, S.Pd., M.Pd',
    subject: 'Bahasa Inggris',
    day: 'Sabtu',
    startTime: '08:30',
    endTime: '10:00',
    grade: '8',
    class: 'C',
    academicYear: '2024/2025'
  },
  {
    id: 'SCH-017',
    teacherId: 'TCH-006',
    teacherName: 'Nur Hasanah, S.Pd',
    subject: 'IPS',
    day: 'Sabtu',
    startTime: '10:15',
    endTime: '11:45',
    grade: '9',
    class: 'A',
    academicYear: '2024/2025'
  }
]

// Finance Settings
export const initialCategories: TransactionCategoryType[] = [
  {
    id: 'CAT-001',
    name: 'SPP',
    type: 'Pemasukan',
    description: 'Sumbangan Pembinaan Pendidikan',
    isActive: true
  },
  {
    id: 'CAT-002',
    name: 'Donasi',
    type: 'Pemasukan',
    description: 'Sumbangan dari alumni dan donatur',
    isActive: true
  },
  {
    id: 'CAT-003',
    name: 'Uang Pangkal',
    type: 'Pemasukan',
    description: 'Biaya pendaftaran siswa baru',
    isActive: true
  },
  {
    id: 'CAT-004',
    name: 'Gaji Guru',
    type: 'Pengeluaran',
    description: 'Gaji guru dan tenaga pendidik',
    isActive: true
  },
  {
    id: 'CAT-005',
    name: 'Operasional',
    type: 'Pengeluaran',
    description: 'Biaya operasional sekolah (ATK, listrik, dll)',
    isActive: true
  },
  {
    id: 'CAT-006',
    name: 'Pemeliharaan',
    type: 'Pengeluaran',
    description: 'Biaya pemeliharaan gedung dan fasilitas',
    isActive: true
  }
]

export const initialAccounts: BankAccountType[] = [
  {
    id: 'ACC-001',
    accountName: 'Kas Tunai',
    accountNumber: '-',
    bankName: '-',
    accountType: 'Kas',
    balance: 15000000,
    isActive: true
  },
  {
    id: 'ACC-002',
    accountName: 'Rekening Operasional',
    accountNumber: '1234567890',
    bankName: 'Bank BSI',
    accountType: 'Bank',
    balance: 45000000,
    isActive: true
  },
  {
    id: 'ACC-003',
    accountName: 'Rekening Dana BOS',
    accountNumber: '0987654321',
    bankName: 'Bank BNI',
    accountType: 'Bank',
    balance: 120000000,
    isActive: true
  }
]

// Budget Data
export const initialBudgets: BudgetType[] = [
  {
    id: 'BDG-001',
    budgetCode: 'RAB-001',
    name: 'Operasional Semester 1',
    category: 'Operasional',
    amount: 50000000,
    source: 'BOS',
    fiscalYear: '2024/2025',
    status: 'Active',
    realization: 0
  },
  {
    id: 'BDG-002',
    budgetCode: 'RAB-002',
    name: 'Pengembangan Sarana Prasarana',
    category: 'Modal',
    amount: 100000000,
    source: 'APBN',
    fiscalYear: '2024/2025',
    status: 'Active',
    realization: 0
  },
  {
    id: 'BDG-003',
    budgetCode: 'RAB-003',
    name: 'Pemeliharaan Gedung',
    category: 'Pemeliharaan',
    amount: 25000000,
    source: 'BOS',
    fiscalYear: '2024/2025',
    status: 'Pending',
    realization: 0
  }
]

// Helper function to initialize data if localStorage is empty
export const initializeData = () => {
  console.log('🔄 initializeData() called')

  const initialDataTemplate = {
    students: initialStudents,
    classes: initialClasses,
    academicYears: initialAcademicYears,
    teachers: initialTeachers,
    teachingSchedules: initialTeachingSchedules,
    categories: initialCategories,
    accounts: initialAccounts,
    incomes: [],
    expenses: [],
    mutations: [],
    sppRates: initialSPPRates,
    sppPayments: [],
    budgets: initialBudgets
  }

  const savedData = localStorage.getItem('app_data')

  if (savedData) {
    console.log('📦 Found savedData in localStorage')

    try {
      const parsedData = JSON.parse(savedData)

      // Merge with template to ensure all fields exist
      const mergedData = {
        ...initialDataTemplate,
        ...parsedData
      }

      console.log('✅ Returning merged existing data')

      return mergedData
    } catch (e) {
      console.error('Error parsing savedData:', e)
    }

    console.log('⚠️ Corrupted data, reinitializing...')
  } else {
    console.log('❌ No savedData, initializing fresh...')
  }

  // Initialize or reinitialize data
  console.log('🔨 Creating initial data...')

  localStorage.setItem('app_data', JSON.stringify(initialDataTemplate))
  console.log('✅ Data saved to localStorage')

  return initialDataTemplate
}
