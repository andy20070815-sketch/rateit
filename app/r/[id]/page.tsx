import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '../../../lib/supabase/server'
import Navbar from '../../../components/Navbar'
import AutoImage from '../../../components/AutoImage'
import CommentsSection from '../../../components/CommentsSection'
import ShareButton from '../../../components/ShareButton'
import ShareLandingTracker from '../../../components/ShareLandingTracker'
import CategoryIcon from '../../../components/CategoryIcon'
import { CATEGORY_LABELS } from '../../../lib/constants'
import { formatDistanceToNow, isVideoUrl } from '../../../lib/utils'
import type { Rating, Category } from '../../../lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string; utm_source?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: r } = await supabase
    .from('ratings')
    .select('title, category, score, review, profiles(username)')
    .eq('id', id)
    .single()

  if (!r) return { title: 'Rating not found' }

  const username = (r.profiles as unknown as { username: string } | null)?.username ?? 'someone'
  const title = `${username} rated ${r.title} ${r.score}/10`
  const description = r.review
    ? `"${r.review.slice(0, 120)}${r.review.length > 120 ? '…' : ''}"`
    : `${r.score}/10 on rateit`
  const ogImage = `/r/${id}/opengraph-image`

  return {
    title,
    description,
    openGraph: { title, description, url: `/r/${id}`, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  }
}

export default async function RatingPermalinkPage({ params, searchParams }: Props) {
  const { id } = await params
  const { ref, utm_source } = await searchParams

  const supabase = await createClient()
  const [{ data: { user } }, { data: rating }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('ratings')
      .select('*, profiles(id, username, avatar_url, full_name)')
      .eq('id', id)
      .single(),
  ])

  if (!rating) notFound()

  let viewerUsername = ''
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    viewerUsername = p?.username ?? ''
  }

  const r = rating as Rating & { profiles: { id: string; username: string; avatar_url: string | null; full_name: string | null } | null }
  const username = r.profiles?.username ?? 'unknown'
  const isFromShare = ref === 'share'

  const scoreColor =
    r.score >= 8 ? 'text-green-500' :
    r.score >= 5 ? 'text-yellow-500' :
    'text-red-500'

  return (
    <>
      <Navbar username={viewerUsername} />

      {isFromShare && (
        <ShareLandingTracker rid={id} source={utm_source ?? 'unknown'} />
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Rating card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">

          {/* Author */}
          {r.profiles && (
            <Link href={`/profile/${username}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-sm font-bold">
                {r.profiles.avatar_url ? (
                  <img src={r.profiles.avatar_url} alt={username} className="w-full h-full object-cover" />
                ) : (
                  username[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{username}</p>
                <p className="text-xs text-zinc-500">{formatDistanceToNow(r.created_at)}</p>
              </div>
            </Link>
          )}

          {/* Media */}
          {r.image_url && isVideoUrl(r.image_url) ? (
            <video src={r.image_url} className="w-full rounded-xl max-h-96" controls playsInline muted loop />
          ) : r.image_url ? (
            <img src={r.image_url} alt={r.title} className="w-full rounded-xl object-cover max-h-96" />
          ) : (
            <AutoImage title={r.title} category={r.category as Category} className="w-full max-h-72 h-56" ratingId={r.id} />
          )}

          {/* Category */}
          <div className="flex items-center gap-1.5">
            <CategoryIcon category={r.category as Category} size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
              {CATEGORY_LABELS[r.category as Category]}
            </span>
          </div>

          {/* Title */}
          <Link href={`/content/${r.category}/${encodeURIComponent(r.title)}`} className="font-semibold text-base hover:underline leading-snug block">
            {r.title}
          </Link>

          {/* Score + review */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <span className={`text-xl font-black ${scoreColor} mr-1`}>
              {r.score}<span className="text-xs font-normal text-zinc-400">/10</span>
            </span>
            {r.review}
          </p>

          {/* Share */}
          <div className="flex items-center justify-end pt-1">
            <ShareButton rating={r} />
          </div>
        </div>

        {/* Comments (always open on permalink) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Comments</p>
          <CommentsSection ratingId={r.id} currentUserId={user?.id ?? null} />
        </div>

        {/* Logged-out CTA */}
        {!user && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Join rateit to rate {r.title} yourself.</p>
            <Link
              href={`/signup?ref=share&rid=${id}&from=${utm_source ?? 'link'}`}
              className="block w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl text-center text-sm"
            >
              Rate it yourself — free, 10 seconds
            </Link>
            <Link
              href={`/profile/${username}`}
              className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              See more from @{username} →
            </Link>
          </div>
        )}

      </main>
    </>
  )
}
