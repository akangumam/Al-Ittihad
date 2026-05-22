// Component Imports
import Pricing from '@views/pages/pricing'

// Data Imports
import { getPricingData } from '@/app/server/actions'

const PricePage = async () => {
  // Vars
  const data = await getPricingData()

  return <Pricing data={data} />
}

export default PricePage
