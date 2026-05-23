'use client'

import { useState } from 'react'
import { User, Mail, MapPin, Save, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function MyProfilePage() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
        credentials: 'include',
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#5151eb] text-xl font-bold text-white">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900">{user?.name || 'User'}</p>
              <p className="text-sm text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 w-full rounded-xl border border-zinc-200 pl-10 pr-4 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-500 outline-none cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-400">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition resize-none focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4040d0] disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="size-4" />
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
