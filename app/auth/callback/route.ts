import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const next = req.nextUrl.searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const meta = user.user_metadata ?? {}

      // Check if this user already has a profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .eq('id', user.id)
        .single()

      if (!existing) {
        // New Google user — create their profile
        const rawName = (meta.full_name || meta.name || meta.email?.split('@')[0] || 'user') as string
        const base = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 15)
        const username = `${base}_${Math.floor(Math.random() * 9000) + 1000}`

        await supabase.from('profiles').insert({
          id: user.id,
          username,
          full_name: (meta.full_name || meta.name) ?? null,
          avatar_url: (meta.avatar_url || meta.picture) ?? null,
        })
      } else {
        // Returning Google user — keep their avatar in sync with Google
        const googleAvatar = meta.avatar_url || meta.picture
        if (googleAvatar && googleAvatar !== existing.avatar_url) {
          await supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('id', user.id)
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, req.url))
}
