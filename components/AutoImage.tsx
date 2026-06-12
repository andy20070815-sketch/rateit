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
    return <div className={`bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl ${className}`} />
  }

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-xl ${className}`}>
        <CategoryIcon category={category} size={32} className="text-zinc-400" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={title}
      className={`object-cover rounded-xl ${className}`}
      onError={() => setUrl(null)}
    />
  )
}
