'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2, Send, Link2 } from 'lucide-react'
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
  const [link, setLink] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function validateUrl(url: string): boolean {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    // Validate link if provided
    if (link && !validateUrl(link)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

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

      await apiClient.post('/api/posts', {
        content: content.trim(),
        image: imageId || null,
        link: link.trim() || null,
        linkTitle: linkTitle.trim() || null,
      })

      setContent('')
      setImageFile(null)
      setImagePreview(null)
      setLink('')
      setLinkTitle('')
      setShowLinkInput(false)
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
                  className="max-h-64 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Link preview */}
            {showLinkInput && (
              <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Attach Link</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkInput(false)
                      setLink('')
                      setLinkTitle('')
                    }}
                    className="cursor-pointer text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
                />
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title (optional)"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
                />
              </div>
            )}

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-[#5151eb]"
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
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    showLinkInput || link
                      ? 'bg-[#5151eb]/10 text-[#5151eb]'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-[#5151eb]'
                  }`}
                >
                  <Link2 className="size-4" />
                  Link
                </button>
              </div>

              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-50"
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
