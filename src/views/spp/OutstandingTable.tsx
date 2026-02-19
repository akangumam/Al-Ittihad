'use client'

// React Imports
import { useState, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'

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

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import { useAppContext } from '@/contexts/AppContext'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type OutstandingType = {
  id: string
  studentNIS: string
  studentName: string
  grade: string
  class: string
  parentName: string
  parentPhone: string
  outstandingMonths: string[]
  totalOutstanding: number
  lastPayment: string
  status: 'Ringan' | 'Sedang' | 'Berat'
}

const columnHelper = createColumnHelper<OutstandingType>()

const OutstandingTable = () => {
  // Get data from context
  const { students, getStudentArrears, sppPayments } = useAppContext()

  const { lang: locale } = useParams()
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // ✅ Auto-calculate arrears from real payment data
  const outstandingData = useMemo<OutstandingType[]>(() => {
    return students
      .map(student => {
        const arrears = getStudentArrears(student.id)

        // Get last payment
        const studentPayments = sppPayments.filter(p => p.studentId === student.id)

        const sortedPayments = [...studentPayments].sort((a, b) => {
          const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0
          const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0

          return dateB - dateA
        })

        const lastPayment = sortedPayments.length > 0 ? sortedPayments[0].paymentDate || '-' : '-'

        // Determine status based on months
        let status: 'Ringan' | 'Sedang' | 'Berat' = 'Ringan'

        if (arrears.months.length >= 3) status = 'Berat'
        else if (arrears.months.length >= 2) status = 'Sedang'

        return {
          id: student.id,
          studentNIS: student.nis,
          studentName: student.name,
          grade: student.grade,
          class: student.class,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          outstandingMonths: arrears.months,
          totalOutstanding: arrears.total,
          lastPayment,
          status
        }
      })
      .filter(student => student.outstandingMonths.length > 0) // Only students with arrears
  }, [students, getStudentArrears, sppPayments])

  // Apply filters
  const data = useMemo(() => {
    let filtered = outstandingData

    if (gradeFilter !== '') {
      filtered = filtered.filter(item => item.grade === gradeFilter)
    }

    if (statusFilter !== '') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    return filtered
  }, [outstandingData, gradeFilter, statusFilter])

  const columns = useMemo<ColumnDef<OutstandingType, any>[]>(
    () => [
      columnHelper.accessor('studentName', {
        header: 'Data Siswa',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar sx={{ width: 38, height: 38, fontSize: '0.875rem', backgroundColor: 'error.main' }}>
              {row.original.studentName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </Avatar>
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.studentName}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.studentNIS} - {row.original.grade}
                {row.original.class}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('parentName', {
        header: 'Orang Tua',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography>{row.original.parentName}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.parentPhone}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('outstandingMonths', {
        header: 'Bulan Tertunggak',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Typography variant='body2' className='font-medium text-error'>
              {row.original.outstandingMonths.length} Bulan
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.outstandingMonths.join(', ')}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('totalOutstanding', {
        header: 'Total Tunggakan',
        cell: ({ row }) => (
          <Typography className='font-medium text-error'>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(row.original.totalOutstanding)}
          </Typography>
        )
      }),
      columnHelper.accessor('lastPayment', {
        header: 'Terakhir Bayar',
        cell: ({ row }) => <Typography variant='body2'>{row.original.lastPayment}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Tingkat',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={row.original.status === 'Berat' ? 'error' : row.original.status === 'Sedang' ? 'warning' : 'info'}
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
                  text: 'Proses Pembayaran',
                  icon: 'ri-money-dollar-circle-line',
                  href: getLocalizedUrl(`/spp/pembayaran?siswa=${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Kirim Notifikasi',
                  icon: 'ri-notification-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                },
                {
                  text: 'Lihat History',
                  icon: 'ri-history-line',
                  href: getLocalizedUrl(`/spp/data-siswa/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                { divider: true },
                {
                  text: 'Cetak Tagihan',
                  icon: 'ri-printer-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                }
              ]}
            />
          </div>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  } as any)

  // Calculate Statistics
  const totalStudents = data.length
  const totalOutstanding = data.reduce((sum, item) => sum + item.totalOutstanding, 0)
  const heavyCount = data.filter(item => item.status === 'Berat').length
  const moderateCount = data.filter(item => item.status === 'Sedang').length

  return (
    <>
      <Grid container spacing={6} className='mbe-6'>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-error-light'>
                  <i className='ri-user-unfollow-line text-error text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Total Siswa Menunggak
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {totalStudents}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dari total {students.length} siswa aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-error-light'>
                  <i className='ri-money-dollar-circle-line text-error text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Total Tunggakan
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium text-error'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(totalOutstanding)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Perlu tindak lanjut
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-warning-light'>
                  <i className='ri-alert-line text-warning text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Tunggakan Berat
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium text-error'>
                {heavyCount}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {'>'} 2 bulan menunggak
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-info-light'>
                  <i className='ri-percent-line text-info text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Tingkat Kolektibilitas
                </Typography>
              </div>
              <Typography variant='h4' className='font-medium'>
                {students.length > 0 ? (((students.length - totalStudents) / students.length) * 100).toFixed(1) : '100'}
                %
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dari target optimal
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity='warning' className='mbe-6'>
        <Typography variant='body2' className='font-medium'>
          Perhatian: Ada {heavyCount} siswa dengan tunggakan berat (&gt;2 bulan) dan {moderateCount} siswa dengan
          tunggakan sedang. Segera lakukan tindak lanjut komunikasi dengan orang tua/wali.
        </Typography>
      </Alert>

      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Daftar Tunggakan SPP
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Monitoring dan tindak lanjut tunggakan pembayaran
            </Typography>
          </div>
          <div className='flex gap-2 flex-wrap'>
            <FormControl size='small' className='min-is-[120px]'>
              <InputLabel id='grade-filter'>Kelas</InputLabel>
              <Select
                labelId='grade-filter'
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                label='Kelas'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='7'>Kelas 7</MenuItem>
                <MenuItem value='8'>Kelas 8</MenuItem>
                <MenuItem value='9'>Kelas 9</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' className='min-is-[120px]'>
              <InputLabel id='status-filter'>Tingkat</InputLabel>
              <Select
                labelId='status-filter'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label='Tingkat'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='Berat'>Berat</MenuItem>
                <MenuItem value='Sedang'>Sedang</MenuItem>
                <MenuItem value='Ringan'>Ringan</MenuItem>
              </Select>
            </FormControl>
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-send-plane-line' />}>
              Kirim Notifikasi Massal
            </Button>
            <Button variant='contained' color='error' startIcon={<i className='ri-download-line' />}>
              Export Laporan
            </Button>
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
                    <Typography className='pbs-10 pbe-10 text-success font-medium'>
                      🎉 Tidak ada tunggakan! Semua siswa sudah membayar SPP.
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
      </Card>
    </>
  )
}

export default OutstandingTable
