'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { createClient } from '../lib/supabase/client'
import type { StoryGroup } from '../lib/types'
import { formatDistanceToNow } from '../lib/utils'
import RatingStoryTemplate from './RatingStoryTemplate'

interface Props {
  groups: StoryGroup[]
  startGroupIndex: number
  viewerId: string
  onClose: () => void
  onMarkSeen: (storyId: string) => void
}

const STORY_DURATION = 5000

export default function StoryViewer({ groups, startGroupIndex, viewerId, onClose, onMarkSeen }: Props) {
  const [groupIndex, setGroupIndex] = useState(startGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const elapsedRef = useRef<number>(0)

  const group = groups[groupIndex]
  const story = group?.stories[storyIndex]

  const markViewed = useCallback(async (storyId: string) => {
    const supabase = createClient()
    await supabase.from('story_views').upsert(
      { story_id: storyId, viewer_id: viewerId },
      { onConflict: 'story_id,viewer_id' }
    )
    onMarkSeen(storyId)
  }, [viewerId, onMarkSeen])

  const goNext = useCallback(() => {
    elapsedRef.current = 0
    setProgress(0)
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }, [storyIndex, groupIndex, group, groups, onClose])

  const goPrev = useCallback(() => {
    elapsedRef.current = 0
    setProgress(0)
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1)
      setStoryIndex(0)
    }
  }, [storyIndex, groupIndex])

  // Auto-advance with progress bar
  useEffect(() => {
    if (!story) return
    markViewed(story.id)

    elapsedRef.current = 0
    setProgress(0)
    startTimeRef.current = Date.now()

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (paused) return
      elapsedRef.current = Date.now() - startTimeRef.current
      const pct = Math.min((elapsedRef.current / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) goNext()
    }, 50)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [story?.id, paused, goNext])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onClose])

  // Pause on hold
  function handlePointerDown() {
    setPaused(true)
    startTimeRef.current = Date.now() - elapsedRef.current
  }
  function handlePointerUp() {
    setPaused(false)
    startTimeRef.current = Date.now() - elapsedRef.current
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const x = e.clientX
    const width = e.currentTarget.clientWidth
    if (x < width / 2) goPrev()
    else goNext()
  }

  if (!group || !story) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-sm h-full max-h-[844px] select-none">

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {group.stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-0 right-0 z-30 flex items-center justify-between px-3">
          <Link
            href={`/profile/${group.profile.username}`}
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-zinc-700">
              {group.profile.avatar_url ? (
                <img src={group.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                  {group.profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-semibold">{group.profile.username}</span>
            <span className="text-white/60 text-xs">{formatDistanceToNow(story.created_at)}</span>
          </Link>
          <button onClick={onClose} className="text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Story content — template for ratings, plain image otherwise */}
        {story.rating ? (
          <RatingStoryTemplate key={story.id} rating={story.rating} />
        ) : story.image_url ? (
          <img
            src={story.image_url}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}

        {/* Tap zones */}
        <div
          className="absolute inset-0 z-20"
          onClick={handleTap}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Visible nav arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          ›
        </button>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm">{story.caption}</p>
          </div>
        )}
      </div>
    </div>
  )
}
