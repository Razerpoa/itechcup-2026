import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getDashboardData } from './get-dashboard-data.ts'

test('getDashboardData resolves dashboard data', async () => {
  const data = await getDashboardData()

  assert.equal(typeof data.title, 'string')
  assert.ok(data.title.length > 0)

  assert.ok(Array.isArray(data.stats))
  assert.ok(data.stats.length > 0)
  for (const stat of data.stats) {
    assert.equal(typeof stat.label, 'string')
    assert.equal(typeof stat.value, 'string')
    assert.equal(typeof stat.change, 'number')
  }

  assert.ok(Array.isArray(data.recentActivity))
  assert.ok(data.recentActivity.length > 0)
  for (const item of data.recentActivity) {
    assert.equal(typeof item, 'string')
  }
})
