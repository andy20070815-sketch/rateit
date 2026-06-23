import Link from 'next/link'
import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import ExternalSearchResults from '../../components/ExternalSearchResults'
import SearchResultImage from '../../components/SearchResultImage'
import CategoryIcon from '../../components/CategoryIcon'
import SearchBar from '../../components/SearchBar'
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

interface ProfileResult {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  ratingCount: number
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const [tSearch, tCat] = await Promise.all([
    getTranslations('search'),
    getTranslations('categories'),
  ])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    profile = p
  }

  let contentResults: EntityResult[] = []
  let peopleResults: ProfileResult[] = []

  if (query.length >= 1) {
    const [{ data: ratings }, { data: matchedProfiles }] = await Promise.all([
      supabase
        .from('ratings')
        .select('id, title, category, score, image_url')
        .ilike('title', `%${query}%`)
        .limit(500),
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(8),
    ])

    // Build content results — group by title
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

    contentResults = [...groups.values()]
      .map(g => {
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

    // Build people results — get rating count per profile
    if (matchedProfiles && matchedProfiles.length > 0) {
      const profileIds = matchedProfiles.map(p => p.id)
      const { data: ratingCounts } = await supabase
        .from('ratings')
        .select('user_id')
        .in('user_id', profileIds)

      const countMap = new Map<string, number>()
      for (const r of ratingCounts || []) {
        countMap.set(r.user_id, (countMap.get(r.user_id) ?? 0) + 1)
      }

      peopleResults = matchedProfiles.map(p => ({
        ...p,
        ratingCount: countMap.get(p.id) ?? 0,
      }))
    }
  }

  const scoreColor = (avg: number) =>
    avg >= 8 ? 'text-green-500' : avg >= 5 ? 'text-yellow-500' : 'text-red-500'

  const hasResults = contentResults.length > 0 || peopleResults.length > 0

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg md:max-w-2xl mx-auto px-4 py-4 space-y-4">

        <SearchBar />

        {!query ? (
          <div className="flex flex-col items-center py-16 gap-3 text-zinc-400">
            <Search size={36} strokeWidth={1.5} />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">{tSearch('searchAnything')}</p>
            <p className="text-sm text-center">{tSearch('searchHint')}</p>
          </div>
        ) : !hasResults ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-8 gap-2 text-zinc-400">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">{tSearch('nothingFound', { query })}</p>
            </div>
            <ExternalSearchResults q={query} existingTitles={[]} />
          </div>
        ) : (
          <>
            <h1 className="font-black text-xl">
              {tSearch('resultsFor', { query })}
            </h1>

            {/* People */}
            {peopleResults.length > 0 && (
              <section className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tSearch('people')}</p>
                <div className="space-y-2">
                  {peopleResults.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3"
                    >
                      <Link href={`/profile/${p.username}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-lg font-black overflow-hidden shrink-0">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                          ) : (
                            p.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{p.full_name || p.username}</p>
                          <p className="text-sm text-zinc-500">
                            @{p.username}
                            {p.ratingCount > 0 && (
                              <span className="ml-2">{tSearch('ratingCount', { count: p.ratingCount })}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                      <Link
                        href={`/rate?title=${encodeURIComponent('@' + p.username)}&category=person`}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-80 transition-opacity"
                      >
                        {tSearch('rate')}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Content */}
            {contentResults.length > 0 && (
              <section className="space-y-2">
                {peopleResults.length > 0 && (
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tSearch('content')}</p>
                )}
                <div className="space-y-3">
                  {contentResults.map(r => (
                    <Link
                      key={r.title.toLowerCase()}
                      href={`/content/${r.primaryCategory}/${encodeURIComponent(r.title)}`}
                      className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                    >
                      <SearchResultImage
                        title={r.title}
                        category={r.primaryCategory}
                        imageUrl={r.image_url}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{r.title}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          {r.allCategories.map(cat => (
                            <span key={cat} className="flex items-center gap-1 text-xs text-zinc-500">
                              <CategoryIcon category={cat} size={11} className="text-zinc-400" />
                              {tCat(cat as Parameters<typeof tCat>[0])}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{tSearch('ratingCount', { count: r.count })}</p>
                      </div>
                      <div className={`text-3xl font-black shrink-0 ${scoreColor(r.avg)}`}>
                        {Math.round(r.avg * 10) / 10}
                        <span className="text-xs font-normal text-zinc-400">/10</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <ExternalSearchResults
              q={query}
              existingTitles={contentResults.map(r => r.title)}
            />
          </>
        )}

      </main>
    </>
  )
}
