import { NextRequest, NextResponse } from 'next/server'

// Proxies external images so the client-side canvas can draw them without
// CORS tainting. The browser fetches /api/image-proxy?url=... (same origin),
// gets back the image bytes, then creates a blob URL — which doesn't taint canvas.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse(null, { status: 400 })

  try {
    const safeUrl = url.replace(/^http:\/\//, 'https://')
    const res = await fetch(safeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RateIt/1.0)' },
    })
    if (!res.ok) return new NextResponse(null, { status: 502 })

    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
