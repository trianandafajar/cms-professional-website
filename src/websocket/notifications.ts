export type RealtimeNotification = {
  id: number | string
  recipient: number | string
  title: string
  message: string
  link?: string | null
  isRead?: boolean | null
  type?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type NotificationSocketEvent =
  | {
      type: 'notification.created'
      notification: RealtimeNotification
    }
  | {
      type: 'notification.updated'
      notification: RealtimeNotification
    }
  | {
      type: 'notification.deleted'
      notificationId: number | string
      recipientId: number | string
    }
  | {
      type: 'notification.snapshot'
      notifications: RealtimeNotification[]
    }
  | {
      type: 'notification.connected'
      userId: number | string
      notifications?: RealtimeNotification[]
    }

export function getNotificationWsUrl(userId?: number | string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL || 'ws://localhost:3001/notifications'
  if (!userId) {
    return baseUrl
  }

  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}userId=${encodeURIComponent(String(userId))}`
}

export function getNotificationWsServerUrl() {
  return process.env.NOTIFICATION_WS_SERVER_URL || 'http://localhost:3001'
}

export async function broadcastNotificationEvent(event: NotificationSocketEvent) {
  const secret = process.env.NOTIFICATION_WS_SECRET
  if (!secret) {
    return
  }

  try {
    await fetch(`${getNotificationWsServerUrl()}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notification-secret': secret,
      },
      body: JSON.stringify(event),
    })
  } catch {
    // best effort
  }
}
