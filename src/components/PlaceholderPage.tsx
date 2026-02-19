// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: string
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col items-center justify-center gap-4 p-12'>
            {icon && <i className={`${icon} text-6xl text-primary`} />}
            <Typography variant='h4' className='text-center'>
              {title}
            </Typography>
            <Typography variant='body1' className='text-center text-textSecondary max-w-2xl'>
              {description}
            </Typography>
            <Typography variant='body2' className='text-center text-textDisabled mt-2'>
              Halaman ini sedang dalam pengembangan
            </Typography>
            <Button variant='contained' color='primary' className='mt-4'>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
