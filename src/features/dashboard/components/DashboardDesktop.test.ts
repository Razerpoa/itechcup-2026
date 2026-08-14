import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { DashboardDesktop } from './DashboardDesktop.tsx'
import type { DashboardData } from '../types'

const data: DashboardData = {
  title: 'Test dashboard',
  stats: [{ label: 'Active users', value: '1,248', change: 12.4 }],
  recentActivity: ['New signup: alice@example.com'],
}

test('DashboardDesktop renders the desktop view shell with data-view="desktop"', () => {
  const html = renderToString(createElement(DashboardDesktop, { data }))
  assert.ok(html.includes('data-view="desktop"'))
})

test('DashboardDesktop placeholder text identifies the desktop view', () => {
  const html = renderToString(createElement(DashboardDesktop, { data }))
  assert.ok(html.includes('Desktop view'))
})
