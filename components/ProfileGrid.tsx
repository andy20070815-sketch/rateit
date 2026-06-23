'use client'

import Link from 'next/link'
import CategoryIcon from './CategoryIcon'
import ShareButton from './ShareButton'
import type { Rating } from '../lib/types'

export default function ProfileGrid({ ratings }: { ratings: Rating[] }) {
  if (!ratings.length) {
    return <p className="text-center text-zinc-500 py-16 text-sm">No ratings yet.</p>
  }

  const scoreColor = (s: number) =>
    s >= 8 ? 'text-green-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5">
      {ratings.map(r => (
        // Outer div — grouping context for hover; NOT a link so ShareButton can be a sibling
        <div
          key={r.id}
          className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden group"
        >
          {/* Navigation link covers the whole cell */}
          <Link
            href={`/content/${r.category}/${encodeURIComponent(r.title)}`}
            prefetch={false}
            className="absolute inset-0 z-0 block"
          >
            {r.image_url ? (
              <img
                src={r.image_url}
                alt={r.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-zinc-100 dark:bg-zinc-800">
                <CategoryIcon category={r.category} size={28} strokeWidth={1.5} className="text-zinc-400" />
                <span className="text-[10px] font-medium text-zinc-400 px-1 text-center truncate w-full leading-tight">
                  {r.title}
                </span>
              </div>
            )}
          </Link>

          {/* Score badge — bottom-right, above the link */}
          <div className="absolute bottom-1.5 right-1.5 z-10 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-baseline gap-0.5 pointer-events-none">
            <span className={`text-sm font-black leading-none ${scoreColor(r.score)}`}>{r.score}</span>
            <span className="text-[9px] text-white/60 leading-none">/10</span>
          </div>

          {/* Share button — bottom-left, above the link. Always visible. */}
          <div className="absolute bottom-1.5 left-1.5 z-10">
            <ShareButton
              rating={{ id: r.id, title: r.title, score: r.score }}
              iconOnly
            />
          </div>
        </div>
      ))}
    </div>
  )
}
