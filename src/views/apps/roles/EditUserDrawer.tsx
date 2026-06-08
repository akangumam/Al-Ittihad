// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Types Imports
import type { UsersType } from '@/types/apps/userTypes'

type Props = {
  open: boolean
  handleClose: () => void
  user: UsersType | null
  onUpdate: (updatedUser: UsersType) => void
}

type FormValidateType = {
  fullName: string
  username: string
  email?: string
  role: string
  status: string
}

const EditUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, user, onUpdate } = props

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      role: '',
      status: ''
    }
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      resetForm({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || ''
      })
    }
  }, [user, resetForm])

  const onSubmit = async (data: FormValidateType) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/apps/user-list/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          role: data.role,
          status: data.status
        })
      })

      if (response.ok) {
        await response.json()

        onUpdate({
          ...user,
          ...data
        })
        toast.success('Pengguna berhasil diperbarui')
        handleClose()
      } else {
        const error = await response.json()

        toast.error(error.error || 'Gagal memperbarui pengguna')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Terjadi kesalahan saat memperbarui pengguna')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setNewPassword('')
    handleClose()
  }

  const handleResetPassword = async () => {
    if (!user || !newPassword) return

    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')

      return
    }

    try {
      setIsResettingPassword(true)

      const response = await fetch(`/api/system/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        toast.success('Password berhasil direset')
        setNewPassword('')
      } else {
        const error = await response.json()

        toast.error(error.error || 'Gagal mereset password')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mereset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Ubah Data Pengguna</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
          <Controller
            name='fullName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nama Lengkap'
                placeholder='John Doe'
                {...(errors.fullName && { error: true, helperText: 'Field ini wajib diisi.' })}
              />
            )}
          />
          <Controller
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Username'
                placeholder='johndoe'
                {...(errors.username && { error: true, helperText: 'Field ini wajib diisi.' })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type='email' label='Email (Opsional)' placeholder='johndoe@gmail.com' />
            )}
          />
          <FormControl fullWidth>
            <InputLabel id='role-label' error={Boolean(errors.role)}>
              Pilih Role
            </InputLabel>
            <Controller
              name='role'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label='Pilih Role' {...field} error={Boolean(errors.role)}>
                  <MenuItem value='admin'>Admin</MenuItem>
                  <MenuItem value='author'>Author</MenuItem>
                  <MenuItem value='editor'>Editor</MenuItem>
                  <MenuItem value='maintainer'>Maintainer</MenuItem>
                  <MenuItem value='subscriber'>Subscriber</MenuItem>
                </Select>
              )}
            />
            {errors.role && <FormHelperText error>Field ini wajib diisi.</FormHelperText>}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id='status-label' error={Boolean(errors.status)}>
              Pilih Status
            </InputLabel>
            <Controller
              name='status'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label='Pilih Status' {...field} error={Boolean(errors.status)}>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText error>Field ini wajib diisi.</FormHelperText>}
          </FormControl>
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button variant='outlined' color='error' type='button' onClick={() => handleReset()}>
              Batal
            </Button>
          </div>
        </form>

        <Divider className='my-5' />

        <div className='flex flex-col gap-3'>
          <Typography variant='subtitle2' className='font-semibold'>
            Reset Password
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Isi password baru untuk pengguna ini, lalu klik Reset.
          </Typography>
          <TextField
            fullWidth
            size='small'
            label='Password Baru'
            placeholder='Minimal 8 karakter'
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={() => setShowNewPassword(!showNewPassword)} edge='end'>
                      <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <Button
            variant='outlined'
            color='warning'
            disabled={!newPassword || isResettingPassword}
            onClick={handleResetPassword}
            startIcon={<i className='ri-lock-password-line' />}
          >
            {isResettingPassword ? 'Mereset...' : 'Reset Password'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default EditUserDrawer
