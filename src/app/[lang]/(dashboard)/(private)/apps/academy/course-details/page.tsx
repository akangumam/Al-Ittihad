// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Details from '@views/apps/academy/course-details/Details'
import Sidebar from '@views/apps/academy/course-details/Sidebar'

// Data Imports
import { getAcademyData } from '@/app/server/actions'

const CourseDetailsPage = async () => {
  // Vars
  const data = await getAcademyData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Details data={data?.courseDetails} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <div className='sticky top-[88px]'>
          <Sidebar content={data?.courseDetails.content} />
        </div>
      </Grid>
    </Grid>
  )
}

export default CourseDetailsPage
