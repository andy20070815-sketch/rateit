import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not logged in' })

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (follows ?? []).map((f) => f.following_id)

  const { data: stories } = await supabase
    .from('stories')
    .select('id, user_id, caption, profiles(id, username)')
    .in('user_id', followingIds.length > 0 ? followingIds : ['none'])
    .gt('expires_at', new Date().toISOString())

  return NextResponse.json({
    yourUserId: user.id,
    followingCount: followingIds.length,
    storiesFound: stories?.length ?? 0,
    firstStoryHasProfile: !!(stories?.[0]?.profiles),
    stories,
  })
}
