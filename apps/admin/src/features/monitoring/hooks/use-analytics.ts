import { useQuery } from '@tanstack/react-query'
import type { MonitoringEventsQueryModel } from '@repo/shared'
import { api } from '@/lib/api'
import type { EventRollup, AnalyticsOverview } from '../types'

type AnalyticsQueryParams = Partial<MonitoringEventsQueryModel>

export function useAnalytics(params: AnalyticsQueryParams = {}) {
  const { period = 'daily', name = 'pageview', days = 7 } = params

  return useQuery({
    queryKey: ['monitoring', 'analytics', period, name, days],
    queryFn: async () => {
      const response = await api.get<EventRollup[]>('/api/monitoring/events', {
        params: { period, name, days },
      })
      return response.data
    },
    staleTime: 60000,
    refetchInterval: 300000,
  })
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['monitoring', 'overview'],
    queryFn: async () => {
      const response = await api.get<AnalyticsOverview>('/api/monitoring/overview')
      return response.data
    },
    staleTime: 300000,
    refetchInterval: 600000,
  })
}
