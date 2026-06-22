'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

function SearchBarInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus when the search page mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = v.trim()
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search', { scroll: false })
    }, 250)
  }

  function handleClear() {
    setValue('')
    router.replace('/search', { scroll: false })
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        placeholder="Movies, games, artists, food…"
        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-zinc-400"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X size={15} className="text-zinc-400" />
        </button>
      )}
    </div>
  )
}

export default function SearchBar() {
  return (
    <Suspense>
      <SearchBarInner />
    </Suspense>
  )
}
