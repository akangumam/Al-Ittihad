'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import { toast } from 'react-toastify'
import { rankItem } from '@tanstack/match-sorter-utils'
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

// Component Imports
import OptionMenu from '@core/components/option-menu'
import { budgetAPI } from '@/services/api'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type BudgetType = {
  id: string
  budgetCode: string
  name: string
  category: 'Operasional' | 'Sarpras' | 'Gaji' | 'Kegiatan'
  amount: number
  source: 'BOS' | 'SPP' | 'Yayasan' | 'Lainnya'
  fiscalYear: string
  status: 'Draft' | 'Diajukan' | 'Disetujui' | 'Ditolak'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<BudgetType>()

const AnnualBudgetTable = () => {
  const [data, setData] = useState<BudgetType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Operasional' as BudgetType['category'],
    amount: 0,
    source: 'BOS' as BudgetType['source'],
    fiscalYear: '2024/2025',
    status: 'Draft' as BudgetType['status']
  })

  // Fetch data from API
  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true)
      const budgets = await budgetAPI.getAll()

      // Transform to match table format
      const transformedData: BudgetType[] = budgets.map(b => ({
        id: b.id,
        budgetCode: b.budgetCode,
        name: b.name,
        category: b.category as BudgetType['category'],
        amount: b.amount,
        source: b.source as BudgetType['source'],
        fiscalYear: b.fiscalYear,
        status: b.status as BudgetType['status']
      }))

      setData(transformedData)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleDelete = useCallback((id: string) => {
    setSelectedBudgetId(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!selectedBudgetId) return

    try {
      setIsDeleting(true)
      await budgetAPI.delete(selectedBudgetId)
      toast.success('Anggaran berhasil dihapus')
      await fetchBudgets()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Gagal menghapus anggaran.')
    } finally {
      setIsDeleting(false)
      setSelectedBudgetId(null)
    }
  }

  const handleEdit = useCallback((budget: BudgetType) => {
    setEditMode(true)
    setEditId(budget.id)
    setFormData({
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      source: budget.source,
      fiscalYear: budget.fiscalYear,
      status: budget.status
    })
    setOpenDialog(true)
  }, [])

  const columns = useMemo<ColumnDef<BudgetType, any>[]>(
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
              TA: {row.original.fiscalYear}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: ({ row }) => <Chip label={row.original.category} size='small' variant='tonal' color='primary' />
      }),
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('source', {
        header: 'Sumber Dana',
        cell: ({ row }) => <Chip label={row.original.source} size='small' variant='outlined' />
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const color = {
            Draft: 'default',
            Diajukan: 'info',
            Disetujui: 'success',
            Ditolak: 'error'
          }[row.original.status] as any

          return <Chip label={row.original.status} size='small' color={color} variant='tonal' />
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <OptionMenu
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Edit',
                icon: 'ri-pencil-line',
                menuItemProps: {
                  onClick: () => handleEdit(row.original)
                }
              },
              {
                text: 'Hapus',
                icon: 'ri-delete-bin-line',
                menuItemProps: {
                  className: 'text-error',
                  onClick: () => handleDelete(row.original.id)
                }
              }
            ]}
          />
        )
      })
    ],
    [handleEdit, handleDelete]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleSave = async () => {
    try {
      if (editMode && editId) {
        // Update existing budget
        await budgetAPI.update(editId, {
          name: formData.name,
          category: formData.category,
          amount: formData.amount,
          source: formData.source,
          fiscalYear: formData.fiscalYear,
          status: formData.status
        })
      } else {
        // Create new budget
        await budgetAPI.create({
          budgetCode: `BDG-${Date.now()}`,
          name: formData.name,
          category: formData.category,
          amount: formData.amount,
          source: formData.source,
          fiscalYear: formData.fiscalYear,
          status: formData.status,
          realization: 0
        })
      }

      // Refresh data
      await fetchBudgets()
      toast.success(editMode ? 'Anggaran berhasil diperbarui' : 'Anggaran berhasil dibuat')
      setOpenDialog(false)
      setEditMode(false)
      setEditId(null)
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('Gagal menyimpan anggaran. Silakan coba lagi.')
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4'>
          <div className='flex gap-2'>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={() => {
                setEditMode(false)
                setFormData({
                  name: '',
                  category: 'Operasional',
                  amount: 0,
                  source: 'BOS',
                  fiscalYear: '2024/2025',
                  status: 'Draft'
                })
                setOpenDialog(true)
              }}
            >
              Buat Anggaran
            </Button>
            <Button variant='outlined' color='secondary' startIcon={<i className='ri-download-line' />}>
              Export
            </Button>
          </div>
          <TextField
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Cari Anggaran...'
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
              {isLoading ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-10'>
                    <Typography>Memuat data...</Typography>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-10'>
                    <Typography>Tidak ada data anggaran</Typography>
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
        <DialogTitle>{editMode ? 'Edit Anggaran' : 'Buat Anggaran Baru'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mt-2'>
            <TextField
              label='Nama Anggaran'
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <div className='flex gap-4'>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  label='Kategori'
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <MenuItem value='Operasional'>Operasional</MenuItem>
                  <MenuItem value='Sarpras'>Sarpras</MenuItem>
                  <MenuItem value='Gaji'>Gaji</MenuItem>
                  <MenuItem value='Kegiatan'>Kegiatan</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sumber Dana</InputLabel>
                <Select
                  label='Sumber Dana'
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                >
                  <MenuItem value='BOS'>BOS</MenuItem>
                  <MenuItem value='SPP'>SPP</MenuItem>
                  <MenuItem value='Yayasan'>Yayasan</MenuItem>
                  <MenuItem value='Lainnya'>Lainnya</MenuItem>
                </Select>
              </FormControl>
            </div>
            <TextField
              label='Nominal (Rp)'
              type='number'
              fullWidth
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select
                label='Tahun Ajaran'
                value={formData.fiscalYear}
                onChange={e => setFormData({ ...formData, fiscalYear: e.target.value })}
              >
                <MenuItem value='2024/2025'>2024/2025</MenuItem>
                <MenuItem value='2025/2026'>2025/2026</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='secondary'>
            Batal
          </Button>
          <Button onClick={handleSave} variant='contained'>
            {editMode ? 'Simpan' : 'Buat'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Anggaran'
        content='Apakah Anda yakin ingin menghapus anggaran ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </>
  )
}

export default AnnualBudgetTable
