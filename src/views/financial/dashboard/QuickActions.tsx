'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const QuickActions = () => {
  const theme = useTheme()
  const { lang: locale } = useParams()

  const actions = [
    {
      label: 'Tambah Pemasukan',
      icon: 'ri-add-circle-line',
      color: theme.palette.success.main,
      href: '/keuangan/pemasukan'
    },
    {
      label: 'Tambah Pengeluaran',
      icon: 'ri-indeterminate-circle-line',
      color: theme.palette.error.main,
      href: '/keuangan/pengeluaran'
    },
    {
      label: 'Bayar Tagihan Siswa',
      icon: 'ri-bank-card-line',
      color: theme.palette.primary.main,
      href: '/apps/financial/fees'
    },
    {
      label: 'Mutasi Kas',
      icon: 'ri-exchange-dollar-line',
      color: theme.palette.info.main,
      href: '/keuangan/mutasi'
    },
    {
      label: 'Buat Laporan',
      icon: 'ri-file-chart-line',
      color: theme.palette.warning.main,
      href: '/laporan/neraca'
    },
    {
      label: 'Lihat BKU',
      icon: 'ri-file-list-3-line',
      color: theme.palette.secondary.main,
      href: '/laporan/bku'
    }
  ]

  return (
    <Card>
      <CardHeader title='Aksi Cepat' subheader='Shortcut untuk transaksi dan laporan' />
      <CardContent>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Button
                fullWidth
                component={Link}
                href={getLocalizedUrl(action.href, locale as Locale)}
                variant='outlined'
                startIcon={<i className={action.icon} />}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}15`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px ${action.color}30`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default QuickActions
