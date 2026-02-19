'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'

// API Imports
import { teacherAttendanceAPI } from '@/services/api'

const TeacherAttendanceRecap = () => {
  // States
  const currentDate = new Date()
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(currentDate.getFullYear()))
  const [loading, setLoading] = useState(false)
  const [recap, setRecap] = useState<any>(null)

  // Fetch recap data
  const fetchRecap = useCallback(async () => {
    try {
      setLoading(true)

      const response = await teacherAttendanceAPI.getRecap({ month, year })

      setRecap(response)
    } catch (error) {
      console.error('Error fetching recap:', error)
      alert('Gagal mengambil rekap absensi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  // Load data on mount and when filters change
  useEffect(() => {
    fetchRecap()
  }, [fetchRecap])

  // Get month name
  const getMonthName = (m: string) => {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ]

    return months[parseInt(m) - 1]
  }

  // Calculate attendance percentage
  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0

    return ((count / total) * 100).toFixed(1)
  }

  return (
    <Grid container spacing={6}>
      {/* Header & Filters */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Rekap Absensi Guru'
            subheader={`Periode: ${getMonthName(month)} ${year}`}
            action={
              recap?.summary ? (
                <Chip label={`${recap.summary.totalRecords} Total Data`} color='primary' variant='tonal' />
              ) : null
            }
          />
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  fullWidth
                  label='Bulan'
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value='01'>Januari</option>
                  <option value='02'>Februari</option>
                  <option value='03'>Maret</option>
                  <option value='04'>April</option>
                  <option value='05'>Mei</option>
                  <option value='06'>Juni</option>
                  <option value='07'>Juli</option>
                  <option value='08'>Agustus</option>
                  <option value='09'>September</option>
                  <option value='10'>Oktober</option>
                  <option value='11'>November</option>
                  <option value='12'>Desember</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  fullWidth
                  label='Tahun'
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value='2024'>2024</option>
                  <option value='2025'>2025</option>
                  <option value='2026'>2026</option>
                  <option value='2027'>2027</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button variant='contained' onClick={fetchRecap} disabled={loading} fullWidth>
                  {loading ? 'Memuat...' : 'Tampilkan Rekap'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Summary Cards */}
      {recap?.summary && (
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className='bg-success-light'>
                <CardContent>
                  <Typography variant='h4' className='text-success'>
                    {recap.summary.byStatus.hadir}
                  </Typography>
                  <Typography variant='body2' className='text-success'>
                    Hadir
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className='bg-warning-light'>
                <CardContent>
                  <Typography variant='h4' className='text-warning'>
                    {recap.summary.byStatus.terlambat}
                  </Typography>
                  <Typography variant='body2' className='text-warning'>
                    Terlambat
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className='bg-info-light'>
                <CardContent>
                  <Typography variant='h4' className='text-info'>
                    {recap.summary.byStatus.izin}
                  </Typography>
                  <Typography variant='body2' className='text-info'>
                    Izin
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className='bg-error-light'>
                <CardContent>
                  <Typography variant='h4' className='text-error'>
                    {recap.summary.byStatus.alpa}
                  </Typography>
                  <Typography variant='body2' className='text-error'>
                    Alpa
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Rekap Per Guru */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Rekap Per Guru' />
          <CardContent>
            {loading ? (
              <div className='flex justify-center items-center py-20'>
                <CircularProgress />
              </div>
            ) : recap?.byTeacher && recap.byTeacher.length > 0 ? (
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Nama Guru</TableCell>
                      <TableCell>NIP</TableCell>
                      <TableCell align='center'>Total</TableCell>
                      <TableCell align='center'>Hadir</TableCell>
                      <TableCell align='center'>Terlambat</TableCell>
                      <TableCell align='center'>Izin</TableCell>
                      <TableCell align='center'>Sakit</TableCell>
                      <TableCell align='center'>Alpa</TableCell>
                      <TableCell align='center'>% Kehadiran</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recap.byTeacher.map((teacher: any, index: number) => {
                      const attendanceCount = teacher.hadir + teacher.terlambat
                      const percentage = getPercentage(attendanceCount, teacher.total)

                      return (
                        <TableRow key={teacher.teacherId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant='body2' className='font-medium'>
                              {teacher.teacherName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption' color='text.secondary'>
                              {teacher.nip}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.total} size='small' color='primary' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.hadir || 0} size='small' color='success' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.terlambat || 0} size='small' color='warning' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.izin || 0} size='small' color='info' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.sakit || 0} size='small' color='secondary' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={teacher.alpa || 0} size='small' color='error' />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip
                              label={`${percentage}%`}
                              size='small'
                              color={
                                parseFloat(percentage as string) >= 90
                                  ? 'success'
                                  : parseFloat(percentage as string) >= 75
                                    ? 'warning'
                                    : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body2' color='text.secondary' align='center' className='py-10'>
                Tidak ada data untuk periode ini
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TeacherAttendanceRecap
