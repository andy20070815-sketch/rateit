import { NextRequest, NextResponse } from 'next/server'

const ITUNES_MEDIA: Record<string, string> = {
  music: 'music',
  book: 'ebook',
  game: 'software',
}

async function getWikipediaImage(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 }, headers: { 'User-Agent': 'RateIt/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail?.source ?? null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const category = searchParams.get('category')

  if (!title || !category) return NextResponse.json({ url: null })

  try {
    // Movies & TV — OMDB poster
    if (category === 'movie' || category === 'tv') {
      const apiKey = process.env.OMDB_API_KEY
      if (!apiKey) return NextResponse.json({ url: null })

      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`,
        { next: { revalidate: 86400 } }
      )
      const data = await res.json()
      const url = data.Poster && data.Poster !== 'N/A' ? data.Poster : null
      return NextResponse.json({ url })
    }

    // Music, books, games — iTunes artwork with word-match validation
    const itunesMedia = ITUNES_MEDIA[category]
    if (itunesMedia) {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=${itunesMedia}&limit=1&country=us`,
        { next: { revalidate: 86400 } }
      )
      const data = await res.json()
      const item = data.results?.[0]

      const resultTitle = (item?.trackName ?? item?.collectionName ?? item?.artistName ?? '').toLowerCase()
      const queryWords = title.toLowerCase().split(' ').filter(w => w.length > 3)
      const matchCount = queryWords.filter(w => resultTitle.includes(w)).length
      const isMatch = queryWords.length === 0 || matchCount / queryWords.length >= 0.5

      const url = (item && isMatch) ? (item.artworkUrl100?.replace('100x100', '400x400') ?? null) : null
      return NextResponse.json({ url })
    }

    // Sport, YouTube, food, other — Wikipedia image
    const url = await getWikipediaImage(title)
    return NextResponse.json({ url })

  } catch {
    return NextResponse.json({ url: null })
  }
}
