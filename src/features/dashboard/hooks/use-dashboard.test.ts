import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { useDashboard } from './use-dashboard.ts'
import type { DashboardData } from '../types'

const initialData: DashboardData = {
  title: 'Test dashboard',
  stats: [{ label: 'Active users', value: '1,248', change: 12.4 }],
  recentActivity: ['New signup: alice@example.com'],
}

interface Snapshot {
  dataTitle: string
  dataIsSameRef: boolean
  period: string
  setterType: string
}

function probe(nextPeriod?: 'week' | 'month'): () => Snapshot {
  let snapshot: Snapshot = {
    dataTitle: '',
    dataIsSameRef: false,
    period: '',
    setterType: '',
  }

  const Probe = (): ReactNode => {
    const { data, viewState, actions } = useDashboard(initialData)
    if (nextPeriod && viewState.selectedPeriod === 'day') {
      actions.setPeriod(nextPeriod)
    }
    snapshot = {
      dataTitle: data.title,
      dataIsSameRef: data === initialData,
      period: viewState.selectedPeriod,
      setterType: typeof actions.setPeriod,
    }
    return null
  }

  renderToString(createElement(Probe))
  return () => snapshot
}

test('useDashboard initializes data to the prop-passed data', () => {
  const snapshot = probe()()
  assert.equal(snapshot.dataTitle, 'Test dashboard')
  assert.equal(snapshot.dataIsSameRef, true)
})

test('useDashboard defaults selectedPeriod to day', () => {
  const snapshot = probe()()
  assert.equal(snapshot.period, 'day')
})

test('useDashboard exposes setPeriod as an action', () => {
  const snapshot = probe()()
  assert.equal(snapshot.setterType, 'function')
})

test('useDashboard setPeriod updates selectedPeriod to week', () => {
  const snapshot = probe('week')()
  assert.equal(snapshot.period, 'week')
})

test('useDashboard setPeriod updates selectedPeriod to month', () => {
  const snapshot = probe('month')()
  assert.equal(snapshot.period, 'month')
})
