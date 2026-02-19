// Financial Report Page - Redirects to BOS Report
import { redirect } from 'next/navigation'

export default function LaporanKeuanganPage() {
  // Redirect to BOS report page
  redirect('/id/laporan/bos')
}
