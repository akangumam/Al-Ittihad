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
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

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
import { budgetAPI } from '@/services/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type ApprovalType = {
  id: string
  budgetCode: string
  name: string
  category: string
  amount: number
  submittedBy: string
  submittedDate: string
  status: 'Diajukan'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<ApprovalType>()

const BudgetApprovalTable = () => {
  const [data, setData] = useState<ApprovalType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApprovalType | null>(null)
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | null>(null)
  const [notes, setNotes] = useState('')

  // Fetch pending approvals
  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      const budgets = await budgetAPI.getAll()

      // Filter only submitted budgets
      const pending = budgets
        .filter(b => b.status === 'Diajukan')
        .map(b => ({
          id: b.id,
          budgetCode: b.budgetCode,
          name: b.name,
          category: b.category,
          amount: b.amount,
          submittedBy: 'Admin', // Could be enhanced with user info
          submittedDate: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '',
          status: 'Diajukan' as const
        }))

      setData(pending)
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
    }
  }

  const handleAction = (item: ApprovalType, type: 'Approve' | 'Reject') => {
    setSelectedItem(item)
    setActionType(type)
    setNotes('')
    setOpenDialog(true)
  }

  const handleConfirm = async () => {
    if (selectedItem && actionType) {
      try {
        const newStatus = actionType === 'Approve' ? 'Disetujui' : 'Ditolak'

        await budgetAPI.update(selectedItem.id, { status: newStatus })
        await fetchPendingApprovals()
        setOpenDialog(false)
        setSelectedItem(null)
        setActionType(null)
        setNotes('')
      } catch (error) {
        console.error('Error updating budget status:', error)
        alert('Gagal mengupdate status anggaran.')
      }
    }
  }

  const columns = useMemo<ColumnDef<ApprovalType, any>[]>(
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
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('submittedBy', {
        header: 'Diajukan Oleh',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2'>{row.original.submittedBy}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.submittedDate}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => <Chip label={row.original.status} size='small' color='info' variant='tonal' />
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Button
              size='small'
              variant='contained'
              color='success'
              onClick={() => handleAction(row.original, 'Approve')}
              startIcon={<i className='ri-check-line' />}
            >
              Setujui
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='error'
              onClick={() => handleAction(row.original, 'Reject')}
              startIcon={<i className='ri-close-line' />}
            >
              Tolak
            </Button>
          </div>
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
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4'>
          <Typography variant='h5'>Persetujuan Anggaran</Typography>
          <TextField
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Cari Pengajuan...'
            size='small'
          />
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center p-4'>
                    Tidak ada pengajuan anggaran yang perlu diproses.
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{actionType === 'Approve' ? 'Setujui Anggaran' : 'Tolak Anggaran'}</DialogTitle>
        <DialogContent>
          <Typography className='mb-4'>
            Anda akan {actionType === 'Approve' ? 'menyetujui' : 'menolak'} pengajuan anggaran{' '}
            <strong>{selectedItem?.name}</strong> senilai{' '}
            <strong>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedItem?.amount || 0)}
            </strong>
            .
          </Typography>
          <TextField
            label='Catatan (Opsional)'
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={actionType === 'Approve' ? 'Tambahkan catatan persetujuan...' : 'Alasan penolakan...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='secondary'>
            Batal
          </Button>
          <Button onClick={handleConfirm} variant='contained' color={actionType === 'Approve' ? 'success' : 'error'}>
            Konfirmasi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BudgetApprovalTable
