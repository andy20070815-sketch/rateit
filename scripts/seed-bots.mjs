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

// ── Bot name parts ──────────────────────────────────────────────────────────
const ADJECTIVES = ['spicy','based','edgy','toxic','savage','cursed','chaotic','petty','unhinged','iconic','delusional','obsessed','chronically','terminally','genuinely','absolutely','lowkey','highkey','certified','professional']
const NOUNS = ['critic','rater','hater','fan','enjoyer','hater69','takes','opinions','vibes','brain','energy','moment','take','individual','entity','specimen','creature','being','unit','person']

function botName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 9999)
  return `${a}_${n}${num}`
}

// ── Controversial comment pools per category ────────────────────────────────
const COMMENTS = {
  movie: [
    "This is hands down the most overrated film of the decade. Fight me.",
    "Anyone who rates this above a 7 clearly has no taste whatsoever.",
    "Genuinely one of the worst things I've ever watched. 0 redeeming qualities.",
    "This is a cinematic masterpiece and I will die on this hill.",
    "People only like this because they're told to. Sheep behavior fr.",
    "This film changed my life. Your low score is a personal attack.",
    "CGI slop. Hollywood is cooked and this proves it.",
    "The fact this exists means cinema is officially dead.",
    "I walked out of the theater. Best decision I've ever made.",
    "My 5 year old nephew could've written a better script.",
    "This rating is criminal. Whoever posted this needs their eyes checked.",
    "Unironically peak fiction. I don't make the rules.",
  ],
  tv: [
    "The writers room should be held legally accountable for what they did to this show.",
    "Peaked in season 1 and it's been a slow death ever since.",
    "This is the only show that actually gets it. Everything else is noise.",
    "I've rewatched this 7 times and each time it gets worse somehow.",
    "The fact this got cancelled while trash stays on air proves the system is broken.",
    "Best character writing in television history. No I will not elaborate.",
    "Anyone who likes this has terrible taste and I stand by that.",
    "This show ruined all other TV for me. Nothing compares.",
    "The finale alone should be a war crime.",
    "Absolutely deranged that people sleep on this.",
  ],
  sport: [
    "Calling this person a GOAT is disrespectful to actual GOATs.",
    "Peak performance. Everyone else is playing a different sport.",
    "Most overrated athlete of all time and it's not even close.",
    "The stats don't lie. This rating is embarrassingly off.",
    "I've seen better performances at my local park tbh.",
    "The GOAT conversation is over and has been for years.",
    "Completely carried by teammates. Take away the support and watch the rating drop.",
    "This performance was fraudulent from start to finish.",
    "Generational talent and people still undersell it. Crazy.",
    "The bias in this rating is astronomical. Do better.",
  ],
  music: [
    "This album is objectively noise. There is no melody, no soul, nothing.",
    "Only people with no real music knowledge rate this low.",
    "This literally saved my life and you gave it a 6. Unforgivable.",
    "The fact this charted proves the general public has terrible taste.",
    "Album of the decade and it's not up for debate.",
    "I physically cannot listen to this without losing brain cells.",
    "Every track is a masterpiece. Your opinion is simply wrong.",
    "This artist peaked here and has been on a downward spiral since.",
    "People who like this have never heard real music in their lives.",
    "The production alone should've gotten a 10. You're cooked.",
  ],
  game: [
    "This game is a psychological trap designed to waste your life. 10/10.",
    "Genuinely unfinished product sold at full price. Scam.",
    "The goat of gaming and your low rating proves you're bad at it.",
    "I have 400 hours in this and it gets worse every single time.",
    "The fanbase for this game has single-handedly lowered my faith in humanity.",
    "Most addictive thing I've ever experienced. My therapist is concerned.",
    "This is what peak game design looks like and you rated it a 7. Tragic.",
    "Broken at launch, broken now, will be broken forever. Still a classic.",
    "People who rate this low simply don't have the skill to appreciate it.",
    "Corporate slop dressed up as a game. Wake up.",
  ],
  youtube: [
    "The production value on this is genuinely insane. Other creators should retire.",
    "I don't trust anyone who rates this content below an 8.",
    "This creator peaked 3 years ago and is now just coasting off clout.",
    "The algorithm pushed this to me and I lost 2 hours of my life I'll never get back.",
    "Genuinely iconic content. My standards are ruined forever.",
    "This person has the most insufferable fanbase on the internet.",
    "Actually criminally underrated. The algorithm is broken.",
    "I've seen more depth in a kiddie pool than in this video.",
    "Parasocial relationship speedrun any%.",
    "This type of content is why attention spans are destroyed.",
  ],
  book: [
    "I don't trust anyone who doesn't rate this a 10.",
    "Took me 3 attempts to finish. Life is too short for this.",
    "This book genuinely rewired my brain. In a bad way.",
    "Required reading for anyone who wants to understand literally anything.",
    "Overwritten, pretentious, and people only like it because they're told to.",
    "The ending alone makes the whole thing worth it. Take the L.",
    "I assigned this a negative score in my head and moved on.",
    "This is what peak literature looks like. Your loss if you disagree.",
    "The hype around this is a massive psyop.",
    "Genuinely life-changing. I'm sorry your reading comprehension failed you.",
  ],
  food: [
    "This place is criminally overpriced and the portions are microscopic.",
    "Life changing meal. I think about it every single day.",
    "People wait in line for this?? The audacity.",
    "The hype is 100% warranted. Easily top 3 of my life.",
    "I've eaten better food out of a gas station at 2am.",
    "This rating is personal and if you disagree you simply haven't been there.",
    "Michelin stars are a scam and this place proves it.",
    "Worth every penny and anyone who says otherwise is lying.",
    "The ambiance alone deserves a point. The food however…",
    "I brought my family here and now we don't speak anymore.",
  ],
  other: [
    "Criminally underrated and I'm tired of people not seeing it.",
    "The hype is completely manufactured and you all fell for it.",
    "I've never related to a rating more in my life.",
    "This opinion is objectively incorrect and I have receipts.",
    "The bias in this take is breathtaking honestly.",
    "Based rating. Finally someone with taste.",
    "I'd argue but honestly what's the point at this point.",
    "This is either a 10 or a 1 and there is no in between.",
    "Controversial? Maybe. Correct? Absolutely.",
    "The fact this needs to be said is why we can't have nice things.",
  ],
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function run() {
  // Fetch all existing ratings
  const { data: ratings } = await supabase.from('ratings').select('id, category, title')
  if (!ratings?.length) { console.error('No ratings found. Run seed.mjs first.'); process.exit(1) }
  console.log(`Found ${ratings.length} ratings to comment on.`)

  // Create 100 bots
  console.log('\nCreating 100 bots...')
  const botIds = []

  for (let i = 0; i < 100; i++) {
    const username = botName()
    const email = `bot_${username}_${Date.now()}${i}@rateit.bot`

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: 'botpassword123',
      email_confirm: true,
      user_metadata: { username, full_name: username },
    })

    if (error) {
      process.stdout.write('✗')
    } else {
      botIds.push(data.user.id)
      process.stdout.write('.')
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`\n✓ Created ${botIds.length} bots`)

  // Each bot posts 2–5 controversial comments on random ratings
  console.log('\nPosting controversial comments...')
  let totalComments = 0
  const commentRows = []

  for (const botId of botIds) {
    const numComments = 2 + Math.floor(Math.random() * 4)
    const shuffled = [...ratings].sort(() => Math.random() - 0.5).slice(0, numComments)

    for (const rating of shuffled) {
      const pool = COMMENTS[rating.category] || COMMENTS.other
      commentRows.push({
        rating_id: rating.id,
        user_id: botId,
        content: pick(pool),
      })
    }
  }

  // Batch insert in chunks of 100
  const CHUNK = 100
  for (let i = 0; i < commentRows.length; i += CHUNK) {
    const chunk = commentRows.slice(i, i + CHUNK)
    const { error } = await supabase.from('comments').insert(chunk)
    if (error) {
      console.error(`\nInsert error at chunk ${i}: ${error.message}`)
    } else {
      totalComments += chunk.length
      process.stdout.write(`\r  ${totalComments}/${commentRows.length} comments inserted`)
    }
  }

  console.log(`\n✓ Done! ${botIds.length} bots posted ${totalComments} controversial comments.`)
}

run()
