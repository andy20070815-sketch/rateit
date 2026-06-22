'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, PlusCircle, Compass, User, Settings } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

export default function Sidebar() {
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('username').eq('id', data.user.id).single()
        .then(({ data: p }) => { if (p) setUsername(p.username) })
    })
  }, [])

  const navItems = [
    { href: '/feed',    icon: Home,    label: 'Home'    },
    { href: '/search',  icon: Search,  label: 'Search'  },
    { href: '/explore', icon: Compass, label: 'Explore' },
    { href: username ? `/profile/${username}` : '/login', icon: User, label: 'Profile' },
  ]

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-40 px-3 py-6">
      {/* Logo */}
      <Link href="/feed" className="font-black text-2xl tracking-tight mb-8 px-3">
        rateit
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href))
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-[15px] ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}

        {/* Rate CTA */}
        <Link
          href="/rate"
          className={`flex items-center gap-3 mt-3 px-4 py-3 rounded-2xl font-bold text-sm transition-opacity ${
            pathname === '/rate'
              ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black'
              : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
          }`}
        >
          <PlusCircle size={20} />
          Rate something
        </Link>
      </nav>

      {/* Settings at bottom */}
      <Link
        href="/account"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors text-sm font-medium"
      >
        <Settings size={19} strokeWidth={1.75} />
        Settings
      </Link>
    </aside>
  )
}
