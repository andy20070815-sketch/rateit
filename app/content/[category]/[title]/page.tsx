import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/server'
import Navbar from '../../../../components/Navbar'
import AutoImage from '../../../../components/AutoImage'
import ExternalScores from '../../../../components/ExternalScores'
import ContentDescription from '../../../../components/ContentDescription'
import CommentsSection from '../../../../components/CommentsSection'
import type { Rating, Category } from '../../../../lib/types'
import { CATEGORY_LABELS, CATEGORIES } from '../../../../lib/constants'
import CategoryIcon from '../../../../components/CategoryIcon'
import { formatDistanceToNow } from '../../../../lib/utils'

interface Props {
  params: Promise<{ category: string; title: string }>
}

export default async function ContentPage({ params }: Props) {
  const { category: rawCategory, title: encodedTitle } = await params
  const title = decodeURIComponent(encodedTitle)
  const category = rawCategory as Category

  if (!CATEGORIES.includes(category)) notFound()

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    profile = p
  }

  const { data: ratings } = await supabase
    .from('ratings')
    .select('*, profiles(id, username, avatar_url)')
    .eq('title', title)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (!ratings || ratings.length === 0) notFound()

  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
  const avgRounded = Math.round(avg * 10) / 10

  const scoreColor =
    avg >= 8 ? 'text-green-500' :
    avg >= 5 ? 'text-yellow-500' :
    'text-red-500'

  // Score distribution
  const dist = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: ratings.filter((r) => r.score === i + 1).length,
  }))
  const maxCount = Math.max(...dist.map((d) => d.count), 1)

  const userAlreadyRated = user ? ratings.some((r) => r.user_id === user.id) : false

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="space-y-4">
          <AutoImage
            title={title}
            category={category}
            className="w-full h-64"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CategoryIcon category={category} size={14} className="text-zinc-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
            <h1 className="text-2xl font-black">{title}</h1>

            {/* External scores */}
            <ExternalScores title={title} category={category} />
          </div>
        </div>

        {/* Description */}
        <ContentDescription title={title} category={category} />

        {/* Average score */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-zinc-500 font-medium">Community Rating</p>
              <div className={`text-5xl font-black ${scoreColor}`}>
                {avgRounded}
                <span className="text-lg font-normal text-zinc-400">/10</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{ratings.length} rating{ratings.length !== 1 ? 's' : ''}</p>
            </div>

            {!userAlreadyRated && (
              <Link
                href={user
                  ? `/rate?title=${encodeURIComponent(title)}&category=${category}`
                  : `/login`}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl text-sm"
              >
                Rate this
              </Link>
            )}
          </div>

          {/* Score distribution bar chart */}
          <div className="space-y-1.5">
            {dist.map(({ score, count }) => (
              <div key={score} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-4 text-right">{score}</span>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white rounded-full transition-all"
                    style={{ width: count === 0 ? '0%' : `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-3">{count || ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual reviews */}
        <section className="space-y-3">
          <h2 className="font-bold text-base">Reviews</h2>
          {(ratings as Rating[]).map((rating) => (
            <div key={rating.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                {rating.profiles && (
                  <Link href={`/profile/${rating.profiles.username}`} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {rating.profiles.avatar_url ? (
                        <img src={rating.profiles.avatar_url} alt={rating.profiles.username} className="w-full h-full object-cover" />
                      ) : (
                        rating.profiles.username[0].toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-semibold">{rating.profiles.username}</span>
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  <span className={`text-xl font-black ${
                    rating.score >= 8 ? 'text-green-500' :
                    rating.score >= 5 ? 'text-yellow-500' : 'text-red-500'
                  }`}>{rating.score}</span>
                  <span className="text-xs text-zinc-400">/10</span>
                </div>
              </div>
              {rating.review && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{rating.review}</p>
              )}
              <p className="text-xs text-zinc-400">{formatDistanceToNow(rating.created_at)}</p>
              <CommentsSection ratingId={rating.id} currentUserId={user?.id ?? null} />
            </div>
          ))}
        </section>

      </main>
    </>
  )
}
