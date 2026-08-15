import type { DeviceType } from '../types'

export function normalizeDeviceType(value: string | null): DeviceType {
  if (value === 'mobile' || value === 'tablet' || value === 'desktop') {
    return value
  }
  return 'desktop'
}

export const TABLET_MIN_WIDTH = 768
export const DESKTOP_MIN_WIDTH = 1024

export function deviceTypeFromWidth(width: number): DeviceType {
  if (width >= DESKTOP_MIN_WIDTH) return 'desktop'
  if (width >= TABLET_MIN_WIDTH) return 'tablet'
  return 'mobile'
}
