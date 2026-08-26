export interface RateLimiterConfig {
  windowMs: number
  maxRequests: number
}

interface WindowEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store = new Map<string, WindowEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.maxRequests) return false

    entry.count++
    return true
  }

  getRetryAfterMs(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0
    const remaining = entry.resetAt - Date.now()
    return remaining > 0 ? remaining : 0
  }

  getRemainingRequests(key: string): number {
    const entry = this.store.get(key)
    if (!entry || Date.now() >= entry.resetAt) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }
}

export const ipRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 5 })
export const npsnRateLimiter = new RateLimiter({ windowMs: 900_000, maxRequests: 10 })
export const aiRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 12 })
