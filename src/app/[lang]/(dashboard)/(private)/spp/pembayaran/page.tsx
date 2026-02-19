import SPPPaymentTable from '@/views/spp/SPPPaymentTable'
import PageHeader from '@/components/PageHeader'

export default function PembayaranSPPPage() {
  return (
    <>
      <PageHeader
        title='Pembayaran SPP'
        subtitle='Kelola transaksi pembayaran SPP siswa'
        breadcrumbs={[{ label: 'Keuangan Sekolah', href: '/spp/pembayaran' }, { label: 'Pembayaran SPP' }]}
      />
      <SPPPaymentTable />
    </>
  )
}
