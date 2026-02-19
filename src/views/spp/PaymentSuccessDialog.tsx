'use client'

import { useRef } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useReactToPrint } from 'react-to-print'

import PaymentReceipt from './PaymentReceipt'

type PaymentSuccessDialogProps = {
  open: boolean
  onClose: () => void
  data: {
    transactionId: string
    date: string
    studentName: string
    studentNIS: string
    studentClass: string
    months: string[]
    amount: number
    paymentMethod: string
    adminName: string
  } | null
}

const PaymentSuccessDialog = ({ open, onClose, data }: PaymentSuccessDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Kwitansi-${data?.transactionId || 'SPP'}`,
    onAfterPrint: () => {
      // Optional: Close dialog after print?
      // onClose()
    }
  })

  if (!data) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        style: { borderRadius: '16px', overflow: 'hidden' }
      }}
    >
      <DialogContent className='p-0 overflow-hidden'>
        <div className='flex flex-col md:flex-row h-full min-h-[500px]'>
          {/* Left Side: Success Message & Actions */}
          <div className='w-full md:w-1/3 bg-primary p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden'>
            {/* Decorative Circles */}
            <div className='absolute top-[-50px] left-[-50px] w-32 h-32 rounded-full bg-white opacity-10'></div>
            <div className='absolute bottom-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white opacity-10'></div>

            <div className='w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 animate-bounce'>
              <i className='ri-check-line text-5xl font-bold'></i>
            </div>

            <Typography variant='h5' className='font-bold mb-2'>
              Pembayaran Berhasil!
            </Typography>
            <Typography variant='body2' className='opacity-90 mb-8'>
              Transaksi telah tercatat di sistem.
            </Typography>

            <div className='w-full flex flex-col gap-3'>
              <Button
                variant='contained'
                color='secondary' // White/Light button on primary bg
                className='bg-white text-primary hover:bg-gray-100 font-bold'
                fullWidth
                startIcon={<i className='ri-printer-line'></i>}
                onClick={handlePrint}
              >
                Cetak Kwitansi
              </Button>
              <Button
                variant='outlined'
                className='border-white text-white hover:bg-white/10'
                fullWidth
                onClick={onClose}
              >
                Tutup
              </Button>
            </div>
          </div>

          {/* Right Side: Receipt Preview */}
          <div className='w-full md:w-2/3 bg-gray-50 p-6 flex flex-col'>
            <Typography variant='h6' className='mb-4 text-gray-700 flex items-center gap-2'>
              <i className='ri-file-list-3-line'></i> Preview Kwitansi
            </Typography>

            <Box
              className='flex-grow overflow-auto bg-white rounded-lg shadow-sm border border-gray-200 p-2'
              style={{ maxHeight: '70vh' }}
            >
              <div className='transform scale-75 origin-top'>
                <PaymentReceipt ref={receiptRef} data={data} />
              </div>
            </Box>

            <Typography variant='caption' className='text-center text-gray-400 mt-4 block'>
              * Gunakan tombol Cetak untuk hasil terbaik
            </Typography>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentSuccessDialog
