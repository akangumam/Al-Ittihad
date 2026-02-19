import React, { forwardRef } from 'react'

import Image from 'next/image'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

type ReceiptProps = {
  data: {
    id: string
    paymentDate: string
    studentName: string
    studentNIS: string
    studentClass: string
    allocations: Array<{ name: string; amount: number }>
    amount: number
    paymentMethod: string
    adminName: string
  }
}

const FeeReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  return (
    <Card ref={ref} sx={{ minHeight: '100%', boxShadow: 'none' }}>
      <CardContent sx={{ p: '2rem !important' }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <div className='flex justify-between items-start'>
              <div className='flex gap-4'>
                <Image src='/images/logos/aliet_logo.png' alt='Logo' width={80} height={80} />
                <div>
                  <Typography variant='h6' className='font-bold'>
                    MTs Al-Ittihad
                  </Typography>
                  <Typography variant='caption' className='block'>
                    Jl. Syekh Nawawi Tanara, Serang - Banten
                  </Typography>
                </div>
              </div>
              <div className='text-right'>
                <Typography variant='h5' className='font-bold'>
                  KWITANSI
                </Typography>
                <Typography variant='body2'>No: {data.id}</Typography>
                <Typography variant='body2'>Tgl: {new Date(data.paymentDate).toLocaleDateString('id-ID')}</Typography>
              </div>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Typography variant='body2'>Nama Siswa</Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant='body2' className='font-bold'>
                  : {data.studentName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant='body2'>NIS / Kelas</Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant='body2'>
                  : {data.studentNIS} / {data.studentClass}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Deskripsi Pembayaran</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {data.allocations.map((alloc, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 0' }}>{alloc.name}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>Rp {alloc.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ padding: '16px 0', fontWeight: 'bold' }}>TOTAL</td>
                  <td style={{ textAlign: 'right', padding: '16px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Rp {data.amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant='caption' className='italic'>
              Terbilang: {convertToWords(data.amount)} Rupiah
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }} sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant='body2'>Penyetor</Typography>
            <div style={{ height: '60px' }} />
            <Typography variant='body2'>( ........................... )</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant='body2'>Admin Keuangan</Typography>
            <div style={{ height: '60px' }} />
            <Typography variant='body2' className='font-bold'>
              {data.adminName}
            </Typography>
          </Grid>
        </Grid>
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

  const scales = ['', 'Ribu', 'Juta', 'Miliar']

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
  let tempNum = num

  while (tempNum > 0) {
    const group = tempNum % 1000

    if (group !== 0) {
      const groupText =
        group === 1 && scaleIndex === 1
          ? 'Seribu'
          : convertGroup(group) + (scaleIndex > 0 ? ' ' + scales[scaleIndex] : '')

      result = groupText + (result ? ' ' + result : '')
    }

    tempNum = Math.floor(tempNum / 1000)
    scaleIndex++
  }

  return result
}

FeeReceipt.displayName = 'FeeReceipt'

export default FeeReceipt
