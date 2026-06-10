'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from '../lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { id: string; username: string; avatar_url: string | null }
}

interface Props {
  ratingId: string
  currentUserId: string | null
}

export default function CommentsSection({ ratingId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [posting, setPosting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/comments?ratingId=${ratingId}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setLoading(false) })
  }, [ratingId])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || posting) return
    setPosting(true)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratingId, content: input.trim() }),
    })
    const data = await res.json()
    if (data.comment) {
      setComments(prev => [...prev, data.comment])
      setInput('')
    }
    setPosting(false)
  }

  async function handleDelete(commentId: string) {
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
      {loading ? (
        <p className="text-xs text-zinc-400 px-1">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-400 px-1">No comments yet. Be first!</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2 group">
              <Link href={`/profile/${c.profiles.username}`}>
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
                  {c.profiles.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                      {c.profiles.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">
                  <Link href={`/profile/${c.profiles.username}`} className="font-semibold hover:underline mr-1">
                    {c.profiles.username}
                  </Link>
                  <span className="text-zinc-700 dark:text-zinc-300">{c.content}</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{formatDistanceToNow(c.created_at)}</p>
              </div>
              {currentUserId === c.user_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-400 hover:text-red-400 transition-all flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handlePost} className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a comment…"
            maxLength={300}
            className="flex-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || posting}
            className="text-xs font-semibold text-black dark:text-white disabled:opacity-30 transition-opacity"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-400">
          <Link href="/login" className="font-semibold underline">Sign in</Link> to comment
        </p>
      )}
    </div>
  )
}
