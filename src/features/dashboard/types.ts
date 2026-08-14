export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DashboardStat {
  label: string
  value: string
  change: number
}

export interface DashboardData {
  title: string
  stats: DashboardStat[]
  recentActivity: string[]
}

export interface DashboardViewProps {
  data: DashboardData
}
