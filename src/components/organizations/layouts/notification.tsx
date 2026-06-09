'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Loader2, Megaphone, Trash2, X } from 'lucide-react'

import { apiClient } from '@/lib/apiClient'
import {
  getNotificationWsUrl,
  type NotificationSocketEvent,
  type RealtimeNotification,
} from '@/websocket/notifications'
import { useAuthStore } from '@/stores/authStore'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

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

function upsertNotification(
  list: RealtimeNotification[],
  nextNotification: RealtimeNotification,
): RealtimeNotification[] {
  const index = list.findIndex((item) => String(item.id) === String(nextNotification.id))
  if (index === -1) {
    return [nextNotification, ...list].sort((left, right) => {
      const leftDate = new Date(left.createdAt ?? '').getTime()
      const rightDate = new Date(right.createdAt ?? '').getTime()
      return rightDate - leftDate
    })
  }

  const next = [...list]
  next[index] = { ...next[index], ...nextNotification }
  return next
}

export default function NotificationDrawer() {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const lastUserIdRef = useRef<string | null>(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  useEffect(() => {
    if (!hasHydrated) return

    const currentUserId = user?.id ?? null

    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId
      setNotifications([])
      setError(null)
      setInitialLoading(true)
    }

    if (!currentUserId) {
      setNotifications([])
      setInitialLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function loadInitialNotifications() {
      setInitialLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ docs: RealtimeNotification[] }>(
          '/api/notifications?limit=20&sort=-createdAt&depth=0',
        )

        if (cancelled) return
        setNotifications((response.docs ?? []).filter(Boolean))
      } catch (err: any) {
        if (cancelled) return
        setError(err.message || 'Failed to load notifications')
        setNotifications([])
      } finally {
        if (!cancelled) {
          setInitialLoading(false)
        }
      }
    }

    void loadInitialNotifications()

    return () => {
      cancelled = true
    }
  }, [hasHydrated, user?.id])

  useEffect(() => {
    if (!hasHydrated || !user?.id) {
      wsRef.current?.close()
      wsRef.current = null
      return
    }

    const ws = new WebSocket(getNotificationWsUrl(user?.id))
    wsRef.current = ws

    ws.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data as string) as NotificationSocketEvent | { type?: string }

        if (payload.type === 'notification.created' || payload.type === 'notification.updated') {
          const notificationPayload = payload as Extract<
            NotificationSocketEvent,
            { type: 'notification.created' | 'notification.updated' }
          >
          setNotifications((current) => upsertNotification(current, notificationPayload.notification))
          return
        }

        if (payload.type === 'notification.deleted') {
          const deletedPayload = payload as Extract<NotificationSocketEvent, { type: 'notification.deleted' }>
          setNotifications((current) =>
            current.filter((notification) => String(notification.id) !== String(deletedPayload.notificationId)),
          )
        }
      } catch {
        // ignore malformed socket payloads
      }
    })

    ws.addEventListener('close', () => {
      if (wsRef.current === ws) {
        wsRef.current = null
      }
    })

    return () => {
      ws.close()
      if (wsRef.current === ws) {
        wsRef.current = null
      }
    }
  }, [hasHydrated, user?.id])

  async function markAsRead(notificationId: number | string) {
    const nextReadAt = new Date().toISOString()
    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === String(notificationId)
          ? { ...notification, isRead: true, readAt: nextReadAt }
          : notification,
      ),
    )

    try {
      await apiClient.patch(`/api/notifications/${notificationId}`, {
        isRead: true,
        readAt: nextReadAt,
      })
    } catch {
      // optimistic update already applied
    }
  }

  async function deleteNotification(notificationId: number | string) {
    setNotifications((current) =>
      current.filter((notification) => String(notification.id) !== String(notificationId)),
    )

    try {
      await apiClient.delete(`/api/notifications/${notificationId}`)
    } catch {
      // optimistic update already applied
    }
  }

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
          <DrawerTitle className="sr-only">Notifications</DrawerTitle>
          <DrawerDescription className="sr-only">
            Real-time order, finance, and system updates
          </DrawerDescription>
          <div className="border-b border-zinc-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[2rem] font-bold tracking-tight text-[#12192f]">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Real-time order, finance, and system updates
                </p>
              </div>

              <DrawerClose asChild>
                <button className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-[#12192f] cursor-pointer">
                  <X size={20} />
                </button>
              </DrawerClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {initialLoading ? (
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
                  We&apos;ll show order, finance, and system updates here as soon as they happen.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const isUnread = !notification.isRead
                  const className = `block rounded-2xl border p-4 transition ${
                    isUnread
                      ? 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`

                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#12192f]">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">{notification.message}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isUnread && <span className="size-2 rounded-full bg-[#5151eb]" />}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              void deleteNotification(notification.id)
                            }}
                            className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
                            aria-label="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                        <span className="rounded-full bg-white px-2 py-0.5 font-medium uppercase tracking-wide text-zinc-500">
                          {notification.type || 'system'}
                        </span>
                        <span>{formatRelativeDate(notification.createdAt)}</span>
                      </div>
                    </>
                  )

                  if (notification.link) {
                    return (
                      <a
                        key={notification.id}
                        href={notification.link}
                        className={className}
                        onClick={() => {
                          if (isUnread) {
                            void markAsRead(notification.id)
                          }
                        }}
                      >
                        {content}
                      </a>
                    )
                  }

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        if (isUnread) {
                          void markAsRead(notification.id)
                        }
                      }}
                      className={`w-full text-left ${className}`}
                    >
                      {content}
                    </button>
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
