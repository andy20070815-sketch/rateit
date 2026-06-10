'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import RatingCard from './RatingCard'
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS } from '../lib/constants'
import type { Rating, Category } from '../lib/types'

interface Props {
  currentUserId: string | null
}

function controversyScore(r: Rating): number {
  const extremeness = Math.abs(r.score - 5.5) // 0–4.5, higher = more extreme
  const ageHours = (Date.now() - new Date(r.created_at).getTime()) / 3_600_000
  const recency = Math.max(0, 1 - ageHours / 72) // decays over 3 days
  const noise = Math.random() * 0.4 // keeps feed fresh on each load
  return extremeness * 2 + recency * 1.5 + noise
}

export default function FeedContent({ currentUserId }: Props) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Fetch a big pool — mix of everyone's ratings
      const { data } = await supabase
        .from('ratings')
        .select('*, profiles(id, username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(30)

      const pool = (data || []) as Rating[]

      // Sort by controversy score
      const sorted = [...pool].sort((a, b) => controversyScore(b) - controversyScore(a))
      setRatings(sorted)
      setLoading(false)
    }
    load()
  }, [currentUserId])

  const filtered = activeCategory === 'all'
    ? ratings
    : ratings.filter(r => r.category === activeCategory)

  return (
    <>
      {/* Category filter bar */}
      <div className="sticky top-14 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 -mx-4 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ✦ All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4 mt-4">
        {loading ? (
          <div className="text-center py-16 text-zinc-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-2xl">🤷</p>
            <p className="font-semibold">No {activeCategory !== 'all' ? CATEGORY_LABELS[activeCategory as Category] : ''} ratings yet</p>
          </div>
        ) : (
          filtered.map(rating => (
            <RatingCard key={rating.id} rating={rating} />
          ))
        )}
      </div>
    </>
  )
}
