/* cspell:disable */
'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'

// Third-party Imports
import Papa from 'papaparse'

// Component Imports
import { useAppContext } from '@/contexts/AppContext'

type ImportSPPPaymentModalProps = {
  open: boolean
  onClose: () => void
}

type ParsedPayment = {
  nis: string
  studentName?: string
  month: string
  year: string
  paymentDate: string
  amount: number
  paymentMethod: string
  status?: 'valid' | 'invalid'
  error?: string
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const ImportSPPPaymentModal = ({ open, onClose }: ImportSPPPaymentModalProps) => {
  const [parsedData, setParsedData] = useState<ParsedPayment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { students, addSPPPayment, accounts } = useAppContext()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError(null)
    setIsProcessing(true)

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const headerMap: { [key: string]: string } = {
            NIS: 'nis',
            Bulan: 'month',
            Tahun: 'year',
            'Tanggal Bayar': 'paymentDate',
            Jumlah: 'amount',
            'Metode Pembayaran': 'paymentMethod'
          }

          const validMonths = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember'
          ]

          const payments: ParsedPayment[] = results.data.map((row: any) => {
            const mappedRow: any = {}

            Object.keys(row).forEach(key => {
              const mappedKey = headerMap[key.trim()]

              if (mappedKey) {
                mappedRow[mappedKey] = row[key]
              }
            })

            // Validation
            const errors: string[] = []

            // Find student
            const student = students.find(s => s.nis === mappedRow.nis?.trim())

            if (!student) {
              errors.push(`Siswa dengan NIS ${mappedRow.nis} tidak ditemukan`)
            }

            // Validate month
            if (!validMonths.includes(mappedRow.month?.trim())) {
              errors.push(`Bulan tidak valid: ${mappedRow.month}`)
            }

            // Validate year
            const year = parseInt(mappedRow.year)

            if (!year || year < 2020 || year > 2030) {
              errors.push(`Tahun tidak valid: ${mappedRow.year}`)
            }

            // Validate amount
            const amount = parseFloat(mappedRow.amount?.replace(/\./g, '').replace(',', '.'))

            if (!amount || amount <= 0) {
              errors.push(`Jumlah tidak valid: ${mappedRow.amount}`)
            }

            // Validate payment method
            const validMethods = ['Tunai', 'Transfer', 'EDC']

            if (!validMethods.includes(mappedRow.paymentMethod?.trim())) {
              errors.push(`Metode pembayaran tidak valid: ${mappedRow.paymentMethod}`)
            }

            return {
              nis: mappedRow.nis?.trim() || '',
              studentName: student?.name,
              month: mappedRow.month?.trim() || '',
              year: mappedRow.year?.trim() || '',
              paymentDate: mappedRow.paymentDate?.trim() || '',
              amount: amount || 0,
              paymentMethod: mappedRow.paymentMethod?.trim() || '',
              status: errors.length > 0 ? 'invalid' : 'valid',
              error: errors.length > 0 ? errors.join(', ') : undefined
            }
          })

          setParsedData(payments)
          setIsProcessing(false)
        } catch {
          setError('Terjadi kesalahan saat memproses file')
          setIsProcessing(false)
        }
      },
      error: () => {
        setError('Gagal membaca file CSV')
        setIsProcessing(false)
      }
    })
  }

  const handleImport = () => {
    const validPayments = parsedData.filter(p => p.status === 'valid')

    if (validPayments.length === 0) {
      setError('Tidak ada data valid untuk diimport')

      return
    }

    // Find default account
    const defaultAccount = accounts.find(acc => acc.isActive)

    if (!defaultAccount) {
      setError('Tidak ada akun aktif. Silakan buat akun terlebih dahulu di Pengaturan > Akun Kas & Bank')

      return
    }

    setIsProcessing(true)

    validPayments.forEach(payment => {
      const student = students.find(s => s.nis === payment.nis)

      if (student) {
        // Parse date DD/MM/YYYY to ISO
        const [day, month, year] = payment.paymentDate.split('/')
        const isoDate = new Date(`${year}-${month}-${day}`).toISOString()

        addSPPPayment({
          studentId: student.id,
          studentName: student.name,
          month: payment.month,
          year: payment.year,
          amount: payment.amount,
          paymentDate: isoDate,
          account: defaultAccount.id,
          paymentMethod: payment.paymentMethod
        })
      }
    })

    setIsProcessing(false)
    alert(
      `✅ Import berhasil!\n\n${validPayments.length} pembayaran telah ditambahkan ke sistem.\n\nData pembayaran sekarang sudah tersinkronisasi!`
    )
    onClose()
  }

  const downloadTemplate = () => {
    const headers = ['NIS', 'Bulan', 'Tahun', 'Tanggal Bayar', 'Jumlah', 'Metode Pembayaran']

    const sampleData = [
      ['2024001', 'Juli', '2024', '15/07/2024', '250000', 'Tunai'],
      ['2024001', 'Agustus', '2024', '15/08/2024', '250000', 'Transfer'],
      ['2024002', 'Juli', '2024', '20/07/2024', '250000', 'Tunai']
    ]

    const csvContent = [headers.join(';'), ...sampleData.map(row => row.join(';'))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    link.href = URL.createObjectURL(blob)
    link.download = 'template_riwayat_pembayaran_spp.csv'
    link.click()
  }

  const handleClose = () => {
    setParsedData([])
    setError(null)
    onClose()
  }

  const validCount = parsedData.filter(p => p.status === 'valid').length
  const invalidCount = parsedData.filter(p => p.status === 'invalid').length

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle>Import Riwayat Pembayaran SPP</DialogTitle>
      <DialogContent>
        <Alert severity='info' className='mbe-4'>
          <Typography variant='body2' className='font-medium mbe-2'>
            📋 Format File CSV:
          </Typography>
          <Typography variant='caption' component='div'>
            • Delimiter: <strong>Semicolon (;)</strong>
            <br />
            • Header: NIS; Bulan; Tahun; Tanggal Bayar; Jumlah; Metode Pembayaran
            <br />
            • Bulan: Nama bulan dalam Bahasa Indonesia (contoh: Juli, Agustus)
            <br />
            • Tanggal Bayar: Format DD/MM/YYYY (contoh: 15/07/2024)
            <br />
            • Metode Pembayaran: Tunai, Transfer, atau EDC
            <br />• Download template untuk contoh format yang benar
          </Typography>
        </Alert>

        <div className='flex gap-2 mbe-6'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={downloadTemplate}
            startIcon={<i className='ri-download-line' />}
          >
            Download Template
          </Button>
          <Button variant='contained' component='label' startIcon={<i className='ri-upload-line' />}>
            Pilih File CSV
            <VisuallyHiddenInput type='file' accept='.csv' onChange={handleFileUpload} />
          </Button>
        </div>

        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}

        {isProcessing && (
          <div className='mbe-4'>
            <Typography variant='body2' className='mbe-2'>
              Memproses file...
            </Typography>
            <LinearProgress />
          </div>
        )}

        {parsedData.length > 0 && (
          <>
            <Alert severity={invalidCount > 0 ? 'warning' : 'success'} className='mbe-4'>
              <Typography variant='body2'>
                ✅ Data Valid: <strong>{validCount}</strong> pembayaran
                {invalidCount > 0 && (
                  <>
                    <br />❌ Data Invalid: <strong>{invalidCount}</strong> pembayaran (akan diabaikan)
                  </>
                )}
              </Typography>
            </Alert>

            <TableContainer component={Paper} variant='outlined' sx={{ maxHeight: 400 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>NIS</TableCell>
                    <TableCell>Nama Siswa</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Tanggal Bayar</TableCell>
                    <TableCell align='right'>Jumlah</TableCell>
                    <TableCell>Metode</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((payment, index) => (
                    <TableRow
                      key={index}
                      sx={{ backgroundColor: payment.status === 'invalid' ? 'error.lighter' : 'inherit' }}
                    >
                      <TableCell>
                        <Chip
                          label={payment.status === 'valid' ? 'Valid' : 'Invalid'}
                          size='small'
                          color={payment.status === 'valid' ? 'success' : 'error'}
                          variant='tonal'
                        />
                      </TableCell>
                      <TableCell>{payment.nis}</TableCell>
                      <TableCell>{payment.studentName || '-'}</TableCell>
                      <TableCell>
                        {payment.month} {payment.year}
                      </TableCell>
                      <TableCell>{payment.paymentDate}</TableCell>
                      <TableCell align='right'>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        {payment.error && (
                          <Typography variant='caption' color='error'>
                            {payment.error}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          Batal
        </Button>
        <Button
          variant='contained'
          onClick={handleImport}
          disabled={parsedData.length === 0 || validCount === 0 || isProcessing}
        >
          Import {validCount > 0 && `(${validCount} Data)`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportSPPPaymentModal
