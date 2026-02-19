'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import TablePagination from '@mui/material/TablePagination'
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
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

// Component Imports
import OptionMenu from '@core/components/option-menu'

// Service Imports
import { budgetAPI } from '@/services/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type RealizationType = {
  id: string
  budgetCode: string
  name: string
  category: string
  budgetAmount: number
  realizedAmount: number
  percentage: number
  status: 'Aman' | 'Warning' | 'Overbudget'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<RealizationType>()

const BudgetRealizationTable = () => {
  const [data, setData] = useState<RealizationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const budgets = await budgetAPI.getAll()

      const formattedData: RealizationType[] = budgets.map(b => {
        const percentage = b.amount > 0 ? (b.realization / b.amount) * 100 : 0
        let status: 'Aman' | 'Warning' | 'Overbudget' = 'Aman'

        if (percentage > 100) status = 'Overbudget'
        else if (percentage > 85) status = 'Warning'

        return {
          id: b.id,
          budgetCode: b.budgetCode,
          name: b.name,
          category: b.category,
          budgetAmount: b.amount,
          realizedAmount: b.realization,
          percentage: parseFloat(percentage.toFixed(1)),
          status
        }
      })

      setData(formattedData)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = useMemo<ColumnDef<RealizationType, any>[]>(
    () => [
      columnHelper.accessor('budgetCode', {
        header: 'Kode',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.budgetCode}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'Nama Anggaran',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.category}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('budgetAmount', {
        header: 'Anggaran',
        cell: ({ row }) => (
          <Typography>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.budgetAmount)}
          </Typography>
        )
      }),
      columnHelper.accessor('realizedAmount', {
        header: 'Realisasi',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.realizedAmount)}
          </Typography>
        )
      }),
      columnHelper.accessor('percentage', {
        header: 'Serapan',
        cell: ({ row }) => (
          <div className='w-full'>
            <div className='flex justify-between mb-1'>
              <Typography variant='caption'>{row.original.percentage}%</Typography>
            </div>
            <LinearProgress
              variant='determinate'
              value={Math.min(row.original.percentage, 100)}
              color={row.original.percentage > 100 ? 'error' : row.original.percentage > 80 ? 'warning' : 'success'}
            />
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const color = {
            Aman: 'success',
            Warning: 'warning',
            Overbudget: 'error'
          }[row.original.status] as any

          return <Chip label={row.original.status} size='small' color={color} variant='tonal' />
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: () => (
          <OptionMenu
            iconClassName='text-textSecondary'
            options={[
              { text: 'Detail Transaksi', icon: 'ri-file-list-3-line' },
              { text: 'Cetak Laporan', icon: 'ri-printer-line' }
            ]}
          />
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardContent className='flex justify-between flex-col sm:flex-row gap-4'>
        <Typography variant='h5'>Realisasi Anggaran</Typography>
        <div className='flex gap-2'>
          <TextField
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Cari...'
            size='small'
          />
          <Button variant='outlined' startIcon={<i className='ri-download-line' />}>
            Export
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
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                  Tidak ada data anggaran
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
    </Card>
  )
}

export default BudgetRealizationTable
