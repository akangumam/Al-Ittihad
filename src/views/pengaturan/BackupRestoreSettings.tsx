'use client'

import { useState, useRef } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Divider from '@mui/material/Divider'

const BackupRestoreSettings = () => {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBackupNow = async () => {
    try {
      setIsBackingUp(true)
      const res = await fetch('/api/system/backup')

      if (!res.ok) {
        const err = await res.json()

        throw new Error(err.error || 'Gagal membuat backup')
      }

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : `backup-alittihad-${new Date().toISOString().slice(0, 10)}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      setSnackbar({ open: true, message: 'Backup berhasil diunduh', severity: 'success' })
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' })
    } finally {
      setIsBackingUp(false)
    }
  }

  return (
    <>
      <Alert severity='warning' className='mb-6'>
        <Typography variant='body2' className='font-medium'>
          Panduan Backup & Restore
        </Typography>
        <Typography variant='body2'>
          Backup mengekspor seluruh data ke file JSON. Simpan file ini di tempat yang aman. Untuk restore database
          penuh (SQL), gunakan panel hosting Domainesia atau phpMyAdmin.
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
                    Unduh semua data sebagai file JSON
                  </Typography>
                </div>
                <Button
                  variant='contained'
                  onClick={handleBackupNow}
                  disabled={isBackingUp}
                  startIcon={isBackingUp ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
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
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-warning-light'>
                  <i className='ri-upload-cloud-line text-warning text-2xl' />
                </div>
                <div className='flex-1'>
                  <Typography variant='h6' className='mb-1'>
                    Restore Database
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Gunakan phpMyAdmin atau panel hosting untuk restore SQL
                  </Typography>
                </div>
                <Button
                  variant='outlined'
                  color='warning'
                  startIcon={<i className='ri-external-link-line' />}
                  onClick={() => window.open('https://alezio-db.id.domainesia.com', '_blank')}
                >
                  Buka Panel DB
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' className='mb-2'>
            Informasi Backup
          </Typography>
          <Divider className='mb-4' />
          <div className='flex flex-col gap-3'>
            <div className='flex items-start gap-3'>
              <i className='ri-information-line text-info text-xl mt-0.5' />
              <div>
                <Typography variant='body2' className='font-medium'>
                  Format Backup
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  File JSON berisi data siswa, guru, kelas, keuangan, SPP, dan pengaturan sistem.
                  File ini dapat dibuka dengan text editor manapun.
                </Typography>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <i className='ri-shield-check-line text-success text-xl mt-0.5' />
              <div>
                <Typography variant='body2' className='font-medium'>
                  Keamanan
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Data password tidak disertakan dalam backup. File backup tidak mengandung informasi kredensial login.
                </Typography>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <i className='ri-calendar-line text-primary text-xl mt-0.5' />
              <div>
                <Typography variant='body2' className='font-medium'>
                  Rekomendasi
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Lakukan backup minimal satu kali seminggu dan simpan di Google Drive atau penyimpanan eksternal.
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type='file' accept='.json' className='hidden' />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BackupRestoreSettings
