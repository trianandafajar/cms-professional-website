'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { CameraOff, Volume2, VolumeX } from 'lucide-react'
import { parseCheckinUrl } from '@/lib/checkin-utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraScannerProps {
  onScanResult: (data: string) => void
  isActive: boolean
}

// ─── Audio Utility ────────────────────────────────────────────────────────────

function playBeep() {
  try {
    const audioCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.15)

    // Clean up after the beep finishes
    setTimeout(() => {
      audioCtx.close()
    }, 200)
  } catch {
    // Audio not supported or blocked — silently ignore
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CameraScanner({ onScanResult, isActive }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScanRef = useRef<{ value: string; timestamp: number } | null>(null)

  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanFlash, setScanFlash] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [trackedQR, setTrackedQR] = useState<string | null>(null)

  const DEBOUNCE_MS = 800
  const SCANNER_ELEMENT_ID = 'camera-scanner-region'

  // ─── Debounce Check ───────────────────────────────────────────────────────

  const isDebouncedScan = useCallback((decodedText: string): boolean => {
    const now = Date.now()
    const lastScan = lastScanRef.current

    if (lastScan && lastScan.value === decodedText && now - lastScan.timestamp < DEBOUNCE_MS) {
      return true
    }

    lastScanRef.current = { value: decodedText, timestamp: now }
    return false
  }, [])

  // ─── Scan Success Handler ─────────────────────────────────────────────────

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      // Debounce: ignore the same QR code briefly while still allowing quick retries.
      if (isDebouncedScan(decodedText)) {
        return
      }

      // Validate URL format
      const parseResult = parseCheckinUrl(decodedText)
      if (!parseResult.valid) {
        // Still pass the raw data to parent for error handling
        onScanResult(decodedText)
        return
      }

      // Visual feedback: green flash
      setScanFlash(true)
      setTrackedQR(decodedText)
      setTimeout(() => setScanFlash(false), 600)
      setTimeout(() => {
        setTrackedQR((current) => (current === decodedText ? null : current))
      }, 2500)

      // Audio cue
      if (audioEnabled) {
        playBeep()
      }

      // Pass decoded data to parent
      onScanResult(decodedText)
    },
    [isDebouncedScan, onScanResult, audioEnabled],
  )

  // ─── Start Camera ─────────────────────────────────────────────────────────

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return

    setCameraError(null)

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
          disableFlip: false,
        },
        handleScanSuccess,
        // Error callback (called on each frame without QR) — ignore
        () => {},
      )

      setIsScanning(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (
        errorMessage.includes('NotAllowedError') ||
        errorMessage.includes('Permission') ||
        errorMessage.includes('denied')
      ) {
        setCameraError(
          'Camera access denied. Please check your browser settings or use file upload as an alternative.',
        )
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('no camera')) {
        setCameraError('No camera found on this device. Please use file upload to scan QR codes.')
      } else {
        setCameraError(`Unable to start camera: ${errorMessage}. Try using file upload instead.`)
      }

      setIsScanning(false)
    }
  }, [handleScanSuccess])

  // ─── Stop Camera ──────────────────────────────────────────────────────────

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (scanner) {
      try {
        const state = scanner.getState()
        // State 2 = SCANNING
        if (state === 2) {
          await scanner.stop()
        }
        scanner.clear()
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }, [])

  // ─── Lifecycle: Start/Stop based on isActive ──────────────────────────────

  useEffect(() => {
    if (isActive) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isActive) return null

  // Camera permission denied state
  if (cameraError) {
    return (
      <div className="relative rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <CameraOff size={40} className="text-red-400" />
          <p className="text-sm font-medium text-red-700">{cameraError}</p>
          <p className="text-xs text-red-500">
            Try using the file upload tab to scan QR code images instead.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Audio toggle */}
      <button
        type="button"
        onClick={() => setAudioEnabled(!audioEnabled)}
        className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        aria-label={audioEnabled ? 'Mute scan sound' : 'Enable scan sound'}
      >
        {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* Scanner container */}
      <div className="relative overflow-hidden rounded-xl bg-black">
        {/* Camera feed rendered by html5-qrcode */}
        <div ref={containerRef} id={SCANNER_ELEMENT_ID} className="relative min-h-[300px] w-full" />

        {/* Viewfinder overlay */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {/* Semi-transparent background */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Clear scanning area in center */}
            <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2">
              {/* Cut out the center */}
              <div className="absolute inset-0 rounded-lg border-2 border-white/80 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />

              {/* Corner markers */}
              <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-[#5151eb] rounded-tl-md" />
              <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-[#5151eb] rounded-tr-md" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-[#5151eb] rounded-bl-md" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-[#5151eb] rounded-br-md" />

              {/* Scanning line animation */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-[#5151eb]/60" />
            </div>

            {/* Instruction text */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-xs font-medium text-white/80">Position QR code within the frame</p>
            </div>
          </div>
        )}

        {/* Success flash overlay */}
        {scanFlash && (
          <div className="pointer-events-none absolute inset-0 z-20 animate-pulse rounded-xl bg-green-400/30" />
        )}
      </div>

      {/* Status indicator */}
      {isScanning && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-zinc-500">
            {trackedQR
              ? 'QR tracked - loading ticket data automatically'
              : 'Camera active - tracking QR codes automatically'}
          </span>
        </div>
      )}

      {/* Loading state when starting */}
      {isActive && !isScanning && !cameraError && (
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5151eb] border-t-transparent" />
          <span className="text-sm text-zinc-500">Starting camera...</span>
        </div>
      )}
    </div>
  )
}
