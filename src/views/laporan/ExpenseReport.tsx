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
import { expenseAPI } from '@/services/api'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type ExpenseTransactionType = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  account: string
  paymentMethod: string
}

const columnHelper = createColumnHelper<ExpenseTransactionType>()

const ExpenseReport = () => {
  const [data, setData] = useState<ExpenseTransactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const { lang: locale } = useParams()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const expenses = await expenseAPI.getAll()

      const formattedData: ExpenseTransactionType[] = expenses.map((exp: any) => ({
        id: exp.id,
        date: exp.date,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        account: exp.bankAccount?.accountName || 'Unknown',
        paymentMethod: exp.paymentMethod
      }))

      setData(formattedData)
    } catch (error) {
      console.error('Error fetching expense report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = useMemo<ColumnDef<ExpenseTransactionType, any>[]>(
    () => [
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography>{row.original.date}</Typography>
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: ({ row }) => <Chip label={row.original.category} size='small' color='error' variant='tonal' />
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
          <Typography className='font-medium' color='error.main'>
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
                  href: getLocalizedUrl(`/keuangan/pengeluaran/${row.original.id}`, locale as Locale),
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
                  text: 'Kelola di Pengeluaran',
                  icon: 'ri-arrow-right-line',
                  href: getLocalizedUrl('/keuangan/pengeluaran', locale as Locale),
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

  const totalExpense = data.reduce((acc, curr) => acc + curr.amount, 0)

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)
    const rows = [
      ['Tanggal', 'Kategori', 'Keterangan', 'Akun', 'Jumlah'],
      ...data.map(d => [
        new Date(d.date).toLocaleDateString('id-ID'),
        d.category,
        d.description,
        d.account,
        fmt(d.amount)
      ]),
      ['', '', '', 'TOTAL', fmt(totalExpense)]
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `laporan-pengeluaran-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <Typography variant='h5'>Laporan Pengeluaran</Typography>
            <div className='flex gap-2'>
              <Button variant='outlined' startIcon={<i className='ri-printer-line' />} onClick={handlePrint}>
                Cetak
              </Button>
              <Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={handleExportCSV}>
                Export CSV
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
                Total Pengeluaran Periode Ini
              </Typography>
              <Typography variant='h5' color='error.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpense)}
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
                <td className='font-bold p-4 text-error'>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpense)}
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

export default ExpenseReport
