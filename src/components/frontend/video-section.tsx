'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

type VideoItem = {
  title: string
  youtubeId: string
  duration: string
  category: string
}

const videos: VideoItem[] = [
  {
    title: 'Ed Sheeran - Perfect (Official Video)',
    youtubeId: '2Vv-BfVoq4g',
    duration: '4:40',
    category: 'Music',
  },
  {
    title: 'Inside The Worlds Biggest Food Festival',
    youtubeId: 'Q1lL-hXO27Q',
    duration: '12:18',
    category: 'Food & Drink',
  },
  {
    title: 'Can AI Really Help You Be More Creative?',
    youtubeId: '5p248yoa3oE',
    duration: '9:35',
    category: 'Conference',
  },
  {
    title: 'Coldplay - A Sky Full Of Stars (Live)',
    youtubeId: 'VPRjCeoBqrI',
    duration: '4:28',
    category: 'Concert',
  },
]

export function VideoSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return (
    <>
      <div className="destinations-scroll flex gap-4 overflow-x-auto scroll-smooth pb-3">
        {videos.map((video) => (
          <button
            key={video.youtubeId}
            type="button"
            onClick={() => setActiveVideo(video.youtubeId)}
            className="group min-w-[260px] shrink-0 text-left sm:min-w-[280px]"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-200">
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                <div className="flex size-11 items-center justify-center rounded-full bg-white/90 text-[#5151eb] shadow-md transition group-hover:scale-110">
                  <Play className="size-5 fill-current" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {video.duration}
              </span>
              <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                {video.category}
              </span>
            </div>
            <p className="mt-2.5 line-clamp-1 text-base font-medium text-[#12192f] group-hover:text-[#5151eb]">
              {video.title}
            </p>
          </button>
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
                title="Video player"
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
