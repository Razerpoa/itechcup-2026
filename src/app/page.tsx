import { headers } from 'next/headers'
import { DashboardView } from '@/components/DashboardView'
import { normalizeDeviceType } from '@/lib/device'
import { getDashboardData } from '@/lib/get-dashboard-data'

export default async function Home() {
  const header = await headers()
  const deviceType = normalizeDeviceType(header.get('x-device-type'))
  const data = await getDashboardData()

  return <DashboardView data={data} initialDeviceType={deviceType} />
}
