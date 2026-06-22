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

// ── Additional content beyond seed-content.mjs ──────────────────────────────
const CONTENT = {
  food: [
    // Fast food chains
    ['Popeyes', 'Popeyes Louisiana Kitchen'],
    ['Wingstop'],
    ['Taco Bell'],
    ['Subway', 'Subway (restaurant)'],
    ["Domino's Pizza"],
    ['Pizza Hut'],
    ['Wendy\'s', "Wendy's"],
    ['Burger King'],
    ['Texas Roadhouse'],
    ['Waffle House'],
    ['IHOP'],
    ['Denny\'s', "Denny's"],
    ['Panda Express'],
    ['Panera Bread'],
    ['Starbucks'],
    ['Dunkin\'', "Dunkin' Donuts"],
    ['Krispy Kreme'],
    ['Dairy Queen'],
    ['Chili\'s', "Chili's"],
    ['Applebee\'s', "Applebee's"],
    ['Buffalo Wild Wings'],
    ['Wingstop'],
    ['Culver\'s', "Culver's"],
    ['Whataburger'],
    ['Jack in the Box'],
    ['Sonic Drive-In', 'Sonic Drive-In'],
    ['Arby\'s', "Arby's"],
    ['Nando\'s', "Nando's"],
    ['Jollibee'],
    ['Tim Hortons'],
    // Famous dishes / foods
    ['Nashville Hot Chicken'],
    ['Chicago Deep Dish Pizza'],
    ['New York-Style Pizza'],
    ['Chicken and Waffles'],
    ['Pho', 'Pho (dish)'],
    ['Dim Sum'],
    ['Elote', 'Elote (food)'],
    ['Avocado Toast'],
    ['Acai Bowl'],
    ['Smash Burger'],
    ['Birria Tacos'],
    ['Lobster Roll'],
    ['Crème Brûlée'],
    ['Tiramisu'],
    ['Beef Wellington'],
    ['Cheeseburger'],
    ['Fried Chicken'],
    ['Mac and Cheese', 'Macaroni and cheese'],
    ['Cheesesteak', 'Cheesesteak'],
    ['Fish and Chips'],
  ],
  game: [
    // New releases & classics
    ['Helldivers 2'],
    ['Black Myth: Wukong'],
    ['Palworld'],
    ['Hogwarts Legacy'],
    ['Marvel\'s Spider-Man 2', "Marvel's Spider-Man 2"],
    ['Marvel\'s Spider-Man', "Marvel's Spider-Man (2018 video game)"],
    ['Ghost of Tsushima'],
    ['Horizon Zero Dawn'],
    ['The Elder Scrolls V: Skyrim'],
    ['Fallout 4'],
    ['Counter-Strike 2'],
    ['Dota 2'],
    ['World of Warcraft'],
    ['Final Fantasy VII Remake'],
    ['The Sims 4', 'The Sims 4'],
    ['Terraria'],
    ['Roblox'],
    ['Minecraft Dungeons'],
    ['Lethal Company'],
    ['Demon\'s Souls', "Demon's Souls"],
    ['Returnal', 'Returnal (video game)'],
    ['It Takes Two', 'It Takes Two (video game)'],
    ['Disco Elysium'],
    ['Outer Wilds', 'Outer Wilds (video game)'],
    ['Death Stranding'],
    ['Control', 'Control (video game)'],
    ['Cyberpunk 2077'],
    ['Starfield', 'Starfield (video game)'],
    ['EA Sports FC 25', 'EA Sports FC 25'],
    ['NBA 2K25'],
    ['Tekken 8'],
    ['Street Fighter 6'],
    ['Mortal Kombat 1'],
    ['Super Smash Bros. Ultimate'],
    ['Mario Kart 8 Deluxe'],
    ['The Legend of Zelda: Tears of the Kingdom'],
    ['Metroid Dread'],
    ['Pokémon Scarlet and Violet', 'Pokémon Scarlet and Violet'],
    ['Grand Theft Auto: San Andreas'],
    ['The Sims 2', 'The Sims 2'],
    ['Portal 2'],
    ['Half-Life 2'],
    ['Team Fortress 2'],
    ['Left 4 Dead 2'],
  ],
  sport: [
    // Football clubs
    ['Manchester City F.C.', 'Manchester City F.C.'],
    ['Real Madrid C.F.', 'Real Madrid C.F.'],
    ['FC Barcelona', 'FC Barcelona'],
    ['Bayern Munich', 'FC Bayern Munich'],
    ['Liverpool F.C.', 'Liverpool F.C.'],
    ['Manchester United F.C.', 'Manchester United F.C.'],
    ['Paris Saint-Germain F.C.', 'Paris Saint-Germain F.C.'],
    ['Juventus F.C.', 'Juventus F.C.'],
    ['Arsenal F.C.', 'Arsenal F.C.'],
    ['Chelsea F.C.', 'Chelsea F.C.'],
    ['Inter Milan', 'Inter Milan'],
    ['AC Milan', 'A.C. Milan'],
    // NBA teams
    ['Los Angeles Lakers'],
    ['Golden State Warriors'],
    ['Boston Celtics'],
    ['Miami Heat'],
    ['Chicago Bulls'],
    // NFL teams
    ['Kansas City Chiefs'],
    ['New England Patriots'],
    ['Dallas Cowboys'],
    ['San Francisco 49ers'],
    // MLB
    ['New York Yankees'],
    // More players
    ['Jude Bellingham'],
    ['Vinícius Júnior', 'Vinícius Júnior'],
    ['Carlos Alcaraz'],
    ['Victor Wembanyama'],
    ['Caitlin Clark'],
    ['Angel Reese'],
    ['Anthony Edwards', 'Anthony Edwards (basketball)'],
    ['Ja Morant'],
    ['Jaylen Brown'],
    ['Saquon Barkley'],
    ['Josh Allen', 'Josh Allen (quarterback)'],
    ['Lamar Jackson'],
    ['Joe Burrow'],
    ['Justin Jefferson', 'Justin Jefferson (wide receiver)'],
    ['Shohei Ohtani'],
    ['Fernando Tatis Jr.', 'Fernando Tatis Jr.'],
    ['Mike Trout'],
    ['Bryce Harper'],
    ['Coco Gauff'],
    ['Iga Świątek', 'Iga Świątek'],
    ['Jannik Sinner'],
  ],
  music: [
    // More artists
    ['Sabrina Carpenter'],
    ['Chappell Roan'],
    ['Ice Spice'],
    ['GloRilla', 'GloRilla (rapper)'],
    ['Sexyy Red'],
    ['Peso Pluma'],
    ['Feid', 'Feid (singer)'],
    ['Karol G'],
    ['Bad Gyal'],
    ['Maluma'],
    ['J Balvin'],
    ['Shakira'],
    ['Bob Marley'],
    ['Michael Jackson'],
    ['Elvis Presley'],
    ['Madonna'],
    ['Prince', 'Prince (musician)'],
    ['David Bowie'],
    ['The Rolling Stones'],
    ['Led Zeppelin'],
    ['Nirvana'],
    ['Tupac Shakur'],
    ['The Notorious B.I.G.', 'The Notorious B.I.G.'],
    ['Nas', 'Nas (rapper)'],
    ['Lauryn Hill'],
    ['Erykah Badu'],
    ['D\'Angelo', "D'Angelo"],
    ['Frank Sinatra'],
    ['Amy Winehouse'],
    ['Adele'],
    ['Sam Smith'],
    ['Lizzo'],
    ['Megan Thee Stallion'],
    ['City Girls'],
    ['Young Miko'],
    ['Latto'],
    ['Ethel Cain'],
    ['Wet Leg'],
    ['Steve Lacy'],
    ['BROCKHAMPTON'],
    ['21 Savage'],
    ['Future', 'Future (rapper)'],
    ['Gunna', 'Gunna (rapper)'],
    ['Lil Durk'],
    ['Rod Wave'],
    ['Polo G'],
    ['NLE Choppa'],
    ['Central Cee'],
    ['Dave', 'Dave (rapper)'],
    ['Stormzy'],
    ['ArrDee'],
  ],
  book: [
    ['Fourth Wing', 'Fourth Wing (novel)'],
    ['A Court of Thorns and Roses'],
    ['It Ends with Us'],
    ['The Midnight Library'],
    ['Where the Crawdads Sing'],
    ['The Seven Husbands of Evelyn Hugo'],
    ['Lessons in Chemistry', 'Lessons in Chemistry (novel)'],
    ['Verity', 'Verity (novel)'],
    ['November 9', 'November 9 (novel)'],
    ['Ugly Love'],
    ['Normal People'],
    ['Sally Rooney', 'Normal People'],
    ['Educated', 'Educated (memoir)'],
    ['The Body Keeps the Score'],
    ['Greenlights', 'Greenlights (book)'],
    ['Can\'t Hurt Me'],
    ['Never Finished'],
    ['Outliers', 'Outliers (book)'],
    ['Blink', 'Blink (book)'],
    ['Freakonomics'],
    ['The Tipping Point'],
    ['Zero to One'],
    ['The Lean Startup'],
    ['Shoe Dog'],
    ['Steve Jobs', 'Steve Jobs (book)'],
    ['The Everything Store'],
    ['Elon Musk', 'Elon Musk (biography)'],
    ['A Little Life'],
    ['The Kite Runner'],
    ['A Thousand Splendid Suns'],
    ['The Handmaid\'s Tale'],
    ['Gone Girl', 'Gone Girl (novel)'],
    ['The Girl with the Dragon Tattoo'],
    ['Big Little Lies', 'Big Little Lies (novel)'],
    ['The Thursday Murder Club'],
    ['Project Hail Mary'],
    ['The Martian', 'The Martian (novel)'],
    ['Ready Player One'],
    ['Ender\'s Game'],
    ['The Name of the Wind'],
  ],
  movie: [
    ['Poor Things', 'Poor Things (film)'],
    ['Killers of the Flower Moon'],
    ['The Holdovers'],
    ['Past Lives', 'Past Lives (film)'],
    ['Saltburn', 'Saltburn (film)'],
    ['Priscilla', 'Priscilla (film)'],
    ['May December'],
    ['Challengers', 'Challengers (film)'],
    ['Civil War', 'Civil War (2024 film)'],
    ['Dune: Part Two'],
    ['Deadpool & Wolverine'],
    ['Inside Out 2'],
    ['Alien: Romulus'],
    ['Longlegs', 'Longlegs (film)'],
    ['Twisters', 'Twisters (film)'],
    ['The Substance'],
    ['Conclave', 'Conclave (film)'],
    ['Gladiator II'],
    ['Wicked', 'Wicked (film)'],
    ['Moana 2'],
    ['Mufasa: The Lion King'],
    ['Nosferatu', 'Nosferatu (2024 film)'],
    ['Anora', 'Anora (film)'],
    ['The Brutalist'],
    ['Flow', 'Flow (2024 film)'],
  ],
  tv: [
    ['The Penguin', 'The Penguin (TV series)'],
    ['Shōgun', 'Shōgun (2024 TV series)'],
    ['Baby Reindeer', 'Baby Reindeer (TV series)'],
    ['3 Body Problem', '3 Body Problem (TV series)'],
    ['Mr. & Mrs. Smith', 'Mr. & Mrs. Smith (2024 TV series)'],
    ['Ripley', 'Ripley (TV series)'],
    ['The Gentlemen', 'The Gentlemen (TV series)'],
    ['Fallout', 'Fallout (TV series)'],
    ['Monsters: The Lyle and Erik Menendez Story'],
    ['The Perfect Couple', 'The Perfect Couple (TV series)'],
    ['Nobody Wants This'],
    ['Emily in Paris'],
    ['Outer Banks'],
    ['Virgin River'],
    ['Ginny & Georgia'],
    ['You', 'You (TV series)'],
    ['Bridgerton'],
    ['The Witcher', 'The Witcher (TV series)'],
    ['Shadow and Bone'],
    ['Alice in Borderland'],
    ['All of Us Are Dead'],
    ['Extraordinary Attorney Woo'],
    ['My Mister'],
    ['Crash Landing on You'],
    ['Vincenzo', 'Vincenzo (TV series)'],
    ['Taxi Driver', 'Taxi Driver (2021 TV series)'],
  ],
  youtube: [
    ['IShowSpeed', 'IShowSpeed (streamer)'],
    ['Kai Cenat'],
    ['xQc', 'xQc'],
    ['HasanAbi'],
    ['Ludwig', 'Ludwig (streamer)'],
    ['Moistcr1tikal', 'penguinz0'],
    ['Moist Meter'],
    ['Graystillplays'],
    ['DanTDM'],
    ['Technoblade'],
    ['Philza'],
    ['Quackity'],
    ['Tubbo'],
    ['Ranboo'],
    ['TommyInnit'],
    ['Call Me Kevin'],
    ['RTGame'],
    ['ZHC'],
    ['Baumgartner Restoration'],
    ['Abroad in Japan'],
    ['Ryan Trahan'],
    ['Danny Gonzalez'],
    ['Kurtis Conner'],
    ['D\'Angelo Wallace', "D'Angelo Wallace"],
    ['Sarah Z'],
    ['Tiffanyferg'],
    ['James Somerton'],
    ['Jarvis Johnson'],
    ['Eddy Burback'],
    ['NakeyJakey'],
    ['videogamedunkey'],
    ['Joseph Anderson', 'Joseph Anderson (YouTuber)'],
    ['Dunkey', 'videogamedunkey'],
    ['MatPat', 'Game Theory (YouTube channel)'],
    ['Game Theory'],
    ['Film Theory'],
    ['The Try Guys'],
    ['Unsolved Mysteries'],
    ['Buzzfeed Unsolved'],
    ['Bailey Sarian'],
    ['JCS Criminal Psychology'],
  ],
  other: [
    ['Supreme', 'Supreme (brand)'],
    ['Nike'],
    ['Adidas'],
    ['Off-White', 'Off-White (brand)'],
    ['Balenciaga'],
    ['Louis Vuitton'],
    ['Gucci'],
    ['Prada'],
    ['Versace'],
    ['Stone Island'],
    ['Palace Skateboards'],
    ['Carhartt'],
    ['New Balance'],
    ['Jordan Brand'],
    ['Converse'],
    ['Vans'],
    ['Tesla'],
    ['Apple'],
    ['iPhone'],
    ['AirPods'],
    ['MacBook Pro'],
    ['PlayStation 5'],
    ['Xbox Series X'],
    ['Nintendo Switch'],
    ['TikTok'],
    ['Instagram'],
    ['Snapchat'],
    ['Twitter/X', 'Twitter'],
    ['Coachella'],
    ['Rolling Loud'],
    ['Glastonbury Festival'],
    ['Met Gala'],
    ['Grammy Awards'],
    ['Super Bowl'],
    ['World Cup', 'FIFA World Cup'],
    ['Olympics'],
    ['Cannes Film Festival'],
  ],
}

const REVIEWS = {
  movie: [
    'Genuinely one of the best films ever made.',
    'Overrated. I don\'t get the hype at all.',
    'Watched it 5 times and it only gets better.',
    'The cinematography alone deserves a 10.',
    'Good but not great. People oversell this.',
    'Changed how I think about cinema.',
    'Slept on it. Woke up. Still thinking about it.',
    'Peak filmmaking. Nothing comes close.',
    'I cried. I don\'t cry at movies. This is it.',
    null,
  ],
  tv: [
    'Best show I\'ve ever watched. Peak television.',
    'Started strong, fell off hard by season 3.',
    'Every episode leaves me wanting more.',
    'The writing is on another level.',
    'Overrated by the internet. It\'s just okay.',
    'Binged the whole thing in a weekend. No regrets.',
    'The characters are what make this special.',
    'Cancelled too soon. I\'m still not over it.',
    null,
  ],
  sport: [
    'The greatest to ever do it. Full stop.',
    'Overrated. Stats don\'t tell the whole story.',
    'Watching them play is a religious experience.',
    'GOAT conversation is over. It\'s this.',
    'Carried by teammates. Take that away and what\'s left?',
    'Pure talent. Generational athlete.',
    'Clutch when it matters most. That\'s all I need.',
    'Built different. Literally.',
    null,
  ],
  youtube: [
    'The production quality is insane.',
    'Peak content. The algorithm blessed me.',
    'Fell off hard after 2020. Not the same.',
    'This channel genuinely taught me things.',
    'I don\'t trust people who don\'t watch this.',
    'Parasocial kings. Still watch every upload.',
    'The editing alone deserves an award.',
    null,
  ],
  music: [
    'This album changed my entire taste in music.',
    'Overplayed. Good for like 3 songs.',
    'Every track is a hit. No skips.',
    'This is what peak music sounds like.',
    'Dated fast. Doesn\'t hold up.',
    'Still on repeat years later.',
    'The lyricism on this is unmatched.',
    'Carried hard by the production.',
    null,
  ],
  book: [
    'Read it in one sitting. Life-changing.',
    'Overrated classic. Couldn\'t finish it.',
    'Every page has something worth underlining.',
    'Required reading for literally anyone.',
    'Changed the way I see the world.',
    'Honestly kind of dry. People hype this too much.',
    'The ending destroyed me.',
    'Couldn\'t put it down.',
    null,
  ],
  game: [
    'Spent 300 hours in this. Worth every second.',
    'Finished it in a week. Immediately started again.',
    'Genuinely one of the best games ever made.',
    'Broken at launch. Still played 200 hours.',
    'The world-building is unmatched.',
    'Addictive in the best possible way.',
    'Overrated by the community. It\'s fine.',
    'The story made me emotional. In a game. Wild.',
    null,
  ],
  food: [
    'Worth every penny and the wait.',
    'Overpriced for what it is honestly.',
    'I think about this meal weekly.',
    'Best I\'ve ever had. No competition.',
    'Hype is totally warranted.',
    'Disappointing given the reputation.',
    'Life-changing. My standards are ruined.',
    'The comfort food I didn\'t know I needed.',
    null,
  ],
  other: [
    'Overhyped but still kind of delivers.',
    'The cultural impact is undeniable.',
    'Peaked years ago and we\'re just in denial.',
    'Built different. Nothing compares.',
    'The aesthetic alone makes it worth it.',
    'Status symbol or genuinely good? Both.',
    'Controversial opinion: it\'s mid.',
    null,
  ],
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randScore() {
  // Weighted toward 6-9 (realistic user ratings skew positive)
  const weights = [1, 1, 2, 3, 4, 5, 6, 5, 3, 1] // indices 0-9 = scores 1-10
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
      const { count } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('title', displayTitle)
        .eq('category', category)

      if (count && count > 0) {
        process.stdout.write(`  ↩ ${displayTitle} (already exists)\n`)
        continue
      }

      const imageUrl = await getWikiImage(wikiTitle ?? displayTitle)
      await sleep(120)

      const raters = shuffle(botIds).slice(0, 4 + Math.floor(Math.random() * 6))
      const rows = raters.map(userId => ({
        user_id: userId,
        title: displayTitle,
        category,
        score: randScore(),
        review: pick(REVIEWS[category]),
        image_url: imageUrl,
      }))

      const { error } = await supabase.from('ratings').insert(rows)
      if (error) {
        process.stdout.write(`  ✗ ${displayTitle}: ${error.message}\n`)
      } else {
        totalInserted += rows.length
        process.stdout.write(`  ✓ ${displayTitle} — ${rows.length} ratings${imageUrl ? ' 🖼' : ''}\n`)
      }
    }
  }

  console.log(`\n✓ Done! ${totalInserted} total ratings inserted.`)
}

run()
