import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import StoryBar from '../../components/StoryBar'
import FeedContent from '../../components/FeedContent'
import type { StoryGroup } from '../../lib/types'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let storyGroups: StoryGroup[] = []
  let seenStoryIds = new Set<string>()

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = p

    const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
    const followingIds = (follows ?? []).map((f) => f.following_id)
    const storyUserIds = [...new Set([...followingIds, user.id])]

    const [{ data: storiesRaw }, { data: storyProfiles }] = await Promise.all([
      supabase.from('stories').select('id, user_id, image_url, caption, rating_id, created_at, expires_at')
        .in('user_id', storyUserIds).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, username, avatar_url, full_name, bio, created_at').in('id', storyUserIds),
    ])

    const profileMap = new Map((storyProfiles ?? []).map((p) => [p.id, p]))
    const ratingIds = (storiesRaw ?? []).map((s) => s.rating_id).filter(Boolean) as string[]
    const { data: storyRatings } = ratingIds.length > 0
      ? await supabase.from('ratings').select('*').in('id', ratingIds)
      : { data: [] }
    const ratingMap = new Map((storyRatings ?? []).map((r) => [r.id, r]))

    const storyIds = (storiesRaw ?? []).map((s) => s.id)
    const { data: viewedRaw } = storyIds.length > 0
      ? await supabase.from('story_views').select('story_id').eq('viewer_id', user.id).in('story_id', storyIds)
      : { data: [] }
    seenStoryIds = new Set((viewedRaw ?? []).map((v) => v.story_id))

    const groupMap = new Map<string, StoryGroup>()
    for (const story of storiesRaw ?? []) {
      const storyProfile = profileMap.get(story.user_id)
      if (!storyProfile) continue
      if (!groupMap.has(story.user_id)) groupMap.set(story.user_id, { profile: storyProfile, stories: [], hasUnseen: false })
      const group = groupMap.get(story.user_id)!
      const rating = story.rating_id ? ratingMap.get(story.rating_id) : undefined
      group.stories.push({ ...story, profiles: storyProfile, rating })
      if (!seenStoryIds.has(story.id)) group.hasUnseen = true
    }

    storyGroups = [...groupMap.values()].sort((a, b) => {
      if (a.profile.id === user!.id) return -1
      if (b.profile.id === user!.id) return 1
      return Number(b.hasUnseen) - Number(a.hasUnseen)
    })
  }

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg md:max-w-2xl mx-auto px-4 py-4">

        {user && storyGroups.length > 0 && (
          <StoryBar groups={storyGroups} currentUser={profile} seenStoryIds={seenStoryIds} />
        )}

        {!user && (
          <div className="mb-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Join to rate & follow people</p>
              <p className="text-xs text-zinc-500 mt-0.5">Free — takes 10 seconds</p>
            </div>
            <Link href="/signup" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded-xl shrink-0">
              Sign up
            </Link>
          </div>
        )}

        <FeedContent currentUserId={user?.id ?? null} />
      </main>
    </>
  )
}
