'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import { createClient } from '../lib/supabase/client'
import RatingCard from './RatingCard'
import { CATEGORIES } from '../lib/constants'
import CategoryIcon from './CategoryIcon'
import { hasOnboarded, getPreferredCategories } from '../lib/preferences'
import type { Rating, Category } from '../lib/types'

interface Props {
  currentUserId: string | null
}

function score(r: Rating): number {
  const ageHours = (Date.now() - new Date(r.created_at).getTime()) / 3_600_000
  const recency = Math.max(0, 1 - ageHours / 168) // decays over 7 days
  const noise = Math.random() * 0.5
  return recency * 3 + noise
}

// Round-robin interleave: preferred categories get more slots
function buildDiverseFeed(pool: Rating[], preferred: Category[]): Rating[] {
  const buckets: Record<string, Rating[]> = {}
  for (const r of pool) {
    if (!buckets[r.category]) buckets[r.category] = []
    buckets[r.category].push(r)
  }

  // Preferred categories get 8 slots, others get 4
  for (const cat of Object.keys(buckets)) {
    const limit = preferred.includes(cat as Category) ? 8 : 4
    buckets[cat] = buckets[cat]
      .sort((a, b) => score(b) - score(a))
      .slice(0, limit)
  }

  // Interleave round-robin; preferred categories appear first in key order
  const result: Rating[] = []
  const preferredKeys = Object.keys(buckets).filter(k => preferred.includes(k as Category))
  const otherKeys = Object.keys(buckets).filter(k => !preferred.includes(k as Category)).sort(() => Math.random() - 0.5)
  const keys = [...preferredKeys, ...otherKeys]
  let round = 0
  while (result.length < 40) {
    let added = false
    for (const cat of keys) {
      if (buckets[cat]?.[round]) {
        result.push(buckets[cat][round])
        added = true
      }
    }
    if (!added) break
    round++
  }
  return result
}

export default function FeedContent({ currentUserId }: Props) {
  const router = useRouter()
  const [feed, setFeed] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const tCat = useTranslations('categories')
  const tFeed = useTranslations('feed')

  // Redirect logged-in first-timers to onboarding
  useEffect(() => {
    if (currentUserId && !hasOnboarded()) {
      router.replace('/onboarding')
    }
  }, [currentUserId, router])

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    const supabase = createClient()

    // Get IDs of people I follow so we can exclude them
    let followedIds: string[] = []
    if (currentUserId) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
      followedIds = (follows ?? []).map(f => f.following_id)
    }

    // Fetch per-category in parallel so every category is always represented
    // 20 rows per category is enough — buildDiverseFeed keeps at most 8 per preferred category
    const excludeIds = [...followedIds, currentUserId].filter(Boolean) as string[]

    const categoryQueries = CATEGORIES.map(cat => {
      let q = supabase
        .from('ratings')
        .select('*, profiles(id, username, avatar_url)')
        .eq('category', cat)
        .order('created_at', { ascending: false })
        .limit(20)
      if (excludeIds.length > 0) {
        q = q.not('user_id', 'in', `(${excludeIds.join(',')})`)
      }
      return q
    })

    const results = await Promise.all(categoryQueries)
    const pool = results.flatMap(r => (r.data ?? []) as Rating[])
    const preferred = getPreferredCategories()

    setFeed(buildDiverseFeed(pool, preferred))
    setLoading(false)
    setRefreshing(false)
  }, [currentUserId])

  useEffect(() => { load() }, [load])

  const filtered = activeCategory === 'all'
    ? feed
    : feed.filter(r => r.category === activeCategory)

  return (
    <>
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 -mx-4 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 flex-1 min-w-0" style={{ maskImage: 'linear-gradient(to right, black calc(100% - 2rem), transparent)', WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 2rem), transparent)' }}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tCat('all')}
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
                <CategoryIcon category={cat} size={12} className="inline-block mr-1" />{tCat(cat)}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="flex-shrink-0 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30"
            title="Refresh feed"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Feed — 1 column on mobile, 2 columns on desktop */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          // Skeleton only on first load — refresh keeps existing cards visible
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="w-full h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 col-span-full">
            <p className="font-semibold text-zinc-500">
              {activeCategory !== 'all'
                ? tFeed('noRatingsCategory', { category: tCat(activeCategory as Category) })
                : tFeed('noRatings')}
            </p>
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
