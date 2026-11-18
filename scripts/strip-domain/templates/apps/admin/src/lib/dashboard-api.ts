import { endpoint } from '@repo/shared'
import { api } from './api'

export interface DashboardStats {
  users: { total: number }
  activity: { pageviewsToday: number; errorsToday: number }
  pageviewsTrend: { date: string; count: number }[]
}

export async function getDashboardStats() {
  const res = await api.get<DashboardStats>(endpoint.dashboard.stats)
  return res.data
}
