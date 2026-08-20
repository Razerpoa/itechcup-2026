import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSchoolName } from './normalize-school-name.ts'

describe('normalizeSchoolName', () => {
  it('expands SMKN to SMK NEGERI', () => {
    const result = normalizeSchoolName('Smkn 2 Tasikmalaya')
    assert.equal(result.normalized, 'SMK NEGERI 2 TASIKMALAYA')
    assert.equal(result.error, undefined)
  })

  it('expands SMAN to SMA NEGERI', () => {
    const result = normalizeSchoolName('Sman 1 Bandung')
    assert.equal(result.normalized, 'SMA NEGERI 1 BANDUNG')
  })

  it('expands SDN to SD NEGERI', () => {
    const result = normalizeSchoolName('SDN 5 Jakarta')
    assert.equal(result.normalized, 'SD NEGERI 5 JAKARTA')
  })

  it('expands SMPN to SMP NEGERI', () => {
    const result = normalizeSchoolName('SMPN 10 Surabaya')
    assert.equal(result.normalized, 'SMP NEGERI 10 SURABAYA')
  })

  it('expands SLBN to SLB NEGERI', () => {
    const result = normalizeSchoolName('SLBN 1 Bandung')
    assert.equal(result.normalized, 'SLB NEGERI 1 BANDUNG')
  })

  it('keeps SMK without N suffix intact', () => {
    const result = normalizeSchoolName('Smk Ypc Singaparna')
    assert.equal(result.normalized, 'SMK YPC SINGAPARNA')
  })

  it('keeps non-state acronyms like YASPEN intact', () => {
    const result = normalizeSchoolName('Yaspen 1 Tasik')
    assert.equal(result.normalized, 'YASPEN 1 TASIK')
  })

  it('keeps CHRISTIAN intact', () => {
    const result = normalizeSchoolName('Christian 1 Jakarta')
    assert.equal(result.normalized, 'CHRISTIAN 1 JAKARTA')
  })

  it('strips dots from acronyms', () => {
    const result = normalizeSchoolName('S.M.K.N. 3 Bogor')
    assert.equal(result.normalized, 'SMK NEGERI 3 BOGOR')
  })

  it('auto-corrects redundant NEGERI', () => {
    const result = normalizeSchoolName('SMKN NEGERI 1 Bandung')
    assert.equal(result.normalized, 'SMK NEGERI 1 BANDUNG')
  })

  it('rejects empty input', () => {
    const result = normalizeSchoolName('')
    assert.equal(result.errorCode, 'ERR_EMPTY_INPUT')
  })

  it('rejects whitespace-only input', () => {
    const result = normalizeSchoolName('   ')
    assert.equal(result.errorCode, 'ERR_EMPTY_INPUT')
  })

  it('rejects missing space delimiter', () => {
    const result = normalizeSchoolName('SMKN2TASIKMALAYA')
    assert.equal(result.errorCode, 'ERR_NO_SPACE')
  })

  it('rejects prefix shorter than 2 chars', () => {
    const result = normalizeSchoolName('N 2 BANDUNG')
    assert.equal(result.errorCode, 'ERR_PREFIX_TOO_SHORT')
  })

  it('rejects numbers attached to acronym', () => {
    const result = normalizeSchoolName('SMKN2 TASIK')
    assert.equal(result.errorCode, 'ERR_MALFORMED_PREFIX')
  })

  it('rejects special characters', () => {
    const result = normalizeSchoolName('SMK @NEGERI 1!')
    assert.equal(result.errorCode, 'ERR_INVALID_CHARACTERS')
  })
})
