'use client'

import { useEffect, useState } from 'react'
import CategoryIcon from './CategoryIcon'
import type { Category } from '../lib/types'

interface Props {
  title: string
  category: Category
  imageUrl: string | null
}

export default function SearchResultImage({ title, category, imageUrl: initialUrl }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (url) return
    fetch(`/api/content-image?title=${encodeURIComponent(title)}&category=${category}`)
      .then(r => r.json())
      .then(d => { if (d.url) setUrl(d.url) })
      .catch(() => null)
  }, [title, category])

  const fallback = (
    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
      <CategoryIcon category={category} size={24} className="text-zinc-400" strokeWidth={1.5} />
    </div>
  )

  if (!url || failed) return fallback

  return (
    <img
      src={url}
      alt={title}
      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      onError={() => setFailed(true)}
    />
  )
}
