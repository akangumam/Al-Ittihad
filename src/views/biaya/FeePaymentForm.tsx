'use client'

import { useState, useEffect, useMemo } from 'react'

import { useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'
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
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import { toast } from 'react-toastify'

import { studentAPI, accountAPI, studentFeeAPI, feePaymentAPI, academicYearAPI } from '@/services/api'
import FeePaymentSuccessDialog from './FeePaymentSuccessDialog'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const FeePaymentForm = () => {
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedYear, setSelectedYear] = useState('')
  const [unpaidFees, setUnpaidFees] = useState<any[]>([])
  const [amount, setAmount] = useState<string | number>('')
  const [paymentMethod, setPaymentMethod] = useState('Tunai')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [transactionDate, setTransactionDate] = useState<Date | null>(new Date())
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studData, accData, yearsData] = await Promise.all([
          studentAPI.getAll(),
          accountAPI.getAll(),
          academicYearAPI.getAll()
        ])

        setStudents(studData)
        setAccounts(accData)
        setAcademicYears(yearsData)

        const activeYear = yearsData.find((y: any) => y.isActive)?.name

        if (activeYear) setSelectedYear(activeYear)

        const studentId = searchParams.get('studentId')

        if (studentId) {
          const student = studData.find((s: any) => s.id === studentId)

          if (student) setSelectedStudent(student)
        }
      } catch {
        toast.error('Gagal memuat data')
      }
    }

    fetchData()
  }, [searchParams])

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      studentFeeAPI.getByStudentId(selectedStudent.id, selectedYear).then(fees => {
        setUnpaidFees(fees.filter((f: any) => f.status !== 'Lunas'))
      })
    } else {
      setUnpaidFees([])
    }
  }, [selectedStudent, selectedYear])

  const previewAllocations = useMemo(() => {
    const payAmount = Number(amount) || 0
    let remaining = payAmount
    const allocations = []

    for (const fee of unpaidFees) {
      if (remaining <= 0) break
      const due = fee.amountDue - fee.amountPaid
      const allocate = Math.min(remaining, due)

      if (allocate > 0) {
        allocations.push({
          name: fee.category.name,
          amount: allocate,
          status: fee.amountPaid + allocate >= fee.amountDue ? 'Lunas' : 'Cicilan'
        })
        remaining -= allocate
      }
    }

    return { allocations, surplus: remaining }
  }, [amount, unpaidFees])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent || !amount || !selectedAccount || !selectedYear) {
      toast.error('Mohon lengkapi semua data')

      return
    }

    setIsSubmitting(true)

    try {
      const result = await feePaymentAPI.create({
        studentId: selectedStudent.id,
        amount: Number(amount),
        paymentDate: transactionDate?.toISOString(),
        account: selectedAccount,
        paymentMethod,
        academicYear: selectedYear,
        notes
      })

      setLastPaymentData({
        ...result.payment,
        studentName: selectedStudent.name,
        studentNIS: selectedStudent.nis,
        studentClass: `${selectedStudent.grade}${selectedStudent.class}`,
        allocations: result.allocations.map((a: any) => {
          const fee = unpaidFees.find(f => f.id === a.studentFeeId)

          return { name: fee?.category?.name, amount: a.amount }
        }),
        adminName: session?.user?.name || 'Admin'
      })

      setSuccessDialogOpen(true)
      toast.success('Pembayaran berhasil diproses')

      setAmount('')
      setNotes('')
      const fees = await studentFeeAPI.getByStudentId(selectedStudent.id, selectedYear)

      setUnpaidFees(fees.filter((f: any) => f.status !== 'Lunas'))
    } catch (error: any) {
      toast.error(error.message || 'Gagal memproses pembayaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant='h5' className='mbe-4'>
                  Catat Pembayaran
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={students}
                      getOptionLabel={option => `${option.nis} - ${option.name}`}
                      value={selectedStudent}
                      onChange={(_, newValue) => setSelectedStudent(newValue)}
                      renderInput={params => <TextField {...params} label='Pilih Siswa' size='small' />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Tahun Ajaran</InputLabel>
                      <Select label='Tahun Ajaran' value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {academicYears.map(y => (
                          <MenuItem key={y.id} value={y.name}>
                            {y.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Nominal Bayar'
                      size='small'
                      value={amount ? parseInt(amount.toString()).toLocaleString('id-ID') : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '')

                        setAmount(rawValue)
                      }}
                      placeholder='0'
                      slotProps={{ input: { startAdornment: <InputAdornment position='start'>Rp</InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Metode Pembayaran</InputLabel>
                      <Select
                        label='Metode Pembayaran'
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                        <MenuItem value='Tunai'>Tunai</MenuItem>
                        <MenuItem value='Transfer'>Transfer Bank</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Akun Tujuan</InputLabel>
                      <Select
                        label='Akun Tujuan'
                        value={selectedAccount}
                        onChange={e => setSelectedAccount(e.target.value)}
                      >
                        {accounts.map(acc => (
                          <MenuItem key={acc.id} value={acc.id}>
                            {acc.accountName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <AppReactDatepicker
                      selected={transactionDate}
                      onChange={(date: Date | null) => setTransactionDate(date)}
                      customInput={<TextField fullWidth size='small' label='Tanggal Transaksi' />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label='Catatan'
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardContent>
                <Typography variant='h6' className='mbe-4'>
                  Daftar Tagihan Belum Lunas
                </Typography>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Prio</TableCell>
                        <TableCell>Kategori</TableCell>
                        <TableCell align='right'>Total</TableCell>
                        <TableCell align='right'>Dibayar</TableCell>
                        <TableCell align='right'>Sisa</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidFees.map(fee => (
                        <TableRow key={fee.id}>
                          <TableCell>#{fee.category.priority}</TableCell>
                          <TableCell>{fee.category.name}</TableCell>
                          <TableCell align='right'>Rp {fee.amountDue.toLocaleString()}</TableCell>
                          <TableCell align='right'>Rp {fee.amountPaid.toLocaleString()}</TableCell>
                          <TableCell align='right' className='text-error font-medium'>
                            Rp {(fee.amountDue - fee.amountPaid).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {unpaidFees.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align='center'>
                            Tidak ada tagihan aktif
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' className='mbe-4'>
                  Preview Alokasi Pembayaran
                </Typography>
                {previewAllocations.allocations.length > 0 ? (
                  <div className='flex flex-col gap-4'>
                    {previewAllocations.allocations.map((alloc, idx) => (
                      <div key={idx} className='flex justify-between items-center border-b pb-2'>
                        <div>
                          <Typography variant='body2' className='font-medium'>
                            {alloc.name}
                          </Typography>
                          <small className={alloc.status === 'Lunas' ? 'text-success' : 'text-warning'}>
                            {alloc.status}
                          </small>
                        </div>
                        <Typography className='font-medium'>Rp {alloc.amount.toLocaleString()}</Typography>
                      </div>
                    ))}
                    {previewAllocations.surplus > 0 && (
                      <Alert severity='warning'>
                        Sisa pembayaran: Rp {previewAllocations.surplus.toLocaleString()} (Tidak dialokasikan)
                      </Alert>
                    )}
                    <Divider />
                    <div className='flex justify-between items-center'>
                      <Typography variant='h6'>Total Bayar</Typography>
                      <Typography variant='h5' color='primary' className='font-bold'>
                        Rp {Number(amount || 0).toLocaleString()}
                      </Typography>
                    </div>
                    <Button fullWidth variant='contained' size='large' type='submit' disabled={isSubmitting}>
                      {isSubmitting ? 'Memproses...' : 'Proses Pembayaran'}
                    </Button>
                  </div>
                ) : (
                  <Typography color='text.secondary'>Masukkan nominal untuk melihat alokasi</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      <FeePaymentSuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        data={lastPaymentData}
      />
    </>
  )
}

export default FeePaymentForm
