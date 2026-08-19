'use client'

import { useDashboard } from '@/hooks/use-dashboard'
import type { DashboardViewProps } from '@/types'

export function DashboardDesktop({ data }: DashboardViewProps) {
  useDashboard(data)

  return (
    <div data-view="desktop" className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      Desktop view — to implement
    </div>
  )
}
