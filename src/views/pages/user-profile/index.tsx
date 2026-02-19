'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import AboutOverview from './profile/AboutOverview'

const UserProfile = ({ data }: { data?: Data }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data?.profileHeader} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AboutOverview data={data?.users.profile} />
      </Grid>
    </Grid>
  )
}

export default UserProfile
