'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

interface BudgetItemProps {
  category: string
  budgeted: number
  spent: number
}

const BudgetItem = ({ category, budgeted, spent }: BudgetItemProps) => {
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0
  const remaining = budgeted - spent

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = () => {
    if (percentage >= 100) return 'error'
    if (percentage >= 80) return 'warning'

    return 'success'
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant='body2' fontWeight={600} className='truncate' sx={{ maxWidth: '80%' }}>
          {category}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
      <LinearProgress
        variant='determinate'
        value={Math.min(percentage, 100)}
        color={getStatusColor()}
        sx={{ height: 8, borderRadius: 1, mb: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant='caption' color='text.secondary'>
          Terpakai: {formatCurrency(spent)}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Sisa: {formatCurrency(remaining)}
        </Typography>
      </Box>
    </Box>
  )
}

const BudgetOverview = () => {
  const { budgets } = useAppContext()

  // Calculate totals from ALL budgets
  const totalBudgeted = budgets.reduce((acc, item) => acc + item.amount, 0)
  const totalSpent = budgets.reduce((acc, item) => acc + item.realization, 0)
  const totalPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  // Slice for display (show top 5 or all with scroll)
  const budgetData = budgets.slice(0, 5).map(b => ({
    category: b.name,
    budgeted: b.amount,
    spent: b.realization
  }))

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} juta`
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='Realisasi Anggaran'
        subheader={`Tahun Ajaran ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}
      />
      <CardContent sx={{ flex: 1 }}>
        <Box
          sx={{
            mb: 4,
            p: 4,
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Total Realisasi Anggaran
          </Typography>
          <Typography variant='h4' fontWeight={600} color='primary.main' gutterBottom>
            {formatCurrency(totalSpent)}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            dari {formatCurrency(totalBudgeted)} ({totalPercentage.toFixed(1)}%)
          </Typography>
        </Box>

        {budgetData.length > 0 ? (
          budgetData.map((item, index) => <BudgetItem key={index} {...item} />)
        ) : (
          <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
            Belum ada data anggaran
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default BudgetOverview
