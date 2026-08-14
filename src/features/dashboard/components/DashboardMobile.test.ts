import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { DashboardMobile } from './DashboardMobile.tsx'
import type { DashboardData } from '../types'

const data: DashboardData = {
  title: 'Test dashboard',
  stats: [{ label: 'Active users', value: '1,248', change: 12.4 }],
  recentActivity: ['New signup: alice@example.com'],
}

test('DashboardMobile renders the mobile view shell with data-view="mobile"', () => {
  const html = renderToString(createElement(DashboardMobile, { data }))
  assert.ok(html.includes('data-view="mobile"'))
})

test('DashboardMobile placeholder text identifies the mobile view', () => {
  const html = renderToString(createElement(DashboardMobile, { data }))
  assert.ok(html.includes('Mobile view'))
})
