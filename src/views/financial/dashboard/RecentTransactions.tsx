'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { Locale } from '@configs/i18n'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

interface Transaction {
  id: string
  date: string
  type: 'pemasukan' | 'pengeluaran'
  category: string
  description: string
  amount: number
  paymentMethod: string
}

const RecentTransactions = () => {
  const theme = useTheme()
  const router = useRouter()
  const { lang: locale } = useParams()
  const { incomes, expenses } = useAppContext()

  // Combine incomes and expenses, then sort by date (most recent first)
  const combinedTransactions: Transaction[] = useMemo(() => {
    const incomeTransactions: Transaction[] = incomes.map(income => ({
      id: income.id,
      date: income.date,
      type: 'pemasukan' as const,
      category: income.category,
      description: income.description,
      amount: income.amount,
      paymentMethod: income.paymentMethod
    }))

    const expenseTransactions: Transaction[] = expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      type: 'pengeluaran' as const,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod
    }))

    const combined = [...incomeTransactions, ...expenseTransactions]

    // Sort by date descending (most recent first) and limit to 7
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7)
  }, [incomes, expenses])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const handleViewTransaction = (transaction: Transaction) => {
    const path = transaction.type === 'pemasukan' ? '/keuangan/pemasukan' : '/keuangan/pengeluaran'

    router.push(getLocalizedUrl(path, locale as Locale))
  }

  return (
    <Card>
      <CardHeader
        title='Transaksi Terbaru'
        subheader='7 transaksi terakhir'
        action={
          <Chip
            label='Lihat Semua'
            variant='outlined'
            size='small'
            clickable
            onClick={() => router.push(getLocalizedUrl('/keuangan/pemasukan', locale as Locale))}
          />
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Jenis</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Keterangan</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell align='right'>Jumlah</TableCell>
                <TableCell align='center'>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {combinedTransactions.length > 0 ? (
                combinedTransactions.map(transaction => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Chip label={transaction.id.slice(0, 8)} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          <i
                            className={transaction.type === 'pemasukan' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}
                            style={{ fontSize: '1rem' }}
                          />
                        }
                        label={transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        color={transaction.type === 'pemasukan' ? 'success' : 'error'}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell sx={{ maxWidth: 250 }} className='truncate'>
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Chip label={transaction.paymentMethod} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        fontWeight: 600,
                        color: transaction.type === 'pemasukan' ? theme.palette.success.main : theme.palette.error.main
                      }}
                    >
                      {transaction.type === 'pemasukan' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Lihat Detail'>
                        <IconButton size='small' color='primary' onClick={() => handleViewTransaction(transaction)}>
                          <i className='ri-eye-line' style={{ fontSize: '1.2rem' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 10 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Belum ada transaksi terbaru
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default RecentTransactions
