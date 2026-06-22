'use client'

import { useState } from 'react'
import { Share2, X, Copy, Check, Download, ExternalLink } from 'lucide-react'
import { track } from '../lib/analytics'
import type { Rating } from '../lib/types'

interface Props {
  rating: Pick<Rating, 'id' | 'title' | 'score'>
}

const SITE = 'https://rateit-gamma.vercel.app'

function shareUrl(ratingId: string, platform: string) {
  return `${SITE}/r/${ratingId}?ref=share&utm_source=${platform}&utm_medium=social`
}

function shareText(title: string, score: number) {
  return `${score}/10 — ${title}`
}

export default function ShareButton({ rating }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState<'og' | 'story' | null>(null)
  const [igHint, setIgHint] = useState(false)

  const isMobile = typeof navigator !== 'undefined' && 'share' in navigator

  async function handleShare() {
    track('share_initiated', { platform: 'native', rid: rating.id })

    if (isMobile) {
      const url = shareUrl(rating.id, 'native')
      const text = shareText(rating.title, rating.score)

      // Try Level 2 Web Share API with image file first (enables Instagram Stories)
      try {
        const storyRes = await fetch(`/r/${rating.id}/og-story`)
        const blob = await storyRes.blob()
        const file = new File([blob], `rateit-${rating.id}.png`, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: text, url })
          return
        }
      } catch { /* fall through */ }

      // Level 1 fallback — no file, just URL
      try {
        await navigator.share({ title: text, url })
        return
      } catch { /* user cancelled or not supported */ }
    }

    setOpen(true)
  }

  async function copyLink() {
    const url = shareUrl(rating.id, 'copy')
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('share_initiated', { platform: 'copy', rid: rating.id })
  }

  async function downloadImage(format: 'og' | 'story') {
    setDownloading(format)
    try {
      const endpoint = format === 'og' ? `/r/${rating.id}/opengraph-image` : `/r/${rating.id}/og-story`
      const res = await fetch(endpoint)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `rateit-${rating.title.replace(/[^a-z0-9]/gi, '-')}-${format}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
      track('share_initiated', { platform: `download_${format}`, rid: rating.id })
    } finally {
      setDownloading(null)
    }
  }

  async function downloadForInstagram() {
    setIgHint(false)
    await downloadImage('story')
    setIgHint(true)
    track('share_initiated', { platform: 'instagram', rid: rating.id })
  }

  function openPlatform(platform: string, url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    track('share_initiated', { platform, rid: rating.id })
  }

  const text = encodeURIComponent(shareText(rating.title, rating.score))
  const link = encodeURIComponent(shareUrl(rating.id, 'link'))

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        <Share2 size={14} />
        Share
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <p className="font-semibold text-sm">Share this rating</p>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Preview */}
            <div className="px-5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/r/${rating.id}/opengraph-image`}
                alt="Share preview"
                className="w-full rounded-xl border border-zinc-100 dark:border-zinc-800"
                style={{ aspectRatio: '1200/630' }}
              />
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>

              {/* Download */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Download image</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadImage('og')}
                    disabled={!!downloading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <Download size={12} />
                    {downloading === 'og' ? 'Downloading…' : 'Card (1200×630)'}
                  </button>
                  <button
                    onClick={() => downloadImage('story')}
                    disabled={!!downloading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <Download size={12} />
                    {downloading === 'story' ? 'Downloading…' : 'Story (1080×1920)'}
                  </button>
                </div>
              </div>

              {/* Social platforms */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Share to</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openPlatform('threads', `https://www.threads.net/intent/post?text=${text}%20${link}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink size={12} /> Threads
                  </button>
                  <button
                    onClick={() => openPlatform('x', `https://twitter.com/intent/tweet?text=${text}&url=${link}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink size={12} /> X / Twitter
                  </button>
                  <button
                    onClick={() => openPlatform('whatsapp', `https://wa.me/?text=${text}%20${link}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink size={12} /> WhatsApp
                  </button>
                  <button
                    onClick={() => openPlatform('facebook', `https://www.facebook.com/sharer/sharer.php?u=${link}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink size={12} /> Facebook
                  </button>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram</p>
                <button
                  onClick={downloadForInstagram}
                  disabled={downloading === 'story'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <Download size={12} />
                  {downloading === 'story' ? 'Downloading…' : 'Download story image'}
                </button>
                {igHint && (
                  <p className="text-xs text-zinc-500 text-center">
                    Story image saved — open Instagram and post it
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
