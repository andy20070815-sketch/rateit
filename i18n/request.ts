import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

type Locale = 'en' | 'zh-TW'

function detectFromAcceptLanguage(acceptLanguage: string): Locale {
  const s = acceptLanguage.toLowerCase()
  // Prefer zh-TW/zh-HK explicitly; also treat bare 'zh' as TW (not Simplified)
  if (s.includes('zh-tw') || s.includes('zh-hk') || s.includes('zh-hant')) return 'zh-TW'
  if (/\bzh\b/.test(s) && !s.includes('zh-cn') && !s.includes('zh-sg') && !s.includes('zh-hans')) return 'zh-TW'
  return 'en'
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const saved = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined

  let locale: Locale
  if (saved === 'zh-TW' || saved === 'en') {
    locale = saved
  } else {
    const acceptLang = (await headers()).get('accept-language') ?? ''
    locale = detectFromAcceptLanguage(acceptLang)
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
