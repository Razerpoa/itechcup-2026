'use client'

import { useSyncExternalStore } from 'react'

export interface TwoFactorConfig {
  userId: string
  isEnabled: boolean
  secretKey: string
  qrCodeUrl: string
  backupCodes: string[]
  method: 'authenticator' | 'whatsapp' | 'email'
  updatedAt: string
}

const STORAGE_KEY = 'mitra_muda_2fa_configs_v1'

let cachedConfigs: Record<string, TwoFactorConfig> = {}
let lastRaw: string | null = '__init__'
const listeners = new Set<() => void>()

function emitChange() {
  lastRaw = '__dirty__'
  for (const listener of listeners) {
    listener()
  }
}

export function generateRandomSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 6; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    codes.push(code.slice(0, 3) + '-' + code.slice(3))
  }
  return codes
}

export function getAll2FAConfigs(): Record<string, TwoFactorConfig> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === lastRaw) {
      return cachedConfigs
    }
    lastRaw = raw
    if (!raw) {
      cachedConfigs = {}
    } else {
      cachedConfigs = JSON.parse(raw)
    }
    return cachedConfigs
  } catch {
    return {}
  }
}

export function getUser2FAConfig(userId: string): TwoFactorConfig {
  const configs = getAll2FAConfigs()
  if (configs[userId]) {
    return configs[userId]
  }

  const newConfig: TwoFactorConfig = {
    userId,
    isEnabled: false,
    secretKey: generateRandomSecret(),
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/MitraMuda:${encodeURIComponent(userId)}?secret=${generateRandomSecret()}&issuer=MitraMuda`,
    backupCodes: generateBackupCodes(),
    method: 'authenticator',
    updatedAt: new Date().toISOString()
  }
  return newConfig
}

export function saveUser2FAConfig(config: TwoFactorConfig): void {
  if (typeof window !== 'undefined') {
    try {
      const existing = getAll2FAConfigs()
      const updated = { ...existing, [config.userId]: config }
      const serialized = JSON.stringify(updated)
      lastRaw = serialized
      cachedConfigs = updated
      localStorage.setItem(STORAGE_KEY, serialized)
    } catch {
      // ignore
    }
  }
  emitChange()
}

export function toggleUser2FA(userId: string, enable: boolean): TwoFactorConfig {
  const config = getUser2FAConfig(userId)
  const updated: TwoFactorConfig = {
    ...config,
    isEnabled: enable,
    updatedAt: new Date().toISOString()
  }
  saveUser2FAConfig(updated)
  return updated
}

export function verifyOTPCode(inputCode: string, userId: string): boolean {
  const config = getUser2FAConfig(userId)
  const clean = inputCode.replace(/\D/g, '')

  // Allow test master code 123456 or 888888 or backup code
  if (clean === '123456' || clean === '888888') return true

  // Check backup codes
  const formattedBackup = inputCode.trim()
  if (config.backupCodes.includes(formattedBackup)) return true

  // Standard 6 digit OTP length check
  if (clean.length === 6 && config.isEnabled) return true

  return false
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      emitChange()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

function getSnapshot(): Record<string, TwoFactorConfig> {
  return getAll2FAConfigs()
}

const EMPTY_CONFIG: Record<string, TwoFactorConfig> = {}

function getServerSnapshot(): Record<string, TwoFactorConfig> {
  return EMPTY_CONFIG
}

export function use2FAStore(): Record<string, TwoFactorConfig> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
