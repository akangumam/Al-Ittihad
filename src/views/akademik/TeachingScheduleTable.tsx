'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'
import { toast } from 'react-toastify'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Type Imports
import type { TeachingScheduleType } from '@/contexts/AppContext'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'
import { teachingScheduleAPI } from '@/services/api'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<TeachingScheduleType>()

const TeachingScheduleTable = () => {
  const { teachingSchedules, setTeachingSchedules, teachers, classes, academicYears, refreshData, isLoading } =
    useAppContext()

  const [globalFilter, setGlobalFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<TeachingScheduleType | null>(null)

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    teacherId: '',
    day: '',
    startTime: '',
    endTime: '',
    grade: '',
    class: '',
    room: '',
    notes: '',
    academicYear: ''
  })

  // Watch for active academic year when data loads
  useEffect(() => {
    if (academicYears.length > 0 && !formData.academicYear) {
      const active = academicYears.find(y => y.isActive)?.name || academicYears[0]?.name || ''

      setFormData(prev => ({ ...prev, academicYear: active }))
    }
  }, [academicYears, formData.academicYear])

  const handleOpenDialog = async (schedule?: TeachingScheduleType) => {
    // Refresh data to ensure we have latest classes/teachers
    refreshData()

    if (schedule) {
      setEditingSchedule(schedule)
      setFormData({
        teacherId: schedule.teacherId,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        grade: schedule.grade,
        class: schedule.class,
        room: schedule.room || '',
        notes: schedule.notes || '',
        academicYear: schedule.academicYear
      })
    } else {
      setEditingSchedule(null)
      setFormData({
        teacherId: '',
        day: '',
        startTime: '',
        endTime: '',
        grade: '',
        class: '',
        room: '',
        notes: '',
        academicYear: academicYears.find(y => y.isActive)?.name || academicYears[0]?.name || ''
      })
    }

    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSchedule(null)
  }

  const handleSubmit = async () => {
    const teacher = teachers.find(t => t.id === formData.teacherId)

    if (!teacher) return

    try {
      if (editingSchedule) {
        // Update existing schedule via API
        const updated = await teachingScheduleAPI.update(editingSchedule.id, {
          teacherId: formData.teacherId,
          teacherName: teacher.name,
          subject: teacher.subject,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          grade: formData.grade,
          class: formData.class,
          room: formData.room,
          notes: formData.notes,
          academicYear: formData.academicYear
        })

        setTeachingSchedules(teachingSchedules.map(s => (s.id === editingSchedule.id ? updated : s)))
        toast.success('Jadwal berhasil diperbarui')
      } else {
        // Add new schedule via API
        const newScheduleData = {
          teacherId: formData.teacherId,
          teacherName: teacher.name,
          subject: teacher.subject,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          grade: formData.grade,
          class: formData.class,
          room: formData.room,
          notes: formData.notes,
          academicYear: formData.academicYear
        }

        const created = await teachingScheduleAPI.create(newScheduleData)

        setTeachingSchedules([...teachingSchedules, created])
        toast.success('Jadwal berhasil ditambahkan')
      }

      handleCloseDialog()
    } catch (error: any) {
      console.error('Error saving schedule:', error)
      toast.error(`Gagal menyimpan jadwal: ${error.message}`)
    }
  }

  const handleDelete = (id: string) => {
    setSelectedScheduleId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedScheduleId) return

    try {
      setIsDeleting(true)
      await teachingScheduleAPI.delete(selectedScheduleId)
      setTeachingSchedules(teachingSchedules.filter(s => s.id !== selectedScheduleId))
      toast.success('Jadwal berhasil dihapus')
      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error('Error deleting schedule:', error)
      toast.error(`Gagal menghapus jadwal: ${error.message}`)
    } finally {
      setIsDeleting(false)
      setSelectedScheduleId(null)
    }
  }

  const columns = useMemo<ColumnDef<TeachingScheduleType, any>[]>(
    () => [
      columnHelper.accessor('teacherName', {
        header: 'Nama Guru',
        cell: ({ row }) => (
          <div>
            <Typography className='font-medium' color='text.primary'>
              {row.original.teacherName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {row.original.subject}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('day', {
        header: 'Hari',
        cell: ({ row }) => <Chip label={row.original.day} color='primary' variant='tonal' size='small' />
      }),
      columnHelper.accessor('startTime', {
        header: 'Waktu',
        cell: ({ row }) => (
          <Typography>
            {row.original.startTime} - {row.original.endTime}
          </Typography>
        )
      }),
      columnHelper.accessor('grade', {
        header: 'Kelas',
        cell: ({ row }) => (
          <Chip label={`${row.original.grade} ${row.original.class}`} variant='outlined' size='small' />
        )
      }),
      columnHelper.accessor('academicYear', {
        header: 'Tahun Ajaran',
        cell: ({ row }) => <Typography>{row.original.academicYear}</Typography>
      }),
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <IconButton size='small' color='primary' onClick={() => handleOpenDialog(row.original)}>
              <i className='ri-edit-box-line' />
            </IconButton>
            <IconButton size='small' color='error' onClick={() => handleDelete(row.original.id)}>
              <i className='ri-delete-bin-7-line' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teachingSchedules]
  )

  const filteredData = useMemo(() => {
    let filtered = teachingSchedules

    if (dayFilter) {
      filtered = filtered.filter(s => s.day === dayFilter)
    }

    if (teacherFilter) {
      filtered = filtered.filter(s => s.teacherId === teacherFilter)
    }

    if (globalFilter) {
      filtered = filtered.filter(
        s =>
          s.teacherName.toLowerCase().includes(globalFilter.toLowerCase()) ||
          s.subject.toLowerCase().includes(globalFilter.toLowerCase()) ||
          s.grade.toLowerCase().includes(globalFilter.toLowerCase())
      )
    }

    return filtered
  }, [teachingSchedules, dayFilter, teacherFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <CardContent>
          <div className='flex justify-between items-center mb-6'>
            <Typography variant='h5'>Jadwal Mengajar</Typography>
            <div className='flex gap-2'>
              <Button
                variant='outlined'
                startIcon={isLoading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                onClick={() => refreshData()}
                disabled={isLoading}
              >
                Refresh Data
              </Button>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => handleOpenDialog()}>
                Tambah Jadwal
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <TextField
              size='small'
              placeholder='Cari guru atau mata pelajaran...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className='flex-1'
            />
            <FormControl size='small' className='min-w-[150px]'>
              <InputLabel>Hari</InputLabel>
              <Select value={dayFilter} onChange={e => setDayFilter(e.target.value)} label='Hari'>
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='Senin'>Senin</MenuItem>
                <MenuItem value='Selasa'>Selasa</MenuItem>
                <MenuItem value='Rabu'>Rabu</MenuItem>
                <MenuItem value='Kamis'>Kamis</MenuItem>
                <MenuItem value='Jumat'>Jumat</MenuItem>
                <MenuItem value='Sabtu'>Sabtu</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' className='min-w-[200px]'>
              <InputLabel>Guru</InputLabel>
              <Select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)} label='Guru'>
                <MenuItem value=''>Semua Guru</MenuItem>
                {teachers.map(teacher => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center'>
                      <Typography variant='body2' className='py-8'>
                        Tidak ada jadwal mengajar
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editingSchedule ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='mt-2'>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Guru</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                  label='Guru'
                >
                  {teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Hari</InputLabel>
                <Select
                  value={formData.day}
                  onChange={e => setFormData({ ...formData, day: e.target.value })}
                  label='Hari'
                >
                  <MenuItem value='Senin'>Senin</MenuItem>
                  <MenuItem value='Selasa'>Selasa</MenuItem>
                  <MenuItem value='Rabu'>Rabu</MenuItem>
                  <MenuItem value='Kamis'>Kamis</MenuItem>
                  <MenuItem value='Jumat'>Jumat</MenuItem>
                  <MenuItem value='Sabtu'>Sabtu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label='Tahun Ajaran'
                value={formData.academicYear}
                disabled
                helperText='Mengikuti tahun ajaran yang sedang aktif'
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='time'
                label='Jam Mulai'
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='time'
                label='Jam Selesai'
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Pilih Kelas</InputLabel>
                <Select
                  value={classes.find(c => c.grade === formData.grade && c.className === formData.class)?.id || ''}
                  onChange={e => {
                    const selectedClass = classes.find(c => c.id === e.target.value)

                    if (selectedClass) {
                      setFormData({
                        ...formData,
                        grade: selectedClass.grade,
                        class: selectedClass.className
                      })
                    }
                  }}
                  label='Pilih Kelas'
                >
                  {classes.length === 0 ? (
                    <MenuItem disabled>Belum ada data kelas. Silakan buat kelas terlebih dahulu.</MenuItem>
                  ) : (
                    classes.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        Kelas {c.grade} {c.className} ({c.academicYear})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {classes.length === 0 && (
                  <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                    Data kelas kosong. Silakan isi di menu Akademik &gt; Data Kelas.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Room and Notes fields */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label='Ruangan'
                placeholder='Contoh: Ruang Lab, Lt. 2, dsb.'
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label='Catatan Khusus'
                placeholder='Masukkan catatan tambahan jika ada...'
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={
              !formData.teacherId ||
              !formData.day ||
              !formData.startTime ||
              !formData.endTime ||
              !formData.grade ||
              !formData.class
            }
          >
            {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Jadwal'
        content='Apakah Anda yakin ingin menghapus jadwal mengajar ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </>
  )
}

export default TeachingScheduleTable
