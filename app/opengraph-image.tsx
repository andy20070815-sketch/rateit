import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'rateit — Rate anything. See what friends think.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 120, fontWeight: 900, color: '#ffffff', letterSpacing: '-4px', lineHeight: 1 }}>
          rateit
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 36, color: '#a1a1aa', marginTop: 24, fontWeight: 400 }}>
          Rate movies, games, food, music & more.
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 48 }}>
          {['Movies', 'Games', 'Music', 'Food', 'Sports'].map(label => (
            <div
              key={label}
              style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: 100,
                padding: '10px 22px',
                fontSize: 24,
                color: '#d4d4d8',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
