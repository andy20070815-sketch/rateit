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

// ── Full list of top YouTubers by handle ────────────────────────────────────
const YOUTUBERS = [
  // 🎮 Gaming
  { handle: 'MrBeast',           display: 'MrBeast' },
  { handle: 'PewDiePie',         display: 'PewDiePie' },
  { handle: 'markiplier',        display: 'Markiplier' },
  { handle: 'jacksepticeye',     display: 'Jacksepticeye' },
  { handle: 'dream',             display: 'Dream' },
  { handle: 'TommyInnit',        display: 'TommyInnit' },
  { handle: 'GeorgeNotFound',    display: 'GeorgeNotFound' },
  { handle: 'Technoblade',       display: 'Technoblade' },
  { handle: 'xQcOW',             display: 'xQc' },
  { handle: 'Ludwig',            display: 'Ludwig' },
  { handle: 'Ninja',             display: 'Ninja' },
  { handle: 'pokimane',          display: 'Pokimane' },
  { handle: 'Valkyrae',          display: 'Valkyrae' },
  { handle: 'CoryxKenshin',      display: 'CoryxKenshin' },
  { handle: 'LazarBeam',         display: 'LazarBeam' },
  { handle: 'DanTDM',            display: 'DanTDM' },
  { handle: 'stampylonghead',    display: 'Stampylonghead' },
  { handle: 'videogamedunkey',   display: 'Videogamedunkey' },
  { handle: 'JonTron',           display: 'JonTron' },
  { handle: 'IShowSpeed',        display: 'IShowSpeed' },
  { handle: 'KaiCenat',          display: 'Kai Cenat' },
  { handle: 'AdinRoss',          display: 'Adin Ross' },
  { handle: 'Typical Gamer',     display: 'Typical Gamer' },
  { handle: 'SypherPK',          display: 'SypherPK' },
  { handle: 'TimTheTatman',      display: 'TimTheTatman' },
  // 🔬 Education & Science
  { handle: 'Vsauce',            display: 'Vsauce' },
  { handle: 'veritasium',        display: 'Veritasium' },
  { handle: 'kurzgesagt',        display: 'Kurzgesagt' },
  { handle: '3blue1brown',       display: '3Blue1Brown' },
  { handle: 'MarkRober',         display: 'Mark Rober' },
  { handle: 'SmarterEveryDay',   display: 'Smarter Every Day' },
  { handle: 'TomScottGo',        display: 'Tom Scott' },
  { handle: 'CGPGrey',           display: 'CGP Grey' },
  { handle: 'NileRed',           display: 'NileRed' },
  { handle: 'Wendover',          display: 'Wendover Productions' },
  { handle: 'RealEngineering',   display: 'Real Engineering' },
  { handle: 'TED',               display: 'TED' },
  { handle: 'TEDed',             display: 'TED-Ed' },
  { handle: 'MinutePhysics',     display: 'MinutePhysics' },
  { handle: 'Vsauce2',           display: 'Vsauce2' },
  { handle: 'Vsauce3',           display: 'Vsauce3' },
  // 📱 Tech
  { handle: 'mkbhd',             display: 'MKBHD' },
  { handle: 'LinusTechTips',     display: 'Linus Tech Tips' },
  { handle: 'UnboxTherapy',      display: 'Unbox Therapy' },
  { handle: 'JerryRigEverything',display: 'JerryRigEverything' },
  { handle: 'Dave2D',            display: 'Dave2D' },
  { handle: 'Mrwhosetheboss',    display: 'Mrwhosetheboss' },
  { handle: 'iJustine',          display: 'iJustine' },
  { handle: 'LTT',               display: 'ShortCircuit' },
  // 😂 Comedy & Commentary
  { handle: 'smosh',             display: 'Smosh' },
  { handle: 'jacksfilms',        display: 'Jacksfilms' },
  { handle: 'drewgooden',        display: 'Drew Gooden' },
  { handle: 'dannygonzalez',     display: 'Danny Gonzalez' },
  { handle: 'kurtisconner',      display: 'Kurtis Conner' },
  { handle: 'EddyBurback',       display: 'Eddy Burback' },
  { handle: 'ryantrahan',        display: 'Ryan Trahan' },
  { handle: 'airrack',           display: 'Airrack' },
  { handle: 'KSI',               display: 'KSI' },
  { handle: 'LoganPaul',         display: 'Logan Paul' },
  { handle: 'JakePaul',          display: 'Jake Paul' },
  { handle: 'DudePerfect',       display: 'Dude Perfect' },
  { handle: 'nelkboys',          display: 'NELK Boys' },
  { handle: 'CashnastyGaming',   display: 'Cash Nasty' },
  // 🎬 Lifestyle & Vlog
  { handle: 'CaseyNeistat',      display: 'Casey Neistat' },
  { handle: 'DavidDobrik',       display: 'David Dobrik' },
  { handle: 'emmachamberlain',   display: 'Emma Chamberlain' },
  { handle: 'YesTheory',         display: 'Yes Theory' },
  { handle: 'MoVlogs',           display: 'Mo Vlogs' },
  { handle: 'WillSmith',         display: 'Will Smith' },
  { handle: 'MrBallen',          display: 'MrBallen' },
  // 🎨 Animation
  { handle: 'theodd1sout',       display: 'TheOdd1sOut' },
  { handle: 'JaidenAnimations',  display: 'Jaiden Animations' },
  { handle: 'domics',            display: 'Domics' },
  { handle: 'SomethingElseYT',   display: 'SomethingElseYT' },
  { handle: 'illymation',        display: 'illymation' },
  // 🎵 Music on YouTube
  { handle: 'BillieEilish',      display: 'Billie Eilish' },
  { handle: 'TaylorSwift',       display: 'Taylor Swift' },
  { handle: 'Drake',             display: 'Drake' },
  { handle: 'TheWeekndVEVO',     display: 'The Weeknd' },
  { handle: 'Eminem',            display: 'Eminem' },
  // 🍕 Food
  { handle: 'NickDiGiovanni',    display: 'Nick DiGiovanni' },
  { handle: 'GordonRamsay',      display: 'Gordon Ramsay' },
  { handle: 'bingingwithbabish', display: 'Binging with Babish' },
  { handle: 'SortedFood',        display: 'Sorted Food' },
  { handle: 'BrothersGreenEats', display: 'Joshua Weissman' },
  // 🎥 Film & Cinema
  { handle: 'CorridorCrew',      display: 'Corridor Crew' },
  { handle: 'CinemaWins',        display: 'CinemaWins' },
  { handle: 'CinemaSins',        display: 'CinemaSins' },
  { handle: 'ScreenJunkies',     display: 'Screen Junkies' },
  // 📰 News & Commentary
  { handle: 'LastWeekTonight',   display: 'Last Week Tonight' },
  { handle: 'ColbertLateShow',   display: 'The Late Show' },
  { handle: 'hasan',             display: 'HasanAbi' },
]

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const REVIEWS = [
  'The production quality on this is genuinely insane.',
  'Peak content. Nothing else comes close.',
  'Fell off hard. Not the same creator anymore.',
  'This channel genuinely taught me things I use every day.',
  'I don\'t trust people who don\'t watch this.',
  'The editing alone deserves an award.',
  'Criminally underrated. More people need to see this.',
  'Overhyped. It\'s just okay.',
  'I\'ve rewatched this more times than I can count.',
  'The algorithm blessed me the day it recommended this.',
  'This is why YouTube was invented.',
  'Somehow keeps getting better every upload.',
  'The fanbase is insufferable but the content is elite.',
  'Parasocial relationship speedrun any%.',
  'This creator is the reason my attention span is destroyed.',
  'Consistently delivering. Never misses.',
  'Started watching in middle school. Still here.',
  null
]

async function fetchChannelByHandle(handle) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent('@' + handle)}&key=${YT_KEY}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.error || !data.items?.length) return null
    const ch = data.items[0]
    return {
      name: ch.snippet.title,
      thumbnail: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.medium?.url || null,
      subscribers: parseInt(ch.statistics?.subscriberCount || '0'),
    }
  } catch {
    return null
  }
}

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id')
  if (!profiles?.length) { console.error('No profiles found.'); process.exit(1) }
  const botIds = profiles.map(p => p.id)
  console.log(`Using ${botIds.length} bots\n`)

  // Get existing youtube titles to avoid duplicates
  const { data: existing } = await supabase.from('ratings').select('title').eq('category', 'youtube')
  const existingTitles = new Set((existing || []).map(r => r.title.toLowerCase().trim()))

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const { handle, display } of YOUTUBERS) {
    // Check if already exists (by display name)
    if (existingTitles.has(display.toLowerCase())) {
      process.stdout.write(`  ↩ ${display} (exists)\n`)
      skipped++
      continue
    }

    const channel = await fetchChannelByHandle(handle)
    await sleep(200)

    if (!channel) {
      process.stdout.write(`  ✗ ${display} (@${handle}) — not found\n`)
      failed++
      continue
    }

    // Use API name if it's close enough, otherwise keep display name
    const title = display

    const raters = shuffle(botIds).slice(0, 5 + Math.floor(Math.random() * 6))
    const rows = raters.map(userId => ({
      user_id: userId,
      title,
      category: 'youtube',
      score: Math.floor(Math.random() * 10) + 1,
      review: pick(REVIEWS),
      image_url: channel.thumbnail,
    }))

    const { error } = await supabase.from('ratings').insert(rows)
    if (error) {
      process.stdout.write(`  ✗ ${title}: ${error.message}\n`)
      failed++
    } else {
      inserted++
      const subs = channel.subscribers > 0
        ? (channel.subscribers >= 1_000_000 ? `${(channel.subscribers/1_000_000).toFixed(1)}M` : `${(channel.subscribers/1000).toFixed(0)}K`) + ' subs'
        : ''
      process.stdout.write(`  ✓ ${title}${subs ? ` [${subs}]` : ''}${channel.thumbnail ? ' 🖼' : ''}\n`)
    }
  }

  console.log(`\n✓ Done! ${inserted} added, ${skipped} skipped (already exist), ${failed} not found.`)
}

run()
