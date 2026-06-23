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

const YT_KEY = env['YOUTUBE_API_KEY']

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function randScore() {
  const weights = [1, 1, 2, 3, 4, 5, 6, 5, 3, 1]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i + 1 }
  return 7
}

const REVIEWS = {
  positive: [
    'The production quality on this is genuinely insane.',
    'Peak content. Nothing else comes close.',
    'This channel genuinely taught me things I use every day.',
    "I don't trust people who don't watch this.",
    'The editing alone deserves an award.',
    'Criminally underrated. More people need to see this.',
    "I've rewatched this more times than I can count.",
    'The algorithm blessed me the day it recommended this.',
    'This is why YouTube was invented.',
    'Somehow keeps getting better every upload.',
    'The fanbase is insufferable but the content is elite.',
  ],
  neutral: [
    'Parasocial relationship speedrun any%.',
    'This creator is the reason my attention span is destroyed.',
  ],
  negative: [
    'Fell off hard. Not the same creator anymore.',
    "Overhyped. It's just okay.",
  ],
}
function pickReview(score) {
  const pool = score >= 7 ? REVIEWS.positive : score <= 4 ? REVIEWS.negative : REVIEWS.neutral
  const arr = [...pool, null]
  return arr[Math.floor(Math.random() * arr.length)]
}

// Fetch top channels by search query
async function fetchChannels(query, maxResults = 10) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=relevance&key=${YT_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) { console.error('YouTube API error:', data.error.message); return [] }
  return (data.items || []).map(item => ({
    title: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || null,
    description: item.snippet.description,
  }))
}

// Fetch most popular videos globally or by category
async function fetchPopularVideos(videoCategoryId = null, maxResults = 20) {
  let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=${maxResults}&key=${YT_KEY}`
  if (videoCategoryId) url += `&videoCategoryId=${videoCategoryId}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) { console.error('YouTube API error:', data.error.message); return [] }
  return (data.items || []).map(item => ({
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || null,
    channelTitle: item.snippet.channelTitle,
    viewCount: parseInt(item.statistics?.viewCount || '0'),
  }))
}

async function run() {
  // Load bot IDs
  const { data: profiles } = await supabase.from('profiles').select('id')
  if (!profiles?.length) { console.error('No profiles found.'); process.exit(1) }
  const botIds = profiles.map(p => p.id)
  console.log(`Using ${botIds.length} bots\n`)

  const allItems = []

  // ── 1. Most popular videos right now ──────────────────────────────────────
  console.log('Fetching trending videos...')
  const trending = await fetchPopularVideos(null, 25)
  trending.forEach(v => allItems.push({ title: v.title, thumbnail: v.thumbnail, label: 'trending' }))
  console.log(`  Got ${trending.length} trending videos`)
  await sleep(500)

  // ── 2. Gaming videos (category 20) ────────────────────────────────────────
  console.log('Fetching top gaming videos...')
  const gaming = await fetchPopularVideos('20', 15)
  gaming.forEach(v => allItems.push({ title: v.title, thumbnail: v.thumbnail, label: 'gaming' }))
  console.log(`  Got ${gaming.length} gaming videos`)
  await sleep(500)

  // ── 3. Music videos (category 10) ─────────────────────────────────────────
  console.log('Fetching top music videos...')
  const music = await fetchPopularVideos('10', 15)
  music.forEach(v => allItems.push({ title: v.title, thumbnail: v.thumbnail, label: 'music' }))
  console.log(`  Got ${music.length} music videos`)
  await sleep(500)

  // ── 4. Top YouTube channels by category ───────────────────────────────────
  const channelQueries = [
    'most subscribed youtube channel',
    'top gaming youtuber',
    'best tech youtube channel',
    'top educational youtube',
    'popular vlog channel',
    'best comedy youtube',
    'top food youtube channel',
    'best science youtube',
  ]

  console.log('Fetching top channels...')
  for (const query of channelQueries) {
    const channels = await fetchChannels(query, 8)
    channels.forEach(c => allItems.push({ title: c.title, thumbnail: c.thumbnail, label: 'channel' }))
    await sleep(300)
  }
  console.log(`  Got channels from ${channelQueries.length} searches`)

  // Deduplicate by title (case insensitive)
  const seen = new Set()
  const unique = allItems.filter(item => {
    const key = item.title.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`\n${unique.length} unique items to seed\n`)

  // Check which already exist in the youtube category
  const { data: existing } = await supabase
    .from('ratings')
    .select('title')
    .eq('category', 'youtube')

  const existingTitles = new Set((existing || []).map(r => r.title.toLowerCase()))

  const toInsert = unique.filter(item => !existingTitles.has(item.title.toLowerCase().trim()))
  console.log(`${toInsert.length} new items to insert (${unique.length - toInsert.length} already exist)\n`)

  let totalInserted = 0

  for (const item of toInsert) {
    const raters = shuffle(botIds).slice(0, 4 + Math.floor(Math.random() * 6))
    const rows = raters.map(userId => {
      const score = randScore()
      return { user_id: userId, title: item.title.trim(), category: 'youtube', score, review: pickReview(score), image_url: item.thumbnail }
    })

    const { error } = await supabase.from('ratings').insert(rows)
    if (error) {
      process.stdout.write(`  ✗ ${item.title.slice(0, 50)}: ${error.message}\n`)
    } else {
      totalInserted += rows.length
      process.stdout.write(`  ✓ ${item.title.slice(0, 60)} [${item.label}]${item.thumbnail ? ' 🖼' : ''}\n`)
    }
  }

  console.log(`\n✓ Done! ${totalInserted} ratings inserted for ${toInsert.length} YouTube items.`)
}

run()
