// React Imports
import { Suspense } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import AccountSettings from '@views/pages/account-settings'

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <CircularProgress />
  </Box>
)

const AccountTab = dynamic(() => import('@views/pages/account-settings/account'), {
  loading: () => <LoadingFallback />
})

const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'), {
  loading: () => <LoadingFallback />
})

// Removed: BillingPlansTab, NotificationsTab, ConnectionsTab - tidak relevan untuk sistem sekolah

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  account: <AccountTab />,
  security: <SecurityTab />
})

const AccountSettingsPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccountSettings tabContentList={tabContentList()} />
    </Suspense>
  )
}

export default AccountSettingsPage
