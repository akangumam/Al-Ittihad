// Component Imports
import Permissions from '@views/apps/permissions'

// Data Imports
import { getPermissionsData } from '@/app/server/actions'

const PermissionsApp = async () => {
  // Vars
  const data = await getPermissionsData()

  return <Permissions permissionsData={data} />
}

export default PermissionsApp
