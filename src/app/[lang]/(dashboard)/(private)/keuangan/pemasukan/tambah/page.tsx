import AddIncomeForm from '@/views/financial/income/AddIncomeForm'
import PageHeader from '@/components/PageHeader'

export default function AddIncomePage() {
  return (
    <>
      <PageHeader
        title='Catat Pemasukan Non-SPP'
        subtitle='Input transaksi pemasukan selain SPP (Donasi, Infaq, BOS, dll)'
        breadcrumbs={[
          { label: 'Manajemen Keuangan', href: '/keuangan/pemasukan' },
          { label: 'Pemasukan', href: '/keuangan/pemasukan' },
          { label: 'Tambah Pemasukan' }
        ]}
      />
      <AddIncomeForm />
    </>
  )
}
