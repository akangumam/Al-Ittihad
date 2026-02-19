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
import type { BankAccountType } from '@/contexts/AppContext'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<BankAccountType>()

const BankAccountTable = () => {
  const { accounts: data, setAccounts: setData } = useAppContext()
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    accountType: 'Kas' as BankAccountType['accountType'],
    balance: 0,
    isActive: true
  })

  // ==================== HANDLERS ====================

  const handleEdit = useCallback((account: BankAccountType) => {
    setFormData(account)
    setEditMode(true)
    setOpenDialog(true)
  }, [])

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        const { accountAPI } = await import('@/services/api')
        const account = data.find(a => a.id === id)

        if (!account) return

        const updated = await accountAPI.update(id, { ...account, isActive: !account.isActive })

        setData(data.map(item => (item.id === id ? updated : item)))
      } catch (error) {
        console.error('Error toggling account status:', error)
      }
    },
    [data, setData]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Yakin ingin menghapus akun ini?')) return

      try {
        const { accountAPI } = await import('@/services/api')

        await accountAPI.delete(id)
        setData(data.filter(item => item.id !== id))
      } catch (error) {
        console.error('Error deleting account:', error)

        alert('Gagal menghapus akun. Pastikan akun tidak terkait dengan transaksi apa pun.')
      }
    },
    [data, setData]
  )

  const handleSave = useCallback(async () => {
    try {
      const { accountAPI } = await import('@/services/api')

      if (editMode) {
        const updated = await accountAPI.update(formData.id, formData)

        setData(data.map(item => (item.id === formData.id ? updated : item)))
      } else {
        const newAccount = await accountAPI.create(formData)

        setData([...data, newAccount])
      }

      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving account:', error)

      alert('Gagal menyimpan akun')
    }
  }, [editMode, formData, data, setData])

  const columns = useMemo<ColumnDef<BankAccountType, any>[]>(
    () => [
      columnHelper.accessor('accountName', {
        header: 'Nama Akun',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.accountName}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.accountType}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('bankName', {
        header: 'Bank / Sumber',
        cell: ({ row }) => <Typography>{row.original.bankName}</Typography>
      }),
      columnHelper.accessor('accountNumber', {
        header: 'No. Rekening',
        cell: ({ row }) => <Typography variant='body2'>{row.original.accountNumber}</Typography>
      }),
      columnHelper.accessor('balance', {
        header: 'Saldo',
        cell: ({ row }) => (
          <Typography className='font-medium' color='primary.main'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.balance)}
          </Typography>
        )
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
    data,
    columns,
    filterFns: undefined as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleAdd = () => {
    setFormData({
      id: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
      accountType: 'Kas',
      balance: 0,
      isActive: true
    })
    setEditMode(false)
    setOpenDialog(true)
  }

  const totalBalance = data.reduce((acc, curr) => (curr.isActive ? acc + curr.balance : acc), 0)

  return (
    <>
      <Grid container spacing={4} className='mb-6'>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' className='mb-2'>
                Total Saldo Aktif
              </Typography>
              <Typography variant='h4' color='primary.main'>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalBalance)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dari {data.filter(a => a.isActive).length} akun aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Akun Kas & Bank
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola akun kas dan rekening bank
            </Typography>
          </div>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAdd}>
            Tambah Akun
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
        <DialogTitle>{editMode ? 'Edit Akun' : 'Tambah Akun'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='mt-2'>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label='Tipe Akun'
                value={formData.accountType}
                onChange={e =>
                  setFormData({ ...formData, accountType: e.target.value as BankAccountType['accountType'] })
                }
              >
                <MenuItem value='Kas'>Kas</MenuItem>
                <MenuItem value='Bank'>Bank</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Nama Akun'
                value={formData.accountName}
                onChange={e => setFormData({ ...formData, accountName: e.target.value })}
              />
            </Grid>
            {formData.accountType === 'Bank' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='Nama Bank'
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='No. Rekening'
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='number'
                label='Saldo Awal'
                value={formData.balance}
                onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
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

export default BankAccountTable
