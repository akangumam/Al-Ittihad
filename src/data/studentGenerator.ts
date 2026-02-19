import type { StudentType, ClassType, SPPRateType } from '@/contexts/AppContext'

// Daftar nama siswa Indonesia yang realistis
const namaSiswaLaki = [
  'Ahmad Fauzi',
  'Muhammad Rizki',
  'Budi Santoso',
  'Andi Wijaya',
  'Deni Pratama',
  'Eko Saputra',
  'Fajar Ramadhan',
  'Gilang Permana',
  'Hendra Kusuma',
  'Irfan Hakim',
  'Joko Widodo',
  'Kurniawan Dwi',
  'Lukman Hakim',
  'Made Suryadi',
  'Nanda Pratama',
  'Oki Setiawan',
  'Putra Mahardika',
  'Qori Maulana',
  'Rendi Saputra',
  'Sandi Firmansyah',
  'Taufik Hidayat',
  'Umar Bakri',
  'Vino Bastian',
  'Wahyu Nugroho',
  'Yoga Aditya',
  'Zaki Rahman',
  'Ade Irawan',
  'Bayu Aji',
  'Candra Wijaya',
  'Dimas Anggara'
]

const namaSiswaPerempuan = [
  'Siti Nurhaliza',
  'Aisyah Putri',
  'Bella Safira',
  'Citra Dewi',
  'Dina Mariana',
  'Elsa Permata',
  'Fitri Handayani',
  'Gita Savitri',
  'Hani Rahmawati',
  'Indah Sari',
  'Jasmine Azzahra',
  'Kartika Sari',
  'Lestari Wulandari',
  'Maya Anggraini',
  'Nisa Aulia',
  'Olivia Maharani',
  'Putri Ayu',
  'Qonita Zahra',
  'Rina Susanti',
  'Sarah Amelia',
  'Tania Wijaya',
  'Umi Kalsum',
  'Vina Panduwinata',
  'Wulan Guritno',
  'Yuni Shara',
  'Zahra Nabila',
  'Anisa Rahma',
  'Bunga Citra',
  'Cantika Felder',
  'Dewi Persik'
]

const namaOrangTua = [
  'Bapak Suryanto',
  'Ibu Suryani',
  'Bapak Hartono',
  'Ibu Hartini',
  'Bapak Budiman',
  'Ibu Budiyati',
  'Bapak Santoso',
  'Ibu Santi',
  'Bapak Wijaya',
  'Ibu Wulandari',
  'Bapak Rahman',
  'Ibu Rahmawati',
  'Bapak Kusuma',
  'Ibu Kusumawati',
  'Bapak Hidayat',
  'Ibu Hidayati',
  'Bapak Permana',
  'Ibu Permanasari',
  'Bapak Saputra',
  'Ibu Saputri'
]

const alamat = [
  'Jl. Merdeka No. 123',
  'Jl. Sudirman No. 45',
  'Jl. Gatot Subroto No. 78',
  'Jl. Ahmad Yani No. 90',
  'Jl. Diponegoro No. 12',
  'Jl. Veteran No. 34',
  'Jl. Pahlawan No. 56',
  'Jl. Pemuda No. 67',
  'Jl. Kartini No. 89',
  'Jl. Hasanuddin No. 101',
  'Jl. Teuku Umar No. 23',
  'Jl. Cut Nyak Dien No. 45',
  'Jl. Imam Bonjol No. 67',
  'Jl. Supratman No. 89',
  'Jl. Cendrawasih No. 12'
]

// Generate NIS berdasarkan tahun masuk dan nomor urut
function generateNIS(tahunMasuk: number, urut: number): string {
  return `${tahunMasuk}${String(urut).padStart(3, '0')}`
}

// Generate NISN (10 digit)
function generateNISN(baseNumber: number): string {
  return `00${String(baseNumber).padStart(8, '0')}`
}

// Generate nomor telepon
function generatePhone(index: number): string {
  return `0812345${String(67890 + index).padStart(5, '0')}`
}

// Generate tanggal lahir berdasarkan kelas
function generateBirthDate(grade: string, month: number, day: number): string {
  const year = grade === '7' ? 2011 : grade === '8' ? 2010 : 2009

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Generate data siswa untuk satu kelas
function generateStudentsForClass(grade: string, className: string, count: number, startIndex: number): StudentType[] {
  const students: StudentType[] = []
  const tahunMasuk = grade === '7' ? 2024 : grade === '8' ? 2023 : 2022

  for (let i = 0; i < count; i++) {
    // Use deterministic selection based on index instead of random
    const isLaki = (startIndex + i) % 2 === 0
    const namaList = isLaki ? namaSiswaLaki : namaSiswaPerempuan
    const namaIndex = (startIndex + i) % namaList.length
    const nama = namaList[namaIndex]
    const nomorUrut = startIndex + i

    // Deterministic birth month and day based on index
    const month = ((startIndex + i) % 12) + 1
    const day = ((startIndex + i) % 28) + 1

    students.push({
      id: `STD-${String(nomorUrut).padStart(4, '0')}`,
      nis: generateNIS(tahunMasuk, nomorUrut),
      nisn: generateNISN(nomorUrut + 12345678),
      name: `${nama}${i > 0 && i < 26 ? ' ' + String.fromCharCode(65 + (i % 26)) : ''}`.trim(),
      grade,
      class: className,
      birthDate: generateBirthDate(grade, month, day),
      gender: isLaki ? 'L' : 'P',
      address: `${alamat[(startIndex + i) % alamat.length]}, Jakarta`,
      parentName: namaOrangTua[(startIndex + i) % namaOrangTua.length],
      parentPhone: generatePhone(nomorUrut),
      status: (startIndex + i) % 20 === 0 ? 'Cuti' : 'Aktif' // Every 20th student is on leave
    })
  }

  return students
}

// Generate semua data siswa
export function generateAllStudents(): StudentType[] {
  const allStudents: StudentType[] = []
  let currentIndex = 1

  const grades = ['7', '8', '9']
  const classes = ['A', 'B', 'C', 'D']

  // Fixed student counts per class for deterministic generation
  const studentCounts: Record<string, number> = {
    '7A': 28,
    '7B': 27,
    '7C': 29,
    '7D': 26,
    '8A': 30,
    '8B': 28,
    '8C': 27,
    '8D': 29,
    '9A': 26,
    '9B': 28,
    '9C': 30,
    '9D': 27
  }

  grades.forEach(grade => {
    classes.forEach(className => {
      const classKey = `${grade}${className}`
      const studentCount = studentCounts[classKey] || 28
      const students = generateStudentsForClass(grade, className, studentCount, currentIndex)

      allStudents.push(...students)

      currentIndex += studentCount
    })
  })

  return allStudents
}

// Generate data kelas
export function generateAllClasses(students: StudentType[]): ClassType[] {
  const classes: ClassType[] = []
  const grades = ['7', '8', '9']
  const classNames = ['A', 'B', 'C', 'D']

  const teachers = [
    'Ibu Aminah, S.Pd',
    'Bapak Ridwan, S.Pd',
    'Ibu Sari, S.Pd',
    'Bapak Ahmad, S.Pd',
    'Ibu Dewi, S.Pd',
    'Bapak Hendra, S.Pd',
    'Ibu Fitri, S.Pd',
    'Bapak Yanto, S.Pd',
    'Ibu Ratna, S.Pd',
    'Bapak Doni, S.Pd',
    'Ibu Lina, S.Pd',
    'Bapak Eko, S.Pd'
  ]

  let classIndex = 0

  grades.forEach(grade => {
    classNames.forEach(className => {
      const studentsInClass = students.filter(s => s.grade === grade && s.class === className)

      classes.push({
        id: `CLS-${String(classIndex + 1).padStart(3, '0')}`,
        grade,
        className,
        capacity: 32,
        currentStudents: studentsInClass.length,
        teacher: teachers[classIndex % teachers.length],
        academicYear: '2024/2025'
      })

      classIndex++
    })
  })

  return classes
}

// Generate SPP Rates untuk semua kelas
export function generateAllSPPRates(): SPPRateType[] {
  const rates: SPPRateType[] = []
  const grades = ['7', '8', '9']

  const amounts = {
    '7': 250000,
    '8': 275000,
    '9': 300000
  }

  grades.forEach((grade, index) => {
    rates.push({
      id: `RATE-${String(index + 1).padStart(3, '0')}`,
      grade,
      amount: amounts[grade as keyof typeof amounts],
      academicYear: '2024/2025',
      isActive: true
    })
  })

  return rates
}
