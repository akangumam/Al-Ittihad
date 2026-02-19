'use client'

import { useState, useEffect, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { toast } from 'react-toastify'

const ResetPasswordContent = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')

    if (!tokenParam) {
      toast.error('Token tidak valid')
      router.push('/login')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('Semua field wajib diisi')

      return
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok')

      return
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')

      return
    }

    if (!token) {
      toast.error('Token tidak valid')

      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success(data.message)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(data.error || 'Gagal reset password')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6'>
      <Card className='max-w-md w-full'>
        <CardContent className='p-6 sm:p-12'>
          <div className='flex justify-center items-center mb-6'>
            <div className='flex flex-col items-center gap-2'>
              <Typography variant='h4' className='font-semibold'>
                Reset Password
              </Typography>
              <Typography variant='body2' className='text-center'>
                Masukkan password baru Anda
              </Typography>
            </div>
          </div>

          {success ? (
            <div className='flex flex-col gap-4'>
              <Alert severity='success'>
                <Typography variant='body2'>
                  Password berhasil diubah! Anda akan diarahkan ke halaman login...
                </Typography>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                fullWidth
                label='Password Baru'
                placeholder='Minimal 6 karakter'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label='toggle password visibility'
                        >
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />

              <TextField
                fullWidth
                label='Konfirmasi Password'
                placeholder='Ketik ulang password'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label='toggle password visibility'
                        >
                          <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />

              <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Reset Password'}
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography component={Link} href='/login' color='primary' className='font-medium'>
                  Kembali ke Login
                </Typography>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

export default ResetPasswordPage
