// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import HorizontalStatisticsCard from '@views/apps/ecommerce/referrals/HorizontalStatisticsCard'
import IconStepsCard from '@views/apps/ecommerce/referrals/IconStepsCard'
import InviteAndShare from '@views/apps/ecommerce/referrals/InviteAndShare'
import ReferredUsersTable from '@views/apps/ecommerce/referrals/ReferredUsersTable'

// Data Imports
import { getEcommerceData, getStatisticsData } from '@/app/server/actions'

const eCommerceReferrals = async () => {
  // Vars
  const statsData = await getStatisticsData()
  const ecommerceData = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <HorizontalStatisticsCard data={statsData?.statsHorizontalWithAvatar} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <IconStepsCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <InviteAndShare />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReferredUsersTable referralsData={ecommerceData?.referrals} />
      </Grid>
    </Grid>
  )
}

export default eCommerceReferrals
