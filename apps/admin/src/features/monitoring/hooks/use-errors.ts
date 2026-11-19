import { useQuery } from '@tanstack/react-query'
import type { MonitoringErrorsQueryModel } from '@repo/shared'
import { api } from '@/lib/api'
import type { ErrorsResponse, ErrorDetailResponse } from '../types'

type ErrorsQueryParams = Partial<MonitoringErrorsQueryModel>

export function useErrors(params: ErrorsQueryParams = {}) {
  const { type = 'all', page = 1, limit = 20 } = params

  return useQuery({
    queryKey: ['monitoring', 'errors', type, page, limit],
    queryFn: async () => {
      const response = await api.get<ErrorsResponse>('/api/monitoring/errors', {
        params: { type, page, limit },
      })
      return response.data
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

export function useErrorDetail(errorId: string | null) {
  return useQuery({
    queryKey: ['monitoring', 'errors', errorId],
    queryFn: async () => {
      if (!errorId) throw new Error('No error ID provided')
      const response = await api.get<ErrorDetailResponse>(
        `/api/monitoring/errors/${errorId}`
      )
      return response.data
    },
    enabled: !!errorId,
    staleTime: 60000,
  })
}

export default useErrors
