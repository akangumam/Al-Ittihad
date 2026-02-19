'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const LangRedirect = () => {
  const pathname = usePathname()

  const redirectUrl = getLocalizedUrl(pathname, i18n.defaultLocale)

  redirect(redirectUrl)
}

export default LangRedirect
