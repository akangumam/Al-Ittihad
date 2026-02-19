// React Imports
import { useEffect } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'

const ModeChanger = () => {
  // Hooks
  const { setMode } = useColorScheme()

  useEffect(() => {
    // Force light mode only
    setMode('light')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default ModeChanger
