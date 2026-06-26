'use client'

import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  currentUrl: string | null
  username: string
}

const MAX_BYTES = 5 * 1024 * 1024
const MAX_PX = 512

// Resize the image to at most MAX_PX on its longest side and re-encode as JPEG.
// Runs entirely in the browser — no data leaves the device until the upload call.
function resizeToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas export failed')),
        'image/jpeg',
        0.88
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

export default function AvatarUpload({ currentUrl, username }: Props) {
  const [url, setUrl] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('account')

  function openPicker() {
    if (!uploading) inputRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so the same file can be re-selected
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File too large — max 5 MB.')
      return
    }

    setUploading(true)
    try {
      const resized = await resizeToJpeg(file)

      const form = new FormData()
      form.append('avatar', resized, 'avatar.jpg')

      const res = await fetch('/api/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      setUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Clickable avatar */}
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        aria-label={t('editPhoto')}
        className="relative w-24 h-24 rounded-full group cursor-pointer disabled:cursor-default"
      >
        {/* Photo or initial */}
        <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-4xl font-black select-none">
          {url
            ? <img src={url} alt={username} className="w-full h-full object-cover" />
            : ((username.replace(/[^a-zA-Z0-9]/g, '')[0] ?? 'U').toUpperCase())}
        </div>

        {/* Hover / loading overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-150 ${
          uploading
            ? 'bg-black/50 opacity-100'
            : 'bg-black/0 opacity-0 group-hover:bg-black/40 group-hover:opacity-100'
        }`}>
          {uploading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera size={20} className="text-white" strokeWidth={2} />}
        </div>
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Text trigger */}
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-40"
      >
        {uploading ? t('uploading') : t('editPhoto')}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px] leading-snug">{error}</p>
      )}
    </div>
  )
}
