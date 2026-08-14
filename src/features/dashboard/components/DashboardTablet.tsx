'use client'

import { useDashboard } from '../hooks/use-dashboard'
import type { DashboardViewProps } from '../types'

export function DashboardTablet({ data }: DashboardViewProps) {
  useDashboard(data)

  return (
    <div data-view="tablet" className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      Tablet view — to implement
    </div>
  )
}
