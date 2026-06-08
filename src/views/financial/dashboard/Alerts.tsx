'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

interface AlertItem {
  severity: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  badge: string
  action: string
  link: string
}

const Alerts = () => {
  const { lang: locale } = useParams()
  const { budgets, incomes, priorityStudentFees, sppPayments } = useAppContext()

  const [exportReminder, setExportReminder] = useState<AlertItem | null>(null)

  // 1. Export Log Reminder
  useEffect(() => {
    const checkExportStatus = () => {
      const lastExport = localStorage.getItem('lastLogExportDate')
      const daysThreshold = 30

      let shouldRemind = false
      let daysSince = 0

      if (!lastExport) {
        shouldRemind = true
        daysSince = -1 // Never exported
      } else {
        const lastDate = new Date(lastExport)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - lastDate.getTime())

        daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (daysSince > daysThreshold) {
          shouldRemind = true
        }
      }

      if (shouldRemind) {
        setExportReminder({
          severity: daysSince > 60 || daysSince === -1 ? 'error' : 'warning',
          title: 'Backup Log Aktivitas Diperlukan',
          message:
            daysSince === -1
              ? 'Anda belum pernah melakukan export log aktivitas. Segera backup data log Anda.'
              : `Log aktivitas belum diexport selama ${daysSince} hari. Lakukan backup rutin untuk keamanan data.`,
          badge: daysSince === -1 ? 'PENTING' : `${daysSince} hari`,
          action: 'Buka Log Aktivitas',
          link: '/system/activity-log'
        })
      }
    }

    checkExportStatus()
  }, [])

  // 2. Dynamic Alerts Calculation
  const dynamicAlerts = useMemo(() => {
    const alerts: AlertItem[] = []

    // Shared date helpers
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long' }) // e.g. "Juni"
    const currentMonthNum = (now.getMonth() + 1).toString() // "6"
    const currentMonthPad = currentMonthNum.padStart(2, '0') // "06"

    // --- SPP Bulan Ini ---

    const currentYearStr = currentYear.toString()

    const thisMonthSPP = sppPayments.filter(p => {
      const monthMatch =
        p.month === currentMonthName ||
        p.month === currentMonthNum ||
        p.month === currentMonthPad
      return monthMatch && p.year === currentYearStr
    })

    const unpaidSPP = thisMonthSPP.filter(p => p.status === 'Belum Lunas')

    if (unpaidSPP.length > 0) {
      alerts.push({
        severity: unpaidSPP.length > 20 ? 'error' : 'warning',
        title: `Tunggakan SPP ${currentMonthName} ${currentYearStr}`,
        message: `${unpaidSPP.length} siswa belum membayar SPP bulan ${currentMonthName} ${currentYearStr}.`,
        badge: unpaidSPP.length.toString(),
        action: 'Lihat Tunggakan',
        link: '/spp/tunggakan'
      })
    }

    // --- Priority Fee Arrears Alert ---
    const priorityArrearsCount = (priorityStudentFees || []).filter(
      f => (f.totalAmount || 0) > (f.paidAmount || 0)
    ).length

    if (priorityArrearsCount > 0) {
      alerts.push({
        severity: priorityArrearsCount > 10 ? 'error' : 'info',
        title: 'Tunggakan Biaya Registrasi/DU',
        message: `${priorityArrearsCount} siswa memiliki tagihan registrasi atau daftar ulang yang belum lunas.`,
        badge: priorityArrearsCount.toString(),
        action: 'Kelola Tagihan',
        link: '/apps/financial/fees'
      })
    }

    // --- Budget Warning ---
    const criticalBudgets = budgets.filter(b => b.amount > 0 && b.realization / b.amount >= 0.8)

    if (criticalBudgets.length > 0) {
      const mostCritical = criticalBudgets.sort((a, b) => b.realization / b.amount - a.realization / a.amount)[0]
      const percentageValue = (mostCritical.realization / mostCritical.amount) * 100
      const percentage = percentageValue.toFixed(0)

      alerts.push({
        severity: percentageValue >= 100 ? 'error' : 'warning',
        title: 'Anggaran Mendekati Limit',
        message: `${mostCritical.name} telah mencapai ${percentage}% dari pagu anggaran.`,
        badge: `${percentage}%`,
        action: 'Review Anggaran',
        link: '/rab/realisasi'
      })
    }

    // --- BOS Deadline ---
    // Quarterly deadlines (end of month)
    const quarters = [
      new Date(currentYear, 2, 31), // March 31
      new Date(currentYear, 5, 30), // June 30
      new Date(currentYear, 8, 30), // Sept 30
      new Date(currentYear, 11, 31) // Dec 31
    ]

    const nextDeadline = quarters.find(q => q > now) || new Date(currentYear + 1, 2, 31)
    const diffTime = nextDeadline.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysLeft <= 15) {
      alerts.push({
        severity: daysLeft <= 5 ? 'error' : 'info',
        title: 'Laporan BOS Jatuh Tempo',
        message: `Laporan BOS triwulan ${Math.ceil((nextDeadline.getMonth() + 1) / 3)} harus diserahkan dalam ${daysLeft} hari.`,
        badge: `${daysLeft} hari`,
        action: 'Siapkan Laporan',
        link: '/laporan/keuangan'
      })
    }

    // --- Income Performance ---
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)

      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const totalMonthIncome = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0)

    // Default target for MTs Al-Ittihad (e.g. 50.000.000/month)
    const incomeTarget = 50000000

    if (totalMonthIncome >= incomeTarget) {
      const overTarget = ((totalMonthIncome / incomeTarget - 1) * 100).toFixed(1)

      alerts.push({
        severity: 'success',
        title: 'Target Pemasukan Tercapai',
        message: `Pemasukan bulan ini mencapai target (melebihi ${overTarget}%).`,
        badge: '✓',
        action: 'Lihat Laporan',
        link: '/keuangan/pemasukan'
      })
    }

    return alerts
  }, [budgets, incomes, priorityStudentFees, sppPayments])

  const allAlerts = exportReminder ? [exportReminder, ...dynamicAlerts] : dynamicAlerts

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title='Alerts & Notifikasi' subheader='Informasi penting yang perlu perhatian' />
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {allAlerts.length > 0 ? (
            allAlerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.severity}
                sx={{
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AlertTitle sx={{ mb: 0 }}>{alert.title}</AlertTitle>
                  <Chip label={alert.badge} size='small' color={alert.severity} sx={{ fontWeight: 600 }} />
                </Box>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  {alert.message}
                </Typography>
                <Link href={getLocalizedUrl(alert.link, locale as Locale)} className='no-underline'>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {alert.action} →
                  </Typography>
                </Link>
              </Alert>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 1 }}>
              <i className='ri-checkbox-circle-line' style={{ fontSize: '2rem', opacity: 0.5 }} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                Semua sistem berjalan normal.
                <br />
                Tidak ada alert penting saat ini.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default Alerts
