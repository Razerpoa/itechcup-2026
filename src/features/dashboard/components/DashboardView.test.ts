import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { DashboardView } from './DashboardView.tsx'
import type { DashboardData, DeviceType } from '../types'

const data: DashboardData = {
  title: 'Test dashboard',
  stats: [{ label: 'Active users', value: '1,248', change: 12.4 }],
  recentActivity: ['New signup: alice@example.com'],
}

const initialDeviceTypes: DeviceType[] = ['mobile', 'tablet', 'desktop']

test('DashboardView renders the matching view for each initialDeviceType (SSR)', () => {
  for (const initialDeviceType of initialDeviceTypes) {
    const html = renderToString(createElement(DashboardView, { data, initialDeviceType }))
    assert.ok(html.includes(`data-view="${initialDeviceType}"`), `expected data-view="${initialDeviceType}"`)
  }
})
