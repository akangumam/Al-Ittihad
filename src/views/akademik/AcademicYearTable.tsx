'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Component Imports
import { toast } from 'react-toastify'

import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import { useAppContext } from '@/contexts/AppContext'
import type { AcademicYearType } from '@/contexts/AppContext'

// Third-party Imports

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper<AcademicYearType>()

const AcademicYearTable = () => {
  const { academicYears: data, setAcademicYears: setData } = useAppContext()
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    semester: 'Ganjil' as any,
    isActive: false
  })

  // Confirmation Dialog States
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string
    content: string
    onConfirm: () => void
    color?: 'error' | 'primary' | 'success' | 'warning' | 'info'
    confirmText?: string
  }>({
    title: '',
    content: '',
    onConfirm: () => {},
    color: 'error'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Semester Dialog State
  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false)
  const [activeYearForSemester, setActiveYearForSemester] = useState<AcademicYearType | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil')

  // ✅ Helper to derive status based on dates
  const getStatus = useCallback((year: AcademicYearType) => {
    if (year.isActive) return 'Aktif'
    const now = new Date()
    const start = new Date(year.startDate)
    const end = new Date(year.endDate)

    if (now > end) return 'Selesai'
    if (now < start) return 'Akan Datang'

    return 'Nonaktif'
  }, [])

  // ==================== HANDLERS ====================

  const handleSave = useCallback(async () => {
    try {
      const { academicYearAPI } = await import('@/services/api')

      if (editMode) {
        const updated = await academicYearAPI.update(formData.id, formData)

        setData(data.map(item => (item.id === formData.id ? updated : item)))
      } else {
        // Exclude empty ID when creating
        const createData = { ...formData }

        // @ts-ignore
        delete createData.id

        console.log('Creating new year with data:', createData)
        const newYear = await academicYearAPI.create(createData)

        setData([...data, newYear])
      }

      setOpenDialog(false)
      toast.success(editMode ? 'Tahun ajaran berhasil diperbarui' : 'Tahun ajaran berhasil ditambahkan')
    } catch (error) {
      console.error('Error saving academic year:', error)
      toast.error('Gagal menyimpan tahun ajaran')
    }
  }, [editMode, formData, data, setData])

  const handleToggleActive = useCallback(
    async (id: string) => {
      try {
        const year = data.find(y => y.id === id)

        if (!year) return

        if (year.isActive) {
          setConfirmDialogConfig({
            title: 'Info',
            content:
              'Tahun ajaran aktif tidak bisa dinonaktifkan langsung. Aktifkan tahun ajaran lain untuk menggantinya.',
            onConfirm: () => setConfirmDialogOpen(false),
            color: 'info',
            confirmText: 'Mengerti'
          })
          setConfirmDialogOpen(true)

          return
        }

        // Show confirmation to activate
        setConfirmDialogConfig({
          title: 'Aktifkan Tahun Ajaran',
          content: `Apakah Anda yakin ingin mengaktifkan tahun ajaran "${year.name}"? Tahun ajaran yang aktif saat ini akan menjadi nonaktif.`,
          onConfirm: async () => {
            try {
              setIsSubmitting(true)
              const { academicYearAPI } = await import('@/services/api')

              await academicYearAPI.update(id, { isActive: true })
              setData(
                data.map(item => ({
                  ...item,
                  isActive: item.id === id
                }))
              )
              toast.success(`Tahun ajaran ${year.name} berhasil diaktifkan`)
              setConfirmDialogOpen(false)
            } catch (error) {
              console.error('Error activating year:', error)
              toast.error('Gagal mengaktifkan tahun ajaran')
            } finally {
              setIsSubmitting(false)
            }
          },
          color: 'primary',
          confirmText: 'Ya, Aktifkan'
        })
        setConfirmDialogOpen(true)
      } catch (error) {
        console.error('Error activating year:', error)
        toast.error('Terjadi kesalahan saat memproses data')
      }
    },
    [data, setData]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const year = data.find(y => y.id === id)

      if (!year) return

      if (year.isActive) {
        setConfirmDialogConfig({
          title: 'Gagal Menghapus',
          content: 'Tidak dapat menghapus tahun ajaran yang sedang aktif.',
          onConfirm: () => setConfirmDialogOpen(false),
          color: 'error',
          confirmText: 'OK'
        })
        setConfirmDialogOpen(true)

        return
      }

      setConfirmDialogConfig({
        title: 'Hapus Tahun Ajaran',
        content: `Yakin ingin menghapus tahun ajaran "${year.name}"? Tindakan ini tidak dapat dibatalkan.`,
        onConfirm: async () => {
          try {
            setIsSubmitting(true)
            const { academicYearAPI } = await import('@/services/api')

            await academicYearAPI.delete(id)
            setData(data.filter(item => item.id !== id))
            toast.success('Tahun ajaran berhasil dihapus')
            setConfirmDialogOpen(false)
          } catch (error) {
            console.error('Error deleting year:', error)
            toast.error('Gagal menghapus tahun ajaran')
          } finally {
            setIsSubmitting(false)
          }
        },
        color: 'error',
        confirmText: 'Ya, Hapus'
      })
      setConfirmDialogOpen(true)
    },
    [data, setData]
  )

  const handleOpenSemesterDialog = useCallback(() => {
    const activeYear = data.find(y => y.isActive)

    if (!activeYear) {
      toast.error('Tidak ada tahun ajaran aktif. Silakan aktifkan salah satu tahun ajaran terlebih dahulu.')

      return
    }

    setActiveYearForSemester(activeYear)
    setSelectedSemester(activeYear.semester || 'Ganjil')
    setSemesterDialogOpen(true)
  }, [data])

  const handleUpdateSemester = useCallback(async () => {
    if (!activeYearForSemester) return

    try {
      setIsSubmitting(true)
      const { academicYearAPI } = await import('@/services/api')

      const updatedYear = await academicYearAPI.update(activeYearForSemester.id, {
        semester: selectedSemester
      })

      // Update local state
      setData(data.map(item => (item.id === activeYearForSemester.id ? updatedYear : item)))

      toast.success(`Berhasil mengubah semester ke ${selectedSemester}`)
      setSemesterDialogOpen(false)
    } catch (error) {
      console.error('Error updating semester:', error)
      toast.error('Gagal memperbarui semester')
    } finally {
      setIsSubmitting(false)
    }
  }, [activeYearForSemester, selectedSemester, data, setData])

  const columns = useMemo<ColumnDef<AcademicYearType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'Tahun Ajaran',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium text-lg'>{row.original.name}</Typography>
              {row.original.isActive && (
                <Chip label='Tahun Aktif' size='small' color='success' variant='filled' className='w-fit mt-1' />
              )}
            </div>
          </div>
        )
      }),
      columnHelper.accessor('semester', {
        header: 'Semester',
        cell: ({ row }) => (
          <Chip
            label={row.original.semester || 'Ganjil'}
            size='small'
            color={row.original.semester === 'Ganjil' ? 'primary' : 'secondary'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('startDate', {
        header: 'Periode',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' className='font-medium'>
              {new Date(row.original.startDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              s/d{' '}
              {new Date(row.original.endDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => {
          const status = getStatus(row.original)

          return (
            <Chip
              label={status}
              size='small'
              color={status === 'Aktif' ? 'success' : status === 'Selesai' ? 'default' : 'info'}
              variant='tonal'
            />
          )
        }
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
                  text: 'Edit Tahun Ajaran',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {
                      setEditMode(true)
                      setFormData({
                        id: row.original.id,
                        name: row.original.name,
                        startDate: row.original.startDate,
                        endDate: row.original.endDate,
                        semester: row.original.semester || 'Ganjil',
                        isActive: row.original.isActive
                      })
                      setOpenDialog(true)
                    }
                  }
                },
                {
                  text: row.original.isActive ? 'Sudah Aktif' : 'Aktifkan',
                  icon: row.original.isActive ? 'ri-checkbox-circle-fill' : 'ri-checkbox-circle-line',
                  menuItemProps: {
                    className: `flex items-center gap-2 ${row.original.isActive ? 'text-success cursor-default' : 'text-primary'}`,
                    onClick: () => !row.original.isActive && handleToggleActive(row.original.id)
                  }
                },
                { divider: true },
                {
                  text: 'Hapus',
                  icon: 'ri-delete-bin-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => handleDelete(row.original.id)
                  }
                }
              ]}
            />
          </div>
        )
      })
    ],
    [getStatus, handleDelete, handleToggleActive]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditMode(false)
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div className='flex gap-2'>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={() => {
                setEditMode(false)
                setFormData({
                  id: '',
                  name: '',
                  startDate: '',
                  endDate: '',
                  semester: 'Ganjil',
                  isActive: false
                })
                setOpenDialog(true)
              }}
              className='max-sm:is-full'
            >
              Tambah Tahun Ajaran
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-settings-3-line' />}
              onClick={handleOpenSemesterDialog}
            >
              Pengaturan Semester
            </Button>
          </div>
          <div className='flex items-center flex-col sm:flex-row max-sm:is-full gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Cari Tahun Ajaran...'
              className='max-sm:is-full min-is-[200px]'
              id='search-academic-year'
            />
            <FormControl fullWidth size='small' className='max-sm:is-full min-is-[120px]'>
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                fullWidth
                id='select-status'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label='Status'
                labelId='status-select'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='Aktif'>Aktif</MenuItem>
                <MenuItem value='Selesai'>Selesai</MenuItem>
                <MenuItem value='Akan Datang'>Akan Datang</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Tidak ada data tahun ajaran
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
            id: 'academic-year-pagination-select'
          }}
        />
      </Card>

      {/* Dialog Form untuk Tambah/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mbs-4'>
            <TextField
              fullWidth
              label='Nama Tahun Ajaran'
              placeholder='2024/2025'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <div className='flex gap-4'>
              <TextField
                fullWidth
                label='Tanggal Mulai'
                type='date'
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                label='Tanggal Selesai'
                type='date'
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <FormControl fullWidth>
              <InputLabel>Semester Awal</InputLabel>
              <Select
                label='Semester Awal'
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value as any })}
              >
                <MenuItem value='Ganjil'>Ganjil</MenuItem>
                <MenuItem value='Genap'>Genap</MenuItem>
              </Select>
            </FormControl>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Typography>Jadikan sebagai tahun ajaran aktif</Typography>
            </div>
          </div>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
          <Button variant='outlined' color='secondary' onClick={handleCloseDialog}>
            Batal
          </Button>
          <Button variant='contained' onClick={handleSave}>
            {editMode ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        content={confirmDialogConfig.content}
        color={confirmDialogConfig.color as any}
        confirmText={confirmDialogConfig.confirmText}
        isSubmitting={isSubmitting}
      />

      {/* Semester Settings Dialog */}
      <Dialog open={semesterDialogOpen} onClose={() => setSemesterDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 6 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <i className='ri-settings-3-line' style={{ fontSize: 28, color: '#2196F3' }} />
          </div>
          <Typography variant='h5' component='span' sx={{ fontWeight: 600 }}>
            Pengaturan Semester
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Typography variant='body2' sx={{ textAlign: 'center', mb: 6, color: 'text.secondary' }}>
            Pilih semester yang akan diaktifkan untuk tahun ajaran{' '}
            <span style={{ fontWeight: 600, color: 'text.primary' }}>{activeYearForSemester?.name}</span>
          </Typography>

          <FormControl fullWidth>
            <InputLabel id='semester-select-label'>Semester Aktif</InputLabel>
            <Select
              labelId='semester-select-label'
              value={selectedSemester}
              label='Semester Aktif'
              onChange={e => setSelectedSemester(e.target.value as any)}
            >
              <MenuItem value='Ganjil'>
                <div className='flex items-center gap-2'>
                  <i className='ri-sun-line text-warning' />
                  <span>Semester Ganjil</span>
                </div>
              </MenuItem>
              <MenuItem value='Genap'>
                <div className='flex items-center gap-2'>
                  <i className='ri-moon-line text-primary' />
                  <span>Semester Genap</span>
                </div>
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity='info' icon={<i className='ri-information-line' />} sx={{ mt: 4, borderRadius: 2 }}>
            Penggantian semester akan mempengaruhi filter data absensi dan jadwal pelajaran.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 8, px: 6, gap: 2 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => setSemesterDialogOpen(false)}
            sx={{ minWidth: 100 }}
          >
            Batal
          </Button>
          <Button
            variant='contained'
            onClick={handleUpdateSemester}
            disabled={isSubmitting || selectedSemester === activeYearForSemester?.semester}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
            sx={{ minWidth: 100 }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AcademicYearTable
