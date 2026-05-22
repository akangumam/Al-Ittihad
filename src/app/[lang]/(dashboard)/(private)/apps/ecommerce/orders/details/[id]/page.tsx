// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { OrderType } from '@/types/apps/ecommerceTypes'

// Component Imports
import OrderDetails from '@views/apps/ecommerce/orders/details'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  // Vars
  const data = await getEcommerceData()

  const filteredData = data?.orderData.filter((item: OrderType) => item.order === params.id)[0]

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <OrderDetails orderData={filteredData} order={params.id} /> : null
}

export default OrderDetailsPage
