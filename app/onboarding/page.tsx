'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import CategoryIcon from '../../components/CategoryIcon'
import { CATEGORIES } from '../../lib/constants'
import { setPreferredCategories } from '../../lib/preferences'
import type { Category } from '../../lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const t = useTranslations('onboarding')
  const tCat = useTranslations('categories')
  const [selected, setSelected] = useState<Category[]>([])

  function toggle(cat: Category) {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function handleContinue() {
    setPreferredCategories(selected)
    router.replace('/feed')
  }

  const remaining = Math.max(0, 3 - selected.length)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {selected.length === 0
              ? t('pickAtLeast')
              : remaining > 0
              ? t('pickMore', { remaining })
              : t('ready')}
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {CATEGORIES.map(cat => {
            const active = selected.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all font-semibold text-sm ${
                  active
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                <CategoryIcon category={cat} size={24} strokeWidth={1.5} />
                {tCat(cat as Parameters<typeof tCat>[0])}
              </button>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={selected.length < 3}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-black dark:bg-white text-white dark:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {selected.length < 3
            ? t('selectAtLeast')
            : t('continue', { count: selected.length })}
        </button>

        {/* Skip */}
        <button
          onClick={() => {
            setPreferredCategories([])
            router.replace('/feed')
          }}
          className="w-full mt-3 py-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {t('skip')}
        </button>
      </div>
    </div>
  )
}
