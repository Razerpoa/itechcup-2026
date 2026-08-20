export interface NpsnValidationResult {
  valid: boolean
  normalized?: string
  error?: string
  errorCode?: string
}

const NPSN_REGEX = /^\d{8}$/

export function validateNpsn(input: string): NpsnValidationResult {
  const trimmed = input.trim()
  if (!NPSN_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'NPSN harus tepat 8 digit angka',
      errorCode: 'ERR_INVALID_NPSN_FORMAT',
    }
  }
  return { valid: true, normalized: trimmed }
}
