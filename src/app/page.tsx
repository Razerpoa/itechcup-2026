import { headers } from 'next/headers'
import { DashboardDesktop } from '../features/dashboard/components/DashboardDesktop'
import { DashboardMobile } from '../features/dashboard/components/DashboardMobile'
import { DashboardTablet } from '../features/dashboard/components/DashboardTablet'
import { normalizeDeviceType } from '../features/dashboard/lib/device'
import { getDashboardData } from '../features/dashboard/lib/get-dashboard-data'

const views = {
  mobile: DashboardMobile,
  tablet: DashboardTablet,
  desktop: DashboardDesktop,
} as const

export default async function Home() {
  const header = await headers()
  const deviceType = normalizeDeviceType(header.get('x-device-type'))
  const data = await getDashboardData()
  const View = views[deviceType]

  return <View data={data} />
}
