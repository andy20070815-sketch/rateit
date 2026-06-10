'use client'

import { useEffect, useState } from 'react'

interface Score { source: string; value: string }
interface ExternalData { scores: Score[]; year?: string; genre?: string }

export default function ExternalScores({ title, category }: { title: string; category: string }) {
  const [data, setData] = useState<ExternalData | null>(null)

  const supported = ['movie', 'tv']

  useEffect(() => {
    if (!supported.includes(category)) return
    fetch(`/api/external-score?title=${encodeURIComponent(title)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
  }, [title, category])

  if (!data || data.scores.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {data.scores.map((s) => (
        <span
          key={s.source}
          className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium"
        >
          {s.source}: {s.value}
        </span>
      ))}
    </div>
  )
}
