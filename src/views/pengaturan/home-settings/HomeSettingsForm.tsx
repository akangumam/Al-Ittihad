'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Icon Imports
import DeleteIcon from '@mui/icons-material/Delete'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import SaveIcon from '@mui/icons-material/Save'

interface HomeSettings {
  id?: string
  heroTitle: string
  heroSubtitle?: string
  heroDescription?: string
  heroImage?: string
  principalName?: string
  principalTitle?: string
  principalPhoto?: string
  principalMessage?: string
  aboutTitle?: string
  aboutDescription?: string
  aboutImage?: string
  schoolName: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  schoolWebsite?: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const HomeSettingsForm = () => {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [settings, setSettings] = useState<HomeSettings>({
    heroTitle: 'Selamat Datang di Al-Ittihad',
    schoolName: 'Al-Ittihad'
  })

  const [previewImages, setPreviewImages] = useState({
    heroImage: '',
    principalPhoto: '',
    aboutImage: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/home')
      const result = await response.json()

      if (result.success && result.data) {
        setSettings(result.data)
        setPreviewImages({
          heroImage: result.data.heroImage || '',
          principalPhoto: result.data.principalPhoto || '',
          aboutImage: result.data.aboutImage || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof HomeSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (
    field: 'heroImage' | 'principalPhoto' | 'aboutImage',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' })

      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' })

      return
    }

    try {
      // Create preview
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreviewImages(prev => ({ ...prev, [field]: reader.result as string }))
      }

      reader.readAsDataURL(file)

      // Upload file
      const formData = new FormData()

      formData.append('file', file)
      formData.append('folder', 'home-settings')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setSettings(prev => ({ ...prev, [field]: result.url }))
        setMessage({ type: 'success', text: 'Gambar berhasil diupload' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal upload gambar' })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setMessage({ type: 'error', text: 'Gagal upload gambar' })
    }
  }

  const handleRemoveImage = (field: 'heroImage' | 'principalPhoto' | 'aboutImage') => {
    setSettings(prev => ({ ...prev, [field]: '' }))
    setPreviewImages(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal menyimpan pengaturan' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' })
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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title='Pengaturan Halaman Home' />
        <CardContent>
          {message && (
            <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label='Hero Section' />
            <Tab label='Kepala Sekolah' />
            <Tab label='Tentang' />
            <Tab label='Kontak & Sosial Media' />
          </Tabs>

          {/* Tab 0: Hero Section */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Judul Hero'
                  value={settings.heroTitle}
                  onChange={e => handleInputChange('heroTitle', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Subjudul Hero'
                  value={settings.heroSubtitle || ''}
                  onChange={e => handleInputChange('heroSubtitle', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Deskripsi Hero'
                  value={settings.heroDescription || ''}
                  onChange={e => handleInputChange('heroDescription', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  Gambar Hero
                </Typography>
                {previewImages.heroImage && (
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <img
                      src={previewImages.heroImage}
                      alt='Hero'
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                    />
                    <IconButton
                      size='small'
                      color='error'
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                      onClick={() => handleRemoveImage('heroImage')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
                <Box>
                  <Button variant='outlined' component='label' startIcon={<PhotoCameraIcon />}>
                    Upload Gambar Hero
                    <input type='file' hidden accept='image/*' onChange={e => handleFileChange('heroImage', e)} />
                  </Button>
                  <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                    Maksimal 5MB. Format: JPG, PNG, GIF
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Kepala Sekolah */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Nama Kepala Sekolah'
                  value={settings.principalName || ''}
                  onChange={e => handleInputChange('principalName', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Jabatan'
                  value={settings.principalTitle || ''}
                  onChange={e => handleInputChange('principalTitle', e.target.value)}
                  placeholder='e.g., Kepala Sekolah'
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label='Pesan Kepala Sekolah'
                  value={settings.principalMessage || ''}
                  onChange={e => handleInputChange('principalMessage', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  Foto Kepala Sekolah
                </Typography>
                {previewImages.principalPhoto && (
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      src={previewImages.principalPhoto}
                      alt={settings.principalName}
                      sx={{ width: 200, height: 200 }}
                    />
                    <IconButton
                      size='small'
                      color='error'
                      sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'background.paper' }}
                      onClick={() => handleRemoveImage('principalPhoto')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
                <Box>
                  <Button variant='outlined' component='label' startIcon={<PhotoCameraIcon />}>
                    Upload Foto
                    <input type='file' hidden accept='image/*' onChange={e => handleFileChange('principalPhoto', e)} />
                  </Button>
                  <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                    Maksimal 5MB. Format: JPG, PNG
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 2: Tentang */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Judul Tentang'
                  value={settings.aboutTitle || ''}
                  onChange={e => handleInputChange('aboutTitle', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label='Deskripsi Tentang'
                  value={settings.aboutDescription || ''}
                  onChange={e => handleInputChange('aboutDescription', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  Gambar Tentang
                </Typography>
                {previewImages.aboutImage && (
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <img
                      src={previewImages.aboutImage}
                      alt='About'
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                    />
                    <IconButton
                      size='small'
                      color='error'
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                      onClick={() => handleRemoveImage('aboutImage')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
                <Box>
                  <Button variant='outlined' component='label' startIcon={<PhotoCameraIcon />}>
                    Upload Gambar
                    <input type='file' hidden accept='image/*' onChange={e => handleFileChange('aboutImage', e)} />
                  </Button>
                  <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                    Maksimal 5MB. Format: JPG, PNG, GIF
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Kontak & Sosial Media */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Informasi Kontak
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Nama Sekolah'
                  value={settings.schoolName}
                  onChange={e => handleInputChange('schoolName', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={settings.schoolEmail || ''}
                  onChange={e => handleInputChange('schoolEmail', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Alamat'
                  multiline
                  rows={2}
                  value={settings.schoolAddress || ''}
                  onChange={e => handleInputChange('schoolAddress', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Telepon'
                  value={settings.schoolPhone || ''}
                  onChange={e => handleInputChange('schoolPhone', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Website'
                  value={settings.schoolWebsite || ''}
                  onChange={e => handleInputChange('schoolWebsite', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='h6' sx={{ mt: 2, mb: 2 }}>
                  Sosial Media
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Facebook URL'
                  value={settings.facebookUrl || ''}
                  onChange={e => handleInputChange('facebookUrl', e.target.value)}
                  placeholder='https://facebook.com/...'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Instagram URL'
                  value={settings.instagramUrl || ''}
                  onChange={e => handleInputChange('instagramUrl', e.target.value)}
                  placeholder='https://instagram.com/...'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Twitter URL'
                  value={settings.twitterUrl || ''}
                  onChange={e => handleInputChange('twitterUrl', e.target.value)}
                  placeholder='https://twitter.com/...'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='YouTube URL'
                  value={settings.youtubeUrl || ''}
                  onChange={e => handleInputChange('youtubeUrl', e.target.value)}
                  placeholder='https://youtube.com/...'
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type='button' variant='outlined' onClick={fetchSettings} disabled={saving}>
              Reset
            </Button>
            <Button
              type='submit'
              variant='contained'
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </form>
  )
}

export default HomeSettingsForm

