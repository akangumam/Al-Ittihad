'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { TextFieldProps } from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

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
import { useAppContext } from '@/contexts/AppContext'
import type { ActivityLogType, ActivityType } from '@/types/activityLog'

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

  addMeta({
    itemRank
  })

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

const columnHelper = createColumnHelper<ActivityLogType>()

const ActivityLogTable = () => {
  const { activityLogs, getActivityLogs } = useAppContext()
  const [data, setData] = useState<ActivityLogType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLogType | null>(null)

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleViewDetails = (log: ActivityLogType) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailOpen(false)
    setSelectedLog(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  useEffect(() => {
    // Apply filters
    const filtered = getActivityLogs({
      activityType: (activityTypeFilter as ActivityType) || undefined,
      status: (statusFilter as 'success' | 'failed') || undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined
    })

    setData(filtered)
  }, [activityLogs, activityTypeFilter, statusFilter, dateRange, getActivityLogs])

  const getActivityTypeColor = (type: ActivityType) => {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
      user_login: 'success',
      user_logout: 'warning',
      user_login_failed: 'error',
      student_created: 'info',
      student_updated: 'primary',
      student_deleted: 'error',
      income_created: 'success',
      income_updated: 'primary',
      income_deleted: 'error',
      expense_created: 'warning',
      expense_updated: 'primary',
      expense_deleted: 'error',
      spp_payment_created: 'success',
      class_created: 'info',
      class_updated: 'primary',
      class_deleted: 'error',
      academic_year_created: 'info',
      academic_year_updated: 'primary',
      other: 'secondary'
    }

    return colorMap[type] || 'secondary'
  }

  const getActivityTypeLabel = (type: ActivityType) => {
    const labelMap: Record<string, string> = {
      user_login: 'Login',
      user_logout: 'Logout',
      user_login_failed: 'Login Gagal',
      student_created: 'Siswa Dibuat',
      student_updated: 'Siswa Diubah',
      student_deleted: 'Siswa Dihapus',
      income_created: 'Pemasukan Dibuat',
      income_updated: 'Pemasukan Diubah',
      income_deleted: 'Pemasukan Dihapus',
      expense_created: 'Pengeluaran Dibuat',
      expense_updated: 'Pengeluaran Diubah',
      expense_deleted: 'Pengeluaran Dihapus',
      spp_payment_created: 'Pembayaran SPP',
      class_created: 'Kelas Dibuat',
      class_updated: 'Kelas Diubah',
      class_deleted: 'Kelas Dihapus',
      academic_year_created: 'Tahun Ajaran Dibuat',
      academic_year_updated: 'Tahun Ajaran Diubah',
      other: 'Lainnya'
    }

    return labelMap[type] || type
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }

  const columns = useMemo<ColumnDef<ActivityLogType, any>[]>(
    () => [
      columnHelper.accessor('timestamp', {
        header: 'Waktu',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {formatDateTime(row.original.timestamp)}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('username', {
        header: 'User',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.username || 'System'}</Typography>
      }),
      columnHelper.accessor('activityType', {
        header: 'Tipe Aktivitas',
        cell: ({ row }) => (
          <Chip
            label={getActivityTypeLabel(row.original.activityType)}
            color={getActivityTypeColor(row.original.activityType)}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.description}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 'success' ? 'Berhasil' : 'Gagal'}
            color={row.original.status === 'success' ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('id', {
        header: 'Aksi',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Lihat Detail'>
              <IconButton size='small' onClick={() => handleViewDetails(row.original)}>
                <i className='ri-eye-line text-textSecondary' />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-4'>
        <div className='flex flex-col gap-1'>
          <Typography variant='h5'>Log Aktivitas Sistem</Typography>
          <Typography variant='body2' color='text.secondary'>
            Total: {data.length} aktivitas tercatat
          </Typography>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setActivityTypeFilter('')
              setStatusFilter('')
              setDateRange({ startDate: '', endDate: '' })
              setGlobalFilter('')
            }}
            startIcon={<i className='ri-refresh-line' />}
          >
            Reset Filter
          </Button>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => {
              try {
                // Create CSV content
                const headers = ['Waktu', 'User', 'User ID', 'Tipe Aktivitas', 'Status', 'Deskripsi', 'Metadata']

                // Helper to escape CSV fields
                const escapeCsv = (str: string | null | undefined) => {
                  if (str === null || str === undefined) return ''
                  const stringValue = String(str)

                  // Escape if contains delimiter (;), quote ("), or newline
                  if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                  }

                  return stringValue
                }

                // Helper to format date for CSV (YYYY-MM-DD HH:mm:ss)
                const formatDateForCsv = (isoString: string) => {
                  const date = new Date(isoString)

                  return date
                    .toLocaleString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })
                    .replace(/\./g, ':') // Ensure time uses colons
                }

                const csvRows = data.map(log => {
                  const metadataStr = log.metadata ? JSON.stringify(log.metadata) : ''

                  return [
                    escapeCsv(formatDateForCsv(log.timestamp)),
                    escapeCsv(log.username || 'System'),
                    escapeCsv(log.userId || '-'),
                    escapeCsv(getActivityTypeLabel(log.activityType)),
                    escapeCsv(log.status === 'success' ? 'Berhasil' : 'Gagal'),
                    escapeCsv(log.description),
                    escapeCsv(metadataStr)
                  ].join(';') // Use semicolon delimiter
                })

                // Add sep=; for Excel to recognize delimiter automatically
                const csvContent = ['sep=;', headers.join(';'), ...csvRows].join('\n')

                // Add BOM for Excel UTF-8 compatibility
                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })

                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')

                link.setAttribute('href', url)
                link.setAttribute('download', `Log_Aktivitas_${new Date().toISOString().split('T')[0]}.csv`)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                // Save last export date
                localStorage.setItem('lastLogExportDate', new Date().toISOString())

                // Show success snackbar
                setSnackbar({
                  open: true,
                  message: 'Log aktivitas berhasil diexport',
                  severity: 'success'
                })
              } catch (error) {
                console.error('Export failed:', error)
                setSnackbar({
                  open: true,
                  message: 'Gagal mengexport log aktivitas',
                  severity: 'error'
                })
              }
            }}
            startIcon={<i className='ri-download-line' />}
          >
            Export Log
          </Button>
        </div>
      </CardContent>

      <CardContent className='flex flex-col gap-4'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Cari aktivitas...'
              className='is-full'
              id='activity-log-search'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='activity-type-select-label'>Tipe Aktivitas</InputLabel>
              <Select
                labelId='activity-type-select-label'
                id='activity-type-select'
                value={activityTypeFilter}
                onChange={e => setActivityTypeFilter(e.target.value)}
                label='Tipe Aktivitas'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='user_login'>Login</MenuItem>
                <MenuItem value='user_logout'>Logout</MenuItem>
                <MenuItem value='user_login_failed'>Login Gagal</MenuItem>
                <MenuItem value='student_created'>Siswa Dibuat</MenuItem>
                <MenuItem value='student_updated'>Siswa Diubah</MenuItem>
                <MenuItem value='income_created'>Pemasukan Dibuat</MenuItem>
                <MenuItem value='expense_created'>Pengeluaran Dibuat</MenuItem>
                <MenuItem value='spp_payment_created'>Pembayaran SPP</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='status-select-label'>Status</InputLabel>
              <Select
                labelId='status-select-label'
                id='status-select'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label='Status'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='success'>Berhasil</MenuItem>
                <MenuItem value='failed'>Gagal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              id='date-start'
              type='date'
              label='Dari Tanggal'
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              size='small'
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              id='date-end'
              type='date'
              label='Sampai Tanggal'
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              size='small'
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
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
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <Typography className='py-6'>Tidak ada data aktivitas</Typography>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        labelRowsPerPage='Baris per halaman:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
      />

      <Dialog open={detailOpen} onClose={handleCloseDetails} maxWidth='sm' fullWidth>
        <DialogTitle>Detail Aktivitas</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Typography variant='subtitle2' color='text.secondary'>
                  Waktu
                </Typography>
                <Typography variant='body1'>{formatDateTime(selectedLog.timestamp)}</Typography>
              </div>

              <div className='flex flex-col gap-1'>
                <Typography variant='subtitle2' color='text.secondary'>
                  User
                </Typography>
                <div className='flex items-center gap-2'>
                  <Typography variant='body1'>{selectedLog.username || 'System'}</Typography>
                  {selectedLog.userId && (
                    <Typography variant='caption' className='bg-actionHover px-2 py-0.5 rounded'>
                      ID: {selectedLog.userId}
                    </Typography>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <Typography variant='subtitle2' color='text.secondary'>
                  Tipe & Status
                </Typography>
                <div className='flex gap-2'>
                  <Chip
                    label={getActivityTypeLabel(selectedLog.activityType)}
                    color={getActivityTypeColor(selectedLog.activityType)}
                    size='small'
                    variant='tonal'
                  />
                  <Chip
                    label={selectedLog.status === 'success' ? 'Berhasil' : 'Gagal'}
                    color={selectedLog.status === 'success' ? 'success' : 'error'}
                    size='small'
                    variant='tonal'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <Typography variant='subtitle2' color='text.secondary'>
                  Deskripsi
                </Typography>
                <Typography variant='body1'>{selectedLog.description}</Typography>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className='flex flex-col gap-1'>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Metadata (Detail Teknis)
                  </Typography>
                  <div className='bg-actionHover p-3 rounded overflow-auto max-h-[200px]'>
                    <pre className='text-xs m-0 whitespace-pre-wrap'>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color='secondary'>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default ActivityLogTable
