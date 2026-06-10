import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import RatingCard from '../../components/RatingCard'
import FollowButton from '../../components/FollowButton'
import Link from 'next/link'
import type { Rating, Profile } from '../../lib/types'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const [{ data: recentRatings }, { data: suggestedUsers }, { data: myFollows }] = await Promise.all([
    supabase
      .from('ratings')
      .select('*, profiles(id, username, avatar_url)')
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .limit(10),
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id),
  ])

  const followingSet = new Set((myFollows ?? []).map((f) => f.following_id))

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Suggested users */}
        {suggestedUsers && suggestedUsers.length > 0 && (
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
                  <Link href={`/profile/${p.username}`} className="text-sm font-semibold text-center truncate w-full text-center">
                    {p.username}
                  </Link>
                  <FollowButton
                    followerId={user.id}
                    followingId={p.id}
                    initialIsFollowing={followingSet.has(p.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent ratings */}
        <section className="space-y-3">
          <h2 className="font-bold text-lg">Recent ratings</h2>
          {!recentRatings || recentRatings.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No ratings yet — be the first!</p>
          ) : (
            <div className="space-y-4">
              {(recentRatings as Rating[]).map((rating) => (
                <RatingCard key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </section>

      </main>
    </>
  )
}
