// React Imports
import { Suspense } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Type Imports
import type { PricingPlanType } from '@/types/pages/pricingTypes'

// Component Imports
import UserLeftOverview from '@views/apps/user/view/user-left-overview'
import UserRight from '@views/apps/user/view/user-right'

// Data Imports
import { getPricingData } from '@/app/server/actions'

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <CircularProgress />
  </Box>
)

const OverViewTab = dynamic(() => import('@views/apps/user/view/user-right/overview'), {
  loading: () => <LoadingFallback />
})

const SecurityTab = dynamic(() => import('@views/apps/user/view/user-right/security'), {
  loading: () => <LoadingFallback />
})

const BillingPlans = dynamic(() => import('@views/apps/user/view/user-right/billing-plans'), {
  loading: () => <LoadingFallback />
})

const NotificationsTab = dynamic(() => import('@views/apps/user/view/user-right/notifications'), {
  loading: () => <LoadingFallback />
})

const ConnectionsTab = dynamic(() => import('@views/apps/user/view/user-right/connections'), {
  loading: () => <LoadingFallback />
})

// Vars
const tabContentList = (data?: PricingPlanType[]): { [key: string]: ReactElement } => ({
  overview: <OverViewTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans data={data} />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/pricing` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
} */

const UserViewTab = async () => {
  // Vars
  const data = await getPricingData()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <UserLeftOverview />
        </Grid>
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <UserRight tabContentList={tabContentList(data)} />
        </Grid>
      </Grid>
    </Suspense>
  )
}

export default UserViewTab
