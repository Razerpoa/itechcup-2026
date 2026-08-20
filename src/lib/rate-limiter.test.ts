import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { RateLimiter } from './rate-limiter.ts'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 })
  })

  it('allows requests within limit', () => {
    assert.equal(limiter.isAllowed('a'), true)
    assert.equal(limiter.isAllowed('a'), true)
    assert.equal(limiter.isAllowed('a'), true)
  })

  it('blocks requests over limit', () => {
    limiter.isAllowed('a')
    limiter.isAllowed('a')
    limiter.isAllowed('a')
    assert.equal(limiter.isAllowed('a'), false)
  })

  it('tracks different keys independently', () => {
    limiter.isAllowed('a')
    limiter.isAllowed('a')
    limiter.isAllowed('a')
    assert.equal(limiter.isAllowed('b'), true)
  })

  it('returns time until reset', () => {
    limiter.isAllowed('a')
    const remaining = limiter.getRetryAfterMs('a')
    assert.ok(remaining > 0)
    assert.ok(remaining <= 1000)
  })

  it('reports remaining requests correctly', () => {
    assert.equal(limiter.getRemainingRequests('a'), 3)
    limiter.isAllowed('a')
    assert.equal(limiter.getRemainingRequests('a'), 2)
    limiter.isAllowed('a')
    limiter.isAllowed('a')
    assert.equal(limiter.getRemainingRequests('a'), 0)
  })
})