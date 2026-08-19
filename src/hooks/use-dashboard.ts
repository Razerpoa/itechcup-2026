'use client'

import { useState } from 'react'
import type { DashboardData } from '@/types'

export type DashboardPeriod = 'day' | 'week' | 'month'

export interface DashboardViewState {
  selectedPeriod: DashboardPeriod
}

export interface DashboardActions {
  setPeriod: (period: DashboardPeriod) => void
}

export function useDashboard(initialData: DashboardData): {
  data: DashboardData
  viewState: DashboardViewState
  actions: DashboardActions
} {
  const [data] = useState<DashboardData>(initialData)
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('day')

  return {
    data,
    viewState: { selectedPeriod },
    actions: { setPeriod: setSelectedPeriod },
  }
}
