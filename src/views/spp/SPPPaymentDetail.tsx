'use client'

import { useRef, useState, useEffect } from 'react'

import { useParams } from 'next/navigation'
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

import { useReactToPrint } from 'react-to-print'

import { useAppContext } from '@/contexts/AppContext'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

import PaymentReceipt from './PaymentReceipt'

const SPPPaymentDetail = ({ paymentId }: { paymentId: string }) => {
  const { students, accounts, isLoading: contextLoading } = useAppContext()
  const { lang: locale } = useParams()
  const receiptRef = useRef<HTMLDivElement>(null)

  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true)

        // Try to fetch specific payment from API
        const response = await fetch(`/api/spp-payments`)

        if (response.ok) {
          const payments = await response.json()
          const found = payments.find((p: any) => p.id === paymentId)

          if (found) {
            setPayment(found)
          }
        }
      } catch (error) {
        console.error('Error fetching payment detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [paymentId])

  // Get related data
  const student = payment ? students.find((s: any) => s.id === payment.studentId) || payment.student : null
  const account = payment ? accounts.find((a: any) => a.id === payment.account) : null

  const formattedDate = payment
    ? new Date(payment.paymentDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''

  const receiptData = payment
    ? {
        transactionId: payment.id,
        date: formattedDate,
        studentName: student?.name || payment.studentName,
        studentNIS: student?.nis || '',
        studentClass: student ? `${student.grade}${student.class}` : '',
        months: [`${payment.month} ${payment.year}`],
        amount: payment.amount,
        paymentMethod:
          payment.paymentMethod === 'Tunai' || payment.paymentMethod === 'cash'
            ? 'Tunai'
            : payment.paymentMethod === 'Transfer' || payment.paymentMethod === 'transfer'
              ? 'Transfer Bank'
              : payment.paymentMethod === 'EDC' || payment.paymentMethod === 'edc'
                ? 'EDC'
                : payment.paymentMethod, // Fallback to original value
        adminName: 'Admin Keuangan'
      }
    : null

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: payment ? `Kwitansi-${payment.id}` : 'Kwitansi'
  })

  if (loading || contextLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px]'>
        <i className='ri-loader-4-line animate-spin text-4xl text-primary mb-4' />
        <Typography>Memuat data pembayaran...</Typography>
      </div>
    )
  }

  if (!payment) {
    return (
      <Alert severity='error'>
        Data pembayaran tidak ditemukan. Silakan kembali ke{' '}
        <Link href={getLocalizedUrl('/spp/pembayaran', locale as Locale)}>Daftar Pembayaran</Link>.
      </Alert>
    )
  }

  return (
    <>
      <Button
        startIcon={<i className='ri-arrow-left-line' />}
        component={Link}
        href={getLocalizedUrl('/spp/pembayaran', locale as Locale)}
        className='mb-4'
      >
        Kembali ke Daftar Pembayaran
      </Button>

      <Grid container spacing={6}>
        {/* Payment Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant='h4' className='mbe-6'>
                Detail Pembayaran SPP
              </Typography>

              <Grid container spacing={4}>
                {/* Transaction Info */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' className='mbe-4'>
                    Informasi Transaksi
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    ID Transaksi
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {payment.id}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Tanggal Pembayaran
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {formattedDate}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Status Pembayaran
                  </Typography>
                  <div className='mt-1'>
                    <Chip
                      label={payment.status || 'Lunas'}
                      color={
                        payment.status === 'Verifikasi' ? 'warning' : payment.status === 'Batal' ? 'error' : 'success'
                      }
                      size='small'
                      variant='tonal'
                    />
                  </div>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Metode Pembayaran
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {payment.paymentMethod}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider className='my-4' />
                </Grid>

                {/* Student Info */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' className='mbe-4'>
                    Data Siswa
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Nama Siswa
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {student?.name || payment.studentName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    NIS
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {student?.nis || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Kelas
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {student ? `${student.grade}${student.class}` : '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider className='my-4' />
                </Grid>

                {/* Payment Details */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' className='mbe-4'>
                    Rincian Pembayaran
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Periode SPP
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {payment.month} {payment.year}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Nominal
                  </Typography>
                  <Typography variant='h6' className='font-medium text-success'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0
                    }).format(payment.amount)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Akun Tujuan
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {account?.accountName || payment.account}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Print Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' className='mbe-4'>
                Aksi Kwitansi
              </Typography>

              <div className='flex flex-col gap-3'>
                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  startIcon={<i className='ri-printer-line' />}
                  onClick={handlePrint}
                >
                  Cetak Kwitansi
                </Button>

                <Typography variant='caption' color='text.secondary' className='text-center mt-2'>
                  Kwitansi akan dicetak dengan format A4 resmi
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Hidden receipt for printing */}
          <div style={{ display: 'none' }}>
            <PaymentReceipt ref={receiptRef} data={receiptData!} />
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default SPPPaymentDetail
