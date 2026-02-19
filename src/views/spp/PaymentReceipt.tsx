import React, { forwardRef } from 'react'

import Image from 'next/image'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

import './print.css'

type ReceiptProps = {
  data: {
    transactionId: string
    date: string
    studentName: string
    studentNIS: string
    studentClass: string
    months: string[]
    amount: number
    paymentMethod: string
    adminName: string
  }
}

const PaymentReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  return (
    <Card ref={ref} className='previewCard' style={{ minHeight: '100vh' }}>
      <CardContent className='sm:!p-12 flex flex-col' style={{ minHeight: '100vh' }}>
        <Grid container spacing={6} className='flex-grow'>
          {/* Header */}
          <Grid size={{ xs: 12 }}>
            <div className='p-6 bg-actionHover rounded'>
              <div className='flex justify-between gap-y-4 gap-x-6 flex-col sm:flex-row sm:items-start'>
                <div className='flex flex-col gap-4'>
                  <div>
                    <Image
                      src='/images/logos/aliet_logo.png'
                      alt='MTs Al-Ittihad Logo'
                      width={130}
                      height={130}
                      priority
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div>
                    <Typography variant='body2' color='text.primary'>
                      Jl. Syekh Nawawi Tanara
                    </Typography>
                    <Typography variant='body2' color='text.primary'>
                      Kp. Pesisir Ds. Pedaleman Kec. Tanara
                    </Typography>
                    <Typography variant='body2' color='text.primary'>
                      Kab. Serang - Banten
                    </Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-3 text-right'>
                  <Typography variant='h5' className='font-bold' style={{ marginTop: 0, lineHeight: 1.2 }}>
                    KWITANSI PEMBAYARAN SPP
                  </Typography>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary'>{`No: ${data.transactionId}`}</Typography>
                    <Typography color='text.primary'>{`Tanggal: ${data.date}`}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </Grid>

          {/* Student Info & Payment Details */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <div className='flex flex-col gap-3'>
                  <Typography className='font-semibold text-lg' color='text.primary'>
                    Telah Terima Dari:
                  </Typography>
                  <div className='pl-4'>
                    <Typography className='font-bold text-xl mb-2'>{data.studentName}</Typography>
                    <Typography variant='body1'>NIS: {data.studentNIS}</Typography>
                    <Typography variant='body1'>Kelas: {data.studentClass}</Typography>
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <div className='flex flex-col gap-3'>
                  <Typography className='font-semibold text-lg' color='text.primary'>
                    Rincian Pembayaran:
                  </Typography>
                  <div className='pl-4'>
                    <div className='flex gap-3 mb-2'>
                      <Typography className='min-w-[140px] font-medium'>Untuk Pembayaran:</Typography>
                      <Typography>SPP</Typography>
                    </div>
                    <div className='flex gap-3 mb-2'>
                      <Typography className='min-w-[140px] font-medium'>Periode:</Typography>
                      <Typography className='font-semibold'>
                        {data.months.length > 1
                          ? `${data.months[0]} - ${data.months[data.months.length - 1]}`
                          : data.months[0]}
                        {` (${data.months.length} Bulan)`}
                      </Typography>
                    </div>
                    <div className='flex gap-3'>
                      <Typography className='min-w-[140px] font-medium'>Metode:</Typography>
                      <Typography>{data.paymentMethod}</Typography>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>

          {/* Amount - Featured */}
          <Grid size={{ xs: 12 }}>
            <div className='p-8 bg-actionHover rounded-lg border-2 border-primary'>
              <div className='flex justify-between items-center'>
                <Typography variant='h5' className='font-bold'>
                  Total Pembayaran:
                </Typography>
                <Typography variant='h3' className='font-bold text-primary'>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(data.amount)}
                </Typography>
              </div>
            </div>
          </Grid>

          {/* Terbilang */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='body2' className='italic text-center'>
              <span className='font-medium'>Terbilang:</span> {convertToWords(data.amount)} Rupiah
            </Typography>
          </Grid>

          {/* Spacer to push signature to bottom */}
          <Grid size={{ xs: 12 }} className='flex-grow' />

          {/* Signature */}
          <Grid size={{ xs: 12 }}>
            <div className='flex justify-between gap-8 mt-12'>
              <div className='flex flex-col items-center text-center' style={{ width: '40%' }}>
                <Typography className='font-semibold mb-1'>Penyetor</Typography>
                <div className='h-24' />
                <div className='border-t-2 border-gray-400 pt-2 w-full'>
                  <Typography>( ........................... )</Typography>
                </div>
              </div>
              <div className='flex flex-col items-center text-center' style={{ width: '40%' }}>
                <Typography className='font-semibold mb-1'>Admin Keuangan</Typography>
                <div className='h-24' />
                <div className='border-t-2 border-gray-400 pt-2 w-full'>
                  <Typography className='font-medium'>{data.adminName}</Typography>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Footer - Always at bottom */}
        <div className='mt-auto pt-8'>
          <Divider className='mb-4 border-dashed' />
          <Typography className='text-center text-sm' color='text.secondary'>
            <Typography component='span' className='font-semibold' color='text.primary'>
              Catatan:
            </Typography>{' '}
            Kwitansi ini adalah bukti pembayaran yang sah. Harap disimpan dengan baik untuk keperluan administrasi.
          </Typography>
          <Typography className='text-center text-xs mt-2' color='text.secondary'>
            Dicetak pada:{' '}
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
})

// Helper function to convert number to Indonesian words
const convertToWords = (num: number): string => {
  const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan']

  const tens = [
    '',
    '',
    'Dua Puluh',
    'Tiga Puluh',
    'Empat Puluh',
    'Lima Puluh',
    'Enam Puluh',
    'Tujuh Puluh',
    'Delapan Puluh',
    'Sembilan Puluh'
  ]

  const scales = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun']

  if (num === 0) return 'Nol'

  const convertGroup = (n: number): string => {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return n === 10 ? 'Sepuluh' : n === 11 ? 'Sebelas' : ones[n - 10] + ' Belas'
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')

    return (
      (n === 100 ? 'Seratus' : ones[Math.floor(n / 100)] + ' Ratus') +
      (n % 100 !== 0 ? ' ' + convertGroup(n % 100) : '')
    )
  }

  let result = ''
  let scaleIndex = 0

  while (num > 0) {
    const group = num % 1000

    if (group !== 0) {
      const groupText =
        group === 1 && scaleIndex === 1
          ? 'Seribu'
          : convertGroup(group) + (scaleIndex > 0 ? ' ' + scales[scaleIndex] : '')

      result = groupText + (result ? ' ' + result : '')
    }

    num = Math.floor(num / 1000)
    scaleIndex++
  }

  return result
}

PaymentReceipt.displayName = 'PaymentReceipt'

export default PaymentReceipt
