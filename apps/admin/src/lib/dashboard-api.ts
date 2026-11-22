import { endpoint } from '@repo/shared'
import { api } from './api'

export interface DashboardRecentActivityItem {
  id: string
  type: 'contact' | 'application' | 'inquiry'
  label: string
  subLabel: string
  createdAt: string
}

export interface DashboardContentItem {
  id: string
  title: string
  isPublished: boolean
  updatedAt: string
}

export type DashboardContentType = 'news' | 'jobs'

export interface DashboardStats {
  users: { total: number }
  projects?: { total: number; published: number; draft: number }
  news: { total: number; published: number; draft: number }
  jobs: { total: number; published: number; draft: number; pendingApplications: number }
  inquiries?: { open: number }
  contact: { new: number }
  activity: { pageviewsToday: number; errorsToday: number }
  pageviewsTrend: { date: string; count: number }[]
  recentActivity: DashboardRecentActivityItem[]
  contentByType: { type: DashboardContentType; total: number; published: number }[]
  recentContent: Record<DashboardContentType, DashboardContentItem[]>
}

export async function getDashboardStats() {
  const res = await api.get<DashboardStats>(endpoint.dashboard.stats)
  return res.data
}
