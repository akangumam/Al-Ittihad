export const i18n = {
  defaultLocale: 'id',
  locales: ['id'],
  langDirection: {
    id: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
