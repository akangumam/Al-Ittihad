'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type BackupType = {
  id: string
  filename: string
  date: string
  size: string
  type: 'Manual' | 'Otomatis'
  status: 'Selesai' | 'Proses' | 'Gagal'
}

const initialData: BackupType[] = [
  {
    id: 'BACKUP-001',
    filename: 'backup_2024-11-29_10-30.sql',
    date: '2024-11-29 10:30:00',
    size: '45.2 MB',
    type: 'Manual',
    status: 'Selesai'
  },
  {
    id: 'BACKUP-002',
    filename: 'backup_2024-11-28_00-00.sql',
    date: '2024-11-28 00:00:00',
    size: '44.8 MB',
    type: 'Otomatis',
    status: 'Selesai'
  },
  {
    id: 'BACKUP-003',
    filename: 'backup_2024-11-27_00-00.sql',
    date: '2024-11-27 00:00:00',
    size: '44.5 MB',
    type: 'Otomatis',
    status: 'Selesai'
  }
]

const columnHelper = createColumnHelper<BackupType>()

const BackupRestoreSettings = () => {
  const [data, setData] = useState(initialData)
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupType | null>(null)
  const [isBackingUp, setIsBackingUp] = useState(false)

  const columns = useMemo<ColumnDef<BackupType, any>[]>(
    () => [
      columnHelper.accessor('filename', {
        header: 'Nama File',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.filename}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.date}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('size', {
        header: 'Ukuran',
        cell: ({ row }) => <Typography>{row.original.size}</Typography>
      }),
      columnHelper.accessor('type', {
        header: 'Tipe',
        cell: ({ row }) => (
          <Chip
            label={row.original.type}
            size='small'
            color={row.original.type === 'Manual' ? 'primary' : 'info'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={
              row.original.status === 'Selesai' ? 'success' : row.original.status === 'Proses' ? 'warning' : 'error'
            }
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
                text: 'Download',
                icon: 'ri-download-line',
                menuItemProps: {
                  className: 'flex items-center gap-2',
                  onClick: () => handleDownload(row.original)
                }
              },
              {
                text: 'Restore',
                icon: 'ri-refresh-line',
                menuItemProps: {
                  className: 'flex items-center gap-2',
                  onClick: () => {
                    setSelectedBackup(row.original)
                    setOpenRestoreDialog(true)
                  }
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
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: undefined as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleBackupNow = () => {
    setIsBackingUp(true)

    // Simulasi proses backup
    setTimeout(() => {
      const newBackup: BackupType = {
        id: `BACKUP-${Date.now()}`,
        filename: `backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.sql`,
        date: new Date().toLocaleString('id-ID'),
        size: '45.5 MB',
        type: 'Manual',
        status: 'Selesai'
      }

      setData(prev => [newBackup, ...prev])
      setIsBackingUp(false)
    }, 2000)
  }

  const handleDownload = (backup: BackupType) => {
    console.log('Downloading:', backup.filename)

    // Implementasi download
  }

  const handleRestore = () => {
    console.log('Restoring from:', selectedBackup?.filename)

    // Implementasi restore
    setOpenRestoreDialog(false)
  }

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id))
  }

  return (
    <>
      <Alert severity='warning' className='mb-6'>
        <Typography variant='body2' className='font-medium'>
          ⚠️ Peringatan Penting
        </Typography>
        <Typography variant='body2'>
          Proses restore akan menimpa seluruh data yang ada dengan data dari backup. Pastikan Anda sudah membuat backup
          terbaru sebelum melakukan restore. Disarankan untuk melakukan backup secara berkala dan menyimpan file backup
          di lokasi yang aman.
        </Typography>
      </Alert>

      <Grid container spacing={4} className='mb-6'>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary-light'>
                  <i className='ri-database-2-line text-primary text-2xl' />
                </div>
                <div className='flex-1'>
                  <Typography variant='h6' className='mb-1'>
                    Backup Manual
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Buat backup database sekarang
                  </Typography>
                </div>
                <Button
                  variant='contained'
                  onClick={handleBackupNow}
                  disabled={isBackingUp}
                  startIcon={<i className='ri-save-line' />}
                >
                  {isBackingUp ? 'Memproses...' : 'Backup Sekarang'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-info-light'>
                  <i className='ri-time-line text-info text-2xl' />
                </div>
                <div className='flex-1'>
                  <Typography variant='h6' className='mb-1'>
                    Backup Otomatis
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Jadwal: Setiap hari pukul 00:00 WIB
                  </Typography>
                </div>
                <Chip label='Aktif' color='success' variant='tonal' />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent className='flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center'>
          <div>
            <Typography variant='h5' className='font-medium mbe-1'>
              Riwayat Backup
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Daftar file backup yang tersedia
            </Typography>
          </div>
          <Button variant='outlined' startIcon={<i className='ri-upload-line' />}>
            Upload Backup
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

      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
        <DialogTitle>Konfirmasi Restore Database</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Anda akan melakukan restore database dari file <strong>{selectedBackup?.filename}</strong>. Proses ini akan
            menimpa seluruh data yang ada dengan data dari backup. Apakah Anda yakin ingin melanjutkan?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='secondary' onClick={() => setOpenRestoreDialog(false)}>
            Batal
          </Button>
          <Button variant='contained' color='error' onClick={handleRestore}>
            Ya, Restore Sekarang
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BackupRestoreSettings
