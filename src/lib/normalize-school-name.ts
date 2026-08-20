import type { NormalizedNameResult } from '@/types.ts'

const ALLOWED_ROOTS = ['SD', 'SMP', 'SMA', 'SMK', 'SLB', 'MA', 'MTS', 'MI', 'SKB']

export function normalizeSchoolName(input: string): NormalizedNameResult {
  const trimmed = input.replace(/[\t \u00A0]+/g, ' ').trim()

  if (!trimmed) {
    return { normalized: '', error: 'Input kosong atau hanya spasi', errorCode: 'ERR_EMPTY_INPUT' }
  }

  if (/[^a-zA-Z0-9 .\-]/.test(trimmed)) {
    return { normalized: '', error: 'Karakter tidak valid', errorCode: 'ERR_INVALID_CHARACTERS' }
  }

  const upper = trimmed.toUpperCase()
  const stripped = upper.replace(/\./g, '')

  const spaceIdx = stripped.indexOf(' ')
  if (spaceIdx === -1) {
    return { normalized: '', error: 'Tidak ada spasi pemisah', errorCode: 'ERR_NO_SPACE' }
  }

  const firstWord = stripped.slice(0, spaceIdx)
  const rest = stripped.slice(spaceIdx + 1).trim()

  if (firstWord.length < 2) {
    return { normalized: '', error: 'Prefix terlalu pendek', errorCode: 'ERR_PREFIX_TOO_SHORT' }
  }

  if (!/^[A-Z]+$/.test(firstWord)) {
    return { normalized: '', error: 'Prefix mengandung angka atau simbol', errorCode: 'ERR_MALFORMED_PREFIX' }
  }

  let expandedFirst = firstWord
  if (firstWord.endsWith('N') && firstWord.length > 1) {
    const base = firstWord.slice(0, -1)
    if (ALLOWED_ROOTS.includes(base)) {
      expandedFirst = base + ' NEGERI'
    }
  }

  const nextToken = rest.split(' ')[0]
  if (expandedFirst.endsWith('NEGERI') && nextToken === 'NEGERI') {
    const restWithoutDuplicate = rest.replace(/^NEGERI\s+/, '')
    return { normalized: expandedFirst + ' ' + restWithoutDuplicate }
  }

  return { normalized: expandedFirst + (rest ? ' ' + rest : '') }
}
