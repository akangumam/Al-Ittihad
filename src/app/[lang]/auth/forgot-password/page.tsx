'use client'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

const ForgotPasswordPage = () => {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6'>
      <Card className='max-w-md w-full'>
        <CardContent className='p-6 sm:p-12'>
          <div className='flex flex-col items-center gap-4 mb-6'>
            <i className='ri-lock-password-line text-5xl text-primary' />
            <Typography variant='h4' className='font-semibold text-center'>
              Lupa Password?
            </Typography>
          </div>

          <Alert severity='info' className='mb-6'>
            <Typography variant='body2'>
              Akses login dikelola oleh administrator. Hubungi admin untuk mereset password Anda.
            </Typography>
          </Alert>

          <div className='flex flex-col gap-3'>
            <Button
              fullWidth
              variant='contained'
              component={Link}
              href='/login'
              startIcon={<i className='ri-arrow-left-line' />}
            >
              Kembali ke Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
