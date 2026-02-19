'use client'

import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, Button, Typography, Grid, Chip, Divider, Alert } from '@mui/material'

import { useAppContext } from '@/contexts/AppContext'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

const IncomeDetailView = () => {
  const params = useParams()
  const router = useRouter()
  const { incomes } = useAppContext()

  // Get ID from params - handle both string and array
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const locale = Array.isArray(params.lang) ? params.lang[0] : params.lang

  // Debug logging
  console.log('=== IncomeDetailView Debug ===')
  console.log('ID from params:', id)
  console.log('All incomes:', incomes)
  console.log('Income count:', incomes.length)

  // Find income by ID
  const income = incomes.find(inc => {
    console.log('Comparing:', inc.id, 'with', id, 'Match:', inc.id === id)

    return inc.id === id
  })

  console.log('Found income:', income)

  if (!income) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Alert severity='error' className='mb-4'>
                Data pemasukan tidak ditemukan
              </Alert>
              <Typography variant='body2' className='mb-4'>
                ID: {id}
                <br />
                Total Incomes in Context: {incomes.length}
                <br />
                Available IDs: {incomes.map(inc => inc.id).join(', ')}
              </Typography>
              <Button
                variant='contained'
                onClick={() => router.push(getLocalizedUrl('/keuangan/pemasukan', locale as Locale))}
              >
                Kembali ke List
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Typography variant='h4' className='font-medium mb-1'>
              Detail Pemasukan
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Informasi lengkap transaksi pemasukan
            </Typography>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => router.push(getLocalizedUrl('/keuangan/pemasukan', locale as Locale))}
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
                  {income.id}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Tanggal
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {new Date(income.date).toLocaleDateString('id-ID', {
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
                <Chip label={income.category} size='small' color='success' variant='tonal' />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Metode Pembayaran
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {income.paymentMethod}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Deskripsi
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {income.description}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>
                  Akun Tujuan
                </Typography>
                <Typography variant='body1' className='font-medium'>
                  {income.account}
                </Typography>
              </Grid>

              {income.referenceNo && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='caption' color='text.secondary' className='block mb-1'>
                    No. Referensi
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {income.referenceNo}
                  </Typography>
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
            <Typography variant='h3' className='font-medium text-success text-center'>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(income.amount)}
            </Typography>
          </CardContent>
        </Card>

        <Card className='mt-4'>
          <CardContent>
            <Typography variant='h6' className='mb-4'>
              Status
            </Typography>
            <Divider className='mb-4' />
            <Chip label='Lunas' color='success' className='w-full' />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default IncomeDetailView
