'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryIcon from '../../components/CategoryIcon'
import { CATEGORIES, CATEGORY_LABELS } from '../../lib/constants'
import { setPreferredCategories } from '../../lib/preferences'
import type { Category } from '../../lib/types'

export default function OnboardingPage() {
  const router = useRouter()
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">What do you love?</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {selected.length === 0
              ? 'Pick at least 3 categories to personalize your feed.'
              : remaining > 0
              ? `Pick ${remaining} more to personalize your feed.`
              : 'Your feed is ready to go.'}
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
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={selected.length < 1}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-black dark:bg-white text-white dark:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {selected.length === 0
            ? 'Select at least one category'
            : `Continue with ${selected.length} categor${selected.length === 1 ? 'y' : 'ies'}`}
        </button>

        {/* Skip */}
        <button
          onClick={() => {
            setPreferredCategories([])
            router.replace('/feed')
          }}
          className="w-full mt-3 py-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
