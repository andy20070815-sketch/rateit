// Fixes miscategorized ratings in the DB.
// Run with: node scripts/fix-categories.mjs

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

// Known correct categories for specific titles
const CORRECT_CATEGORIES = {
  // Musicians that often end up as 'youtube' or 'movie'
  music: [
    'Drake', 'Taylor Swift', 'Kendrick Lamar', 'Bad Bunny', 'The Weeknd',
    'Beyoncé', 'Tyler the Creator', 'Billie Eilish', 'Harry Styles', 'SZA',
    'Olivia Rodrigo', 'Travis Scott', 'Post Malone', 'Doja Cat', 'J. Cole',
    'Lil Baby', 'Lil Baby Official', 'Lil Uzi Vert', 'NBA YoungBoy',
    'Juice WRLD', 'Pop Smoke', 'Rod Wave', 'Polo G', 'Future', 'Gunna', 'Young Thug',
    'Playboi Carti', 'A$AP Rocky', 'Frank Ocean', 'Childish Gambino',
    'Kanye West', 'Jay-Z', 'Eminem', 'Nicki Minaj', 'Cardi B',
    'Ariana Grande', 'Dua Lipa', 'The Kid LAROI', 'Jack Harlow',
    'Morgan Wallen', 'Luke Combs', 'Zach Bryan',
    'Arctic Monkeys', 'Radiohead', 'Coldplay', 'Ed Sheeran', 'Adele',
    'Sabrina Carpenter', 'Chappell Roan', 'Gracie Abrams',
  ],
  sport: [
    'Lionel Messi', 'Cristiano Ronaldo', 'LeBron James', 'Michael Jordan',
    'Serena Williams', 'Usain Bolt', 'Tom Brady', 'Simone Biles',
    'Roger Federer', 'Novak Djokovic', 'Tiger Woods', 'Kobe Bryant',
    'Stephen Curry', 'Neymar Jr', 'Erling Haaland', 'Patrick Mahomes',
    'Naomi Osaka', 'Lewis Hamilton', 'Rafael Nadal', 'Virat Kohli',
    'Giannis Antetokounmpo', 'Kevin Durant', 'Luka Doncic',
  ],
  youtube: [
    'MrBeast', 'PewDiePie', 'Markiplier', 'Jacksepticeye', 'Logan Paul', 'KSI',
    'Dude Perfect', 'Vsauce', 'Veritasium', 'Kurzgesagt', 'MKBHD',
    'Linus Tech Tips', 'David Dobrik', 'Emma Chamberlain', 'Dream',
    'Pokimane', 'Ninja', 'Valkyrae', 'IShowSpeed', 'Kai Cenat',
    '多米多羅Domidolo', 'Mark Rober', 'MrBeast Gaming',
  ],
}

async function run() {
  let totalFixed = 0

  for (const [correctCategory, titles] of Object.entries(CORRECT_CATEGORIES)) {
    for (const title of titles) {
      // Find ratings for this title that are in the wrong category
      const { data: wrong } = await supabase
        .from('ratings')
        .select('id, category')
        .ilike('title', title)
        .neq('category', correctCategory)

      if (!wrong?.length) continue

      const ids = wrong.map(r => r.id)
      const { error } = await supabase
        .from('ratings')
        .update({ category: correctCategory })
        .in('id', ids)

      if (error) {
        console.log(`  ✗ ${title}: ${error.message}`)
      } else {
        console.log(`  ✓ Fixed ${ids.length} rating(s) for "${title}" → ${correctCategory}`)
        totalFixed += ids.length
      }
    }
  }

  // Also fix anything with "Official" in the title that's categorized as movie
  // (likely YouTube channels rated via the external search default)
  const { data: officialWrong } = await supabase
    .from('ratings')
    .select('id, title')
    .ilike('title', '%Official%')
    .eq('category', 'movie')

  if (officialWrong?.length) {
    const ids = officialWrong.map(r => r.id)
    const { error } = await supabase.from('ratings').update({ category: 'youtube' }).in('id', ids)
    if (!error) {
      console.log(`\n  ✓ Fixed ${ids.length} "* Official" channel(s) from movie → youtube`)
      totalFixed += ids.length
    }
  }

  console.log(`\nDone. ${totalFixed} ratings fixed.`)
}

run()
