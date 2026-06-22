'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function DeleteAccountButton() {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [error, setError] = useState('')

  async function handleDelete() {
    setStep('deleting')
    setError('')

    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setStep('confirm')
      return
    }

    // Sign out locally then redirect
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="text-sm text-red-500 hover:text-red-600 transition-colors"
      >
        Delete account
      </button>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete your account?</p>
        <p className="text-xs text-red-600 dark:text-red-500">
          This permanently deletes your profile, all your ratings, and your followers. This cannot be undone.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
          >
            Yes, delete everything
          </button>
          <button
            onClick={() => setStep('idle')}
            className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <p className="text-sm text-zinc-400 text-center">Deleting your account…</p>
  )
}
