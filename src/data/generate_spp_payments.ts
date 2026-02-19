import type { SPPPaymentType } from '@/contexts/AppContext'
import studentsData from './students_data.json'

// Generate realistic SPP payment data for students
export function generateSPPPayments(): SPPPaymentType[] {
  const payments: SPPPaymentType[] = []

  // Month names in Indonesian
  const months = [
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni'
  ]

  // Get only active students (first 50 for demo)
  const activeStudents = studentsData.filter((s: any) => s.status === 'Aktif').slice(0, 50)

  let paymentCounter = 1

  activeStudents.forEach((student: any) => {
    // Determine how many months this student has paid
    // Some students paid all months, some have arrears
    const randomPaymentRate = Math.random()

    let monthsToPay: number

    if (randomPaymentRate > 0.7) {
      // 30% students - paid all months (Juli - November = 5 months)
      monthsToPay = 5
    } else if (randomPaymentRate > 0.4) {
      // 30% students - paid 3-4 months (have 1-2 months arrears)
      monthsToPay = 3 + Math.floor(Math.random() * 2)
    } else {
      // 40% students - paid 1-2 months (have more arrears)
      monthsToPay = 1 + Math.floor(Math.random() * 2)
    }

    // Generate payments for this student
    for (let i = 0; i < monthsToPay; i++) {
      const monthIndex = i
      const monthName = months[monthIndex]
      const year = monthIndex < 6 ? '2024' : '2025'
      const academicYear = '2024/2025'

      // Payment date is usually within the month or slightly after
      const paymentDay = 5 + Math.floor(Math.random() * 20) // Day 5-25
      const paymentMonth = monthIndex + 7 // Juli = 7
      const paymentMonthActual = paymentMonth > 12 ? paymentMonth - 12 : paymentMonth
      const paymentYear = paymentMonth > 12 ? 2025 : 2024
      const paymentDate = `${paymentYear}-${String(paymentMonthActual).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`

      // Determine payment method (weighted random)
      const methodRandom = Math.random()
      let paymentMethod: 'Tunai' | 'Transfer' | 'EDC'
      let account: string

      if (methodRandom > 0.6) {
        paymentMethod = 'Transfer'
        account = 'ACC-002' // Bank BSI
      } else if (methodRandom > 0.3) {
        paymentMethod = 'Tunai'
        account = 'ACC-001' // Kas Tunai
      } else {
        paymentMethod = 'EDC'
        account = 'ACC-002' // Bank BSI
      }

      // SPP amount based on grade (from spp_rates_data.json)
      const amount = 250000 // Standard SPP for all grades in this demo

      const payment: SPPPaymentType = {
        id: `SPP-${String(paymentCounter).padStart(4, '0')}`,
        studentId: student.id,
        studentName: student.fullName || student.name,
        grade: student.grade || '7',
        class: student.class || 'A',
        academicYear: academicYear,
        month: monthName,
        year: year,
        amount: amount,
        paymentDate: paymentDate,
        account: account,
        paymentMethod: paymentMethod,
        receiptNo: `RECEIPT-${paymentYear}${String(paymentMonthActual).padStart(2, '0')}-${String(paymentCounter).padStart(4, '0')}`,
        status: 'Lunas',
        sppRateId: `RATE-${student.grade || '7'}`
      }

      payments.push(payment)
      paymentCounter++
    }
  })

  // Sort by payment date (newest first)
  payments.sort((a, b) => {
    const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0
    const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0

    return dateB - dateA
  })

  return payments
}
