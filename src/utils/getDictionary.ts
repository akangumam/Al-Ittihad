// React Imports
import { cache } from 'react'

// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

const dictionaries = {
  id: () => import('@/data/dictionaries/id.json').then(module => module.default)
}

export const getDictionary = cache(async (locale: Locale) => dictionaries[locale]())
