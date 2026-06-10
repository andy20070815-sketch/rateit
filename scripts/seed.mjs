// Run with: node scripts/seed.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env.local manually
const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
)

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SERVICE_ROLE_KEY) {
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Project Settings → Data API → service_role key)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const FAKE_USERS = [
  { username: 'moviebuff_kai', full_name: 'Kai Chen', email: 'kai@rateit.dev' },
  { username: 'sportz_aria', full_name: 'Aria Patel', email: 'aria@rateit.dev' },
  { username: 'musictaste_leo', full_name: 'Leo Rivera', email: 'leo@rateit.dev' },
  { username: 'bookworm_sam', full_name: 'Sam Torres', email: 'sam@rateit.dev' },
  { username: 'gamer_nova', full_name: 'Nova Kim', email: 'nova@rateit.dev' },
]

const SAMPLE_RATINGS = [
  { title: 'Inception', category: 'movie', score: 9, review: 'Mind-bending. Nolan at his best.' },
  { title: 'The Dark Knight', category: 'movie', score: 10, review: 'Perfect superhero film. Ledger is unreal.' },
  { title: 'Dune: Part Two', category: 'movie', score: 8, review: 'Visually stunning, worth the wait.' },
  { title: 'Breaking Bad', category: 'tv', score: 10, review: 'Best show ever made, not debatable.' },
  { title: 'Succession', category: 'tv', score: 9, review: 'Writing is elite. Roy family chaos.' },
  { title: 'Lionel Messi', category: 'sport', score: 10, review: 'Greatest of all time. No contest.' },
  { title: 'Super Bowl LVIII', category: 'sport', score: 8, review: 'Overtime thriller, Kansas City again.' },
  { title: 'Taylor Swift - Tortured Poets', category: 'music', score: 7, review: 'Some bangers but a bit long.' },
  { title: 'Kendrick Lamar - GNX', category: 'music', score: 9, review: 'Album of the year, easily.' },
  { title: 'MrBeast - 100 Days Buried', category: 'youtube', score: 8, review: 'Insane production quality as always.' },
  { title: 'The Alchemist', category: 'book', score: 9, review: 'Life-changing read. Short but powerful.' },
  { title: 'Elden Ring', category: 'game', score: 10, review: 'Masterpiece. 200 hours and still going.' },
  { title: 'Balenciaga Triple S', category: 'other', score: 6, review: 'Iconic but not worth the price.' },
  { title: 'Nobu Malibu', category: 'food', score: 9, review: 'Best omakase experience I\'ve had.' },
  { title: 'Avengers: Endgame', category: 'movie', score: 8, review: 'Epic conclusion to 10 years of Marvel.' },
]

async function seed() {
  console.log('Creating fake users...')

  const userIds = []

  for (const user of FAKE_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { username: user.username, full_name: user.full_name },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        // User exists, get their ID
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', user.username)
          .single()
        if (existing) { userIds.push(existing.id); console.log(`  ✓ ${user.username} (already exists)`) }
      } else {
        console.error(`  ✗ ${user.username}: ${error.message}`)
      }
    } else {
      userIds.push(data.user.id)
      console.log(`  ✓ ${user.username}`)
    }
  }

  console.log(`\nAdding ratings...`)

  for (const userId of userIds) {
    // Give each user 3–5 random ratings
    const count = 3 + Math.floor(Math.random() * 3)
    const shuffled = [...SAMPLE_RATINGS].sort(() => Math.random() - 0.5).slice(0, count)

    const { error } = await supabase.from('ratings').insert(
      shuffled.map((r) => ({ ...r, user_id: userId }))
    )

    if (error) console.error(`  ✗ ratings for ${userId}: ${error.message}`)
    else console.log(`  ✓ ${count} ratings added`)
  }

  // Make users follow each other
  console.log('\nCreating follows...')
  const follows = []
  for (let i = 0; i < userIds.length; i++) {
    for (let j = 0; j < userIds.length; j++) {
      if (i !== j && Math.random() > 0.4) {
        follows.push({ follower_id: userIds[i], following_id: userIds[j] })
      }
    }
  }
  const { error: followError } = await supabase.from('follows').upsert(follows, { onConflict: 'follower_id,following_id' })
  if (followError) console.error('  ✗ follows:', followError.message)
  else console.log(`  ✓ ${follows.length} follows created`)

  // Create rating-linked stories for each user's most recent ratings
  console.log('\nCreating rating stories...')

  // Delete old non-rating stories first
  await supabase.from('stories').delete().is('rating_id', null)

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  for (const userId of userIds) {
    // Get this user's ratings
    const { data: userRatings } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!userRatings?.length) continue

    const { error } = await supabase.from('stories').insert(
      userRatings.map((r) => ({
        user_id: userId,
        image_url: '',
        rating_id: r.id,
        expires_at: expires,
      }))
    )

    if (error) console.error(`  ✗ stories for user: ${error.message}`)
    else console.log(`  ✓ ${userRatings.length} rating stories added`)
  }

  console.log('\nDone! Fake users: password is "password123"')
}

seed()
