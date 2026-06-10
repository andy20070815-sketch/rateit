import { NextRequest, NextResponse } from 'next/server'

const ITUNES_MEDIA: Record<string, string> = {
  music: 'music',
  book: 'ebook',
  game: 'software',
  tv: 'tvShow',
  sport: 'all',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const category = searchParams.get('category')

  if (!title || !category) return NextResponse.json(null)

  const media = ITUNES_MEDIA[category]
  if (!media) return NextResponse.json(null)

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=${media}&limit=1&country=us`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()
    const item = data.results?.[0]
    if (!item) return NextResponse.json(null)

    return NextResponse.json({
      description: item.longDescription ?? item.shortDescription ?? item.description ?? null,
      genre: item.primaryGenreName ?? null,
      artist: item.artistName ?? null,
      releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : null,
      // Music specific
      album: item.collectionName ?? null,
      trackCount: item.trackCount ?? null,
      // Book specific
      pageCount: item.pageCount ?? null,
      // Game specific
      seller: item.sellerName ?? null,
    })
  } catch {
    return NextResponse.json(null)
  }
}
