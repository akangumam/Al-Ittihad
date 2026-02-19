'use client'

import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Alert from '@mui/material/Alert'
import { toast } from 'react-toastify'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { FeeTemplate, FeeComponent } from '@/types/feeTypes'
import OptionMenu from '@core/components/option-menu'

type ComponentInput = {
  id: string
  name: string
  amount: string
  priority: string
  description?: string
}

// Sortable Item Component
const SortableComponentItem = ({
  component,
  index,
  onComponentChange,
  onRemove,
  disabled
}: {
  component: ComponentInput
  index: number
  onComponentChange: (index: number, field: keyof ComponentInput, value: string) => void
  onRemove: (index: number) => void
  disabled: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Grid ref={setNodeRef} style={style} container spacing={2} size={{ xs: 12 }} sx={{ mb: 2, alignItems: 'center' }}>
      <Grid size={{ xs: 'auto' }}>
        <IconButton
          {...attributes}
          {...listeners}
          size='small'
          sx={{ cursor: isDragging ? 'grabbing' : 'grab', color: 'text.secondary' }}
        >
          <i className='ri-drag-move-line' />
        </IconButton>
      </Grid>
      <Grid size={{ xs: 12, md: 1 }}>
        <TextField fullWidth label='Prioritas' type='number' value={index + 1} disabled size='small' />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          label='Nama Komponen'
          value={component.name}
          onChange={e => onComponentChange(index, 'name', e.target.value)}
          required
          size='small'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2.5 }}>
        <TextField
          fullWidth
          label='Nominal'
          value={component.amount ? parseInt(component.amount).toLocaleString('id-ID') : ''}
          onChange={e => {
            const rawValue = e.target.value.replace(/\D/g, '')

            onComponentChange(index, 'amount', rawValue)
          }}
          InputProps={{
            startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
          }}
          placeholder='0'
          required
          size='small'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3.5 }}>
        <TextField
          fullWidth
          label='Keterangan'
          value={component.description || ''}
          onChange={e => onComponentChange(index, 'description', e.target.value)}
          size='small'
        />
      </Grid>
      <Grid size={{ xs: 'auto' }}>
        <IconButton onClick={() => onRemove(index)} color='error' disabled={disabled} size='small'>
          <i className='ri-delete-bin-line' />
        </IconButton>
      </Grid>
    </Grid>
  )
}

const FeeTemplateTable = () => {
  const [templates, setTemplates] = useState<FeeTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FeeTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: '' as
      | 'REGISTRATION'
      | 'ANNUAL_REREGISTRATION'
      | 'GRADUATION'
      | 'CLASS_SPECIFIC'
      | 'EXAM'
      | 'ACTIVITY'
      | 'OTHER'
      | '',
    academicYear: '',
    grade: '',
    description: ''
  })

  const [components, setComponents] = useState<ComponentInput[]>([
    { id: '1', name: '', amount: '', priority: '1', description: '' }
  ])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setComponents(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update priorities based on new order
        return newItems.map((item, index) => ({
          ...item,
          priority: (index + 1).toString()
        }))
      })
    }
  }

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/fee-templates')

      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()

      setTemplates(data)
    } catch (error: any) {
      toast.error('Gagal memuat template biaya')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleOpenDialog = (template?: FeeTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        type: template.type,
        academicYear: template.academicYear,
        grade: template.grade || '',
        description: template.description || ''
      })

      // Load existing components
      if (template.components && template.components.length > 0) {
        setComponents(
          template.components.map((comp, index) => ({
            id: comp.id || `comp-${index}`,
            name: comp.name,
            amount: comp.amount.toString(),
            priority: comp.priority.toString(),
            description: comp.description || ''
          }))
        )
      } else {
        setComponents([{ id: '1', name: '', amount: '', priority: '1', description: '' }])
      }
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        type: '',
        academicYear: '2025/2026',
        grade: '',
        description: ''
      })
      setComponents([{ id: '1', name: '', amount: '', priority: '1', description: '' }])
    }

    setOpenDialog(true)
  }

  const handleAddComponent = () => {
    const newId = `comp-${Date.now()}`

    setComponents([
      ...components,
      { id: newId, name: '', amount: '', priority: (components.length + 1).toString(), description: '' }
    ])
  }

  const handleRemoveComponent = (index: number) => {
    if (components.length > 1) {
      const newComponents = components.filter((_, i) => i !== index)

      // Update priorities after removal
      setComponents(
        newComponents.map((item, idx) => ({
          ...item,
          priority: (idx + 1).toString()
        }))
      )
    }
  }

  const handleComponentChange = (index: number, field: keyof ComponentInput, value: string) => {
    const newComponents = [...components]

    newComponents[index][field] = value
    setComponents(newComponents)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.type || !formData.academicYear) {
      toast.error('Mohon isi nama, tipe, dan tahun ajaran')

      return
    }

    // Validate components
    const validComponents = components.filter(c => c.name && c.amount)

    if (validComponents.length === 0) {
      toast.error('Minimal harus ada 1 komponen biaya')

      return
    }

    const hasInvalidAmount = validComponents.some(c => isNaN(Number(c.amount)) || Number(c.amount) <= 0)

    if (hasInvalidAmount) {
      toast.error('Nominal biaya harus berupa angka positif')

      return
    }

    try {
      const payload = {
        ...formData,
        grade: formData.grade || null,
        description: formData.description || null,
        components: validComponents.map(c => ({
          name: c.name,
          amount: Number(c.amount),
          priority: Number(c.priority) || 1,
          description: c.description || null
        }))
      }

      const url = editingTemplate ? `/api/fee-templates/${editingTemplate.id}` : '/api/fee-templates'
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()

        throw new Error(error.error || 'Failed to save template')
      }

      toast.success(editingTemplate ? 'Template berhasil diperbarui' : 'Template berhasil dibuat')
      setOpenDialog(false)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan template')
      console.error(error)
    }
  }

  const handleDelete = async (template: FeeTemplate) => {
    if (template._count && template._count.studentFees > 0) {
      toast.error(`Template tidak bisa dihapus karena sudah digunakan oleh ${template._count.studentFees} siswa`)

      return
    }

    if (!confirm(`Yakin ingin menghapus template "${template.name}"?`)) return

    try {
      const response = await fetch(`/api/fee-templates/${template.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()

        throw new Error(error.error || 'Failed to delete template')
      }

      toast.success('Template berhasil dihapus')
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus template')
      console.error(error)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REGISTRATION':
        return 'Pendaftaran Baru (PPDB)'
      case 'ANNUAL_REREGISTRATION':
        return 'Daftar Ulang Tahunan'
      case 'GRADUATION':
        return 'Kelulusan'
      case 'CLASS_SPECIFIC':
        return 'Biaya Khusus Kelas'
      case 'EXAM':
        return 'Biaya Ujian'
      case 'ACTIVITY':
        return 'Kegiatan'
      case 'OTHER':
        return 'Lain-lain'
      default:
        return type
    }
  }

  const getTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default' => {
    switch (type) {
      case 'REGISTRATION':
        return 'primary'
      case 'ANNUAL_REREGISTRATION':
        return 'success'
      case 'GRADUATION':
        return 'warning'
      case 'CLASS_SPECIFIC':
        return 'info'
      case 'EXAM':
        return 'error'
      case 'ACTIVITY':
        return 'info'
      case 'OTHER':
        return 'default'
      default:
        return 'default'
    }
  }

  const calculateTotalAmount = (comps: FeeComponent[] | ComponentInput[]) => {
    return comps.reduce((sum, comp) => {
      const amount = typeof comp.amount === 'string' ? parseFloat(comp.amount) : comp.amount

      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  /*
  // Format number with thousand separator for input display
  const formatInputNumber = (value: string) => {
    if (!value) return ''

    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '')

    if (!numericValue) return ''

    // Format with thousand separator (dot for Indonesian format)
    return parseInt(numericValue).toLocaleString('id-ID')
  }

  // Parse formatted input back to plain number string
  const parseInputNumber = (value: string) => {
    // Remove all non-numeric characters (dots, spaces, etc)
    return value.replace(/\D/g, '')
  }
  */

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4} alignItems='center' sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant='h5' component='div'>
              Template Biaya Sekolah
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola template biaya untuk PPDB, Daftar Ulang, dan Kelas 9
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
            <Button variant='contained' onClick={() => handleOpenDialog()} startIcon={<i className='ri-add-line' />}>
              Tambah Template
            </Button>
          </Grid>
        </Grid>

        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>Panduan:</strong>
            <br />• <strong>PPDB (Pendaftaran Baru):</strong> Untuk siswa baru yang baru mendaftar
            <br />• <strong>Daftar Ulang:</strong> Untuk siswa lama yang daftar ulang setiap tahun
            <br />• <strong>Kelas 9:</strong> Untuk biaya khusus siswa kelas 9 (kelulusan, perpisahan, dll)
          </Typography>
        </Alert>

        {isLoading ? (
          <Typography>Memuat data...</Typography>
        ) : templates.length === 0 ? (
          <Alert severity='warning'>
            Belum ada template biaya. Klik &quot;Tambah Template&quot; untuk membuat template baru.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {templates.map(template => (
              <Accordion key={template.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <AccordionSummary
                    expandIcon={<i className='ri-arrow-down-s-line' />}
                    sx={{
                      flex: 1,
                      '& .MuiAccordionSummary-content': { alignItems: 'center', my: 1 }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='h6'>{template.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={getTypeLabel(template.type)} color={getTypeColor(template.type)} size='small' />
                        <Chip label={template.academicYear} size='small' variant='outlined' />
                        {template.grade && <Chip label={`Kelas ${template.grade}`} size='small' variant='outlined' />}
                        <Chip
                          label={template.isActive ? 'Aktif' : 'Nonaktif'}
                          color={template.isActive ? 'success' : 'default'}
                          size='small'
                        />
                        {template._count && template._count.studentFees > 0 && (
                          <Chip
                            label={`${template._count.studentFees} Siswa`}
                            size='small'
                            color='info'
                            variant='outlined'
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <Box sx={{ position: 'absolute', right: 48, zIndex: 1 }}>
                    <OptionMenu
                      iconClassName='text-textPrimary'
                      options={[
                        {
                          text: 'Edit',
                          icon: 'ri-edit-box-line',
                          menuItemProps: {
                            onClick: () => handleOpenDialog(template)
                          }
                        },
                        {
                          text: 'Hapus',
                          icon: 'ri-delete-bin-7-line',
                          menuItemProps: {
                            onClick: () => handleDelete(template),
                            disabled: template._count ? template._count.studentFees > 0 : false
                          }
                        }
                      ]}
                    />
                  </Box>
                </Box>
                <AccordionDetails>
                  {template.description && (
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                  )}

                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Prioritas</TableCell>
                          <TableCell>Nama Komponen</TableCell>
                          <TableCell align='right'>Nominal</TableCell>
                          <TableCell>Keterangan</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {template.components && template.components.length > 0 ? (
                          <>
                            {template.components.map(comp => (
                              <TableRow key={comp.id}>
                                <TableCell>{comp.priority}</TableCell>
                                <TableCell>{comp.name}</TableCell>
                                <TableCell align='right'>
                                  <strong>{formatCurrency(comp.amount)}</strong>
                                </TableCell>
                                <TableCell>{comp.description || '-'}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} align='right'>
                                <strong>Total:</strong>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='h6' color='primary'>
                                  {formatCurrency(calculateTotalAmount(template.components))}
                                </Typography>
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align='center'>
                              Belum ada komponen biaya
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Dialog for Add/Edit Template */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='md' fullWidth>
          <DialogTitle>{editingTemplate ? 'Edit Template Biaya' : 'Tambah Template Biaya'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Nama Template'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder='contoh: Biaya PPDB 2025/2026'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipe Template</InputLabel>
                  <Select
                    value={formData.type}
                    label='Tipe Template'
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value as typeof formData.type
                      })
                    }
                  >
                    <MenuItem value='REGISTRATION'>Pendaftaran Baru (PPDB)</MenuItem>
                    <MenuItem value='ANNUAL_REREGISTRATION'>Daftar Ulang Tahunan</MenuItem>
                    <MenuItem value='GRADUATION'>Kelulusan</MenuItem>
                    <MenuItem value='CLASS_SPECIFIC'>Biaya Khusus Kelas (Misal: Kelas 7, 8, 9 MTs)</MenuItem>
                    <MenuItem value='EXAM'>Biaya Ujian (UTS, UAS, Try Out)</MenuItem>
                    <MenuItem value='ACTIVITY'>Kegiatan (Study Tour, Camping, Ekskul)</MenuItem>
                    <MenuItem value='OTHER'>Lain-lain</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Tahun Ajaran'
                  value={formData.academicYear}
                  onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder='2025/2026'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Kelas (Opsional)'
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  placeholder='7, 8, atau 9'
                  helperText='Kosongkan jika berlaku untuk semua kelas'
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Deskripsi (Opsional)'
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Komponen Biaya
                </Typography>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  <i className='ri-information-line' /> Geser baris untuk mengubah urutan prioritas
                </Typography>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {components.map((comp, index) => (
                      <SortableComponentItem
                        key={comp.id}
                        component={comp}
                        index={index}
                        onComponentChange={handleComponentChange}
                        onRemove={handleRemoveComponent}
                        disabled={components.length === 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <Button size='small' onClick={handleAddComponent} startIcon={<i className='ri-add-line' />}>
                  Tambah Komponen
                </Button>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    <strong>Total Biaya:</strong> {formatCurrency(calculateTotalAmount(components))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button variant='contained' onClick={handleSave}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default FeeTemplateTable
