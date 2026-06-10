'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { CATEGORY_EMOJI } from '../../../lib/constants'
import type { Rating } from '../../../lib/types'

export default function NewStoryPage() {
  const router = useRouter()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setRatings(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function shareAsStory(rating: Rating) {
    setPosting(rating.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('stories').insert({
      user_id: user.id,
      image_url: rating.image_url || '',
      rating_id: rating.id,
    })

    router.push('/feed')
  }

  const scoreColor = (score: number) =>
    score >= 8 ? 'text-green-500' :
    score >= 5 ? 'text-yellow-500' :
    'text-red-500'

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => router.back()} className="text-white/60 text-sm">Cancel</button>
        <p className="text-white font-semibold">Share a Rating</p>
        <div className="w-12" />
      </div>

      <div className="px-4 py-5 space-y-4">
        <p className="text-white/50 text-sm">Pick a rating to share as your story</p>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">⭐</p>
            <p className="text-white font-semibold">No ratings yet</p>
            <p className="text-white/40 text-sm">Post a rating first, then share it as a story</p>
            <button
              onClick={() => router.push('/rate')}
              className="mt-2 px-6 py-2.5 bg-white text-black rounded-xl font-semibold text-sm"
            >
              Rate something
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {ratings.map((rating) => (
              <button
                key={rating.id}
                onClick={() => shareAsStory(rating)}
                disabled={posting === rating.id}
                className="w-full flex items-center gap-4 bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl p-4 text-left transition-colors disabled:opacity-50"
              >
                {/* Artwork */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0 flex items-center justify-center text-2xl">
                  {rating.image_url ? (
                    <img src={rating.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    CATEGORY_EMOJI[rating.category]
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{rating.title}</p>
                  <p className="text-white/40 text-xs mt-0.5 capitalize">{rating.category}</p>
                  {rating.review && (
                    <p className="text-white/50 text-xs mt-1 truncate italic">"{rating.review}"</p>
                  )}
                </div>

                <div className={`text-2xl font-black shrink-0 ${scoreColor(rating.score)}`}>
                  {rating.score}
                  <span className="text-sm font-normal text-white/30">/10</span>
                </div>

                {posting === rating.id && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
