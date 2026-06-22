import Link from 'next/link'
import { Star, ChevronLeft, ChevronRight, Search, Shield, Globe, Gamepad2, Film, Music, Trophy, Tv, Utensils, BookOpen, PlayCircle, MoreHorizontal } from 'lucide-react'

// ── Shared score color ──────────────────────────────────────────────────────
function sc(s: number) {
  return s >= 8 ? 'text-green-500' : s >= 5 ? 'text-yellow-500' : 'text-red-500'
}

// ── App Icon ────────────────────────────────────────────────────────────────
function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <div
      className="rounded-[22%] bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shrink-0"
      style={{ width: size, height: size }}
    >
      <Star size={size * 0.45} className="text-white fill-white" strokeWidth={1.5} />
    </div>
  )
}

// ── Star rating display ─────────────────────────────────────────────────────
function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.floor(rating) ? '#f59e0b' : i - 0.5 <= rating ? 'url(#half)' : '#d1d5db'}>
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="none" />
        </svg>
      ))}
    </div>
  )
}

// ── Screenshot phone frame ──────────────────────────────────────────────────
function Screenshot({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: 180, height: 388 }}>
      <div className="w-full h-full rounded-[32px] border-[5px] border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl relative">
        <div className="absolute inset-0 bg-white overflow-hidden flex flex-col">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-[18px] rounded-full bg-zinc-900 z-20" />
          <div className="h-7 shrink-0" />
          <div className="flex-1 overflow-hidden">{children}</div>
          <div className="h-4 flex items-end justify-center pb-1 shrink-0">
            <div className="w-16 h-0.5 rounded-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Screenshot screens ──────────────────────────────────────────────────────
function FeedShot() {
  const items = [
    { user: 'kai_w',    cat: 'Game',  icon: Gamepad2, title: 'Elden Ring',            score: 9,  color: 'text-green-500', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Elden_Ring_Box_art.jpg/220px-Elden_Ring_Box_art.jpg' },
    { user: 'miarose',  cat: 'Music', icon: Music,    title: 'Doja Cat',               score: 8,  color: 'text-green-500', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Doja_Cat_-_Planet_Her.png/220px-Doja_Cat_-_Planet_Her.png' },
    { user: 'luka_99',  cat: 'Film',  icon: Film,     title: 'Oppenheimer',             score: 10, color: 'text-green-500', img: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg' },
  ]
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100">
        <span className="font-black text-xs tracking-tight">rateit</span>
        <div className="flex gap-1">
          {['All','Movie','Game','Music'].map((c,i) => (
            <span key={c} className={`px-1.5 py-0.5 rounded-full text-[7px] font-semibold ${i===0?'bg-black text-white':'bg-zinc-100 text-zinc-500'}`}>{c}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2 py-1.5 space-y-1.5">
        {items.map(item => (
          <div key={item.title} className="bg-white rounded-lg border border-zinc-100 overflow-hidden">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-[6px] font-black">{item.user[0].toUpperCase()}</div>
              <span className="text-[7px] font-semibold text-zinc-700">{item.user}</span>
            </div>
            <img src={item.img} alt={item.title} className="w-full h-14 object-cover" loading="lazy" />
            <div className="flex items-center justify-between px-2 py-1">
              <div>
                <div className="flex items-center gap-0.5"><item.icon size={7} className="text-zinc-400"/><span className="text-[6px] text-zinc-400">{item.cat}</span></div>
                <p className="text-[8px] font-bold leading-tight">{item.title}</p>
              </div>
              <span className={`text-sm font-black ${item.color}`}>{item.score}<span className="text-[6px] font-normal text-zinc-300">/10</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileShot() {
  const cats = [Gamepad2, Film, Music, Trophy, Tv, Utensils, BookOpen, PlayCircle, MoreHorizontal]
  const scores = [9, 10, 8, 7, 9, 8, 6, 10, 7]
  const imgs = [
    'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Elden_Ring_Box_art.jpg/220px-Elden_Ring_Box_art.jpg',
    'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
    null, null,
    'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Doja_Cat_-_Planet_Her.png/220px-Doja_Cat_-_Planet_Her.png',
    null, null, null, null,
  ]
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-center px-3 py-1.5 border-b border-zinc-100">
        <span className="font-black text-[10px]">andy</span>
      </div>
      <div className="px-2 py-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0">A</div>
          <div className="flex justify-around flex-1">
            {[{v:42,l:'Ratings'},{v:18,l:'Followers'},{v:5,l:'Following'}].map(s=>(
              <div key={s.l} className="text-center"><p className="font-black text-xs">{s.v}</p><p className="text-[7px] text-zinc-400">{s.l}</p></div>
            ))}
          </div>
        </div>
        <p className="text-[8px] font-bold">Andy Chen</p>
        <div className="w-full py-1 border border-zinc-200 rounded-lg text-center text-[7px] font-semibold text-zinc-600">Edit profile</div>
      </div>
      <div className="h-px bg-zinc-100" />
      <div className="grid grid-cols-3 gap-px flex-1 overflow-hidden">
        {scores.map((score, i) => (
          <div key={i} className="relative bg-zinc-100">
            {imgs[i] ? (
              <img src={imgs[i]!} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {(() => { const Icon = cats[i]; return <Icon size={10} className="text-zinc-300" /> })()}
              </div>
            )}
            <div className="absolute bottom-0.5 right-0.5 bg-black/60 rounded px-0.5">
              <span className={`text-[6px] font-black ${sc(score)}`}>{score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentShot() {
  const bars = [{s:10,w:75},{s:9,w:55},{s:8,w:25},{s:7,w:12},{s:6,w:8}]
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="relative h-28 bg-zinc-800 shrink-0">
        <img src="https://upload.wikimedia.org/wikipedia/en/2/2e/The_Legend_of_Zelda_Breath_of_the_Wild.jpg" alt="Zelda" className="w-full h-full object-cover opacity-80" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center gap-0.5 mb-0.5"><Gamepad2 size={7} className="text-white/70"/><span className="text-[6px] text-white/70">Game</span></div>
          <p className="text-white font-black text-[11px] leading-tight">Zelda: BotW</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2 py-2 space-y-2">
        <div className="bg-white rounded-lg border border-zinc-100 p-2">
          <p className="text-[6px] text-zinc-400 uppercase tracking-wide mb-1">Community Score</p>
          <div className="flex items-end justify-between mb-1.5">
            <div><span className="text-2xl font-black text-green-500">9.4</span><span className="text-[7px] text-zinc-400">/10</span><p className="text-[6px] text-zinc-400">2,841 ratings</p></div>
            <div className="px-2 py-1 bg-black rounded-lg text-white text-[7px] font-semibold">Rate</div>
          </div>
          <div className="space-y-0.5">
            {bars.map(b=>(
              <div key={b.s} className="flex items-center gap-1">
                <span className="text-[6px] text-zinc-400 w-2.5 text-right">{b.s}</span>
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{width:`${b.w}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[8px] font-bold">Reviews</p>
        {[{u:'luka_99',s:10,t:'300 hours. Worth every second.'},{u:'sara_m',s:9,t:'World-building is unmatched.'}].map(r=>(
          <div key={r.u} className="bg-white rounded-lg border border-zinc-100 p-1.5">
            <div className="flex justify-between mb-0.5">
              <span className="text-[7px] font-semibold">{r.u}</span>
              <span className={`text-[9px] font-black ${sc(r.s)}`}>{r.s}<span className="text-[6px] font-normal text-zinc-300">/10</span></span>
            </div>
            <p className="text-[6px] text-zinc-500 leading-tight">{r.t}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchShot() {
  const results = [
    { title: 'Elden Ring',    cat: 'Game',  icon: Gamepad2, avg: 9.2, count: 1247 },
    { title: 'Doja Cat',      cat: 'Music', icon: Music,    avg: 8.5, count: 834  },
    { title: 'Oppenheimer',   cat: 'Movie', icon: Film,     avg: 9.0, count: 2103 },
    { title: 'Jiro Dreams',   cat: 'Food',  icon: Utensils, avg: 7.8, count: 421  },
  ]
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-2 py-2 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 bg-zinc-100 rounded-xl px-2 py-1.5">
          <Search size={9} className="text-zinc-400" />
          <span className="text-[8px] text-zinc-400">Search anything…</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2 py-1.5 space-y-1">
        {results.map(r => (
          <div key={r.title} className="flex items-center gap-2 bg-white rounded-lg border border-zinc-100 p-1.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              <r.icon size={12} className="text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-semibold truncate">{r.title}</p>
              <p className="text-[6px] text-zinc-400">{r.cat} · {r.count} ratings</p>
            </div>
            <span className={`text-[10px] font-black shrink-0 ${sc(r.avg)}`}>{r.avg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RateShot() {
  const cats = [
    { icon: Film, label: 'Movie' }, { icon: Tv, label: 'TV' }, { icon: Trophy, label: 'Sport' },
    { icon: PlayCircle, label: 'YouTube' }, { icon: Music, label: 'Music' }, { icon: BookOpen, label: 'Book' },
    { icon: Gamepad2, label: 'Game', active: true }, { icon: Utensils, label: 'Food' }, { icon: MoreHorizontal, label: 'Other' },
  ]
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100">
        <span className="font-black text-[10px]">New Rating</span>
        <span className="text-[8px] text-zinc-400">Cancel</span>
      </div>
      <div className="flex-1 overflow-hidden px-2 py-2 space-y-3">
        <div>
          <p className="text-[7px] font-semibold text-zinc-600 mb-1">What are you rating?</p>
          <div className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[8px] text-zinc-500">Elden Ring</div>
        </div>
        <div>
          <p className="text-[7px] font-semibold text-zinc-600 mb-1">Category</p>
          <div className="grid grid-cols-3 gap-1">
            {cats.map(c => (
              <div key={c.label} className={`flex items-center justify-center gap-0.5 py-1 rounded-lg border text-[6px] font-semibold ${(c as any).active ? 'bg-black border-black text-white' : 'border-zinc-200 text-zinc-500'}`}>
                <c.icon size={7} />{c.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1 mb-1">
            <p className="text-[7px] font-semibold text-zinc-600">Score:</p>
            <span className="text-xl font-black text-black leading-none">9</span>
            <span className="text-[7px] text-zinc-400">/10</span>
          </div>
          <div className="relative w-full h-1.5 bg-zinc-200 rounded-full">
            <div className="absolute left-0 top-0 h-full bg-black rounded-full" style={{width:'87%'}} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full border-2 border-white shadow" style={{left:'calc(87% - 6px)'}} />
          </div>
        </div>
        <div>
          <p className="text-[7px] font-semibold text-zinc-600 mb-1">Review <span className="font-normal text-zinc-400">(optional)</span></p>
          <div className="w-full h-10 px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[7px] text-zinc-400">Best game ever played...</div>
        </div>
        <div className="w-full py-2 bg-black rounded-xl text-white text-[9px] font-bold text-center">Post Rating</div>
      </div>
    </div>
  )
}

// ── Review card ─────────────────────────────────────────────────────────────
function ReviewCard({ name, username, date, stars, text }: { name: string; username: string; date: string; stars: number; text: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <Stars rating={stars} size={13} />
          <p className="font-semibold text-sm mt-0.5">{name.split(' ')[0]}</p>
        </div>
        <span className="text-zinc-400 text-xs">{date}</span>
      </div>
      <p className="text-sm text-zinc-700 leading-relaxed">{text}</p>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AppStorePage() {
  const screenshots = [
    { label: 'Feed',    caption: 'See what your friends rate', component: <FeedShot /> },
    { label: 'Detail',  caption: 'Scores & community reviews', component: <ContentShot /> },
    { label: 'Profile', caption: 'Your taste, visualized',     component: <ProfileShot /> },
    { label: 'Search',  caption: 'Find anything instantly',    component: <SearchShot /> },
    { label: 'Rate',    caption: 'Rate anything in seconds',   component: <RateShot /> },
  ]

  return (
    <div className="bg-white min-h-screen text-zinc-900 md:-ml-60 md:w-screen">
      {/* iOS-style status bar */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <button className="flex items-center gap-1 text-blue-500 text-sm font-medium">
          <ChevronLeft size={18} />
          Apps
        </button>
        <Search size={20} className="text-blue-500" />
      </div>

      <div className="max-w-2xl mx-auto">

        {/* ── App Header ── */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <AppIcon size={100} />
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-bold text-xl leading-tight">rateit</h1>
              <p className="text-blue-500 text-sm font-medium mt-0.5">Rate · Review · Discover</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Stars rating={4.8} size={13} />
                <span className="text-xs text-zinc-400">4.8</span>
              </div>
            </div>
          </div>

          {/* GET button */}
          <div className="mt-4 flex items-center gap-3">
            <button className="px-8 py-2 bg-blue-500 text-white font-bold rounded-full text-sm hover:bg-blue-600 transition-colors">
              GET
            </button>
            <span className="text-xs text-zinc-400">In-App Purchases</span>
          </div>
        </div>

        {/* ── Quick stats strip ── */}
        <div className="flex divide-x divide-zinc-200 border-y border-zinc-200 text-center">
          {[
            { top: '4.8', bottom: '2.4K Ratings' },
            { top: '#1', bottom: 'Social' },
            { top: '4+', bottom: 'Age' },
            { top: '12', bottom: 'Languages' },
          ].map(s => (
            <div key={s.bottom} className="flex-1 py-3 px-2">
              <p className="font-bold text-sm">{s.top}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{s.bottom}</p>
            </div>
          ))}
        </div>

        {/* ── What's New ── */}
        <div className="px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-base">What&apos;s New</h2>
            <span className="text-xs text-zinc-400">Version 1.2</span>
          </div>
          <ul className="space-y-1 text-sm text-zinc-600">
            <li>• Community feed with personalized categories</li>
            <li>• Follow friends and see their ratings</li>
            <li>• Stories — share what you&apos;re watching/playing</li>
            <li>• Onboarding to customize your feed</li>
          </ul>
        </div>

        {/* ── Screenshots ── */}
        <div className="py-5 border-b border-zinc-100">
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {screenshots.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2 shrink-0">
                <Screenshot>{s.component}</Screenshot>
                <p className="text-[11px] text-zinc-400 text-center max-w-[140px] leading-tight">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <div className="px-5 py-4 border-b border-zinc-100 space-y-3">
          <p className="text-sm text-zinc-700 leading-relaxed">
            <strong>rateit</strong> is the social platform for your opinions. Rate movies, games, music, food, sports, YouTube, TV, and more — then see what your friends think.
          </p>
          <p className="text-sm text-zinc-700 leading-relaxed">
            Build your taste profile, follow people with great taste, and discover what&apos;s worth your time before you waste it. Every rating is a data point. Every review is a signal.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Movies', 'Games', 'Music', 'Food', 'Sports', 'YouTube', 'TV Shows', 'Books'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* ── Ratings & Reviews ── */}
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-bold text-base">Ratings &amp; Reviews</h2>
            <button className="text-blue-500 text-sm font-medium">See All</button>
          </div>

          {/* Big rating number */}
          <div className="flex items-end gap-6 mb-5">
            <div className="text-center">
              <p className="text-6xl font-black text-zinc-900 leading-none">4.8</p>
              <p className="text-xs text-zinc-400 mt-1">out of 5</p>
            </div>
            <div className="flex-1 space-y-1">
              {[
                { stars: 5, pct: 78 },
                { stars: 4, pct: 14 },
                { stars: 3, pct: 5 },
                { stars: 2, pct: 2 },
                { stars: 1, pct: 1 },
              ].map(r => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-3 text-right">{r.stars}</span>
                  <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 divide-y divide-zinc-100">
            <ReviewCard
              name="Marcus T"
              username="marcust99"
              date="Jun 15"
              stars={5}
              text="Finally an app where I can track what I actually think about movies and games. My friends and I argue about scores constantly — it's so much fun."
            />
            <div className="pt-4">
              <ReviewCard
                name="Sophia K"
                username="sophiakwong"
                date="Jun 12"
                stars={5}
                text="Love the profile grid — feels like Instagram but for your taste. The feed algorithm is great too, always showing me stuff I care about."
              />
            </div>
            <div className="pt-4">
              <ReviewCard
                name="James H"
                username="jamesherrera"
                date="Jun 8"
                stars={4}
                text="Really solid app. Great concept, clean design. Would love more categories. Rating system is satisfying to use."
              />
            </div>
          </div>
        </div>

        {/* ── Information ── */}
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-base mb-3">Information</h2>
          <div className="space-y-3">
            {[
              { label: 'Provider', value: 'Andy Chen' },
              { label: 'Size', value: '24.6 MB' },
              { label: 'Category', value: 'Social Networking' },
              { label: 'Compatibility', value: 'iPhone, iPad' },
              { label: 'Languages', value: 'English, Chinese, Japanese, Korean, Spanish' },
              { label: 'Age Rating', value: '4+' },
              { label: 'Copyright', value: '© 2025 rateit' },
              { label: 'Price', value: 'Free' },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between">
                <span className="text-sm text-zinc-500">{row.label}</span>
                <span className="text-sm text-zinc-900 font-medium text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Privacy</h2>
            <Shield size={18} className="text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-500 mb-3">
            rateit collects only what&apos;s needed to run the app. Your ratings are public by default. No data is sold to third parties.
          </p>
          <div className="space-y-2">
            {[
              { label: 'Data Not Collected', desc: 'We do not collect your browsing history, location, or contacts.' },
              { label: 'Data Used to Run App', desc: 'Email, username, and ratings are used to provide the service.' },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-3 bg-zinc-50 rounded-xl p-3">
                <Globe size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div className="px-5 py-8 text-center space-y-3">
          <p className="text-zinc-400 text-sm">Use the web app now — no download needed.</p>
          <Link
            href="/feed"
            className="inline-block px-8 py-3 bg-blue-500 text-white font-bold rounded-full text-sm hover:bg-blue-600 transition-colors"
          >
            Open Web App →
          </Link>
          <p className="text-xs text-zinc-300 flex items-center justify-center gap-1">
            <ChevronRight size={12} />
            rateit-gamma.vercel.app
          </p>
        </div>

      </div>
    </div>
  )
}
