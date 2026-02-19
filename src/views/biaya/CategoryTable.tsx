'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import OptionMenu from '@core/components/option-menu'
import { paymentCategoryAPI } from '@/services/api'
import type { PaymentCategory } from '@/types/feeTypes'
import tableStyles from '@core/styles/table.module.css'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'

const columnHelper = createColumnHelper<PaymentCategory>()

const CategoryTable = () => {
  const [data, setData] = useState<PaymentCategory[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<PaymentCategory | null>(null)

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    amount: '' as string | number,
    priority: '' as string | number
  })

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const categories = await paymentCategoryAPI.getAll()

      setData(categories)
    } catch {
      toast.error('Gagal memuat kategori biaya')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleOpenDialog = useCallback(
    (category?: PaymentCategory) => {
      if (category) {
        setEditingCategory(category)
        setFormData({
          name: category.name,
          amount: category.amount,
          priority: category.priority
        })
      } else {
        setEditingCategory(null)
        setFormData({
          name: '',
          amount: '',
          priority: data.length + 1
        })
      }

      setOpenDialog(true)
    },
    [data.length]
  )

  const handleSave = async () => {
    if (!formData.name || formData.amount === '') {
      toast.error('Mohon isi nama dan nominal biaya')

      return
    }

    try {
      if (editingCategory) {
        await paymentCategoryAPI.update(editingCategory.id, {
          name: formData.name,
          amount: Number(formData.amount),
          priority: Number(formData.priority)
        })
        toast.success('Kategori berhasil diperbarui')
      } else {
        await paymentCategoryAPI.create({
          name: formData.name,
          amount: Number(formData.amount),
          priority: Number(formData.priority)
        })
        toast.success('Kategori berhasil ditambahkan')
      }

      setOpenDialog(false)
      fetchCategories()
    } catch {
      toast.error('Gagal menyimpan kategori')
    }
  }

  const handleDelete = useCallback((id: string) => {
    setSelectedCategoryId(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!selectedCategoryId) return

    try {
      setIsDeleting(true)
      await paymentCategoryAPI.delete(selectedCategoryId)
      toast.success('Kategori berhasil dihapus')
      fetchCategories()
      setDeleteDialogOpen(false)
    } catch {
      toast.error('Gagal menghapus kategori')
    } finally {
      setIsDeleting(false)
      setSelectedCategoryId(null)
    }
  }

  const columns = useMemo<ColumnDef<PaymentCategory, any>[]>(
    () => [
      columnHelper.accessor('priority', {
        header: 'Prioritas',
        cell: ({ row }) => (
          <Typography color='primary' className='font-bold'>
            #{row.original.priority}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nama Biaya',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('amount', {
        header: 'Nominal',
        cell: ({ row }) => (
          <Typography className='font-medium text-primary'>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Aktif' : 'Tidak Aktif'}
            size='small'
            color={row.original.isActive ? 'success' : 'default'}
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
                {
                  text: 'Edit',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => handleOpenDialog(row.original)
                  }
                },
                { divider: true },
                {
                  text: 'Hapus',
                  icon: 'ri-delete-bin-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => handleDelete(row.original.id)
                  }
                }
              ]}
            />
          </div>
        )
      })
    ],
    [handleDelete, handleOpenDialog]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: () => true
    }
  })

  return (
    <>
      <Grid container spacing={6} className='mbe-6'>
        <Grid size={{ xs: 12 }}>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <div>
              <Typography variant='h4'>Kategori Biaya Sekolah</Typography>
              <Typography variant='body2' color='text.secondary'>
                Kelola item biaya pendaftaran dan daftar ulang beserta skala prioritas pelunasan
              </Typography>
            </div>
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => handleOpenDialog()}>
              Tambah Kategori
            </Button>
          </div>
        </Grid>
      </Grid>

      <Card>
        <Alert severity='info' className='m-6'>
          <strong>Skala Prioritas:</strong> Pembayaran yang dilakukan siswa akan dialokasikan secara otomatis untuk
          melunasi item dengan prioritas tertinggi (angka terkecil) terlebih dahulu.
        </Alert>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
                  <td colSpan={columns.length} className='text-center py-4'>
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center py-4'>
                    Tidak ada data kategori
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Nama Biaya'
                placeholder='Contoh: Seragam Olahraga'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Nominal'
                value={formData.amount ? parseInt(formData.amount.toString()).toLocaleString('id-ID') : ''}
                onChange={e => {
                  const rawValue = e.target.value.replace(/\D/g, '')

                  setFormData({ ...formData, amount: rawValue })
                }}
                placeholder='0'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Prioritas'
                placeholder='1'
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                helperText='Angka terkecil dilunasi lebih dulu'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='secondary'>
            Batal
          </Button>
          <Button onClick={handleSave} variant='contained'>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Kategori'
        content='Apakah Anda yakin ingin menghapus kategori biaya ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </>
  )
}

export default CategoryTable
