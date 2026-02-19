'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Service Imports
import { expenseAPI } from '@/services/api'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type BOSTransactionType = {
  id: string
  date: string
  referenceNo: string
  description: string
  component: string
  amount: number
}

const columnHelper = createColumnHelper<BOSTransactionType>()

const BOSReport = () => {
  const [data, setData] = useState<BOSTransactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [componentFilter, setComponentFilter] = useState('All')

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const expenses = await expenseAPI.getAll({ category: 'BOS' })

      const formattedData: BOSTransactionType[] = expenses.map((exp: any) => ({
        id: exp.id,
        date: exp.date,
        referenceNo: exp.referenceNo || 'AUTO',
        description: exp.description,
        component: exp.category === 'BOS' ? 'Penggunaan Dana BOS' : 'Lainnya',
        amount: exp.amount
      }))

      setData(formattedData)
    } catch (error) {
      console.error('Error fetching BOS report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = useMemo<ColumnDef<BOSTransactionType, any>[]>(
    () => [
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography>{row.original.date}</Typography>
      }),
      columnHelper.accessor('referenceNo', {
        header: 'No. Bukti',
        cell: ({ row }) => <Typography>{row.original.referenceNo}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Uraian',
        cell: ({ row }) => <Typography>{row.original.description}</Typography>
      }),
      columnHelper.accessor('component', {
        header: 'Komponen BOS',
        cell: ({ row }) => <Chip label={row.original.component} size='small' color='primary' variant='tonal' />
      }),
      columnHelper.accessor('amount', {
        header: 'Jumlah',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.amount)}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: undefined as any,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const totalUsage = data.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <Typography variant='h5'>Laporan Penggunaan Dana BOS</Typography>
            <div className='flex gap-2'>
              <Button variant='outlined' startIcon={<i className='ri-printer-line' />}>
                Cetak Format K7
              </Button>
              <Button variant='contained' startIcon={<i className='ri-download-line' />}>
                Export Excel
              </Button>
            </div>
          </div>

          <div className='flex gap-4 flex-wrap items-end'>
            <AppReactDatepicker
              selectsRange
              endDate={endDate}
              selected={startDate}
              startDate={startDate}
              id='date-range-picker'
              onChange={dates => {
                const [start, end] = dates

                setStartDate(start)
                setEndDate(end)
              }}
              placeholderText='Pilih Periode'
              customInput={<TextField size='small' label='Periode' fullWidth />}
            />
            <FormControl size='small' className='min-w-[200px]'>
              <InputLabel>Komponen BOS</InputLabel>
              <Select label='Komponen BOS' value={componentFilter} onChange={e => setComponentFilter(e.target.value)}>
                <MenuItem value='All'>Semua Komponen</MenuItem>
                <MenuItem value='Pengembangan Perpustakaan'>Pengembangan Perpustakaan</MenuItem>
                <MenuItem value='Kegiatan Pembelajaran dan Ekstrakurikuler'>
                  Kegiatan Pembelajaran dan Ekstrakurikuler
                </MenuItem>
                <MenuItem value='Langganan Daya dan Jasa'>Langganan Daya dan Jasa</MenuItem>
                <MenuItem value='Pemeliharaan Sarana dan Prasarana Sekolah'>
                  Pemeliharaan Sarana dan Prasarana Sekolah
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <Grid container spacing={4} className='mb-6'>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='p-4 border rounded bg-actionHover'>
              <Typography variant='subtitle2' className='mb-1'>
                Total Penggunaan Dana BOS
              </Typography>
              <Typography variant='h5' color='primary.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalUsage)}
              </Typography>
            </div>
          </Grid>
        </Grid>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <CircularProgress size={24} />
                      <span className='ml-2'>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center whitespace-nowrap py-4'>
                    Tidak ada penggunaan dana BOS
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
            <tfoot>
              <tr>
                <td colSpan={4} className='text-right font-bold p-4'>
                  Total
                </td>
                <td className='font-bold p-4 text-primary'>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalUsage)}
                </td>
              </tr>
            </tfoot>
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
          SelectProps={{ native: true }}
        />
      </CardContent>
    </Card>
  )
}

export default BOSReport
