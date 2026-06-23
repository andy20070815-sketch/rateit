'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { formatDistanceToNow } from '../lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { id: string; username: string; avatar_url: string | null }
}

interface Props {
  ratingId: string
  currentUserId: string | null
  onCountChange?: (count: number) => void
}

export default function CommentsSection({ ratingId, currentUserId, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [posting, setPosting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('comments')
  const locale = useLocale()

  useEffect(() => {
    fetch(`/api/comments?ratingId=${ratingId}`)
      .then(r => r.json())
      .then(d => {
        const loaded = d.comments || []
        setComments(loaded)
        setLoading(false)
        onCountChange?.(loaded.length)
      })
  }, [ratingId])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || posting) return
    setPosting(true)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratingId, content: input.trim() }),
    })
    const data = await res.json()
    if (data.comment) {
      setComments(prev => {
        const next = [...prev, data.comment]
        onCountChange?.(next.length)
        return next
      })
      setInput('')
    }
    setPosting(false)
  }

  async function handleDelete(commentId: string) {
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    setComments(prev => {
      const next = prev.filter(c => c.id !== commentId)
      onCountChange?.(next.length)
      return next
    })
  }

  return (
    <div className="border-t border-[var(--line)] pt-3 space-y-3">
      {loading ? (
        <p className="text-xs text-[var(--muted)] px-1">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[var(--muted)] px-1">{t('empty')}</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2 group">
              <Link href={`/profile/${c.profiles.username}`} prefetch={false}>
                <div className="w-6 h-6 rounded-full bg-[var(--surface)] flex-shrink-0 overflow-hidden">
                  {c.profiles.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--muted)]">
                      {c.profiles.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">
                  <Link href={`/profile/${c.profiles.username}`} prefetch={false} className="font-semibold hover:underline mr-1">
                    {c.profiles.username}
                  </Link>
                  <span className="text-[var(--muted)]">{c.content}</span>
                </p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{formatDistanceToNow(c.created_at, locale)}</p>
              </div>
              {currentUserId === c.user_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-[var(--muted)] hover:text-red-400 transition-all flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handlePost} className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('placeholder')}
            maxLength={300}
            className="flex-1 text-xs bg-[var(--surface)] rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--line)] placeholder-[var(--muted)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || posting}
            className="text-xs font-semibold text-[var(--ink)] disabled:opacity-30 transition-opacity"
          >
            {t('post')}
          </button>
        </form>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          <Link href="/login" className="font-semibold underline">{t('signIn')}</Link>{' '}{t('signInTo')}
        </p>
      )}
    </div>
  )
}
