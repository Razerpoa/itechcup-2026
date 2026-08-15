'use client'

import { useLiveDeviceType } from '../hooks/use-live-device-type'
import type { DashboardData, DeviceType } from '../types'
import { DashboardDesktop } from './DashboardDesktop'
import { DashboardMobile } from './DashboardMobile'
import { DashboardTablet } from './DashboardTablet'

const views = {
  mobile: DashboardMobile,
  tablet: DashboardTablet,
  desktop: DashboardDesktop,
} as const

export interface DashboardViewProps {
  data: DashboardData
  initialDeviceType: DeviceType
}

export function DashboardView({ data, initialDeviceType }: DashboardViewProps) {
  const deviceType = useLiveDeviceType(initialDeviceType)
  const View = views[deviceType]
  return <View data={data} />
}
