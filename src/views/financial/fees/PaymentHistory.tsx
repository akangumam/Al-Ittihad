'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { Search, Printer, FileText, Calendar } from 'lucide-react'

import { useAppContext } from '@/contexts/AppContext'

const PaymentHistory = () => {
  const { priorityFeePayments } = useAppContext()
  const [search, setSearch] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const filteredPayments = useMemo(() => {
    return priorityFeePayments.filter(payment => {
      const studentName = payment.student?.name || ''
      const receiptNo = payment.receiptNo || ''

      return (
        studentName.toLowerCase().includes(search.toLowerCase()) ||
        receiptNo.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [priorityFeePayments, search])

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h5' fontWeight={700}>
          Riwayat Pembayaran
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, display: 'flex', gap: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              size='small'
              placeholder='Cari Nama Siswa/No. Kwitansi...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search size={18} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>No. Kwitansi</TableCell>
                  <TableCell>Siswa</TableCell>
                  <TableCell>Tagihan</TableCell>
                  <TableCell align='right'>Nominal</TableCell>
                  <TableCell>Metode</TableCell>
                  <TableCell align='center'>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map(payment => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Calendar size={14} color='grey' />
                        <Typography variant='body2'>{formatDate(payment.paymentDate)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={600} color='primary'>
                        {payment.receiptNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={600}>
                        {payment.student?.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {payment.student?.nis}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{payment.studentFee?.template?.name}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2' fontWeight={700}>
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.paymentMethod} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton size='small' color='primary' title='Cetak Kwitansi'>
                          <Printer size={16} />
                        </IconButton>
                        <IconButton size='small' title='Lihat Detail'>
                          <FileText size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                      <Typography variant='body1' color='text.secondary'>
                        Belum ada riwayat pembayaran yang ditemukan
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PaymentHistory
