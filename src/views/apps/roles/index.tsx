// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'

const Roles = ({ userData }: { userData?: UsersType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Daftar Hak Akses
        </Typography>
        <Typography>
          Hak akses menentukan menu dan fitur yang dapat diakses oleh pengguna sesuai dengan perannya
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RoleCards userData={userData} />
      </Grid>
      <Grid size={{ xs: 12 }} className='!pbs-12'>
        <Typography variant='h4' className='mbe-1'>
          Total Pengguna dengan Hak Akses
        </Typography>
        <Typography>Daftar semua akun administrator dan peran yang terkait</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RolesTable tableData={userData} />
      </Grid>
    </Grid>
  )
}

export default Roles
