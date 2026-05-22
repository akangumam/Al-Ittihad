// Component Imports
import AcademyMyCourse from '@/views/apps/academy/my-courses'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Data Imports
import { getAcademyData } from '@/app/server/actions'

const MyCoursePage = async () => {
  // Vars
  const mode = await getServerMode()
  const data = await getAcademyData()

  return <AcademyMyCourse mode={mode} courseData={data?.courses} />
}

export default MyCoursePage
