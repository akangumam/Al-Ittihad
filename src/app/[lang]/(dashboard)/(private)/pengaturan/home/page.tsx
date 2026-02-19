// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import HomeSettingsForm from '@views/pengaturan/home-settings/HomeSettingsForm'

export const metadata = {
  title: 'Pengaturan Halaman Home',
  description: 'Kelola konten dan tampilan halaman home website'
}

const HomeSettingsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <HomeSettingsForm />
      </Grid>
    </Grid>
  )
}

export default HomeSettingsPage
