'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { mutationAPI, accountAPI } from '@/services/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type MutationType = {
  id: string
  date: string
  sourceAccount: string
  destinationAccount: string
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  reference?: string
}

type BankAccount = {
  id: string
  accountName: string
  accountType: string
}

const columnHelper = createColumnHelper<MutationType>()

const CashMutationTable = () => {
  // States
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<MutationType[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [transactionDate, setTransactionDate] = useState<Date | null | undefined>(new Date())

  // Form States
  const [sourceAcc, setSourceAcc] = useState('')
  const [destAcc, setDestAcc] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mutations, bankAccounts] = await Promise.all([mutationAPI.getAll(), accountAPI.getAll()])

        // Transform data to match table format
        const transformedData: MutationType[] = mutations.map(m => ({
          id: m.id,
          date: m.date,
          sourceAccount: m.fromBankAccount?.accountName || 'Unknown',
          destinationAccount: m.toBankAccount?.accountName || 'Unknown',
          amount: m.amount,
          description: m.description || '',
          status: 'completed' as const
        }))

        setAccounts(bankAccounts)
        setData(transformedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const columns = useMemo<ColumnDef<MutationType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID Mutasi',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography variant='body2'>{row.original.date}</Typography>
      }),
      columnHelper.accessor('sourceAccount', {
        header: 'Dari Akun',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='ri-arrow-right-circle-line text-error' />
            <Typography variant='body2'>{row.original.sourceAccount}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('destinationAccount', {
        header: 'Ke Akun',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='ri-arrow-left-circle-line text-success' />
            <Typography variant='body2'>{row.original.destinationAccount}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
              row.original.amount
            )}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 'completed' ? 'Berhasil' : 'Pending'}
            size='small'
            color={row.original.status === 'completed' ? 'success' : 'warning'}
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        cell: () => (
          <OptionMenu
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Lihat Detail',
                icon: 'ri-eye-line'
              },
              {
                text: 'Cetak Bukti',
                icon: 'ri-printer-line'
              }
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
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  } as any)

  const handleAddSubmit = async () => {
    try {
      // Create mutation via API
      await mutationAPI.create({
        date: transactionDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        fromAccount: sourceAcc,
        toAccount: destAcc,
        amount: Number(amount),
        description: description
      })

      // Refresh data
      const mutations = await mutationAPI.getAll()

      const transformedData: MutationType[] = mutations.map(m => ({
        id: m.id,
        date: m.date,
        sourceAccount: m.fromBankAccount?.accountName || 'Unknown',
        destinationAccount: m.toBankAccount?.accountName || 'Unknown',
        amount: m.amount,
        description: m.description || '',
        status: 'completed' as const
      }))

      setData(transformedData)

      setIsAddOpen(false)

      // Reset form
      setSourceAcc('')
      setDestAcc('')
      setAmount('')
      setDescription('')
      setTransactionDate(new Date())
    } catch (error) {
      console.error('Error creating mutation:', error)
      alert('Gagal membuat transfer. Silakan coba lagi.')
    }
  }

  // Early return for SSR
  if (!mounted) {
    return null
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <Typography variant='h4'>Mutasi Kas & Bank</Typography>
          <div className='flex gap-2'>
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setIsAddOpen(true)}>
              Buat Transfer Baru
            </Button>
          </div>
        </CardContent>

        <div className='flex justify-between p-5 gap-4 flex-col sm:flex-row items-center'>
          <TextField
            size='small'
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Cari mutasi...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            className='is-full sm:is-auto'
          />
        </div>

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
                    Tidak ada data mutasi
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
        />
      </Card>

      {/* Add Mutation Dialog */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Transfer Antar Akun</DialogTitle>
        <DialogContent>
          <Grid container spacing={5} className='mbs-1'>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Tanggal Transaksi</Typography>
                <AppReactDatepicker
                  selected={transactionDate}
                  id='mutation-date'
                  onChange={(date: Date | null) => setTransactionDate(date)}
                  placeholderText='Pilih tanggal'
                  customInput={<TextField fullWidth size='small' id='mutation-date-input' />}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='source-acc-label' size='small'>
                  Dari Akun
                </InputLabel>
                <Select
                  labelId='source-acc-label'
                  id='source-acc'
                  value={sourceAcc}
                  label='Dari Akun'
                  size='small'
                  onChange={e => setSourceAcc(e.target.value)}
                >
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id} disabled={acc.id === destAcc}>
                      {acc.accountName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='dest-acc-label' size='small'>
                  Ke Akun
                </InputLabel>
                <Select
                  labelId='dest-acc-label'
                  id='dest-acc'
                  value={destAcc}
                  label='Ke Akun'
                  size='small'
                  onChange={e => setDestAcc(e.target.value)}
                >
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id} disabled={acc.id === sourceAcc}>
                      {acc.accountName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Nominal Transfer'
                size='small'
                id='amount-input'
                value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                onChange={e => {
                  const rawValue = e.target.value.replace(/\D/g, '')

                  setAmount(rawValue)
                }}
                placeholder='0'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Keterangan'
                multiline
                rows={3}
                size='small'
                id='desc-input'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Contoh: Penarikan tunai untuk operasional'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddOpen(false)} color='secondary'>
            Batal
          </Button>
          <Button onClick={handleAddSubmit} variant='contained' disabled={!sourceAcc || !destAcc || !amount}>
            Proses Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CashMutationTable
