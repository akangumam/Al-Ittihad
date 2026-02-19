// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// Type Imports
import type { ProfileTabType } from '@/types/pages/profileTypes'

const AboutOverview = ({ data }: { data?: ProfileTabType }) => {
  // Convert array to object for easier access
  const aboutData = data?.about?.reduce(
    (acc, item) => {
      acc[item.property] = item.value
      
return acc
    },
    {} as Record<string, string>
  )

  const contactsData = data?.contacts?.reduce(
    (acc, item) => {
      acc[item.property] = item.value
      
return acc
    },
    {} as Record<string, string>
  )

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' className='mbe-4'>
          Account Details
        </Typography>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Full Name'
              value={aboutData?.['Full Name'] || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='Status' value={aboutData?.['Status'] || ''} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='Role' value={aboutData?.['Role'] || ''} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='Email' value={contactsData?.['Email'] || ''} InputProps={{ readOnly: true }} />
          </Grid>
          {contactsData?.['Phone'] && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label='Phone Number' value={contactsData['Phone']} InputProps={{ readOnly: true }} />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='City' value={aboutData?.['City'] || ''} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Province'
              value={aboutData?.['Province'] || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          {contactsData?.['Address'] && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Address'
                value={contactsData['Address']}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AboutOverview
