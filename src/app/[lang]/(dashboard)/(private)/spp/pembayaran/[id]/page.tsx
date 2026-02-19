import SPPPaymentDetail from '@/views/spp/SPPPaymentDetail'

const PaymentDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return <SPPPaymentDetail paymentId={id} />
}

export default PaymentDetailPage
