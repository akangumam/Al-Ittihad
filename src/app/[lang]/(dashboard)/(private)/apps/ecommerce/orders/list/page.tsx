// Component Imports
import OrderList from '@views/apps/ecommerce/orders/list'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const OrdersListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <OrderList orderData={data?.orderData} />
}

export default OrdersListPage
