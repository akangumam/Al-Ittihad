'use client'

import {} from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

export default function ClearLocalStorageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const handleClear = () => {
    // Clear all app data from localStorage
    localStorage.removeItem('app_data')
    localStorage.removeItem('students')
    localStorage.removeItem('activityLogs')

    // Reload page to reset state
    window.location.reload()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Clear Data</DialogTitle>
      <DialogContent>
        <Alert severity='warning' className='mb-4'>
          <Typography variant='body2' className='font-medium mb-2'>
            Peringatan!
          </Typography>
          <Typography variant='body2'>
            Tindakan ini akan menghapus semua data dari localStorage dan me-refresh halaman. Pastikan data penting sudah
            tersimpan di database.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleClear} variant='contained' color='error'>
          Hapus Semua Data
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Utility to clear localStorage on page load (run once)
export function clearLocalStorageOnInit() {
  if (typeof window !== 'undefined') {
    const hasCleared = sessionStorage.getItem('localStorage_cleared')

    if (!hasCleared) {
      console.log('Clearing localStorage...')
      localStorage.removeItem('app_data')
      sessionStorage.setItem('localStorage_cleared', 'true')
      console.log('localStorage cleared!')
    }
  }
}
