'use client'

import { useSyncExternalStore } from 'react'
import type { DeviceType } from '../types'
import { DESKTOP_MIN_WIDTH, TABLET_MIN_WIDTH } from '../lib/device'

const desktopQuery = `(min-width: ${DESKTOP_MIN_WIDTH}px)`
const tabletQuery = `(min-width: ${TABLET_MIN_WIDTH}px)`

export function getViewportDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(desktopQuery).matches) return 'desktop'
  if (window.matchMedia(tabletQuery).matches) return 'tablet'
  return 'mobile'
}

export function subscribeToViewport(onStoreChange: () => void): () => void {
  const queries = [desktopQuery, tabletQuery]
  const mqls = queries.map((query) => window.matchMedia(query))
  for (const mql of mqls) {
    mql.addEventListener('change', onStoreChange)
  }
  return () => {
    for (const mql of mqls) {
      mql.removeEventListener('change', onStoreChange)
    }
  }
}

export function useLiveDeviceType(initialDeviceType: DeviceType): DeviceType {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewportDeviceType,
    () => initialDeviceType,
  )
}
