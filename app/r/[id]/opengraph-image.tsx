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

// Pre-fetch artwork as a base64 data URL so Satori never has to make external
// requests at render time — external URLs are unreliable in the edge runtime.
async function fetchArtworkDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    // Upgrade HTTP → HTTPS (e.g. OMDB poster URLs use http://)
    const safeUrl = url.replace(/^http:\/\//, 'https://')
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(safeUrl, { signal: controller.signal })
    clearTimeout(t)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    // Chunked String.fromCharCode avoids O(n²) single-char concatenation
    const CHUNK = 8192
    const parts: string[] = []
    for (let i = 0; i < bytes.byteLength; i += CHUNK) {
      parts.push(String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK))))
    }
    const mime = res.headers.get('content-type') ?? 'image/jpeg'
    return `data:${mime};base64,${btoa(parts.join(''))}`
  } catch {
    return null
  }
}

async function loadInterBold(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }
    ).then(r => r.text())
    const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1]
    if (!url) return null
    return fetch(url).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

async function fetchRating(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ratings?id=eq.${id}&select=title,category,score,review,image_url,profiles(username)&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    )
    const [r] = await res.json()
    return r as { title: string; category: string; score: number; review: string | null; image_url: string | null; profiles: { username: string } | null } | undefined
  } catch {
    return undefined
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rating, fontData] = await Promise.all([fetchRating(id), loadInterBold()])

  const title = rating?.title ?? 'Rating'
  const score = rating?.score ?? 0
  const review = rating?.review ?? null
  const username = rating?.profiles?.username ?? null
  const category = rating?.category ?? 'other'
  const color = scoreColor(score)
  const catLabel = CAT_LABELS[category] ?? 'Other'

  // Pre-fetch artwork so Satori gets a data URL, not an external URL
  const artworkDataUrl = await fetchArtworkDataUrl(rating?.image_url ?? null)

  const fonts = fontData
    ? [{ name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : []

  const titleDisplay = title.length > 38 ? title.slice(0, 38) + '…' : title
  const reviewDisplay = review
    ? (review.length > 88 ? review.slice(0, 88) + '…' : review)
    : null

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: fontData ? 'Inter' : 'sans-serif',
        }}
      >
        {/* Left: artwork panel */}
        <div
          style={{
            width: 480,
            height: 630,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#18181b',
            overflow: 'hidden',
          }}
        >
          {artworkDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artworkDataUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, width: '100%', height: '100%', background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' }}>
              <div style={{ fontSize: 72, color: '#a1a1aa', fontWeight: 700 }}>{catLabel}</div>
              <div style={{ fontSize: 32, color: '#52525b', fontWeight: 700 }}>rateit</div>
            </div>
          )}
        </div>

        {/* Right: content panel */}
        <div
          style={{
            flex: 1,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 48px',
          }}
        >
          {/* Category */}
          <div style={{ fontSize: 18, color: '#71717a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>
            {catLabel}
          </div>

          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
            <span style={{ fontSize: 108, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 36, color: '#52525b', fontWeight: 700, lineHeight: 1 }}>/10</span>
          </div>

          {/* Title */}
          <div style={{ fontSize: 42, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 18 }}>
            {titleDisplay}
          </div>

          {/* Review */}
          {reviewDisplay && (
            <div style={{ fontSize: 22, color: '#a1a1aa', lineHeight: 1.55, fontWeight: 700 }}>
              &ldquo;{reviewDisplay}&rdquo;
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 22, color: '#71717a', fontWeight: 700 }}>
              {username ? `@${username}` : ''}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
              rateit
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
