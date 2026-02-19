'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'
import { classAPI, teacherAPI, academicYearAPI } from '@/services/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

type ClassType = {
  id: string
  name: string
  grade: string
  academicYear: string
  homeRoomTeacher: string
  totalStudents: number
  maxCapacity: number
}

// Dummy Data Kelas
// Dummy Data Kelas removed

const columnHelper = createColumnHelper<ClassType>()

type TeacherType = {
  id: string
  name: string
  status: string
}

const ClassDataTable = () => {
  const { setClasses: setGlobalClasses } = useAppContext()
  const [data, setData] = useState<ClassType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  const [teachers, setTeachers] = useState<TeacherType[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const { lang: locale } = useParams()

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<ClassType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    academicYear: '',
    homeRoomTeacher: '',
    maxCapacity: 36
  })

  // Fetch classes from API
  // Fetch classes from API
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true)
      const classes = await classAPI.getAll()

      // Update global context
      setGlobalClasses(
        classes.map((item: any) => ({
          id: item.id,
          grade: item.grade || '',
          className: item.className || '',
          capacity: Number(item.capacity || 36),
          currentStudents: Number(item.currentStudents || 0),
          teacher: item.teacher || '',
          academicYear: item.academicYear || ''
        }))
      )

      // Map API data to ClassType for local display
      const mappedData: ClassType[] = classes.map((item: any) => ({
        id: item.id,
        name: item.className || item.name || '',
        grade: item.grade || '',
        academicYear: item.academicYear || '',
        homeRoomTeacher: item.teacher || item.homeRoomTeacher || '',
        totalStudents: Number(item.currentStudents ?? item.totalStudents ?? 0),
        maxCapacity: Number(item.capacity ?? item.maxCapacity ?? 36)
      }))

      setData(mappedData)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setGlobalClasses])

  // Fetch teachers from API
  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoadingTeachers(true)
      const teacherList = await teacherAPI.getAll({ status: 'Aktif' })

      setTeachers(
        teacherList.map((t: any) => ({
          id: t.id,
          name: t.name,
          status: t.status
        }))
      )
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setIsLoadingTeachers(false)
    }
  }, [])

  // Fetch academic years from API
  const fetchAcademicYears = useCallback(async () => {
    try {
      const years = await academicYearAPI.getAll()

      setAcademicYears(
        years.map((y: any) => ({
          id: y.id,
          name: y.name,
          isActive: y.isActive
        }))
      )

      // Set default to active year if exists
      const activeYear = years.find((y: any) => y.isActive)

      if (activeYear && !formData.academicYear) {
        setFormData(prev => ({ ...prev, academicYear: activeYear.name }))
      }
    } catch (error) {
      console.error('Error fetching academic years:', error)
    }
  }, [formData.academicYear])

  useEffect(() => {
    fetchClasses()
    fetchTeachers()
    fetchAcademicYears()
  }, [fetchClasses, fetchTeachers, fetchAcademicYears])

  const handleAddNew = useCallback(() => {
    setEditMode(false)
    setSelectedClass(null)

    const activeYear = academicYears.find(y => y.isActive)

    setFormData({
      name: '',
      grade: '',
      academicYear: activeYear?.name || academicYears[0]?.name || '',
      homeRoomTeacher: '',
      maxCapacity: 36
    })
    setOpenDialog(true)
  }, [academicYears])

  const handleEdit = useCallback((classData: ClassType) => {
    setEditMode(true)
    setSelectedClass(classData)
    setFormData({
      name: classData.name,
      grade: classData.grade,
      academicYear: classData.academicYear,
      homeRoomTeacher: classData.homeRoomTeacher,
      maxCapacity: classData.maxCapacity
    })
    setOpenDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      // Map frontend data to API format
      const apiData = {
        grade: formData.grade,
        className: formData.name,
        academicYear: formData.academicYear,
        teacher: formData.homeRoomTeacher,
        capacity: Number(formData.maxCapacity)
      }

      if (editMode && selectedClass) {
        // Update existing class
        await classAPI.update(selectedClass.id, apiData)
      } else {
        // Add new class
        await classAPI.create(apiData)
      }

      fetchClasses() // Refresh data
      setOpenDialog(false)
    } catch (error: any) {
      console.error('Error saving class:', error)
      alert(error.message || 'Gagal menyimpan data kelas')
    }
  }, [editMode, selectedClass, formData, fetchClasses])

  // Open delete confirmation dialog
  const handleDeleteClick = useCallback((classData: ClassType) => {
    setClassToDelete(classData)
    setDeleteDialogOpen(true)
  }, [])

  // Confirm delete action
  const handleConfirmDelete = useCallback(async () => {
    if (!classToDelete) return

    setIsDeleting(true)

    try {
      await classAPI.delete(classToDelete.id)
      fetchClasses() // Refresh data
      setDeleteDialogOpen(false)
      setClassToDelete(null)
    } catch (error: any) {
      console.error('Error deleting class:', error)
      alert(error.message || 'Gagal menghapus kelas')
    } finally {
      setIsDeleting(false)
    }
  }, [classToDelete, fetchClasses])

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setClassToDelete(null)
  }, [])

  // Status toggle removed - status field does not exist in database schema

  const columns = useMemo<ColumnDef<ClassType, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nama Kelas',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light'>
              <i className='ri-home-4-line text-primary text-xl' />
            </div>
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('grade', {
        header: 'Tingkat',
        cell: ({ row }) => <Chip label={`Kelas ${row.original.grade}`} size='small' color='primary' variant='tonal' />
      }),
      columnHelper.accessor('academicYear', {
        header: 'Tahun Ajaran',
        cell: ({ row }) => <Chip label={row.original.academicYear} size='small' color='info' variant='tonal' />
      }),
      columnHelper.accessor('homeRoomTeacher', {
        header: 'Wali Kelas',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='ri-user-3-line text-textSecondary' />
            <Typography variant='body2'>{row.original.homeRoomTeacher}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('totalStudents', {
        header: 'Jumlah Siswa',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>
              {row.original.totalStudents} / {row.original.maxCapacity}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {((row.original.totalStudents / row.original.maxCapacity) * 100).toFixed(0)}% penuh
            </Typography>
          </div>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Lihat Siswa',
                  icon: 'ri-group-line',
                  href: `${getLocalizedUrl('/akademik/data-siswa', locale as Locale)}?grade=${row.original.grade}&class=${row.original.name}`,
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Edit Kelas',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => handleEdit(row.original)
                  }
                },
                {
                  text: 'Pindahkan Siswa',
                  icon: 'ri-arrow-left-right-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => alert('Fungsi pindahkan siswa sedang dikembangkan.')
                  }
                },
                { divider: true },
                {
                  text: 'Hapus',
                  icon: 'ri-delete-bin-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => handleDeleteClick(row.original)
                  }
                }
              ]}
            />
          </div>
        )
      })
    ],
    [handleEdit, handleDeleteClick, locale]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  } as any)

  // Calculate stats
  const stats = useMemo(() => {
    // All classes are considered active since there's no status field
    const totalStudents = data.reduce((sum, c) => sum + (Number(c.totalStudents) || 0), 0)
    const totalCapacity = data.reduce((sum, c) => sum + (Number(c.maxCapacity) || 0), 0)

    return {
      totalClasses: data.length,
      totalStudents,
      totalCapacity,
      fullClasses: data.filter(c => (Number(c.totalStudents) || 0) >= (Number(c.maxCapacity) || 1)).length
    }
  }, [data])

  return (
    <>
      {/* Summary Cards */}
      <Grid container spacing={6} className='mbe-6'>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary-light'>
                  <i className='ri-home-4-line text-primary text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Total Kelas Aktif
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {stats.totalClasses}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Tahun Ajaran 2024/2025
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-success-light'>
                  <i className='ri-group-line text-success text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Total Siswa
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {stats.totalStudents}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dari {stats.totalCapacity} kapasitas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-info-light'>
                  <i className='ri-percent-line text-info text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Rata-rata Isi Kelas
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {stats.totalCapacity > 0 ? ((stats.totalStudents / stats.totalCapacity) * 100).toFixed(0) : 0}%
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Kapasitas terisi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-warning-light'>
                  <i className='ri-alert-line text-warning text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Kelas Penuh
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {stats.fullClasses}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dari {stats.totalClasses} kelas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Data Kelas
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola data kelas, wali kelas, dan kapasitas siswa
            </Typography>
          </div>
          <div className='flex gap-2'>
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-file-excel-line' />}>
              Export Excel
            </Button>
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAddNew}>
              Tambah Kelas
            </Button>
          </div>
        </CardContent>

        <Alert severity='info' className='mx-6 mbe-4'>
          <strong>Info:</strong> Kapasitas maksimal kelas standar adalah 36 siswa sesuai peraturan sekolah.
        </Alert>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <div className='flex justify-center items-center py-8'>
                      <i className='ri-loader-4-line animate-spin text-2xl' />
                      <span className='ml-2'>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Tidak ada data kelas
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
      </Card>

      {/* Dialog Form */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pbs-4'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='grade-select'>Tingkat</InputLabel>
                <Select
                  labelId='grade-select'
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  label='Tingkat'
                >
                  <MenuItem value='7'>Kelas 7</MenuItem>
                  <MenuItem value='8'>Kelas 8</MenuItem>
                  <MenuItem value='9'>Kelas 9</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Nama Kelas'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='Contoh: 7A, 8B'
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Tahun Ajaran'
                value={formData.academicYear}
                disabled
                helperText='Sesuai dengan tahun ajaran yang sedang aktif'
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id='teacher-select'>Wali Kelas</InputLabel>
                <Select
                  labelId='teacher-select'
                  value={formData.homeRoomTeacher}
                  onChange={e => setFormData({ ...formData, homeRoomTeacher: e.target.value })}
                  label='Wali Kelas'
                  disabled={isLoadingTeachers}
                  endAdornment={isLoadingTeachers ? <CircularProgress size={20} sx={{ mr: 4 }} /> : null}
                >
                  {teachers.length === 0 ? (
                    <MenuItem value='' disabled>
                      {isLoadingTeachers ? 'Memuat data guru...' : 'Belum ada guru terdaftar'}
                    </MenuItem>
                  ) : (
                    teachers.map(teacher => (
                      <MenuItem key={teacher.id} value={teacher.name}>
                        {teacher.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='number'
                label='Kapasitas Maksimal'
                value={formData.maxCapacity}
                onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='secondary' onClick={() => setOpenDialog(false)}>
            Batal
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={!formData.name || !formData.grade || !formData.homeRoomTeacher}
          >
            {editMode ? 'Simpan Perubahan' : 'Tambah Kelas'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 6, pb: 4 }}>
          {/* Warning Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(238, 90, 90, 0.35)'
            }}
          >
            <i className='ri-delete-bin-line' style={{ fontSize: 36, color: 'white' }} />
          </div>

          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            Hapus Kelas?
          </Typography>

          <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
            Apakah Anda yakin ingin menghapus kelas
          </Typography>

          {classToDelete && (
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'error.main', mb: 2 }}>
              Kelas {classToDelete.grade}
              {classToDelete.name}
            </Typography>
          )}

          <Typography variant='body2' color='text.secondary'>
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 5, gap: 2 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleCancelDelete}
            disabled={isDeleting}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={16} color='inherit' /> : <i className='ri-delete-bin-line' />
            }
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Academic Year Dialog */}
    </>
  )
}

export default ClassDataTable
