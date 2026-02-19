import PageHeader from '@/components/PageHeader'
import BudgetRealizationTable from '@/views/rab/BudgetRealizationTable'

export default function RealisasiAnggaranPage() {
  return (
    <>
      <PageHeader
        title='Realisasi Anggaran'
        subtitle='Pantau realisasi penggunaan anggaran'
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rencana Anggaran', href: '/rab' },
          { label: 'Realisasi Anggaran' }
        ]}
      />
      <BudgetRealizationTable />
    </>
  )
}
