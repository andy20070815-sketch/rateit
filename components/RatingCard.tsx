'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, isVideoUrl } from '../lib/utils'
import type { Rating } from '../lib/types'
import { CATEGORY_LABELS } from '../lib/constants'
import CategoryIcon from './CategoryIcon'
import ExternalScores from './ExternalScores'
import AutoImage from './AutoImage'
import CommentsSection from './CommentsSection'
import ShareButton from './ShareButton'
import { createClient } from '../lib/supabase/client'

interface Props {
  rating: Rating
  showUser?: boolean
}

export default function RatingCard({ rating, showUser = true }: Props) {
  const score = rating.score
  const contentHref = `/content/${rating.category}/${encodeURIComponent(rating.title)}`
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  const scoreColor =
    score >= 8 ? 'text-green-500' :
    score >= 5 ? 'text-yellow-500' :
    'text-red-500'

  return (
    <div className="bg-[var(--paper)] rounded-2xl border border-[var(--line)] overflow-hidden">
      {/* Author */}
      {showUser && rating.profiles && (
        <Link href={`/profile/${rating.profiles.username}`} className="flex items-center gap-2.5 px-4 pt-4">
          <div className="w-7 h-7 rounded-full bg-[var(--surface)] overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0">
            {rating.profiles.avatar_url ? (
              <img src={rating.profiles.avatar_url} alt={rating.profiles.username} className="w-full h-full object-cover" />
            ) : (
              rating.profiles.username[0].toUpperCase()
            )}
          </div>
          <span className="text-sm font-semibold leading-none flex-1 text-[var(--ink)]">{rating.profiles.username}</span>
          <span className="text-[11px] text-[var(--muted)]">{formatDistanceToNow(rating.created_at)}</span>
        </Link>
      )}

      {/* Artwork — 16:10 */}
      <div className={`${showUser && rating.profiles ? 'mt-3' : ''} aspect-[16/10] w-full overflow-hidden`}>
        {rating.image_url && isVideoUrl(rating.image_url) ? (
          <video src={rating.image_url} className="w-full h-full object-cover" controls playsInline muted loop />
        ) : (rating.image_url && !imgFailed) ? (
          <Link href={contentHref} className="block w-full h-full">
            <img
              src={rating.image_url}
              alt={rating.title}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          </Link>
        ) : (
          <Link href={contentHref} className="block w-full h-full">
            <AutoImage title={rating.title} category={rating.category} className="w-full h-full" ratingId={rating.id} />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        {/* Category */}
        <div className="flex items-center gap-1.5">
          <CategoryIcon category={rating.category} size={12} className="text-[var(--muted)]" />
          <span className="text-[11px] text-[var(--muted)] uppercase tracking-widest font-semibold">
            {CATEGORY_LABELS[rating.category]}
          </span>
        </div>

        {/* Title */}
        <Link href={contentHref} className="block text-[15px] font-semibold text-[var(--ink)] hover:opacity-70 transition-opacity leading-snug">
          {rating.title}
        </Link>

        {/* Score + review */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[52px] font-black leading-none tabular-nums ${scoreColor}`}
              style={{ fontFamily: 'var(--font-space-grotesk, var(--font-sans))' }}
            >
              {score}
            </span>
            <span className="text-sm text-[var(--muted)] font-medium">/10</span>
          </div>
          {rating.review && (
            <p className="text-sm text-[var(--muted)] leading-relaxed">{rating.review}</p>
          )}
        </div>

        {/* External scores */}
        <ExternalScores title={rating.title} category={rating.category} />

        {/* Action row */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {showComments
              ? 'Hide'
              : commentCount !== null
                ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}`
                : 'Comments'}
          </button>
          <ShareButton rating={rating} />
        </div>

        {showComments && (
          <CommentsSection ratingId={rating.id} currentUserId={currentUserId} onCountChange={setCommentCount} />
        )}
      </div>
    </div>
  )
}
