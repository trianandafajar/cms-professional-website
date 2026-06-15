'use client'

import type { DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

type DragState = {
  pointerId: number | null
  startX: number
  startY: number
  startLeft: number
  moved: boolean
  lastX: number
  lastTime: number
  velocityX: number
}

type UseDragScrollOptions = {
  threshold?: number
}

export function useDragScroll(options: UseDragScrollOptions = {}) {
  const { threshold = 6 } = options
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
    moved: false,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
  })
  const [grabbing, setGrabbing] = useState(false)
  const momentumFrame = useRef<number | null>(null)

  const lockSelection = () => {
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  const unlockSelection = () => {
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
  }

  const stopMomentum = () => {
    if (momentumFrame.current != null) {
      cancelAnimationFrame(momentumFrame.current)
      momentumFrame.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopMomentum()
      unlockSelection()
    }
  }, [])

  const startMomentum = (initialVelocity: number) => {
    const el = ref.current
    if (!el || Math.abs(initialVelocity) < 0.05) return

    stopMomentum()

    let velocity = initialVelocity

    const step = () => {
      const target = ref.current
      if (!target) {
        stopMomentum()
        return
      }

      velocity *= 0.92
      target.scrollLeft -= velocity * 18

      if (Math.abs(velocity) < 0.05) {
        stopMomentum()
        return
      }

      momentumFrame.current = requestAnimationFrame(step)
    }

    momentumFrame.current = requestAnimationFrame(step)
  }

  const stopDrag = () => {
    drag.current.pointerId = null
    if (ref.current) {
      ref.current.style.scrollBehavior = ''
    }
    unlockSelection()
    setGrabbing(false)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const el = ref.current
    if (!el) return

    stopMomentum()

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: el.scrollLeft,
      moved: false,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
    }

    el.setPointerCapture(event.pointerId)
    el.style.scrollBehavior = 'auto'
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || drag.current.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.current.startX
    const dy = event.clientY - drag.current.startY

    if (!drag.current.moved && Math.abs(dx) <= Math.abs(dy)) return

    if (!drag.current.moved && Math.abs(dx) > threshold) {
      drag.current.moved = true
      lockSelection()
      window.getSelection()?.removeAllRanges()
      setGrabbing(true)
    }

    if (!drag.current.moved) return

    const now = performance.now()
    const elapsed = Math.max(1, now - drag.current.lastTime)
    drag.current.velocityX = (event.clientX - drag.current.lastX) / elapsed
    drag.current.lastX = event.clientX
    drag.current.lastTime = now

    event.preventDefault()
    el.scrollLeft = drag.current.startLeft - dx
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (ref.current?.hasPointerCapture(event.pointerId)) {
      ref.current.releasePointerCapture(event.pointerId)
    }
    const momentumVelocity = drag.current.moved ? drag.current.velocityX : 0
    stopDrag()
    startMomentum(momentumVelocity)
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (ref.current?.hasPointerCapture(event.pointerId)) {
      ref.current.releasePointerCapture(event.pointerId)
    }
    stopDrag()
  }

  const onDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return

    event.preventDefault()
    event.stopPropagation()
  }

  return {
    ref,
    grabbing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onDragStart,
    onClickCapture,
  }
}
