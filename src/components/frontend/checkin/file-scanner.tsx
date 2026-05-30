'use client'

import { useCallback, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Upload, FileImage, X, AlertCircle } from 'lucide-react'
import { validateFile, parseCheckinUrl } from '@/lib/checkin-utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileScannerProps {
  onScanResult: (data: string) => void
  isActive: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileScanner({ onScanResult, isActive }: FileScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(null)

  // ─── Process File ───────────────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      setPreview(null)

      // Validate file type and size before attempting decode
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid file.')
        return
      }

      // Show file preview
      const previewUrl = URL.createObjectURL(file)
      setPreview({ name: file.name, url: previewUrl })

      // Attempt QR decode
      setIsProcessing(true)
      try {
        const html5Qrcode = new Html5Qrcode('file-scanner-hidden-region')
        const decodedText = await html5Qrcode.scanFile(file, /* showImage= */ false)

        // Validate the decoded URL format
        const parseResult = parseCheckinUrl(decodedText)
        if (!parseResult.valid) {
          setError('This QR code is not a valid Eventbro ticket.')
          setIsProcessing(false)
          return
        }

        // Success — pass raw decoded data to parent
        onScanResult(decodedText)
      } catch {
        // html5-qrcode throws when no QR code is found in the image
        setError('No QR code found in the uploaded image.')
      } finally {
        setIsProcessing(false)
      }
    },
    [onScanResult],
  )

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  // ─── Click to Upload ───────────────────────────────────────────────────────

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [processFile],
  )

  // ─── Clear / Reset ─────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setError(null)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!isActive) return null

  return (
    <div className="relative space-y-4">
      {/* Hidden element required by html5-qrcode for file scanning */}
      <div id="file-scanner-hidden-region" className="hidden" />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? 'border-[#5151eb] bg-[#5151eb]/5'
            : 'border-zinc-300 bg-zinc-50 hover:border-[#5151eb]/50 hover:bg-zinc-100'
        }`}
      >
        <Upload size={36} className={`mb-3 ${isDragOver ? 'text-[#5151eb]' : 'text-zinc-400'}`} />
        <p className="text-sm font-medium text-zinc-700">
          {isDragOver ? 'Drop image here' : 'Drag & drop a QR code image'}
        </p>
        <p className="mt-1 text-xs text-zinc-400">or click to browse files</p>
        <p className="mt-2 text-xs text-zinc-400">PNG, JPG, JPEG — max 5MB</p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload QR code image"
        />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5151eb] border-t-transparent" />
          <span className="text-sm text-zinc-600">Scanning image for QR code...</span>
        </div>
      )}

      {/* File preview */}
      {preview && !isProcessing && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <FileImage size={20} className="text-zinc-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-700">{preview.name}</p>
            <p className="text-xs text-zinc-400">Uploaded image</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800"
            >
              Try another file
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
