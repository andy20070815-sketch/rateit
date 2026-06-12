'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, PlusCircle, User, Compass, Search, X } from 'lucide-react'
import { createClient } from '../lib/supabase/client'
import { CATEGORY_LABELS } from '../lib/constants'
import CategoryIcon from './CategoryIcon'
import type { Category } from '../lib/types'

interface Suggestion {
  title: string
  primaryCategory: Category
  avg: number
  count: number
  image_url: string | null
}

export default function Navbar({ username }: { username: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoggedIn = !!username

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Live suggestions with 180ms debounce
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('ratings')
        .select('title, category, score, image_url')
        .ilike('title', `%${q}%`)
        .limit(100)

      // Group by title, pick primary category by count
      const groups = new Map<string, {
        title: string
        catCount: Map<Category, number>
        scores: number[]
        image_url: string | null
      }>()

      for (const r of data || []) {
        const key = r.title.toLowerCase()
        if (!groups.has(key)) {
          groups.set(key, { title: r.title, catCount: new Map(), scores: [], image_url: null })
        }
        const g = groups.get(key)!
        const cat = r.category as Category
        g.catCount.set(cat, (g.catCount.get(cat) ?? 0) + 1)
        g.scores.push(r.score)
        if (!g.image_url && r.image_url) g.image_url = r.image_url
      }

      const items: Suggestion[] = [...groups.values()]
        .map(g => {
          const topCat = [...g.catCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
          return {
            title: g.title,
            primaryCategory: topCat,
            avg: g.scores.reduce((a, b) => a + b, 0) / g.scores.length,
            count: g.scores.length,
            image_url: g.image_url,
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      setSuggestions(items)
      setShowSuggestions(items.length > 0)
    }, 180)

    return () => clearTimeout(timer)
  }, [searchQuery])

  function navigateToSearch() {
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    closeSearch()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigateToSearch()
  }

  function handleSelect(s: Suggestion) {
    router.push(`/content/${s.primaryCategory}/${encodeURIComponent(s.title)}`)
    closeSearch()
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
    setShowSuggestions(false)
    setSuggestions([])
  }

  const scoreColor = (avg: number) =>
    avg >= 8 ? 'text-green-500' : avg >= 5 ? 'text-yellow-500' : 'text-red-500'


  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2">

        {searchOpen ? (
          <div ref={containerRef} className="flex-1 relative">
            {/* Search input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search movies, artists, athletes…"
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={closeSearch}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </form>

            {/* Live suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50">
                {suggestions.map(s => (
                  <button
                    key={s.title.toLowerCase()}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon category={s.primaryCategory} size={18} className="text-zinc-400" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <CategoryIcon category={s.primaryCategory} size={11} className="text-zinc-400" />
                        {CATEGORY_LABELS[s.primaryCategory]}
                        {' · '}{s.count} {s.count === 1 ? 'rating' : 'ratings'}
                      </p>
                    </div>
                    <span className={`text-base font-black shrink-0 ${scoreColor(s.avg)}`}>
                      {Math.round(s.avg * 10) / 10}
                    </span>
                  </button>
                ))}

                {/* See all results footer */}
                <button
                  type="button"
                  onClick={navigateToSearch}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800 transition-colors"
                >
                  <Search size={12} />
                  See all results for &ldquo;{searchQuery}&rdquo;
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/feed" className="font-black text-xl tracking-tight mr-auto">
              rateit
            </Link>

            <nav className="flex items-center gap-1">
              {/* Home */}
              <Link href="/feed" className={`p-2 rounded-xl transition-colors ${pathname === '/feed' ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`} aria-label="Feed">
                <Home size={20} />
              </Link>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Explore */}
              <Link href="/explore" className={`p-2 rounded-xl transition-colors ${pathname === '/explore' ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`} aria-label="Explore">
                <Compass size={20} />
              </Link>

              {/* Rate */}
              <Link href="/rate" className={`p-2 rounded-xl transition-colors ${pathname === '/rate' ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`} aria-label="Rate">
                <PlusCircle size={20} />
              </Link>

              {/* Profile or Sign in */}
              {isLoggedIn ? (
                <Link href={`/profile/${username}`} className={`p-2 rounded-xl transition-colors ${pathname.startsWith('/profile') ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`} aria-label="Profile">
                  <User size={20} />
                </Link>
              ) : (
                <Link href="/login" className="px-3 py-1.5 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-xl">
                  Sign in
                </Link>
              )}
            </nav>
          </>
        )}

      </div>
    </header>
  )
}
