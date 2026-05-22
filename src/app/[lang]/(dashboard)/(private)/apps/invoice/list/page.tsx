// Component Imports
import InvoiceList from '@views/apps/invoice/list'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

const InvoiceApp = async () => {
  // Vars
  const data = await getInvoiceData()

  return <InvoiceList invoiceData={data} />
}

export default InvoiceApp
