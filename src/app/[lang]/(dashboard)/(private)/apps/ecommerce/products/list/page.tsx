// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ProductListTable from '@views/apps/ecommerce/products/list/ProductListTable'
import ProductCard from '@views/apps/ecommerce/products/list/ProductCard'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const eCommerceProductsList = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProductListTable productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default eCommerceProductsList
