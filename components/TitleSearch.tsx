'use client'

import { useState, useEffect, useRef } from 'react'
import type { Category } from '../lib/types'

interface SearchResult {
  title: string
  subtitle: string | null
  year: string | null
  image: string | null
  ratingCount: number
}

interface Props {
  category: Category
  value: string
  onChange: (value: string) => void
  onImageSelect?: (url: string) => void
}

export default function TitleSearch({ category, value, onChange, onImageSelect }: Props) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value || value.length < 1) { setResults([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&category=${category}`)
        const data = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [value, category])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(result: SearchResult) {
    onChange(result.title)
    if (onImageSelect && result.image) onImageSelect(result.image)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="e.g. Inception, Messi, MrBeast video..."
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => results.length > 0 && setOpen(true)}
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-300 border-t-black dark:border-t-white rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
          {results.map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(result)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              {/* Artwork or placeholder */}
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                {result.image ? (
                  <img src={result.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg text-zinc-400">?</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{result.title}</p>
                  {result.year && (
                    <span className="text-xs text-zinc-400 shrink-0">{result.year}</span>
                  )}
                </div>
                {result.subtitle && (
                  <p className="text-xs text-zinc-500 truncate">{result.subtitle}</p>
                )}
              </div>

              {/* Rating count badge */}
              {result.ratingCount > 0 && (
                <div className="shrink-0 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">
                  <span className="text-xs font-semibold">{result.ratingCount}</span>
                  <span className="text-xs text-zinc-500">
                    {result.ratingCount === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
