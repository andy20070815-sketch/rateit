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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Titles that are clearly junk search queries, not real content
const DELETE_TITLES = [
  'Most subscribed YouTube channel',
  "World's Most Subscribed Youtube Channel",
  'Top 10 Gaming',
  'Top Collection Gaming',
  'Top Gaming Highlights',
  'Top Gaming Moments',
  'Top Hat Gaming Man',
  'Top5Gaming',
  '多',
]

// Music tracks mistakenly in youtube category (contain " - " artist/title pattern or "Official Audio/Video")
// These should be music category
const YOUTUBE_TO_MUSIC = [
  'C-Kan - Toma Todo',
  'Liz Vamarasi - Lewa (Official Audio)',
  'YFG Fatso - "Roll Out" (Official Music Video) [Shot By @Rxllo ]',
  'Jnr Vigi',
]

async function guessFromWikipedia(title) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { 'User-Agent': 'rateit-fix/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const d = (data.description ?? data.extract ?? '').toLowerCase()

    if (/rapper|singer|musician|band|recording artist|hip.hop|r&b|vocalist/.test(d)) return 'music'
    if (/footballer|soccer|basketball|nba|nfl|tennis|athlete|olympian|boxer/.test(d)) return 'sport'
    if (/tv series|television series|sitcom|drama series|animated series|streaming series/.test(d)) return 'tv'
    if (/\bfilm\b|feature film|directed by|box office/.test(d)) return 'movie'
    if (/video game|game developer|nintendo|playstation|xbox/.test(d)) return 'game'
    if (/youtuber|content creator|twitch streamer/.test(d)) return 'youtube'
    if (/restaurant|chef|cuisine|food/.test(d)) return 'food'
    if (/novel|author|\bbook\b|novelist/.test(d)) return 'book'
    if (/internet personality|social media|influencer|model|personality/.test(d)) return 'other'
    return null
  } catch {
    return null
  }
}

async function run() {
  // 1. Delete junk entries
  console.log('── Deleting junk entries ──')
  for (const title of DELETE_TITLES) {
    const { error, count } = await supabase.from('ratings').delete({ count: 'exact' }).ilike('title', title)
    if (!error) console.log(`  ✓ Deleted "${title}"`)
    else console.log(`  ✗ ${title}: ${error.message}`)
  }

  // 2. Move obvious music tracks from youtube → music
  console.log('\n── Moving music tracks from youtube → music ──')
  for (const title of YOUTUBE_TO_MUSIC) {
    const { error } = await supabase.from('ratings').update({ category: 'music' }).ilike('title', title)
    if (!error) console.log(`  ✓ "${title}" → music`)
    else console.log(`  ✗ ${title}: ${error.message}`)
  }

  // 3. Auto-fix any youtube entry that looks like "Artist - Title" (music track format)
  console.log('\n── Auto-fixing "Artist - Title" music tracks in youtube category ──')
  const { data: ytRatings } = await supabase.from('ratings').select('id, title').eq('category', 'youtube')
  const musicPattern = /^.+ - .+$/ // "Artist - Track" pattern
  const officialPattern = /\(official (audio|video|music video|lyric)\)/i
  const musicTracks = (ytRatings ?? []).filter(r =>
    (musicPattern.test(r.title) && r.title.length > 5) || officialPattern.test(r.title)
  )
  if (musicTracks.length) {
    const ids = musicTracks.map(r => r.id)
    await supabase.from('ratings').update({ category: 'music' }).in('id', ids)
    console.log(`  ✓ Moved ${musicTracks.length} tracks (Artist - Title format) → music`)
    musicTracks.slice(0, 5).forEach(r => console.log(`    "${r.title}"`))
    if (musicTracks.length > 5) console.log(`    ... and ${musicTracks.length - 5} more`)
  } else {
    console.log('  Nothing to fix.')
  }

  // 4. Check remaining youtube entries that look questionable (very generic names)
  console.log('\n── Checking remaining youtube entries via Wikipedia ──')
  const { data: remaining } = await supabase.from('ratings').select('title').eq('category', 'youtube')
  const uniqueTitles = [...new Set((remaining ?? []).map(r => r.title))]

  for (const title of uniqueTitles) {
    // Skip clearly legit YouTube creators
    if (/mrBeast|pewdiepie|markiplier|vsauce|veritasium|kurzgesagt|mkbhd|linus|pokimane|ninja|dream|emma|marques|3blue|tom scott|cgp grey|mark rober|nile|smarter every|corridor|yes theory/i.test(title)) continue

    const guessed = await guessFromWikipedia(title)
    await sleep(150)

    if (guessed && guessed !== 'youtube') {
      const { error } = await supabase.from('ratings').update({ category: guessed }).eq('title', title).eq('category', 'youtube')
      if (!error) console.log(`  ✓ "${title}" → ${guessed}`)
    }
  }

  console.log('\nDone.')
}

run()
