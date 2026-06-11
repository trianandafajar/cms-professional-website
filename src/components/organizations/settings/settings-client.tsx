'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AtSign,
  Camera,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  Save,
  Shield,
  Info,
  Trash2,
  User,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { AvatarCropModal } from '@/components/frontend/avatar-crop-modal'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/apiClient'
import type { OrganizerSettingsUser } from '@/app/(frontend)/organizations/settings/page'

function getAvatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as { url?: string | null }).url ?? null
  }

  return null
}

export default function SettingsClient({ initialUser }: { initialUser: OrganizerSettingsUser | null }) {
  const { user, setUser, refreshUser } = useAuthStore()
  const activeUser = (user ?? initialUser) as
    | (OrganizerSettingsUser & {
        createdAt?: string | null
        role?: { name?: string | null } | string | null
      })
    | null
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(initialUser?.name ?? '')
  const [bio, setBio] = useState(initialUser?.bio ?? '')
  const [website, setWebsite] = useState(initialUser?.website ?? '')
  const [instagram, setInstagram] = useState(initialUser?.instagram ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(getAvatarUrl(initialUser?.avatar))
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(getAvatarUrl(initialUser?.banner))
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const source = user ?? initialUser
    if (!source) return

    setName(source.name ?? '')
    setBio(source.bio ?? '')
    setWebsite(source.website ?? '')
    setInstagram(source.instagram ?? '')
    setAvatarPreview(getAvatarUrl(source.avatar))
    setBannerPreview(getAvatarUrl(source.banner))
    setBannerFile(null)
    setRemoveBanner(false)
  }, [initialUser, user])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  function handleRemoveBanner() {
    setBannerFile(null)
    setBannerPreview(null)
    setRemoveBanner(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarId: number | undefined
      let uploadedAvatar: unknown
      let bannerId: number | null | undefined
      let uploadedBanner: unknown

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

      if (user) {
        setUser({
          ...user,
          ...response.doc,
          ...(uploadedAvatar ? { avatar: uploadedAvatar } : {}),
          ...(uploadedBanner ? { banner: uploadedBanner } : {}),
          ...(removeBanner ? { banner: null } : {}),
        } as any)
      }

      await refreshUser()

      setSuccess(true)
      setAvatarFile(null)
      setBannerFile(null)
      setRemoveBanner(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = name
    ? name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'EO'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold text-[#12192f]">Settings</h1>
      <p className="mb-8 text-zinc-500">Manage your organizer profile and account settings</p>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#12192f]">
                <ImageIcon className="size-5 text-[#5151eb]" />
                Profile Banner
              </h2>
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb]">
                <div className="relative aspect-[3/1] min-h-36">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Profile banner preview"
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
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="cursor-pointer gap-2 rounded-xl"
                >
                  <Camera className="size-4" />
                  {bannerPreview ? 'Change banner' : 'Add banner'}
                </Button>
                {bannerPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveBanner}
                    className="cursor-pointer gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                    Remove banner
                  </Button>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                JPG, PNG. Recommended wide image around 1600x500px. Max 5MB.
              </p>
              {bannerFile && (
                <p className="mt-1 text-xs font-medium text-[#5151eb]">
                  New banner selected - save to apply
                </p>
              )}
              {removeBanner && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  Banner will be removed after saving.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#12192f]">
                <User className="size-5 text-[#5151eb]" />
                Profile Photo
              </h2>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="size-24 rounded-2xl object-cover ring-2 ring-zinc-200"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#5151eb] to-indigo-400 text-2xl font-bold text-white ring-2 ring-zinc-200">
                      {initials}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-[#5151eb] text-white hover:bg-[#3d3dcc]"
                  >
                    <Camera className="size-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#12192f]">Upload a new photo</p>
                  <p className="mt-0.5 text-xs text-zinc-400">JPG, PNG. Recommended 400x400px</p>
                  {avatarFile && (
                    <p className="mt-1 text-xs font-medium text-[#5151eb]">
                      New photo selected — save to apply
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#12192f]">
                <FileText className="size-5 text-[#5151eb]" />
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
                    placeholder="Your organizer name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
                    placeholder="Tell attendees about yourself or your organization..."
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    This will be shown on your public organizer profile
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#12192f]">
                <Globe className="size-5 text-[#5151eb]" />
                Social & Links
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    Instagram
                  </label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
                      placeholder="@yourusername"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                <CheckCircle2 className="size-4" />
                Profile updated successfully
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer gap-2 rounded-xl bg-[#5151eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3d3dcc]"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        <aside className="hidden w-80 shrink-0 space-y-6 lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#12192f]">
              <Shield className="size-4 text-zinc-400" />
              Account
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-zinc-300" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">Email</p>
                  <p className="truncate text-sm text-zinc-700">{activeUser?.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-zinc-300" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">Member since</p>
                  <p className="text-sm text-zinc-700">
                    {activeUser?.createdAt
                      ? new Date(activeUser.createdAt).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="size-4 text-zinc-300" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">Role</p>
                  <p className="text-sm text-zinc-700 capitalize">
                    {typeof activeUser?.role === 'object' && activeUser?.role?.name
                      ? activeUser.role.name
                      : 'Organizer'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-[#12192f]">Quick Links</h3>
            <div className="space-y-1">
              <Link
                href="/organizations/events"
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50"
              >
                <span>My Events</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
              <Link
                href="/organizations/finance"
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50"
              >
                <span>Finance</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
              <Link
                href="/organizations/help"
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50"
              >
                <span>Help Center</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-500">
              <Info className="size-4" />
              Tips
            </h3>
            <ul className="space-y-2.5 text-xs leading-relaxed text-zinc-500">
              <li className="flex gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-zinc-300" />
                A complete profile helps attendees trust your events.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-zinc-300" />
                Add a bio and photo to increase engagement.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-zinc-300" />
                Link your website and social media for better visibility.
              </li>
            </ul>
          </div>
        </aside>
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
