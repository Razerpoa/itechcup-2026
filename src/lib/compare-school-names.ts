import type { NameComparisonResult } from '@/types'

const SCHOOL_LEVELS = ['SD', 'SMP', 'SMA', 'SMK', 'SLB', 'MA', 'MTS', 'MI', 'SKB']

function extractSchoolLevel(name: string): string | null {
  const firstWord = name.split(' ')[0]
  for (const level of SCHOOL_LEVELS) {
    if (firstWord === level || firstWord === level + ' NEGERI') return level
  }
  return null
}

function cleanName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\bSMKN\b/g, 'SMK NEGERI')
    .replace(/\bSMAN\b/g, 'SMA NEGERI')
    .replace(/\bSMPN\b/g, 'SMP NEGERI')
    .replace(/\bSDN\b/g, 'SD NEGERI')
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function compareSchoolNames(userNormalized: string, officialName: string): NameComparisonResult {
  if (userNormalized === officialName) {
    return { match: 'EXACT' }
  }

  const cleanUser = cleanName(userNormalized)
  const cleanOfficial = cleanName(officialName)

  if (cleanUser === cleanOfficial) {
    return { match: 'MINOR' }
  }

  const userLevel = extractSchoolLevel(cleanUser)
  const officialLevel = extractSchoolLevel(cleanOfficial)

  if (userLevel && officialLevel && userLevel !== officialLevel) {
    return { match: 'CRITICAL' }
  }

  if (cleanUser.includes(cleanOfficial) || cleanOfficial.includes(cleanUser)) {
    return { match: 'MINOR' }
  }

  // Token similarity check
  const userTokens = cleanUser.split(' ')
  const officialTokens = cleanOfficial.split(' ')
  const commonTokens = userTokens.filter((t) => officialTokens.includes(t))

  if (commonTokens.length >= 2) {
    return { match: 'MINOR' }
  }

  // Substring abbreviation match (e.g. TASIK in TASIKMALAYA)
  const hasPartialTokenMatch = userTokens.some((u) =>
    u.length >= 4 && officialTokens.some((o) => o.startsWith(u) || u.startsWith(o))
  )

  if (hasPartialTokenMatch && (commonTokens.length >= 1 || userLevel === officialLevel)) {
    return { match: 'MINOR' }
  }

  return { match: 'CRITICAL' }
}
