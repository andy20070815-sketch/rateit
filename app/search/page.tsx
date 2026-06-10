import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import ExternalSearchResults from '../../components/ExternalSearchResults'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/constants'
import type { Category } from '../../lib/types'

interface Props {
  searchParams: Promise<{ q?: string }>
}

interface EntityResult {
  title: string
  primaryCategory: Category
  allCategories: Category[]
  avg: number
  count: number
  image_url: string | null
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    profile = p
  }

  let results: EntityResult[] = []

  if (query.length >= 1) {
    const { data: ratings } = await supabase
      .from('ratings')
      .select('id, title, category, score, image_url')
      .ilike('title', `%${query}%`)
      .limit(500)

    // Group by title (case-insensitive)
    const groups = new Map<string, {
      title: string
      categoryCount: Map<Category, number>
      scores: number[]
      image_url: string | null
    }>()

    for (const r of ratings || []) {
      const key = r.title.toLowerCase()
      if (!groups.has(key)) {
        groups.set(key, { title: r.title, categoryCount: new Map(), scores: [], image_url: null })
      }
      const g = groups.get(key)!
      const cat = r.category as Category
      g.categoryCount.set(cat, (g.categoryCount.get(cat) ?? 0) + 1)
      g.scores.push(r.score)
      if (!g.image_url && r.image_url) g.image_url = r.image_url
    }

    results = [...groups.values()]
      .map(g => {
        // Pick the category with most ratings as primary
        const sorted = [...g.categoryCount.entries()].sort((a, b) => b[1] - a[1])
        return {
          title: g.title,
          primaryCategory: sorted[0][0],
          allCategories: sorted.map(e => e[0]),
          avg: g.scores.reduce((a, b) => a + b, 0) / g.scores.length,
          count: g.scores.length,
          image_url: g.image_url,
        }
      })
      .sort((a, b) => b.count - a.count)
  }

  const scoreColor = (avg: number) =>
    avg >= 8 ? 'text-green-500' : avg >= 5 ? 'text-yellow-500' : 'text-red-500'

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {!query ? (
          <div className="flex flex-col items-center py-24 gap-3 text-zinc-400">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Search anything</p>
            <p className="text-sm text-center">Movies, artists, athletes, shows, games…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-8 gap-2 text-zinc-400">
              <span className="text-4xl">😶</span>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">Nothing rated yet for &ldquo;{query}&rdquo;</p>
            </div>
            <ExternalSearchResults q={query} existingTitles={[]} />
          </div>
        ) : (
          <>
            <h1 className="font-black text-xl">
              Results for &ldquo;{query}&rdquo;
              <span className="ml-2 text-sm font-normal text-zinc-400">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
            </h1>

            <div className="space-y-3">
              {results.map(r => (
                <Link
                  key={r.title.toLowerCase()}
                  href={`/content/${r.primaryCategory}/${encodeURIComponent(r.title)}`}
                  className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">
                      {CATEGORY_EMOJI[r.primaryCategory]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{r.title}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {r.allCategories.map(cat => (
                        <span key={cat} className="text-xs text-zinc-500">
                          {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{r.count} {r.count === 1 ? 'rating' : 'ratings'}</p>
                  </div>
                  <div className={`text-3xl font-black shrink-0 ${scoreColor(r.avg)}`}>
                    {Math.round(r.avg * 10) / 10}
                    <span className="text-xs font-normal text-zinc-400">/10</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Live web results for anything not yet in RateIt */}
            <ExternalSearchResults
              q={query}
              existingTitles={results.map(r => r.title)}
            />
          </>
        )}

      </main>
    </>
  )
}
