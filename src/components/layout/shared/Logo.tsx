'use client'

// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import styled from '@emotion/styled'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'
import { useImageVariant } from '@core/hooks/useImageVariant'

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`

const Logo = () => {
  // Refs
  const logoRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { mode, systemMode } = useColorScheme()

  // Vars
  const { layout } = settings
  const _mode = (mode === 'system' ? systemMode : mode) || settings.mode || 'light'
  const logo = useImageVariant(_mode, '/images/logos/aliet_logo_color.png', '/images/logos/aliet_logo_white.png')

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoRef && logoRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoRef.current?.classList.add('hidden')
      } else {
        logoRef.current.classList.remove('hidden')
      }
    }
  }, [isHovered, layout, isBreakpointReached])

  // Calculate dynamic styles
  const wrapperStyles = {
    transition: `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`,
    ...(!isBreakpointReached && layout === 'collapsed' && !isHovered
      ? { opacity: 0, marginInlineStart: 0, width: 0, overflow: 'hidden' }
      : { opacity: 1, marginInlineStart: '10px' })
  }

  return (
    <div className='flex items-center min-bs-[24px]'>
      <LogoWrapper ref={logoRef} style={wrapperStyles}>
        <img src={logo} alt='Al-Ittihad Logo' style={{ height: '42px', width: 'auto', maxWidth: '200px' }} />
      </LogoWrapper>
    </div>
  )
}

export default Logo
