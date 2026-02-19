'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

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
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
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
import ImportSPPPaymentModal from './ImportSPPPaymentModal'
import PaymentSuccessDialog from './PaymentSuccessDialog'
import EditPaymentDialog from '@/components/dialogs/EditPaymentDialog'
import CancelPaymentDialog from '@/components/dialogs/CancelPaymentDialog'
import { sppPaymentAPI, studentAPI, accountAPI } from '@/services/api'

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

type PaymentType = {
  id: string
  transactionDate: string
  studentNIS: string
  studentName: string
  grade: string
  class: string
  paymentMonth: string
  amount: number
  paymentMethod: 'Tunai' | 'Transfer' | 'EDC'
  accountDestination: string
  status: 'Lunas' | 'Pending' | 'Verifikasi'
  receivedBy: string
  notes?: string
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

const columnHelper = createColumnHelper<PaymentType>()

const SPPPaymentTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [selectedReceiptData, setSelectedReceiptData] = useState<any>(null)

  // Edit & Cancel dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  // Data states
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const studentIdFilter = searchParams.get('siswa')

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [paymentsData, studentsData, accountsData] = await Promise.all([
        sppPaymentAPI.getAll(),
        studentAPI.getAll(),
        accountAPI.getAll()
      ])

      setPayments(paymentsData)
      setStudents(studentsData)
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data pembayaran')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle Edit Payment
  const handleEdit = (payment: any) => {
    setSelectedPayment(payment)
    setEditDialogOpen(true)
  }

  const handleEditConfirm = async (data: { amount: number; paymentDate: Date; notes: string }) => {
    if (!selectedPayment) return

    try {
      await fetch(`/api/spp-payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      // Refresh data
      await fetchData()
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengubah pembayaran')
    }
  }

  // Handle Cancel Payment
  const handleCancel = (payment: any) => {
    setSelectedPayment(payment)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedPayment) return

    try {
      const response = await fetch(`/api/spp-payments/${selectedPayment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const error = await response.json()

        throw new Error(error.error || 'Gagal membatalkan pembayaran')
      }

      // Refresh data
      await fetchData()
    } catch (error: any) {
      throw new Error(error.message || 'Gagal membatalkan pembayaran')
    }
  }

  // Transform data to PaymentType format
  const transformedData = useMemo(() => {
    return payments.map(payment => {
      const student = students.find(s => s.id === payment.studentId)
      const account = accounts.find(a => a.id === payment.account)

      return {
        id: payment.id,
        transactionDate: payment.paymentDate,
        studentNIS: student?.nis || '',
        studentName: payment.studentName,
        grade: student?.grade || '',
        class: student?.class || '',
        paymentMonth: `${payment.month} ${payment.year}`,
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod as 'Tunai' | 'Transfer' | 'EDC',
        accountDestination: account?.accountName || payment.account,
        status: (payment.status || 'Lunas') as any,
        receivedBy: 'Admin Keuangan',
        notes: payment.notes || '',
        paymentDate: payment.paymentDate
      }
    })
  }, [payments, students, accounts])

  // Filter data by student ID if query parameter exists
  const filteredData = useMemo(() => {
    if (!studentIdFilter) return transformedData

    return transformedData.filter(payment => {
      const student = students.find(s => s.id === studentIdFilter)

      return payment.studentNIS === student?.nis
    })
  }, [transformedData, studentIdFilter, students])

  // Get student info for display
  const filteredStudent = useMemo(() => {
    if (!studentIdFilter) return null

    return students.find(s => s.id === studentIdFilter)
  }, [studentIdFilter, students])

  const handleClearFilter = () => {
    router.push(getLocalizedUrl('/spp/pembayaran', locale as Locale))
  }

  const handlePrintReceipt = (payment: PaymentType) => {
    const formattedDate = new Date(payment.transactionDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const receiptData = {
      transactionId: payment.id,
      date: formattedDate,
      studentName: payment.studentName,
      studentNIS: payment.studentNIS,
      studentClass: `${payment.grade}${payment.class}`,
      months: [payment.paymentMonth],
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      adminName: 'Admin Keuangan'
    }

    setSelectedReceiptData(receiptData)
    setReceiptDialogOpen(true)
  }

  const handleVerifyPayment = async (paymentId: string) => {
    if (confirm('Konfirmasi bahwa uang sudah masuk ke rekening bank?')) {
      try {
        const response = await fetch(`/api/spp-payments/${paymentId}/verify`, {
          method: 'POST'
        })

        if (response.ok) {
          toast.success('Pembayaran telah dikonfirmasi dan saldo diperbarui')
          fetchData() // Refresh data
        } else {
          const error = await response.json()

          throw new Error(error.error || 'Gagal memverifikasi pembayaran')
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error)
        toast.error(error.message)
      }
    }
  }

  const columns = useMemo<ColumnDef<PaymentType, any>[]>(
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
      columnHelper.accessor('id', {
        header: 'ID Transaksi',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/spp/pembayaran/${row.original.id}`, locale as Locale)}
            color='primary.main'
            className='font-medium'
          >
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('transactionDate', {
        header: 'Tanggal',
        cell: ({ row }) => <Typography>{row.original.transactionDate}</Typography>
      }),
      columnHelper.accessor('studentName', {
        header: 'Siswa',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar sx={{ width: 34, height: 34, fontSize: '0.875rem', backgroundColor: 'primary.main' }}>
              {row.original.studentName
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Avatar>
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.studentName}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.studentNIS} - {row.original.grade}
                {row.original.class}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('paymentMonth', {
        header: 'Periode',
        cell: ({ row }) => <Chip label={row.original.paymentMonth} size='small' color='default' variant='tonal' />
      }),
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography className='font-medium text-success'>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Metode',
        cell: ({ row }) => (
          <Chip
            label={row.original.paymentMethod}
            size='small'
            color={
              row.original.paymentMethod === 'Tunai'
                ? 'warning'
                : row.original.paymentMethod === 'Transfer'
                  ? 'info'
                  : 'secondary'
            }
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('accountDestination', {
        header: 'Akun',
        cell: ({ row }) => <Typography variant='body2'>{row.original.accountDestination}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={
              row.original.status === 'Lunas' ? 'success' : row.original.status === 'Verifikasi' ? 'warning' : 'error'
            }
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
                ...(row.original.status === 'Verifikasi'
                  ? [
                      {
                        text: 'Konfirmasi (Verifikasi)',
                        icon: 'ri-checkbox-circle-line',
                        menuItemProps: {
                          className: 'flex items-center gap-2 text-success font-medium',
                          onClick: () => handleVerifyPayment(row.original.id)
                        }
                      },
                      { divider: true }
                    ]
                  : []),
                {
                  text: 'Lihat Detail',
                  icon: 'ri-eye-line',
                  href: getLocalizedUrl(`/spp/pembayaran/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Cetak Kwitansi',
                  icon: 'ri-printer-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => handlePrintReceipt(row.original)
                  }
                },
                {
                  text: 'Edit',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => handleEdit(row.original)
                  }
                },
                { divider: true },
                {
                  text: 'Batalkan',
                  icon: 'ri-close-circle-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => handleCancel(row.original)
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
    data: filteredData,
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
      {studentIdFilter && (
        <Button
          startIcon={<i className='ri-arrow-left-line' />}
          component={Link}
          href={getLocalizedUrl(`/akademik/data-siswa/${filteredStudent?.id || ''}`, locale as Locale)}
          className='mb-4'
        >
          Kembali ke Detail Siswa
        </Button>
      )}
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          {studentIdFilter && (
            <Alert
              severity='info'
              className='w-full'
              action={
                <IconButton aria-label='close' color='inherit' size='small' onClick={handleClearFilter}>
                  <i className='ri-close-line' />
                </IconButton>
              }
            >
              Menampilkan history pembayaran untuk:{' '}
              <strong>
                {filteredStudent ? `${filteredStudent.name} (NIS: ${filteredStudent.nis})` : `NIS: ${studentIdFilter}`}
              </strong>
            </Alert>
          )}
          <div className='flex gap-2'>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              className='max-sm:is-full'
              component={Link}
              href={getLocalizedUrl('/spp/pembayaran/tambah', locale as Locale)}
            >
              Catat Pembayaran
            </Button>
            {/* Import Riwayat Pembayaran - Hidden (available if needed in future)
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-upload-line' />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Riwayat Pembayaran
            </Button>
            */}
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-download-line' />}>
              Export Excel
            </Button>
          </div>
          <div className='flex items-center flex-col sm:flex-row max-sm:is-full gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Cari Siswa/ID...'
              className='max-sm:is-full min-is-[200px]'
              id='search-payment'
            />
            <FormControl fullWidth size='small' className='max-sm:is-full min-is-[140px]'>
              <InputLabel id='month-select'>Periode</InputLabel>
              <Select
                fullWidth
                id='select-month'
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                label='Periode'
                labelId='month-select'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='November 2024'>November 2024</MenuItem>
                <MenuItem value='Oktober 2024'>Oktober 2024</MenuItem>
                <MenuItem value='September 2024'>September 2024</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size='small' className='max-sm:is-full min-is-[120px]'>
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                fullWidth
                id='select-status'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label='Status'
                labelId='status-select'
              >
                <MenuItem value=''>Semua</MenuItem>
                <MenuItem value='Lunas'>Lunas</MenuItem>
                <MenuItem value='Verifikasi'>Verifikasi</MenuItem>
                <MenuItem value='Pending'>Pending</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
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
                    <div className='flex justify-center items-center py-8'>
                      <i className='ri-loader-4-line animate-spin text-2xl' />
                      <span className='ml-2'>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Tidak ada data pembayaran
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
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
            id: 'spp-payment-pagination-select'
          }}
        />
      </Card>

      <ImportSPPPaymentModal open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

      <PaymentSuccessDialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        data={selectedReceiptData}
      />

      <EditPaymentDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedPayment(null)
        }}
        onConfirm={handleEditConfirm}
        payment={selectedPayment}
      />

      <CancelPaymentDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false)
          setSelectedPayment(null)
        }}
        onConfirm={handleCancelConfirm}
        paymentInfo={
          selectedPayment
            ? {
                id: selectedPayment.id,
                studentName: selectedPayment.studentName,
                paymentMonth: `${selectedPayment.paymentMonth}`,
                amount: selectedPayment.amount
              }
            : undefined
        }
      />
    </>
  )
}

export default SPPPaymentTable
