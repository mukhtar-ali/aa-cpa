import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard-api'

// Polled rather than pushed over a socket — "live" here means the numbers on screen never
// go more than 30s stale without the admin having to refresh, which is what the widgets
// need; a websocket layer would be real infrastructure for no behavioral difference here.
const LIVE_REFETCH_INTERVAL_MS = 30_000

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  })
}
