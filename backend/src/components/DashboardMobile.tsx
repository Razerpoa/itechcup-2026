'use client'

import { useDashboard } from '../hooks/use-dashboard'
import type { DashboardViewProps } from '../types'

export function DashboardMobile({ data }: DashboardViewProps) {
  useDashboard(data)

  return (
    <div data-view="mobile" className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      Mobile view — to implement
    </div>
  )
}
