import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rating on rateit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CAT_LABELS: Record<string, string> = {
  movie: 'Movie', tv: 'TV Show', sport: 'Sport', youtube: 'YouTube',
  music: 'Music', book: 'Book', game: 'Game', food: 'Food',
  person: 'Person', other: 'Other',
}

function scoreColor(s: number) {
  return s >= 8 ? '#22c55e' : s >= 5 ? '#eab308' : '#ef4444'
}

async function fetchRating(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ratings?id=eq.${id}&select=title,category,score,review,profiles(username)&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    )
    const [r] = await res.json()
    return r as {
      title: string
      category: string
      score: number
      review: string | null
      profiles: { username: string } | null
    } | undefined
  } catch {
    return undefined
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rating = await fetchRating(id)

  const title = rating?.title ?? 'Rating'
  const score = rating?.score ?? 0
  const review = rating?.review ?? null
  const username = rating?.profiles?.username ?? null
  const category = rating?.category ?? 'other'
  const color = scoreColor(score)
  const catLabel = CAT_LABELS[category] ?? 'Other'

  const titleDisplay = title.length > 42 ? title.slice(0, 42) + '…' : title
  const reviewDisplay = review
    ? (review.length > 100 ? review.slice(0, 100) + '…' : review)
    : null

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Category */}
        <div style={{ fontSize: 20, color: '#71717a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
          {catLabel}
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 28 }}>
          <span style={{ fontSize: 120, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 40, color: '#52525b', fontWeight: 700 }}>/10</span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 20 }}>
          {titleDisplay}
        </div>

        {/* Review */}
        {reviewDisplay && (
          <div style={{ fontSize: 24, color: '#a1a1aa', lineHeight: 1.5, fontWeight: 400 }}>
            &ldquo;{reviewDisplay}&rdquo;
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #27272a', paddingTop: 24 }}>
          <div style={{ fontSize: 24, color: '#71717a', fontWeight: 600 }}>
            {username ? `@${username}` : 'rateit'}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            rateit
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
