'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from '../lib/utils'
import type { Rating } from '../lib/types'
import { CATEGORY_LABELS } from '../lib/constants'
import CategoryIcon from './CategoryIcon'
import ExternalScores from './ExternalScores'
import AutoImage from './AutoImage'
import CommentsSection from './CommentsSection'
import { createClient } from '../lib/supabase/client'

interface Props {
  rating: Rating
  showUser?: boolean
}

export default function RatingCard({ rating, showUser = true }: Props) {
  const score = rating.score
  const contentHref = `/content/${rating.category}/${encodeURIComponent(rating.title)}`
  const [showComments, setShowComments] = useState(true)
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      {showUser && rating.profiles && (
        <Link href={`/profile/${rating.profiles.username}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-sm font-bold">
            {rating.profiles.avatar_url ? (
              <img src={rating.profiles.avatar_url} alt={rating.profiles.username} className="w-full h-full object-cover" />
            ) : (
              rating.profiles.username[0].toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{rating.profiles.username}</p>
            <p className="text-xs text-zinc-500">{formatDistanceToNow(rating.created_at)}</p>
          </div>
        </Link>
      )}

      <Link href={contentHref} className="block">
        {(rating.image_url && !imgFailed) ? (
          <img
            src={rating.image_url}
            alt={rating.title}
            className="w-full rounded-xl object-cover max-h-64"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <AutoImage
            title={rating.title}
            category={rating.category}
            className="w-full max-h-64 h-48"
            ratingId={rating.id}
          />
        )}
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <CategoryIcon category={rating.category} size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
              {CATEGORY_LABELS[rating.category]}
            </span>
          </div>
          <Link href={contentHref} className="font-semibold text-base hover:underline">
            {rating.title}
          </Link>
        </div>
        <div className={`text-3xl font-black ${scoreColor} shrink-0`}>
          {score}<span className="text-base font-normal text-zinc-400">/10</span>
        </div>
      </div>

      {rating.review && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{rating.review}</p>
      )}

      <ExternalScores title={rating.title} category={rating.category} />

      {/* Comment toggle */}
      <button
        onClick={() => setShowComments(v => !v)}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {showComments ? 'Hide comments' : 'View comments'}
      </button>

      {showComments && (
        <CommentsSection ratingId={rating.id} currentUserId={currentUserId} />
      )}
    </div>
  )
}
