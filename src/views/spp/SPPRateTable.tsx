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
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
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

// Component Imports
import OptionMenu from '@core/components/option-menu'
import { useAppContext } from '@/contexts/AppContext'
import type { SPPRateType } from '@/contexts/AppContext'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<SPPRateType>()

const SPPRateTable = () => {
  const { sppRates: data, setSppRates: setData } = useAppContext()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2024/2025')

  const [formData, setFormData] = useState({
    grade: '',
    monthlyAmount: '' as string | number,
    admissionFee: 0,
    effectiveDate: new Date().toISOString().split('T')[0]
  })

  const { lang: locale } = useParams()

  const handleSaveRate = () => {
    const amount = Number(formData.monthlyAmount)

    if (!formData.grade || amount <= 0) {
      alert('Mohon isi Tingkat dan SPP Bulanan')

      return
    }

    const newRate: SPPRateType = {
      id: `RATE-${Date.now()}`,
      academicYear: selectedYear,
      grade: formData.grade,
      amount: amount,
      isActive: true
    }

    setData([...data, newRate])
    setOpenDialog(false)
    setFormData({
      grade: '',
      monthlyAmount: '',
      admissionFee: 0,
      effectiveDate: new Date().toISOString().split('T')[0]
    })
  }

  const columns = useMemo<ColumnDef<SPPRateType, any>[]>(
    () => [
      columnHelper.accessor('academicYear', {
        header: 'Tahun Ajaran',
        cell: ({ row }) => (
          <Chip
            label={row.original.academicYear}
            size='small'
            color={row.original.isActive ? 'primary' : 'default'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('amount', {
        header: 'SPP Bulanan',
        cell: ({ row }) => (
          <Typography className='font-medium text-primary'>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Aktif' : 'Tidak Aktif'}
            size='small'
            color={row.original.isActive ? 'success' : 'default'}
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
                  text: 'Edit Tarif',
                  icon: 'ri-pencil-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                },
                { divider: true },
                {
                  text: row.original.isActive ? 'Nonaktifkan' : 'Aktifkan',
                  icon: row.original.isActive ? 'ri-close-circle-line' : 'ri-check-line',
                  menuItemProps: {
                    className: classnames('flex items-center gap-2', {
                      'text-error': row.original.isActive
                    }),
                    onClick: () => handleToggleStatus(row.original.id)
                  }
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

  const handleToggleStatus = (id: string) => {
    setData(data.map(item => (item.id === id ? { ...item, isActive: !item.isActive } : item)))
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  } as any)

  return (
    <>
      <Grid container spacing={6} className='mbe-6'>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary-light'>
                  <i className='ri-money-dollar-circle-line text-primary text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Tarif SPP Aktif
                </Typography>
              </div>
              <div className='flex flex-col gap-2 mt-1'>
                {[
                  { grade: '7', label: 'Kelas 7' },
                  { grade: '8', label: 'Kelas 8' },
                  { grade: '9', label: 'Kelas 9' }
                ].map(item => {
                  const rate = data.find(r => r.grade === item.grade && r.isActive)?.amount || 0

                  return (
                    <div key={item.grade} className='flex justify-between items-center'>
                      <Typography variant='caption' color='text.secondary'>
                        {item.label}
                      </Typography>
                      <Typography variant='body2' className='font-medium'>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(rate)}
                      </Typography>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-info-light'>
                  <i className='ri-calendar-line text-info text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Tahun Ajaran Aktif
                </Typography>
              </div>
              <Typography variant='h5' className='font-medium'>
                {data.find(r => r.isActive)?.academicYear || '-'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {data.filter(r => r.isActive).length} Tingkat Aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-warning-light'>
                  <i className='ri-archive-line text-warning text-2xl' />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Total Konfigurasi
                </Typography>
              </div>
              <Typography variant='h5' className='font-medium'>
                {data.length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Data Tersimpan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Konfigurasi Tarif SPP
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola nominal SPP untuk setiap tingkat dan tahun ajaran
            </Typography>
          </div>
          <div className='flex gap-2'>
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-history-line' />}>
              Riwayat Perubahan
            </Button>
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setOpenDialog(true)}>
              Tambah Tarif Baru
            </Button>
          </div>
        </CardContent>

        <Alert severity='info' className='mx-6 mbe-4'>
          <strong>Informasi:</strong> Perubahan tarif SPP akan berlaku untuk periode pembayaran berikutnya. Pastikan
          mengkomunikasikan perubahan dengan orang tua/wali siswa.
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Tidak ada data tarif SPP
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

      {/* Dialog Tambah Tarif */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Tambah Tarif SPP Baru</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pbs-4'>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='year-select'>Tahun Ajaran</InputLabel>
                <Select
                  labelId='year-select'
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  label='Tahun Ajaran'
                >
                  <MenuItem value='2024/2025'>2024/2025</MenuItem>
                  <MenuItem value='2025/2026'>2025/2026</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='grade-select'>Tingkat</InputLabel>
                <Select
                  labelId='grade-select'
                  label='Tingkat'
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                >
                  <MenuItem value='7'>Kelas 7</MenuItem>
                  <MenuItem value='8'>Kelas 8</MenuItem>
                  <MenuItem value='9'>Kelas 9</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='SPP Bulanan'
                value={
                  formData.monthlyAmount ? new Intl.NumberFormat('id-ID').format(Number(formData.monthlyAmount)) : ''
                }
                onChange={e => {
                  // Remove non-numeric characters
                  const numericValue = e.target.value.replace(/\D/g, '')

                  setFormData({
                    ...formData,
                    monthlyAmount: numericValue === '' ? '' : Number(numericValue)
                  })
                }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='secondary' onClick={() => setOpenDialog(false)}>
            Batal
          </Button>
          <Button variant='contained' onClick={handleSaveRate}>
            Simpan Tarif
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SPPRateTable
