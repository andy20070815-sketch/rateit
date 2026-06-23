import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — client resizes first, this is a server-side safety net
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  // Authenticate the caller
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Image files only (JPEG, PNG, WebP, GIF)' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large — max 5 MB' }, { status: 400 })
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const storagePath = `${user.id}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()

  // Create the avatars bucket the first time if it doesn't exist yet
  await admin.storage.createBucket('avatars', { public: true }).catch(() => {
    // Bucket already exists — ignore the error
  })

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(storagePath)

  const { error: profileError } = await admin
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
