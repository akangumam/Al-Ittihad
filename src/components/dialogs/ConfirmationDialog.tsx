'use client'

// React Imports

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'

// Type Imports
import type { ThemeColor } from '@core/types'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  color?: ThemeColor
  icon?: string
  isSubmitting?: boolean
}

// Styled Components
const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    overflow: 'visible',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2)
  }
}))

const IconWrapper = styled(motion.div)<{ color: ThemeColor }>(({ color, theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  backgroundColor: `var(--mui-palette-${color}-lighterOpacity)`,
  color: `var(--mui-palette-${color}-main)`,
  '& i': {
    fontSize: '3.5rem'
  }
}))

const ConfirmationDialog = ({
  open,
  setOpen,
  onConfirm,
  title = 'Konfirmasi Hapus',
  content = 'Apakah Anda yakin ingin menghapus data ini?',
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  color = 'error',
  icon = 'ri-delete-bin-7-line',
  isSubmitting = false
}: ConfirmationDialogProps) => {
  const handleClose = () => {
    if (!isSubmitting) setOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <CustomDialog fullWidth open={open} onClose={handleClose} maxWidth='xs' scroll='body'>
      <DialogContent className='flex items-center flex-col text-center pbs-10 pbe-6 pli-10'>
        <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
          <i className='ri-close-line' />
        </IconButton>

        <AnimatePresence>
          {open && (
            <IconWrapper
              color={color}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <i className={icon} />
            </IconWrapper>
          )}
        </AnimatePresence>

        <Typography variant='h4' className='mbe-2'>
          {title}
        </Typography>
        <Typography color='text.secondary'>{content}</Typography>
      </DialogContent>
      <DialogActions className='justify-center pbs-0 pbe-10 pli-10 gap-3'>
        <Button variant='outlined' color='secondary' onClick={handleClose} disabled={isSubmitting}>
          {cancelText}
        </Button>
        <Button
          variant='contained'
          color={color}
          onClick={handleConfirm}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <i className='ri-loader-4-line animate-spin' /> : null}
        >
          {isSubmitting ? 'Memproses...' : confirmText}
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default ConfirmationDialog
