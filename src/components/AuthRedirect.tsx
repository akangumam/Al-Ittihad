'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const router = useRouter()
  const pathname = usePathname()

  const login = getLocalizedUrl('/login', lang)
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  useEffect(() => {
    const target = pathname === login || pathname === homePage ? login : `${login}?redirectTo=${pathname}`

    router.replace(target)
  }, [pathname, login, homePage, router])

  return null
}

export default AuthRedirect
