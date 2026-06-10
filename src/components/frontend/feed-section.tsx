'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit3,
  Loader2,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/apiClient'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useAuthStore } from '@/stores/authStore'
import { CommentsModal } from './comments-modal'
import type { Media, User } from '@/payload-types'

interface Post {
  id: number
  content: string
  image?: Media | number | null
  link?: string | null
  linkTitle?: string | null
  author: User | number
  likesCount: number
  commentsCount: number
  likedBy?: { user: number | User }[] | null
  createdAt: string
  updatedAt: string
}

interface PostsResponse {
  docs: Post[]
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

function PostCard({
  post,
  onDelete,
  onEdit,
  onLike,
  onOpenComments,
}: {
  post: Post
  onDelete: (id: number) => void
  onEdit: (post: Post) => void
  onLike: (postId: number, liked: boolean) => void
  onOpenComments: (postId: number) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const { gate } = useAuthGate()
  const user = useAuthStore((s) => s.user)
  const postImageUrl = getMediaUrl(post.image)

  const author = typeof post.author === 'object' ? post.author : null
  const authorName = author?.name || 'Unknown'
  const authorAvatar = getMediaUrl(author?.avatar)
  const authorId = author?.id

  // Check if current user liked this post
  const isLiked =
    post.likedBy?.some((l) => {
      const likeUserId = typeof l.user === 'object' ? l.user.id : l.user
      return likeUserId === Number(user?.id)
    }) || false

  // Check if current user owns this post
  const isOwner = authorId === Number(user?.id)

  const initials = authorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={authorId ? `/organizers/${authorId}` : '#'}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="size-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-10 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[#12192f]">{authorName}</p>
              <p className="text-xs text-zinc-400">{timeAgo(post.createdAt)}</p>
            </div>
          </Link>

          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 transition"
              >
                <MoreHorizontal className="size-4 text-zinc-400" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        onEdit(post)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition"
                    >
                      <Edit3 className="size-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        onDelete(post.id)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="mt-3 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image */}
        {postImageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img
              src={postImageUrl}
              alt="Post image"
              className="w-full object-cover max-h-96"
              loading="lazy"
            />
          </div>
        )}

        {/* Link Preview */}
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 hover:bg-zinc-100 transition"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5151eb]/10">
              <ExternalLink className="size-5 text-[#5151eb]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#12192f]">
                {post.linkTitle || post.link}
              </p>
              <p className="truncate text-xs text-zinc-400">{post.link}</p>
            </div>
          </a>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-5 border-t border-zinc-100 pt-3">
          <button
            type="button"
            onClick={gate(() => onLike(post.id, isLiked))}
            className={`flex items-center gap-1.5 text-sm transition ${
              isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
            }`}
          >
            <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{(post.likesCount ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#5151eb] transition"
          >
            <MessageCircle className="size-4" />
            <span>{post.commentsCount ?? 0} comments</span>
          </button>
          <button
            type="button"
            className="ml-auto flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#5151eb] transition"
          >
            <Share2 className="size-4" />
            Share
          </button>
        </div>
      </div>

    </>
  )
}

export function FeedSection() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null)
  const [targetCommentId, setTargetCommentId] = useState<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await apiClient.get<PostsResponse>(`/api/feed?page=${pageNum}&limit=10`)
      if (append) {
        setPosts((prev) => [...prev, ...data.docs])
      } else {
        setPosts(data.docs)
      }
      setHasNextPage(data.hasNextPage)
      setPage(pageNum)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  useEffect(() => {
    const postId = Number(searchParams.get('post'))
    const commentId = Number(searchParams.get('comment'))
    if (!postId || Number.isNaN(postId)) return

    setActiveCommentsPostId(postId)
    setTargetCommentId(commentId && !Number.isNaN(commentId) ? commentId : null)
  }, [searchParams])

  // Infinite scroll
  useEffect(() => {
    if (!hasNextPage || loadingMore) return

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPosts(page + 1, true)
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
  }, [hasNextPage, loadingMore, page, fetchPosts])

  async function handleDelete(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await apiClient.delete(`/api/organizer/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {
      alert('Failed to delete post')
    }
  }

  async function handleLike(postId: number, currentlyLiked: boolean) {
    try {
      const result = await apiClient.post<{ liked: boolean; likesCount: number }>(
        `/api/posts/${postId}/like`,
      )
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likesCount: result.likesCount, likedBy: result.liked ? [{ user: 1 }] : [] }
            : p,
        ),
      )
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#5151eb]" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
        <ImageIcon className="size-10 text-zinc-300 mb-3" />
        <p className="text-base font-semibold text-zinc-400">No posts yet</p>
        <p className="text-sm text-zinc-400 mt-1">Check back later for updates from organizers</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={handleDelete}
          onEdit={() => {
            // TODO: Implement edit modal
          }}
          onLike={handleLike}
          onOpenComments={(postId) => {
            setActiveCommentsPostId(postId)
            setTargetCommentId(null)
          }}
        />
      ))}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {loadingMore && <Loader2 className="size-5 animate-spin text-[#5151eb]" />}
        </div>
      )}
      {activeCommentsPostId && (
        <CommentsModal
          postId={activeCommentsPostId}
          targetCommentId={targetCommentId}
          onClose={() => {
            setActiveCommentsPostId(null)
            setTargetCommentId(null)
          }}
          onCommentAdded={() => {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === activeCommentsPostId
                  ? { ...post, commentsCount: (post.commentsCount ?? 0) + 1 }
                  : post,
              ),
            )
          }}
        />
      )}
    </div>
  )
}
