'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { toast } from 'react-toastify'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'
import { incomeAPI, activityLogAPI } from '@/services/api'
import { useAppContext } from '@/contexts/AppContext'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type IncomeType = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  account: string
  bankAccount?: {
    accountName: string
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper<IncomeType>()

const IncomeListTable = () => {
  const { refreshData } = useAppContext()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<IncomeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<IncomeType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { lang: locale } = useParams()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await incomeAPI.getAll()

      setData(result)
    } catch (error) {
      console.error('Error fetching incomes:', error)
      toast.error('Gagal memuat data pemasukan')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteClick = (income: IncomeType) => {
    setSelectedIncome(income)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedIncome) return

    try {
      setIsDeleting(true)
      await incomeAPI.delete(selectedIncome.id)

      // Log activity untuk keamanan
      await activityLogAPI.create({
        action: 'DELETE' as any,
        activityType: 'INCOME' as any,
        module: 'FINANCE',
        description: `Menghapus pemasukan: ${selectedIncome.category} - ${selectedIncome.description} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedIncome.amount)})`,
        metadata: {
          incomeId: selectedIncome.id,
          category: selectedIncome.category,
          amount: selectedIncome.amount,
          date: selectedIncome.date,
          account: selectedIncome.bankAccount?.accountName
        }
      })

      toast.success('Data pemasukan berhasil dihapus')
      setDeleteDialogOpen(false)
      fetchData()
      refreshData()
    } catch (error: any) {
      console.error('Error deleting income:', error)
      toast.error(error.message || 'Gagal menghapus data')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    // TODO: Implement print functionality
    toast.info('Fitur cetak bukti akan segera hadir')
  }

  const handleDuplicate = (income: IncomeType) => {
    // Navigate to add page with pre-filled data
    const params = new URLSearchParams({
      category: income.category,
      description: income.description,
      amount: income.amount.toString(),
      account: income.account,
      duplicate: 'true'
    })

    window.location.href = getLocalizedUrl(`/keuangan/pemasukan/tambah?${params.toString()}`, locale as Locale)
  }

  const columns = useMemo<ColumnDef<IncomeType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('date', {
        header: 'Tanggal',
        cell: ({ row }) => {
          const date = new Date(row.original.date)

          return (
            <Typography>
              {date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: ({ row }) => (
          <Chip
            label={row.original.category}
            size='small'
            color={row.original.category === 'SPP' ? 'primary' : row.original.category === 'BOS' ? 'info' : 'default'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('description', {
        header: 'Keterangan',
        cell: ({ row }) => (
          <Typography className='truncate max-w-[200px]' title={row.original.description}>
            {row.original.description}
          </Typography>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Jumlah',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('bankAccount.accountName', {
        header: 'Akun',
        cell: ({ row }) => <Typography>{row.original.bankAccount?.accountName || '-'}</Typography>
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
                  text: 'Edit Data',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {
                      window.location.href = getLocalizedUrl(
                        `/keuangan/pemasukan/${row.original.id}/edit`,
                        locale as Locale
                      )
                    }
                  }
                },
                {
                  text: 'Cetak Bukti',
                  icon: 'ri-printer-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: handlePrint
                  }
                },
                {
                  text: 'Duplikasi',
                  icon: 'ri-file-copy-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => handleDuplicate(row.original)
                  }
                },
                { divider: true },
                {
                  text: 'Hapus',
                  icon: 'ri-delete-bin-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => handleDeleteClick(row.original)
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

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            component={Link}
            href={getLocalizedUrl('/keuangan/pemasukan/tambah', locale as Locale)}
            className='max-sm:is-full'
          >
            Tambah Pemasukan
          </Button>
          <div className='flex items-center flex-col sm:flex-row max-sm:is-full gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Cari Pemasukan...'
              className='max-sm:is-full min-is-[250px]'
              id='search-income'
            />
            <FormControl fullWidth size='small' className='max-sm:is-full min-is-[175px]'>
              <InputLabel id='category-select'>Kategori</InputLabel>
              <Select
                fullWidth
                id='select-category'
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                label='Kategori'
                labelId='category-select'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='SPP'>SPP</MenuItem>
                <MenuItem value='BOS'>BOS</MenuItem>
                <MenuItem value='Infak'>Infak</MenuItem>
                <MenuItem value='Donasi'>Donasi</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>

        {isLoading ? (
          <div className='flex justify-center p-10'>
            <CircularProgress />
          </div>
        ) : (
          <>
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
                        Tidak ada data pemasukan
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
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
          </>
        )}
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Pemasukan'
        content={`Apakah Anda yakin ingin menghapus data pemasukan "${selectedIncome?.description}" sebesar ${selectedIncome ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedIncome.amount) : ''}? Saldo akun akan dikembalikan dan aktivitas ini akan tercatat dalam log sistem.`}
        isSubmitting={isDeleting}
      />
    </>
  )
}

export default IncomeListTable
