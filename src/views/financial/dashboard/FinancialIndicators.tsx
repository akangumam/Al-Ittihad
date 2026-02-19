'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'

interface IndicatorCardProps {
  title: string
  amount: number | string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  iconClass: string
  color: ThemeColor
  isCurrency?: boolean
}

const IndicatorCard = ({
  title,
  amount,
  change,
  changeType,
  iconClass,
  color,
  isCurrency = true
}: IndicatorCardProps) => {
  const theme = useTheme()

  const getChangeColor = () => {
    if (changeType === 'positive') return theme.palette.success.main
    if (changeType === 'negative') return theme.palette.error.main

    return theme.palette.grey[500]
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'ri-arrow-up-line'
    if (changeType === 'negative') return 'ri-arrow-down-line'

    return 'ri-arrow-right-line'
  }

  const formattedAmount =
    typeof amount === 'number' && isCurrency
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(amount)
      : amount

  return (
    <Card sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className='flex justify-between items-start flex-grow'>
          <div className='flex flex-col gap-1 flex-grow'>
            <Typography variant='body2' color='text.secondary' sx={{ minHeight: '3rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant='h5' fontWeight={600}>
              {formattedAmount}
            </Typography>
          </div>
          <CustomAvatar skin='light' variant='rounded' color={color} size={56} sx={{ flexShrink: 0 }}>
            <i className={iconClass} style={{ fontSize: '1.75rem' }} />
          </CustomAvatar>
        </div>
        <div className='flex items-center gap-2 mt-auto pt-2'>
          <div className='flex items-center' style={{ color: getChangeColor() }}>
            <i className={getChangeIcon()} />
            <Typography variant='body2' fontWeight={500} color='inherit'>
              {change}
            </Typography>
          </div>
          <Typography variant='body2' color='text.secondary'>
            vs bulan lalu
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

const FinancialIndicators = () => {
  const { incomes, expenses, accounts, priorityStudentFees } = useAppContext()

  // Calculate totals and changes
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const totalCash = accounts.reduce((acc, curr) => acc + curr.balance, 0)

  // Current month totals
  const thisMonthIncomes = incomes
    .filter(i => new Date(i.date).getMonth() === thisMonth && new Date(i.date).getFullYear() === thisYear)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const thisMonthExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear)
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Last month totals
  const lastMonthIncomes = incomes
    .filter(i => new Date(i.date).getMonth() === lastMonth && new Date(i.date).getFullYear() === lastMonthYear)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const lastMonthExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === lastMonth && new Date(e.date).getFullYear() === lastMonthYear)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { change: '100%', type: 'positive' as const }
    const pct = ((current - previous) / previous) * 100

    return {
      change: `${Math.abs(pct).toFixed(1)}%`,
      type: pct >= 0 ? ('positive' as const) : ('negative' as const)
    }
  }

  const incomeChange = calculateChange(thisMonthIncomes, lastMonthIncomes)
  const expenseChange = calculateChange(thisMonthExpenses, lastMonthExpenses)

  // Calculate Priority Fee arrears
  const totalPriorityArrears = priorityStudentFees.reduce((acc, fee) => {
    const total = fee.totalAmount || 0
    const paid = fee.paidAmount || 0

    return acc + Math.max(0, total - paid)
  }, 0)

  const indicators: IndicatorCardProps[] = [
    {
      title: 'Total Pemasukan',
      amount: totalIncomes,
      change: incomeChange.change,
      changeType: incomeChange.type,
      iconClass: 'ri-funds-line',
      color: 'success'
    },
    {
      title: 'Total Pengeluaran',
      amount: totalExpenses,
      change: expenseChange.change,
      changeType: expenseChange.type === 'positive' ? 'negative' : 'positive', // Expense up is usually bad
      iconClass: 'ri-shopping-cart-2-line',
      color: 'error'
    },
    {
      title: 'Total Saldo Kas',
      amount: totalCash,
      change: 'Bersih',
      changeType: 'neutral',
      iconClass: 'ri-wallet-3-line',
      color: 'primary'
    },
    {
      title: 'Piutang Registrasi & DU',
      amount: totalPriorityArrears,
      change: 'Ditagih',
      changeType: 'neutral',
      iconClass: 'ri-file-list-3-line',
      color: 'warning'
    }
  ]

  // cspell:enable

  return (
    <Grid container spacing={6} columns={12} sx={{ width: '100%', margin: 0 }}>
      {indicators.map((indicator, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index} sx={{ display: 'flex' }}>
          <IndicatorCard {...indicator} />
        </Grid>
      ))}
    </Grid>
  )
}

export default FinancialIndicators
