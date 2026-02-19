'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

export default function ClearStoragePage() {
  const router = useRouter()
  const [cleared, setCleared] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const handleClear = () => {
    // Clear localStorage
    localStorage.clear()
    sessionStorage.clear()

    setCleared(true)

    // Start countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/')

          return 0
        }

        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <Card className='max-w-md w-full'>
        <CardContent className='flex flex-col gap-4'>
          <Typography variant='h5' className='font-bold'>
            Clear Storage
          </Typography>

          {!cleared ? (
            <>
              <Alert severity='warning'>
                <Typography variant='body2'>
                  Tindakan ini akan menghapus semua data dari localStorage dan sessionStorage. Data dummy akan terhapus
                  dan aplikasi akan menggunakan database.
                </Typography>
              </Alert>

              <Button variant='contained' color='error' onClick={handleClear} fullWidth>
                Hapus Semua Data localStorage
              </Button>
            </>
          ) : (
            <>
              <Alert severity='success'>
                <Typography variant='body2' className='font-medium'>
                  ✓ Storage berhasil dibersihkan!
                </Typography>
                <Typography variant='caption'>Mengalihkan ke dashboard dalam {countdown} detik...</Typography>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
