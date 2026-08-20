import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSchoolName } from '../../../lib/normalize-school-name.ts'
import { compareSchoolNames } from '../../../lib/compare-school-names.ts'
import { validateNpsn } from '../../../lib/validate-npsn.ts'

describe('Registration pipeline integration', () => {
  it('normalizes then compares: exact match', () => {
    const { normalized } = normalizeSchoolName('Smkn 2 Tasikmalaya')
    const result = compareSchoolNames(normalized, 'SMK NEGERI 2 TASIKMALAYA')
    assert.equal(result.match, 'EXACT')
  })

  it('normalizes then compares: minor difference', () => {
    const { normalized } = normalizeSchoolName('SMPN 5 Bandung')
    const result = compareSchoolNames(normalized, 'SMP NEGERI 5 BANDUNG')
    assert.equal(result.match, 'EXACT')
  })

  it('normalizes then compares: critical mismatch', () => {
    const { normalized } = normalizeSchoolName('SDN 1 Bandung')
    const result = compareSchoolNames(normalized, 'SMP NEGERI 133 JAKARTA')
    assert.equal(result.match, 'CRITICAL')
  })

  it('validates NPSN then normalizes name: full happy path', () => {
    const npsn = validateNpsn('20106342')
    assert.equal(npsn.valid, true)

    const name = normalizeSchoolName('SMPN 133 Jakarta')
    assert.equal(name.error, undefined)

    const comparison = compareSchoolNames(name.normalized, 'SMP NEGERI 133 JAKARTA')
    assert.equal(comparison.match, 'EXACT')
  })

  it('rejects at NPSN validation stage', () => {
    const npsn = validateNpsn('123')
    assert.equal(npsn.valid, false)
    assert.equal(npsn.errorCode, 'ERR_INVALID_NPSN_FORMAT')
  })

  it('rejects at name normalization stage', () => {
    const name = normalizeSchoolName('')
    assert.equal(name.errorCode, 'ERR_EMPTY_INPUT')
  })
})
