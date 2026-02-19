// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'MTs Al-Ittihad Pedaleman',
  description: 'Sistem Informasi Manajemen MTs Al-Ittihad Pedaleman',
  icons: {
    icon: '/images/logos/aliet_logo.png',
    shortcut: '/images/logos/aliet_logo.png',
    apple: '/images/logos/aliet_logo.png'
  }
}

const RootLayout = ({ children }: ChildrenType) => {
  return (
    <html id='__next' lang='id' dir='ltr' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
    </html>
  )
}

export default RootLayout
