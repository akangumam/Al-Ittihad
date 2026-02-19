'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useAppContext } from '@/contexts/AppContext'

const WelcomeCard = () => {
  const theme = useTheme()
  const { academicYears } = useAppContext()
  const activeYear = academicYears.find(year => year.isActive)?.name || '2024/2025'

  // Format date: Kamis, 28 November 2025
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card>
      <CardContent>
        <div className='flex max-md:flex-col md:items-center justify-between gap-6'>
          <div>
            <div className='flex items-baseline gap-1 mbe-2'>
              <Typography variant='h5'>Selamat Datang,</Typography>
              <Typography variant='h4' color='primary.main' sx={{ fontWeight: 600 }}>
                Admin Keuangan 👋🏻
              </Typography>
            </div>
            <Typography variant='subtitle1' color='text.secondary'>
              Hari ini adalah <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{today}</span>.
            </Typography>
            <Typography variant='body2' color='text.secondary' className='mbe-4'>
              Sistem Manajemen Keuangan MTs Al-Ittihad siap digunakan. Cek ringkasan di bawah.
            </Typography>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex flex-col items-end'>
              <Typography variant='h6'>Tahun Ajaran</Typography>
              <Typography variant='body2' color='text.secondary'>
                {activeYear}
              </Typography>
            </div>
            <CustomAvatar skin='light' variant='rounded' color='primary' size={56}>
              <i className='ri-calendar-check-line text-[2rem]' />
            </CustomAvatar>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeCard
