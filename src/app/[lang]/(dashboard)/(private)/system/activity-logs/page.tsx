import type { Metadata } from 'next'

import PageHeader from '@/components/PageHeader'
import ActivityLogList from '@/views/system/ActivityLogList'

export const metadata: Metadata = {
  title: 'Log Aktivitas - Sistem Informasi Sekolah',
  description: 'Riwayat aktivitas dan audit trail sistem'
}

const ActivityLogsPage = () => {
  return (
    <>
      <PageHeader
        title='Log Aktivitas'
        subtitle='Riwayat aktivitas dan audit trail sistem'
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Sistem', href: '/system' },
          { label: 'Log Aktivitas' }
        ]}
      />
      <ActivityLogList />
    </>
  )
}

export default ActivityLogsPage
