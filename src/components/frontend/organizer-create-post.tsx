'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2, Send } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

type Props = {
  onPostCreated: () => void
  avatarUrl?: string | null
  organizerName: string
}

export function OrganizerCreatePost({ onPostCreated, avatarUrl, organizerName }: Props) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = organizerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setPosting(true)
    setError(null)

    try {
      let imageId: number | undefined

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const res = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload image')
        const data = await res.json()
        imageId = data.doc.id
      }

      await apiClient.post('/api/organizer/posts', {
        content: content.trim(),
        image: imageId || null,
      })

      setContent('')
      setImageFile(null)
      setImagePreview(null)
      onPostCreated()
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={organizerName}
              className="size-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="size-10 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
          )}

          {/* Input area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update with your followers..."
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-xl border-0 bg-zinc-50 px-4 py-3 text-sm text-[#12192f] placeholder:text-zinc-400 focus:bg-zinc-100 focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="max-h-48 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-[#5151eb] transition"
              >
                <ImagePlus className="size-4" />
                Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4040d0] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
