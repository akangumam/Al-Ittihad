'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'

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
import { incomeAPI, expenseAPI, mutationAPI } from '@/services/api'
import { useAppContext } from '@/contexts/AppContext'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type AccountType = {
  id: string
  name: string
  type: 'cash' | 'bank'
  accountNumber?: string
  balance: number
  icon: string
  color: string
  status: 'active' | 'inactive'
}

type TransactionType = {
  id: string
  date: string
  type: 'in' | 'out' | 'transfer'
  description: string
  amount: number
  account: string
  category: string
}

const CashBankDashboard = () => {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<TransactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columnHelper = createColumnHelper<TransactionType>()

  // Get accounts from context
  const { accounts } = useAppContext()

  const { lang: locale } = useParams()

  // Fetch transactions from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const [incomes, expenses, mutations] = await Promise.all([
          incomeAPI.getAll(),
          expenseAPI.getAll(),
          mutationAPI.getAll()
        ])

        // Transform and combine
        const allTransactions: TransactionType[] = [
          ...incomes.map((inc: any) => ({
            id: inc.id,
            date: inc.date,
            type: 'in' as const,
            description: inc.description,
            amount: inc.amount,
            account: inc.bankAccount?.accountName || 'Unknown',
            category: inc.category
          })),
          ...expenses.map((exp: any) => ({
            id: exp.id,
            date: exp.date,
            type: 'out' as const,
            description: exp.description,
            amount: exp.amount,
            account: exp.bankAccount?.accountName || 'Unknown',
            category: exp.category
          })),
          ...mutations.map((mut: any) => ({
            id: mut.id,
            date: mut.date,
            type: 'transfer' as const,
            description: mut.description,
            amount: mut.amount,
            account: mut.toBankAccount?.accountName || 'Transfer',
            category: 'Internal'
          }))
        ]

        // Sort by date desc
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setData(allTransactions.slice(0, 5))
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setIsLoading(false)
        setMounted(true)
      }
    }

    fetchData()
  }, [])

  // Map context accounts to component format with real-time balance
  const cashBankAccounts = useMemo<AccountType[]>(
    () =>
      accounts
        .filter(acc => acc.isActive)
        .map(acc => ({
          id: acc.id,
          name: acc.accountName,
          type: acc.accountType === 'Kas' ? ('cash' as const) : ('bank' as const),
          accountNumber: acc.accountNumber !== '-' ? acc.accountNumber : undefined,
          balance: acc.balance, // ✅ REAL-TIME from context!
          icon: acc.accountType === 'Kas' ? 'ri-money-dollar-circle-line' : 'ri-bank-line',
          color: acc.accountType === 'Kas' ? 'success' : acc.id === 'ACC-002' ? 'primary' : 'info',
          status: 'active' as const
        })),
    [accounts]
  )

  // Calculate total balances from real data
  const totalBalance = useMemo(() => cashBankAccounts.reduce((sum, acc) => sum + acc.balance, 0), [cashBankAccounts])

  const cashBalance = useMemo(
    () => cashBankAccounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0),
    [cashBankAccounts]
  )

  const bankBalance = useMemo(
    () => cashBankAccounts.filter(acc => acc.type === 'bank').reduce((sum, acc) => sum + acc.balance, 0),
    [cashBankAccounts]
  )

  const columns = useMemo<ColumnDef<TransactionType, any>[]>(
    () => [
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography variant='body2'>{row.original.date}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' className='font-medium'>
              {row.original.description}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.account}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: ({ row }) => <Chip label={row.original.category} size='small' variant='tonal' color='default' />
      }),
      columnHelper.accessor('type', {
        header: 'Jenis',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'in' ? 'Masuk' : row.original.type === 'out' ? 'Keluar' : 'Transfer'}
            size='small'
            color={row.original.type === 'in' ? 'success' : row.original.type === 'out' ? 'error' : 'warning'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography
            variant='body2'
            className={classnames('font-medium', {
              'text-success': row.original.type === 'in',
              'text-error': row.original.type === 'out',
              'text-warning': row.original.type === 'transfer'
            })}
          >
            {row.original.type === 'in' ? '+' : row.original.type === 'out' ? '-' : ''}
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
              row.original.amount
            )}
          </Typography>
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

  // Early return for SSR
  if (!mounted) {
    return null
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <div className='flex justify-between items-center flex-wrap gap-4'>
          <div>
            <Typography variant='h4' className='font-medium mbe-1'>
              Manajemen Kas & Bank
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Monitoring saldo dan transaksi semua akun keuangan
            </Typography>
          </div>
          <div className='flex gap-2'>
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-download-line' />}>
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='ri-exchange-line' />}
              component={Link}
              href={getLocalizedUrl('/keuangan/mutasi', locale as Locale)}
            >
              Transfer Antar Akun
            </Button>
          </div>
        </div>
      </Grid>

      {/* Total Balance Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  variant='rounded'
                  sx={{ backgroundColor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}
                >
                  <i className='ri-wallet-3-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Total Saldo
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h3' className='font-medium text-primary'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(totalBalance)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Kas + Bank
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Cash Balance */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  variant='rounded'
                  sx={{ backgroundColor: 'success.light', color: 'success.main', width: 48, height: 48 }}
                >
                  <i className='ri-money-dollar-circle-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Kas Tunai
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-success'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(cashBalance)}
              </Typography>
              <LinearProgress
                variant='determinate'
                value={(cashBalance / totalBalance) * 100}
                color='success'
                className='h-1.5 mbs-2'
              />
              <Typography variant='caption' color='text.secondary'>
                {((cashBalance / totalBalance) * 100).toFixed(1)}% dari total
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Bank Balance */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  variant='rounded'
                  sx={{ backgroundColor: 'info.light', color: 'info.main', width: 48, height: 48 }}
                >
                  <i className='ri-bank-line text-2xl' />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Bank
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant='h4' className='font-medium text-info'>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(bankBalance)}
              </Typography>
              <LinearProgress
                variant='determinate'
                value={(bankBalance / totalBalance) * 100}
                color='info'
                className='h-1.5 mbs-2'
              />
              <Typography variant='caption' color='text.secondary'>
                {((bankBalance / totalBalance) * 100).toFixed(1)}% dari total
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Accounts List */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Daftar Akun Kas & Bank'
            subheader='Saldo real-time semua akun keuangan'
            action={
              <Button size='small' variant='text' endIcon={<i className='ri-settings-3-line' />}>
                Kelola Akun
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              {cashBankAccounts.map((account, index) => (
                <Grid key={index} size={{ xs: 12, md: 4 }}>
                  <Card variant='outlined'>
                    <CardContent>
                      <div className='flex items-center justify-between mbe-4'>
                        <Avatar
                          variant='rounded'
                          sx={{
                            backgroundColor: `${account.color}.light`,
                            color: `${account.color}.main`,
                            width: 42,
                            height: 42
                          }}
                        >
                          <i className={`${account.icon} text-xl`} />
                        </Avatar>
                        <OptionMenu
                          iconClassName='text-textSecondary'
                          options={[
                            {
                              text: 'Lihat Detail',
                              icon: 'ri-eye-line',
                              menuItemProps: { className: 'flex items-center gap-2' }
                            },
                            {
                              text: 'Riwayat Transaksi',
                              icon: 'ri-history-line',
                              menuItemProps: { className: 'flex items-center gap-2' }
                            },
                            {
                              text: 'Rekonsiliasi',
                              icon: 'ri-checkbox-circle-line',
                              menuItemProps: { className: 'flex items-center gap-2' }
                            }
                          ]}
                        />
                      </div>
                      <Typography variant='h6' className='font-medium mbe-1'>
                        {account.name}
                      </Typography>
                      {account.accountNumber && (
                        <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                          No. Rek: {account.accountNumber}
                        </Typography>
                      )}
                      <Typography variant='h5' className={`font-medium text-${account.color} mbe-2`}>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(account.balance)}
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={(account.balance / totalBalance) * 100}
                        color={account.color as any}
                        className='h-1.5'
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Transactions */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Transaksi Terbaru'
            subheader='5 transaksi terakhir semua akun'
            action={
              <Button
                size='small'
                variant='text'
                endIcon={<i className='ri-arrow-right-s-line' />}
                component={Link}
                href={getLocalizedUrl('/laporan/bku', locale as Locale)}
              >
                Lihat Semua
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
                {isLoading ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      <div className='flex justify-center items-center py-4'>
                        <i className='ri-loader-4-line animate-spin text-xl' />
                        <span className='ml-2'>Memuat...</span>
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
            </table>
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CashBankDashboard
