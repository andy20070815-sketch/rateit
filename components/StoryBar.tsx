'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import StoryViewer from './StoryViewer'
import type { StoryGroup, Profile } from '../lib/types'

interface Props {
  groups: StoryGroup[]
  currentUser: Profile
  seenStoryIds: Set<string>
}

export default function StoryBar({ groups, currentUser, seenStoryIds: initialSeen }: Props) {
  const router = useRouter()
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null)
  const [seenIds, setSeenIds] = useState<Set<string>>(initialSeen)

  function openStories(index: number) {
    setOpenGroupIndex(index)
  }

  function markSeen(storyId: string) {
    setSeenIds((prev) => new Set([...prev, storyId]))
  }

  const ownGroupIndex = groups.findIndex((g) => g.profile.id === currentUser.id)
  const hasOwnStory = ownGroupIndex !== -1

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {/* Own story: ring if has story, + button if not */}
        {hasOwnStory ? (
          <button
            onClick={() => openStories(ownGroupIndex)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black">{currentUser.username[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="text-xs truncate w-16 text-center font-medium">Your story</span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/stories/new')}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover opacity-40 rounded-full" />
              ) : (
                <span className="text-xl font-black text-zinc-400">{currentUser.username[0].toUpperCase()}</span>
              )}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <PlusCircle size={14} className="text-white dark:text-black" />
              </div>
            </div>
            <span className="text-xs text-zinc-500 truncate w-16 text-center">Your story</span>
          </button>
        )}

        {/* Other users' stories (skip own since it's shown above) */}
        {groups.map((group, index) => {
          if (group.profile.id === currentUser.id) return null
          const allSeen = group.stories.every((s) => seenIds.has(s.id))
          return (
            <button
              key={group.profile.id}
              onClick={() => openStories(index)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                allSeen
                  ? 'bg-zinc-300 dark:bg-zinc-600'
                  : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  {group.profile.avatar_url ? (
                    <img src={group.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-black">
                      {group.profile.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs truncate w-16 text-center font-medium">
                {group.profile.username}
              </span>
            </button>
          )
        })}
      </div>

      {openGroupIndex !== null && (
        <StoryViewer
          groups={groups}
          startGroupIndex={openGroupIndex}
          viewerId={currentUser.id}
          onClose={() => setOpenGroupIndex(null)}
          onMarkSeen={markSeen}
        />
      )}
    </>
  )
}
