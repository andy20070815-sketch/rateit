'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/feed')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
    >
      Sign out
    </button>
  )
}
