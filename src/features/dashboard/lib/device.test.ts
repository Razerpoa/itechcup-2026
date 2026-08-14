import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDeviceType } from './device.ts'

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
