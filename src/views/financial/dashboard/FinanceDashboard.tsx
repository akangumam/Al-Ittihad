'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Locale } from '@configs/i18n'

// Service Imports
import { incomeAPI, expenseAPI, priorityStudentFeeAPI } from '@/services/api'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const FinanceDashboard = () => {
  // Hooks
  const { lang: locale } = useParams()

  const now = useMemo(() => new Date(), [])

  const currentMonthName = useMemo(() => now.toLocaleDateString('id-ID', { month: 'long' }), [now])
  const currentYearStr = useMemo(() => now.getFullYear().toString(), [now])

  const [selectedPeriod, setSelectedPeriod] = useState(`${currentMonthName.toLowerCase()}-${currentYearStr}`)

  // Data States
  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [priorityFees, setPriorityFees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [incomesData, expensesData, priorityFeesData] = await Promise.all([
        incomeAPI.getAll(),
        expenseAPI.getAll(),
        priorityStudentFeeAPI.getByStudentId('all')
      ])

      setIncomes(incomesData || [])
      setExpenses(expensesData || [])
      setPriorityFees(priorityFeesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Process Stats Data
  const statsData = useMemo(() => {
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0)
    const currentBalance = totalIncome - totalExpense

    // Priority Fee Collection Rate
    const totalAssignedAmount = priorityFees.reduce((sum, fee) => sum + fee.totalAmount, 0)
    const totalPaidAmount = priorityFees.reduce((sum, fee) => sum + fee.paidAmount, 0)
    const collectionRate = totalAssignedAmount > 0 ? (totalPaidAmount / totalAssignedAmount) * 100 : 0
    const lunasCount = priorityFees.filter(f => f.status === 'LUNAS').length
    const totalAssignedCount = priorityFees.length

    // Monthly Trend (Last 5 months)
    const trendData: { month: string; monthIdx: number; year: number; income: number; expense: number }[] = []

    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)

      trendData.push({
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        income: 0,
        expense: 0
      })
    }

    incomes.forEach(inc => {
      const date = new Date(inc.date)
      const m = date.getMonth()
      const y = date.getFullYear()
      const match = trendData.find(t => t.monthIdx === m && t.year === y)

      if (match) match.income += inc.amount
    })

    expenses.forEach(exp => {
      const date = new Date(exp.date)
      const m = date.getMonth()
      const y = date.getFullYear()
      const match = trendData.find(t => t.monthIdx === m && t.year === y)

      if (match) match.expense += exp.amount
    })

    // Expense by Category
    const categoryTotals: Record<string, number> = {}

    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
    })

    const expenseByCategory = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      totalIncome,
      totalExpense,
      currentBalance,
      collectionRate: parseFloat(collectionRate.toFixed(1)),
      lunasCount,
      totalAssignedCount,
      monthlyTrend: trendData,
      expenseByCategory
    }
  }, [incomes, expenses, priorityFees, now])

  // Recent Transactions
  const recentTransactions = useMemo(() => {
    const combined = [
      ...incomes.map(item => ({ ...item, type: 'income' as const })),
      ...expenses.map(item => ({ ...item, type: 'expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return combined.slice(0, 5)
  }, [incomes, expenses])

  const balancePercentage = statsData.totalIncome > 0 ? (statsData.currentBalance / statsData.totalIncome) * 100 : 0

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-vh-100 p-20'>
        <div className='flex flex-col items-center gap-4'>
          <CircularProgress />
          <Typography>Memuat data dashboard...</Typography>
        </div>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex justify-between items-center flex-wrap gap-4'>
          <div>
            <Typography variant='h4' className='font-medium mbe-1'>
              Dashboard Keuangan Sekolah
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Monitoring keuangan real-time & analisis pendapatan
            </Typography>
          </div>
          <FormControl size='small' className='min-is-[180px]'>
            <InputLabel>Periode</InputLabel>
            <Select value={selectedPeriod} label='Periode' onChange={e => setSelectedPeriod(e.target.value)}>
              <MenuItem value={`${currentMonthName.toLowerCase()}-${currentYearStr}`}>
                {currentMonthName} {currentYearStr}
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar variant='rounded' sx={{ backgroundColor: 'success.light', color: 'success.main' }}>
                  <i className='ri-arrow-down-circle-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Total Pemasukan
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-success text-truncate'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(statsData.totalIncome)}
              </Typography>
              <div className='flex items-center gap-1 mbs-1'>
                <Typography variant='caption' color='text.secondary'>
                  Total kumulatif
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar variant='rounded' sx={{ backgroundColor: 'error.light', color: 'error.main' }}>
                  <i className='ri-arrow-up-circle-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Total Pengeluaran
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-error text-truncate'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(statsData.totalExpense)}
              </Typography>
              <div className='flex items-center gap-1 mbs-1'>
                <Typography variant='caption' color='text.secondary'>
                  Total kumulatif
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar variant='rounded' sx={{ backgroundColor: 'primary.light', color: 'primary.main' }}>
                  <i className='ri-wallet-3-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Saldo Saat Ini
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-primary text-truncate'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(statsData.currentBalance)}
              </Typography>
              <div className='flex flex-col gap-1 mbs-1'>
                <LinearProgress
                  variant='determinate'
                  value={Math.min(Math.max(balancePercentage, 0), 100)}
                  className='h-1.5'
                />
                <Typography variant='caption' color='text.secondary'>
                  {balancePercentage.toFixed(1)}% dari pendapatan
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar variant='rounded' sx={{ backgroundColor: 'warning.light', color: 'warning.main' }}>
                  <i className='ri-percent-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Kolektibilitas Biaya
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-warning'>
                {statsData.collectionRate}%
              </Typography>
              <div className='flex flex-col gap-1 mbs-1'>
                <LinearProgress
                  variant='determinate'
                  value={statsData.collectionRate}
                  color='warning'
                  className='h-1.5'
                />
                <Typography variant='caption' color='text.secondary text-truncate'>
                  {statsData.lunasCount}/{statsData.totalAssignedCount} Tagihan Lunas
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Alerts */}
      <Grid size={{ xs: 12 }}>
        <Alert
          severity='info'
          action={
            <Button
              size='small'
              color='info'
              component={Link}
              href={getLocalizedUrl('/apps/financial/fees', locale as Locale)}
            >
              Lihat Detail
            </Button>
          }
        >
          <Typography variant='body2' className='font-medium'>
            Informasi: Monitor piutang biaya pendaftaran & daftar ulang secara berkala untuk menjaga arus kas sekolah.
          </Typography>
        </Alert>
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Aksi Cepat' subheader='Akses cepat untuk transaksi harian' />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  color='success'
                  startIcon={<i className='ri-add-circle-line' />}
                  component={Link}
                  href={getLocalizedUrl('/keuangan/pemasukan', locale as Locale)}
                  className='h-12'
                >
                  Tambah Pemasukan
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  color='error'
                  startIcon={<i className='ri-subtract-line' />}
                  component={Link}
                  href={getLocalizedUrl('/keuangan/pengeluaran', locale as Locale)}
                  className='h-12'
                >
                  Catat Pengeluaran
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  color='primary'
                  startIcon={<i className='ri-money-dollar-circle-line' />}
                  component={Link}
                  href={getLocalizedUrl('/apps/financial/fees', locale as Locale)}
                  className='h-12'
                >
                  Entri Pembayaran
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-file-chart-line' />}
                  component={Link}
                  href={getLocalizedUrl('/laporan/bku', locale as Locale)}
                  className='h-12'
                >
                  Cetak Laporan
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Expense by Category */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Distribusi Pengeluaran'
            subheader='Breakdown per kategori'
            action={
              <Button
                size='small'
                variant='text'
                endIcon={<i className='ri-arrow-right-s-line' />}
                component={Link}
                href={getLocalizedUrl('/laporan/pengeluaran', locale as Locale)}
              >
                Lihat Semua
              </Button>
            }
          />
          <CardContent>
            <div className='flex flex-col gap-4'>
              {statsData.expenseByCategory.length > 0 ? (
                statsData.expenseByCategory.map((category, index) => (
                  <div key={index} className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                      <Typography variant='body2' className='font-medium'>
                        {category.name}
                      </Typography>
                      <Typography variant='body2' className='font-medium text-error'>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0
                        }).format(category.amount)}
                      </Typography>
                    </div>
                    <div className='flex items-center gap-2'>
                      <LinearProgress
                        variant='determinate'
                        value={category.percentage}
                        color='error'
                        className='flex-1 h-2'
                      />
                      <Typography variant='caption' color='text.secondary' className='min-w-[45px] text-right'>
                        {category.percentage.toFixed(1)}%
                      </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary' className='text-center py-10'>
                  Belum ada data pengeluaran
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Transactions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Transaksi Terbaru'
            subheader='5 transaksi terakhir'
            action={
              <Button
                size='small'
                variant='text'
                endIcon={<i className='ri-arrow-right-s-line' />}
                component={Link}
                href={getLocalizedUrl('/keuangan/pemasukan', locale as Locale)}
              >
                Lihat Semua
              </Button>
            }
          />
          <CardContent>
            <div className='flex flex-col gap-4'>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((trx, index) => (
                  <div key={index} className='flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0'>
                    <Avatar
                      variant='rounded'
                      sx={{
                        backgroundColor: trx.type === 'income' ? 'success.light' : 'error.light',
                        color: trx.type === 'income' ? 'success.main' : 'error.main',
                        width: 42,
                        height: 42
                      }}
                    >
                      <i className={`${trx.type === 'income' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'} text-xl`} />
                    </Avatar>
                    <div className='flex-1 shrink-0 min-w-0'>
                      <div className='flex justify-between items-start gap-2'>
                        <div className='min-w-0'>
                          <Typography variant='body2' className='font-medium truncate'>
                            {trx.description}
                          </Typography>
                          <div className='flex items-center gap-2 mbs-0.5 truncate'>
                            <Chip
                              label={trx.category}
                              size='small'
                              variant='tonal'
                              color='default'
                              sx={{ height: 20, fontSize: '0.625rem' }}
                            />
                            <Typography variant='caption' color='text.secondary'>
                              {new Date(trx.date).toLocaleDateString('id-ID')}
                            </Typography>
                          </div>
                        </div>
                        <Typography
                          variant='body2'
                          className={`font-medium whitespace-nowrap ${
                            trx.type === 'income' ? 'text-success' : 'text-error'
                          }`}
                        >
                          {trx.type === 'income' ? '+' : '-'}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0
                          }).format(trx.amount)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary' className='text-center py-10'>
                  Belum ada transaksi terbaru
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Trend Summary */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Trend Bulanan' subheader='Perbandingan pemasukan vs pengeluaran terakhir' />
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4'>
                      <Typography variant='body2' className='font-medium'>
                        Bulan
                      </Typography>
                    </th>
                    <th className='text-right py-3 px-4'>
                      <Typography variant='body2' className='font-medium text-success'>
                        Pemasukan
                      </Typography>
                    </th>
                    <th className='text-right py-3 px-4'>
                      <Typography variant='body2' className='font-medium text-error'>
                        Pengeluaran
                      </Typography>
                    </th>
                    <th className='text-right py-3 px-4'>
                      <Typography variant='body2' className='font-medium text-primary'>
                        Surplus/Defisit
                      </Typography>
                    </th>
                    <th className='text-right py-3 px-4'>
                      <Typography variant='body2' className='font-medium'>
                        Rasio
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.monthlyTrend.map((month, index) => {
                    const surplus = month.income - month.expense
                    const ratio = month.income > 0 ? ((month.expense / month.income) * 100).toFixed(1) : '0.0'

                    return (
                      <tr key={index} className='border-b last:border-0 hover:bg-action-hover'>
                        <td className='py-3 px-4'>
                          <Typography variant='body2' className='font-medium'>
                            {month.month} {month.year}
                          </Typography>
                        </td>
                        <td className='text-right py-3 px-4'>
                          <Typography variant='body2' className='text-success'>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0
                            }).format(month.income)}
                          </Typography>
                        </td>
                        <td className='text-right py-3 px-4'>
                          <Typography variant='body2' className='text-error'>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0
                            }).format(month.expense)}
                          </Typography>
                        </td>
                        <td className='text-right py-3 px-4'>
                          <Typography
                            variant='body2'
                            className={`font-medium ${surplus >= 0 ? 'text-success' : 'text-error'}`}
                          >
                            {surplus >= 0 ? '+' : ''}
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0
                            }).format(surplus)}
                          </Typography>
                        </td>
                        <td className='text-right py-3 px-4'>
                          <Chip
                            label={`${ratio}%`}
                            size='small'
                            color={parseFloat(ratio) < 70 ? 'success' : parseFloat(ratio) < 85 ? 'warning' : 'error'}
                            variant='tonal'
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default FinanceDashboard
