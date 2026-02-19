'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { toast } from 'react-toastify'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Email wajib diisi')

      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Gagal mengirim email reset password')
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
                Lupa Password?
              </Typography>
              <Typography variant='body2' className='text-center'>
                Masukkan email Anda dan kami akan mengirimkan link untuk reset password
              </Typography>
            </div>
          </div>

          {success ? (
            <div className='flex flex-col gap-4'>
              <Alert severity='success'>
                <Typography variant='body2'>
                  Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam.
                </Typography>
              </Alert>
              <Button
                fullWidth
                variant='outlined'
                onClick={() => router.push('/login')}
                startIcon={<i className='ri-arrow-left-line' />}
              >
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />

              <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Ingat password Anda?</Typography>
                <Typography component={Link} href='/login' color='primary' className='font-medium'>
                  Login
                </Typography>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
