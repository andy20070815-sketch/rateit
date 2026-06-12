import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.includes('=')).map(l => {
    const idx = l.indexOf('=')
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
  })
)

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false }
})

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function caption(title, score) {
  const hot = [
    `Just rated ${title} a ${score}/10 🔥`,
    `${title} — ${score}/10. No further questions.`,
    `My honest take on ${title}: ${score}/10`,
    `Finally watched/played/listened to ${title}. ${score}/10.`,
    `${title} deserves exactly ${score}/10 and I'll die on this hill`,
    `${score}/10 for ${title}. Controversial? Maybe.`,
    `Can't stop thinking about ${title}. ${score}/10`,
    `${title} ${score >= 8 ? '🔥🔥🔥' : score >= 5 ? '😐' : '💀'} — ${score}/10`,
    `Rated ${title} ${score}/10. Fight me.`,
    `${title} is a ${score}/10 and that's my final answer`,
  ]
  return pick(hot)
}

async function run() {
  // Delete expired stories first
  await supabase.from('stories').delete().lt('expires_at', new Date().toISOString())

  // Get all bots (limit to 40 active ones for stories)
  const { data: profiles } = await supabase.from('profiles').select('id').limit(40)
  if (!profiles?.length) { console.error('No profiles found.'); process.exit(1) }

  // Get all ratings that have image_url (better looking stories)
  const { data: ratings } = await supabase
    .from('ratings')
    .select('id, user_id, title, score, image_url, category')
    .not('image_url', 'is', null)
    .neq('image_url', '')

  if (!ratings?.length) { console.error('No ratings with images found.'); process.exit(1) }

  // Group ratings by user_id so each bot only shares their own
  const ratingsByUser = new Map()
  for (const r of ratings) {
    if (!ratingsByUser.has(r.user_id)) ratingsByUser.set(r.user_id, [])
    ratingsByUser.get(r.user_id).push(r)
  }

  console.log(`Creating stories for up to ${profiles.length} bots...\n`)

  const rows = []
  const now = Date.now()

  for (const profile of profiles) {
    const myRatings = ratingsByUser.get(profile.id) || []
    if (!myRatings.length) continue

    // Each bot posts 1–3 stories
    const count = 1 + Math.floor(Math.random() * 3)
    const picks = shuffle(myRatings).slice(0, count)

    for (const rating of picks) {
      // Spread created_at over the last 20 hours so they look natural
      const hoursAgo = Math.random() * 20
      const createdAt = new Date(now - hoursAgo * 3_600_000).toISOString()
      const expiresAt = new Date(now + (24 - hoursAgo) * 3_600_000).toISOString()

      rows.push({
        user_id: profile.id,
        rating_id: rating.id,
        image_url: rating.image_url,
        caption: caption(rating.title, rating.score),
        created_at: createdAt,
        expires_at: expiresAt,
      })
    }
  }

  // Insert in chunks
  const CHUNK = 50
  let total = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from('stories').insert(rows.slice(i, i + CHUNK))
    if (error) console.error('Insert error:', error.message)
    else total += Math.min(CHUNK, rows.length - i)
  }

  console.log(`✓ Created ${total} bot stories across ${profiles.length} users`)
  console.log('  Stories will expire in 24 hours automatically.')
}

run()
