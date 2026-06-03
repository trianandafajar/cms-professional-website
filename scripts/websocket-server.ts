import 'dotenv/config'

import { createServer } from 'http'
import { parse as parseUrl } from 'url'
import { WebSocketServer, type WebSocket } from 'ws'

import type {
  NotificationSocketEvent,
} from '../src/websocket/notifications'

type AuthedSocket = WebSocket & {
  userId?: string
  isAlive?: boolean
}

const port = Number(process.env.NOTIFICATION_WS_PORT ?? 3001)
const secret = process.env.NOTIFICATION_WS_SECRET ?? 'thissecreat'
const appServerUrl = String(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

const subscribers = new Map<string, Set<AuthedSocket>>()

function sendJson(socket: AuthedSocket, payloadValue: unknown) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(payloadValue))
  }
}

function addSubscriber(userId: string, socket: AuthedSocket) {
  const existing = subscribers.get(userId) ?? new Set<AuthedSocket>()
  existing.add(socket)
  subscribers.set(userId, existing)
}

function removeSubscriber(userId: string | undefined, socket: AuthedSocket) {
  if (!userId) return

  const existing = subscribers.get(userId)
  if (!existing) return

  existing.delete(socket)
  if (existing.size === 0) {
    subscribers.delete(userId)
  }
}

function broadcastToUser(userId: string, event: NotificationSocketEvent) {
  const sockets = subscribers.get(userId)
  if (!sockets || sockets.size === 0) return

  for (const socket of sockets) {
    sendJson(socket, event)
  }
}

function headersFromRequest(req: any) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(','))
    } else if (typeof value === 'string') {
      headers.set(key, value)
    }
  }
  return headers
}

async function fetchCurrentUser(req: any) {
  const cookie = String(req.headers.cookie ?? '')
  const queryUserId = String(new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).searchParams.get('userId') ?? '')
  if (!cookie && !queryUserId) return null

  try {
    const response = await fetch(`${appServerUrl}/api/me`, {
      method: 'GET',
      headers: {
        ...(cookie ? { cookie } : {}),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      if (queryUserId) {
        return { id: queryUserId }
      }
      return null
    }

    const body = (await response.json()) as { user?: any }
    return body.user ?? (queryUserId ? { id: queryUserId } : null)
  } catch {
    return queryUserId ? { id: queryUserId } : null
  }
}

function serializeNotification(doc: any): RealtimeNotification {
  const recipient = doc.recipient

  return {
    id: doc.id,
    recipient: typeof recipient === 'object' ? recipient?.id ?? '' : recipient,
    title: doc.title,
    message: doc.message,
    link: doc.link ?? null,
    isRead: doc.isRead ?? false,
    type: doc.type ?? 'system',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  if (req.method === 'POST' && url.pathname === '/broadcast') {
    const incomingSecret = String(req.headers['x-notification-secret'] ?? '')
    if (!secret || incomingSecret !== secret) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Forbidden' }))
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const event = JSON.parse(body) as NotificationSocketEvent
        if (event.type === 'notification.created' || event.type === 'notification.updated') {
          broadcastToUser(String(event.notification.recipient), event)
        } else if (event.type === 'notification.deleted') {
          broadcastToUser(String(event.recipientId), event)
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } catch (error: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error?.message ?? 'Invalid payload' }))
      }
    })

    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

const wss = new WebSocketServer({ noServer: true })

httpServer.on('upgrade', async (req, socket, head) => {
  const url = parseUrl(req.url ?? '', true)
  if (url.pathname !== '/notifications') {
    socket.destroy()
    return
  }

  try {
    const user = await fetchCurrentUser(req)
    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      const authedSocket = ws as AuthedSocket
      authedSocket.userId = String(user.id)
      authedSocket.isAlive = true

      addSubscriber(authedSocket.userId, authedSocket)
      sendJson(authedSocket, {
        type: 'notification.connected',
        userId: authedSocket.userId,
      })

      authedSocket.on('pong', () => {
        authedSocket.isAlive = true
      })

      authedSocket.on('close', () => {
        removeSubscriber(authedSocket.userId, authedSocket)
      })

      authedSocket.on('error', () => {
        removeSubscriber(authedSocket.userId, authedSocket)
      })
    })
  } catch (error) {
    console.warn('[websocket] failed to authenticate websocket client', error)
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
  }
})

const heartbeat = setInterval(() => {
  for (const sockets of subscribers.values()) {
    for (const socket of sockets) {
      const authedSocket = socket as AuthedSocket
      if (authedSocket.isAlive === false) {
        removeSubscriber(authedSocket.userId, authedSocket)
        authedSocket.terminate()
        continue
      }

      authedSocket.isAlive = false
      authedSocket.ping()
    }
  }
}, 30000)

httpServer.listen(port, () => {
  console.log(`[websocket] listening on http://localhost:${port}`)
})

process.on('SIGINT', () => {
  clearInterval(heartbeat)
  httpServer.close(() => process.exit(0))
})

process.on('SIGTERM', () => {
  clearInterval(heartbeat)
  httpServer.close(() => process.exit(0))
})
