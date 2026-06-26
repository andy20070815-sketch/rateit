'use client'

import { useState, useEffect } from 'react'
import { Share2, X, Copy, Check, Download, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { track } from '../lib/analytics'
import type { Rating } from '../lib/types'

interface Props {
  rating: Pick<Rating, 'id' | 'title' | 'score' | 'category'> & { image_url?: string | null }
  iconOnly?: boolean
}

const SITE = 'https://rateit-gamma.vercel.app'

const CAT_LABELS: Record<string, string> = {
  movie: 'Movie', tv: 'TV Show', sport: 'Sport', youtube: 'YouTube',
  music: 'Music', book: 'Book', game: 'Game', food: 'Food',
  person: 'Person', other: 'Other',
}

function shareUrl(ratingId: string, platform: string) {
  return `${SITE}/r/${ratingId}?ref=share&utm_source=${platform}&utm_medium=social`
}
function shareText(title: string, score: number) {
  return `${score}/10 — ${title}`
}
function scoreColor(s: number) {
  return s >= 8 ? '#22c55e' : s >= 5 ? '#eab308' : '#ef4444'
}

// Fetch an external image through our same-origin proxy so canvas isn't CORS-tainted
async function fetchImageBlob(externalUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(externalUrl)}`)
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

// Wrap text into lines that fit within maxWidth, return array of lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

async function buildCanvas(
  format: 'og' | 'story',
  rating: Props['rating'],
  artworkUrl: string | null
): Promise<Blob> {
  const W = format === 'og' ? 1200 : 1080
  const H = format === 'og' ? 630 : 1920

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, W, H)

  // Artwork panel dimensions
  const artW = format === 'og' ? 480 : W
  const artH = format === 'og' ? H : Math.round(H * 0.55)

  // Artwork background
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, artW, artH)

  // Draw artwork image if available
  if (artworkUrl) {
    const blobUrl = await fetchImageBlob(artworkUrl)
    if (blobUrl) {
      try {
        const img = await loadImage(blobUrl)
        drawCoverImage(ctx, img, 0, 0, artW, artH)
      } catch { /* keep dark panel */ }
      URL.revokeObjectURL(blobUrl)
    }
  }

  // Content area origin
  const cx = format === 'og' ? artW : 0
  const cy = format === 'og' ? 0 : artH
  const cw = format === 'og' ? W - artW : W
  const ch = format === 'og' ? H : H - artH
  const pad = format === 'og' ? 52 : 72

  let y = cy + pad

  // ── Score on its own line (no side-by-side measurement needed) ─────────────
  const sc = scoreColor(rating.score)
  const scoreSize = format === 'og' ? 96 : 116
  ctx.font = `900 ${scoreSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = sc
  ctx.fillText(String(rating.score), cx + pad, y + scoreSize)
  y += scoreSize + 6

  // "/10" directly below the score, left-aligned
  const slashSize = format === 'og' ? 26 : 34
  ctx.font = `600 ${slashSize}px system-ui, sans-serif`
  ctx.fillStyle = '#52525b'
  ctx.fillText('/10', cx + pad, y + slashSize)
  y += slashSize + 28

  // ── Category label ─────────────────────────────────────────────────────────
  const catSize = format === 'og' ? 14 : 20
  ctx.font = `700 ${catSize}px system-ui, sans-serif`
  ctx.fillStyle = '#71717a'
  ctx.fillText((CAT_LABELS[rating.category] ?? 'Other').toUpperCase(), cx + pad, y + catSize)
  y += catSize + 20

  // ── Title (word-wrapped) ───────────────────────────────────────────────────
  const titleSize = format === 'og' ? 34 : 52
  ctx.font = `700 ${titleSize}px system-ui, sans-serif`
  ctx.fillStyle = '#ffffff'
  const titleLines = wrapText(ctx, rating.title, cw - pad * 2).slice(0, 3)
  for (const line of titleLines) {
    ctx.fillText(line, cx + pad, y + titleSize)
    y += titleSize + 8
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = cy + ch - pad
  const brandSize = format === 'og' ? 22 : 36
  ctx.strokeStyle = '#27272a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx + pad, footerY - brandSize - 14)
  ctx.lineTo(cx + cw - pad, footerY - brandSize - 14)
  ctx.stroke()
  ctx.font = `700 ${brandSize}px system-ui, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.fillText('rateit', cx + pad, footerY)

  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas export failed')), 'image/png')
  )
}

export default function ShareButton({ rating, iconOnly = false }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState<'og' | 'story' | null>(null)
  const [downloadError, setDownloadError] = useState(false)
  const [igHint, setIgHint] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null)
  const t = useTranslations('share')

  // Force HTTPS so HTTP poster URLs (e.g. OMDB) aren't blocked as mixed-content
  const previewUrl = (rating.image_url ?? fetchedUrl)
    ? (rating.image_url ?? fetchedUrl)!.replace(/^http:\/\//, 'https://')
    : null

  // When modal opens: reset failure flag; fetch artwork if none is stored on the rating
  useEffect(() => {
    if (!open) return
    setPreviewFailed(false)
    if (rating.image_url || fetchedUrl) return
    fetch(`/api/content-image?title=${encodeURIComponent(rating.title)}&category=${rating.category}`)
      .then(r => r.json())
      .then(d => { if (d.url) setFetchedUrl(d.url) })
      .catch(() => null)
  }, [open])

  async function handleShare() {
    track('share_initiated', { platform: 'native', rid: rating.id })
    const url = shareUrl(rating.id, 'native')
    const text = shareText(rating.title, rating.score)

    const isTouchDevice =
      'share' in navigator &&
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches

    if (isTouchDevice) {
      try {
        const blob = await buildCanvas('story', rating, previewUrl)
        const file = new File([blob], `rateit-${rating.id}.png`, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: text, url })
          return
        }
      } catch { /* fall through */ }

      try {
        await navigator.share({ title: text, url })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }

    setOpen(true)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl(rating.id, 'copy'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('share_initiated', { platform: 'copy', rid: rating.id })
  }

  async function downloadCanvas(format: 'og' | 'story'): Promise<boolean> {
    setDownloading(format)
    setDownloadError(false)
    try {
      const blob = await buildCanvas(format, rating, previewUrl)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `rateit-${rating.title.replace(/[^a-z0-9]/gi, '-')}-${format}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(a.href), 100)
      track('share_initiated', { platform: `download_${format}`, rid: rating.id })
      return true
    } catch {
      setDownloadError(true)
      setTimeout(() => setDownloadError(false), 3000)
      return false
    } finally {
      setDownloading(null)
    }
  }

  async function downloadForInstagram() {
    setIgHint(false)
    const ok = await downloadCanvas('story')
    if (ok) setIgHint(true)
    track('share_initiated', { platform: 'instagram', rid: rating.id })
  }

  function openPlatform(platform: string, url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    track('share_initiated', { platform, rid: rating.id })
  }

  const encodedText = encodeURIComponent(shareText(rating.title, rating.score))
  const encodedLink = encodeURIComponent(shareUrl(rating.id, 'link'))

  return (
    <>
      <button
        onClick={handleShare}
        className={iconOnly
          ? 'bg-black/65 backdrop-blur-sm rounded-md p-1 text-white hover:bg-black/85 transition-colors'
          : 'flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors'
        }
        aria-label={t('label')}
      >
        <Share2 size={iconOnly ? 11 : 14} />
        {!iconOnly && <span>{t('label')}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-sm bg-[var(--paper)] rounded-2xl border border-[var(--line)] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
              <p className="font-semibold text-sm text-[var(--ink)]">{t('title')}</p>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview — artwork if available, branded placeholder otherwise */}
            <div className="px-5 pt-4">
              {previewUrl && !previewFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={rating.title}
                  className="w-full rounded-xl border border-[var(--line)] object-cover"
                  style={{ aspectRatio: '16/10', maxHeight: 220 }}
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div
                  className="w-full rounded-xl border border-[var(--line)] bg-zinc-900 flex flex-col items-center justify-center gap-1.5 px-4"
                  style={{ aspectRatio: '16/10', maxHeight: 220 }}
                >
                  <span className={`text-5xl font-black leading-none ${rating.score >= 8 ? 'text-green-400' : rating.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {rating.score}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {CAT_LABELS[rating.category] ?? 'Other'}
                  </span>
                  <span className="text-sm font-semibold text-white text-center line-clamp-2 leading-snug">
                    {rating.title}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-bold tracking-wider mt-1">rateit</span>
                </div>
              )}
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--line)] text-sm font-semibold hover:bg-[var(--surface)] transition-colors"
              >
                {copied
                  ? <Check size={15} className="text-green-500" />
                  : <Copy size={15} />}
                <span className={copied ? 'text-green-500' : ''}>
                  {copied ? t('copied') : t('copyLink')}
                </span>
              </button>

              {/* Download */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  {t('downloadImage')}
                </p>
                {downloadError && (
                  <p className="text-xs text-red-500">Download failed — try again</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadCanvas('og')}
                    disabled={!!downloading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors disabled:opacity-40"
                  >
                    <Download size={12} />
                    {downloading === 'og' ? t('downloading') : t('card')}
                  </button>
                  <button
                    onClick={() => downloadCanvas('story')}
                    disabled={!!downloading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors disabled:opacity-40"
                  >
                    <Download size={12} />
                    {downloading === 'story' ? t('downloading') : t('story')}
                  </button>
                </div>
              </div>

              {/* Share to social */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  {t('shareTo')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openPlatform('threads', `https://www.threads.net/intent/post?text=${encodedText}%20${encodedLink}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors"
                  >
                    <ExternalLink size={12} /> Threads
                  </button>
                  <button
                    onClick={() => openPlatform('x', `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors"
                  >
                    <ExternalLink size={12} /> X / Twitter
                  </button>
                  <button
                    onClick={() => openPlatform('whatsapp', `https://wa.me/?text=${encodedText}%20${encodedLink}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors"
                  >
                    <ExternalLink size={12} /> WhatsApp
                  </button>
                  <button
                    onClick={() => openPlatform('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors"
                  >
                    <ExternalLink size={12} /> Facebook
                  </button>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  {t('instagram')}
                </p>
                <button
                  onClick={downloadForInstagram}
                  disabled={downloading === 'story'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors disabled:opacity-40"
                >
                  <Download size={12} />
                  {downloading === 'story' ? t('downloading') : t('downloadStory')}
                </button>
                {igHint && (
                  <p className="text-xs text-[var(--muted)] text-center">{t('storyHint')}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
