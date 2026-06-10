'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, RotateCcw, X } from 'lucide-react'

type AvatarCropModalProps = {
  file: File | null
  open: boolean
  onClose: () => void
  onApply: (file: File, previewUrl: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const FRAME_SIZE = 288
const MIN_ZOOM = 1
const MAX_ZOOM = 3

export function AvatarCropModal({ file, open, onClose, onApply }: AvatarCropModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageReady, setImageReady] = useState(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  function clampOffset(nextOffset: { x: number; y: number }, nextZoom = zoom) {
    if (!imageSize) return { x: 0, y: 0 }

    const maxX = Math.max(0, (imageSize.width * nextZoom - FRAME_SIZE) / 2)
    const maxY = Math.max(0, (imageSize.height * nextZoom - FRAME_SIZE) / 2)

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    }
  }

  useEffect(() => {
    if (!file || !open) return

    const nextUrl = URL.createObjectURL(file)
    setImageUrl(nextUrl)
    setImageReady(false)
    setImageSize(null)
    setOffset({ x: 0, y: 0 })
    setZoom(1)

    return () => URL.revokeObjectURL(nextUrl)
  }, [file, open])

  const imageStyle = useMemo(
    () => ({
      transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
      width: imageSize ? `${imageSize.width}px` : 'auto',
      height: imageSize ? `${imageSize.height}px` : 'auto',
    }),
    [imageSize, offset.x, offset.y, zoom],
  )

  if (!open || !file || !imageUrl) return null

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: offset.x,
      y: offset.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    setOffset({
      ...clampOffset({
        x: drag.x + event.clientX - drag.startX,
        y: drag.y + event.clientY - drag.startY,
      }),
    })
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault()

    const nextZoom = clamp(zoom + (event.deltaY < 0 ? 0.08 : -0.08), MIN_ZOOM, MAX_ZOOM)
    setZoom(nextZoom)
    setOffset((current) => clampOffset(current, nextZoom))
  }

  async function handleApply() {
    const currentFile = file
    const image = imageRef.current
    if (!image || !currentFile) return

    const size = 512
    const frameSize = FRAME_SIZE
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, size, size)

    const baseScale = Math.max(frameSize / image.naturalWidth, frameSize / image.naturalHeight)
    const scale = baseScale * zoom
    const drawWidth = image.naturalWidth * scale
    const drawHeight = image.naturalHeight * scale
    const outputScale = size / frameSize
    const drawX = (frameSize - drawWidth) / 2 + offset.x
    const drawY = (frameSize - drawHeight) / 2 + offset.y

    context.drawImage(
      image,
      drawX * outputScale,
      drawY * outputScale,
      drawWidth * outputScale,
      drawHeight * outputScale,
    )

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
    })
    if (!blob) return

    const extension = currentFile.type === 'image/png' ? 'png' : 'jpg'
    const croppedFile = new File([blob], `avatar-${Date.now()}.${extension}`, {
      type: blob.type,
    })
    onApply(croppedFile, URL.createObjectURL(blob))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#12192f]">Adjust profile photo</h2>
            <p className="text-xs text-zinc-500">Drag the photo and zoom until it fits.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          <div
            className="relative mx-auto flex size-72 touch-none items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {!imageReady && <Loader2 className="size-6 animate-spin text-[#5151eb]" />}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Avatar preview"
              onLoad={(event) => {
                const image = event.currentTarget
                const frameSize = FRAME_SIZE
                const scale = Math.max(frameSize / image.naturalWidth, frameSize / image.naturalHeight)
                setImageSize({
                  width: image.naturalWidth * scale,
                  height: image.naturalHeight * scale,
                })
                setImageReady(true)
              }}
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none select-none"
              style={imageStyle}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/90" />
          </div>

          <div className="mt-5 space-y-2">
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              onChange={(event) => {
                const nextZoom = Number(event.target.value)
                setZoom(nextZoom)
                setOffset((current) => clampOffset(current, nextZoom))
              }}
              className="h-2 w-full accent-[#5151eb]"
            />
            <p className="text-center text-xs text-zinc-400">
              Scroll on the photo to zoom, then drag to reposition.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setOffset({ x: 0, y: 0 })
                setZoom(1)
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!imageReady}
                className="rounded-xl bg-[#5151eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d0] disabled:opacity-50"
              >
                Use photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
