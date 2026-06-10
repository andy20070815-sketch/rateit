import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const ratingId = req.nextUrl.searchParams.get('ratingId')
  if (!ratingId) return NextResponse.json({ comments: [] })

  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('id, rating_id, user_id, content, created_at')
    .eq('rating_id', ratingId)
    .order('created_at', { ascending: true })

  if (error || !comments?.length) return NextResponse.json({ comments: [] })

  // Fetch profiles separately (user_id → auth.users → profiles.id)
  const userIds = [...new Set(comments.map(c => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))

  const result = comments.map(c => ({
    ...c,
    profiles: profileMap.get(c.user_id) ?? { id: c.user_id, username: 'user', avatar_url: null },
  }))

  return NextResponse.json({ comments: result })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ratingId, content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Empty comment' }, { status: 400 })

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ rating_id: ratingId, user_id: user.id, content: content.trim() })
    .select('id, rating_id, user_id, content, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ comment: { ...comment, profiles: profile } })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { commentId } = await req.json()
  await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
