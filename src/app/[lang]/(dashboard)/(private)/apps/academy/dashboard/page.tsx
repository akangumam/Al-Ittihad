'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import FinancialWelcomeCard from '@/views/financial/dashboard/WelcomeCard'
import FinancialIndicators from '@/views/financial/dashboard/FinancialIndicators'
import AccountBalanceCards from '@/views/financial/dashboard/AccountBalanceCards'
import IncomeExpenseChart from '@/views/financial/dashboard/IncomeExpenseChart'
import PriorityFeeChart from '@/views/financial/dashboard/SPPPaymentChart'
import RecentTransactions from '@/views/financial/dashboard/RecentTransactions'
import Alerts from '@/views/financial/dashboard/Alerts'
import TeacherAttendanceSummary from '@/views/financial/dashboard/TeacherAttendanceSummary'

const FinancialDashboard = () => {
  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12 }}>
        <FinancialWelcomeCard />
      </Grid>

      {/* Financial Indicators - 4 Cards */}
      <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
        <FinancialIndicators />
      </Grid>

      {/* Account Balances */}
      <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
        <AccountBalanceCards />
      </Grid>

      {/* Charts Section - Equal Heights */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <IncomeExpenseChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <PriorityFeeChart />
      </Grid>

      {/* Teacher Attendance & Alerts - Side by Side */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherAttendanceSummary />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Alerts />
      </Grid>

      {/* Recent Transactions */}
      <Grid size={{ xs: 12 }}>
        <RecentTransactions />
      </Grid>
    </Grid>
  )
}

export default FinancialDashboard
