'use client'

// React Imports
import { useState, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import classnames from 'classnames'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Utils Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

type StudentType = {
  id: string
  nis: string
  name: string
  gender: 'L' | 'P'
  status: 'Aktif' | 'Cuti' | 'Keluar'
  paymentStatus: 'Lunas' | 'Menunggak'
}

// Dummy Data Siswa di Kelas
const initialStudents: StudentType[] = [
  {
    id: 'STU-001',
    nis: '2024001',
    name: 'Ahmad Fauzi Rahman',
    gender: 'L',
    status: 'Aktif',
    paymentStatus: 'Lunas'
  },
  {
    id: 'STU-002',
    nis: '2024002',
    name: 'Budi Santoso',
    gender: 'L',
    status: 'Aktif',
    paymentStatus: 'Menunggak'
  },
  {
    id: 'STU-003',
    nis: '2024003',
    name: 'Citra Dewi',
    gender: 'P',
    status: 'Aktif',
    paymentStatus: 'Lunas'
  },
  {
    id: 'STU-004',
    nis: '2024004',
    name: 'Dewi Sartika',
    gender: 'P',
    status: 'Cuti',
    paymentStatus: 'Lunas'
  },
  {
    id: 'STU-005',
    nis: '2024005',
    name: 'Eko Prasetyo',
    gender: 'L',
    status: 'Aktif',
    paymentStatus: 'Menunggak'
  }
]

const columnHelper = createColumnHelper<StudentType>()

const ClassDetail = ({ classId }: { classId: string }) => {
  const { lang: locale } = useParams()
  const [data] = useState(initialStudents)

  // Dummy Class Data
  const classData = {
    id: classId,
    name: '7A',
    grade: '7',
    academicYear: '2024/2025',
    homeRoomTeacher: 'Ibu Siti Aminah, S.Pd',
    totalStudents: data.length,
    maxCapacity: 36,
    status: 'Aktif'
  }

  const columns = useMemo<ColumnDef<StudentType, any>[]>(
    () => [
      columnHelper.accessor('nis', {
        header: 'NIS',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: 'Nama Siswa',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar className='w-8 h-8' sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
              {row.original.name.charAt(0)}
            </Avatar>
            <div className='flex flex-col'>
              <Typography variant='body2' className='font-medium'>
                {row.original.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={row.original.status === 'Aktif' ? 'success' : row.original.status === 'Cuti' ? 'warning' : 'default'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Status SPP',
        cell: ({ row }) => (
          <Chip
            label={row.original.paymentStatus}
            size='small'
            color={row.original.paymentStatus === 'Lunas' ? 'success' : 'error'}
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Tooltip title='Lihat Detail'>
              <IconButton
                size='small'
                component={Link}
                href={getLocalizedUrl(`/akademik/data-siswa/${row.original.id}`, locale as Locale)}
              >
                <i className='ri-eye-line text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Pindahkan Siswa'>
              <IconButton size='small'>
                <i className='ri-arrow-left-right-line text-textSecondary' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: () => false
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const capacityPercentage = (classData.totalStudents / classData.maxCapacity) * 100

  return (
    <Grid container spacing={6}>
      {/* Header Info */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center w-16 h-16 rounded-lg bg-primary-light'>
                  <i className='ri-building-4-line text-primary text-4xl' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <Typography variant='h4'>Kelas {classData.name}</Typography>
                    <Chip label={classData.status} color='success' size='small' variant='tonal' />
                  </div>
                  <Typography color='text.secondary'>Tahun Ajaran {classData.academicYear}</Typography>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button variant='outlined' startIcon={<i className='ri-pencil-line' />}>
                  Edit Kelas
                </Button>
                <Button variant='contained' startIcon={<i className='ri-user-add-line' />}>
                  Tambah Siswa
                </Button>
              </div>
            </div>

            <Grid container spacing={6} className='mbs-6'>
              <Grid size={{ xs: 12, md: 4 }}>
                <div className='flex items-center gap-3 p-4 border rounded-lg'>
                  <Avatar variant='rounded' className='bg-action-hover text-textPrimary'>
                    <i className='ri-user-star-line' />
                  </Avatar>
                  <div>
                    <Typography variant='caption'>Wali Kelas</Typography>
                    <Typography className='font-medium'>{classData.homeRoomTeacher}</Typography>
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <div className='flex items-center gap-3 p-4 border rounded-lg'>
                  <Avatar variant='rounded' className='bg-action-hover text-textPrimary'>
                    <i className='ri-group-line' />
                  </Avatar>
                  <div className='w-full'>
                    <div className='flex justify-between items-center mb-1'>
                      <Typography variant='caption'>Kapasitas Kelas</Typography>
                      <Typography variant='caption' className='font-medium'>
                        {classData.totalStudents} / {classData.maxCapacity}
                      </Typography>
                    </div>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress variant='determinate' value={capacityPercentage} color='primary' />
                    </Box>
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <div className='flex items-center gap-3 p-4 border rounded-lg'>
                  <Avatar variant='rounded' className='bg-action-hover text-textPrimary'>
                    <i className='ri-money-dollar-circle-line' />
                  </Avatar>
                  <div>
                    <Typography variant='caption'>Status Pembayaran</Typography>
                    <Typography className='font-medium'>80% Lunas</Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Student List */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Daftar Siswa'
            action={
              <div className='flex gap-2'>
                <Button variant='text' startIcon={<i className='ri-download-line' />}>
                  Export
                </Button>
              </div>
            }
          />
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
                      Belum ada siswa di kelas ini
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
      </Grid>
    </Grid>
  )
}

export default ClassDetail
