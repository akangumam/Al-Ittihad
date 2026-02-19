'use client'

import { useState, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import { Plus, Trash2, Save, X, MoveUp, MoveDown } from 'lucide-react'

import { toast } from 'react-toastify'

import { priorityFeeTemplateAPI } from '@/services/api'
import { useAppContext } from '@/contexts/AppContext'

interface ComponentInput {
  id?: string
  name: string
  amount: number
  priority: number
  description: string
  isActive: boolean
}

interface TemplateFormProps {
  id?: string
  onClose: () => void
}

const TemplateForm = ({ id, onClose }: TemplateFormProps) => {
  const { academicYears, refreshData } = useAppContext()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'REGISTRATION',
    academicYear: '',
    grade: '',
    description: '',
    isActive: true
  })

  const [components, setComponents] = useState<ComponentInput[]>([
    { name: '', amount: 0, priority: 1, description: '', isActive: true }
  ])

  // Helper for academic year
  const academicYearAPI_call = useCallback(() => {
    if (academicYears.length > 0) {
      const activeYear = academicYears.find(y => y.isActive)

      if (activeYear) {
        setFormData(prev => ({ ...prev, academicYear: activeYear.name }))

        return true
      }
    }

    return false
  }, [academicYears])

  const loadTemplate = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await priorityFeeTemplateAPI.getById(id)

      setFormData({
        name: data.name,
        type: data.type,
        academicYear: data.academicYear,
        grade: data.grade || '',
        description: data.description || '',
        isActive: data.isActive
      })
      setComponents(data.components)
    } catch {
      toast.error('Gagal memuat template')
      onClose()
    } finally {
      setLoading(false)
    }
  }, [id, onClose])

  useEffect(() => {
    if (id) {
      loadTemplate()
    } else {
      academicYearAPI_call()
    }
  }, [id, academicYearAPI_call, loadTemplate])

  const addComponent = () => {
    setComponents(prev => [
      ...prev,
      { name: '', amount: 0, priority: prev.length + 1, description: '', isActive: true }
    ])
  }

  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index)

    // Update priorities
    const updated = newComponents.map((c, i) => ({ ...c, priority: i + 1 }))

    setComponents(updated)
  }

  const handleComponentChange = (index: number, field: keyof ComponentInput, value: any) => {
    const newComponents = [...components]

    newComponents[index] = { ...newComponents[index], [field]: value }
    setComponents(newComponents)
  }

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === components.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newComponents = [...components]

    // Swap
    const temp = newComponents[index]

    newComponents[index] = newComponents[newIndex]
    newComponents[newIndex] = temp

    // Update priorities based on new positions
    const updated = newComponents.map((c, i) => ({ ...c, priority: i + 1 }))

    setComponents(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.type || !formData.academicYear) {
      toast.error('Mohon lengkapi data template')

      return
    }

    if (components.some(c => !c.name || c.amount <= 0)) {
      toast.error('Mohon lengkapi data komponen biaya (nama dan nominal)')

      return
    }

    try {
      setLoading(true)
      const payload = { ...formData, components }

      if (id) {
        await priorityFeeTemplateAPI.update(id, payload)
        toast.success('Template berhasil diperbarui')
      } else {
        await priorityFeeTemplateAPI.create(payload)
        toast.success('Template berhasil dibuat')
      }

      refreshData()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card component='form' onSubmit={handleSubmit}>
      <CardHeader
        title={id ? 'Edit Template Biaya' : 'Tambah Template Biaya'}
        subheader='Tentukan komponen biaya dan urutan prioritas pembayarannya'
      />
      <Divider />
      <CardContent>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label='Nama Template'
              placeholder='Contoh: Biaya Pendaftaran TA 2025/2026'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label='Tahun Akademik'
              value={formData.academicYear}
              onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
              required
            >
              {academicYears.map(year => (
                <MenuItem key={year.id} value={year.name}>
                  {year.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label='Tipe Biaya'
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <MenuItem value='REGISTRATION'>Pendaftaran (Siswa Baru)</MenuItem>
              <MenuItem value='ANNUAL_REREGISTRATION'>Daftar Ulang (Tahunan)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label='Grade/Tingkat (Opsional)'
              placeholder='Contoh: 7'
              value={formData.grade}
              onChange={e => setFormData({ ...formData, grade: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label='Deskripsi'
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h6' fontWeight={600}>
                Komponen Biaya & Prioritas
              </Typography>
              <Button size='small' startIcon={<Plus size={18} />} onClick={addComponent} variant='outlined'>
                Tambah Komponen
              </Button>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              * Komponen dengan prioritas lebih tinggi (angka lebih kecil) akan dilunasi lebih dulu saat pembayaran
              dilakukan secara bertahap.
            </Typography>

            {components.map((comp, index) => (
              <Box key={index} sx={{ mb: 3, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={3} alignItems='center'>
                  <Grid size={{ xs: 1 }} sx={{ textAlign: 'center' }}>
                    <Typography variant='h6' color='primary' fontWeight={700}>
                      #{comp.priority}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size='small' onClick={() => moveComponent(index, 'up')} disabled={index === 0}>
                        <MoveUp size={14} />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => moveComponent(index, 'down')}
                        disabled={index === components.length - 1}
                      >
                        <MoveDown size={14} />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size='small'
                      label='Nama Komponen'
                      value={comp.name}
                      onChange={e => handleComponentChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size='small'
                      label='Nominal'
                      value={comp.amount ? parseInt(comp.amount.toString()).toLocaleString('id-ID') : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '')

                        handleComponentChange(index, 'amount', Number(rawValue))
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                      }}
                      placeholder='0'
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 1 }}>
                    <IconButton color='error' onClick={() => removeComponent(index)} disabled={components.length === 1}>
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', gap: 2, px: 6, py: 4 }}>
        <Button variant='outlined' color='secondary' onClick={onClose} startIcon={<X size={18} />}>
          Batal
        </Button>
        <Button variant='contained' type='submit' endIcon={loading ? null : <Save size={18} />}>
          Simpan Template
        </Button>
      </CardActions>
    </Card>
  )
}

export default TemplateForm
