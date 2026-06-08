'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

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
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import { toast } from 'react-toastify'
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

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import { teacherAPI } from '@/services/api'
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

type TeacherType = {
  id: string
  nip: string
  nuptk: string
  name: string
  subject: string
  position: string
  gender: 'L' | 'P'
  phone: string
  email: string
  address: string
  status: 'Aktif' | 'Cuti' | 'Pensiun' | 'Keluar'
  photo?: string | null
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

// Dummy Data Guru removed

const columnHelper = createColumnHelper<TeacherType>()

const TeacherDataTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [teachers, setTeachers] = useState<TeacherType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { lang: locale } = useParams()

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setIsLoading(true)
      const data = await teacherAPI.getAll()

      setTeachers(data)
    } catch (error: any) {
      console.error('Error fetching teachers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleDelete = (id: string) => {
    setSelectedTeacherId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTeacherId) return

    try {
      setIsDeleting(true)
      await teacherAPI.delete(selectedTeacherId)
      toast.success('Data guru berhasil dihapus')
      fetchTeachers()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting teacher:', error)
      toast.error('Gagal menghapus data guru.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Debug: Log jumlah data guru
  useEffect(() => {
    console.log('=== TeacherDataTable Debug ===')
    console.log('Jumlah guru:', teachers?.length || 0)
  }, [teachers])

  const columns = useMemo<ColumnDef<TeacherType, any>[]>(
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
                  href: getLocalizedUrl(`/akademik/data-guru/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Edit Data',
                  icon: 'ri-pencil-line',
                  href: getLocalizedUrl(`/akademik/data-guru/${row.original.id}/edit`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Lihat Jadwal Mengajar',
                  icon: 'ri-calendar-schedule-line',
                  href: `${getLocalizedUrl(`/akademik/data-guru/${row.original.id}`, locale as Locale)}?tab=schedule`,
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
      }),
      columnHelper.accessor('nip', {
        header: 'NIP',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/akademik/data-guru/${row.original.id}`, locale as Locale)}
            color='primary.main'
            className='font-medium'
          >
            {row.original.nip}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nama Lengkap',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar
              src={row.original.photo || undefined}
              sx={{
                width: 40,
                height: 40,
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
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('subject', {
        header: 'Mata Pelajaran',
        cell: ({ row }) => <Chip label={row.original.subject} size='small' color='primary' variant='tonal' />
      }),
      columnHelper.accessor('position', {
        header: 'Jabatan',
        cell: ({ row }) => (
          <Chip
            label={row.original.position}
            size='small'
            color={row.original.position.includes('Kepala') ? 'warning' : 'default'}
            variant='tonal'
          />
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
      columnHelper.accessor('phone', {
        header: 'Kontak',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2'>{row.original.phone}</Typography>
            <Typography variant='caption' color='text.secondary'>
              NUPTK: {row.original.nuptk}
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
            color={
              row.original.status === 'Aktif'
                ? 'success'
                : row.original.status === 'Cuti'
                  ? 'warning'
                  : row.original.status === 'Pensiun'
                    ? 'info'
                    : 'error'
            }
            variant='tonal'
          />
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  )

  const table = useReactTable({
    data: teachers,
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

  return (
    <Card>
      <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
        <div className='flex gap-2'>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            component={Link}
            href={getLocalizedUrl('/akademik/data-guru/tambah', locale as Locale)}
            className='max-sm:is-full'
          >
            Tambah Guru
          </Button>
          <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-line' />}>
            Import Excel
          </Button>
        </div>
        <div className='flex items-center flex-col sm:flex-row max-sm:is-full gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Cari Nama/NIP/Email...'
            className='max-sm:is-full min-is-[250px]'
            id='search-teacher'
          />
          <FormControl fullWidth size='small' className='max-sm:is-full min-is-[150px]'>
            <InputLabel id='subject-select'>Mata Pelajaran</InputLabel>
            <Select
              fullWidth
              id='select-subject'
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              label='Mata Pelajaran'
              labelId='subject-select'
            >
              <MenuItem value=''>Semua</MenuItem>
              <MenuItem value='Matematika'>Matematika</MenuItem>
              <MenuItem value='Bahasa Indonesia'>Bahasa Indonesia</MenuItem>
              <MenuItem value='Bahasa Inggris'>Bahasa Inggris</MenuItem>
              <MenuItem value='IPA'>IPA</MenuItem>
              <MenuItem value='IPS'>IPS</MenuItem>
              <MenuItem value='Pendidikan Agama Islam'>PAI</MenuItem>
            </Select>
          </FormControl>
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
              <MenuItem value='Cuti'>Cuti</MenuItem>
              <MenuItem value='Pensiun'>Pensiun</MenuItem>
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
                  Tidak ada data guru
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
          native: true
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Guru'
        content='Apakah Anda yakin ingin menghapus data guru ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </Card>
  )
}

export default TeacherDataTable
