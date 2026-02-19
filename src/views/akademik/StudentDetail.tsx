'use client'

// React Imports
import { useState, type SyntheticEvent } from 'react'

// Next Imports
import { useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Alert from '@mui/material/Alert'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'

// Utils Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

import { useAppContext } from '@/contexts/AppContext'

// ...

const StudentDetail = ({ studentId }: { studentId: string }) => {
  const { lang: locale } = useParams()
  const { students, priorityStudentFees, priorityFeePayments } = useAppContext()
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  const student = students.find(s => s.id === studentId)

  if (!student) {
    return (
      <Alert severity='error'>
        Data siswa tidak ditemukan. Silakan kembali ke{' '}
        <Link href={getLocalizedUrl('/akademik/data-siswa', locale as Locale)}>Daftar Siswa</Link>.
      </Alert>
    )
  }

  // Get priority fees for this student
  const studentPriorityFees = (priorityStudentFees || []).filter(f => f.studentId === studentId)
  const totalArrears = studentPriorityFees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0)

  // Get payment history for this student
  const studentPayments = (priorityFeePayments || [])
    .filter(p => p.studentId === studentId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5)

  const paymentHistory = studentPayments.map(payment => ({
    id: payment.id,
    date: new Date(payment.paymentDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    template: payment.studentFee?.template?.name || 'Biaya Sekolah',
    amount: payment.amount,
    method: payment.paymentMethod
  }))

  const outstanding = studentPriorityFees.filter(f => f.status !== 'LUNAS')

  return (
    <>
      <Button
        startIcon={<i className='ri-arrow-left-line' />}
        component={Link}
        href={getLocalizedUrl('/akademik/data-siswa', locale as Locale)}
        className='mb-4'
      >
        Kembali ke Daftar Siswa
      </Button>
      <Grid container spacing={6}>
        {/* Header Card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <CustomAvatar
                src={student.photo || '/images/avatars/1.png'}
                variant='rounded'
                alt={student.name}
                size={120}
                skin='light'
                color='primary'
              >
                {student.name.charAt(0)}
              </CustomAvatar>
              <div className='flex flex-col gap-2 items-center sm:items-start flex-grow'>
                <div className='flex items-center gap-2'>
                  <Typography variant='h4'>{student.name}</Typography>
                  <Chip
                    label={student.status}
                    color={student.status === 'Aktif' ? 'success' : 'error'}
                    size='small'
                    variant='tonal'
                  />
                </div>
                <div className='flex gap-4 flex-wrap justify-center sm:justify-start'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-id-card-line text-textSecondary' />
                    <Typography>NIS: {student.nis}</Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-building-4-line text-textSecondary' />
                    <Typography>
                      Kelas {student.grade}
                      {student.class}
                    </Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-calendar-line text-textSecondary' />
                    <Typography>Masuk: {student.enrollmentDate}</Typography>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-pencil-line' />}
                  component={Link}
                  href={getLocalizedUrl(`/akademik/data-siswa/${studentId}/edit`, locale as Locale)}
                >
                  Edit
                </Button>
                <Button
                  variant='contained'
                  startIcon={<i className='ri-secure-payment-line' />}
                  component={Link}
                  href={getLocalizedUrl(`/apps/financial/fees`, locale as Locale)}
                >
                  Bayar Tagihan
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs & Content */}
        <Grid size={{ xs: 12 }}>
          <TabContext value={activeTab}>
            <TabList onChange={handleChange} aria-label='student detail tabs'>
              <Tab label='Profil Lengkap' value='profile' icon={<i className='ri-user-line' />} iconPosition='start' />
              <Tab
                label='Keuangan'
                value='finance'
                icon={<i className='ri-money-dollar-circle-line' />}
                iconPosition='start'
              />
              <Tab
                label='Riwayat Akademik'
                value='academic'
                icon={<i className='ri-graduation-cap-line' />}
                iconPosition='start'
              />
            </TabList>

            <TabPanel value='profile' className='p-0 pt-6'>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' className='mbe-4'>
                        Informasi Pribadi
                      </Typography>
                      <div className='flex flex-col gap-4'>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Nama Lengkap</Typography>
                          <Typography className='font-medium'>{student.name}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Nama Panggilan</Typography>
                          <Typography className='font-medium'>{student.nickname}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>NISN</Typography>
                          <Typography className='font-medium'>{student.nisn}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Jenis Kelamin</Typography>
                          <Typography className='font-medium'>
                            {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Alamat</Typography>
                          <Typography className='font-medium text-right max-w-[60%]'>{student.address}</Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' className='mbe-4'>
                        Informasi Orang Tua / Wali
                      </Typography>
                      <div className='flex flex-col gap-4'>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Wali / Orang Tua</Typography>
                          <Typography className='font-medium'>{student.parentName || student.guardianName}</Typography>
                        </div>
                        {student.fatherName && (
                          <div className='flex justify-between'>
                            <Typography color='text.secondary'>Nama Ayah</Typography>
                            <Typography className='font-medium'>{student.fatherName}</Typography>
                          </div>
                        )}
                        {student.motherName && (
                          <div className='flex justify-between'>
                            <Typography color='text.secondary'>Nama Ibu</Typography>
                            <Typography className='font-medium'>{student.motherName}</Typography>
                          </div>
                        )}
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>No. HP Orang Tua / Wali</Typography>
                          <Typography className='font-medium'>{student.parentPhone || student.phone}</Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='finance' className='p-0 pt-6'>
              <Grid container spacing={6}>
                {/* Tunggakan */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' className='mbe-4'>
                        Status Tunggakan
                      </Typography>
                      {outstanding.length > 0 ? (
                        <div className='flex flex-col gap-4'>
                          <Alert severity='warning'>
                            Total Piutang:{' '}
                            <strong>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0
                              }).format(totalArrears)}
                            </strong>
                          </Alert>
                          {outstanding.map((item, index) => (
                            <div
                              key={index}
                              className='flex justify-between items-center p-3 border rounded bg-warning-light'
                            >
                              <div>
                                <Typography className='font-medium'>{item.template?.name}</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  Tertagih:{' '}
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                                    item.totalAmount
                                  )}
                                </Typography>
                              </div>
                              <div className='text-right'>
                                <Typography color='error' className='font-bold'>
                                  Sisa:{' '}
                                  {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0
                                  }).format(item.totalAmount - item.paidAmount)}
                                </Typography>
                                <Chip
                                  label={item.status}
                                  size='small'
                                  variant='tonal'
                                  color='warning'
                                  sx={{ height: 18, fontSize: '0.6rem' }}
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            variant='contained'
                            color='primary'
                            fullWidth
                            component={Link}
                            href={getLocalizedUrl(`/apps/financial/fees`, locale as Locale)}
                          >
                            Buka Panel Pembayaran
                          </Button>
                        </div>
                      ) : (
                        <Alert severity='success'>Semua tagihan lunas. Terima kasih!</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* History Pembayaran */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' className='mbe-4'>
                        Riwayat Pembayaran Terakhir
                      </Typography>
                      {paymentHistory.length > 0 ? (
                        <>
                          <Timeline position='right'>
                            {paymentHistory.map((item, index) => (
                              <TimelineItem key={index}>
                                <TimelineOppositeContent color='text.secondary'>{item.date}</TimelineOppositeContent>
                                <TimelineSeparator>
                                  <TimelineDot color='success' />
                                  {index < paymentHistory.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                  <Typography className='font-medium'>Pembayaran {item.template}</Typography>
                                  <Typography variant='body2'>
                                    {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      maximumFractionDigits: 0
                                    }).format(item.amount)}{' '}
                                    via {item.method}
                                  </Typography>
                                </TimelineContent>
                              </TimelineItem>
                            ))}
                          </Timeline>
                          <div className='text-center mt-4'>
                            <Button
                              variant='text'
                              component={Link}
                              href={getLocalizedUrl(`/apps/financial/fees`, locale as Locale)}
                            >
                              Lihat Semua Riwayat
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Alert severity='info'>Belum ada riwayat pembayaran untuk siswa ini.</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='academic' className='p-0 pt-6'>
              <Card>
                <CardContent>
                  <Typography variant='h6' className='mbe-4'>
                    Riwayat Kelas
                  </Typography>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-4 p-4 border rounded'>
                      <div className='p-3 bg-primary-light rounded'>
                        <i className='ri-building-4-line text-primary text-xl' />
                      </div>
                      <div className='flex-grow'>
                        <Typography className='font-medium'>Kelas 7A</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Tahun Ajaran 2024/2025
                        </Typography>
                      </div>
                      <Chip label='Aktif' color='success' size='small' variant='tonal' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </>
  )
}

export default StudentDetail
