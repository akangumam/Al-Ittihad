import PageHeader from '@/components/PageHeader'
import AnnualBudgetTable from '@/views/rab/AnnualBudgetTable'

export default function RencanaTahunanPage() {
  return (
    <>
      <PageHeader
        title='Rencana Anggaran Tahunan'
        subtitle='Kelola rencana anggaran belanja tahunan sekolah'
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rencana Anggaran', href: '/rab' },
          { label: 'Rencana Tahunan' }
        ]}
      />
      <AnnualBudgetTable />
    </>
  )
}
