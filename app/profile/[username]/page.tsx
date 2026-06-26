import { notFound } from 'next/navigation'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'
import { createClient, createPublicClient } from '../../../lib/supabase/server'
import Navbar from '../../../components/Navbar'
import FollowButton from '../../../components/FollowButton'
import ProfileGrid from '../../../components/ProfileGrid'
import type { Rating } from '../../../lib/types'

interface Props {
  params: Promise<{ username: string }>
}

// Cached for 60 s — shared between generateMetadata and the page render
const getProfilePublicData = unstable_cache(
  async (username: string) => {
    const supabase = createPublicClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!profile) return null

    const [{ data: ratings }, { count: followerCount }, { count: followingCount }] =
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
      ])

    return {
      profile,
      ratings: (ratings ?? []) as Rating[],
      followerCount: followerCount ?? 0,
      followingCount: followingCount ?? 0,
    }
  },
  ['profile-public-data'],
  { revalidate: 60 }
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const data = await getProfilePublicData(username)

  if (!data) return { title: 'Profile not found' }

  const { profile, ratings } = data
  const name = profile.full_name || profile.username
  const desc = `${ratings.length} ratings on rateit`

  return {
    title: `${name} (@${profile.username})`,
    description: desc,
    openGraph: {
      title: `${name} (@${profile.username})`,
      description: desc,
      images: profile.avatar_url ? [{ url: profile.avatar_url, width: 400, height: 400 }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${name} (@${profile.username})`,
      description: desc,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  // Auth-dependent (reads cookies — not cached)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentProfile = null
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    currentProfile = p
  }

  // Cached public data
  const publicData = await getProfilePublicData(username)
  if (!publicData) notFound()

  const { profile, ratings, followerCount, followingCount } = publicData

  // Viewer-specific follow check (not cached)
  let isFollowing = false
  if (user) {
    const { data: isFollowingData } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!isFollowingData
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <>
      <Navbar username={currentProfile?.username ?? ''} />
      <main className="max-w-lg mx-auto">
        {/* Profile header */}
        <div className="px-4 pt-5 pb-4 space-y-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-3xl font-black overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                (profile.username[0] ?? 'U').toUpperCase()
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-5 flex-1 justify-around">
              <div className="text-center">
                <p className="font-black text-xl leading-tight">{ratings.length}</p>
                <p className="text-xs text-zinc-500">Ratings</p>
              </div>
              <Link href={`/profile/${username}/followers`} prefetch={false} className="text-center hover:opacity-70 transition-opacity">
                <p className="font-black text-xl leading-tight">{followerCount}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </Link>
              <Link href={`/profile/${username}/following`} prefetch={false} className="text-center hover:opacity-70 transition-opacity">
                <p className="font-black text-xl leading-tight">{followingCount}</p>
                <p className="text-xs text-zinc-500">Following</p>
              </Link>
            </div>
          </div>

          {/* Name + bio */}
          <div>
            <p className="font-bold">{profile.full_name || profile.username}</p>
            {profile.full_name && <p className="text-sm text-zinc-500">@{profile.username}</p>}
            {profile.bio && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{profile.bio}</p>
            )}
          </div>

          {/* Action button */}
          {isOwnProfile ? (
            <Link
              href="/account"
              className="block w-full text-center py-2 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Edit profile
            </Link>
          ) : user ? (
            <FollowButton
              followerId={user.id}
              followingId={profile.id}
              initialIsFollowing={isFollowing}
            />
          ) : (
            <Link
              href="/login"
              className="block w-full text-center py-2 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-opacity"
            >
              Sign in to follow
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Ratings grid — no padding, edge-to-edge */}
        <ProfileGrid ratings={ratings} />

      </main>
    </>
  )
}
