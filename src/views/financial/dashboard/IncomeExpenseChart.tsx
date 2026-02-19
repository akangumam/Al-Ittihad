'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// Recharts Imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// Prepare data for the last 12 months
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Juli', 'Agust', 'Sep', 'Okt', 'Nov', 'Des']

interface ChartDataPoint {
  month: string
  monthNum: number
  year: number
  pemasukan: number
  pengeluaran: number
}

const IncomeExpenseChart = () => {
  const theme = useTheme()
  const { incomes, expenses } = useAppContext()

  // Prepare data for the last 12 months
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const data = useMemo(() => {
    // Initialize data for last 12 months
    const last12Months: ChartDataPoint[] = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const monthIndex = d.getMonth()
      const year = d.getFullYear()

      last12Months.push({
        month: MONTHS[monthIndex],
        monthNum: monthIndex,
        year: year,
        pemasukan: 0,
        pengeluaran: 0
      })
    }

    // Aggregate incomes
    incomes.forEach(inc => {
      const incDate = new Date(inc.date)
      const m = incDate.getMonth()
      const y = incDate.getFullYear()

      const monthData = last12Months.find(d => d.monthNum === m && d.year === y)

      if (monthData) {
        monthData.pemasukan += inc.amount
      }
    })

    // Aggregate expenses
    expenses.forEach(exp => {
      const expDate = new Date(exp.date)
      const m = expDate.getMonth()
      const y = expDate.getFullYear()

      const monthData = last12Months.find(d => d.monthNum === m && d.year === y)

      if (monthData) {
        monthData.pengeluaran += exp.amount
      }
    })

    return last12Months
  }, [incomes, expenses, currentMonth, currentYear])

  const formatCurrency = (value: number) => {
    if (value === 0) return 'Rp 0'

    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`
    }

    return `Rp ${(value / 1000).toFixed(0)}rb`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 4, boxShadow: theme.shadows[4] }}>
          <Typography variant='body2' fontWeight={600} gutterBottom>
            {payload[0].payload.month} {payload[0].payload.year}
          </Typography>
          <Typography variant='body2' sx={{ color: theme.palette.success.main }}>
            Pemasukan: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payload[0].value)}
          </Typography>
          <Typography variant='body2' sx={{ color: theme.palette.error.main }}>
            Pengeluaran:{' '}
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payload[1].value)}
          </Typography>
          <Typography
            variant='body2'
            fontWeight={600}
            sx={{ mt: 1, borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}
          >
            Selisih:{' '}
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
              payload[0].value - payload[1].value
            )}
          </Typography>
        </Card>
      )
    }

    return null
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='Pemasukan vs Pengeluaran'
        subheader='Trend keuangan 12 bulan terakhir'
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
              <Typography variant='body2'>Pemasukan</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
              <Typography variant='body2'>Pengeluaran</Typography>
            </Box>
          </Box>
        }
      />
      <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width='100%' height='100%' minHeight={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
            <XAxis dataKey='month' stroke={theme.palette.text.secondary} style={{ fontSize: '0.875rem' }} />
            <YAxis
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '0.875rem' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type='monotone'
              dataKey='pemasukan'
              stroke={theme.palette.success.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.success.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type='monotone'
              dataKey='pengeluaran'
              stroke={theme.palette.error.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.error.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default IncomeExpenseChart
