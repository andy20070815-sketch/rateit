'use client'

import { useEffect, useState } from 'react'
import type { Category } from '../lib/types'

interface OmdbInfo {
  plot?: string
  genre?: string
  director?: string
  actors?: string
  runtime?: string
  year?: string
  rated?: string
  awards?: string
}

interface ItunesInfo {
  description?: string
  genre?: string
  artist?: string
  album?: string
  releaseDate?: string
  trackCount?: number
  pageCount?: number
  seller?: string
}

interface Props {
  title: string
  category: Category
}

export default function ContentDescription({ title, category }: Props) {
  const [omdb, setOmdb] = useState<OmdbInfo | null>(null)
  const [itunes, setItunes] = useState<ItunesInfo | null>(null)

  const isFilm = category === 'movie' || category === 'tv'
  const hasItunes = ['music', 'book', 'game', 'tv'].includes(category)

  useEffect(() => {
    if (isFilm) {
      fetch(`/api/external-score?title=${encodeURIComponent(title)}`)
        .then((r) => r.json())
        .then(setOmdb)
        .catch(() => null)
    }
    if (hasItunes) {
      fetch(`/api/content-info?title=${encodeURIComponent(title)}&category=${category}`)
        .then((r) => r.json())
        .then(setItunes)
        .catch(() => null)
    }
  }, [title, category])

  const hasSomething = omdb?.plot || omdb?.genre || itunes?.description || itunes?.genre

  if (!hasSomething) return null

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
      <h2 className="font-bold text-base">About</h2>

      {/* Plot / description */}
      {(omdb?.plot || itunes?.description) && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {omdb?.plot ?? itunes?.description}
        </p>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3">
        {omdb?.genre && <Meta label="Genre" value={omdb.genre} />}
        {omdb?.director && <Meta label="Director" value={omdb.director} />}
        {omdb?.actors && <Meta label="Cast" value={omdb.actors} />}
        {omdb?.runtime && <Meta label="Runtime" value={omdb.runtime} />}
        {omdb?.year && <Meta label="Year" value={omdb.year} />}
        {omdb?.rated && <Meta label="Rated" value={omdb.rated} />}

        {itunes?.artist && <Meta label="Artist" value={itunes.artist} />}
        {itunes?.album && <Meta label="Album" value={itunes.album} />}
        {itunes?.genre && !omdb?.genre && <Meta label="Genre" value={itunes.genre} />}
        {itunes?.releaseDate && <Meta label="Released" value={itunes.releaseDate} />}
        {itunes?.trackCount && <Meta label="Tracks" value={String(itunes.trackCount)} />}
        {itunes?.pageCount && <Meta label="Pages" value={String(itunes.pageCount)} />}
        {itunes?.seller && <Meta label="Developer" value={itunes.seller} />}
      </div>

      {omdb?.awards && (
        <p className="text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          🏆 {omdb.awards}
        </p>
      )}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5 leading-snug">{value}</p>
    </div>
  )
}
