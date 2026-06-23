// Seeds games from ALL platforms: Mobile, PS5, Switch, Xbox, PC, Classic
// Run with: node scripts/seed-games-all.mjs

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

// [displayTitle, wikiSearchTitle (optional)]
// All go in category: 'game'
const GAMES = [
  // ── MOBILE (App Store / Google Play) ────────────────────────────────────
  ['Candy Crush Saga'],
  ['Clash of Clans'],
  ['Clash Royale'],
  ['PUBG Mobile'],
  ['Garena Free Fire'],
  ['Mobile Legends: Bang Bang'],
  ['Call of Duty: Mobile'],
  ['Brawl Stars'],
  ['Subway Surfers'],
  ['Temple Run'],
  ['Angry Birds', 'Angry Birds (video game)'],
  ['Cut the Rope'],
  ['Fruit Ninja'],
  ['Alto\'s Odyssey'],
  ['Monument Valley', 'Monument Valley (video game)'],
  ['Monument Valley 2'],
  ['Mini Metro'],
  ['Mini Motorways'],
  ['Crossy Road', 'Crossy Road (video game)'],
  ['Pokémon UNITE'],
  ['Mario Kart Tour'],
  ['Super Mario Run'],
  ['Fire Emblem Heroes'],
  ['Honkai: Star Rail'],
  ['League of Legends: Wild Rift'],
  ['Hearthstone'],
  ['Legends of Runeterra'],
  ['AFK Arena'],
  ['Summoners War: Sky Arena', 'Summoners War: Sky Arena'],
  ['Dragon Ball Z Dokkan Battle', 'Dragon Ball Z Dokkan Battle'],
  ['Diablo Immortal'],
  ['Stumble Guys'],
  ['Royal Match'],
  ['Gardenscapes'],
  ['Cookie Run: Kingdom'],
  ['Hay Day'],
  ['Boom Beach'],
  ['Rise of Kingdoms'],
  ['Lords Mobile'],
  ['Archero', 'Archero (video game)'],
  ['Soul Knight'],
  ['PUBG: New State', 'PUBG: New State'],
  ['Goose Goose Duck'],
  ['Vampire Survivors'],
  ['Balatro'],
  ['Wordle', 'Wordle (game)'],
  ['2048', '2048 (video game)'],
  ['Eggy Party'],
  ['Tower of Fantasy'],
  ['Honkai Impact 3rd'],

  // ── PS5 EXCLUSIVES & MAJOR TITLES ────────────────────────────────────────
  ['God of War Ragnarök'],
  ['Ratchet & Clank: Rift Apart'],
  ['Spider-Man: Miles Morales', "Marvel's Spider-Man: Miles Morales"],
  ['Astro Bot', 'Astro Bot (video game)'],
  ['Astro\'s Playroom'],
  ['Horizon Forbidden West'],
  ['The Last of Us Part I', 'The Last of Us Part I'],
  ['Final Fantasy XVI', 'Final Fantasy XVI'],
  ['Final Fantasy VII Rebirth'],
  ['Gran Turismo 7'],
  ['Stellar Blade', 'Stellar Blade (video game)'],
  ['Silent Hill 2 Remake', 'Silent Hill 2 (2024 video game)'],
  ['Alan Wake 2'],
  ['Resident Evil Village'],
  ['Resident Evil 4 Remake', 'Resident Evil 4 (2023 video game)'],
  ['Dead Space Remake', 'Dead Space (2023 video game)'],
  ['Lies of P'],
  ['Like a Dragon: Infinite Wealth'],
  ['Persona 3 Reload'],
  ['Persona 5 Royal'],
  ['Metaphor: ReFantazio'],
  ['Monster Hunter Rise'],
  ['Monster Hunter Wilds'],
  ['Dragon\'s Dogma 2', "Dragon's Dogma 2"],
  ['Kena: Bridge of Spirits'],
  ['Ghostwire: Tokyo'],
  ['Deathloop', 'Deathloop (video game)'],
  ['Wo Long: Fallen Dynasty'],
  ['Nioh 2'],
  ['Sackboy: A Big Adventure'],
  ['Ghost of Yōtei'],
  ['Death Stranding 2: On the Beach'],

  // ── NINTENDO SWITCH ──────────────────────────────────────────────────────
  ['Animal Crossing: New Horizons'],
  ['Pokémon Sword and Shield'],
  ['Pokémon Legends: Arceus'],
  ['Splatoon 3'],
  ['Xenoblade Chronicles 3'],
  ['Fire Emblem: Three Houses'],
  ['Fire Emblem Engage'],
  ['Bayonetta 3'],
  ['Luigi\'s Mansion 3'],
  ['Paper Mario: The Origami King'],
  ['Paper Mario: The Thousand-Year Door', 'Paper Mario: The Thousand-Year Door (Nintendo Switch)'],
  ['Kirby and the Forgotten Land'],
  ['Ring Fit Adventure'],
  ['Nintendo Switch Sports'],
  ['Super Mario Bros. Wonder'],
  ['Pikmin 4'],
  ['WarioWare: Move It!'],
  ['Cuphead', 'Cuphead (video game)'],
  ['Shovel Knight'],
  ['Metroid Prime Remastered'],
  ['Xenoblade Chronicles', 'Xenoblade Chronicles (video game)'],

  // ── XBOX / MICROSOFT ─────────────────────────────────────────────────────
  ['Halo Infinite'],
  ['Halo: The Master Chief Collection'],
  ['Forza Horizon 5'],
  ['Forza Motorsport', 'Forza Motorsport (2023 video game)'],
  ['Gears 5'],
  ['Sea of Thieves'],
  ['Grounded', 'Grounded (video game)'],
  ['Psychonauts 2'],
  ['Microsoft Flight Simulator', 'Microsoft Flight Simulator (2020 video game)'],
  ['Age of Empires IV'],
  ['Hi-Fi Rush'],
  ['Pentiment'],
  ['Ori and the Will of the Wisps'],
  ['Ori and the Blind Forest'],

  // ── PC EXCLUSIVES / POPULAR PC ───────────────────────────────────────────
  ['Overwatch 2'],
  ['Diablo IV'],
  ['Path of Exile'],
  ['StarCraft II'],
  ['Escape from Tarkov'],
  ['Hunt: Showdown'],
  ['DayZ', 'DayZ (video game)'],
  ['Rust', 'Rust (video game)'],
  ['ARK: Survival Evolved'],
  ['Valheim'],
  ['V Rising'],
  ['Satisfactory', 'Satisfactory (video game)'],
  ['Factorio'],
  ['RimWorld'],
  ['Slay the Spire'],
  ['Inscryption'],
  ['Darkest Dungeon'],
  ['Hades II'],
  ['Enter the Gungeon'],
  ['The Binding of Isaac: Rebirth'],
  ['Noita', 'Noita (video game)'],
  ['Deep Rock Galactic'],
  ['Monster Train'],
  ['Phasmophobia'],
  ['Subnautica'],
  ['Subnautica: Below Zero'],
  ['No Man\'s Sky'],
  ['Cities: Skylines'],
  ['Cities: Skylines II'],
  ['Planet Zoo'],
  ['Two Point Hospital'],
  ['Football Manager 2024'],
  ['Total War: Warhammer III'],
  ['Crusader Kings III'],
  ['Victoria 3'],
  ['Civilization VI'],
  ['XCOM 2'],
  ['Into the Breach'],
  ['Divinity: Original Sin 2'],
  ['Pillars of Eternity II'],
  ['Pyre', 'Pyre (video game)'],
  ['Transistor', 'Transistor (video game)'],
  ['Bastion', 'Bastion (video game)'],
  ['Untitled Goose Game'],
  ['A Short Hike'],
  ['Spiritfarer'],
  ['Night in the Woods'],
  ['Chicory: A Colorful Tale'],
  ['Doki Doki Literature Club'],
  ['Omori', 'Omori (video game)'],
  ['Undertale'],
  ['Deltarune'],
  ['OneShot', 'OneShot (video game)'],

  // ── CLASSIC / LEGACY ─────────────────────────────────────────────────────
  ['Super Mario Bros.', 'Super Mario Bros.'],
  ['Super Mario 64'],
  ['Super Mario Galaxy'],
  ['Super Mario World', 'Super Mario World'],
  ['Super Mario Bros. 3'],
  ['Mario Kart 64'],
  ['The Legend of Zelda: Ocarina of Time'],
  ['The Legend of Zelda: Majora\'s Mask'],
  ['The Legend of Zelda: The Wind Waker'],
  ['The Legend of Zelda: Twilight Princess'],
  ['The Legend of Zelda: A Link to the Past'],
  ['The Legend of Zelda', 'The Legend of Zelda (video game)'],
  ['Pokémon Red and Blue', 'Pokémon Red and Blue'],
  ['Pokémon Gold and Silver', 'Pokémon Gold and Silver'],
  ['Pokémon Diamond and Pearl', 'Pokémon Diamond and Pearl'],
  ['Pokémon Black and White', 'Pokémon Black and White'],
  ['Pokémon X and Y', 'Pokémon X and Y'],
  ['Donkey Kong Country', 'Donkey Kong Country (video game)'],
  ['Donkey Kong Country 2: Diddy\'s Kong Quest'],
  ['Sonic the Hedgehog', 'Sonic the Hedgehog (1991 video game)'],
  ['Sonic Adventure 2'],
  ['Sonic Generations'],
  ['Sonic Frontiers'],
  ['Crash Bandicoot', 'Crash Bandicoot (video game)'],
  ['Crash Bandicoot 4: It\'s About Time'],
  ['Spyro the Dragon', 'Spyro the Dragon (video game)'],
  ['Final Fantasy VI'],
  ['Final Fantasy VII', 'Final Fantasy VII'],
  ['Final Fantasy VIII'],
  ['Final Fantasy IX'],
  ['Final Fantasy X'],
  ['Final Fantasy XII'],
  ['Kingdom Hearts', 'Kingdom Hearts (video game)'],
  ['Kingdom Hearts II'],
  ['Kingdom Hearts III'],
  ['Metal Gear Solid', 'Metal Gear Solid (video game)'],
  ['Metal Gear Solid 3: Snake Eater'],
  ['Metal Gear Solid V: The Phantom Pain'],
  ['Silent Hill', 'Silent Hill (video game)'],
  ['Silent Hill 2', 'Silent Hill 2'],
  ['Resident Evil', 'Resident Evil (video game)'],
  ['Resident Evil 2', 'Resident Evil 2 (1998 video game)'],
  ['Resident Evil 4', 'Resident Evil 4'],
  ['Resident Evil 3: Nemesis', 'Resident Evil 3: Nemesis'],
  ['Resident Evil Code: Veronica'],
  ['Castlevania: Symphony of the Night'],
  ['Chrono Trigger'],
  ['EarthBound'],
  ['Persona 4 Golden'],
  ['Persona 5', 'Persona 5'],
  ['Dragon Quest XI: Echoes of an Elusive Age'],
  ['Fire Emblem: Awakening'],
  ['Fire Emblem: Fates'],
  ['Golden Sun', 'Golden Sun (video game)'],
  ['Advance Wars', 'Advance Wars (video game)'],
  ['Pokémon Stadium'],
  ['GoldenEye 007', 'GoldenEye 007 (1997 video game)'],
  ['Halo: Combat Evolved'],
  ['Halo 2'],
  ['Halo 3'],
  ['Grand Theft Auto: Vice City'],
  ['Grand Theft Auto III'],
  ['Grand Theft Auto: San Andreas'],
  ['Red Dead Redemption', 'Red Dead Redemption (video game)'],
  ['The Elder Scrolls IV: Oblivion'],
  ['The Elder Scrolls III: Morrowind'],
  ['Fallout 3'],
  ['Fallout: New Vegas'],
  ['Bioshock', 'BioShock (video game)'],
  ['BioShock Infinite'],
  ['Mass Effect', 'Mass Effect (video game)'],
  ['Mass Effect 2'],
  ['Mass Effect Legendary Edition'],
  ['Dragon Age: Origins'],
  ['Dragon Age: Inquisition'],
  ['The Witcher 2: Assassins of Kings'],
  ['Deus Ex', 'Deus Ex (video game)'],
  ['System Shock 2'],
  ['Dishonored', 'Dishonored (video game)'],
  ['Dishonored 2'],
  ['Prey', 'Prey (2017 video game)'],
  ['Thief', 'Thief (2014 video game)'],
  ['Hitman', 'Hitman (2016 video game)'],
  ['Hitman 3', 'Hitman 3'],
  ['Assassin\'s Creed', "Assassin's Creed (video game)"],
  ['Assassin\'s Creed II', "Assassin's Creed II"],
  ['Assassin\'s Creed IV: Black Flag'],
  ['Assassin\'s Creed Odyssey'],
  ['Assassin\'s Creed Mirage'],
  ['Watch Dogs', 'Watch Dogs (video game)'],
  ['Far Cry 3'],
  ['Far Cry 5'],
  ['Far Cry 6'],
  ['The Division 2', 'Tom Clancy\'s The Division 2'],
  ['Rainbow Six Siege', 'Tom Clancy\'s Rainbow Six Siege'],
  ['Prince of Persia: The Sands of Time'],
  ['Splinter Cell', 'Tom Clancy\'s Splinter Cell'],
  ['Batman: Arkham Asylum'],
  ['Batman: Arkham City'],
  ['Batman: Arkham Knight'],
  ['The Amazing Spider-Man 2', 'The Amazing Spider-Man 2 (video game)'],
  ['Uncharted 4: A Thief\'s End'],
  ['Uncharted: The Nathan Drake Collection'],
  ['The Last Guardian'],
  ['Shadow of the Colossus', 'Shadow of the Colossus'],
  ['Ico', 'Ico (video game)'],
  ['Journey', 'Journey (2012 video game)'],
  ['Flower', 'Flower (video game)'],
  ['Bloodborne'],
  ['Dark Souls II'],
  ['Dark Souls III'],
  ['Nioh', 'Nioh (video game)'],
  ['Code Vein'],
  ['Scarlet Nexus'],
  ['Tales of Arise'],
  ['Persona 4', 'Persona 4'],
  ['Persona 3 FES', 'Persona 3 FES'],
  ['Shin Megami Tensei V'],
  ['Octopath Traveler'],
  ['Octopath Traveler II'],
  ['Triangle Strategy'],
  ['Bravely Default'],
  ['Project Zomboid'],
  ['The Long Dark'],

  // ── SPORTS / RACING ──────────────────────────────────────────────────────
  ['Madden NFL 25', 'Madden NFL 25'],
  ['UFC 5', 'UFC 5 (video game)'],
  ['Tony Hawk\'s Pro Skater 1 + 2', "Tony Hawk's Pro Skater 1 + 2"],
  ['WWE 2K24'],
  ['F1 24'],
  ['F1 23'],
  ['MLB The Show 24'],
  ['eFootball 2024'],
  ['PES 2021', 'eFootball PES 2021'],
  ['NBA Live 19'],
  ['NHL 25'],

  // ── BATTLE ROYALE / SHOOTER ──────────────────────────────────────────────
  ['Warzone 2.0', 'Call of Duty: Warzone 2.0'],
  ['Call of Duty: Modern Warfare II', 'Call of Duty: Modern Warfare II (2022 video game)'],
  ['Call of Duty: Modern Warfare III', 'Call of Duty: Modern Warfare III (2023 video game)'],
  ['Call of Duty: Black Ops 6'],
  ['Battlefield 2042'],
  ['Battlefield 1', 'Battlefield 1 (video game)'],
  ['Battlefield V'],
  ['Titanfall 2'],
  ['Destiny 2'],
  ['The Division', 'Tom Clancy\'s The Division'],
  ['Borderlands 3'],
  ['Tiny Tina\'s Wonderlands'],
  ['Outriders', 'Outriders (video game)'],
  ['Remnant: From the Ashes'],
  ['Remnant II'],
  ['Tribes of Midgard'],
  ['Torchlight II'],
  ['Path of Exile 2'],

  // ── INDIE GEMS ────────────────────────────────────────────────────────────
  ['Shovel Knight: Treasure Trove'],
  ['Ori and the Blind Forest: Definitive Edition'],
  ['Hollow Knight: Silksong'],
  ['Dead Cells', 'Dead Cells (video game)'],
  ['Salt and Sanctuary'],
  ['Blasphemous', 'Blasphemous (video game)'],
  ['Axiom Verge'],
  ['Chasm', 'Chasm (video game)'],
  ['Skul: The Hero Slayer'],
  ['Rogue Legacy 2'],
  ['Spelunky 2'],
  ['Neon Abyss'],
  ['Risk of Rain 2'],
  ['Returnal', 'Returnal (video game)'],
  ['Sifu', 'Sifu (video game)'],
  ['Loop Hero'],
  ['Luck be a Landlord'],
  ['Peglin'],
  ['Cobalt Core'],
  ['Backpack Battles'],
  ['Dorfromantik'],
  ['Townscaper'],
  ['Unpacking', 'Unpacking (video game)'],
  ['Stray', 'Stray (video game)'],
  ['Venba'],
  ['Dave the Diver'],
  ['Sea of Stars', 'Sea of Stars (video game)'],
  ['Cocoon', 'Cocoon (video game)'],
  ['Tunic', 'Tunic (video game)'],
  ['Nier: Automata', 'Nier: Automata'],
  ['Nier Replicant'],

  // ── MMO / ONLINE ─────────────────────────────────────────────────────────
  ['Final Fantasy XIV'],
  ['Elder Scrolls Online'],
  ['Guild Wars 2'],
  ['Black Desert Online'],
  ['Lost Ark'],
  ['New World', 'New World (video game)'],
  ['Star Wars: The Old Republic'],
  ['Runescape'],
  ['Old School RuneScape'],
  ['MapleStory'],
  ['Phantasy Star Online 2'],
  ['Blade & Soul'],
  ['TERA Online'],
  ['Aion', 'Aion (video game)'],

  // ── MINECRAFT-ADJACENT / SANDBOX ────────────────────────────────────────
  ['Terraria', 'Terraria'],
  ['Core Keeper'],
  ['Starbound', 'Starbound (video game)'],
  ['Vintage Story'],
  ['7 Days to Die'],
  ['The Forest', 'The Forest (video game)'],
  ['Sons of the Forest'],
  ['Green Hell'],
  ['The Survivalists'],
  ['Raft', 'Raft (video game)'],
  ['Stranded Deep'],
  ['Subnautica'],

  // ── RHYTHM / MUSIC GAMES ─────────────────────────────────────────────────
  ['Guitar Hero', 'Guitar Hero (video game)'],
  ['Rock Band', 'Rock Band (video game)'],
  ['Just Dance', 'Just Dance (video game)'],
  ['Beat Saber'],
  ['osu!'],
  ['Geometry Dash'],
  ['Friday Night Funkin\''],
  ['Taiko no Tatsujin', 'Taiko no Tatsujin'],
  ['Project DIVA', 'Hatsune Miku: Project DIVA'],
  ['DJMAX Respect V'],
  ['Patapon', 'Patapon (video game)'],
  ['Crypt of the NecroDancer'],

  // ── HORROR ───────────────────────────────────────────────────────────────
  ['Amnesia: The Dark Descent'],
  ['Outlast', 'Outlast (video game)'],
  ['Outlast 2'],
  ['SOMA', 'SOMA (video game)'],
  ['Little Nightmares', 'Little Nightmares (video game)'],
  ['Little Nightmares II'],
  ['Visage', 'Visage (video game)'],
  ['Layers of Fear', 'Layers of Fear (2023 video game)'],
  ['Phasmophobia'],
  ['The Quarry', 'The Quarry (video game)'],
  ['Until Dawn', 'Until Dawn (video game)'],
  ['Man of Medan'],
  ['Five Nights at Freddy\'s'],

  // ── STRATEGY / TOWER DEFENSE ─────────────────────────────────────────────
  ['Plants vs. Zombies'],
  ['Bloons TD 6'],
  ['Kingdom Rush'],
  ['They Are Billions'],
  ['Age of Empires II'],
  ['Age of Empires III'],
  ['StarCraft', 'StarCraft (video game)'],
  ['WarCraft III: Reign of Chaos'],
  ['Command & Conquer', 'Command & Conquer (video game)'],
  ['Sid Meier\'s Civilization V', 'Civilization V'],
  ['Civilization IV', 'Civilization IV'],
  ['XCOM: Enemy Unknown'],
  ['Phantom Doctrine'],
  ['Othercide'],
  ['Wildermyth'],
  ['Griftlands'],

  // ── RACING ───────────────────────────────────────────────────────────────
  ['Need for Speed: Most Wanted', 'Need for Speed: Most Wanted (2005 video game)'],
  ['Need for Speed: Heat'],
  ['Burnout Paradise'],
  ['Burnout 3: Takedown'],
  ['Ridge Racer', 'Ridge Racer (video game)'],
  ['WipEout', 'Wipeout (series)'],
  ['F-Zero', 'F-Zero (video game)'],
  ['Mario Kart: Double Dash!!'],
  ['Mario Kart Wii'],
  ['Crash Team Racing', 'Crash Team Racing (video game)'],
  ['CTR: Crash Team Racing Nitro-Fueled'],
  ['Sonic & Sega All-Stars Racing'],

  // ── ADVENTURE / NARRATIVE ────────────────────────────────────────────────
  ['Red Dead Redemption 2'],
  ['A Plague Tale: Innocence'],
  ['A Plague Tale: Requiem'],
  ['Detroit: Become Human'],
  ['Heavy Rain', 'Heavy Rain (video game)'],
  ['Beyond: Two Souls'],
  ['Quantic Dream'],
  ['Life is Strange', 'Life is Strange (video game)'],
  ['Life is Strange: True Colors'],
  ['Tell Me Why', 'Tell Me Why (video game)'],
  ['Oxenfree', 'Oxenfree (video game)'],
  ['Tacoma', 'Tacoma (video game)'],
  ['Firewatch', 'Firewatch (video game)'],
  ['What Remains of Edith Finch'],
  ['Gone Home', 'Gone Home (video game)'],
  ['Gris', 'Gris (video game)'],
  ['Inside', 'Inside (video game)'],
  ['Limbo', 'Limbo (video game)'],
  ['The Stanley Parable'],
  ['Observation', 'Observation (video game)'],
  ['Return of the Obra Dinn'],
  ['Obra Dinn'],
  ['Heaven\'s Vault'],
  ['Disco Elysium'],
  ['Pentiment'],
  ['Norco', 'Norco (video game)'],
  ['The Case of the Golden Idol'],
  ['Paradise Killer'],
]

const REVIEWS = {
  positive: [
    'Spent 300 hours in this. Worth every second.',
    'Finished it in a week. Immediately started again.',
    'Genuinely one of the best games ever made.',
    'The world-building is unmatched.',
    'Addictive in the best possible way.',
    'The story made me emotional. In a game. Wild.',
    'Peak gaming. Nothing comes close.',
    "Couldn't put the controller down.",
    'My childhood in a game. Pure nostalgia.',
    'The mechanics alone make it worth it.',
    'Everyone should play this at least once.',
    'Hard carry by the art direction.',
    'The multiplayer alone justifies the price.',
    'This defined my entire generation.',
    'Soundtrack alone is a masterpiece.',
    'More replayable than anything else I own.',
  ],
  neutral: [
    'Broken at launch. Still played 200 hours.',
    'Single-player goat. Multiplayer mid.',
  ],
  negative: [
    "Overrated by the community. It's fine.",
    'Fell off after the first few hours sadly.',
  ],
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickReview(score) {
  const pool = score >= 7 ? REVIEWS.positive : score <= 4 ? REVIEWS.negative : REVIEWS.neutral
  const arr = [...pool, null]
  return arr[Math.floor(Math.random() * arr.length)]
}
function randScore() {
  const weights = [1, 1, 2, 3, 4, 5, 6, 5, 3, 1]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i + 1 }
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
  console.log(`Using ${botIds.length} bots — ${GAMES.length} games to seed\n`)

  // Deduplicate the list by displayTitle
  const seen = new Set()
  const uniqueGames = GAMES.filter(([title]) => {
    if (seen.has(title)) return false
    seen.add(title)
    return true
  })

  let inserted = 0
  let skipped = 0

  for (const [displayTitle, wikiTitle] of uniqueGames) {
    const { count } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('title', displayTitle)
      .eq('category', 'game')

    if (count && count > 0) {
      process.stdout.write(`  ↩ ${displayTitle}\n`)
      skipped++
      continue
    }

    const imageUrl = await getWikiImage(wikiTitle ?? displayTitle)
    await sleep(100)

    const raters = shuffle(botIds).slice(0, 4 + Math.floor(Math.random() * 6))
    const rows = raters.map(userId => {
      const score = randScore()
      return { user_id: userId, title: displayTitle, category: 'game', score, review: pickReview(score), image_url: imageUrl }
    })

    const { error } = await supabase.from('ratings').insert(rows)
    if (error) {
      process.stdout.write(`  ✗ ${displayTitle}: ${error.message}\n`)
    } else {
      inserted += rows.length
      process.stdout.write(`  ✓ ${displayTitle} — ${rows.length} ratings${imageUrl ? ' 🖼' : ''}\n`)
    }
  }

  console.log(`\n✓ Done! ${inserted} ratings inserted (${skipped} already existed).`)
}

run()
