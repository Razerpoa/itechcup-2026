import type { DeviceType } from '../types'

export function normalizeDeviceType(value: string | null): DeviceType {
  if (value === 'mobile' || value === 'tablet' || value === 'desktop') {
    return value
  }
  return 'desktop'
}
