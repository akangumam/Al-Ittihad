// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import DialogAddCard from '@views/pages/dialog-examples/DialogAddCard'
import DialogEditUserInfo from '@views/pages/dialog-examples/DialogEditUserInfo'
import DialogAuthentication from '@views/pages/dialog-examples/DialogAuthentication'
import DialogAddNewAddress from '@views/pages/dialog-examples/DialogAddNewAddress'
import DialogShareProject from '@views/pages/dialog-examples/DialogShareProject'
import DialogReferEarn from '@views/pages/dialog-examples/DialogReferEarn'
import DialogPaymentMethod from '@views/pages/dialog-examples/DialogPaymentMethod'
import DialogPaymentProviders from '@views/pages/dialog-examples/DialogPaymentProviders'
import DialogCreateApp from '@views/pages/dialog-examples/DialogCreateApp'
import DialogPricing from '@views/pages/dialog-examples/DialogPricing'

// Data Imports
import { getPricingData } from '@/app/server/actions'

const DialogExamples = async () => {
  // Vars
  const data = await getPricingData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAddCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogEditUserInfo />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAuthentication />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAddNewAddress />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogShareProject />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogReferEarn />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPaymentMethod />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPaymentProviders />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPricing data={data} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogCreateApp />
      </Grid>
    </Grid>
  )
}

export default DialogExamples
