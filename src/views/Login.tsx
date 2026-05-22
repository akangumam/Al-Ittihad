'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import { toast } from 'react-toastify'
import Alert from '@mui/material/Alert'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import { useAppContext } from '@/contexts/AppContext'
import { logLoginAttempt } from '@/utils/authLogger'

// ... existing imports

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isLoginSuccess, setIsLoginSuccess] = useState(false)

  // Vars - Using custom background
  const customBackground = '/images/background/login_bg.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const { logActivity } = useAppContext()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Use custom background instead of theme-based variants
  const authBackground = customBackground

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      setIsLoginSuccess(true)
      toast.success('Login berhasil! Mengalihkan ke dashboard...')

      // Log successful login
      logLoginAttempt(logActivity, data.email, true)

      // Vars
      const redirectURL = searchParams.get('redirectTo') ?? '/apps/academy/dashboard'

      // Add 2 second delay for loading screen
      setTimeout(() => {
        router.replace(getLocalizedUrl(redirectURL, locale as Locale))
      }, 2000)
    } else {
      if (res?.error) {
        let errorMessage = 'Email atau password salah'

        // Handle specific technical error codes from NextAuth
        if (res.error === 'CredentialsSignin') {
          errorMessage = 'Email atau password yang Anda masukkan salah.'
        } else if (res.error === 'SessionRequired') {
          errorMessage = 'Silakan login terlebih dahulu.'
        }

        const error = { message: [errorMessage] }

        setErrorState(error)

        // Failed login logging omitted — user is not authenticated yet
      }
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <img
          src={authBackground}
          alt='login-background'
          className='absolute inset-0 z-[-1] is-full bs-full object-cover object-left max-md:hidden'
          style={{
            objectPosition: 'left center'
          }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[400px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Selamat Datang! 👋🏻`}</Typography>
            <Typography>Silakan masuk ke akun Anda</Typography>
          </div>

          {errorState && (
            <Alert severity='error' onClose={() => setErrorState(null)}>
              {errorState.message[0]}
            </Alert>
          )}

          <form
            noValidate
            action={() => {}}
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='email'
                  label='Email'
                  id='login-email'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...(errors.email && {
                    error: true,
                    helperText: errors?.email?.message
                  })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/auth/forgot-password', locale as Locale)}
              >
                Lupa password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              Log In
            </Button>
          </form>
        </div>
      </div>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          backgroundColor: '#000'
        }}
        open={isLoginSuccess}
      >
        <img src='/images/logos/aliet_logo.png' alt='Loading' width={360} className='mb-4' />
        <CircularProgress color='primary' />
      </Backdrop>
    </div>
  )
}

export default Login
