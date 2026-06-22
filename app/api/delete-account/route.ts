import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Delete user data in order (most dependent first)
  await admin.from('story_views').delete().eq('viewer_id', user.id)
  await admin.from('stories').delete().eq('user_id', user.id)
  await admin.from('follows').delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
  await admin.from('ratings').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('id', user.id)

  // Delete the auth user itself
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
