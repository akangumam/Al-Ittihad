// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { Customer } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const CustomerDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  // Vars
  const data = await getEcommerceData()

  const filteredData = data?.customerData.filter((item: Customer) => item.customerId === params.id)[0]

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <CustomerDetails customerData={filteredData} customerId={params.id} /> : null
}

export default CustomerDetailsPage
