/* cspell:disable */
'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'

interface AccountCardProps {
  title: string
  balance: number
  accountNumber?: string
  icon: string
  color: ThemeColor
}

const AccountCard = ({ title, balance, accountNumber, icon, color }: AccountCardProps) => {
  return (
    <Card sx={{ height: '100%', width: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className='flex justify-between items-start'>
          <div className='flex flex-col flex-grow'>
            <Typography
              variant='h6'
              className='font-medium'
              sx={{ minHeight: '3.5rem', display: 'flex', alignItems: 'flex-start' }}
            >
              <div>
                {title}
                {accountNumber && (
                  <Typography variant='caption' color='text.secondary' display='block'>
                    {accountNumber}
                  </Typography>
                )}
              </div>
            </Typography>
          </div>
          <CustomAvatar skin='light' variant='rounded' color={color} size={48} sx={{ flexShrink: 0 }}>
            <i className={icon} style={{ fontSize: '1.5rem' }} />
          </CustomAvatar>
        </div>

        <Divider />

        <div className='flex flex-col gap-1 mt-auto'>
          <Typography variant='body2' color='text.secondary'>
            Saldo Saat Ini
          </Typography>
          <Typography variant='h5' color='primary.main' className='font-bold' sx={{ wordBreak: 'break-all' }}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
              balance
            )}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

const AccountBalanceCards = () => {
  const { accounts } = useAppContext()

  // Map accounts from context to the card props
  const mappedAccounts: AccountCardProps[] = accounts.slice(0, 3).map(acc => ({
    title: acc.accountName,
    balance: acc.balance,
    accountNumber: acc.accountNumber,
    icon: acc.accountType === 'Kas' ? 'ri-money-dollar-circle-line' : 'ri-bank-card-line',
    color: acc.accountType === 'Kas' ? 'warning' : 'primary'
  }))

  return (
    <Grid container spacing={6} columns={12} sx={{ width: '100%', margin: 0 }}>
      {mappedAccounts.map((account, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index} sx={{ display: 'flex' }}>
          <AccountCard {...account} />
        </Grid>
      ))}
    </Grid>
  )
}

export default AccountBalanceCards
