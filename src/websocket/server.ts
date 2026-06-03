export const websocketNamespaces = {
  notifications: '/notifications',
} as const

export type WebsocketNamespace = (typeof websocketNamespaces)[keyof typeof websocketNamespaces]

export { broadcastNotificationEvent, getNotificationWsServerUrl } from './notifications'
