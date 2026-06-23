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

// ── Tiered replacement pool (category-specific, used for all replacements) ──
const REVIEWS = {
  movie: {
    positive: [
      'Genuinely one of the best films ever made.',
      'Watched it 5 times and it only gets better.',
      'The cinematography alone deserves a 10.',
      'Changed how I think about cinema.',
      'Peak filmmaking. Nothing comes close.',
      "I cried. I don't cry at movies. This is it.",
      'Slept on it. Woke up. Still thinking about it.',
    ],
    neutral: [
      'Good but not great. People oversell this.',
      "Enjoyable but nothing I'd rush to rewatch.",
    ],
    negative: [
      "Overrated. I don't get the hype at all.",
      'Pretty disappointing given all the praise.',
    ],
  },
  tv: {
    positive: [
      "Best show I've ever watched. Peak television.",
      'Every episode leaves me wanting more.',
      'The writing is on another level.',
      'Binged the whole thing in a weekend. No regrets.',
      'The characters are what make this special.',
      "Cancelled too soon. I'm still not over it.",
    ],
    neutral: [
      'Started strong, fell off a bit as it went on.',
      'Good, not the masterpiece people claim.',
    ],
    negative: [
      "Overrated by the internet. It's just okay.",
      'Started strong, fell off hard by season 3.',
    ],
  },
  sport: {
    positive: [
      'The greatest to ever do it. Full stop.',
      'Watching them play is a religious experience.',
      "GOAT conversation is over. It's this person.",
      "GOAT conversation is over. It's this.",
      'Pure talent. Generational athlete.',
      "Clutch when it matters most. That's all I need.",
      'Built different. Literally.',
    ],
    neutral: [
      "Has the talent but the consistency just isn't there.",
      'Good but not elite. The hype is a bit much.',
    ],
    negative: [
      "Overrated. Stats don't tell the whole story.",
      "Carried by teammates. Take that away and what's left?",
    ],
  },
  youtube: {
    positive: [
      'The production quality is insane.',
      'Peak content. The algorithm blessed me.',
      'This channel genuinely taught me things.',
      "I don't trust people who don't watch this.",
      'Parasocial kings. Still watch every upload.',
      'The editing alone deserves an award.',
    ],
    neutral: [
      'Decent but not must-watch. Background noise mostly.',
      'Good channel but the recent stuff is hit or miss.',
    ],
    negative: [
      'Fell off hard after 2020. Not the same.',
      'Overhyped. The comments are more entertaining than the videos.',
    ],
  },
  music: {
    positive: [
      'This album changed my entire taste in music.',
      'Every track is a hit. No skips.',
      'This is what peak music sounds like.',
      'Still on repeat years later.',
      'The lyricism on this is unmatched.',
    ],
    neutral: [
      'Carried hard by the production.',
      'A few great songs but uneven overall.',
    ],
    negative: [
      'Overplayed. Good for like 3 songs.',
      "Dated fast. Doesn't hold up.",
    ],
  },
  book: {
    positive: [
      'Read it in one sitting. Life-changing.',
      'Every page has something worth underlining.',
      'Required reading for literally anyone.',
      'Changed the way I see the world.',
      'The ending destroyed me.',
      "Couldn't put it down.",
    ],
    neutral: [
      'Interesting ideas but the pacing drags.',
      'Good book. Not the revelation people promised.',
    ],
    negative: [
      "Overrated classic. Couldn't finish it.",
      'Honestly kind of dry. People hype this too much.',
    ],
  },
  game: {
    positive: [
      'Spent 300 hours in this. Worth every second.',
      'Finished it in a week. Immediately started again.',
      'Genuinely one of the best games ever made.',
      'The world-building is unmatched.',
      'Addictive in the best possible way.',
      'The story made me emotional. In a game. Wild.',
    ],
    neutral: [
      'Fun but not the masterpiece people claim.',
      'Broken at launch. Still played 200 hours.',
    ],
    negative: [
      "Overrated by the community. It's fine.",
      'Fun for a few hours, then it completely lost me.',
    ],
  },
  food: {
    positive: [
      'Worth every penny and the wait.',
      'I think about this meal weekly.',
      "Best I've ever had. No competition.",
      'Hype is totally warranted.',
      'Life-changing. My standards are ruined.',
      "The comfort food I didn't know I needed.",
    ],
    neutral: [
      "Pretty good but nothing I'd go out of my way for.",
      'Solid, nothing groundbreaking.',
    ],
    negative: [
      'Overpriced for what it is honestly.',
      'Disappointing given the reputation.',
    ],
  },
  other: {
    positive: [
      'The cultural impact is undeniable.',
      'Built different. Nothing compares.',
      'The aesthetic alone makes it worth it.',
      'Status symbol or genuinely good? Both.',
    ],
    neutral: [
      'Overhyped but still kind of delivers.',
      'Has its place but not my first choice.',
    ],
    negative: [
      "Peaked years ago and we're just in denial.",
      "Controversial opinion: it's mid.",
    ],
  },
}

// ── Comprehensive sentiment map across ALL seed scripts ──────────────────────
// Any review string not listed here is left alone (ambiguous/neutral).

const CLEARLY_POSITIVE = new Set([
  // seed-content.mjs / seed-more-content.mjs
  'Genuinely one of the best films ever made.', 'Watched it 5 times and it only gets better.',
  'The cinematography alone deserves a 10.', 'Changed how I think about cinema.',
  'Peak filmmaking. Nothing comes close.', "I cried. I don't cry at movies. This is it.",
  'Slept on it. Woke up. Still thinking about it.',
  "Best show I've ever watched. Peak television.", 'Every episode leaves me wanting more.',
  'The writing is on another level.', 'Binged the whole thing in a weekend. No regrets.',
  'The characters are what make this special.', "Cancelled too soon. I'm still not over it.",
  'The greatest to ever do it. Full stop.', 'Watching them play is a religious experience.',
  "GOAT conversation is over. It's this person.", "GOAT conversation is over. It's this.",
  'Pure talent. Generational athlete.', "Clutch when it matters most. That's all I need.",
  'Built different. Literally.',
  'The production quality is insane.', 'Peak content. The algorithm blessed me.',
  'This channel genuinely taught me things.', "I don't trust people who don't watch this.",
  'Parasocial kings. Still watch every upload.', 'The editing alone deserves an award.',
  'This album changed my entire taste in music.', 'Every track is a hit. No skips.',
  'This is what peak music sounds like.', 'Still on repeat years later.',
  'The lyricism on this is unmatched.',
  'Read it in one sitting. Life-changing.', 'Every page has something worth underlining.',
  'Required reading for literally anyone.', 'Changed the way I see the world.',
  'The ending destroyed me.', "Couldn't put it down.",
  'Spent 300 hours in this. Worth every second.', 'Finished it in a week. Immediately started again.',
  'Genuinely one of the best games ever made.', 'The world-building is unmatched.',
  'Addictive in the best possible way.', 'The story made me emotional. In a game. Wild.',
  'Worth every penny and the wait.', 'I think about this meal weekly.',
  "Best I've ever had. No competition.", 'Hype is totally warranted.',
  'Life-changing. My standards are ruined.', "The comfort food I didn't know I needed.",
  'The cultural impact is undeniable.', 'Built different. Nothing compares.',
  'The aesthetic alone makes it worth it.', 'Status symbol or genuinely good? Both.',

  // seed-youtube.mjs / seed-youtubers.mjs
  'The production quality on this is genuinely insane.',
  'Peak content. Nothing else comes close.',
  'This channel genuinely taught me things I use every day.',
  "I don't trust people who don't watch this.",
  'Criminally underrated. More people need to see this.',
  "I've rewatched this more times than I can count.",
  'The algorithm blessed me the day it recommended this.',
  'This is why YouTube was invented.',
  'Somehow keeps getting better every upload.',
  'The fanbase is insufferable but the content is elite.',
  'Consistently delivering. Never misses.',
  'Started watching in middle school. Still here.',

  // seed-games-all.mjs
  "Couldn't put the controller down.",
  'My childhood in a game. Pure nostalgia.',
  'The mechanics alone make it worth it.',
  'Everyone should play this at least once.',
  'Hard carry by the art direction.',
  'The multiplayer alone justifies the price.',
  'This defined my entire generation.',
  'Soundtrack alone is a masterpiece.',
  'More replayable than anything else I own.',
  'Peak gaming. Nothing comes close.',
])

const CLEARLY_NEGATIVE = new Set([
  // seed-content.mjs / seed-more-content.mjs
  "Overrated. I don't get the hype at all.", 'Pretty disappointing given all the praise.',
  "Overrated by the internet. It's just okay.", 'Started strong, fell off hard by season 3.',
  "Overrated. Stats don't tell the whole story.", "Carried by teammates. Take that away and what's left?",
  'Fell off hard after 2020. Not the same.',
  'Overhyped. The comments are more entertaining than the videos.',
  'Overplayed. Good for like 3 songs.', "Dated fast. Doesn't hold up.",
  "Overrated classic. Couldn't finish it.", 'Honestly kind of dry. People hype this too much.',
  "Overrated by the community. It's fine.", 'Fun for a few hours, then it completely lost me.',
  'Overpriced for what it is honestly.', 'Disappointing given the reputation.',
  "Peaked years ago and we're just in denial.", "Controversial opinion: it's mid.",

  // seed-youtube.mjs / seed-youtubers.mjs
  'Fell off hard. Not the same creator anymore.',
  "Overhyped. It's just okay.",

  // seed-games-all.mjs
  'Fell off after the first few hours sadly.',
])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function correctReview(category, score) {
  const tiers = REVIEWS[category] ?? REVIEWS.other
  const pool = score >= 7 ? tiers.positive : score <= 4 ? tiers.negative : tiers.neutral
  return pick(pool)
}

// Fetch all rows for a category, paginated (Supabase caps at 1000 per call)
async function fetchAllWithReview(category) {
  const PAGE = 1000
  let all = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('ratings')
      .select('id, score, review')
      .eq('category', category)
      .not('review', 'is', null)
      .range(from, from + PAGE - 1)
    if (error) { console.error(`Fetch error (${category} offset ${from}):`, error.message); break }
    if (!data?.length) break
    all = all.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return all
}

async function run() {
  console.log('Scanning for mismatched review sentiment (all seed scripts)...\n')

  const categories = Object.keys(REVIEWS)
  let totalScanned = 0
  let totalFixed = 0

  for (const category of categories) {
    const rows = await fetchAllWithReview(category)
    totalScanned += rows.length

    const mismatched = rows.filter(r => {
      if (r.score >= 7 && CLEARLY_POSITIVE.has(r.review)) return false // correct
      if (r.score <= 4 && CLEARLY_NEGATIVE.has(r.review)) return false  // correct
      if (r.score >= 5 && r.score <= 6) return false // neutral scores — leave alone

      if (r.score <= 4 && CLEARLY_POSITIVE.has(r.review)) return true   // low score + glowing review
      if (r.score >= 7 && CLEARLY_NEGATIVE.has(r.review)) return true   // high score + negative review
      return false
    })

    if (!mismatched.length) {
      console.log(`✓ ${category}: ${rows.length} rows — all OK`)
      continue
    }

    console.log(`✗ ${category}: ${mismatched.length} / ${rows.length} mismatched — fixing…`)

    for (const r of mismatched) {
      const newReview = correctReview(category, r.score)
      const { error } = await supabase
        .from('ratings')
        .update({ review: newReview })
        .eq('id', r.id)
      if (error) {
        console.error(`  ✗ id=${r.id}: ${error.message}`)
      } else {
        totalFixed++
        console.log(`  ✓ id=${r.id} score=${r.score}: "${r.review}" → "${newReview}"`)
      }
    }
  }

  console.log(`\nDone. Scanned ${totalScanned} rated rows. Fixed ${totalFixed} mismatches.`)
}

run()
