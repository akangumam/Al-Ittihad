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

const AddIncomeForm = () => {
  // States
  const [date, setDate] = useState<Date | null | undefined>(new Date())
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('') // Raw number value
  const [amountDisplay, setAmountDisplay] = useState('') // Formatted display value
  const [description, setDescription] = useState('')

  // Data states
  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Format number with thousand separator
  const formatNumber = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '')

    // Format with thousand separator (Indonesian format: 1.000.000)
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Handle amount change with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numbers = inputValue.replace(/\D/g, '') // Get only numbers

    setAmount(numbers) // Store raw number
    setAmountDisplay(formatNumber(numbers)) // Store formatted display
  }

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

        // Filter categories for Income type
        if (seedData.categories) {
          const incomeCategories = seedData.categories.filter((c: any) => c.type === 'INCOME')

          setCategories(incomeCategories)
        } else {
          // Fallback if seed endpoint doesn't return categories directly
          setCategories([
            { id: 'BOS', name: 'Dana BOS' },
            { id: 'Infak', name: 'Infak' },
            { id: 'Donasi', name: 'Donasi' },
            { id: 'Sewa', name: 'Sewa Aset/Kantin' },
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

    // Validate amount is a valid number
    const numAmount = Number(amount)

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah pemasukan harus lebih dari 0')

      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        date: date.toISOString(),
        amount: numAmount,
        categoryId: category,
        accountId: account,
        description: description || ''
      }

      console.log('Sending payload:', payload)

      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.error || 'Gagal menyimpan data pemasukan')
      }

      toast.success('Data pemasukan berhasil disimpan!')
      router.push(getLocalizedUrl('/keuangan/pemasukan', locale as Locale))
    } catch (error: any) {
      console.error('Error submitting income:', error)
      setSubmitError(error.message || 'Terjadi kesalahan saat menyimpan data')
      toast.error(error.message || 'Gagal menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Alert severity='info' className='mbe-6'>
            <strong>Info:</strong> Halaman ini untuk mencatat pemasukan selain SPP, seperti donasi, infaq, uang pangkal,
            denda, dan pemasukan lainnya.
          </Alert>

          {submitError && (
            <Alert severity='error' className='mbe-6' onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Tanggal Transaksi *</Typography>
                <AppReactDatepicker
                  selected={date}
                  onChange={(date: Date | null) => setDate(date)}
                  placeholderText='Pilih tanggal'
                  customInput={<TextField id='income-date-input' fullWidth size='small' />}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Kategori Pemasukan *</Typography>
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
                <Typography className='mbe-2'>Akun Tujuan (Kas/Bank) *</Typography>
                <Select
                  fullWidth
                  size='small'
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  displayEmpty
                  disabled={isLoadingData}
                >
                  <MenuItem value='' disabled>
                    Pilih Akun
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
                <Typography className='mbe-2'>Jumlah Pemasukan *</Typography>
                <TextField
                  id='income-amount'
                  fullWidth
                  size='small'
                  placeholder='0'
                  value={amountDisplay}
                  onChange={handleAmountChange}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
                  }}
                />
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth>
                <Typography className='mbe-2'>Keterangan</Typography>
                <TextField
                  id='income-description'
                  fullWidth
                  multiline
                  rows={3}
                  placeholder='Tuliskan detail pemasukan...'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sticky Action Buttons */}
      <div className='sticky bottom-0 z-10 bg-backgroundPaper border-t border-[var(--mui-palette-divider)] mbs-6 p-4 flex justify-end gap-3 shadow-lg'>
        <Button
          variant='outlined'
          color='secondary'
          component={Link}
          href={getLocalizedUrl('/keuangan/pemasukan', locale as Locale)}
          disabled={isSubmitting}
          size='large'
        >
          Batal
        </Button>
        <Button
          variant='contained'
          type='submit'
          disabled={isSubmitting}
          startIcon={isSubmitting ? <i className='ri-loader-4-line animate-spin' /> : null}
          size='large'
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Pemasukan'}
        </Button>
      </div>
    </form>
  )
}

export default AddIncomeForm
