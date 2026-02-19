'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Edit, Trash2, ChevronRight, Layers } from 'lucide-react'

import { toast } from 'react-toastify'

import { useAppContext } from '@/contexts/AppContext'
import { priorityFeeTemplateAPI } from '@/services/api'
import ConfirmationDialog from '@components/dialogs/ConfirmationDialog'

const TemplateList = () => {
  const { feeTemplates, refreshData } = useAppContext()
  const [loading, setLoading] = useState<string | null>(null)

  // Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(id)
      await priorityFeeTemplateAPI.update(id, { isActive: !currentStatus })
      toast.success(`Template berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      refreshData()
    } catch {
      toast.error('Gagal memperbarui status template')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = (id: string) => {
    setSelectedTemplateId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTemplateId) return

    try {
      setIsDeleting(true)
      await priorityFeeTemplateAPI.delete(selectedTemplateId)
      toast.success('Template berhasil dihapus')
      refreshData()
      setDeleteDialogOpen(false)
    } catch {
      toast.error('Gagal menghapus template')
    } finally {
      setIsDeleting(false)
      setSelectedTemplateId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h5' fontWeight={700}>
          Daftar Template Biaya
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={6}>
            {feeTemplates.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Layers size={48} color='grey' style={{ marginBottom: 16 }} />
                  <Typography variant='h6' color='text.secondary'>
                    Belum ada template biaya
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Buat template pertama Anda untuk mulai mengelola pembayaran
                  </Typography>
                </Box>
              </Grid>
            ) : (
              feeTemplates.map(template => {
                const totalAmount = template.components.reduce(
                  (sum: number, c: any) => sum + (c.isActive ? c.amount : 0),
                  0
                )

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={template.id}>
                    <Card variant='outlined' sx={{ height: '100%', position: 'relative' }}>
                      {!template.isActive && (
                        <Chip
                          label='Non-Aktif'
                          color='default'
                          size='small'
                          sx={{ position: 'absolute', top: 12, right: 12 }}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                          <Box>
                            <Typography
                              variant='h6'
                              fontWeight={700}
                              color={template.isActive ? 'text.primary' : 'text.secondary'}
                            >
                              {template.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip label={template.academicYear} size='small' variant='outlined' />
                              <Chip
                                label={template.type === 'REGISTRATION' ? 'Pendaftaran' : 'Daftar Ulang'}
                                size='small'
                                color='primary'
                                variant='outlined'
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed', my: 4 }} />

                        <Box sx={{ mb: 4 }}>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Komponen Biaya:
                          </Typography>
                          {template.components.slice(0, 3).map((comp: any) => (
                            <Box key={comp.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant='body2' color='text.secondary'>
                                {comp.name}
                              </Typography>
                              <Typography variant='body2' fontWeight={600}>
                                {formatCurrency(comp.amount)}
                              </Typography>
                            </Box>
                          ))}
                          {template.components.length > 3 && (
                            <Typography variant='caption' color='primary' sx={{ cursor: 'pointer' }}>
                              + {template.components.length - 3} komponen lainnya
                            </Typography>
                          )}
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: 'action.hover',
                            p: 3,
                            borderRadius: 1
                          }}
                        >
                          <Typography variant='subtitle2' fontWeight={700}>
                            Total Biaya
                          </Typography>
                          <Typography variant='h6' fontWeight={800} color='primary'>
                            {formatCurrency(totalAmount)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <Divider />
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={template.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                          <IconButton
                            size='small'
                            color={template.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(template.id, template.isActive)}
                            disabled={loading === template.id}
                          >
                            <ChevronRight
                              size={20}
                              style={{ transform: template.isActive ? 'rotate(90deg)' : 'none' }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Hapus'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(template.id)}
                            disabled={loading === template.id}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </Tooltip>
                        <Button size='small' variant='outlined' startIcon={<Edit size={16} />} sx={{ ml: 1 }}>
                          Edit
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                )
              })
            )}
          </Grid>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Hapus Template'
        content='Apakah Anda yakin ingin menghapus template biaya ini? Tindakan ini tidak dapat dibatalkan.'
        isSubmitting={isDeleting}
      />
    </Box>
  )
}

export default TemplateList
