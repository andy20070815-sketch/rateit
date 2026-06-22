import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/server'
import Navbar from '../../../../components/Navbar'
import FollowButton from '../../../../components/FollowButton'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return { title: `People following @${username}` }
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let currentProfile = null
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    currentProfile = p
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Get all followers with their profile info
  const { data: follows } = await supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)')
    .eq('following_id', profile.id)
    .order('created_at', { ascending: false })

  const followers = ((follows ?? []).map(f => f.profiles).filter(Boolean) as unknown) as {
    id: string; username: string; full_name: string | null; avatar_url: string | null
  }[]

  // Get who the viewer already follows so we can show correct button state
  let viewerFollowingSet = new Set<string>()
  if (user) {
    const { data: myFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    viewerFollowingSet = new Set((myFollows ?? []).map(f => f.following_id))
  }

  return (
    <>
      <Navbar username={currentProfile?.username ?? ''} />
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 sticky top-14 md:top-0 bg-white dark:bg-zinc-950 z-10">
          <Link href={`/profile/${username}`} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <p className="font-bold text-sm">@{username}</p>
            <p className="text-xs text-zinc-400">{followers.length} {followers.length === 1 ? 'follower' : 'followers'}</p>
          </div>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <p className="font-semibold text-zinc-600 dark:text-zinc-300">No followers yet</p>
            <p className="text-sm mt-1">Share your profile to get your first follower</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {followers.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/profile/${p.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-lg font-black overflow-hidden shrink-0">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                    ) : (
                      p.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.full_name || p.username}</p>
                    <p className="text-sm text-zinc-500 truncate">@{p.username}</p>
                  </div>
                </Link>
                {user && user.id !== p.id && (
                  <div className="shrink-0">
                    <FollowButton
                      followerId={user.id}
                      followingId={p.id}
                      initialIsFollowing={viewerFollowingSet.has(p.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
