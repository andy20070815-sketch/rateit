import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import Navbar from '../../../components/Navbar'
import RatingCard from '../../../components/RatingCard'
import FollowButton from '../../../components/FollowButton'
import type { Rating } from '../../../lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [{ data: ratings }, { count: followerCount }, { count: followingCount }, { data: isFollowingData }] =
    await Promise.all([
      supabase
        .from('ratings')
        .select('*, profiles(id, username, avatar_url)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id),
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle(),
    ])

  const isOwnProfile = user.id === profile.id
  const isFollowing = !!isFollowingData

  return (
    <>
      <Navbar username={currentProfile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-black overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  profile.username[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="font-bold text-lg">{profile.username}</p>
                {profile.full_name && (
                  <p className="text-sm text-zinc-500">{profile.full_name}</p>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <Link
                href="/account"
                className="px-4 py-2 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Personal profile
              </Link>
            ) : (
              <FollowButton
                followerId={user.id}
                followingId={profile.id}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
          )}

          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-bold text-lg">{ratings?.length ?? 0}</p>
              <p className="text-xs text-zinc-500">Ratings</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{followerCount ?? 0}</p>
              <p className="text-xs text-zinc-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{followingCount ?? 0}</p>
              <p className="text-xs text-zinc-500">Following</p>
            </div>
          </div>
        </div>

        {/* Ratings grid */}
        <div className="space-y-4">
          {!ratings || ratings.length === 0 ? (
            <p className="text-center text-zinc-500 py-12 text-sm">No ratings yet.</p>
          ) : (
            (ratings as Rating[]).map((rating) => (
              <RatingCard key={rating.id} rating={rating} showUser={false} />
            ))
          )}
        </div>

      </main>
    </>
  )
}
