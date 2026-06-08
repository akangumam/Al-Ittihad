'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
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
import { incomeAPI, expenseAPI, mutationAPI } from '@/services/api'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type LedgerTransactionType = {
  id: string
  date: string
  referenceNo: string
  description: string
  debit: number
  credit: number
  balance: number
}

const columnHelper = createColumnHelper<LedgerTransactionType>()

const GeneralLedgerReport = () => {
  const [data, setData] = useState<LedgerTransactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [incomes, expenses, mutations] = await Promise.all([
        incomeAPI.getAll(),
        expenseAPI.getAll(),
        mutationAPI.getAll()
      ])

      // Combine and format
      const combined: any[] = [
        ...incomes.map(i => ({ ...i, type: 'in', debit: i.amount, credit: 0 })),
        ...expenses.map(e => ({ ...e, type: 'out', debit: 0, credit: e.amount })),
        ...mutations.map(m => ({ ...m, type: 'mutation', debit: 0, credit: m.amount }))
      ]

      // Sort by date
      combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Calculate running balance
      let currentBalance = 0

      const ledgerData: LedgerTransactionType[] = combined.map(item => {
        currentBalance += item.debit - item.credit

        return {
          id: item.id,
          date: item.date,
          referenceNo: item.referenceNo || 'AUTO',
          description: item.description,
          debit: item.debit,
          credit: item.credit,
          balance: currentBalance
        }
      })

      setData(ledgerData)
    } catch (error) {
      console.error('Error fetching ledger data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = useMemo<ColumnDef<LedgerTransactionType, any>[]>(
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
      columnHelper.accessor('debit', {
        header: 'Penerimaan (Debit)',
        cell: ({ row }) => (
          <Typography color={row.original.debit > 0 ? 'success.main' : 'text.primary'}>
            {row.original.debit > 0
              ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.debit)
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('credit', {
        header: 'Pengeluaran (Kredit)',
        cell: ({ row }) => (
          <Typography color={row.original.credit > 0 ? 'error.main' : 'text.primary'}>
            {row.original.credit > 0
              ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.credit)
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('balance', {
        header: 'Saldo',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.balance)}
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

  const totalDebit = data.reduce((acc, curr) => acc + curr.debit, 0)
  const totalCredit = data.reduce((acc, curr) => acc + curr.credit, 0)
  const finalBalance = data[data.length - 1]?.balance || 0

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)
    const rows = [
      ['Tanggal', 'No Referensi', 'Keterangan', 'Debit', 'Kredit', 'Saldo'],
      ...data.map(d => [
        new Date(d.date).toLocaleDateString('id-ID'),
        d.referenceNo,
        d.description,
        fmt(d.debit),
        fmt(d.credit),
        fmt(d.balance)
      ]),
      ['', '', 'TOTAL', fmt(totalDebit), fmt(totalCredit), fmt(finalBalance)]
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `bku-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <Typography variant='h5'>Buku Kas Umum (BKU)</Typography>
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
                Total Penerimaan
              </Typography>
              <Typography variant='h5' color='success.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalDebit)}
              </Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='p-4 border rounded bg-actionHover'>
              <Typography variant='subtitle2' className='mb-1'>
                Total Pengeluaran
              </Typography>
              <Typography variant='h5' color='error.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCredit)}
              </Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='p-4 border rounded bg-actionHover'>
              <Typography variant='subtitle2' className='mb-1'>
                Saldo Akhir
              </Typography>
              <Typography variant='h5' color='primary.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(finalBalance)}
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
                  <td colSpan={6} className='text-center'>
                    <div className='flex justify-center items-center py-8'>
                      <CircularProgress size={24} />
                      <span className='ml-2'>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center whitespace-nowrap py-4'>
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

export default GeneralLedgerReport
