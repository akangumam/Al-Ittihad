'use client'

import type { ReactNode } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

// Component Imports
import FrontNavigation from './FrontNavigation'
import Footer from '@components/layout/front-pages/Footer'
import FrontScrollToTop from '@components/FrontScrollToTop'

type Props = {
  children: ReactNode
}

export default function FrontLayout({ children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <FrontNavigation />

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>{children}</main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <FrontScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='ri-arrow-up-line' />
        </Button>
      </FrontScrollToTop>
    </div>
  )
}
