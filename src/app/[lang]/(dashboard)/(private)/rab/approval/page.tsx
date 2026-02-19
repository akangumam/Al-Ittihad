import PageHeader from '@/components/PageHeader'
import BudgetApprovalTable from '@/views/rab/BudgetApprovalTable'

export default function ApprovalAnggaranPage() {
  return (
    <>
      <PageHeader
        title='Persetujuan Anggaran'
        subtitle='Proses persetujuan anggaran belanja'
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rencana Anggaran', href: '/rab' },
          { label: 'Persetujuan Anggaran' }
        ]}
      />
      <BudgetApprovalTable />
    </>
  )
}
