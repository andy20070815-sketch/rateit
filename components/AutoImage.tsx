'use client'

import { useEffect, useState } from 'react'
import CategoryIcon from './CategoryIcon'
import { createClient } from '../lib/supabase/client'
import type { Category } from '../lib/types'

interface Props {
  title: string
  category: Category
  className?: string
  ratingId?: string
}

export default function AutoImage({ title, category, className = '', ratingId }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    fetch(`/api/content-image?title=${encodeURIComponent(title)}&category=${category}`)
      .then((r) => r.json())
      .then((data) => {
        setUrl(data.url)
        setTried(true)
        // Save back to DB so future loads skip this API call entirely
        if (data.url && ratingId) {
          createClient()
            .from('ratings')
            .update({ image_url: data.url })
            .eq('id', ratingId)
            .then(() => null)
        }
      })
      .catch(() => setTried(true))
  }, [title, category, ratingId])

  if (!tried) {
    return <div className={`bg-[var(--surface)] animate-pulse ${className}`} />
  }

  if (!url) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 bg-[var(--surface)] ${className}`}>
        <CategoryIcon category={category} size={28} className="text-[var(--faint)]" strokeWidth={1.5} />
        <span className="text-xs font-bold tracking-tight text-[var(--faint)]">rateit</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={title}
      className={`object-cover ${className}`}
      onError={() => setUrl(null)}
    />
  )
}
