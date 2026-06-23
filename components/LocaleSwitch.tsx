'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function LocaleSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(next: string) {
    // Persist for 1 year; SameSite=Lax so it's sent on navigations
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex rounded-xl overflow-hidden border border-[var(--line)]" aria-label="Language selector">
      {(['en', 'zh-TW'] as const).map(l => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          disabled={isPending || locale === l}
          aria-pressed={locale === l}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
            locale === l
              ? 'bg-[var(--ink)] text-[var(--paper)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] disabled:opacity-50'
          }`}
        >
          {l === 'en' ? 'English' : '繁體中文'}
        </button>
      ))}
    </div>
  )
}
