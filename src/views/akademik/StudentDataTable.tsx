'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

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
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
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
import { toast } from 'react-toastify'

// Icon Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import type { StudentType } from '@/contexts/AppContext'
import ImportStudentModal from './ImportStudentModal'
import { studentAPI } from '@/services/api'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper<StudentType>()

const StudentDataTable = () => {
  const [students, setStudents] = useState<StudentType[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<any[]>([])
  const [gradeFilter, setGradeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const classParam = searchParams.get('class')
  const gradeParam = searchParams.get('grade')

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const data = await studentAPI.getAll()

      setStudents(data)
    } catch (error: any) {
      console.error('Error fetching students:', error)
      toast.error('Gagal memuat data siswa')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Sync all filters to table state
  useEffect(() => {
    const filters = []

    if (classParam) {
      filters.push({ id: 'class', value: classParam })
    }

    if (gradeParam || gradeFilter) {
      filters.push({ id: 'grade', value: gradeParam || gradeFilter })
    }

    if (statusFilter) {
      filters.push({ id: 'status', value: statusFilter })
    }

    setColumnFilters(filters)
  }, [classParam, gradeParam, gradeFilter, statusFilter])

  const handleDelete = (id: string) => {
    setSelectedStudentId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStudentId) return

    try {
      setIsDeleting(true)
      await studentAPI.delete(selectedStudentId)
      toast.success('Data siswa berhasil dihapus')
      fetchStudents()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error('Error deleting student:', error)
      toast.error(error.message || 'Gagal menghapus data siswa')
    } finally {
      setIsDeleting(false)
      setSelectedStudentId(null)
    }
  }

  const handleImportSuccess = () => {
    toast.success('Data siswa berhasil diimport')
    setIsImportModalOpen(false)
    fetchStudents() // Refresh data after import
  }

  const columns = useMemo<ColumnDef<StudentType, any>[]>(
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
      columnHelper.accessor('nis', {
        header: 'NIS',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/akademik/data-siswa/${row.original.id}`, locale as Locale)}
            color='primary.main'
            className='font-medium'
          >
            {row.original.nis}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nama Lengkap',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '1rem',
                backgroundColor: row.original.gender === 'L' ? 'primary.main' : 'secondary.main'
              }}
            >
              {row.original.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Avatar>
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.name}</Typography>
              <Typography variant='caption' color='text.secondary'>
                NISN: {row.original.nisn}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('grade', {
        header: 'Tingkat',
        cell: ({ row }) => <Typography>{row.original.grade}</Typography>
      }),
      columnHelper.accessor('class', {
        header: 'Kelas',
        cell: ({ row }) => (
          <Chip label={`${row.original.grade}${row.original.class}`} size='small' color='primary' variant='tonal' />
        )
      }),
      columnHelper.accessor('gender', {
        header: 'L/P',
        cell: ({ row }) => (
          <Chip
            label={row.original.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
            size='small'
            color={row.original.gender === 'L' ? 'info' : 'secondary'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('parentName', {
        header: 'Orang Tua/Wali',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography>{row.original.parentName}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.parentPhone}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={row.original.status === 'Aktif' ? 'success' : row.original.status === 'Lulus' ? 'info' : 'error'}
            variant='tonal'
          />
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
                  text: 'Lihat Detail',
                  icon: 'ri-eye-line',
                  href: getLocalizedUrl(`/akademik/data-siswa/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Edit Data',
                  icon: 'ri-pencil-line',
                  href: getLocalizedUrl(`/akademik/data-siswa/${row.original.id}/edit`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'History Pembayaran',
                  icon: 'ri-history-line',
                  href: getLocalizedUrl(`/spp/pembayaran?siswa=${row.original.nis}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, students]
  )

  const table = useReactTable({
    data: students,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
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

  // Fix hydration mismatch for TablePagination
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Calculate stats based on filtered data (only count 'Aktif' students for sync with Class List)
  const filteredRows = table.getFilteredRowModel().rows
  const activeRows = filteredRows.filter(r => r.original.status === 'Aktif')

  const stats = {
    total: activeRows.length,
    male: activeRows.filter(r => r.original.gender === 'L').length,
    female: activeRows.filter(r => r.original.gender === 'P').length,
    allRecords: filteredRows.length
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h4'>{stats.total}</Typography>
              <Typography>Total Siswa Aktif</Typography>
            </div>
            <CustomAvatar variant='rounded' skin='light' color='primary' size={44}>
              <i className='ri-group-line text-[28px]' />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h4'>{stats.male}</Typography>
              <Typography>Laki-laki</Typography>
            </div>
            <CustomAvatar variant='rounded' skin='light' color='info' size={44}>
              <i className='ri-men-line text-[28px]' />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h4'>{stats.female}</Typography>
              <Typography>Perempuan</Typography>
            </div>
            <CustomAvatar variant='rounded' skin='light' color='secondary' size={44}>
              <i className='ri-women-line text-[28px]' />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h5'>
                Data Siswa {gradeParam && classParam ? `Kelas ${gradeParam}${classParam}` : ''}
              </Typography>
              {(gradeParam || classParam) && (
                <Typography variant='caption' color='textSecondary'>
                  Menampilkan hanya siswa{' '}
                  {gradeParam || classParam ? `kelas ${gradeParam ?? ''}${classParam ?? ''}` : ''}
                </Typography>
              )}
            </div>
            <div className='flex gap-2 flex-wrap'>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                component={Link}
                href={getLocalizedUrl('/akademik/data-siswa/tambah', locale as Locale)}
                className='max-sm:is-full'
              >
                Tambah Siswa
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                startIcon={<i className='ri-upload-line' />}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import Excel
              </Button>
            </div>
            <div className='flex items-center flex-col sm:flex-row max-sm:is-full gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Cari Nama/NIS/NISN...'
                className='max-sm:is-full min-is-[250px]'
                id='search-student'
              />
              {!classParam && (
                <FormControl fullWidth size='small' className='max-sm:is-full min-is-[120px]'>
                  <InputLabel id='grade-select'>Kelas</InputLabel>
                  <Select
                    fullWidth
                    id='select-grade'
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    label='Kelas'
                    labelId='grade-select'
                  >
                    <MenuItem value=''>Semua</MenuItem>
                    <MenuItem value='7'>Kelas 7</MenuItem>
                    <MenuItem value='8'>Kelas 8</MenuItem>
                    <MenuItem value='9'>Kelas 9</MenuItem>
                  </Select>
                </FormControl>
              )}
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
                  <MenuItem value='Lulus'>Lulus</MenuItem>
                  <MenuItem value='Keluar'>Keluar</MenuItem>
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
                      Tidak ada data siswa
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
            rowsPerPageOptions={[10, 25, 50, 100]}
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
              id: 'student-table-pagination-select'
            }}
          />

          <ImportStudentModal
            open={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={handleImportSuccess}
          />
        </Card>
      </Grid>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Siswa'
        content='Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </Grid>
  )
}

export default StudentDataTable
