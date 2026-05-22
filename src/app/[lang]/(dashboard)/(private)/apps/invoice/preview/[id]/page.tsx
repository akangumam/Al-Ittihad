// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'

// Component Imports
import Preview from '@views/apps/invoice/preview'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

const PreviewPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  // Vars
  const data = await getInvoiceData()

  const filteredData = data?.filter((invoice: InvoiceType) => invoice.id === params.id)[0]

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <Preview invoiceData={filteredData} id={params.id} /> : null
}

export default PreviewPage
