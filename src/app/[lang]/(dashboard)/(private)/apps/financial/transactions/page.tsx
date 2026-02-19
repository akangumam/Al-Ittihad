// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import QuickActions from '@views/financial/dashboard/QuickActions'

const QuickActionsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Transaksi
        </Typography>
        <Typography variant='subtitle1' color='text.secondary' sx={{ mb: 4 }}>
          Menu pintas untuk mencatat transaksi keuangan dan pembayaran.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <QuickActions />
      </Grid>
    </Grid>
  )
}

export default QuickActionsPage
