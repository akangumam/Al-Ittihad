'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'

// Icon Imports
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

// Components Imports
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// API Imports
import { teacherAttendanceAPI } from '@/services/api'

// Type Definitions
type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Terlambat' | 'Dinas Luar'

type AttendanceEntry = {
  teacherId: string
  teacherName: string
  nip: string
  status: AttendanceStatus
  checkInTime: string
  scheduledStartTime: string
  lateMinutes: number
  notes: string
  isSaved?: boolean
}

const statusOptions: { value: AttendanceStatus; label: string; color: any }[] = [
  { value: 'Hadir', label: 'Hadir', color: 'success' },
  { value: 'Terlambat', label: 'Terlambat', color: 'warning' },
  { value: 'Izin', label: 'Izin', color: 'info' },
  { value: 'Sakit', label: 'Sakit', color: 'secondary' },
  { value: 'Alpa', label: 'Alpa', color: 'error' },
  { value: 'Dinas Luar', label: 'Dinas Luar', color: 'primary' }
]

const TeacherAttendanceEntry = () => {
  const { teachers } = useAppContext()

  // States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [currentTime, setCurrentTime] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [status, setStatus] = useState<AttendanceStatus>('Hadir')
  const [checkInTime, setCheckInTime] = useState('')
  const [scheduledStartTime, setScheduledStartTime] = useState('07:00')
  const [notes, setNotes] = useState('')
  const [attendanceList, setAttendanceList] = useState<AttendanceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEntryForDelete, setSelectedEntryForDelete] = useState<AttendanceEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate late minutes
  const calculateLateMinutes = (scheduled: string, actual: string): number => {
    if (!scheduled || !actual) return 0

    const [schedHours, schedMins] = scheduled.split(':').map(Number)
    const [actualHours, actualMins] = actual.split(':').map(Number)

    const schedMinutes = schedHours * 60 + schedMins
    const actualMinutes = actualHours * 60 + actualMins

    const diff = actualMinutes - schedMinutes

    return diff > 0 ? diff : 0
  }

  // Real-time clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()

      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }

    updateClock() // Initial call
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  // Auto-set check-in time when status is Hadir or Terlambat
  useEffect(() => {
    if (status === 'Hadir' || status === 'Terlambat') {
      if (!checkInTime) {
        const now = new Date()
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        setCheckInTime(timeString)
      }
    }
  }, [status, checkInTime])

  // Load existing attendance for the date
  const loadExistingAttendance = useCallback(async () => {
    try {
      setLoading(true)
      const response = await teacherAttendanceAPI.getForDate({ date })

      // Convert existing attendance to list
      const existingEntries =
        response.teachers
          ?.filter((t: any) => t.attendance.status)
          .map((t: any) => ({
            teacherId: t.teacherId,
            teacherName: t.teacherName,
            nip: t.nip,
            status: t.attendance.status,
            checkInTime: t.attendance.checkInTime || '',
            scheduledStartTime: t.scheduledStartTime || '07:00',
            lateMinutes: t.attendance.lateMinutes || 0,
            notes: t.attendance.notes || '',
            isSaved: true
          })) || []

      setAttendanceList(existingEntries)
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }, [date])

  // Load data on mount and when date changes
  useEffect(() => {
    loadExistingAttendance()
  }, [loadExistingAttendance])

  // Add teacher and save directly to database
  const handleAddAndSave = async () => {
    if (!selectedTeacher) {
      alert('Silakan pilih guru terlebih dahulu')

      return
    }

    // Check if teacher already in the list
    if (attendanceList.some(a => a.teacherId === selectedTeacher.id)) {
      alert('Guru ini sudah ada dalam daftar absensi hari ini')

      return
    }

    try {
      setSaving(true)

      // Calculate late minutes if applicable
      const lateMinutes =
        (status === 'Hadir' || status === 'Terlambat') && checkInTime
          ? calculateLateMinutes(scheduledStartTime, checkInTime)
          : 0

      // Auto-detect late status
      let finalStatus = status

      if (lateMinutes > 0 && status === 'Hadir') {
        finalStatus = 'Terlambat'
      }

      // Prepare single record data
      const attendanceData = {
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        nip: selectedTeacher.nip,
        scheduledStartTime,
        checkInTime: finalStatus === 'Hadir' || finalStatus === 'Terlambat' ? checkInTime : null,
        status: finalStatus,
        notes: notes || null
      }

      // Save to database
      await teacherAttendanceAPI.save({
        date,
        attendances: [attendanceData],
        recordedBy: 'Admin',
        academicYear: new Date().getFullYear().toString()
      })

      // Reset form
      setSelectedTeacher(null)
      setStatus('Hadir')
      setCheckInTime('')
      setScheduledStartTime('07:00')
      setNotes('')

      // Refetch data
      loadExistingAttendance()
    } catch (error: any) {
      console.error('Error saving attendance:', error)
      alert(error.message || 'Gagal menyimpan absensi. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete Confirmation
  const handleRemoveEntry = (teacherId: string) => {
    const entry = attendanceList.find(a => a.teacherId === teacherId)

    if (!entry) return

    setSelectedEntryForDelete(entry)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEntryForDelete) return

    try {
      setIsDeleting(true)
      await teacherAttendanceAPI.delete({ teacherId: selectedEntryForDelete.teacherId, date })
      setAttendanceList(prev => prev.filter(a => a.teacherId !== selectedEntryForDelete.teacherId))
      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error('Error deleting attendance:', error)
      alert('Gagal menghapus data dari database: ' + error.message)
    } finally {
      setIsDeleting(false)
      setSelectedEntryForDelete(null)
    }
  }

  // Get status color
  const getStatusColor = (statusValue: AttendanceStatus) => {
    return statusOptions.find(s => s.value === statusValue)?.color || 'default'
  }

  // Format late minutes to "H jam M menit"
  const formatLateMinutes = (totalMinutes: number): string => {
    if (totalMinutes < 60) return `${totalMinutes} menit`

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`
  }

  return (
    <Grid container spacing={6}>
      {/* Real-time Clock */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Box display='flex' alignItems='center' justifyContent='center' gap={2}>
              <AccessTimeIcon sx={{ fontSize: 48, color: 'white' }} />
              <Box textAlign='center'>
                <Typography variant='h2' sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>
                  {currentTime}
                </Typography>
                <Typography variant='body1' sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {new Date(date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Input Form */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Input Absensi Guru'
            subheader='Catat kehadiran guru per individu'
            action={<Chip label={`${attendanceList.length} Guru Tercatat`} color='primary' variant='tonal' />}
          />
          <CardContent>
            <Grid container spacing={4}>
              {/* Date */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type='date'
                  label='Tanggal Absensi'
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Teacher Selection */}
              <Grid size={{ xs: 12, sm: 6, md: 9 }}>
                <Autocomplete
                  options={teachers}
                  getOptionLabel={option => `${option.name} - ${option.nip}`}
                  value={selectedTeacher}
                  onChange={(_, newValue) => setSelectedTeacher(newValue)}
                  renderInput={params => (
                    <TextField {...params} label='Pilih Guru' placeholder='Ketik nama atau NIP guru...' />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant='body1'>{option.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          NIP: {option.nip} | {option.position}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText='Guru tidak ditemukan'
                />
              </Grid>

              {/* Status */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label='Status Kehadiran'
                  value={status}
                  onChange={e => setStatus(e.target.value as AttendanceStatus)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Scheduled Start Time */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  type='time'
                  label='Jam Masuk Standar'
                  value={scheduledStartTime}
                  onChange={e => setScheduledStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText='Waktu seharusnya masuk'
                />
              </Grid>

              {/* Check-in Time */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  type='time'
                  label='Waktu Absen'
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  disabled={status !== 'Hadir' && status !== 'Terlambat'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Notes */}
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label='Keterangan (Opsional)'
                  placeholder='Contoh: Sakit demam, izin urusan keluarga, dll'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </Grid>

              {/* Add Button */}
              <Grid size={{ xs: 12 }}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleAddAndSave}
                  disabled={!selectedTeacher || saving}
                  size='large'
                >
                  {saving ? <CircularProgress size={24} color='inherit' /> : 'Catat Kehadiran'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Attendance List */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Daftar Absensi Hari Ini' />
          <CardContent>
            {loading ? (
              <Box display='flex' justifyContent='center' py={10}>
                <CircularProgress />
              </Box>
            ) : attendanceList.length === 0 ? (
              <Alert severity='info'>
                Belum ada guru yang diabsen untuk tanggal ini. Gunakan form di atas untuk menambahkan absensi.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant='outlined'>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>Nama Guru</TableCell>
                        <TableCell>NIP</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Jam Standar</TableCell>
                        <TableCell>Waktu Absen</TableCell>
                        <TableCell>Terlambat</TableCell>
                        <TableCell>Keterangan</TableCell>
                        <TableCell align='center'>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceList.map((entry, index) => (
                        <TableRow key={entry.teacherId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant='body2' fontWeight={600}>
                              {entry.teacherName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption' color='text.secondary'>
                              {entry.nip}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={entry.status} color={getStatusColor(entry.status)} size='small' />
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' fontFamily='monospace'>
                              {entry.scheduledStartTime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' fontFamily='monospace'>
                              {entry.checkInTime || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {entry.lateMinutes > 0 ? (
                              <Chip
                                label={formatLateMinutes(entry.lateMinutes)}
                                color='warning'
                                size='small'
                                variant='tonal'
                              />
                            ) : (
                              <Typography variant='caption' color='text.secondary'>
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption' color='text.secondary'>
                              {entry.notes || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <IconButton size='small' color='error' onClick={() => handleRemoveEntry(entry.teacherId)}>
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title='Hapus Absensi'
        content={`Apakah Anda yakin ingin menghapus permanen data absensi untuk guru "${selectedEntryForDelete?.teacherName}" dari database?`}
        confirmText='Ya, Hapus Permanen'
        isSubmitting={isDeleting}
      />
    </Grid>
  )
}

export default TeacherAttendanceEntry
