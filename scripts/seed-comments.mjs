import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=')).map(l => {
      const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const s = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false }
})

const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const maybe = (arr, chance = 0.5) => Math.random() < chance ? pick(arr) : ''

// Template engine: fill {slot} with random picks
function t(template, slots) {
  return template.replace(/\{(\w+)\}/g, (_, k) => pick(slots[k] || ['']))
}

// ── Shared building blocks ──────────────────────────────────────────────────
const REACTIONS   = ['ngl','tbh','fr','no cap','imo','genuinely','actually','lowkey','literally','objectively','respectfully','for real','unironically','deadass','honestly']
const CLOSERS     = ['fight me.','i said what i said.','not up for debate.','and i stand by it.','periodt.','do your research.','stay mad.','cope.','idc idc.','you\'re welcome.','block me if you want.','the data doesn\'t lie.','moving on.','that\'s it, that\'s the tweet.','goodbye.']
const OPENERS     = ['The fact that','The way','I genuinely cannot believe','It blows my mind that','It\'s crazy to me that','Let\'s be honest,','Be so for real,','I\'m sorry but','Hot take:','Unpopular opinion:','Controversial but:','I\'ll say it,','Nobody asked but','Real talk,','Bro']
const TASTE       = ['no taste','terrible taste','immaculate taste','genuinely good taste','questionable taste','elite taste','mid taste','zero taste','the best taste','awful taste']
const EMPHASIS    = ['genuinely','absolutely','completely','entirely','truly','deeply','thoroughly','seriously','legitimately','painfully']

// ── Category-specific templates ─────────────────────────────────────────────
const TEMPLATES = {
  movie: [
    () => t('{opener} people are rating this {score} is {reaction} insane to me. {closer}', { opener: OPENERS, score: ['a 6','a 7','a 4','a 10','a 3','a 9','below an 8','above a 5'], reaction: ['absolutely','genuinely','literally','completely'], closer: CLOSERS }),
    () => t('The {part} alone deserved {rating}. Your score is {emphasis} disrespectful. {closer}', { part: ['soundtrack','cinematography','script','acting','ending','opening scene','third act','director\'s vision','score','costume design'], rating: ['a 10','top marks','an Oscar','a standing ovation'], emphasis: EMPHASIS, closer: CLOSERS }),
    () => t('{reaction} one of the {quality} films I\'ve {verb} in {time}. {closer}', { reaction: ['Genuinely','Honestly','This is','Easily'], quality: ['worst','best','most overrated','most underrated','most boring','most brilliant','most confusing','most predictable'], verb: ['ever watched','seen in years','sat through','experienced'], time: ['years','a long time','my entire life','recent memory','decades'], closer: CLOSERS }),
    () => t('People who give this {dir} a {num} have {taste}. {reaction} {closer}', { dir: ['above','below','more than','less than'], num: ['7','8','6','5','9','4'], taste: TASTE, reaction: REACTIONS, closer: CLOSERS }),
    () => t('The {element} was {quality} and anyone who disagrees is {denial}. {closer}', { element: ['plot','twist','dialogue','chemistry between the leads','pacing','world-building','character arc'], quality: ['flawless','embarrassing','incredibly weak','honestly breathtaking','painfully predictable','surprisingly deep','completely wasted'], denial: ['lying to themselves','in denial','simply wrong','not watching carefully enough','on something'], closer: CLOSERS }),
    () => t('I {verb} {time} after the {part}. {reaction} decision I\'ve made. {closer}', { verb: ['walked out','turned it off','fell asleep','checked my phone'], time: ['20 minutes','immediately','halfway through','10 minutes'], part: ['opening','first act','trailer','first 5 minutes'], reaction: ['Best','Worst','Most rational','Smartest'], closer: CLOSERS }),
    () => `My ${pick(['dog','cat','roommate','little sibling','grandma','uber driver'])} could ${pick(['write a better script','direct better','do better casting','come up with a better plot'])}. ${pick(CLOSERS)}`,
    () => `This ${pick(['changed my life','broke my brain','made me question everything','genuinely upset me','left me speechless','gave me trust issues'])}. Rate accordingly. ${pick(CLOSERS)}`,
  ],
  tv: [
    () => t('{opener} they {action} this character in season {num} is {emphasis} unforgivable. {closer}', { opener: OPENERS, action: ['killed off','ruined','sidelined','completely changed','wrote out','assassinated'], num: ['2','3','4','5','1','the finale'], emphasis: EMPHASIS, closer: CLOSERS }),
    () => t('Season {good} was peak television. Everything after was {quality}. {closer}', { good: ['1','2','3','one','two'], quality: ['a slow decline','unwatchable','a different show','genuinely painful','filler','a cash grab'], closer: CLOSERS }),
    () => t('The {part} writing in this show is {quality} and I will {action}. {closer}', { part: ['character','dialogue','plot','romance','villain'], quality: ['some of the best I\'ve ever seen','criminally underrated','genuinely terrible','elite','deeply mediocre'], action: ['die on this hill','not be taking criticism','stand by this forever','not elaborate further'], closer: CLOSERS }),
    () => `This show ${pick(['has no right being this good','is actually unwatchable','ruined every other show for me','set the bar too high','lowered the bar significantly','broke me emotionally'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('The fact this {status} while {comparison} {action} is proof that {conclusion}. {closer}', { status: ['got cancelled','got renewed','won awards','got ignored'], comparison: ['actual garbage','mediocre content','worse shows'], action: ['stay on air','win Emmys','get multiple seasons','keep getting funded'], conclusion: ['the industry is cooked','nobody knows what good TV is','the algorithm is broken','audiences have no taste'], closer: CLOSERS }),
    () => `${pick(['Watched the finale and','Binged the whole thing and','Got to the last episode and'])} ${pick(['I need a moment','I\'m not okay','I have never recovered','I immediately started over','I felt personally attacked'])}. ${pick(CLOSERS)}`,
    () => t('The {character} arc in this show is the {quality} thing I\'ve seen on television. {closer}', { character: ['main character\'s','villain\'s','side character\'s','love interest\'s','mentor\'s'], quality: ['best written','most wasted','most frustrating','most satisfying','most predictable','most surprising'], closer: CLOSERS }),
  ],
  sport: [
    () => t('Calling {them} a GOAT while {better} exists is {emphasis} disrespectful to the sport. {closer}', { them: ['this person','this athlete','this player','someone with this record'], better: ['literally anyone else','the real GOAT','actual legends','the greats'], emphasis: EMPHASIS, closer: CLOSERS }),
    () => t('The {stat} alone proves this rating is {quality}. Do {action}. {closer}', { stat: ['stats','record','performance data','numbers','track record','win rate'], quality: ['embarrassingly off','completely wrong','actually correct','controversial but accurate','simply unacceptable'], action: ['better','your research','the math','some reading','the homework'], closer: CLOSERS }),
    () => `${pick(['Completely','Entirely','100%'])} carried by ${pick(['their team','the system','favorable matchups','weak competition','the era','pure luck'])}. Take away the support and ${pick(['watch the rating drop','they\'re average','it all falls apart','the numbers change dramatically'])}. ${pick(CLOSERS)}`,
    () => t('{opener} people {action} this performance without acknowledging {issue} is {reaction} wild. {closer}', { opener: OPENERS, action: ['praise','rate highly','celebrate','defend'], issue: ['the context','the era','the competition level','the team around them','the circumstances'], reaction: REACTIONS, closer: CLOSERS }),
    () => `${pick(['Peak','This was peak','Generational','Absolute peak'])} ${pick(['performance','athleticism','dominance','talent on display'])}. The rating should be ${pick(['higher','a 10','untouchable','automatic'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('I\'ve seen {better} at my {place} than this. {closer}', { better: ['better performance','more effort','more talent','higher quality'], place: ['local park','high school','neighborhood pickup game','gym class'], closer: CLOSERS }),
    () => `The ${pick(['media','hype','narrative','mainstream take'])} around this ${pick(['is manufactured','is overblown','is completely accurate','is genuinely deserved','misses the point entirely'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
  ],
  music: [
    () => t('This album has {num} skips and {reaction} that\'s too many. {closer}', { num: ['zero','no','maybe one','at least three','too many','honestly no'], reaction: REACTIONS, closer: CLOSERS }),
    () => t('The {element} on this {dir} {action} the whole thing. {closer}', { element: ['production','mixing','lyricism','features','chorus','bridge','outro','intro','hook'], dir: ['single-handedly','completely','absolutely','entirely'], action: ['saves','ruins','elevates','destroys','carries','drags down'], closer: CLOSERS }),
    () => `${pick(['Only','People who','Anyone who','Those who'])} ${pick(['never listened to real music','have no ear for music','discovered music last year','only listen to mainstream stuff'])} would ${pick(['rate this low','rate this high','give this anything under a 9','miss the point of this album'])}. ${pick(CLOSERS)}`,
    () => t('This {title} {action} my {part} and I {feeling} forgive it. {closer}', { title: ['album','project','body of work','tape','EP'], action: ['fixed','broke','changed','destroyed','rebuilt','healed'], part: ['taste','brain','standards','life','entire personality'], feeling: ['will never','cannot','refuse to','genuinely'], closer: CLOSERS }),
    () => `The ${pick(['fact that','way that','audacity of'])} people sleep on this ${pick(['is criminal','is unforgivable','proves they have bad taste','is actually mind-blowing','makes me lose faith in humanity'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('Album of the {time} and it isn\'t even {close}. {closer}', { time: ['year','decade','century','era','generation'], close: ['close','debatable','a question','up for discussion','contested'], closer: CLOSERS }),
    () => `${pick(['I','My ears','My soul'])} ${pick(['physically cannot','refuse to','will not','am unable to'])} ${pick(['listen to this sober','get through this','take this seriously','understand the hype'])}. ${pick(CLOSERS)}`,
  ],
  game: [
    () => t('This game has {num} hours of content and {reaction} {num2} of them are padding. {closer}', { num: ['80','100','200','60','40'], reaction: REACTIONS, num2: ['60','70','half','most','30','80'], closer: CLOSERS }),
    () => t('The {element} in this game is {quality} and the devs should {action}. {closer}', { element: ['combat','story','graphics','progression system','endgame','tutorial','difficulty scaling','loot system'], quality: ['genuinely flawless','an absolute mess','peak game design','embarrassingly bad','actually inspired','criminally overlooked'], action: ['be proud','be ashamed','issue an apology','win an award','be studied'], closer: CLOSERS }),
    () => `The ${pick(['fanbase','community','playerbase','subreddit'])} for this game ${pick(['is the most toxic thing online','has ruined it for me','is actually the most passionate','is why I play solo','lowered my faith in gaming'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('People who {action} this are {desc}. {closer}', { action: ['rate this a 10','give this below a 7','defend this game','hate on this game','sleep on this','overhype this'], desc: ['simply correct','not real gamers','the target audience unfortunately','on to something','in need of help','the problem with gaming'], closer: CLOSERS }),
    () => `${pick(['I have','Spent'])} ${pick(['400','200','1000','87','500'])} hours in this and ${pick(['it gets better every time','it gets worse every time','still not done','genuinely have no life','I regret nothing','I regret everything'])}. ${pick(CLOSERS)}`,
    () => t('{quality} at launch, {quality2} now. {conclusion}. {closer}', { quality: ['Broken','Unfinished','Rough','Messy','Actually solid'], quality2: ['still broken','somehow worse','pretty good','a masterpiece','completely different'], conclusion: ['Still a classic','Still not worth it','Glow up of the century','They patched the soul out of it','The devs cooked eventually','Should\'ve stayed in the oven longer'], closer: CLOSERS }),
    () => `${pick(['The difficulty','This game','The final boss','The DLC','The base game'])} is ${pick(['a personal attack','genuinely disrespectful','designed to humble you','the peak of the genre','an afterthought','actually the best part'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
  ],
  youtube: [
    () => t('The {element} on this video is {quality} and other creators should {action}. {closer}', { element: ['production','editing','pacing','thumbnail','title','commentary'], quality: ['genuinely insane','embarrassingly low effort','actually inspiring','mid','elite','surprisingly good'], action: ['take notes','retire','study this','be ashamed','do better'], closer: CLOSERS }),
    () => `This creator ${pick(['peaked here','is coasting on old views','genuinely just keeps improving','peaked 3 years ago','is criminally underrated','has lost the plot'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('{num} minutes of my life I {feeling}. {closer}', { num: ['20','45','10','30','15','60'], feeling: ['will never get back','am genuinely grateful for','spent productively somehow','wasted completely','didn\'t deserve'], closer: CLOSERS }),
    () => `The ${pick(['comment section','fanbase','audience'])} on this is ${pick(['more toxic than the content','actually the funniest part','why I turned off notifications','genuinely wholesome which is rare','a social experiment'])}. ${pick(CLOSERS)}`,
    () => t('The algorithm {action} this to me and I {result}. {closer}', { action: ['pushed','recommended','served','blessed me with','cursed me with','forced'], result: ['am forever changed','have not recovered','want my time back','will never be the same','am reporting it','owe it my life'], closer: CLOSERS }),
    () => `${pick(['Nobody is talking about how','It\'s actually insane that','I cannot believe','The fact that'])} this ${pick(['only has this many views','got this many views','didn\'t go more viral','is this underrated','blew up this much'])} is ${pick(['proof the algorithm is cooked','genuinely baffling','the most surprising thing','a crime','actually deserved'])}. ${pick(CLOSERS)}`,
  ],
  book: [
    () => t('Took me {num} attempts to finish this and {reaction} it {quality}. {closer}', { num: ['3','2','4','multiple'], reaction: REACTIONS, quality: ['was worth it','was not worth it','still wasn\'t worth it','changed my mind completely','confirmed my initial feelings'], closer: CLOSERS }),
    () => t('The {element} in this book is {quality}. {reaction} {closer}', { element: ['prose','pacing','character development','world-building','ending','plot twist','dialogue','themes'], quality: ['some of the best I\'ve ever read','genuinely painful to get through','actually breathtaking','disappointingly surface level','peak literary fiction','mid'], reaction: REACTIONS, closer: CLOSERS }),
    () => `${pick(['Required reading','Banned in my household','Mandatory','Should be illegal'])} for ${pick(['everyone','anyone with taste','people who think they have opinions','people who don\'t read','my enemies','the government'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('People who {action} this have {taste}. {closer}', { action: ['love','hate','rate highly','rate low','defend','dismiss'], taste: TASTE, closer: CLOSERS }),
    () => `The ending ${pick(['alone justifies the whole read','ruined everything','was the best part','came out of nowhere','was perfectly constructed','should be studied in schools'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('This book {action} my {thing} and I {feeling} it. {closer}', { action: ['changed','destroyed','rebuilt','expanded','challenged','broke','fixed'], thing: ['worldview','perspective','reading habits','standards','personality','brain'], feeling: ['will never forgive','will forever recommend','genuinely needed','didn\'t ask for','thank it for','resent'], closer: CLOSERS }),
    () => `${pick(['The hype is','The hate is','The discourse around this is'])} ${pick(['completely manufactured','100% warranted','actually insane to me','a psyop','deserved ngl','overblown'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
  ],
  food: [
    () => t('Waited {time} for this and it was {quality}. {reaction} {closer}', { time: ['45 minutes','2 hours','an hour','20 minutes','my entire evening'], quality: ['absolutely worth it','completely not worth it','mid','genuinely transcendent','an insult to the wait','somehow both'], reaction: REACTIONS, closer: CLOSERS }),
    () => t('The {dish} here is {quality} and I will {action} about it. {closer}', { dish: ['portion size','presentation','flavor','texture','service','ambiance','price-to-quality ratio','vibe'], quality: ['embarrassingly small','genuinely elite','overpriced for what it is','peak','criminally underrated','a scam'], action: ['never stop talking','tell everyone','not elaborate further','fight anyone who disagrees','be very vocal'], closer: CLOSERS }),
    () => `${pick(['Brought my whole family here','Took a date here','Came here alone','Went here for a birthday'])} and ${pick(['we don\'t speak anymore','it saved us','it broke us','it changed our relationship','I cried','the memory still haunts me'])}. ${pick(CLOSERS)}`,
    () => t('For that price I {expectation}. I got {reality}. {closer}', { expectation: ['expected a life-changing experience','expected peak cuisine','expected at least something good','expected more','expected a Michelin experience'], reality: ['a masterpiece','an insult','something mid','exactly that','something I could\'ve made at home','genuinely surprised'], closer: CLOSERS }),
    () => `The ${pick(['ambiance','vibe','energy','aesthetic'])} is ${pick(['unmatched','pretentious','actually beautiful','a distraction from the food','the only good part','genuinely elite'])} but the ${pick(['food','service','pricing','portions'])} is ${pick(['a different story','peak','genuinely disappointing','where it falls apart','the main event'])}. ${pick(CLOSERS)}`,
    () => `${pick(['I think about this meal','This place lives in my head','The memory of this'])} ${pick(['every single day','more than I should','constantly','at least twice a week','far too often'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
  ],
  other: [
    () => t('The {level} of {quality} here is {reaction} {dir}. {closer}', { level: ['amount','degree','sheer level','quantity','caliber'], quality: ['hype','discourse','controversy','passion','hate','love','cope','delusion'], reaction: REACTIONS, dir: ['unreal','off the charts','actually impressive','embarrassing','warranted','baffling'], closer: CLOSERS }),
    () => `${pick(['This rating is','This take is','This review is'])} ${pick(['objectively correct','criminally wrong','actually based','deeply flawed','surprisingly accurate','a hot take I respect'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
    () => t('I {agree} with this rating and I have {evidence}. {closer}', { agree: ['completely agree','completely disagree','partially agree','refuse to engage with'], evidence: ['receipts','data','years of experience','strong feelings','nothing but confidence','opinions'], closer: CLOSERS }),
    () => `${pick(['Hot take:','Unpopular opinion:','Nobody asked but:','I\'ll say it:'])} this ${pick(['deserves a 10','deserves a 1','is mid','is actually peak','is the most overrated thing','is slept on'])} and ${pick(['I\'ll die on this hill','I stand by it','that\'s final','argue with the wall','you\'re welcome'])}. ${pick(CLOSERS)}`,
    () => `The ${pick(['discourse','debate','conversation'])} around this is ${pick(['exhausting','genuinely fascinating','the funniest thing online','what\'s wrong with the internet','actually important','why I have trust issues'])}. ${pick(REACTIONS)} ${pick(CLOSERS)}`,
  ],
}

async function run() {
  const { data: ratings } = await s.from('ratings').select('id, category')
  const { data: allProfiles } = await s.from('profiles').select('id')

  if (!ratings?.length || !allProfiles?.length) {
    console.error('No ratings or profiles found.'); process.exit(1)
  }

  console.log(`Generating comments for ${ratings.length} ratings from ${allProfiles.length} profiles...`)

  // Delete existing bot comments to start fresh
  await s.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Cleared old comments.')

  const rows = []
  const usedPerRating = {} // track used comments per rating to avoid duplicates

  for (const profile of allProfiles) {
    const count = 2 + Math.floor(Math.random() * 4)
    const targets = [...ratings].sort(() => Math.random() - 0.5).slice(0, count)

    for (const r of targets) {
      if (!usedPerRating[r.id]) usedPerRating[r.id] = new Set()

      const pool = TEMPLATES[r.category] || TEMPLATES.other
      let comment = ''
      let attempts = 0

      // Keep generating until we get a unique one for this rating
      do {
        comment = pick(pool)()
        attempts++
      } while (usedPerRating[r.id].has(comment) && attempts < 20)

      usedPerRating[r.id].add(comment)
      rows.push({ rating_id: r.id, user_id: profile.id, content: comment })
    }
  }

  // Batch insert
  let total = 0
  const CHUNK = 100
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await s.from('comments').insert(rows.slice(i, i + CHUNK))
    if (!error) total += Math.min(CHUNK, rows.length - i)
    process.stdout.write(`\r  ${total}/${rows.length} inserted...`)
  }

  console.log(`\n✓ Done! ${total} unique comments across ${ratings.length} ratings.`)
}

run()
