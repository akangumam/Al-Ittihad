// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
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
  onAdd: (newUser: UsersType) => void
}

type FormValidateType = {
  fullName: string
  username: string
  email?: string
  password: string
  role: string
  status: string
}

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, onAdd } = props

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      password: '',
      role: '',
      status: ''
    }
  })

  const onSubmit = async (data: FormValidateType) => {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/apps/user-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status
        })
      })

      if (response.ok) {
        const result = await response.json()

        onAdd(result.user)
        toast.success('Pengguna berhasil ditambahkan')
        handleReset()
      } else {
        const error = await response.json()

        toast.error(error.error || 'Gagal menambahkan pengguna')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Terjadi kesalahan saat menambahkan pengguna')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm({
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: '',
      status: ''
    })
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
        <Typography variant='h5'>Tambah Pengguna Baru</Typography>
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
          <Controller
            name='password'
            control={control}
            rules={{ required: true, minLength: 6 }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='password'
                label='Password'
                placeholder='Minimal 6 karakter'
                {...(errors.password && {
                  error: true,
                  helperText:
                    errors.password.type === 'minLength' ? 'Password minimal 6 karakter.' : 'Field ini wajib diisi.'
                })}
              />
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
              {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
            </Button>
            <Button variant='outlined' color='error' type='button' onClick={() => handleReset()}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
