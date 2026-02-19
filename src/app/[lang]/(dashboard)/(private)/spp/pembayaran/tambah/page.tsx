import SPPPaymentForm from '@/views/spp/SPPPaymentForm'
import PageHeader from '@/components/PageHeader'

export default function TambahPembayaranPage() {
  return (
    <>
      <PageHeader
        title='Catat Pembayaran SPP'
        subtitle='Input transaksi pembayaran SPP siswa'
        breadcrumbs={[
          { label: 'Keuangan Sekolah', href: '/spp/pembayaran' },
          { label: 'Pembayaran SPP', href: '/spp/pembayaran' },
          { label: 'Catat Pembayaran' }
        ]}
      />
      <SPPPaymentForm />
    </>
  )
}
