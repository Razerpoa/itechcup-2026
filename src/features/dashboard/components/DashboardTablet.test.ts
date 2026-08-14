import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { DashboardTablet } from './DashboardTablet.tsx'
import type { DashboardData } from '../types'

const data: DashboardData = {
  title: 'Test dashboard',
  stats: [{ label: 'Active users', value: '1,248', change: 12.4 }],
  recentActivity: ['New signup: alice@example.com'],
}

test('DashboardTablet renders the tablet view shell with data-view="tablet"', () => {
  const html = renderToString(createElement(DashboardTablet, { data }))
  assert.ok(html.includes('data-view="tablet"'))
})

test('DashboardTablet placeholder text identifies the tablet view', () => {
  const html = renderToString(createElement(DashboardTablet, { data }))
  assert.ok(html.includes('Tablet view'))
})
