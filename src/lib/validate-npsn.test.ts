import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateNpsn } from './validate-npsn.ts'

describe('validateNpsn', () => {
  it('accepts valid 8-digit NPSN', () => {
    const result = validateNpsn('20106342')
    assert.equal(result.valid, true)
    assert.equal(result.normalized, '20106342')
  })

  it('trims whitespace from NPSN', () => {
    const result = validateNpsn('  20106342  ')
    assert.equal(result.valid, true)
    assert.equal(result.normalized, '20106342')
  })

  it('rejects non-numeric NPSN', () => {
    assert.equal(validateNpsn('ABCDEFGH').valid, false)
    assert.equal(validateNpsn('ABCDEFGH').errorCode, 'ERR_INVALID_NPSN_FORMAT')
  })

  it('rejects NPSN shorter than 8 digits', () => {
    assert.equal(validateNpsn('1234567').valid, false)
  })

  it('rejects NPSN longer than 8 digits', () => {
    assert.equal(validateNpsn('123456789').valid, false)
  })

  it('rejects empty NPSN', () => {
    assert.equal(validateNpsn('').valid, false)
  })

  it('rejects NPSN with letters mixed in', () => {
    assert.equal(validateNpsn('2010AB42').valid, false)
  })
})
