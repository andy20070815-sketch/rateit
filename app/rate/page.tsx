'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { CATEGORIES, CATEGORY_LABELS } from '../../lib/constants'
import CategoryIcon from '../../components/CategoryIcon'
import type { Category } from '../../lib/types'
import TitleSearch from '../../components/TitleSearch'

export default function RatePage() {
  return (
    <Suspense>
      <RateForm />
    </Suspense>
  )
}

function RateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [title, setTitle] = useState(searchParams.get('title') ?? '')
  const [category, setCategory] = useState<Category>((searchParams.get('category') as Category) ?? 'movie')
  const [score, setScore] = useState(7)
  const [review, setReview] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [autocompleteImageUrl, setAutocompleteImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Use uploaded image first, fall back to autocomplete artwork
    let image_url: string | null = autocompleteImageUrl

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('rating-images')
        .upload(path, imageFile)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('rating-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { data: newRating, error: insertError } = await supabase
      .from('ratings')
      .insert({ user_id: user.id, title, category, score, review: review || null, image_url })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Auto-create a story from this rating
    await supabase.from('stories').insert({
      user_id: user.id,
      image_url: image_url || '',
      rating_id: newRating.id,
    })

    router.push('/feed')
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg">New Rating</h1>
          <button onClick={() => router.back()} className="text-sm text-zinc-500">Cancel</button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">What are you rating?</label>
            <TitleSearch
              category={category}
              value={title}
              onChange={setTitle}
              onImageSelect={(url) => {
                setAutocompleteImageUrl(url)
                setImagePreview(url)
              }}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    category === cat
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <CategoryIcon category={cat} size={13} className="inline-block mr-1.5" />{CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Score: <span className="text-2xl font-black">{score}</span>
              <span className="text-zinc-400 font-normal">/10</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-black dark:accent-white"
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Review */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review <span className="text-zinc-400 font-normal">(optional)</span></label>
            <textarea
              placeholder="What did you think?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Photo <span className="text-zinc-400 font-normal">(optional)</span></label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full rounded-xl object-cover max-h-48" />
            )}
            <label className="flex items-center justify-center w-full py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
              {imagePreview ? 'Change photo' : '+ Add photo'}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post Rating'}
          </button>
        </form>
      </main>
    </>
  )
}
