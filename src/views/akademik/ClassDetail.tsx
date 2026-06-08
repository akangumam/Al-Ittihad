'use client'

import { useState, useMemo, useEffect } from 'react'

import { useParams } from 'next/navigation'
import Link from 'next/link'

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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import classnames from 'classnames'

import tableStyles from '@core/styles/table.module.css'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

type ClassDataType = {
  id: string
  grade: string
  className: string
  academicYear: string
  teacher: string
  capacity: number
  currentStudents: number
}

type StudentType = {
  id: string
  nis: string
  name: string
  gender: string
  status: string
}

const columnHelper = createColumnHelper<StudentType>()

const ClassDetail = ({ classId }: { classId: string }) => {
  const { lang: locale } = useParams()
  const [classData, setClassData] = useState<ClassDataType | null>(null)
  const [students, setStudents] = useState<StudentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const classRes = await fetch(`/api/classes/${classId}`)

        if (!classRes.ok) throw new Error('Kelas tidak ditemukan')
        const cls: ClassDataType = await classRes.json()

        setClassData(cls)

        const studentRes = await fetch(`/api/students?grade=${cls.grade}&class=${cls.className}&limit=200`)

        if (studentRes.ok) {
          setStudents(await studentRes.json())
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [classId])

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
            <Avatar
              src={(row.original as any).photo || undefined}
              className='w-8 h-8'
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
            >
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
          </div>
        )
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data: students,
    columns,
    filterFns: { fuzzy: () => false },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <CircularProgress />
      </div>
    )
  }

  if (error || !classData) {
    return <Alert severity='error'>{error || 'Kelas tidak ditemukan'}</Alert>
  }

  const capacityPercentage = Math.min((students.length / classData.capacity) * 100, 100)

  return (
    <Grid container spacing={6}>
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
                    <Typography variant='h4'>
                      Kelas {classData.grade}-{classData.className}
                    </Typography>
                    <Chip label='Aktif' color='success' size='small' variant='tonal' />
                  </div>
                  <Typography color='text.secondary'>Tahun Ajaran {classData.academicYear}</Typography>
                </div>
              </div>
              <Button
                variant='outlined'
                startIcon={<i className='ri-arrow-left-line' />}
                component={Link}
                href={getLocalizedUrl('/akademik/data-kelas', locale as Locale)}
              >
                Kembali
              </Button>
            </div>

            <Grid container spacing={6} className='mbs-6'>
              <Grid size={{ xs: 12, md: 4 }}>
                <div className='flex items-center gap-3 p-4 border rounded-lg'>
                  <Avatar variant='rounded' className='bg-action-hover text-textPrimary'>
                    <i className='ri-user-star-line' />
                  </Avatar>
                  <div>
                    <Typography variant='caption'>Wali Kelas</Typography>
                    <Typography className='font-medium'>{classData.teacher || '-'}</Typography>
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
                        {students.length} / {classData.capacity}
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
                    <i className='ri-team-line' />
                  </Avatar>
                  <div>
                    <Typography variant='caption'>Total Siswa Aktif</Typography>
                    <Typography className='font-medium'>
                      {students.filter(s => s.status === 'Aktif').length} siswa
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Daftar Siswa'
            subheader={`${students.length} siswa ditemukan`}
            action={
              <Button
                variant='text'
                startIcon={<i className='ri-download-line' />}
                onClick={() => {
                  const csv = [
                    ['NIS', 'Nama', 'Jenis Kelamin', 'Status'],
                    ...students.map(s => [s.nis, s.name, s.gender === 'L' ? 'Laki-laki' : 'Perempuan', s.status])
                  ]
                    .map(r => r.map(v => `"${v}"`).join(','))
                    .join('\n')
                  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')

                  a.href = url
                  a.download = `kelas-${classData.grade}${classData.className}-${classData.academicYear}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Export
              </Button>
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
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
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
