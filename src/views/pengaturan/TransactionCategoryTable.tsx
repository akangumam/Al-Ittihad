'use client'

// React Imports
import { useState, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import { useAppContext } from '@/contexts/AppContext'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type CategoryType = {
  id: string
  name: string
  type: 'Pemasukan' | 'Pengeluaran'
  description: string
  isActive: boolean
}

const columnHelper = createColumnHelper<CategoryType>()

const TransactionCategoryTable = () => {
  // ✅ Get categories from context
  const { categories, setCategories } = useAppContext()

  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Pemasukan' as CategoryType['type'],
    description: '',
    isActive: true
  })

  // ==================== HANDLERS ====================

  const handleEdit = useCallback((category: CategoryType) => {
    setFormData(category)
    setEditMode(true)
    setOpenDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const { categoryAPI } = await import('@/services/api')

      if (editMode) {
        const updated = await categoryAPI.update(formData.id, formData)

        setCategories(categories.map((item: CategoryType) => (item.id === formData.id ? updated : item)))
      } else {
        const newCategory = await categoryAPI.create(formData)

        setCategories([...categories, newCategory])
      }

      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving category:', error)

      alert('Gagal menyimpan kategori')
    }
  }, [editMode, formData, categories, setCategories])

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        const { categoryAPI } = await import('@/services/api')
        const category = categories.find((c: CategoryType) => c.id === id)

        if (!category) return

        const updated = await categoryAPI.update(id, { ...category, isActive: !category.isActive })

        setCategories(categories.map((item: CategoryType) => (item.id === id ? updated : item)))
      } catch (error) {
        console.error('Error toggling category status:', error)
      }
    },
    [categories, setCategories]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Yakin ingin menghapus kategori ini?')) return

      try {
        const { categoryAPI } = await import('@/services/api')

        await categoryAPI.delete(id)
        setCategories(categories.filter((item: CategoryType) => item.id !== id))
      } catch (error) {
        console.error('Error deleting category:', error)

        alert('Gagal menghapus kategori. Pastikan kategori tidak terkait dengan transaksi apa pun.')
      }
    },
    [categories, setCategories]
  )

  const columns = useMemo<ColumnDef<CategoryType, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nama Kategori',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('type', {
        header: 'Tipe',
        cell: ({ row }) => (
          <Chip
            label={row.original.type}
            size='small'
            color={row.original.type === 'Pemasukan' ? 'success' : 'error'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: ({ row }) => <Typography variant='body2'>{row.original.description}</Typography>
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Aktif' : 'Nonaktif'}
            size='small'
            color={row.original.isActive ? 'success' : 'secondary'}
            variant='tonal'
          />
        )
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
                icon: 'ri-edit-line',
                menuItemProps: {
                  className: 'flex items-center gap-2',
                  onClick: () => handleEdit(row.original)
                }
              },
              {
                text: row.original.isActive ? 'Nonaktifkan' : 'Aktifkan',
                icon: row.original.isActive ? 'ri-close-circle-line' : 'ri-check-circle-line',
                menuItemProps: {
                  className: 'flex items-center gap-2',
                  onClick: () => handleToggleStatus(row.original.id)
                }
              },
              { divider: true },
              {
                text: 'Hapus',
                icon: 'ri-delete-bin-7-line',
                menuItemProps: {
                  className: 'flex items-center gap-2 text-error',
                  onClick: () => handleDelete(row.original.id)
                }
              }
            ]}
          />
        )
      })
    ],
    [handleDelete, handleEdit, handleToggleStatus]
  )

  const table = useReactTable({
    data: categories, // ✅ Use context data
    columns,
    filterFns: undefined as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleAdd = () => {
    setFormData({
      id: '',
      name: '',
      type: 'Pemasukan',
      description: '',
      isActive: true
    })
    setEditMode(false)
    setOpenDialog(true)
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Kategori Transaksi
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola kategori pemasukan dan pengeluaran
            </Typography>
          </div>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAdd}>
            Tambah Kategori
          </Button>
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
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='mt-2'>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Nama Kategori'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label='Tipe'
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as CategoryType['type'] })}
              >
                <MenuItem value='Pemasukan'>Pemasukan</MenuItem>
                <MenuItem value='Pengeluaran'>Pengeluaran</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Deskripsi'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='secondary' onClick={() => setOpenDialog(false)}>
            Batal
          </Button>
          <Button variant='contained' onClick={handleSave}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TransactionCategoryTable
