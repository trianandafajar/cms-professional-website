'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Loader2, Send, AtSign, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useAuthStore } from '@/stores/authStore'
import type { Media, User } from '@/payload-types'

interface Comment {
  id: number
  content: string
  author: User | number
  mentions?: { user: User | number }[] | null
  createdAt: string
}

interface CommentsResponse {
  docs: Comment[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
}

function getMediaUrl(media: unknown): string | null {
  if (media && typeof media === 'object' && 'url' in media) {
    return (media as Media).url ?? null
  }
  return null
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function renderContentWithMentions(content: string, mentions?: { user: User | number }[] | null) {
  if (!mentions || mentions.length === 0) {
    return <span>{content}</span>
  }

  // Build a map of usernames to user info
  const mentionMap = new Map<string, User>()
  mentions.forEach((m) => {
    if (typeof m.user === 'object' && m.user) {
      const username = m.user.instagram?.replace('@', '') || m.user.name
      mentionMap.set(username.toLowerCase(), m.user)
    }
  })

  // Split content by @mentions
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const regex = /@(\w+)/g
  let match
  let key = 0

  while ((match = regex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>)
    }

    // Add the mention
    const username = match[1].toLowerCase()
    const mentionedUser = mentionMap.get(username)
    const isEO = mentionedUser?.isOrganizer

    parts.push(
      <span
        key={key++}
        className={`font-medium ${isEO ? 'text-[#5151eb]' : 'text-blue-500'} hover:underline cursor-pointer`}
        title={mentionedUser?.name}
      >
        {match[0]}
      </span>,
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(<span key={key++}>{content.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}

export function CommentsModal({
  postId,
  onClose,
  onCommentAdded,
}: {
  postId: number
  onClose: () => void
  onCommentAdded?: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const { gate } = useAuthGate()
  const user = useAuthStore((s) => s.user)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const fetchComments = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const data = await apiClient.get<CommentsResponse>(
          `/api/post-comments/${postId}?page=${pageNum}&limit=20`,
          { timeout: 60000 },
        )
        if (append) {
          setComments((prev) => [...prev, ...data.docs])
        } else {
          setComments(data.docs)
        }
        setHasNextPage(data.hasNextPage)
        setPage(pageNum)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [postId],
  )

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  // Infinite scroll for comments
  useEffect(() => {
    if (!hasNextPage || loadingMore) return

    const options = {
      root: listRef.current,
      rootMargin: '50px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchComments(page + 1, true)
      }
    }, options)

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, loadingMore, page, fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const result = await apiClient.post<{ doc: Comment }>(
        `/api/post-comments/${postId}`,
        { content: newComment.trim() },
        { timeout: 60000 },
      )
      setComments((prev) => [result.doc, ...prev])
      setNewComment('')
      setShowMentions(false)
      onCommentAdded?.()
    } catch (err: any) {
      console.error('Failed to post comment:', err)
      alert(err?.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm('Delete this comment?')) return
    try {
      await apiClient.delete(`/api/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      alert('Failed to delete comment')
    }
  }

  function handleInputChange(value: string) {
    setNewComment(value)

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1)
      const hasSpace = textAfterAt.includes(' ')

      if (!hasSpace) {
        setShowMentions(true)
        setMentionQuery(textAfterAt.toLowerCase())
        setMentionPosition(lastAtIndex)
        return
      }
    }
    setShowMentions(false)
  }

  function insertMention(username: string) {
    const beforeMention = newComment.slice(0, mentionPosition)
    const afterMention = newComment.slice(
      newComment.indexOf('@', mentionPosition) + mentionQuery.length + 1,
    )
    setNewComment(`${beforeMention}@${username} ${afterMention}`)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  // Filter organizers for mention suggestions
  const suggestedOrganizers = comments
    .map((c) => (typeof c.author === 'object' ? c.author : null))
    .filter(Boolean)
    .filter((u) => u?.isOrganizer)
    .filter((u) => {
      if (!mentionQuery) return true
      return (
        u?.name?.toLowerCase().includes(mentionQuery) ||
        u?.instagram?.toLowerCase().includes(mentionQuery)
      )
    })
    .filter((u, i, arr) => arr.findIndex((x) => x?.id === u?.id) === i) // unique
    .slice(0, 5)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-[#12192f]">Comments</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 transition"
          >
            <X className="size-5 text-zinc-500" />
          </button>
        </div>

        {/* Comments List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-[#5151eb]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-zinc-400">No comments yet</p>
              <p className="text-xs text-zinc-400 mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const author = typeof comment.author === 'object' ? comment.author : null
              const authorName = author?.name || 'Unknown'
              const authorAvatar = getMediaUrl(author?.avatar)
              const isOwner = author?.id === user?.id
              const isAdmin = user?.roleName === 'admin'
              const canDelete = isOwner || isAdmin

              return (
                <div key={comment.id} className="flex gap-3">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="size-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold shrink-0">
                      {authorName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#12192f]">{authorName}</span>
                      {author?.isOrganizer && (
                        <span className="rounded bg-[#5151eb]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5151eb]">
                          EO
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-zinc-600 mt-0.5 whitespace-pre-wrap">
                      {renderContentWithMentions(comment.content, comment.mentions)}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })
          )}

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-2">
              {loadingMore && <Loader2 className="size-4 animate-spin text-[#5151eb]" />}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="border-t border-zinc-100 p-4 shrink-0">
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={newComment}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => {
                    const pos = inputRef.current?.selectionStart || newComment.length
                    setNewComment((prev) => prev.slice(0, pos) + '@' + prev.slice(pos))
                    setShowMentions(true)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2 bottom-2 p-1 text-zinc-400 hover:text-[#5151eb] transition"
                  title="Mention someone"
                >
                  <AtSign className="size-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center justify-center size-10 rounded-xl bg-[#5151eb] text-white hover:bg-[#4040d0] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 self-end"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>

            {/* Mention Suggestions */}
            {showMentions && suggestedOrganizers.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden">
                {suggestedOrganizers.map((organizer) => (
                  <button
                    key={organizer?.id}
                    type="button"
                    onClick={() =>
                      insertMention(organizer?.instagram?.replace('@', '') || organizer?.name || '')
                    }
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 transition"
                  >
                    {getMediaUrl(organizer?.avatar) ? (
                      <img
                        src={getMediaUrl(organizer?.avatar)!}
                        alt={organizer?.name || ''}
                        className="size-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-6 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold">
                        {(organizer?.name || '').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#12192f]">{organizer?.name}</p>
                      {organizer?.instagram && (
                        <p className="text-xs text-zinc-400">{organizer.instagram}</p>
                      )}
                    </div>
                    <span className="ml-auto text-[10px] font-semibold text-[#5151eb]">EO</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Use @ to mention event organizers. They will be notified.
          </p>
        </form>
      </div>
    </div>
  )
}
