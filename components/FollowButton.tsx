'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

interface Props {
  followerId: string
  followingId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ followerId, followingId, initialIsFollowing }: Props) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    const supabase = createClient()
    setLoading(true)
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
      setIsFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
      setIsFollowing(true)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
          : 'bg-black dark:bg-white text-white dark:text-black'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
