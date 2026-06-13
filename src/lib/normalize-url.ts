export function normalizeUrlString(value: string | null | undefined): string | null {
  if (!value) return null

  const normalized = String(value).replace(/[\r\n\t]+/g, '').trim()
  return normalized || null
}

