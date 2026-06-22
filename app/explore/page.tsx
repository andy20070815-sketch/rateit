import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import RatingCard from '../../components/RatingCard'
import FollowButton from '../../components/FollowButton'
import Link from 'next/link'
import type { Rating, Profile } from '../../lib/types'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    profile = p
  }

  // Get followed IDs first so we can exclude them from suggestions
  let followedIds: string[] = []
  if (user) {
    const { data: myFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    followedIds = (myFollows ?? []).map(f => f.following_id)
  }
  const followingSet = new Set(followedIds)

  // Build exclude list: self + already followed
  const excludeIds = user ? [user.id, ...followedIds] : []

  // Both queries run in parallel, profiles already filtered in DB
  const [{ data: recentRatings }, { data: suggestedUsers }] = await Promise.all([
    supabase
      .from('ratings')
      .select('*, profiles(id, username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30),
    excludeIds.length > 0
      ? supabase.from('profiles').select('*').not('id', 'in', `(${excludeIds.join(',')})`).limit(5)
      : supabase.from('profiles').select('*').limit(5),
  ])

  const filteredRatings = user
    ? (recentRatings ?? []).filter((r: any) => r.user_id !== user.id)
    : (recentRatings ?? [])

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Suggested users */}
        {(suggestedUsers ?? []).length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-lg">People to follow</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {(suggestedUsers as Profile[]).map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shrink-0 w-36"
                >
                  <Link href={`/profile/${p.username}`}>
                    <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xl font-black overflow-hidden">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                      ) : (
                        p.username[0].toUpperCase()
                      )}
                    </div>
                  </Link>
                  <Link href={`/profile/${p.username}`} className="text-sm font-semibold text-center truncate w-full">
                    {p.username}
                  </Link>
                  {user ? (
                    <FollowButton
                      followerId={user.id}
                      followingId={p.id}
                      initialIsFollowing={followingSet.has(p.id)}
                    />
                  ) : (
                    <Link
                      href="/login"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity"
                    >
                      Follow
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent ratings */}
        <section className="space-y-3">
          <h2 className="font-bold text-lg">Recent ratings</h2>
          {filteredRatings.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No ratings yet — be the first!</p>
          ) : (
            <div className="space-y-4">
              {(filteredRatings as Rating[]).map((rating) => (
                <RatingCard key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </section>

      </main>
    </>
  )
}
