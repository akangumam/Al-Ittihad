// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the url is missing the locale
export const isUrlMissingLocale = (url: string) => {
  // Check if it starts with any 2-3 letter locale pattern like /en/, /id/, /ar/, etc.
  const localePattern = /^\/[a-z]{2,3}(\/|$)/

  return !localePattern.test(url)
}

// Get the localized url
export const getLocalizedUrl = (url: string, languageCode: string): string => {
  if (!url || !languageCode) throw new Error("URL or Language Code can't be empty")

  if (url.startsWith('http')) return url

  const normalizedUrl = ensurePrefix(url, '/')

  // Temporarily restoring the locale prefix logic to test if 404s persist
  const localePattern = /^\/[a-z]{2,3}(\/|$)/

  if (localePattern.test(normalizedUrl)) {
    return normalizedUrl.replace(localePattern, `/${languageCode}$1`)
  }

  return `/${languageCode}${normalizedUrl}`
}
