/* cspell:disable */
'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'

// Context Imports

// Component Imports
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import { useAppContext } from '@/contexts/AppContext'
import PaymentSuccessDialog from './PaymentSuccessDialog'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

// ... (imports remain the same)

const SPPPaymentForm = () => {
  // Hooks
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { refreshData } = useAppContext()

  // States
  const [mounted, setMounted] = useState(false)
  const [transactionDate, setTransactionDate] = useState<Date | null | undefined>(new Date())
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [accountDestination, setAccountDestination] = useState('')
  const [notes, setNotes] = useState('')
  const [discount, setDiscount] = useState(0)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentName, setAttachmentName] = useState('')

  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState<any>(null)

  // Data states
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [sppPayments, setSppPayments] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const studentIdParam = searchParams.get('siswa')

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch students, accounts, and SPP rates in parallel
        const [studentsRes, accountsRes] = await Promise.all([fetch('/api/students'), fetch('/api/accounts')])

        if (!studentsRes.ok) {
          throw new Error('Gagal mengambil data siswa')
        }

        const studentsData = await studentsRes.json()
        const accountsData = accountsRes.ok ? await accountsRes.json() : []

        // Ensure studentsData is an array before mapping
        const studentsArray = Array.isArray(studentsData) ? studentsData : []

        if (!Array.isArray(studentsData)) {
          console.error('API Error: studentsData is not an array', studentsData)
          toast.error('Format data siswa tidak valid')
        }

        // Process students list with SPP amount
        // Simplified logic: Standard rates if not found
        const processedStudents = studentsArray.map((student: any) => {
          // Default rates logic (can be replaced with API data)
          let amount = 250000

          if (student.grade === '8') amount = 275000
          if (student.grade === '9') amount = 300000

          return {
            id: student.id,
            nis: student.nis,
            name: student.name,
            grade: student.grade,
            class: student.class,
            sppAmount: amount,
            sppStartDate: student.sppStartDate,
            enrollmentDate: student.enrollmentDate
          }
        })

        setStudentsList(processedStudents)
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data')
        setStudentsList([]) // Set empty list on error
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // Fetch payments when student is selected
  useEffect(() => {
    const fetchStudentPayments = async () => {
      if (!selectedStudent) {
        setSppPayments([])

        return
      }

      try {
        const response = await fetch(`/api/spp-payments?studentId=${selectedStudent.id}`)

        if (response.ok) {
          const data = await response.json()

          setSppPayments(data)
        }
      } catch (error) {
        console.error('Error fetching payments:', error)
      }
    }

    fetchStudentPayments()
  }, [selectedStudent])

  // Auto-select logic based on payment method
  useEffect(() => {
    if (paymentMethod === 'cash') {
      const cashAccount = accounts.find(
        acc => acc.accountName.toLowerCase().includes('kas tunai') || acc.accountName.toLowerCase().includes('tunai')
      )

      if (cashAccount) {
        setAccountDestination(cashAccount.id)
      }
    } else if (paymentMethod === 'transfer') {
      // If switching to transfer and current account is 'Tunai', clear it
      const currentAccount = accounts.find(a => a.id === accountDestination)

      if (
        currentAccount &&
        (currentAccount.accountName.toLowerCase().includes('tunai') ||
          currentAccount.accountName.toLowerCase().includes('kas tunai'))
      ) {
        setAccountDestination('')
      }
    }
  }, [paymentMethod, accounts, accountDestination])

  // Generate available months dynamically based on academic year and student's SPP start date
  const availableMonths = useMemo(() => {
    if (!selectedStudent) return []

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const monthNames = [
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

    // Academic year starts from July (index 6)
    const startMonth = 6
    const months = []

    // Get student's SPP start date or default to July of previous year
    let sppStartDate = new Date(currentYear - 1, startMonth, 1) // Default: July last year

    if (selectedStudent.sppStartDate) {
      sppStartDate = new Date(selectedStudent.sppStartDate)
    } else if (selectedStudent.enrollmentDate) {
      // Fallback to enrollment date if sppStartDate not set
      sppStartDate = new Date(selectedStudent.enrollmentDate)
    }

    const sppStartYear = sppStartDate.getFullYear()
    const sppStartMonthIndex = sppStartDate.getMonth()

    // Generate months from SPP start date to current month + 6 months ahead (future payments)
    const monthsSinceStart = (currentYear - sppStartYear) * 12 + (currentMonth - sppStartMonthIndex) + 6

    for (let i = 0; i <= monthsSinceStart; i++) {
      const monthIndex = (sppStartMonthIndex + i) % 12
      const year = sppStartYear + Math.floor((sppStartMonthIndex + i) / 12)
      const monthLabel = `${monthNames[monthIndex]} ${year}`

      // Check if this month is paid for the selected student
      const isPaid = sppPayments.some(p => p.month === monthNames[monthIndex] && p.year === year.toString())

      months.push({
        id: `${monthNames[monthIndex].toLowerCase()}-${year}`,
        label: monthLabel,
        month: monthNames[monthIndex],
        year: year.toString(),
        isPaid
      })
    }

    return months
  }, [selectedStudent, sppPayments])

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-select student from query param
  useEffect(() => {
    if (studentIdParam && studentsList.length > 0 && !selectedStudent) {
      const student = studentsList.find(s => s.id === studentIdParam)

      if (student) {
        setSelectedStudent(student)
      }
    }
  }, [studentIdParam, studentsList, selectedStudent])

  // Calculate total
  const selectedMonthsData = availableMonths.filter(m => selectedMonths.includes(m.id))
  const subtotal = selectedMonthsData.length * (selectedStudent?.sppAmount || 0)
  const totalAmount = subtotal - discount

  const handleMonthToggle = (monthId: string, isPaid: boolean) => {
    // Handle month selection toggle
    if (isPaid) return // Cannot select paid months

    const monthIndex = availableMonths.findIndex(m => m.id === monthId)

    if (monthIndex === -1) return

    const isCurrentlySelected = selectedMonths.includes(monthId)
    let newSelectedMonths = [...selectedMonths]

    if (isCurrentlySelected) {
      // Deselect: Deselect this month and all SUBSEQUENT selected months
      const monthsToDeselect = availableMonths.slice(monthIndex).map(m => m.id)

      newSelectedMonths = newSelectedMonths.filter(id => !monthsToDeselect.includes(id))
    } else {
      // Select: Select this month and all PREVIOUS unpaid months
      const monthsToSelect = availableMonths
        .slice(0, monthIndex + 1)
        .filter(m => !m.isPaid)
        .map(m => m.id)

      // Merge with existing selection
      const combined = new Set([...newSelectedMonths, ...monthsToSelect])

      newSelectedMonths = Array.from(combined)
    }

    setSelectedMonths(newSelectedMonths)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent || selectedMonths.length === 0 || !accountDestination) {
      toast.error('Lengkapi semua field yang diperlukan')

      return
    }

    if (paymentMethod === 'transfer' && !attachment) {
      toast.error('Silakan upload bukti transfer terlebih dahulu')

      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const transactionId = `SPP-${Date.now()}`
      const paymentDate = transactionDate?.toISOString() || new Date().toISOString()

      const formattedDate = new Date(paymentDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      // Process payments sequentially
      for (const monthId of selectedMonths) {
        const monthData = availableMonths.find(m => m.id === monthId)

        if (monthData) {
          const payload = {
            studentId: selectedStudent.id,
            month: monthData.month,
            year: monthData.year,
            amount: selectedStudent.sppAmount,
            paymentDate: paymentDate,
            accountId: accountDestination,
            paymentMethod: paymentMethod || 'Tunai',
            notes: notes,
            attachment: attachmentName // Send filename or simulated path
          }

          const response = await fetch('/api/spp-payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))

            throw new Error(errorData.error || `Gagal memproses pembayaran bulan ${monthData.month} ${monthData.year}`)
          }
        }
      }

      // Prepare data for receipt
      const orderedSelectedMonths = availableMonths.filter(m => selectedMonths.includes(m.id)).map(m => m.label)

      const receiptData = {
        transactionId: transactionId,
        date: formattedDate,
        studentName: selectedStudent.name,
        studentNIS: selectedStudent.nis,
        studentClass: `${selectedStudent.grade}${selectedStudent.class}`,
        months: orderedSelectedMonths,
        amount: totalAmount,
        paymentMethod: paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'EDC',
        adminName: session?.user?.name || 'Admin'
      }

      setLastPaymentData(receiptData)
      setSuccessDialogOpen(true)
      toast.success('Pembayaran berhasil diproses!')

      // Refresh global context data
      refreshData()

      // Reset form
      setSelectedStudent(null)
      setSelectedMonths([])
      setPaymentMethod('')
      setAccountDestination('')
      setNotes('')
      setDiscount(0)

      // Refresh accounts data to update balance
      const accountsRes = await fetch('/api/accounts')

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()

        setAccounts(accountsData)
      }
    } catch (error: any) {
      console.error('Error processing payment:', error)
      setSubmitError(error.message || 'Terjadi kesalahan saat memproses pembayaran')
      toast.error(error.message || 'Gagal memproses pembayaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Early return for SSR - prevent hydration issues
  if (!mounted) {
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={6}>
        {/* Form Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              {/* Error Alert */}
              {submitError && (
                <Alert severity='error' className='mbe-6' onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}

              <Alert severity='info' className='mbe-6'>
                <strong>Informasi:</strong> Sistem akan otomatis generate nomor transaksi dan kwitansi pembayaran.
                Pastikan data yang diinput sudah benar sebelum menekan tombol &quot;Proses Pembayaran&quot;.
              </Alert>

              <Grid container spacing={6}>
                {/* Tanggal Transaksi */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <Typography className='mbe-2'>Tanggal Transaksi *</Typography>
                    <AppReactDatepicker
                      selected={transactionDate}
                      id='payment-date'
                      onChange={(date: Date | null) => setTransactionDate(date)}
                      placeholderText='Pilih tanggal'
                      customInput={<TextField fullWidth size='small' id='payment-date-input' />}
                    />
                  </FormControl>
                </Grid>

                {/* Pilih Siswa */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <Typography className='mbe-2'>Pilih Siswa *</Typography>
                    <Autocomplete
                      id='student-autocomplete'
                      options={studentsList}
                      getOptionLabel={option => `${option.nis} - ${option.name} (${option.grade}${option.class})`}
                      value={selectedStudent}
                      onChange={(_, newValue) => setSelectedStudent(newValue)}
                      loading={isLoadingData}
                      renderInput={params => (
                        <TextField
                          {...params}
                          id='student-search-input'
                          size='small'
                          placeholder='Cari NIS atau Nama...'
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingData ? <i className='ri-loader-4-line animate-spin' /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <div className='flex flex-col'>
                            <Typography variant='body2' className='font-medium'>
                              {option.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              NIS: {option.nis} | Kelas: {option.grade}
                              {option.class}
                            </Typography>
                          </div>
                        </li>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Pilih Bulan Pembayaran */}
                <Grid size={{ xs: 12 }}>
                  <Typography className='mbe-2'>Pilih Bulan Pembayaran *</Typography>
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell padding='checkbox'>Pilih</TableCell>
                          <TableCell>Periode</TableCell>
                          <TableCell align='right'>Nominal</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableMonths.map(month => (
                          <TableRow
                            key={month.id}
                            hover
                            onClick={() => handleMonthToggle(month.id, month.isPaid)}
                            sx={{ cursor: month.isPaid ? 'not-allowed' : 'pointer' }}
                          >
                            <TableCell padding='checkbox'>
                              <Checkbox
                                checked={selectedMonths.includes(month.id)}
                                disabled={month.isPaid}
                                style={{ pointerEvents: 'none' }}
                              />
                            </TableCell>
                            <TableCell>{month.label}</TableCell>
                            <TableCell align='right'>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0
                              }).format(selectedStudent?.sppAmount || 0)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={month.isPaid ? 'Lunas' : 'Belum Lunas'}
                                size='small'
                                color={month.isPaid ? 'success' : 'warning'}
                                variant='tonal'
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Metode Pembayaran */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel size='small' id='payment-method-label'>
                      Metode Pembayaran *
                    </InputLabel>
                    <Select
                      size='small'
                      id='payment-method'
                      labelId='payment-method-label'
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      label='Metode Pembayaran *'
                    >
                      <MenuItem value='cash'>Tunai</MenuItem>
                      <MenuItem value='transfer'>Transfer Bank</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel size='small' id='account-destination-label'>
                      Akun Tujuan *
                    </InputLabel>
                    <Select
                      size='small'
                      id='account-destination'
                      labelId='account-destination-label'
                      value={accountDestination}
                      onChange={e => setAccountDestination(e.target.value)}
                      label='Akun Tujuan *'
                      disabled={paymentMethod === 'cash'}
                    >
                      {accounts.filter(acc => acc.isActive).length > 0 ? (
                        accounts
                          .filter(acc => {
                            if (!acc.isActive) return false

                            const isTunai =
                              acc.accountName.toLowerCase().includes('kas tunai') ||
                              acc.accountName.toLowerCase().includes('tunai')

                            if (paymentMethod === 'cash') {
                              return isTunai
                            }

                            if (paymentMethod === 'transfer') {
                              return !isTunai
                            }

                            return true
                          })
                          .map(acc => (
                            <MenuItem key={acc.id} value={acc.id}>
                              {acc.accountName} - Saldo:{' '}
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0
                              }).format(acc.balance)}
                            </MenuItem>
                          ))
                      ) : (
                        <MenuItem value='' disabled>
                          Tidak ada akun aktif
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Bukti Transfer Pembayaran */}
                {paymentMethod === 'transfer' && (
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <Typography className='mbe-2'>Bukti Transfer (Screenshot/Foto) *</Typography>
                      <div className='flex items-center gap-4 p-4 border rounded border-dashed'>
                        <Button
                          component='label'
                          variant='outlined'
                          size='small'
                          startIcon={<i className='ri-upload-2-line' />}
                        >
                          Upload Bukti
                          <input
                            type='file'
                            hidden
                            accept='image/*'
                            onChange={e => {
                              const file = e.target.files?.[0]

                              if (file) {
                                setAttachment(file)
                                setAttachmentName(file.name)
                              }
                            }}
                          />
                        </Button>
                        <Typography variant='body2' color={attachmentName ? 'text.primary' : 'text.secondary'}>
                          {attachmentName || 'Belum ada file terpilih'}
                        </Typography>
                      </div>
                    </FormControl>
                  </Grid>
                )}

                {/* Potongan/Diskon */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size='small'
                    id='discount-input'
                    label='Potongan/Diskon (Opsional)'
                    type='number'
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    inputProps={{ min: 0, max: subtotal }}
                  />
                </Grid>

                {/* Catatan */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id='notes-input'
                    label='Catatan (Opsional)'
                    placeholder='Tambahkan catatan jika diperlukan...'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' className='mbe-4'>
                Ringkasan Pembayaran
              </Typography>

              {selectedStudent ? (
                <div className='flex flex-col gap-3 mbe-4'>
                  <div className='p-3 rounded bg-action-hover'>
                    <Typography variant='caption' color='text.secondary' className='block mbe-1'>
                      Data Siswa
                    </Typography>
                    <Typography variant='body2' className='font-medium'>
                      {selectedStudent.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      NIS: {selectedStudent.nis} | Kelas: {selectedStudent.grade}
                      {selectedStudent.class}
                    </Typography>
                  </div>
                </div>
              ) : (
                <Alert severity='warning' className='mbe-4'>
                  Pilih siswa terlebih dahulu
                </Alert>
              )}

              <Divider className='mbe-4' />

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Bulan Terpilih:
                  </Typography>
                  <Typography variant='body2' className='font-medium'>
                    {selectedMonths.length} bulan
                  </Typography>
                </div>

                {selectedMonthsData.length > 0 && (
                  <div className='flex flex-wrap gap-1 mbe-2'>
                    {selectedMonthsData.map(month => (
                      <Chip key={month.id} label={month.label} size='small' variant='tonal' color='primary' />
                    ))}
                  </div>
                )}

                <Divider />

                <div className='flex justify-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Subtotal:
                  </Typography>
                  <Typography variant='body2' className='font-medium'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0
                    }).format(subtotal)}
                  </Typography>
                </div>

                {discount > 0 && (
                  <div className='flex justify-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Potongan:
                    </Typography>
                    <Typography variant='body2' className='text-error'>
                      -
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                      }).format(discount)}
                    </Typography>
                  </div>
                )}

                <Divider />

                <div className='flex justify-between items-center'>
                  <Typography variant='h6'>Total Bayar:</Typography>
                  <Typography variant='h5' className='font-medium text-primary'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0
                    }).format(totalAmount)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedMonths.length > 0 && (
            <Card className='mbs-6'>
              <CardContent>
                <div className='flex items-center gap-2 mbe-4'>
                  <i className='ri-printer-line text-xl text-primary' />
                  <Typography variant='h6'>Preview Kwitansi</Typography>
                </div>
                <Alert severity='success'>
                  <Typography variant='caption'>
                    ✅ Kwitansi akan otomatis di-generate setelah pembayaran berhasil diproses dan dapat langsung
                    dicetak.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Sticky Action Buttons */}
      <div className='sticky bottom-0 z-10 bg-backgroundPaper border-t border-[var(--mui-palette-divider)] mbs-6 p-4 flex justify-end gap-3 shadow-lg'>
        <Button
          variant='outlined'
          color='secondary'
          component={Link}
          href={getLocalizedUrl('/spp/pembayaran', locale as Locale)}
          size='large'
        >
          Batal
        </Button>
        <Button
          variant='contained'
          type='submit'
          disabled={!selectedStudent || selectedMonths.length === 0 || isSubmitting}
          startIcon={isSubmitting ? <i className='ri-loader-4-line animate-spin' /> : null}
          size='large'
        >
          {isSubmitting ? 'Memproses...' : 'Proses Pembayaran'}
        </Button>
      </div>

      <PaymentSuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        data={lastPaymentData}
      />
    </form>
  )
}

export default SPPPaymentForm
