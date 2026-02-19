'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Zoom from '@mui/material/Zoom'
import { styled } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'

interface ScrollToTopProps {
  className?: string
  children: ReactNode
}

const ScrollToTopStyled = styled('div')(({ theme }) => ({
  zIndex: 'var(--mui-zIndex-fab)',
  position: 'fixed',
  insetInlineEnd: theme.spacing(4),
  insetBlockEnd: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    insetInlineEnd: theme.spacing(6),
    insetBlockEnd: theme.spacing(6)
  }
}))

const FrontScrollToTop = (props: ScrollToTopProps) => {
  // Props
  const { children, className } = props

  // Hooks
  const trigger = useScrollTrigger({
    threshold: 300,
    disableHysteresis: true
  })

  const handleClick = () => {
    const anchor = document.querySelector('body')

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Zoom in={trigger}>
      <ScrollToTopStyled className={className} onClick={handleClick} role='presentation'>
        {children}
      </ScrollToTopStyled>
    </Zoom>
  )
}

export default FrontScrollToTop
