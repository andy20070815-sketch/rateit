'use client'

import Link from 'next/link'
import { Film, Gamepad2, Music, Trophy, Utensils, BookOpen, PlayCircle, Tv, MoreHorizontal, Star, Users, Grid3X3 } from 'lucide-react'

// ── Reusable phone shell ────────────────────────────────────────────────────
function Phone({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-[248px] shrink-0 ${className}`}>
      {/* Side buttons */}
      <div className="absolute -left-[3px] top-20 w-[3px] h-8 bg-zinc-700 rounded-l-sm" />
      <div className="absolute -left-[3px] top-32 w-[3px] h-12 bg-zinc-700 rounded-l-sm" />
      <div className="absolute -left-[3px] top-48 w-[3px] h-12 bg-zinc-700 rounded-l-sm" />
      <div className="absolute -right-[3px] top-28 w-[3px] h-16 bg-zinc-700 rounded-r-sm" />

      {/* Phone body */}
      <div className="w-full h-[536px] rounded-[42px] border-[7px] border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/60 relative">
        {/* Screen */}
        <div className="absolute inset-0 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[90px] h-[26px] rounded-full bg-zinc-900 z-20" />
          {/* Status bar spacer */}
          <div className="h-10 shrink-0" />
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
          {/* Home indicator */}
          <div className="h-5 flex items-end justify-center pb-1.5 shrink-0">
            <div className="w-24 h-1 rounded-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Score color helper ──────────────────────────────────────────────────────
function sc(s: number) {
  return s >= 8 ? 'text-green-500' : s >= 5 ? 'text-yellow-500' : 'text-red-500'
}

// ── Screen: Feed ────────────────────────────────────────────────────────────
function FeedScreen() {
  const cards = [
    { user: 'kai_w', time: '2h', img: 'https://upload.wikimedia.org/wikipedia/en/2/2e/The_Legend_of_Zelda_Breath_of_the_Wild.jpg', cat: 'Game', icon: Gamepad2, title: 'Zelda: Breath of the Wild', score: 10, review: "The most free I've ever felt in a game." },
    { user: 'miarose', time: '5h', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Doja_Cat_-_Planet_Her.png/220px-Doja_Cat_-_Planet_Her.png', cat: 'Music', icon: Music, title: 'Doja Cat', score: 8, review: "No skips. Carried by the production." },
  ]
  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100">
        <span className="font-black text-base tracking-tight">rateit</span>
        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
          <div className="w-3 h-0.5 bg-zinc-400 rounded" />
        </div>
      </div>
      {/* Category pills */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-hidden border-b border-zinc-100">
        {['All', 'Movie', 'Game', 'Music', 'Sport'].map((c, i) => (
          <span key={c} className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-semibold ${i === 0 ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}>{c}</span>
        ))}
      </div>
      {/* Cards */}
      <div className="flex-1 overflow-hidden px-3 py-2 space-y-3">
        {cards.map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
            <div className="flex items-center gap-2 p-2">
              <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold">{c.user[0].toUpperCase()}</div>
              <span className="text-[10px] font-semibold">{c.user}</span>
              <span className="text-[9px] text-zinc-400 ml-auto">{c.time}</span>
            </div>
            <img src={c.img} alt={c.title} className="w-full h-24 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            <div className="p-2 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <c.icon size={9} className="text-zinc-400" />
                  <span className="text-[8px] text-zinc-400 uppercase tracking-wide">{c.cat}</span>
                </div>
                <p className="text-[11px] font-semibold leading-tight">{c.title}</p>
                <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight line-clamp-1">{c.review}</p>
              </div>
              <div className={`text-lg font-black ${sc(c.score)} shrink-0 ml-2`}>
                {c.score}<span className="text-[9px] font-normal text-zinc-300">/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="border-t border-zinc-100 flex justify-around px-4 py-2">
        {[{ icon: '⌂', active: true }, { icon: '⌕', active: false }, { icon: '+', active: false, big: true }, { icon: '⊕', active: false }, { icon: '○', active: false }].map((t, i) => (
          <div key={i} className={`w-8 h-5 flex items-center justify-center text-sm ${t.active ? 'text-black' : 'text-zinc-300'} ${t.big ? 'text-xl' : ''}`}>{t.icon}</div>
        ))}
      </div>
    </div>
  )
}

// ── Screen: Content Detail ──────────────────────────────────────────────────
function ContentScreen() {
  const dist = [
    { s: 10, w: 80 }, { s: 9, w: 60 }, { s: 8, w: 30 },
    { s: 7, w: 15 }, { s: 6, w: 10 }, { s: 5, w: 5 },
  ]
  return (
    <div className="flex flex-col h-full">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-zinc-700 to-zinc-900 shrink-0">
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Elden_Ring_Box_art.jpg/220px-Elden_Ring_Box_art.jpg"
          alt="Elden Ring"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3">
          <div className="flex items-center gap-1 mb-0.5">
            <Gamepad2 size={9} className="text-white/70" />
            <span className="text-[8px] text-white/70 uppercase tracking-wide font-medium">Game</span>
          </div>
          <p className="text-white font-black text-base leading-tight">Elden Ring</p>
        </div>
        {/* Back button */}
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
          <span className="text-white text-[10px]">←</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden px-3 py-2.5 space-y-3">
        {/* Score block */}
        <div className="bg-white rounded-xl border border-zinc-100 p-3">
          <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wide mb-1">Community Rating</p>
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-3xl font-black text-green-500">9.2</span>
              <span className="text-[10px] text-zinc-400">/10</span>
              <p className="text-[9px] text-zinc-400 mt-0.5">1,247 ratings</p>
            </div>
            <div className="px-3 py-1.5 bg-black rounded-xl text-white text-[9px] font-semibold">Rate this</div>
          </div>
          {/* Bars */}
          <div className="space-y-1">
            {dist.map(d => (
              <div key={d.s} className="flex items-center gap-1.5">
                <span className="text-[8px] text-zinc-400 w-3 text-right">{d.s}</span>
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${d.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <p className="text-[10px] font-bold">Reviews</p>
        {[{ user: 'luka_99', score: 10, text: 'Spent 300 hours. Worth every second.' },
          { user: 'sara_m', score: 9, text: 'The world-building is unmatched.' }].map(r => (
          <div key={r.user} className="bg-white rounded-xl border border-zinc-100 p-2.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[8px] font-bold">{r.user[0].toUpperCase()}</div>
                <span className="text-[9px] font-semibold">{r.user}</span>
              </div>
              <span className={`text-sm font-black ${sc(r.score)}`}>{r.score}<span className="text-[8px] font-normal text-zinc-300">/10</span></span>
            </div>
            <p className="text-[9px] text-zinc-500 leading-tight">{r.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-zinc-100 flex justify-around px-4 py-2">
        {['⌂', '⌕', '+', '⊕', '○'].map((icon, i) => (
          <div key={i} className={`w-8 h-5 flex items-center justify-center text-sm ${i === 3 ? 'text-black' : 'text-zinc-300'}`}>{icon}</div>
        ))}
      </div>
    </div>
  )
}

// ── Screen: Profile ─────────────────────────────────────────────────────────
function ProfileScreen() {
  const scores = [9, 8, 10, 7, 9, 8, 6, 10, 7]
  const imgs = [
    'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Elden_Ring_Box_art.jpg/220px-Elden_Ring_Box_art.jpg',
    'https://upload.wikimedia.org/wikipedia/en/2/2e/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
    null, null,
    'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Doja_Cat_-_Planet_Her.png/220px-Doja_Cat_-_Planet_Her.png',
    null, null, null, null,
  ]
  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <div className="flex items-center justify-center px-4 py-2 border-b border-zinc-100 relative">
        <span className="font-black text-[13px]">andy</span>
        <div className="absolute right-3 w-5 h-5 flex items-center justify-center">
          <div className="space-y-0.5">
            {[...Array(3)].map((_, i) => <div key={i} className="w-3 h-0.5 bg-zinc-300 rounded" />)}
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="px-3 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-black text-xl shrink-0">A</div>
          <div className="flex justify-around flex-1">
            {[{ v: 42, l: 'Ratings' }, { v: 18, l: 'Followers' }, { v: 5, l: 'Following' }].map(s => (
              <div key={s.l} className="text-center">
                <p className="font-black text-sm leading-none">{s.v}</p>
                <p className="text-[8px] text-zinc-400 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold">Andy Chen</p>
          <p className="text-[9px] text-zinc-400">@andy · rating everything since 2024</p>
        </div>
        <div className="w-full py-1.5 border border-zinc-200 rounded-xl text-center text-[9px] font-semibold text-zinc-600">Edit profile</div>
      </div>
      {/* Divider */}
      <div className="h-px bg-zinc-100 mx-0" />
      {/* Grid */}
      <div className="grid grid-cols-3 gap-px flex-1 overflow-hidden">
        {scores.map((score, i) => (
          <div key={i} className="relative bg-zinc-100 aspect-square">
            {imgs[i] && (
              <img src={imgs[i]!} alt="" className="w-full h-full object-cover" />
            )}
            {!imgs[i] && (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 size={16} className="text-zinc-300" />
              </div>
            )}
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded px-1 py-0.5">
              <span className={`text-[8px] font-black ${sc(score)}`}>{score}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="border-t border-zinc-100 flex justify-around px-4 py-2">
        {['⌂', '⌕', '+', '⊕', '○'].map((icon, i) => (
          <div key={i} className={`w-8 h-5 flex items-center justify-center text-sm ${i === 4 ? 'text-black' : 'text-zinc-300'}`}>{icon}</div>
        ))}
      </div>
    </div>
  )
}

// ── Screen: Rate ────────────────────────────────────────────────────────────
function RateScreen() {
  const cats = [
    { icon: Film, label: 'Movie' },
    { icon: Tv, label: 'TV' },
    { icon: Trophy, label: 'Sport' },
    { icon: PlayCircle, label: 'YouTube' },
    { icon: Music, label: 'Music' },
    { icon: BookOpen, label: 'Book' },
    { icon: Gamepad2, label: 'Game', active: true },
    { icon: Utensils, label: 'Food' },
    { icon: MoreHorizontal, label: 'Other' },
  ]
  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100">
        <span className="font-black text-[13px]">New Rating</span>
        <span className="text-[10px] text-zinc-400">Cancel</span>
      </div>
      <div className="flex-1 overflow-hidden px-3 py-3 space-y-4">
        {/* Search */}
        <div>
          <p className="text-[9px] font-semibold text-zinc-600 mb-1.5">What are you rating?</p>
          <div className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-[10px] text-zinc-400 flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border border-zinc-300" />
            Elden Ring
          </div>
        </div>
        {/* Category */}
        <div>
          <p className="text-[9px] font-semibold text-zinc-600 mb-1.5">Category</p>
          <div className="grid grid-cols-3 gap-1.5">
            {cats.map(c => (
              <div key={c.label} className={`flex items-center justify-center gap-1 py-1.5 rounded-xl border text-[8px] font-semibold ${c.active ? 'bg-black border-black text-white' : 'border-zinc-200 text-zinc-500'}`}>
                <c.icon size={9} />
                {c.label}
              </div>
            ))}
          </div>
        </div>
        {/* Score */}
        <div>
          <p className="text-[9px] font-semibold text-zinc-600 mb-1">Score: <span className="text-lg font-black text-black">9</span><span className="text-[9px] text-zinc-400">/10</span></p>
          <div className="relative w-full h-1.5 bg-zinc-200 rounded-full">
            <div className="absolute left-0 top-0 h-full bg-black rounded-full" style={{ width: '87%' }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black rounded-full border-2 border-white shadow" style={{ left: 'calc(87% - 7px)' }} />
          </div>
          <div className="flex justify-between text-[8px] text-zinc-400 mt-1"><span>1</span><span>5</span><span>10</span></div>
        </div>
        {/* Review */}
        <div>
          <p className="text-[9px] font-semibold text-zinc-600 mb-1.5">Review <span className="font-normal text-zinc-400">(optional)</span></p>
          <div className="w-full h-14 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-[9px] text-zinc-400">
            Best game I've ever played...
          </div>
        </div>
        {/* Submit */}
        <div className="w-full py-2.5 bg-black rounded-xl text-white text-[10px] font-bold text-center">Post Rating</div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function MockupPage() {
  const screens = [
    { label: 'Feed',    desc: 'Discover what people are rating',   component: <FeedScreen /> },
    { label: 'Detail',  desc: 'Scores, reviews & distribution',    component: <ContentScreen /> },
    { label: 'Profile', desc: 'Your ratings at a glance',          component: <ProfileScreen /> },
    { label: 'Rate',    desc: 'Rate anything in seconds',          component: <RateScreen /> },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden md:-ml-60 md:w-screen">
      {/* Gradient orbs — hidden on mobile to avoid GPU crash on low-end phones */}
      <div className="hidden md:block fixed top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block fixed top-1/3 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block fixed bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-8 py-6">
        <span className="font-black text-2xl tracking-tight">rateit</span>
        <div className="flex items-center gap-4">
          <Link href="/feed" className="text-zinc-400 hover:text-white text-sm transition-colors">Open app</Link>
          <Link href="/signup" className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-100 transition-colors">Sign up free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center px-4 pt-12 pb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-zinc-300 mb-6">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          Rate movies, games, food, artists & more
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-5">
          Your taste,<br />
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">rated.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
          Rate anything. See what your friends think. Discover what&apos;s worth your time.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup" className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-100 transition-colors text-sm">
            Get started — it&apos;s free
          </Link>
          <Link href="/feed" className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-2xl hover:bg-zinc-700 transition-colors text-sm border border-zinc-700">
            Browse the feed
          </Link>
        </div>
      </div>

      {/* Phone mockups */}
      <div className="relative z-10 overflow-x-auto pb-12">
        <div className="flex gap-6 min-w-max mx-auto px-8 w-fit items-end">
          {screens.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-4">
              <Phone
                className={`transition-transform ${
                  i % 2 === 0 ? 'translate-y-4' : '-translate-y-4'
                }`}
              >
                {s.component}
              </Phone>
              <div className="text-center">
                <p className="font-bold text-sm text-white">{s.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature row */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Star, title: 'Rate everything', desc: '9 categories — movies, games, food, music, sports, YouTube, TV, books, and more.' },
          { icon: Users, title: 'Follow people', desc: 'See what your friends rate. Follow tastemakers. Build your own audience.' },
          { icon: Grid3X3, title: 'Your taste profile', desc: 'Every rating builds your profile. See your history, your averages, your vibe.' },
        ].map(f => (
          <div key={f.title} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
              <f.icon size={20} className="text-zinc-300" />
            </div>
            <h3 className="font-bold text-base mb-2">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA footer */}
      <div className="relative z-10 text-center px-4 py-20 border-t border-zinc-800/50">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Start rating today.</h2>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Join the community. Your opinion matters — let&apos;s hear it.</p>
        <Link href="/signup" className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-zinc-100 transition-colors inline-block">
          Create your account
        </Link>
        <p className="text-zinc-600 text-xs mt-4">Free. No credit card. No nonsense.</p>
      </div>
    </div>
  )
}
