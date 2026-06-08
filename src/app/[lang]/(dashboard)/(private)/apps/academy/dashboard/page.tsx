'use client'

import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'

// Static imports — critical above-the-fold content
import FinancialWelcomeCard from '@/views/financial/dashboard/WelcomeCard'
import FinancialIndicators from '@/views/financial/dashboard/FinancialIndicators'
import AccountBalanceCards from '@/views/financial/dashboard/AccountBalanceCards'
import Alerts from '@/views/financial/dashboard/Alerts'

// Dynamic imports — heavy chart/table components (loaded after initial render)
const IncomeExpenseChart = dynamic(() => import('@/views/financial/dashboard/IncomeExpenseChart'), {
  loading: () => <Skeleton variant='rounded' height={320} />
})

const PriorityFeeChart = dynamic(() => import('@/views/financial/dashboard/SPPPaymentChart'), {
  loading: () => <Skeleton variant='rounded' height={320} />
})

const TeacherAttendanceSummary = dynamic(() => import('@/views/financial/dashboard/TeacherAttendanceSummary'), {
  loading: () => <Skeleton variant='rounded' height={200} />
})

const RecentTransactions = dynamic(() => import('@/views/financial/dashboard/RecentTransactions'), {
  loading: () => <Skeleton variant='rounded' height={300} />
})

const FinancialDashboard = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <FinancialWelcomeCard />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
        <FinancialIndicators />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
        <AccountBalanceCards />
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <IncomeExpenseChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <PriorityFeeChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherAttendanceSummary />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Alerts />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <RecentTransactions />
      </Grid>
    </Grid>
  )
}

export default FinancialDashboard
