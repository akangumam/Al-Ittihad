// Next Imports
import { redirect } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'

// Component Imports
import EditCard from '@views/apps/invoice/edit/EditCard'
import EditActions from '@views/apps/invoice/edit/EditActions'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

const EditPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  // Vars
  const data = await getInvoiceData()

  const filteredData = data?.filter((invoice: InvoiceType) => invoice.id === params.id)[0]

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 9 }}>
        <EditCard data={data} invoiceData={filteredData} id={params.id} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <EditActions id={params.id} />
      </Grid>
    </Grid>
  ) : null
}

export default EditPage
