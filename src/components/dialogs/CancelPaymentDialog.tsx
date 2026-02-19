'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { toast } from 'react-toastify'

interface CancelPaymentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  paymentInfo?: {
    id: string
    studentName: string
    paymentMonth: string
    amount: number
  }
}

const CancelPaymentDialog = ({ open, onClose, onConfirm, paymentInfo }: CancelPaymentDialogProps) => {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Alasan pembatalan wajib diisi')

      return
    }

    if (reason.trim().length < 10) {
      setError('Alasan pembatalan minimal 10 karakter')

      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm(reason)
      toast.success('Pembayaran berhasil dibatalkan')
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal membatalkan pembayaran')
      toast.error(err.message || 'Gagal membatalkan pembayaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <div className='flex items-center gap-2 text-error'>
          <i className='ri-error-warning-line text-2xl' />
          <span>Batalkan Pembayaran SPP</span>
        </div>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' className='mbe-4'>
          <strong>Peringatan:</strong> Tindakan ini akan membatalkan pembayaran SPP dan mengembalikan saldo ke akun
          tujuan pembayaran. Pastikan Anda yakin sebelum melanjutkan.
        </Alert>

        {paymentInfo && (
          <div className='mbe-4 p-3 rounded bg-action-hover'>
            <Typography variant='body2' color='text.secondary' className='mbe-1'>
              Detail Pembayaran:
            </Typography>
            <Typography variant='body1' className='font-medium'>
              {paymentInfo.studentName}
            </Typography>
            <Typography variant='body2'>
              {paymentInfo.paymentMonth} - Rp {new Intl.NumberFormat('id-ID').format(paymentInfo.amount)}
            </Typography>
          </div>
        )}

        {error && (
          <Alert severity='error' className='mbe-4' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          label='Alasan Pembatalan *'
          placeholder='Jelaskan alasan pembatalan pembayaran ini...'
          value={reason}
          onChange={e => setReason(e.target.value)}
          error={!!error && !reason.trim()}
          helperText='Minimal 10 karakter. Alasan akan dicatat dalam log aktivitas.'
        />
      </DialogContent>

      <DialogActions className='p-4'>
        <Button onClick={handleClose} disabled={isSubmitting} color='secondary'>
          Batal
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting || !reason.trim()}
          color='error'
          variant='contained'
          startIcon={
            isSubmitting ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-delete-bin-line' />
          }
        >
          {isSubmitting ? 'Membatalkan...' : 'Batalkan Pembayaran'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelPaymentDialog
