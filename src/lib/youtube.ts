/**
 * Extracts the YouTube video ID from any YouTube URL format.
 * Works with www/m/music subdomains and any combination of query params.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return null

  // ?v=ID or &v=ID  — covers all watch URLs regardless of other params
  const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,20})/)
  if (vMatch?.[1]) return vMatch[1]

  // youtu.be/ID short links
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,20})/)
  if (shortMatch?.[1]) return shortMatch[1]

  // /shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,20})/)
  if (shortsMatch?.[1]) return shortsMatch[1]

  // /embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,20})/)
  if (embedMatch?.[1]) return embedMatch[1]

  return null
}
