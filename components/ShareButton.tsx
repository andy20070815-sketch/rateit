'use client'

import { useState } from 'react'
import { Share2, X, Copy, Check, Download, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { track } from '../lib/analytics'
import type { Rating } from '../lib/types'

interface Props {
  rating: Pick<Rating, 'id' | 'title' | 'score' | 'category'> & { image_url?: string | null }
  iconOnly?: boolean
}

const SITE = 'https://rateit-gamma.vercel.app'

function shareUrl(ratingId: string, platform: string) {
  return `${SITE}/r/${ratingId}?ref=share&utm_source=${platform}&utm_medium=social`
}

function shareText(title: string, score: number) {
  return `${score}/10 — ${title}`
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

  // When modal opens: reset failure flag, and fetch image if none stored on the rating
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

    // Only use Web Share API on genuine touch/mobile devices.
    // Desktop Chrome has 'share' in navigator but the native share sheet is often
    // invisible or shows no targets — always use the custom modal on desktop.
    const isTouchDevice =
      'share' in navigator &&
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches

    if (isTouchDevice) {
      // Level 2: share with image file so it appears in Instagram Stories etc.
      try {
        const storyRes = await fetch(`/r/${rating.id}/og-story`)
        if (storyRes.ok) {
          const blob = await storyRes.blob()
          const file = new File([blob], `rateit-${rating.id}.png`, { type: 'image/png' })
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: text, url })
            return
          }
        }
      } catch { /* fall through */ }

      // Level 1: URL-only share
      try {
        await navigator.share({ title: text, url })
        return
      } catch (err) {
        // User cancelled the native share sheet → do nothing
        if (err instanceof Error && err.name === 'AbortError') return
        // Any other failure → open the modal below
      }
    }

    // Desktop, or all mobile fallbacks exhausted
    setOpen(true)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl(rating.id, 'copy'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('share_initiated', { platform: 'copy', rid: rating.id })
  }

  async function downloadImage(format: 'og' | 'story'): Promise<boolean> {
    setDownloading(format)
    setDownloadError(false)
    try {
      const endpoint = format === 'og'
        ? `/r/${rating.id}/opengraph-image`
        : `/r/${rating.id}/og-story`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `rateit-${rating.title.replace(/[^a-z0-9]/gi, '-')}-${format}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
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
    const ok = await downloadImage('story')
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

            {/* Preview image */}
            {previewUrl && !previewFailed && (
              <div className="px-5 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={rating.title}
                  className="w-full rounded-xl border border-[var(--line)] object-cover"
                  style={{ aspectRatio: '16/10', maxHeight: 220 }}
                  onError={() => setPreviewFailed(true)}
                />
              </div>
            )}

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
                    onClick={() => downloadImage('og')}
                    disabled={!!downloading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors disabled:opacity-40"
                  >
                    <Download size={12} />
                    {downloading === 'og' ? t('downloading') : t('card')}
                  </button>
                  <button
                    onClick={() => downloadImage('story')}
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
