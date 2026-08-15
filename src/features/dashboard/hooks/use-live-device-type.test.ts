import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { getViewportDeviceType, subscribeToViewport, useLiveDeviceType } from './use-live-device-type.ts'
import type { DeviceType } from '../types'

type MediaQueryListener = () => void

interface FakeMql {
  matches: boolean
  media: string
  addEventListener: (type: string, cb: MediaQueryListener) => void
  removeEventListener: (type: string, cb: MediaQueryListener) => void
}

interface MatchMediaHarness {
  setWidth: (width: number) => void
  listeners: Map<string, Set<MediaQueryListener>>
}

function installMatchMedia(): MatchMediaHarness {
  let width = 320
  const listeners = new Map<string, Set<MediaQueryListener>>()
  const matchMedia = (query: string): FakeMql => {
    const minMatch = /\(min-width: (\d+)px\)/.exec(query)
    const min = minMatch ? Number(minMatch[1]) : Infinity
    return {
      get matches() {
        return width >= min
      },
      media: query,
      addEventListener(_type: string, cb: MediaQueryListener) {
        listeners.set(query, (listeners.get(query) ?? new Set()).add(cb))
      },
      removeEventListener(_type: string, cb: MediaQueryListener) {
        listeners.get(query)?.delete(cb)
      },
    }
  }
  globalThis.window = { matchMedia } as unknown as Window & typeof globalThis
  return {
    setWidth(w: number) {
      width = w
    },
    listeners,
  }
}

test('getViewportDeviceType returns mobile below 768px', () => {
  installMatchMedia()
  assert.equal(getViewportDeviceType(), 'mobile')
})

test('getViewportDeviceType returns tablet at 768-1023px', () => {
  const h = installMatchMedia()
  h.setWidth(768)
  assert.equal(getViewportDeviceType(), 'tablet')
  h.setWidth(1023)
  assert.equal(getViewportDeviceType(), 'tablet')
})

test('getViewportDeviceType returns desktop at 1024px and above', () => {
  const h = installMatchMedia()
  h.setWidth(1024)
  assert.equal(getViewportDeviceType(), 'desktop')
  h.setWidth(1920)
  assert.equal(getViewportDeviceType(), 'desktop')
})

test('subscribeToViewport registers change listeners on the media queries', () => {
  const h = installMatchMedia()
  const cb = () => {}
  const unsubscribe = subscribeToViewport(cb)
  const registered = [...h.listeners.values()].flatMap((s) => [...s])
  assert.equal(registered.length, 2)
  assert.ok(registered.every((l) => l === cb))
  unsubscribe()
  assert.equal([...h.listeners.values()].every((s) => s.size === 0), true)
})

test('store mechanics: firing a registered change listener triggers a fresh snapshot read (width 800 -> tablet)', () => {
  const h = installMatchMedia()
  h.setWidth(800)
  const cb = () => {}
  subscribeToViewport(cb)
  const tabletListener = [...h.listeners.get('(min-width: 768px)') ?? []][0]
  assert.ok(tabletListener, 'expected a tablet-query change listener')
  // Simulate a media query crossing its breakpoint: resize then fire the listener.
  h.setWidth(800)
  tabletListener()
  assert.equal(getViewportDeviceType(), 'tablet')
})

test('useLiveDeviceType returns initialDeviceType during SSR (getServerSnapshot)', () => {
  const Probe = ({ initial }: { initial: DeviceType }): ReactNode => {
    const deviceType = useLiveDeviceType(initial)
    return createElement('div', { 'data-live': deviceType })
  }
  for (const initial of ['mobile', 'tablet', 'desktop'] as const) {
    const html = renderToString(createElement(Probe, { initial }))
    assert.ok(html.includes(`data-live="${initial}"`))
  }
})
