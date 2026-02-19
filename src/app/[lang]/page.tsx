import { redirect } from 'next/navigation'

import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  redirect(getLocalizedUrl('/login', lang as Locale))
}
