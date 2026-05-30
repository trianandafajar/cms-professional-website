'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Loader2,
  Save,
  User,
  Globe,
  AtSign,
  FileText,
  CheckCircle2,
  Shield,
  ExternalLink,
  Info,
  Calendar,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/apiClient'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load current profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const u = data.user
        setName(u.name || '')
        setBio(u.bio || '')
        setWebsite(u.website || '')
        setInstagram(u.instagram || '')
        if (u.avatar && typeof u.avatar === 'object' && u.avatar.url) {
          setAvatarPreview(u.avatar.url)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarId: number | undefined

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
      }

      const updateData: Record<string, any> = { name, bio, website, instagram }
      if (avatarId) updateData.avatar = avatarId

      await apiClient.patch('/api/organizer/profile', updateData)

      // Update local auth store
      if (user) {
        setUser({ ...user, name, bio, website, instagram })
      }

      setSuccess(true)
      setAvatarFile(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'EO'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#5151eb]" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#12192f] mb-2">Settings</h1>
      <p className="text-zinc-500 mb-8">Manage your organizer profile and account settings</p>

      <div className="flex gap-8">
        {/* Left: Form */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-[#12192f] mb-4 flex items-center gap-2">
                <User className="size-5 text-[#5151eb]" />
                Profile Photo
              </h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="size-24 rounded-2xl object-cover ring-2 ring-zinc-200"
                    />
                  ) : (
                    <div className="size-24 rounded-2xl bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-zinc-200">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-[#5151eb] text-white shadow-md hover:bg-[#3d3dcc] transition"
                  >
                    <Camera className="size-4" />
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
                  <p className="text-sm font-semibold text-[#12192f]">Upload a new photo</p>
                  <p className="text-xs text-zinc-400 mt-0.5">JPG, PNG. Recommended 400x400px</p>
                  {avatarFile && (
                    <p className="text-xs text-[#5151eb] mt-1 font-medium">
                      New photo selected — save to apply
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-[#12192f] mb-4 flex items-center gap-2">
                <FileText className="size-5 text-[#5151eb]" />
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
                    placeholder="Your organizer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
                    placeholder="Tell attendees about yourself or your organization..."
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    This will be shown on your public organizer profile
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-[#12192f] mb-4 flex items-center gap-2">
                <Globe className="size-5 text-[#5151eb]" />
                Social & Links
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Instagram
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
                      placeholder="@yourusername"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Profile updated successfully
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3d3dcc] transition disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Info Panel */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6">
          {/* Account Overview */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-bold text-[#12192f] mb-4 flex items-center gap-2">
              <Shield className="size-4 text-zinc-400" />
              Account
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-zinc-300" />
                <div className="min-w-0"> 
                  <p className="text-xs text-zinc-400">Email</p>
                  <p className="text-sm text-zinc-700 truncate">{user?.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-zinc-300" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">Member since</p>
                  <p className="text-sm text-zinc-700">
                    {(user as any)?.createdAt
                      ? new Date((user as any).createdAt).toLocaleDateString('id-ID', {
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
                  <p className="text-sm text-zinc-700 capitalize">{user?.role?.name || 'Organizer'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-bold text-[#12192f] mb-4">Quick Links</h3>
            <div className="space-y-1">
              <Link
                href="/organizations/events"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
              >
                <span>My Events</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
              <Link
                href="/organizations/finance"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
              >
                <span>Finance</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
              <Link
                href="/organizations/help"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
              >
                <span>Help Center</span>
                <ExternalLink className="size-3.5 text-zinc-300" />
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
            <h3 className="text-sm font-bold text-zinc-500 mb-3 flex items-center gap-2">
              <Info className="size-4" />
              Tips
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-500 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-zinc-300" />A complete
                profile helps attendees trust your events.
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
    </div>
  )
}
