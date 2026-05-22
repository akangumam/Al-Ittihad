// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import TotalReviews from '@views/apps/ecommerce/manage-reviews/TotalReviews'
import ReviewsStatistics from '@views/apps/ecommerce/manage-reviews/ReviewsStatistics'
import ManageReviewsTable from '@views/apps/ecommerce/manage-reviews/ManageReviewsTable'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const eCommerceManageReviews = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TotalReviews />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewsStatistics />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ManageReviewsTable reviewsData={data?.reviews} />
      </Grid>
    </Grid>
  )
}

export default eCommerceManageReviews
