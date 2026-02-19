'use client'

import { useState, useEffect, type SyntheticEvent } from 'react'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import CustomAvatar from '@core/components/mui/Avatar'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { useAppContext } from '@/contexts/AppContext'

const TeacherDetail = ({ teacherId }: { teacherId: string }) => {
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const { teachers, teachingSchedules } = useAppContext()

  const teacher = teachers.find(t => t.id === teacherId)
  const schedules = teachingSchedules.filter(s => s.teacherId === teacherId)

  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')

    if (tabParam === 'schedule') {
      setActiveTab('schedule')
    }
  }, [searchParams])

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  if (!teacher) {
    return (
      <Alert severity='error'>
        Data guru tidak ditemukan. Silakan kembali ke{' '}
        <Link href={getLocalizedUrl('/akademik/data-guru', locale as Locale)}>Daftar Guru</Link>.
      </Alert>
    )
  }

  return (
    <>
      <Button
        startIcon={<i className='ri-arrow-left-line' />}
        component={Link}
        href={getLocalizedUrl('/akademik/data-guru', locale as Locale)}
        className='mb-4'
      >
        Kembali ke Daftar Guru
      </Button>
      <Grid container spacing={6}>
        {/* Header Card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <CustomAvatar
                src='/images/avatars/1.png'
                variant='rounded'
                alt={teacher.name}
                size={120}
                skin='light'
                color='primary'
              >
                {teacher.name.charAt(0)}
              </CustomAvatar>
              <div className='flex flex-col gap-2 items-center sm:items-start flex-grow'>
                <div className='flex items-center gap-2'>
                  <Typography variant='h4'>{teacher.name}</Typography>
                  <Chip
                    label={teacher.status}
                    color={teacher.status === 'Aktif' ? 'success' : 'error'}
                    size='small'
                    variant='tonal'
                  />
                </div>
                <div className='flex gap-4 flex-wrap justify-center sm:justify-start'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-id-card-line text-textSecondary' />
                    <Typography>NIP: {teacher.nip}</Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-briefcase-line text-textSecondary' />
                    <Typography>{teacher.position}</Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-book-open-line text-textSecondary' />
                    <Typography>{teacher.subject}</Typography>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='contained'
                  startIcon={<i className='ri-pencil-line' />}
                  component={Link}
                  href={getLocalizedUrl(`/akademik/data-guru/${teacherId}/edit`, locale as Locale)}
                >
                  Edit Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs & Content */}
        <Grid size={{ xs: 12 }}>
          <TabContext value={activeTab}>
            <TabList onChange={handleChange} aria-label='teacher detail tabs'>
              <Tab label='Profil Lengkap' value='profile' icon={<i className='ri-user-line' />} iconPosition='start' />
              <Tab
                label='Jadwal Mengajar'
                value='schedule'
                icon={<i className='ri-calendar-schedule-line' />}
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
                          <Typography className='font-medium'>{teacher.name}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>NIP</Typography>
                          <Typography className='font-medium'>{teacher.nip}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>NUPTK</Typography>
                          <Typography className='font-medium'>{teacher.nuptk}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Jenis Kelamin</Typography>
                          <Typography className='font-medium'>
                            {teacher.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Alamat</Typography>
                          <Typography className='font-medium text-right max-w-[60%]'>{teacher.address}</Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' className='mbe-4'>
                        Kontak
                      </Typography>
                      <div className='flex flex-col gap-4'>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>Email</Typography>
                          <Typography className='font-medium'>{teacher.email}</Typography>
                        </div>
                        <div className='flex justify-between'>
                          <Typography color='text.secondary'>No. HP</Typography>
                          <Typography className='font-medium'>{teacher.phone}</Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='schedule' className='p-0 pt-6'>
              <Card>
                <CardContent>
                  <div className='flex justify-between items-center mb-6'>
                    <Typography variant='h5'>Jadwal Mengajar</Typography>
                    <Button
                      variant='outlined'
                      startIcon={<i className='ri-calendar-schedule-line' />}
                      component={Link}
                      href={getLocalizedUrl('/akademik/jadwal-mengajar', locale as Locale)}
                    >
                      Kelola Semua Jadwal
                    </Button>
                  </div>

                  {schedules.length === 0 ? (
                    <Alert severity='info'>Belum ada jadwal mengajar untuk guru ini.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant='outlined'>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Hari</TableCell>
                            <TableCell>Waktu</TableCell>
                            <TableCell>Kelas</TableCell>
                            <TableCell>Mata Pelajaran</TableCell>
                            <TableCell>Tahun Ajaran</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {schedules.map(schedule => (
                            <TableRow key={schedule.id}>
                              <TableCell>
                                <Chip label={schedule.day} color='primary' variant='tonal' size='small' />
                              </TableCell>
                              <TableCell>
                                {schedule.startTime} - {schedule.endTime}
                              </TableCell>
                              <TableCell>
                                <Chip label={`${schedule.grade} ${schedule.class}`} variant='outlined' size='small' />
                              </TableCell>
                              <TableCell>{schedule.subject}</TableCell>
                              <TableCell>{schedule.academicYear}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </>
  )
}

export default TeacherDetail
