'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Loader2, Send, AtSign, CornerDownRight } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/apiClient'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useAuthStore } from '@/stores/authStore'
import type { Media, User } from '@/payload-types'

interface Comment {
  id: number
  content: string
  author: User | number
  parent?: Comment | number | null
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

function getMentionHandle(user?: User | null) {
  const raw = user?.instagram?.replace('@', '') || user?.name || ''
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getUserId(user?: User | null) {
  if (!user?.id) return null
  return Number(user.id)
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

function renderContentWithMentions(
  content: string,
  mentions?: { user: User | number }[] | null,
  knownUsers: User[] = [],
) {
  // Build a map of usernames to user info
  const mentionMap = new Map<string, User>()
  knownUsers.forEach((user) => {
    const handle = getMentionHandle(user)
    if (handle) mentionMap.set(handle, user)
  })
  mentions?.forEach((m) => {
    if (typeof m.user === 'object' && m.user) {
      const handle = getMentionHandle(m.user)
      if (handle) mentionMap.set(handle, m.user)
    }
  })

  // Split content by @mentions
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const regex = /@([a-zA-Z0-9_.-]+)/g
  let match
  let key = 0

  while ((match = regex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>)
    }

    // Add the mention
    const username = match[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    const mentionedUser = mentionMap.get(username)
    const isEO = mentionedUser?.isOrganizer

    const mentionedUserId = getUserId(mentionedUser)

    if (isEO && mentionedUserId) {
      parts.push(
        <Link
          key={key++}
          href={`/organizers/${mentionedUserId}`}
          className="font-medium text-[#5151eb] hover:underline"
          aria-label={mentionedUser?.name ? `Open ${mentionedUser.name}` : undefined}
        >
          {match[0]}
        </Link>,
      )
    } else {
      parts.push(
        <span key={key++} className="font-medium text-blue-500">
          {match[0]}
        </span>,
      )
    }

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
  targetCommentId,
}: {
  postId: number
  onClose: () => void
  onCommentAdded?: () => void
  targetCommentId?: number | null
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const [selectedMentionIds, setSelectedMentionIds] = useState<Record<string, number>>({})
  const { gate } = useAuthGate()
  const user = useAuthStore((s) => s.user)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const targetCommentRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!targetCommentId || loading) return

    const timer = window.setTimeout(() => {
      targetCommentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [loading, targetCommentId, comments])

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
        {
          content: newComment.trim(),
          parent: replyingTo?.id,
          mentions: Object.entries(selectedMentionIds)
            .filter(([handle]) => newComment.includes(`@${handle}`))
            .map(([, id]) => id),
        },
        { timeout: 60000 },
      )
      setComments((prev) => [result.doc, ...prev])
      setNewComment('')
      setReplyingTo(null)
      setSelectedMentionIds({})
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

  function insertMention(mentionedUser: User) {
    const username = getMentionHandle(mentionedUser)
    if (!username) return

    const beforeMention = newComment.slice(0, mentionPosition)
    const afterMention = newComment.slice(
      newComment.indexOf('@', mentionPosition) + mentionQuery.length + 1,
    )
    setNewComment(`${beforeMention}@${username} ${afterMention}`)
    setSelectedMentionIds((current) => ({
      ...current,
      [username]: Number(mentionedUser.id),
    }))
    setShowMentions(false)
    inputRef.current?.focus()
  }

  function startReply(comment: Comment) {
    const author = typeof comment.author === 'object' ? comment.author : null
    const username = getMentionHandle(author)
    setReplyingTo(comment)
    setNewComment(username ? `@${username} ` : '')
    if (author && username) {
      setSelectedMentionIds((current) => ({
        ...current,
        [username]: Number(author.id),
      }))
    }
    inputRef.current?.focus()
  }

  function getParentId(comment: Comment) {
    if (!comment.parent) return null
    return typeof comment.parent === 'object' ? comment.parent.id : comment.parent
  }

  const repliesByParent = comments.reduce<Map<number, Comment[]>>((map, comment) => {
    const parentId = getParentId(comment)
    if (!parentId) return map
    const replies = map.get(parentId) ?? []
    replies.push(comment)
    map.set(parentId, replies)
    return map
  }, new Map())

  const topLevelComments = comments.filter((comment) => !getParentId(comment))
  const knownUsers = comments
    .map((comment) => (typeof comment.author === 'object' ? comment.author : null))
    .filter((author): author is User => Boolean(author))

  function renderComment(comment: Comment, isReply = false) {
    const author = typeof comment.author === 'object' ? comment.author : null
    const authorName = author?.name || 'Unknown'
    const authorAvatar = getMediaUrl(author?.avatar)
    const replies = repliesByParent.get(comment.id) ?? []
    const isTarget = targetCommentId === comment.id
    const authorId = getUserId(author)
    const authorProfile = author?.isOrganizer && authorId ? `/organizers/${authorId}` : null
    const avatarNode = authorAvatar ? (
      <img
        src={authorAvatar}
        alt={authorName}
        className="size-8 rounded-full object-cover shrink-0"
      />
    ) : (
      <div className="size-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold shrink-0">
        {authorName.slice(0, 2).toUpperCase()}
      </div>
    )
    const nameNode = <span className="text-sm font-semibold text-[#12192f]">{authorName}</span>

    return (
      <div key={comment.id}>
        <div className={isReply ? 'relative ml-8 pl-5' : ''}>
          {isReply && (
            <div className="absolute left-0 top-0 h-7 w-4 rounded-bl-xl border-b border-l border-zinc-200" />
          )}
          <div
            ref={isTarget ? targetCommentRef : undefined}
            className={`flex gap-3 rounded-xl p-2 transition ${
              isTarget ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20' : ''
            }`}
          >
            {authorProfile ? (
              <Link href={authorProfile} className="shrink-0 hover:opacity-80">
                {avatarNode}
              </Link>
            ) : (
              avatarNode
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {authorProfile ? (
                  <Link href={authorProfile} className="hover:underline">
                    {nameNode}
                  </Link>
                ) : (
                  nameNode
                )}
                {author?.isOrganizer && (
                  <span className="rounded bg-[#5151eb]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5151eb]">
                    EO
                  </span>
                )}
                <span className="text-xs text-zinc-400">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-600 mt-0.5 whitespace-pre-wrap">
                {renderContentWithMentions(comment.content, comment.mentions, knownUsers)}
              </p>
              <button
                type="button"
                onClick={() => startReply(comment)}
                className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-[#5151eb]"
              >
                <CornerDownRight className="size-3" />
                Reply
              </button>
            </div>
          </div>
        </div>
        {replies
          .slice()
          .reverse()
          .map((reply) => renderComment(reply, true))}
      </div>
    )
  }

  // Filter visible commenters for mention suggestions
  const suggestedUsers = comments
    .map((c) => (typeof c.author === 'object' ? c.author : null))
    .filter((author): author is User => Boolean(author))
    .filter((u) => {
      if (!mentionQuery) return true
      const handle = getMentionHandle(u)
      return (
        u?.name?.toLowerCase().includes(mentionQuery) ||
        u?.instagram?.toLowerCase().includes(mentionQuery) ||
        handle.includes(mentionQuery)
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
            className="flex size-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-zinc-100"
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
            topLevelComments.map((comment) => renderComment(comment))
          )}

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-2">
              {loadingMore && <Loader2 className="size-4 animate-spin text-[#5151eb]" />}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={gate(handleSubmit)} className="border-t border-zinc-100 p-4 shrink-0">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs text-[#5151eb]">
              <span>
                Replying to{' '}
                <strong>
                  {typeof replyingTo.author === 'object' ? replyingTo.author.name : 'comment'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                  setSelectedMentionIds({})
                }}
                className="cursor-pointer font-semibold hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
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
                  className="absolute bottom-2 right-2 cursor-pointer p-1 text-zinc-400 transition hover:text-[#5151eb]"
                  aria-label="Mention someone"
                >
                  <AtSign className="size-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center self-end rounded-xl bg-[#5151eb] text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>

            {/* Mention Suggestions */}
            {showMentions && suggestedUsers.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden">
                {suggestedUsers.map((organizer) => (
                  <button
                    key={organizer?.id}
                    type="button"
                    onClick={() => insertMention(organizer)}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-50"
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
                    {organizer?.isOrganizer && (
                      <span className="ml-auto text-[10px] font-semibold text-[#5151eb]">EO</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Use @ to mention users. They will be notified.
          </p>
        </form>
      </div>
    </div>
  )
}
