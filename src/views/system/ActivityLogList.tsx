'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }

  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface ActivityLog {
  id: string
  userId: string
  username: string
  activityType: string
  description: string
  metadata: any
  status: 'success' | 'failed'
  timestamp: string
  user?: {
    id: string
    username: string
    name: string
    email: string
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<ActivityLog>()

const ActivityLogList = () => {
  const [data, setData] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(globalFilter && { search: globalFilter }),
        ...(activityTypeFilter && { activityType: activityTypeFilter }),
        ...(statusFilter && { status: statusFilter })
      })

      const response = await fetch(`/api/activity-logs?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setPagination(prev => ({ ...prev, ...result.pagination }))
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, globalFilter, activityTypeFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh when window gains focus (user comes back to this page)
  useEffect(() => {
    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])

  // Refresh data when component mounts or page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchData])

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailOpen(false)
    setSelectedLog(null)
  }

  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
      // Auth
      USER_LOGIN: 'success',
      USER_LOGOUT: 'warning',
      USER_LOGIN_FAILED: 'error',
      // Teacher
      TEACHER_CREATE: 'info',
      TEACHER_UPDATE: 'primary',
      TEACHER_DELETE: 'error',
      // Student
      STUDENT_CREATE: 'info',
      STUDENT_UPDATE: 'primary',
      STUDENT_DELETE: 'error',
      // Class
      CLASS_CREATE: 'info',
      CLASS_UPDATE: 'primary',
      CLASS_DELETE: 'error',
      // Academic Year
      ACADEMIC_YEAR_CREATE: 'info',
      ACADEMIC_YEAR_UPDATE: 'primary',
      ACADEMIC_YEAR_DELETE: 'error',
      // Teaching Schedule
      TEACHING_SCHEDULE_CREATE: 'info',
      TEACHING_SCHEDULE_UPDATE: 'primary',
      TEACHING_SCHEDULE_DELETE: 'error',
      // Income
      INCOME_CREATE: 'success',
      INCOME_DELETE: 'error',
      // Expense
      EXPENSE_CREATE: 'warning',
      EXPENSE_DELETE: 'error',
      // SPP
      SPP_PAYMENT_CREATE: 'success',
      SPP_PAYMENT_UPDATE: 'primary',
      SPP_PAYMENT_DELETE: 'error',
      // System User
      SYSTEM_USER_CREATE: 'info',
      SYSTEM_USER_UPDATE: 'primary',
      SYSTEM_USER_DELETE: 'error',
      SYSTEM_USER_RESET_PASSWORD: 'warning'
    }

    return colorMap[type] || colorMap[type.toUpperCase()] || 'secondary'
  }

  const getActivityTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      // Auth
      USER_LOGIN: 'Login',
      USER_LOGOUT: 'Logout',
      USER_LOGIN_FAILED: 'Login Gagal',
      // Teacher
      TEACHER_CREATE: 'Guru Ditambah',
      TEACHER_UPDATE: 'Guru Diperbarui',
      TEACHER_DELETE: 'Guru Dihapus',
      // Student
      STUDENT_CREATE: 'Siswa Ditambah',
      STUDENT_UPDATE: 'Siswa Diperbarui',
      STUDENT_DELETE: 'Siswa Dihapus',
      // Class
      CLASS_CREATE: 'Kelas Ditambah',
      CLASS_UPDATE: 'Kelas Diperbarui',
      CLASS_DELETE: 'Kelas Dihapus',
      // Academic Year
      ACADEMIC_YEAR_CREATE: 'Tahun Ajaran Ditambah',
      ACADEMIC_YEAR_UPDATE: 'Tahun Ajaran Diperbarui',
      ACADEMIC_YEAR_DELETE: 'Tahun Ajaran Dihapus',
      // Teaching Schedule
      TEACHING_SCHEDULE_CREATE: 'Jadwal Ditambah',
      TEACHING_SCHEDULE_UPDATE: 'Jadwal Diperbarui',
      TEACHING_SCHEDULE_DELETE: 'Jadwal Dihapus',
      // Income
      INCOME_CREATE: 'Pemasukan Ditambah',
      INCOME_DELETE: 'Pemasukan Dihapus',
      // Expense
      EXPENSE_CREATE: 'Pengeluaran Ditambah',
      EXPENSE_DELETE: 'Pengeluaran Dihapus',
      // SPP
      SPP_PAYMENT_CREATE: 'Pembayaran SPP Ditambah',
      SPP_PAYMENT_UPDATE: 'Pembayaran SPP Diperbarui',
      SPP_PAYMENT_DELETE: 'Pembayaran SPP Dihapus',
      // System User
      SYSTEM_USER_CREATE: 'Pengguna Ditambah',
      SYSTEM_USER_UPDATE: 'Pengguna Diperbarui',
      SYSTEM_USER_DELETE: 'Pengguna Dihapus',
      SYSTEM_USER_RESET_PASSWORD: 'Reset Password'
    }

    return labelMap[type] || labelMap[type.toUpperCase()] || type
  }

  const columns = useMemo<ColumnDef<ActivityLog, any>[]>(
    () => [
      columnHelper.accessor('timestamp', {
        header: 'Waktu',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {new Date(row.original.timestamp).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {new Date(row.original.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('username', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.user?.name || row.original.username}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              @{row.original.username}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('activityType', {
        header: 'Tipe Aktivitas',
        cell: ({ row }) => (
          <Chip
            label={getActivityTypeLabel(row.original.activityType)}
            color={getActivityTypeColor(row.original.activityType)}
            size='small'
          />
        )
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: ({ row }) => (
          <Typography color='text.primary' className='max-w-md truncate'>
            {row.original.description}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 'success' ? 'Sukses' : 'Gagal'}
            color={row.original.status === 'success' ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Tooltip title='Lihat Detail'>
            <IconButton size='small' onClick={() => handleViewDetails(row.original)}>
              <i className='ri-eye-line' />
            </IconButton>
          </Tooltip>
        )
      })
    ],
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
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <Stack spacing={4} sx={{ p: 4 }}>
          {/* Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder='Cari aktivitas...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              size='small'
            />
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Tipe Aktivitas</InputLabel>
              <Select
                value={activityTypeFilter}
                onChange={e => setActivityTypeFilter(e.target.value)}
                label='Tipe Aktivitas'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Auth —</MenuItem>
                <MenuItem value='USER_LOGIN'>Login</MenuItem>
                <MenuItem value='USER_LOGOUT'>Logout</MenuItem>
                <MenuItem value='USER_LOGIN_FAILED'>Login Gagal</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Guru —</MenuItem>
                <MenuItem value='TEACHER_CREATE'>Guru Ditambah</MenuItem>
                <MenuItem value='TEACHER_UPDATE'>Guru Diperbarui</MenuItem>
                <MenuItem value='TEACHER_DELETE'>Guru Dihapus</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Siswa —</MenuItem>
                <MenuItem value='STUDENT_CREATE'>Siswa Ditambah</MenuItem>
                <MenuItem value='STUDENT_UPDATE'>Siswa Diperbarui</MenuItem>
                <MenuItem value='STUDENT_DELETE'>Siswa Dihapus</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Kelas —</MenuItem>
                <MenuItem value='CLASS_CREATE'>Kelas Ditambah</MenuItem>
                <MenuItem value='CLASS_UPDATE'>Kelas Diperbarui</MenuItem>
                <MenuItem value='CLASS_DELETE'>Kelas Dihapus</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Keuangan —</MenuItem>
                <MenuItem value='INCOME_CREATE'>Pemasukan Ditambah</MenuItem>
                <MenuItem value='INCOME_DELETE'>Pemasukan Dihapus</MenuItem>
                <MenuItem value='EXPENSE_CREATE'>Pengeluaran Ditambah</MenuItem>
                <MenuItem value='EXPENSE_DELETE'>Pengeluaran Dihapus</MenuItem>
                <MenuItem value='SPP_PAYMENT_CREATE'>Pembayaran SPP Ditambah</MenuItem>
                <MenuItem value='SPP_PAYMENT_DELETE'>Pembayaran SPP Dihapus</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label='Status'>
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='success'>Sukses</MenuItem>
                <MenuItem value='failed'>Gagal</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant='outlined'
              onClick={() => {
                setGlobalFilter('')
                setActivityTypeFilter('')
                setStatusFilter('')
              }}
            >
              Reset
            </Button>
            <Tooltip title='Refresh Data'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => fetchData()}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <i className='ri-refresh-line' />}
              >
                Refresh
              </Button>
            </Tooltip>
          </Stack>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                        Tidak ada data
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
          )}

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            count={pagination.total}
            rowsPerPage={pagination.limit}
            page={pagination.page - 1}
            onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
            onRowsPerPageChange={e =>
              setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))
            }
          />
        </Stack>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={handleCloseDetails} maxWidth='md' fullWidth>
        <DialogTitle>Detail Aktivitas</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Waktu
                </Typography>
                <Typography variant='body1'>
                  {new Date(selectedLog.timestamp).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium'
                  })}
                </Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  User
                </Typography>
                <Typography variant='body1'>
                  {selectedLog.user?.name || selectedLog.username} (@{selectedLog.username})
                </Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Tipe Aktivitas
                </Typography>
                <Chip
                  label={getActivityTypeLabel(selectedLog.activityType)}
                  color={getActivityTypeColor(selectedLog.activityType)}
                  size='small'
                />
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Deskripsi
                </Typography>
                <Typography variant='body1'>{selectedLog.description}</Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Status
                </Typography>
                <Chip
                  label={selectedLog.status === 'success' ? 'Sukses' : 'Gagal'}
                  color={selectedLog.status === 'success' ? 'success' : 'error'}
                  size='small'
                />
              </div>
              {selectedLog.metadata && (() => {
                const meta = typeof selectedLog.metadata === 'string'
                  ? JSON.parse(selectedLog.metadata)
                  : selectedLog.metadata
                const { module: mod, targetId, targetName, ...rest } = meta || {}
                return (
                  <>
                    {mod && (
                      <div>
                        <Typography variant='body2' color='text.secondary'>Modul</Typography>
                        <Typography variant='body1'>{mod}</Typography>
                      </div>
                    )}
                    {targetName && (
                      <div>
                        <Typography variant='body2' color='text.secondary'>Data</Typography>
                        <Typography variant='body1'>{targetName}</Typography>
                      </div>
                    )}
                    {Object.keys(rest).length > 0 && (
                      <div>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Detail</Typography>
                        <Box
                          sx={{
                            bgcolor: 'action.hover',
                            p: 2,
                            borderRadius: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                            maxHeight: 300
                          }}
                        >
                          <pre>{JSON.stringify(rest, null, 2)}</pre>
                        </Box>
                      </div>
                    )}
                  </>
                )
              })()}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ActivityLogList
