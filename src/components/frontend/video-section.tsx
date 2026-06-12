'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Play, UserRound, X } from 'lucide-react'

type VideoItem = {
  title: string
  youtubeId: string
  postId?: number
  duration?: string | null
  category: string
  postHref?: string | null
  profileHref?: string | null
}

export type VideoHighlight = {
  youtubeId: string
  title: string
  authorName: string
  postId?: number
  authorId?: number
}

type Props = {
  highlights?: VideoHighlight[]
}

export function VideoSection({ highlights }: Props) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [grabbing, setGrabbing] = useState(false)
  const drag = useRef({ x: 0, left: 0, moved: false, tracking: false })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { x: e.pageX, left: el.scrollLeft, moved: false, tracking: true }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.tracking || !ref.current) return
    const dx = e.pageX - drag.current.x
    if (Math.abs(dx) > 4) {
      drag.current.moved = true
      if (!grabbing) setGrabbing(true)
    }
    if (drag.current.moved) {
      ref.current.scrollLeft = drag.current.left - dx
    }
  }

  const stopDrag = () => {
    drag.current.tracking = false
    setGrabbing(false)
  }

  const onItemClick = (e: React.MouseEvent, action: () => void) => {
    if (drag.current.moved) {
      e.preventDefault()
      return
    }
    action()
  }

  const videos: VideoItem[] =
    highlights && highlights.length > 0
      ? highlights.slice(0, 8).map((h) => ({
          youtubeId: h.youtubeId,
          title: h.title,
          postId: h.postId,
          category: h.authorName,
          duration: null,
          postHref:
            h.authorId && h.postId ? `/organizers/${h.authorId}?tab=feed&post=${h.postId}` : null,
          profileHref: h.authorId ? `/organizers/${h.authorId}` : null,
        }))
      : []

  if (videos.length === 0) return null

  return (
    <>
      <div
        ref={ref}
        className={`drag-scroll flex gap-4 overflow-x-auto pb-3 select-none ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {videos.map((video) => (
          <article
            key={video.postId ?? video.youtubeId}
            className="w-65 shrink-0 pb-3 text-left"
          >
            <div className="group relative aspect-video overflow-hidden rounded-lg bg-zinc-200">
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <button
                type="button"
                onClick={(e) => onItemClick(e, () => setActiveVideo(video.youtubeId))}
                className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 transition group-hover:bg-black/30"
                aria-label={`Play ${video.title}`}
              >
                <span className="sr-only">Play video</span>
                <span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-[#5151eb] shadow-md transition group-hover:scale-110">
                  <Play className="size-5 fill-current" />
                </span>
              </button>
              {(video.postHref || video.profileHref) && (
                <div className="absolute inset-x-2 bottom-2 z-20 flex flex-wrap items-center gap-2">
                  {video.postHref && (
                    <Link
                      href={video.postHref}
                      onClick={(e) => { if (drag.current.moved) e.preventDefault() }}
                      className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#5151eb] shadow-sm transition hover:bg-white"
                    >
                      <ExternalLink className="size-3" />
                      View post
                    </Link>
                  )}
                  {video.profileHref && (
                    <Link
                      href={video.profileHref}
                      onClick={(e) => { if (drag.current.moved) e.preventDefault() }}
                      className="inline-flex max-w-40 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-white hover:text-[#5151eb]"
                    >
                      <UserRound className="size-3 shrink-0" />
                      <span className="truncate">{video.category}</span>
                    </Link>
                  )}
                </div>
              )}
              {video.duration && (
                <span className="absolute right-2 top-2 z-20 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {video.duration}
                </span>
              )}
              {!video.profileHref && (
                <span className="absolute left-2 top-2 z-20 max-w-[75%] truncate rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                  {video.category}
                </span>
              )}
            </div>
            <div className="px-3">
              <p className="mt-2.5 line-clamp-1 text-base font-medium text-[#12192f]">
                {video.title}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute -right-2 -top-10 flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
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
