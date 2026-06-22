'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8 13.4 4.8 4.8 13.4 4.8 24S13.4 43.2 24 43.2c10 0 19.2-7.2 19.2-19.2 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8c-7.5 0-14 4.3-17.7 9.9z"/>
      <path fill="#4CAF50" d="M24 43.2c4.9 0 9.4-1.7 12.8-4.6l-5.9-5c-1.9 1.3-4.3 2-6.9 2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 39.1 16.5 43.2 24 43.2z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l5.9 5C40.5 35.3 43.2 30 43.2 24c0-1.3-.1-2.7-.4-4h.8z"/>
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError('Username: 3–20 chars, lowercase letters, numbers, underscores only')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/feed')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">rateit</h1>
          <p className="text-zinc-500 mt-1 text-sm">Create your account</p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full py-3 flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <p className="text-xs text-zinc-400 text-center -mt-3">
          Google sign-in gets you a username like <span className="font-mono">andy_chen_4521</span> — you can update it later
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400">or sign up with email</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Have an account?{' '}
          <Link href="/login" className="text-black dark:text-white font-medium underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">
          Your ratings are public by default. By creating an account you agree to our{' '}
          <Link href="/terms" className="underline text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
