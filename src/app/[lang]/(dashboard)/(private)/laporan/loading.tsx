// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Grid'

const Loading = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant='rectangular' height={40} width='60%' className='mb-4' />
            <Skeleton variant='text' height={30} width='40%' className='mb-6' />
            <Skeleton variant='rectangular' height={400} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Loading
