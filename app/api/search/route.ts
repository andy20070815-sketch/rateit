import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import type { Category } from '../../../lib/types'

const ITUNES_MEDIA: Record<string, string> = {
  movie: 'movie',
  tv: 'tvShow',
  music: 'music',
  book: 'ebook',
  game: 'software',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category') ?? 'movie'

  if (!query || query.length < 1) return NextResponse.json([])

  const supabase = await createClient()

  // Search DB across ALL categories so results are consistent everywhere
  const { data: existingRatings } = await supabase
    .from('ratings')
    .select('title, category, image_url')
    .ilike('title', `%${query}%`)
    .limit(200)

  // Group by title: track count per category + best image
  const groups: Record<string, { catCounts: Record<string, number>; image: string | null }> = {}
  for (const r of existingRatings ?? []) {
    if (!groups[r.title]) groups[r.title] = { catCounts: {}, image: null }
    groups[r.title].catCounts[r.category] = (groups[r.title].catCounts[r.category] ?? 0) + 1
    if (!groups[r.title].image && r.image_url) groups[r.title].image = r.image_url
  }

  // Build sorted DB results with primary category
  const dbResults = Object.entries(groups).map(([title, g]) => {
    const sorted = Object.entries(g.catCounts).sort((a, b) => b[1] - a[1])
    const primaryCategory = sorted[0][0] as Category
    const ratingCount = Object.values(g.catCounts).reduce((a, b) => a + b, 0)
    return { title, category: primaryCategory, image: g.image, ratingCount, subtitle: null as string | null, year: null as string | null }
  }).sort((a, b) => b.ratingCount - a.ratingCount)

  const dbTitles = new Set(dbResults.map(r => r.title.toLowerCase()))
  const media = ITUNES_MEDIA[category]

  // Fetch external results based on the hint category for suggestions beyond DB
  let external: { title: string; image: string | null; subtitle: string | null; year: string | null; category: Category }[] = []

  if (media) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=${media}&limit=8&country=us`
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      external = (data.results ?? []).map((item: Record<string, string>) => {
        const title = item.trackName ?? item.collectionName ?? item.artistName ?? ''
        const subtitle =
          category === 'music'
            ? `${item.artistName ?? ''}${item.collectionName ? ' · ' + item.collectionName : ''}`
            : item.artistName ?? ''
        const year = item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : null
        return { title, category: category as Category, image: item.artworkUrl100 ?? null, subtitle: subtitle || null, year }
      }).filter((r: { title: string }) => r.title && !dbTitles.has(r.title.toLowerCase()))
    } catch { /* ignore */ }
  } else if (category === 'person') {
    // Search profiles by username or display name
    try {
      const searchQuery = query.startsWith('@') ? query.slice(1) : query
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(6)
      external = (profiles ?? [])
        .map(p => ({
          title: `@${p.username}`,
          category: 'person' as Category,
          image: p.avatar_url ?? null,
          subtitle: p.full_name ?? null,
          year: null,
        }))
        .filter(r => !dbTitles.has(r.title.toLowerCase()))
    } catch { /* ignore */ }
  } else if (category === 'youtube') {
    const ytKey = process.env.YOUTUBE_API_KEY
    if (ytKey) {
      try {
        const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=6&type=channel&key=${ytKey}`
        const ytRes = await fetch(ytUrl, { cache: 'no-store' })
        const ytData = await ytRes.json()
        if (!ytData.error) {
          external = (ytData.items ?? [])
            .map((item: Record<string, unknown>) => {
              const snippet = item.snippet as Record<string, unknown>
              const thumbnails = snippet.thumbnails as Record<string, { url: string }> | undefined
              return {
                title: (snippet.channelTitle ?? snippet.title) as string,
                category: 'youtube' as Category,
                image: thumbnails?.high?.url ?? thumbnails?.default?.url ?? null,
                subtitle: (snippet.description as string | null)?.slice(0, 80) || null,
                year: null,
              }
            })
            .filter((r: { title: string }) => r.title && !dbTitles.has(r.title.toLowerCase()))
        }
      } catch { /* ignore */ }
    }
  } else {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8&prop=pageimages|description&piprop=thumbnail&pithumbsize=200&format=json&origin=*`
      const wikiRes = await fetch(wikiUrl, { cache: 'no-store' })
      const wikiData = await wikiRes.json()
      const pages = Object.values(wikiData.query?.pages ?? {}) as Record<string, unknown>[]
      external = pages
        .map(p => ({
          title: p.title as string,
          category: category as Category,
          image: (p.thumbnail as { source?: string } | undefined)?.source ?? null,
          subtitle: (p.description as string | undefined) ?? null,
          year: null,
        }))
        .filter(r => r.title && !dbTitles.has(r.title.toLowerCase()))
    } catch { /* ignore */ }
  }

  // DB results first (up to 5), then external suggestions not already in DB (up to 3)
  const combined = [
    ...dbResults.slice(0, 5).map(r => ({ ...r, ratingCount: r.ratingCount })),
    ...external.slice(0, 3).map(r => ({ ...r, ratingCount: 0 })),
  ]

  return NextResponse.json(combined.slice(0, 8))
}
