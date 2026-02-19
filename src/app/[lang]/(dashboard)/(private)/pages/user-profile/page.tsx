// React Imports
import { Suspense } from 'react'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getProfileData } from '@/app/server/actions'

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <CircularProgress />
  </Box>
)

const ProfilePage = async () => {
  // Vars
  const data = await getProfileData()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <UserProfile data={data} />
    </Suspense>
  )
}

export default ProfilePage
