import type { NameComparisonResult } from '@/types.ts'

const SCHOOL_LEVELS = ['SD', 'SMP', 'SMA', 'SMK', 'SLB', 'MA', 'MTS', 'MI', 'SKB']

function extractSchoolLevel(name: string): string | null {
  const firstWord = name.split(' ')[0]
  for (const level of SCHOOL_LEVELS) {
    if (firstWord === level || firstWord === level + ' NEGERI') return level
  }
  return null
}

export function compareSchoolNames(userNormalized: string, officialName: string): NameComparisonResult {
  if (userNormalized === officialName) {
    return { match: 'EXACT' }
  }

  const collapsedUser = userNormalized.replace(/\s+/g, ' ').trim()
  const collapsedOfficial = officialName.replace(/\s+/g, ' ').trim()

  if (collapsedUser === collapsedOfficial) {
    return { match: 'MINOR' }
  }

  if (collapsedUser.startsWith(collapsedOfficial) || collapsedOfficial.startsWith(collapsedUser)) {
    return { match: 'MINOR' }
  }

  const userLevel = extractSchoolLevel(collapsedUser)
  const officialLevel = extractSchoolLevel(collapsedOfficial)

  if (userLevel && officialLevel && userLevel !== officialLevel) {
    return { match: 'CRITICAL' }
  }

  if (!userLevel && !officialLevel) {
    return collapsedUser.length > 0 && collapsedOfficial.length > 0 ? { match: 'MINOR' } : { match: 'CRITICAL' }
  }

  return { match: 'CRITICAL' }
}
