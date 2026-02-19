'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import LinearProgress from '@mui/material/LinearProgress'
import { DollarSign, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

import { toast } from 'react-toastify'

import { useAppContext } from '@/contexts/AppContext'
import { priorityFeePaymentAPI } from '@/services/api'

interface PaymentFormProps {
  studentFeeId: string
  onSuccess?: () => void
}

const PaymentForm = ({ studentFeeId, onSuccess }: PaymentFormProps) => {
  const { accounts, refreshData } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [breakdown, setBreakdown] = useState<any>(null)
  const [preview, setPreview] = useState<any>(null)

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    account: '',
    receiptNo: `RCT-${Date.now()}`,
    notes: '',
    paidBy: ''
  })

  const loadBreakdown = useCallback(async () => {
    try {
      setLoading(true)
      const data = await priorityFeePaymentAPI.getBreakdown(studentFeeId)

      setBreakdown(data)

      if (accounts.length > 0) {
        setPaymentData(prev => ({ ...prev, account: accounts[0].id }))
      }
    } catch {
      toast.error('Gagal memuat detail tagihan')
    } finally {
      setLoading(false)
    }
  }, [studentFeeId, accounts])

  useEffect(() => {
    loadBreakdown()
  }, [loadBreakdown])

  const handleSimulate = useCallback(async () => {
    try {
      const data = await priorityFeePaymentAPI.simulate(studentFeeId, parseFloat(paymentData.amount))

      setPreview(data.preview)
    } catch (_error) {
      console.error('Simulation failed', _error)
    }
  }, [studentFeeId, paymentData.amount])

  // Update preview when amount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (paymentData.amount && parseFloat(paymentData.amount) > 0) {
        handleSimulate()
      } else {
        setPreview(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [paymentData.amount, handleSimulate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Gagal: Masukkan nominal pembayaran')

      return
    }

    try {
      setLoading(true)

      await priorityFeePaymentAPI.process({
        studentFeeId,
        amount: parseFloat(paymentData.amount),
        paymentData: {
          ...paymentData,
          amount: parseFloat(paymentData.amount)
        }
      })

      toast.success('Pembayaran berhasil diproses!')
      refreshData()
      loadBreakdown()
      setPaymentData(prev => ({ ...prev, amount: '', receiptNo: `RCT-${Date.now()}` }))
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Gagal memproses pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totals = useMemo(() => {
    if (!breakdown) return { totalPaid: 0, totalAmount: 0, progress: 0, remainingTotal: 0 }

    const totalPaid = breakdown.fee.paidAmount
    const totalAmount = breakdown.fee.totalAmount
    const progress = (totalPaid / totalAmount) * 100
    const remainingTotal = totalAmount - totalPaid

    return { totalPaid, totalAmount, progress, remainingTotal }
  }, [breakdown])

  if (!breakdown) return <LinearProgress />

  return (
    <Grid container spacing={6}>
      {/* LEFT: Payment Form */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card component='form' onSubmit={handleSubmit}>
          <CardHeader
            title='Proses Pembayaran'
            avatar={<DollarSign size={20} />}
            subheader={`Pembayaran untuk ${breakdown.fee.template.name}`}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 4, p: 4, bgcolor: 'primary.light', borderRadius: 1, color: 'primary.contrastText' }}>
                  <Typography variant='body2' color='inherit' sx={{ opacity: 0.8 }}>
                    Sisa Tagihan:
                  </Typography>
                  <Typography variant='h3' fontWeight={800} color='inherit'>
                    {formatCurrency(totals.remainingTotal)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Nominal Bayar'
                  value={paymentData.amount ? parseInt(paymentData.amount.toString()).toLocaleString('id-ID') : ''}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/\D/g, '')

                    setPaymentData({ ...paymentData, amount: rawValue })
                  }}
                  placeholder='0'
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                  }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Tanggal'
                  type='date'
                  value={paymentData.paymentDate}
                  onChange={e => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label='Metode Bayar'
                  value={paymentData.paymentMethod}
                  onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  required
                >
                  <MenuItem value='Cash'>Tunai (Cash)</MenuItem>
                  <MenuItem value='Transfer'>Transfer Bank</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label='Akun Kas/Bank'
                  value={paymentData.account}
                  onChange={e => setPaymentData({ ...paymentData, account: e.target.value })}
                  required
                >
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Nama Penyetor'
                  placeholder='Nama orang tua/siswa'
                  value={paymentData.paidBy}
                  onChange={e => setPaymentData({ ...paymentData, paidBy: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='No. Kwitansi'
                  value={paymentData.receiptNo}
                  onChange={e => setPaymentData({ ...paymentData, receiptNo: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Catatan'
                  value={paymentData.notes}
                  onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box sx={{ p: 4, textAlign: 'right' }}>
            <Button
              variant='contained'
              size='large'
              type='submit'
              loading={loading}
              startIcon={<CheckCircle2 size={18} />}
              disabled={!paymentData.amount || parseFloat(paymentData.amount) <= 0}
            >
              Proses & Cetak Kwitansi
            </Button>
          </Box>
        </Card>
      </Grid>

      {/* RIGHT: Status & Allocation Preview */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='Informasi Alokasi' avatar={<FileText size={20} />} />
          <Divider />
          <CardContent>
            {/* Payment Progress */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  Progress Pelunasan
                </Typography>
                <Typography variant='subtitle2' fontWeight={700} color='primary'>
                  {totals.progress.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress variant='determinate' value={totals.progress} sx={{ height: 10, borderRadius: 5 }} />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 2, textAlign: 'center' }}
              >
                Terkumpul: {formatCurrency(totals.totalPaid)} / {formatCurrency(totals.totalAmount)}
              </Typography>
            </Box>

            {/* Allocation Simulation Preview */}
            {preview && (
              <Box
                sx={{
                  mb: 6,
                  p: 4,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'success.main'
                }}
              >
                <Typography
                  variant='subtitle2'
                  fontWeight={700}
                  color='success.dark'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ArrowRight size={14} /> Preview Alokasi Pembayaran
                </Typography>
                <List dense disablePadding>
                  {preview.map((p: any, idx: number) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant='body2' fontWeight={600}>
                            {p.componentName}
                          </Typography>
                        }
                        secondary={
                          p.isFullyPaid ? (
                            <Chip
                              label='LUNAS'
                              color='success'
                              size='small'
                              variant='outlined'
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          ) : (
                            'Terbayar Sebagian'
                          )
                        }
                      />
                      <Typography variant='body2' fontWeight={700}>
                        +{formatCurrency(p.amountAllocated)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Component Status List */}
            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              Status Per Komponen (Prioritas):
            </Typography>
            <List sx={{ mt: 2 }}>
              {breakdown.components.map((c: any) => {
                const cProgress = (c.paidAmount / c.amount) * 100
                const isPaid = c.status === 'LUNAS'
                const isPartial = c.status === 'SEBAGIAN'

                return (
                  <Box key={c.id} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant='body2' fontWeight={600}>
                          {c.priority}. {c.name}
                        </Typography>
                        {isPaid ? (
                          <Chip
                            label='Lunas'
                            color='success'
                            size='small'
                            variant='outlined'
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        ) : isPartial ? (
                          <Chip
                            label='Mencicil'
                            color='warning'
                            size='small'
                            variant='outlined'
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        ) : null}
                      </Box>
                      <Typography variant='caption' fontWeight={700}>
                        {formatCurrency(c.paidAmount)} / {formatCurrency(c.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={cProgress}
                      color={isPaid ? 'success' : isPartial ? 'warning' : 'inherit'}
                      sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover' }}
                    />
                  </Box>
                )
              })}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PaymentForm
