'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Home, Search, PlusCircle, Compass, User } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

const HIDE_ON = ['/login', '/signup', '/onboarding', '/stories/new', '/auth/callback', '/mockup']

export default function BottomNav() {
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)
  const t = useTranslations('nav')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('username').eq('id', data.user.id).single()
        .then(({ data: p }) => { if (p) setUsername(p.username) })
    })
  }, [])

  if (HIDE_ON.some(p => pathname.startsWith(p))) return null

  const profileHref = username ? `/profile/${username}` : '/login'

  const tabs = [
    { href: '/feed',     icon: Home,       label: t('home'),    special: false },
    { href: '/search',   icon: Search,     label: t('search'),  special: false },
    { href: '/rate',     icon: PlusCircle, label: t('rate'),    special: true  },
    { href: '/explore',  icon: Compass,    label: t('explore'), special: false },
    { href: profileHref, icon: User,       label: t('profile'), special: false },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 flex items-stretch justify-around md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label, special }) => {
        const isActive = pathname === href || (href !== '/feed' && !special && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors ${
              special
                ? 'text-black dark:text-white'
                : isActive
                ? 'text-black dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Icon
              size={special ? 26 : 22}
              strokeWidth={isActive || special ? 2.5 : 1.75}
            />
            {!special && (
              <span className="text-[10px] font-medium leading-none">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
