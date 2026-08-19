import type { DashboardData } from '@/types'

export async function getDashboardData(): Promise<DashboardData> {
  return {
    title: 'Dashboard',
    stats: [
      { label: 'Active users', value: '1,248', change: 12.4 },
      { label: 'Revenue', value: '$8,320', change: 4.1 },
      { label: 'Conversion rate', value: '3.2%', change: -0.6 },
    ],
    recentActivity: [
      'New signup: alice@example.com',
      'Order #1024 shipped',
      'Support ticket #512 resolved',
    ],
  }
}
