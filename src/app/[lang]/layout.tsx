// Next Imports
import { headers } from 'next/headers'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

const LangLayout = async (props: ChildrenType & { params: Promise<{ lang: string }> }) => {
  const params = await props.params

  const { children } = props

  // Vars
  const headersList = await headers()

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang as Locale}>
      {children}
    </TranslationWrapper>
  )
}

export default LangLayout
