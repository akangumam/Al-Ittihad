'use client'

import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, Button, Typography, Grid, Chip, Divider, Alert } from '@mui/material'

import { useAppContext } from '@/contexts/AppContext'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

const ExpenseDetailView = () => {
  const { id } = useParams()
  const router = useRouter()
  const { lang: locale } = useParams()
  const { expenses, budgets } = useAppContext()

  // Find expense by ID
  const expense = expenses.find(exp => exp.id === id)

  // Find linked budget if any
  const linkedBudget = expense?.budgetId ? budgets.find(b => b.id === expense.budgetId) : null

  if (!expense) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>Data pengeluaran tidak ditemukan</Alert>
          <Button
            variant='contained'
            onClick={() => router.push(getLocalizedUrl('/keuangan/pengeluaran', locale as Locale))}
            className='mt-4'
          >
            Kembali ke List
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Typography variant='h4' className='font-medium mb-1'>
              Detail Pengeluaran
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Informasi lengkap transaksi pengeluaran
            </Typography>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => router.push(getLocalizedUrl('/keuangan/pengeluaran', locale as Locale))}
            >
              Kembali
            </Button>
            <Button variant='contained' startIcon={<i className='ri-printer-line' />}>
              Cetak
            </Button>
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-4'>
              Informasi Transaksi
            </Typography>
            <Divider className='mb-4' />

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  ID Transaksi
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {expense.id}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Tanggal
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {new Date(expense.date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Kategori
                </Typography>
                <Chip label={expense.category} size='small' color='error' variant='tonal' />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Metode Pembayaran
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {expense.paymentMethod}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Deskripsi
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {expense.description}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Akun Sumber
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {expense.account}
                </Typography>
              </Grid>

              {expense.referenceNo && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='caption' color='text.secondary' className='block mb-1'>
                    No. Referensi
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {expense.referenceNo}
                  </Typography>
                </Grid>
              )}

              {linkedBudget && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='caption' color='text.secondary' className='block mb-1'>
                    Terkait Budget
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <Chip label={linkedBudget.name} size='small' color='primary' variant='outlined' />
                    <Typography variant='caption' color='text.secondary'>
                      Realisasi: {((linkedBudget.realization / linkedBudget.amount) * 100).toFixed(1)}%
                    </Typography>
                  </div>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-4'>
              Jumlah
            </Typography>
            <Divider className='mb-4' />
            <Typography variant='h3' className='font-medium text-error text-center'>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(expense.amount)}
            </Typography>
          </CardContent>
        </Card>

        <Card className='mt-4'>
          <CardContent>
            <Typography variant='h6' className='mb-4'>
              Status
            </Typography>
            <Divider className='mb-4' />
            <Chip label='Selesai' color='success' className='w-full' />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ExpenseDetailView
