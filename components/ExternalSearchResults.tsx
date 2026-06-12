'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Globe } from 'lucide-react'
import SafeImage from './SafeImage'
import type { ExternalResult } from '../app/api/search/external/route'

export default function ExternalSearchResults({
  q,
  existingTitles,
}: {
  q: string
  existingTitles: string[]
}) {
  const [results, setResults] = useState<ExternalResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) return
    const existing = new Set(existingTitles.map(t => t.toLowerCase()))

    fetch(`/api/search/external?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => {
        const filtered = (d.results as ExternalResult[]).filter(
          r => !existing.has(r.title.toLowerCase().trim())
        )
        setResults(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q])

  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Searching the web…</p>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3">
            <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-2/3" />
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!results.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide px-2">Not on RateIt yet</p>
        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {results.map(r => (
        <Link
          key={r.title}
          href={`/rate?title=${encodeURIComponent(r.title)}&category=${r.category}`}
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
        >
          {r.image_url ? (
            <SafeImage
              src={r.image_url}
              alt={r.title}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              fallback={
                <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {r.source === 'youtube' ? <Play size={20} className="text-zinc-400" /> : <Globe size={20} className="text-zinc-400" />}
                </div>
              }
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
              {r.source === 'youtube' ? <Play size={20} className="text-zinc-400" /> : <Globe size={20} className="text-zinc-400" />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{r.title}</p>
            {r.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{r.description}</p>
            )}
            <p className="text-xs text-zinc-400 mt-1">No ratings yet</p>
          </div>

          <span className="text-xs font-semibold shrink-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-xl">
            Rate first
          </span>
        </Link>
      ))}
    </div>
  )
}
