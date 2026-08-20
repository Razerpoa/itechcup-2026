import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { compareSchoolNames } from './compare-school-names.ts'

describe('compareSchoolNames', () => {
  it('returns EXACT for identical strings', () => {
    assert.equal(compareSchoolNames('SMK NEGERI 2 TASIKMALAYA', 'SMK NEGERI 2 TASIKMALAYA').match, 'EXACT')
  })

  it('returns MINOR for extra/missing spaces', () => {
    assert.equal(compareSchoolNames('SMK  NEGERI 2 TASIKMALAYA', 'SMK NEGERI 2 TASIKMALAYA').match, 'MINOR')
  })

  it('returns MINOR for trailing/leading whitespace', () => {
    assert.equal(compareSchoolNames('  SMK NEGERI 2 TASIKMALAYA  ', 'SMK NEGERI 2 TASIKMALAYA').match, 'MINOR')
  })

  it('returns CRITICAL for different school level', () => {
    assert.equal(compareSchoolNames('SDN 1 BANDUNG', 'SMP NEGERI 133 JAKARTA').match, 'CRITICAL')
  })

  it('returns CRITICAL for completely different names', () => {
    assert.equal(compareSchoolNames('YAYASAN Kristen', 'SMK NEGERI 2 TASIKMALAYA').match, 'CRITICAL')
  })

  it('returns MINOR for minor abbreviation difference', () => {
    assert.equal(compareSchoolNames('SMK NEGERI 2 TASIK', 'SMK NEGERI 2 TASIKMALAYA').match, 'MINOR')
  })
})
