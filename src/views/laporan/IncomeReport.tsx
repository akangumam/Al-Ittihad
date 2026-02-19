'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Grid from '@mui/material/Grid'
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
import { incomeAPI } from '@/services/api'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type IncomeTransactionType = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  account: string
  paymentMethod: string
}

const columnHelper = createColumnHelper<IncomeTransactionType>()

const IncomeReport = () => {
  const [data, setData] = useState<IncomeTransactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const { lang: locale } = useParams()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const incomes = await incomeAPI.getAll()

      const formattedData: IncomeTransactionType[] = incomes.map((inc: any) => ({
        id: inc.id,
        date: inc.date,
        category: inc.category,
        description: inc.description,
        amount: inc.amount,
        account: inc.bankAccount?.accountName || 'Unknown',
        paymentMethod: inc.paymentMethod
      }))

      setData(formattedData)
    } catch (error) {
      console.error('Error fetching income report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = useMemo<ColumnDef<IncomeTransactionType, any>[]>(
    () => [
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography>{row.original.date}</Typography>
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: ({ row }) => <Chip label={row.original.category} size='small' color='success' variant='tonal' />
      }),
      columnHelper.accessor('description', {
        header: 'Keterangan',
        cell: ({ row }) => <Typography>{row.original.description}</Typography>
      }),
      columnHelper.accessor('account', {
        header: 'Akun',
        cell: ({ row }) => <Typography>{row.original.account}</Typography>
      }),
      columnHelper.accessor('amount', {
        header: 'Jumlah',
        cell: ({ row }) => (
          <Typography className='font-medium' color='success.main'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.amount)}
          </Typography>
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
                  href: getLocalizedUrl(`/keuangan/pemasukan/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Cetak Bukti',
                  icon: 'ri-printer-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {
                      alert('Fitur cetak akan segera hadir')
                    }
                  }
                },
                { divider: true },
                {
                  text: 'Kelola di Pemasukan',
                  icon: 'ri-arrow-right-line',
                  href: getLocalizedUrl('/keuangan/pemasukan', locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2 text-primary'
                  }
                }
              ]}
            />
          </div>
        )
      })
    ],
    [locale]
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

  const totalIncome = data.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <Typography variant='h5'>Laporan Pemasukan</Typography>
            <div className='flex gap-2'>
              <Button variant='outlined' startIcon={<i className='ri-printer-line' />}>
                Cetak
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
          </div>
        </div>

        <Grid container spacing={4} className='mb-6'>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='p-4 border rounded bg-actionHover'>
              <Typography variant='subtitle2' className='mb-1'>
                Total Pemasukan Periode Ini
              </Typography>
              <Typography variant='h5' color='success.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalIncome)}
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
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Tidak ada transaksi
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
                <td className='font-bold p-4 text-success'>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalIncome)}
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

export default IncomeReport
