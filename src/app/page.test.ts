import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToString } from 'react-dom/server'

declare global {
  var __TEST_DEVICE_TYPE: string | undefined
}

const { default: Home } = await import('./page.tsx')

test('Home renders the mobile view when x-device-type is mobile', async () => {
  globalThis.__TEST_DEVICE_TYPE = 'mobile'
  const element = await Home()
  const html = renderToString(element)
  assert.ok(html.includes('data-view="mobile"'))
})

test('Home renders the tablet view when x-device-type is tablet', async () => {
  globalThis.__TEST_DEVICE_TYPE = 'tablet'
  const element = await Home()
  const html = renderToString(element)
  assert.ok(html.includes('data-view="tablet"'))
})

test('Home renders the desktop view when x-device-type is desktop', async () => {
  globalThis.__TEST_DEVICE_TYPE = 'desktop'
  const element = await Home()
  const html = renderToString(element)
  assert.ok(html.includes('data-view="desktop"'))
})

test('Home falls back to the desktop view when x-device-type is missing', async () => {
  globalThis.__TEST_DEVICE_TYPE = undefined
  const element = await Home()
  const html = renderToString(element)
  assert.ok(html.includes('data-view="desktop"'))
})
