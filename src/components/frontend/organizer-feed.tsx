'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit3,
  Loader2,
  ExternalLink,
  Play,
  X,
} from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { extractYouTubeId } from '@/lib/youtube'
import { OrganizerCreatePost } from './organizer-create-post'
import { CommentsModal } from './comments-modal'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useAuthStore } from '@/stores/authStore'
import type { Media, User } from '@/payload-types'

interface Post {
  id: number
  content: string
  image?: Media | number | null
  link?: string | null
  linkTitle?: string | null
  author: { id: number; name: string; avatar?: Media | null } | number
  likesCount: number
  commentsCount: number
  likedBy?: { user: number | User }[] | null
  createdAt: string
  updatedAt: string
}

type Props = {
  organizerId: number
  isOwner: boolean
  avatarUrl?: string | null
  organizerName: string
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

function isEdited(createdAt: string, updatedAt: string): boolean {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000
}

function getPostShareUrl(organizerId: number, postId: number): string {
  const path = `/organizers/${organizerId}?tab=feed&post=${postId}`
  if (typeof window === 'undefined') return path

  return new URL(path, window.location.origin).toString()
}

async function sharePost(url: string, text: string) {
  if (navigator.share) {
    await navigator.share({
      title: 'Eventbro post',
      text,
      url,
    })
    return
  }

  await navigator.clipboard.writeText(url)
}

function PostCard({
  post,
  organizerId,
  organizerName,
  avatarUrl,
  isOwner,
  onDelete,
  onEdit,
  onLike,
  onOpenComments,
}: {
  post: Post
  organizerId: number
  organizerName: string
  avatarUrl?: string | null
  isOwner: boolean
  onDelete: (id: number) => void
  onEdit: (post: Post) => void
  onLike: (postId: number, liked: boolean) => void
  onOpenComments: (postId: number) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [activeYouTubeId, setActiveYouTubeId] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const { gate } = useAuthGate()
  const user = useAuthStore((s) => s.user)
  const postImageUrl = getMediaUrl(post.image)
  const youtubeId = post.link ? extractYouTubeId(post.link) : null
  const shareUrl = getPostShareUrl(organizerId, post.id)

  // Check if current user liked this post
  const isLiked =
    post.likedBy?.some((l) => {
      const likeUserId = typeof l.user === 'object' ? l.user.id : l.user
      return likeUserId === Number(user?.id)
    }) || false

  const initials = organizerName
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
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={organizerName}
                className="size-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-10 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[#12192f]">{organizerName}</p>
              <p className="text-xs text-zinc-400">
                {timeAgo(post.createdAt)}
                {isEdited(post.createdAt, post.updatedAt) && (
                  <span className="ml-1 text-zinc-400">(Edited)</span>
                )}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-zinc-100"
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
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
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
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
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

        {/* YouTube video preview */}
        {youtubeId && (
          <button
            type="button"
            onClick={() => setActiveYouTubeId(youtubeId)}
            className="group mt-3 block w-full text-left cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-200">
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                alt={post.linkTitle || 'YouTube video'}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                <div className="flex size-11 items-center justify-center rounded-full bg-white/90 text-[#5151eb] shadow-md transition group-hover:scale-110">
                  <Play className="size-5 fill-current" />
                </div>
              </div>
              <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                YouTube
              </span>
            </div>
            {post.linkTitle && (
              <p className="mt-2.5 line-clamp-1 text-base font-medium text-[#12192f] group-hover:text-[#5151eb]">
                {post.linkTitle}
              </p>
            )}
          </button>
        )}

        {/* Generic link preview */}
        {post.link && !youtubeId && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100"
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
            className={`flex cursor-pointer items-center gap-1.5 text-sm transition ${
              isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
            }`}
          >
            <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{(post.likesCount ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition hover:text-[#5151eb]"
          >
            <MessageCircle className="size-4" />
            <span>{post.commentsCount ?? 0} comments</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await sharePost(shareUrl, post.content.slice(0, 120))
                setShareCopied(true)
                window.setTimeout(() => setShareCopied(false), 1800)
              } catch {
                // User cancelled the native share dialog or clipboard access was denied.
              }
            }}
            className="ml-auto flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition hover:text-[#5151eb]"
            aria-label="Share post"
          >
            <Share2 className="size-4" />
            {shareCopied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* YouTube Player Modal */}
      {activeYouTubeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveYouTubeId(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveYouTubeId(null)}
              className="absolute -right-2 -top-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${activeYouTubeId}?autoplay=1`}
                aria-label="Video player"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Edit Post Modal
function EditPostModal({
  post,
  onClose,
  onSaved,
}: {
  post: Post
  onClose: () => void
  onSaved: () => void
}) {
  const [content, setContent] = useState(post.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    setError(null)

    try {
      await apiClient.patch(`/api/posts/${post.id}`, { content: content.trim() })
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-[#12192f]">Edit Post</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-zinc-100"
          >
            <span className="text-zinc-500 text-xl">&times;</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-[#12192f] placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20 outline-none transition"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function OrganizerFeed({ organizerId, isOwner, avatarUrl, organizerName }: Props) {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null)
  const [targetCommentId, setTargetCommentId] = useState<number | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const data = await apiClient.get<{ docs: Post[] }>(`/api/organizer/${organizerId}/posts`)
      setPosts(data.docs)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [organizerId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const postId = Number(searchParams.get('post'))
    const commentId = Number(searchParams.get('comment'))
    if (!postId || Number.isNaN(postId)) return

    window.requestAnimationFrame(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    if (!commentId || Number.isNaN(commentId)) return

    setActiveCommentsPostId(postId)
    setTargetCommentId(commentId)
  }, [posts, searchParams])

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

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Create post form (only for owner) */}
      {isOwner && (
        <OrganizerCreatePost
          onPostCreated={fetchPosts}
          avatarUrl={avatarUrl}
          organizerName={organizerName}
        />
      )}

      {/* Posts list */}
      {posts.length === 0 && !isOwner && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
          <MessageCircle className="size-10 text-zinc-300 mb-3" />
          <p className="text-base font-semibold text-zinc-400">No posts yet</p>
        </div>
      )}

      {posts.length === 0 && isOwner && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
          <MessageCircle className="size-10 text-zinc-300 mb-3" />
          <p className="text-base font-semibold text-zinc-400">
            Share your first update with followers
          </p>
        </div>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          id={`post-${post.id}`}
          className="scroll-mt-28"
        >
          <PostCard
            post={post}
            organizerId={organizerId}
            organizerName={organizerName}
            avatarUrl={avatarUrl}
            isOwner={isOwner}
            onDelete={handleDelete}
            onEdit={setEditingPost}
            onLike={handleLike}
            onOpenComments={(postId) => {
              setActiveCommentsPostId(postId)
              setTargetCommentId(null)
            }}
          />
        </div>
      ))}

      {/* Edit modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={fetchPosts}
        />
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
