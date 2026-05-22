// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import Sales from '@views/dashboards/ecommerce/Sales'
import CardStatWithImage from '@components/card-statistics/Character'
import WeeklySalesBg from '@views/dashboards/ecommerce/WeeklySalesBg'
import TotalVisits from '@views/dashboards/ecommerce/TotalVisits'
import SalesMonth from '@views/dashboards/ecommerce/SalesMonth'
import ActivityTimeline from '@views/dashboards/ecommerce/ActivityTimeline'
import TopReferralSources from '@views/dashboards/ecommerce/TopReferralSources'
import OrdersImpressions from '@views/dashboards/ecommerce/OrdersImpressions'
import MarketingSales from '@views/dashboards/ecommerce/MarketingSales'
import LiveVisitors from '@views/dashboards/ecommerce/LiveVisitors'
import UserTable from '@views/dashboards/ecommerce/UserTable'
import VisitsByDay from '@views/dashboards/ecommerce/VisitsByDay'

// Data Imports
import { getUserData } from '@/app/server/actions'

const DashboardECommerce = async () => {
  // Vars
  const data = await getUserData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Sales />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatWithImage
          stats='8.14k'
          title='Ratings'
          trendNumber='15.6%'
          chipColor='primary'
          chipText={`Year of ${new Date().getFullYear()}`}
          src='/images/illustrations/characters/10.png'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatWithImage
          stats='12.2k'
          title='Sessions'
          trend='negative'
          trendNumber='25.5%'
          chipColor='success'
          chipText='Last Month'
          src='/images/illustrations/characters/11.png'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <WeeklySalesBg />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TotalVisits />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SalesMonth />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TopReferralSources />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <OrdersImpressions />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }} className='max-md:order-2'>
        <MarketingSales />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }} className='max-md:order-1'>
        <LiveVisitors />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }} className='max-md:order-3'>
        <UserTable tableData={data} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} className='max-md:order-3'>
        <VisitsByDay />
      </Grid>
    </Grid>
  )
}

export default DashboardECommerce
