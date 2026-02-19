'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { toast } from 'react-toastify'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

const AddExpenseForm = () => {
  // States
  const [date, setDate] = useState<Date | null | undefined>(new Date())
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [description, setDescription] = useState('')

  // Data states
  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch categories and accounts
        const [accountsRes, seedRes] = await Promise.all([fetch('/api/accounts'), fetch('/api/seed')])

        const accountsData = await accountsRes.json()
        const seedData = await seedRes.json()

        setAccounts(accountsData)

        // Filter categories for Expense type
        if (seedData.categories) {
          const expenseCategories = seedData.categories.filter((c: any) => c.type === 'EXPENSE')

          setCategories(expenseCategories)
        } else {
          // Fallback
          setCategories([
            { id: 'Gaji', name: 'Gaji & Honor' },
            { id: 'Operasional', name: 'Operasional Sekolah' },
            { id: 'Pemeliharaan', name: 'Pemeliharaan & Perbaikan' },
            { id: 'Aset', name: 'Pembelian Aset' },
            { id: 'Kegiatan', name: 'Kegiatan Siswa' },
            { id: 'ATK', name: 'ATK' },
            { id: 'Konsumsi', name: 'Konsumsi' },
            { id: 'Lainnya', name: 'Lainnya' }
          ])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !category || !account || !amount) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')

      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        date: date.toISOString(),
        amount: Number(amount),
        categoryId: category,
        accountId: account,
        description: description,
        recipient: recipient,
        invoiceNumber: invoiceNumber
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.error || 'Gagal menyimpan data pengeluaran')
      }

      toast.success('Data pengeluaran berhasil disimpan!')
      router.push(getLocalizedUrl('/keuangan/pengeluaran', locale as Locale))
    } catch (error: any) {
      console.error('Error submitting expense:', error)
      setSubmitError(error.message || 'Terjadi kesalahan saat menyimpan data')
      toast.error(error.message || 'Gagal menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <div className='flex items-center justify-between mbe-6'>
          <Typography variant='h4'>Catat Pengeluaran Baru</Typography>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              color='secondary'
              component={Link}
              href={getLocalizedUrl('/keuangan/pengeluaran', locale as Locale)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting && <i className='ri-loader-4-line animate-spin' />}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </Button>
          </div>
        </div>

        {submitError && (
          <Alert severity='error' className='mbe-6' onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        <Alert severity='warning' className='mbe-6'>
          <strong>Penting:</strong> Pastikan setiap pengeluaran memiliki bukti transaksi yang sah (Nota/Kwitansi) untuk
          keperluan audit.
        </Alert>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Tanggal Transaksi *</Typography>
                <AppReactDatepicker
                  selected={date}
                  onChange={(date: Date | null) => setDate(date)}
                  placeholderText='Pilih tanggal'
                  customInput={<TextField fullWidth size='small' />}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Kategori Pengeluaran *</Typography>
                <Select
                  fullWidth
                  size='small'
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  displayEmpty
                  disabled={isLoadingData}
                >
                  <MenuItem value='' disabled>
                    Pilih Kategori
                  </MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Sumber Dana (Kas/Bank) *</Typography>
                <Select
                  fullWidth
                  size='small'
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  displayEmpty
                  disabled={isLoadingData}
                >
                  <MenuItem value='' disabled>
                    Pilih Sumber Dana
                  </MenuItem>
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>
                      {acc.accountName} -{' '}
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(acc.balance)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Jumlah Pengeluaran *</Typography>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='0'
                  value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/\D/g, '')

                    setAmount(rawValue)
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                  }}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Penerima Dana (Vendor/Personil)</Typography>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Contoh: Toko Makmur / Pak Budi'
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Nomor Bukti/Kwitansi (Opsional)</Typography>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Contoh: KW-2025/11/001'
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Keterangan Detail</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder='Tuliskan detail pengeluaran...'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddExpenseForm
