/**
 * Check-in utility functions for QR code scanning and file validation.
 */

export interface ParseResult {
  valid: boolean
  ticketId: number | null
  error?: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

const CHECKIN_URL_PREFIX = 'https://eventbro.id/checkin/'
const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Parses a QR code URL and extracts the numeric ticket ID.
 *
 * Rules:
 * 1. Must start with `https://eventbro.id/checkin/`
 * 2. Extract path segment after `/checkin/`
 * 3. Strip trailing slash, query params, fragments
 * 4. Validate: numeric only, 1-15 digits
 * 5. Return parsed numeric ticketId
 */
export function parseCheckinUrl(data: string): ParseResult {
  if (!data || typeof data !== 'string') {
    return { valid: false, ticketId: null, error: 'Input is empty or not a string' }
  }

  if (!data.startsWith(CHECKIN_URL_PREFIX)) {
    return {
      valid: false,
      ticketId: null,
      error: 'URL does not start with https://eventbro.id/checkin/',
    }
  }

  // Extract everything after the prefix
  let segment = data.slice(CHECKIN_URL_PREFIX.length)

  // Strip URL fragment (#...)
  const hashIndex = segment.indexOf('#')
  if (hashIndex !== -1) {
    segment = segment.slice(0, hashIndex)
  }

  // Strip query parameters (?...)
  const queryIndex = segment.indexOf('?')
  if (queryIndex !== -1) {
    segment = segment.slice(0, queryIndex)
  }

  // Strip trailing slash
  if (segment.endsWith('/')) {
    segment = segment.slice(0, -1)
  }

  // Check if segment is empty
  if (segment.length === 0) {
    return { valid: false, ticketId: null, error: 'Ticket ID is missing from URL' }
  }

  // Validate: numeric only
  if (!/^\d+$/.test(segment)) {
    return { valid: false, ticketId: null, error: 'Ticket ID contains non-numeric characters' }
  }

  // Validate: 1-15 digits
  if (segment.length > 15) {
    return { valid: false, ticketId: null, error: 'Ticket ID exceeds 15 digits' }
  }

  // Convert to number (preserves leading-zero-free numeric equivalence)
  const ticketId = Number(segment)

  return { valid: true, ticketId }
}

/**
 * Validates an uploaded file for QR code scanning.
 * Accepts only PNG, JPG, and JPEG files up to 5MB.
 *
 * @param file - The File object to validate
 * @returns FileValidationResult indicating whether the file is valid
 */
export function validateFile(file: File): FileValidationResult {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a PNG, JPG, or JPEG file.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File exceeds 5MB limit.',
    }
  }

  return { valid: true }
}
