'use client'

import { useState, useRef } from 'react'
import { X, Camera, Loader2, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/stores/authStore'
import { AvatarCropModal } from './avatar-crop-modal'

type Props = {
  isOpen: boolean
  onClose: () => void
  organizer: {
    id: number
    name: string
    bio?: string | null
    website?: string | null
    instagram?: string | null
    avatarUrl?: string | null
    bannerUrl?: string | null
  }
  onUpdated: () => void
}

export function OrganizerProfileEditModal({ isOpen, onClose, organizer, onUpdated }: Props) {
  const [name, setName] = useState(organizer.name)
  const [bio, setBio] = useState(organizer.bio ?? '')
  const [website, setWebsite] = useState(organizer.website ?? '')
  const [instagram, setInstagram] = useState(organizer.instagram ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(organizer.avatarUrl ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(organizer.bannerUrl ?? null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const { setUser, user, refreshUser } = useAuthStore()

  if (!isOpen) return null

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    setCropOpen(true)
    e.target.value = ''
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for the banner')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Banner image size must be less than 5MB')
      e.target.value = ''
      return
    }
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setRemoveBanner(false)
    setError(null)
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let avatarId: number | undefined
      let uploadedAvatar: any
      let bannerId: number | null | undefined
      let uploadedBanner: any

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const res = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload avatar')
        const data = await res.json()
        avatarId = data.doc.id
        uploadedAvatar = data.doc
      }

      if (bannerFile) {
        const formData = new FormData()
        formData.append('file', bannerFile)
        const res = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload banner')
        const data = await res.json()
        bannerId = data.doc.id
        uploadedBanner = data.doc
      } else if (removeBanner) {
        bannerId = null
      }

      const updateData: Record<string, any> = { name, bio, website, instagram }
      if (avatarId) updateData.avatar = avatarId
      if (bannerId !== undefined) updateData.banner = bannerId

      const response = await apiClient.patch<{ doc: any }>('/api/organizer/profile', updateData)

      // Update local auth store
      if (user) {
        setUser({
          ...user,
          ...response.doc,
          ...(uploadedAvatar ? { avatar: uploadedAvatar } : {}),
          ...(uploadedBanner ? { banner: uploadedBanner } : {}),
          ...(removeBanner ? { banner: null } : {}),
        })
      }
      await refreshUser()

      onUpdated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-[#12192f]">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 transition"
          >
            <X className="size-5 text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Banner */}
          <div>
            <div className="relative aspect-[3/1] overflow-hidden rounded-xl bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb]">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -left-12 -top-16 size-56 rounded-full bg-[#5151eb] blur-3xl" />
                  <div className="absolute -bottom-12 right-8 size-44 rounded-full bg-indigo-400 blur-3xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50"
              >
                <Camera className="size-3.5" />
                {bannerPreview ? 'Change banner' : 'Add banner'}
              </button>
              {bannerPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerFile(null)
                    setBannerPreview(null)
                    setRemoveBanner(true)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                  Remove banner
                </button>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="size-20 rounded-2xl object-cover ring-2 ring-zinc-200"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-zinc-200">
                  {name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-[#5151eb] text-white shadow-md hover:bg-[#4040d0] transition"
              >
                <Camera className="size-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#12192f]">Profile Photo</p>
              <p className="text-xs text-zinc-400">JPG, PNG. Max 5MB</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#12192f] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-[#12192f] mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition resize-none"
              placeholder="Tell people about yourself..."
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-[#12192f] mb-1.5">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-semibold text-[#12192f] mb-1.5">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
              placeholder="@yourusername"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4040d0] transition disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <AvatarCropModal
        file={cropFile}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onApply={(file, previewUrl) => {
          setAvatarFile(file)
          setAvatarPreview(previewUrl)
        }}
      />
    </div>
  )
}
