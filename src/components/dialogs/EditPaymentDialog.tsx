'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import { toast } from 'react-toastify'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface EditPaymentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { amount: number; paymentDate: Date; notes: string }) => Promise<void>
  payment: {
    id: string
    studentName: string
    month: string
    year: string
    amount: number
    paymentDate: string
    notes?: string
  } | null
}

const EditPaymentDialog = ({ open, onClose, onConfirm, payment }: EditPaymentDialogProps) => {
  const [amount, setAmount] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date())
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (payment && open) {
      const amountStr = payment.amount.toString()

      setAmount(amountStr)
      setAmountDisplay(formatNumber(amountStr))
      setPaymentDate(new Date(payment.paymentDate))
      setNotes(payment.notes || '')
    }
  }, [payment, open])

  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numbers = inputValue.replace(/\D/g, '')

    setAmount(numbers)
    setAmountDisplay(formatNumber(numbers))
  }

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Jumlah pembayaran harus lebih dari 0')

      return
    }

    if (!paymentDate) {
      setError('Tanggal pembayaran wajib diisi')

      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm({
        amount: Number(amount),
        paymentDate: paymentDate,
        notes: notes
      })
      toast.success('Pembayaran berhasil diubah')
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah pembayaran')
      toast.error(err.message || 'Gagal mengubah pembayaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setAmountDisplay('')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!payment) return null

  const amountDiff = Number(amount) - payment.amount

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <div className='flex items-center gap-2'>
          <i className='ri-edit-line text-2xl' />
          <span>Edit Pembayaran SPP</span>
        </div>
      </DialogTitle>

      <DialogContent>
        <Alert severity='info' className='mbe-4'>
          <strong>Info:</strong> Perubahan akan tercatat dalam log aktivitas dan mempengaruhi saldo akun kas/bank.
        </Alert>

        <div className='mbe-4 p-3 rounded bg-action-hover'>
          <div className='font-medium'>{payment.studentName}</div>
          <div className='text-sm text-textSecondary'>
            {payment.month} {payment.year}
          </div>
        </div>

        {error && (
          <Alert severity='error' className='mbe-4' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          <div>
            <TextField
              fullWidth
              label='Jumlah Pembayaran *'
              value={amountDisplay}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
              }}
            />
            {amountDiff !== 0 && (
              <div className={`text-sm mt-1 ${amountDiff > 0 ? 'text-success' : 'text-error'}`}>
                {amountDiff > 0 ? '+' : ''}Rp {new Intl.NumberFormat('id-ID').format(Math.abs(amountDiff))} dari jumlah
                sebelumnya
              </div>
            )}
          </div>

          <AppReactDatepicker
            selected={paymentDate}
            onChange={(date: Date | null) => setPaymentDate(date)}
            placeholderText='Pilih tanggal'
            customInput={<TextField fullWidth label='Tanggal Pembayaran *' />}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label='Catatan'
            placeholder='Tambahkan catatan jika ada perubahan...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions className='p-4'>
        <Button onClick={handleClose} disabled={isSubmitting} color='secondary'>
          Batal
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          color='primary'
          variant='contained'
          startIcon={isSubmitting ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-save-line' />}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditPaymentDialog
