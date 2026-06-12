import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const media = ITUNES_MEDIA[category]

  // For sports, youtube, food, other — search our own ratings DB only
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get rating counts for titles matching the query in our platform
  const { data: existingRatings } = await supabase
    .from('ratings')
    .select('title')
    .eq('category', category)
    .ilike('title', `%${query}%`)
    .limit(50)

  // Count occurrences per title
  const countMap: Record<string, number> = {}
  for (const r of existingRatings ?? []) {
    countMap[r.title] = (countMap[r.title] ?? 0) + 1
  }

  if (!media) {
    // No iTunes — fetch images from YouTube (for youtube category) or Wikipedia
    let external: { title: string; image: string | null; subtitle: string | null }[] = []

    if (category === 'youtube') {
      const ytKey = process.env.YOUTUBE_API_KEY
      if (ytKey) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=8&type=channel&key=${ytKey}`
          const ytRes = await fetch(ytUrl, { cache: 'no-store' })
          const ytData = await ytRes.json()
          if (!ytData.error) {
            external = (ytData.items ?? []).map((item: Record<string, unknown>) => {
              const snippet = item.snippet as Record<string, unknown>
              const thumbnails = snippet.thumbnails as Record<string, { url: string }> | undefined
              return {
                title: (snippet.channelTitle ?? snippet.title) as string,
                image: thumbnails?.high?.url ?? thumbnails?.default?.url ?? null,
                subtitle: (snippet.description as string | null)?.slice(0, 80) || null,
              }
            })
          }
        } catch { /* ignore */ }
      }
    } else {
      // Wikipedia for sport, food, other
      try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8&prop=pageimages|description&piprop=thumbnail&pithumbsize=200&format=json&origin=*`
        const wikiRes = await fetch(wikiUrl, { cache: 'no-store' })
        const wikiData = await wikiRes.json()
        const pages = Object.values(wikiData.query?.pages ?? {}) as Record<string, unknown>[]
        external = pages.map(p => ({
          title: p.title as string,
          image: (p.thumbnail as { source?: string } | undefined)?.source ?? null,
          subtitle: (p.description as string | undefined) ?? null,
        }))
      } catch { /* ignore */ }
    }

    // Build image lookup from external results
    const imageMap = new Map(external.map(r => [r.title.toLowerCase(), r]))

    // DB results enriched with external images where available
    const dbResults = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([title, count]) => {
        const ext = imageMap.get(title.toLowerCase())
        return { title, subtitle: ext?.subtitle ?? null, year: null, image: ext?.image ?? null, ratingCount: count }
      })

    // External results not already in DB
    const dbTitles = new Set(Object.keys(countMap).map(t => t.toLowerCase()))
    const newResults = external
      .filter(r => !dbTitles.has(r.title.toLowerCase()))
      .slice(0, 4)
      .map(r => ({ title: r.title, subtitle: r.subtitle, year: null, image: r.image, ratingCount: 0 }))

    return NextResponse.json([...dbResults, ...newResults].slice(0, 7))
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=${media}&limit=8&country=us`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    const results = (data.results ?? []).map((item: Record<string, string>, index: number) => {
      const title = item.trackName ?? item.collectionName ?? item.artistName ?? ''
      const subtitle =
        category === 'music'
          ? `${item.artistName ?? ''}${item.collectionName ? ' · ' + item.collectionName : ''}`
          : category === 'book'
          ? item.artistName ?? ''
          : category === 'game'
          ? item.artistName ?? ''
          : item.artistName ?? ''

      const year =
        item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : null

      return {
        title,
        subtitle: subtitle || null,
        year,
        image: item.artworkUrl100 ?? null,
        ratingCount: countMap[title] ?? 0,
        // iTunes ranks by popularity — index 0 is the most popular result
        itunesPopularity: index,
      }
    })

    // Merge in any DB-only results that didn't appear in iTunes
    const itunesTitles = new Set(results.map((r: { title: string }) => r.title))
    for (const [title, count] of Object.entries(countMap)) {
      if (!itunesTitles.has(title)) {
        results.push({ title, subtitle: null, year: null, image: null, ratingCount: count, itunesPopularity: 999 })
      }
    }

    // Sort: items rated on our platform first, then by iTunes popularity
    results.sort((a: { ratingCount: number; itunesPopularity: number }, b: { ratingCount: number; itunesPopularity: number }) => {
      if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount
      return a.itunesPopularity - b.itunesPopularity
    })

    return NextResponse.json(results.slice(0, 7))
  } catch {
    return NextResponse.json([])
  }
}
