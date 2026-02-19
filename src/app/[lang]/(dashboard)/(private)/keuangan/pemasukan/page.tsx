import IncomeListTable from '@/views/financial/income/IncomeListTable'
import PageHeader from '@/components/PageHeader'

export default function PemasukanPage() {
  return (
    <>
      <PageHeader
        title='Pemasukan'
        subtitle='Kelola data pemasukan keuangan sekolah'
        breadcrumbs={[{ label: 'Manajemen Keuangan', href: '/keuangan/pemasukan' }, { label: 'Pemasukan' }]}
      />
      <IncomeListTable />
    </>
  )
}
