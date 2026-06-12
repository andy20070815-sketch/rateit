import { NextRequest, NextResponse } from 'next/server'

export interface ExternalResult {
  title: string
  image_url: string | null
  description: string | null
  source: 'youtube' | 'wikipedia'
  category: string
}

function guessCategory(description: string | null, source: 'youtube' | 'wikipedia'): string {
  if (source === 'youtube') return 'youtube'
  const d = (description ?? '').toLowerCase()
  if (/rapper|singer|musician|band|album|hip.hop|r&b|pop star|music artist|recording artist|vocalist/.test(d)) return 'music'
  if (/footballer|soccer player|basketball player|nba|nfl|tennis player|athlete|olympian|boxer|cricketer|baseball|formula 1|racing driver/.test(d)) return 'sport'
  if (/tv series|television series|sitcom|drama series|animated series|netflix series|hbo series|streaming series/.test(d)) return 'tv'
  if (/\bfilm\b|feature film|directed by|box office|cinema release/.test(d)) return 'movie'
  if (/video game|game developer|nintendo|playstation|xbox|indie game/.test(d)) return 'game'
  if (/youtuber|youtube channel|content creator|twitch streamer|live streamer/.test(d)) return 'youtube'
  if (/restaurant|chef|cuisine|dish|recipe|food critic/.test(d)) return 'food'
  if (/novel|author|book|writer|literary|novelist|published/.test(d)) return 'book'
  // People who aren't in the above categories — influencers, models, personalities, etc.
  if (/internet personality|social media|influencer|onlyfans|tiktok|instagram model|model|personality|celebrity/.test(d)) return 'other'
  return 'other'
}

async function searchWikipedia(q: string): Promise<ExternalResult[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=8&prop=pageimages|description&piprop=thumbnail&pithumbsize=400&format=json&origin=*`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    const pages = Object.values(data.query?.pages ?? {}) as Record<string, unknown>[]
    return pages.map((p: Record<string, unknown>) => {
      const description = (p.description as string | undefined) ?? null
      return {
        title: p.title as string,
        image_url: (p.thumbnail as { source?: string } | undefined)?.source ?? null,
        description,
        source: 'wikipedia' as const,
        category: guessCategory(description, 'wikipedia'),
      }
    })
  } catch {
    return []
  }
}

async function searchYouTube(q: string): Promise<ExternalResult[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=5&type=channel,video&key=${key}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data.error) return []
    return (data.items ?? []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>
      const thumbnails = snippet.thumbnails as Record<string, { url: string }> | undefined
      const description = snippet.description as string | null
      return {
        title: (snippet.channelTitle ?? snippet.title) as string,
        image_url: thumbnails?.high?.url ?? thumbnails?.default?.url ?? null,
        description,
        source: 'youtube' as const,
        category: guessCategory(description, 'youtube'),
      }
    })
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ results: [] })

  const [wiki, yt] = await Promise.all([
    searchWikipedia(q),
    searchYouTube(q),
  ])

  // YouTube results first, then Wikipedia — deduplicate by title
  const seen = new Set<string>()
  const results: ExternalResult[] = []
  for (const r of [...yt, ...wiki]) {
    const key = r.title.toLowerCase().trim()
    if (!seen.has(key) && r.title.length > 1) {
      seen.add(key)
      results.push(r)
    }
  }

  return NextResponse.json({ results: results.slice(0, 10) })
}
