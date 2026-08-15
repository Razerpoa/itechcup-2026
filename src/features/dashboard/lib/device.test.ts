import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDeviceType, deviceTypeFromWidth, TABLET_MIN_WIDTH, DESKTOP_MIN_WIDTH } from './device.ts'

test('normalizeDeviceType keeps known device types', () => {
  assert.equal(normalizeDeviceType('mobile'), 'mobile')
  assert.equal(normalizeDeviceType('tablet'), 'tablet')
  assert.equal(normalizeDeviceType('desktop'), 'desktop')
})

test('normalizeDeviceType falls back to desktop for unknown values', () => {
  assert.equal(normalizeDeviceType('console'), 'desktop')
  assert.equal(normalizeDeviceType('smarttv'), 'desktop')
  assert.equal(normalizeDeviceType('wearable'), 'desktop')
  assert.equal(normalizeDeviceType('embedded'), 'desktop')
  assert.equal(normalizeDeviceType('phone'), 'desktop')
  assert.equal(normalizeDeviceType(''), 'desktop')
})

test('normalizeDeviceType falls back to desktop for null', () => {
  assert.equal(normalizeDeviceType(null), 'desktop')
})

test('breakpoint constants match Tailwind md (768) and lg (1024)', () => {
  assert.equal(TABLET_MIN_WIDTH, 768)
  assert.equal(DESKTOP_MIN_WIDTH, 1024)
})

test('deviceTypeFromWidth maps widths below tablet to mobile', () => {
  assert.equal(deviceTypeFromWidth(0), 'mobile')
  assert.equal(deviceTypeFromWidth(767), 'mobile')
})

test('deviceTypeFromWidth maps tablet range (768-1023) to tablet', () => {
  assert.equal(deviceTypeFromWidth(768), 'tablet')
  assert.equal(deviceTypeFromWidth(1023), 'tablet')
})

test('deviceTypeFromWidth maps widths at and above desktop breakpoint to desktop', () => {
  assert.equal(deviceTypeFromWidth(1024), 'desktop')
  assert.equal(deviceTypeFromWidth(1920), 'desktop')
})
