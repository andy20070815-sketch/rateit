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

// ── Content library ─────────────────────────────────────────────────────────
// Each entry: [displayTitle, wikipediaSearchTitle (if different)]
const CONTENT = {
  movie: [
    ['Inception'], ['The Dark Knight'], ['Interstellar'], ['Oppenheimer'], ['Parasite'],
    ['Pulp Fiction'], ['The Godfather'], ['The Shawshank Redemption'], ['The Matrix'],
    ['Titanic', 'Titanic (1997 film)'], ['Joker', 'Joker (2019 film)'],
    ['Avengers: Endgame'], ['Black Panther', 'Black Panther (film)'],
    ['Get Out', 'Get Out (film)'], ['Dune', 'Dune (2021 film)'],
    ['Top Gun: Maverick'], ['Barbie', 'Barbie (film)'],
    ['Everything Everywhere All at Once'],
    ['Spider-Man: Across the Spider-Verse'],
    ['Avatar', 'Avatar (2009 film)'], ['The Wolf of Wall Street', 'The Wolf of Wall Street (film)'],
    ['La La Land'], ['Whiplash', 'Whiplash (2014 film)'], ['1917', '1917 (film)'],
    ['Knives Out'], ['The Grand Budapest Hotel'],
    ['Mad Max: Fury Road'], ['Gone Girl', 'Gone Girl (film)'],
    ['A Quiet Place'], ['Hereditary', 'Hereditary (film)']
  ],
  tv: [
    ['Breaking Bad'], ['Game of Thrones'], ['Stranger Things'], ['The Office', 'The Office (American TV series)'],
    ['Squid Game'], ['Money Heist'], ['Euphoria', 'Euphoria (American TV series)'],
    ['The Last of Us', 'The Last of Us (TV series)'], ['Wednesday', 'Wednesday (TV series)'],
    ['House of the Dragon'], ['Succession', 'Succession (TV series)'],
    ['Better Call Saul'], ['Peaky Blinders'], ['Ozark', 'Ozark (TV series)'],
    ['The Bear', 'The Bear (TV series)'], ['Ted Lasso'], ['Dark', 'Dark (TV series)'],
    ['Narcos'], ['The Mandalorian'], ['The Crown', 'The Crown (TV series)'],
    ['Severance', 'Severance (TV series)'], ['Andor', 'Andor (TV series)'],
    ['The Boys', 'The Boys (TV series)'], ['Invincible', 'Invincible (TV series)'],
    ['Arcane', 'Arcane (TV series)'], ['Attack on Titan'],
    ['Demon Slayer'], ['Jujutsu Kaisen'], ['One Piece', 'One Piece'],
    ['Death Note']
  ],
  sport: [
    ['Lionel Messi'], ['Cristiano Ronaldo'], ['LeBron James'], ['Michael Jordan'],
    ['Serena Williams'], ['Usain Bolt'], ['Tom Brady'], ['Simone Biles'],
    ['Roger Federer'], ['Novak Djokovic'], ['Tiger Woods'], ['Kobe Bryant'],
    ['Stephen Curry'], ['Neymar Jr', 'Neymar'], ['Erling Haaland'],
    ['Patrick Mahomes'], ['Naomi Osaka'], ['Lewis Hamilton'],
    ['Rafael Nadal'], ['Virat Kohli'], ['Giannis Antetokounmpo'],
    ['Luka Dončić', 'Luka Dončić'], ['Kevin Durant'], ['Shaquille O\'Neal', 'Shaquille O\'Neal'],
    ['Muhammad Ali'], ['Pelé'], ['Ronaldinho'], ['Thierry Henry'],
    ['Kylian Mbappé', 'Kylian Mbappé'], ['Alexia Putellas']
  ],
  youtube: [
    ['MrBeast', 'MrBeast (YouTuber)'], ['PewDiePie'], ['Markiplier'],
    ['Jacksepticeye'], ['Logan Paul'], ['KSI'], ['Dude Perfect'],
    ['Vsauce'], ['Veritasium'], ['Kurzgesagt'],
    ['MKBHD', 'Marques Brownlee'], ['Linus Tech Tips'], ['David Dobrik'],
    ['Emma Chamberlain'], ['Dream', 'Dream (YouTuber)'],
    ['Pokimane'], ['Ninja', 'Ninja (streamer)'], ['Valkyrae'],
    ['Coryxkenshin'], ['Jacksfilms'],
    ['3Blue1Brown'], ['Tom Scott'], ['CGP Grey'],
    ['Smarter Every Day'], ['Mark Rober'],
    ['NileRed'], ['Primitive Technology'], ['Corridor Crew'],
    ['Yes Theory'], ['Drew Gooden']
  ],
  music: [
    ['Drake', 'Drake (musician)'], ['Taylor Swift'], ['Kendrick Lamar'],
    ['Bad Bunny'], ['The Weeknd'], ['Beyoncé'], ['Tyler the Creator', 'Tyler, the Creator'],
    ['Billie Eilish'], ['Harry Styles'], ['SZA', 'SZA (singer)'],
    ['Olivia Rodrigo'], ['Travis Scott', 'Travis Scott (rapper)'],
    ['Post Malone'], ['Doja Cat'], ['J. Cole'],
    ['Kanye West'], ['Rihanna'], ['Ed Sheeran'],
    ['Ariana Grande'], ['Lil Baby'], ['Juice WRLD'],
    ['XXXTentacion'], ['Frank Ocean'], ['Childish Gambino'],
    ['Eminem'], ['Jay-Z'], ['Nicki Minaj'],
    ['Cardi B'], ['Dua Lipa'], ['The Beatles']
  ],
  book: [
    ['Atomic Habits'], ['1984', 'Nineteen Eighty-Four'],
    ['Harry Potter', 'Harry Potter and the Philosopher\'s Stone'],
    ['To Kill a Mockingbird'], ['The Great Gatsby'], ['Sapiens', 'Sapiens: A Brief History of Humankind'],
    ['Thinking, Fast and Slow'], ['The Alchemist', 'The Alchemist (novel)'],
    ['Dune', 'Dune (novel)'], ['Lord of the Rings', 'The Lord of the Rings'],
    ['The Hunger Games'], ['Rich Dad Poor Dad'],
    ['The Psychology of Money'], ['The 48 Laws of Power'],
    ['Fahrenheit 451'], ['Brave New World'], ['Crime and Punishment'],
    ['Meditations', 'Meditations (Marcus Aurelius)'],
    ['The Subtle Art of Not Giving a F*ck'],
    ['A Brief History of Time'], ['The Power of Now'],
    ['Think and Grow Rich'], ['The 4-Hour Workweek'],
    ['Man\'s Search for Meaning', 'Man\'s Search for Meaning'],
    ['Catch-22'], ['Slaughterhouse-Five'], ['The Road', 'The Road (novel)'],
    ['Blood Meridian'], ['Anna Karenina'], ['Don Quixote']
  ],
  game: [
    ['Minecraft'], ['Grand Theft Auto V'], ['The Last of Us', 'The Last of Us (video game)'],
    ['Red Dead Redemption 2'], ['Elden Ring'], ['God of War', 'God of War (2018 video game)'],
    ['Fortnite'], ['Valorant'], ['League of Legends'],
    ['Cyberpunk 2077'], ['Baldur\'s Gate 3'], ['The Witcher 3: Wild Hunt'],
    ['The Legend of Zelda: Breath of the Wild'],
    ['Super Mario Odyssey'], ['Among Us'], ['Rocket League'],
    ['Stardew Valley'], ['Hollow Knight'], ['Hades', 'Hades (video game)'],
    ['Celeste', 'Celeste (video game)'], ['Call of Duty: Warzone'],
    ['Apex Legends'], ['Overwatch', 'Overwatch (video game)'],
    ['Dark Souls', 'Dark Souls (video game)'], ['Sekiro: Shadows Die Twice'],
    ['Monster Hunter World'], ['Genshin Impact'], ['Pokémon GO'],
    ['FIFA 23'], ['NBA 2K23']
  ],
  food: [
    ['McDonald\'s', 'McDonald\'s'], ['Chipotle', 'Chipotle Mexican Grill'],
    ['Shake Shack'], ['In-N-Out Burger'], ['Five Guys'],
    ['Chick-fil-A'], ['Raising Cane\'s', 'Raising Cane\'s Chicken Fingers'],
    ['Sweetgreen'], ['The Cheesecake Factory'], ['Olive Garden'],
    ['Nobu', 'Nobu (restaurant)'], ['Gordon Ramsay Restaurants', 'Gordon Ramsay'],
    ['Wagyu Beef'], ['Sushi'], ['Ramen', 'Ramen'],
    ['Tacos'], ['Pizza', 'Pizza'], ['Boba Tea', 'Bubble tea'],
    ['Croissant'], ['Pad Thai'], ['Peking Duck'],
    ['Truffle Pasta'], ['Lobster Roll'], ['Birria Tacos'],
    ['Smash Burger'], ['Korean BBQ'], ['Biriyani', 'Biryani'],
    ['Tonkotsu Ramen'], ['Tiramisu'], ['Crème Brûlée']
  ],
}

const REVIEWS = {
  movie: {
    positive: [
      'Genuinely one of the best films ever made.',
      'Watched it 5 times and it only gets better.',
      'The cinematography alone deserves a 10.',
      'Changed how I think about cinema.',
      'Peak filmmaking. Nothing comes close.',
      'I cried. I don\'t cry at movies. This is it.',
      'Slept on it. Woke up. Still thinking about it.',
    ],
    neutral: [
      'Good but not great. People oversell this.',
      'Enjoyable but nothing I\'d rush to rewatch.',
    ],
    negative: [
      'Overrated. I don\'t get the hype at all.',
      'Pretty disappointing given all the praise.',
    ],
  },
  tv: {
    positive: [
      'Best show I\'ve ever watched. Peak television.',
      'Every episode leaves me wanting more.',
      'The writing is on another level.',
      'Binged the whole thing in a weekend. No regrets.',
      'The characters are what make this special.',
      'Cancelled too soon. I\'m still not over it.',
    ],
    neutral: [
      'Started strong, fell off a bit as it went on.',
      'Good, not the masterpiece people claim.',
    ],
    negative: [
      'Overrated by the internet. It\'s just okay.',
      'Started strong, fell off hard by season 3.',
    ],
  },
  sport: {
    positive: [
      'The greatest to ever do it. Full stop.',
      'Watching them play is a religious experience.',
      'GOAT conversation is over. It\'s this person.',
      'Pure talent. Generational athlete.',
      'Clutch when it matters most. That\'s all I need.',
    ],
    neutral: [
      'Has the talent but the consistency just isn\'t there.',
      'Good but not elite. The hype is a bit much.',
    ],
    negative: [
      'Overrated. Stats don\'t tell the whole story.',
      'Carried by teammates. Take that away and what\'s left?',
    ],
  },
  youtube: {
    positive: [
      'The production quality is insane.',
      'Peak content. The algorithm blessed me.',
      'This channel genuinely taught me things.',
      'I don\'t trust people who don\'t watch this.',
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
      'Dated fast. Doesn\'t hold up.',
    ],
  },
  book: {
    positive: [
      'Read it in one sitting. Life-changing.',
      'Every page has something worth underlining.',
      'Required reading for literally anyone.',
      'Changed the way I see the world.',
      'The ending destroyed me.',
      'Couldn\'t put it down.',
    ],
    neutral: [
      'Interesting ideas but the pacing drags.',
      'Good book. Not the revelation people promised.',
    ],
    negative: [
      'Overrated classic. Couldn\'t finish it.',
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
      'Overrated by the community. It\'s fine.',
      'Fun for a few hours, then it completely lost me.',
    ],
  },
  food: {
    positive: [
      'Worth every penny and the wait.',
      'I think about this meal weekly.',
      'Best I\'ve ever had. No competition.',
      'Hype is totally warranted.',
      'Life-changing. My standards are ruined.',
    ],
    neutral: [
      'Pretty good but nothing I\'d go out of my way for.',
      'Solid, nothing groundbreaking.',
    ],
    negative: [
      'Overpriced for what it is honestly.',
      'Disappointing given the reputation.',
    ],
  },
}

function pickReview(cat, score) {
  const tiers = REVIEWS[cat]
  if (!tiers) return null
  const pool = score >= 7 ? tiers.positive : score <= 4 ? tiers.negative : tiers.neutral
  const arr = [...pool, null]
  return arr[Math.floor(Math.random() * arr.length)]
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randScore() {
  const weights = [1, 1, 2, 3, 4, 5, 6, 5, 3, 1]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i + 1
  }
  return 7
}
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function getWikiImage(searchTitle) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTitle)}`
    const res = await fetch(url, { headers: { 'User-Agent': 'rateit-seed/1.0' } })
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail?.source ?? null
  } catch {
    return null
  }
}

async function run() {
  // Load all bot user IDs
  const { data: profiles } = await supabase.from('profiles').select('id')
  if (!profiles?.length) { console.error('No profiles found. Run seed-bots.mjs first.'); process.exit(1) }
  const botIds = profiles.map(p => p.id)
  console.log(`Using ${botIds.length} bots\n`)

  const categories = Object.keys(CONTENT)
  let totalInserted = 0

  for (const category of categories) {
    const items = CONTENT[category]
    console.log(`\n── ${category.toUpperCase()} (${items.length} items) ──`)

    for (const [displayTitle, wikiTitle] of items) {
      // Check if ratings already exist for this title+category
      const { count } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('title', displayTitle)
        .eq('category', category)

      if (count && count > 0) {
        process.stdout.write(`  ↩ ${displayTitle} (already exists)\n`)
        continue
      }

      // Fetch Wikipedia image
      const imageUrl = await getWikiImage(wikiTitle ?? displayTitle)
      await sleep(150) // be gentle with Wikipedia

      // Pick 4–9 random bots to rate this item
      const raters = shuffle(botIds).slice(0, 4 + Math.floor(Math.random() * 6))
      const rows = raters.map(userId => {
        const score = randScore()
        return {
          user_id: userId,
          title: displayTitle,
          category,
          score,
          review: pickReview(category, score),
          image_url: imageUrl,
        }
      })

      const { error } = await supabase.from('ratings').insert(rows)
      if (error) {
        process.stdout.write(`  ✗ ${displayTitle}: ${error.message}\n`)
      } else {
        totalInserted += rows.length
        process.stdout.write(`  ✓ ${displayTitle} — ${rows.length} ratings${imageUrl ? ' 🖼' : ''}\n`)
      }
    }
  }

  console.log(`\n✓ Done! ${totalInserted} total ratings inserted across ${categories.length} categories.`)
}

run()
