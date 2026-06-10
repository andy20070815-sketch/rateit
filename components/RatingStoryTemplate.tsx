'use client'

import { useEffect, useState } from 'react'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../lib/constants'
import type { Rating } from '../lib/types'

export default function RatingStoryTemplate({ rating }: { rating: Rating }) {
  const [imageUrl, setImageUrl] = useState<string | null>(rating.image_url)

  useEffect(() => {
    if (imageUrl) return
    fetch(`/api/content-image?title=${encodeURIComponent(rating.title)}&category=${rating.category}`)
      .then((r) => r.json())
      .then((d) => { if (d.url) setImageUrl(d.url) })
      .catch(() => null)
  }, [rating.title, rating.category])

  const scoreColor =
    rating.score >= 8 ? '#22c55e' :
    rating.score >= 5 ? '#eab308' :
    '#ef4444'

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Blurred background */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(24px) brightness(0.35)' }}
        />
      )}

      {/* Content card */}
      <div className="relative z-10 w-[85%] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        {/* Poster image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={rating.title}
            className="w-full h-52 object-cover"
          />
        )}

        <div className="p-5 space-y-3">
          {/* Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{CATEGORY_EMOJI[rating.category]}</span>
            <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">
              {CATEGORY_LABELS[rating.category]}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-black text-2xl leading-tight">{rating.title}</h2>

          {/* Score */}
          <div className="flex items-end gap-2">
            <span className="font-black text-6xl leading-none" style={{ color: scoreColor }}>
              {rating.score}
            </span>
            <span className="text-white/40 text-xl mb-1">/10</span>
          </div>

          {/* Review */}
          {rating.review && (
            <p className="text-white/80 text-sm leading-relaxed italic">
              "{rating.review}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
