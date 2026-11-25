import { useQuery } from '@tanstack/react-query'
import { getLeadStats, type LeadStats } from '@/lib/dashboard-api'

const LIVE_REFETCH_INTERVAL_MS = 30_000

export function useLeadStats(params?: { from?: string; to?: string }) {
  return useQuery<LeadStats>({
    queryKey: ['dashboard', 'lead-stats', params?.from, params?.to],
    queryFn: () => getLeadStats(params),
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  })
}
