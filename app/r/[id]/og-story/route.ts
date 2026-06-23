import { ImageResponse } from 'next/og'
import React from 'react'

export const runtime = 'edge'

const CAT_LABELS: Record<string, string> = {
  movie: 'Movie', tv: 'TV Show', sport: 'Sport', youtube: 'YouTube',
  music: 'Music', book: 'Book', game: 'Game', food: 'Food',
  person: 'Person', other: 'Other',
}

function scoreColor(s: number) {
  return s >= 8 ? '#22c55e' : s >= 5 ? '#eab308' : '#ef4444'
}

async function fetchArtworkDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    const mime = res.headers.get('content-type') ?? 'image/jpeg'
    return `data:${mime};base64,${btoa(binary)}`
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

const e = React.createElement

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [rating, fontData] = await Promise.all([fetchRating(id), loadInterBold()])

  const title = rating?.title ?? 'Rating'
  const score = rating?.score ?? 0
  const review = rating?.review ?? null
  const username = rating?.profiles?.username ?? null
  const category = rating?.category ?? 'other'
  const color = scoreColor(score)
  const catLabel = CAT_LABELS[category] ?? 'Other'

  // Pre-fetch artwork as data URL so Satori doesn't make external requests
  const artworkDataUrl = await fetchArtworkDataUrl(rating?.image_url ?? null)

  const fonts = fontData
    ? [{ name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : []

  const titleDisplay = title.length > 32 ? title.slice(0, 32) + '…' : title
  const reviewDisplay = review
    ? (review.length > 100 ? review.slice(0, 100) + '…' : review)
    : null

  const artworkContent = artworkDataUrl
    ? e('img', { src: artworkDataUrl, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } } as React.ImgHTMLAttributes<HTMLImageElement> & { style: React.CSSProperties })
    : e('div', { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 20 } },
        e('div', { style: { fontSize: 120, color: '#3f3f46', fontWeight: 700 } }, catLabel)
      )

  const tree = e('div', {
    style: {
      width: 1080,
      height: 1920,
      display: 'flex',
      flexDirection: 'column' as const,
      background: '#09090b',
      fontFamily: fontData ? 'Inter' : 'sans-serif',
    }
  },
    // Top: artwork
    e('div', {
      style: {
        width: 1080,
        height: 1050,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#18181b',
        overflow: 'hidden',
      }
    }, artworkContent),

    // Bottom: content
    e('div', {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '64px 72px',
      }
    },
      // Score row
      e('div', { style: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 } },
        e('span', { style: { fontSize: 130, fontWeight: 700, color, lineHeight: 1 } }, String(score)),
        e('span', { style: { fontSize: 48, color: '#52525b', fontWeight: 700 } }, '/10')
      ),

      // Category
      e('div', { style: { fontSize: 26, color: '#71717a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 28 } }, catLabel),

      // Title
      e('div', { style: { fontSize: 62, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 24 } }, titleDisplay),

      // Review
      ...(reviewDisplay
        ? [e('div', { style: { fontSize: 30, color: '#a1a1aa', lineHeight: 1.55, fontWeight: 700 } }, `“${reviewDisplay}”`)]
        : []),

      // Spacer
      e('div', { style: { flex: 1 } }),

      // Username
      ...(username
        ? [e('div', { style: { fontSize: 30, color: '#71717a', fontWeight: 700, marginBottom: 20 } }, `@${username}`)]
        : []),

      // Footer
      e('div', { style: { display: 'flex', flexDirection: 'column' as const, gap: 8 } },
        e('div', { style: { fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-2px' } }, 'rateit'),
        e('div', { style: { fontSize: 22, color: '#52525b', fontWeight: 700 } }, 'Rate anything. See what friends think.')
      )
    )
  )

  return new ImageResponse(tree, { width: 1080, height: 1920, fonts })
}
