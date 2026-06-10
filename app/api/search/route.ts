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
    // No iTunes for this category — return matches from our DB
    const titles = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([title, count]) => ({ title, subtitle: null, image: null, ratingCount: count }))
    return NextResponse.json(titles)
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
