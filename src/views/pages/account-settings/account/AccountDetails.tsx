'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// Third-party Imports
import { toast } from 'react-toastify'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type Data = {
  firstName: string
  lastName: string
  email: string
  organization: string
  phoneNumber: number | string
  address: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  city: string
  province: string
  postalCode: string
  country: string
  language: string
  timezone: string
  currency: string
}

// Vars
const initialData: Data = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  phoneNumber: '',
  address: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'indonesia',
  language: 'indonesian',
  timezone: 'gmt+07',
  currency: 'idr'
}

const AccountDetails = () => {
  // Hooks
  const { update: updateSession } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()

  // States
  const [formData, setFormData] = useState<Data>(initialData)
  const [fileInput] = useState<string>('')
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      })

      const result = await response.json()

      if (result.success && result.data) {
        const user = result.data
        const nameParts = user.name?.split(' ') || ['', '']

        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
          organization: user.organization || 'Al-Ittihad',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          rt: user.rt || '',
          rw: user.rw || '',
          kelurahan: user.kelurahan || '',
          kecamatan: user.kecamatan || '',
          city: user.city || '',
          province: user.province || '',
          postalCode: user.postalCode || '',
          country: 'indonesia',
          language: 'indonesian',
          timezone: 'gmt+07',
          currency: 'idr'
        })

        if (user.image) {
          setImgSrc(`${user.image}?t=${Date.now()}`)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Gagal memuat data profil' })
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = async (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      // Validate file size
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' })

        return
      }

      // Show preview
      const reader = new FileReader()

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(selectedFile)

      // Upload to server
      setUploading(true)
      setMessage(null)

      try {
        const formData = new FormData()

        formData.append('file', selectedFile)

        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          toast.success('Foto profil berhasil diupload')

          // Update session with trigger to refresh JWT token
          if (updateSession) {
            await updateSession({ trigger: 'update' })
          }

          // Give a small delay to ensure session is updated
          await new Promise(resolve => setTimeout(resolve, 100))

          // Refresh router to update all server components
          router.refresh()

          // Reload the profile data
          await fetchUserProfile()

          // Force a hard reload to ensure all components refresh
          window.location.reload()
        } else {
          toast.error(result.error || 'Gagal upload foto')

          // Revert preview on error
          fetchUserProfile()
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.error('Gagal upload foto profil')
        fetchUserProfile()
      } finally {
        setUploading(false)

        // Reset file input value to allow selecting the same file again
        if (file.target) {
          ;(file.target as HTMLInputElement).value = ''
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          rt: formData.rt,
          rw: formData.rw,
          kelurahan: formData.kelurahan,
          kecamatan: formData.kecamatan,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          organization: formData.organization
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Profil berhasil diperbarui')

        // Update session and reload to refresh all components
        if (updateSession) {
          await updateSession()
        }

        // Refresh router to update all server components
        router.refresh()

        // Redirect to profile page
        router.push(getLocalizedUrl('/pages/user-profile', locale as Locale))
      } else {
        toast.error(result.error || 'Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                component='label'
                variant='contained'
                htmlFor='account-settings-upload-image'
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload New Photo'}
                <input
                  hidden
                  type='file'
                  value={fileInput}
                  accept='image/png, image/jpeg, image/jpg, image/gif, image/webp'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                  disabled={uploading}
                />
              </Button>
            </div>
            <Typography>Allowed JPG, PNG, GIF. Max size of 5MB</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='First Name'
                value={formData.firstName}
                placeholder='John'
                onChange={e => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Last Name'
                value={formData.lastName}
                placeholder='Doe'
                onChange={e => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='john.doe@gmail.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Organization'
                value={formData.organization}
                placeholder='Pixinvent'
                onChange={e => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Phone Number'
                value={formData.phoneNumber}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Address'
                value={formData.address}
                placeholder='Jl. Contoh No. 123'
                onChange={e => handleFormChange('address', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label='RT'
                value={formData.rt}
                placeholder='001'
                onChange={e => handleFormChange('rt', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label='RW'
                value={formData.rw}
                placeholder='002'
                onChange={e => handleFormChange('rw', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Kelurahan/Desa'
                value={formData.kelurahan}
                placeholder='Kelurahan'
                onChange={e => handleFormChange('kelurahan', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Kecamatan'
                value={formData.kecamatan}
                placeholder='Kecamatan'
                onChange={e => handleFormChange('kecamatan', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Kota/Kabupaten'
                value={formData.city}
                placeholder='Jakarta'
                onChange={e => handleFormChange('city', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Provinsi'
                value={formData.province}
                placeholder='DKI Jakarta'
                onChange={e => handleFormChange('province', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Kode Pos'
                value={formData.postalCode}
                placeholder='12345'
                onChange={e => handleFormChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Negara</InputLabel>
                <Select
                  label='Negara'
                  value={formData.country}
                  onChange={e => handleFormChange('country', e.target.value)}
                >
                  <MenuItem value='indonesia'>Indonesia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap pbs-6'>
              <Button variant='contained' type='submit' disabled={saving}>
                {saving ? 'Menyimpan...' : 'Save Changes'}
              </Button>
              <Button
                variant='outlined'
                type='button'
                color='secondary'
                onClick={() => {
                  router.push(getLocalizedUrl('/pages/user-profile', locale as Locale))
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
