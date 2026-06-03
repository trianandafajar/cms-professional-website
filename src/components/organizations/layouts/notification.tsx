'use client'

import { useEffect, useState } from 'react'
import { Bell, Loader2, Megaphone, X } from 'lucide-react'

import { apiClient } from '@/lib/apiClient'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

type NotificationItem = {
  id: number | string
  title: string
  message: string
  link?: string | null
  isRead?: boolean | null
  type?: string | null
  createdAt?: string | null
}

function formatRelativeDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadNotifications() {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ docs: NotificationItem[] }>(
          '/api/notifications?limit=20&sort=-createdAt&depth=0',
        )

        if (!cancelled) {
          setNotifications(response.docs ?? [])
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load notifications')
          setNotifications([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadNotifications()

    return () => {
      cancelled = true
    }
  }, [open])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="relative rounded-xl p-2 transition-colors hover:bg-zinc-50"
          variant="ghost"
          size="sm"
        >
          <Bell size={20} className="text-zinc-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#5151eb] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full border-l border-zinc-200 p-0 sm:max-w-[440px]">
        <div className="flex h-full flex-col bg-white">
          <div className="border-b border-zinc-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[2rem] font-bold tracking-tight text-[#12192f]">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Stay up to date on important information
                </p>
              </div>

              <DrawerClose asChild>
                <button className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-[#12192f]">
                  <X size={20} />
                </button>
              </DrawerClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <Loader2 className="size-5 animate-spin text-[#5151eb]" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-start px-4 pt-14 text-center">
                <div className="flex h-44 w-44 items-center justify-center rounded-full bg-indigo-50">
                  <Megaphone size={72} strokeWidth={1.5} className="text-[#12192f]" />
                </div>
                <h3 className="mt-10 text-3xl font-bold leading-tight tracking-tight text-[#12192f]">
                  Nothing to see here (yet)!
                </h3>
                <p className="mt-4 max-w-[320px] text-base leading-relaxed text-zinc-600">
                  We&apos;ll show order, finance, and system updates here when they arrive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#12192f]">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <span className="mt-1 size-2 rounded-full bg-[#5151eb]" />
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                        <span className="rounded-full bg-white px-2 py-0.5 font-medium uppercase tracking-wide text-zinc-500">
                          {notification.type || 'system'}
                        </span>
                        <span>{formatRelativeDate(notification.createdAt)}</span>
                      </div>
                    </>
                  )

                  const className = `block rounded-2xl border p-4 transition ${
                    notification.isRead
                      ? 'border-zinc-200 bg-white hover:bg-zinc-50'
                      : 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50'
                  }`

                  if (notification.link) {
                    return (
                      <a key={notification.id} href={notification.link} className={className}>
                        {content}
                      </a>
                    )
                  }

                  return (
                    <div key={notification.id} className={className}>
                      {content}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
