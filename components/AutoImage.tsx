'use client'

import { useEffect, useState } from 'react'
import { CATEGORY_EMOJI } from '../lib/constants'
import type { Category } from '../lib/types'

interface Props {
  title: string
  category: Category
  className?: string
}

export default function AutoImage({ title, category, className = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    fetch(`/api/content-image?title=${encodeURIComponent(title)}&category=${category}`)
      .then((r) => r.json())
      .then((data) => { setUrl(data.url); setTried(true) })
      .catch(() => setTried(true))
  }, [title, category])

  if (!tried) {
    // Loading skeleton
    return <div className={`bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl ${className}`} />
  }

  if (!url) {
    // Fallback: gradient placeholder with emoji
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-xl ${className}`}>
        <span className="text-4xl">{CATEGORY_EMOJI[category]}</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={title}
      className={`object-cover rounded-xl ${className}`}
    />
  )
}
