import { useQuery } from '@tanstack/react-query'
import type { MonitoringMetricsQueryModel } from '@repo/shared'
import { api } from '@/lib/api'
import type { MetricRollup, MonitoringOverview, MetricType } from '../types'

type MetricsQueryParams = Partial<MonitoringMetricsQueryModel>

export function useMetrics(params: MetricsQueryParams = {}) {
  const { period = 'daily', type = 'all', days = 7 } = params

  return useQuery({
    queryKey: ['monitoring', 'metrics', period, type, days],
    queryFn: async () => {
      const response = await api.get<MetricRollup[]>('/api/monitoring/metrics', {
        params: { period, type, days },
      })
      return response.data
    },
    staleTime: 60000,
    refetchInterval: 300000,
  })
}

export function useMetricsOverview() {
  return useQuery({
    queryKey: ['monitoring', 'overview'],
    queryFn: async () => {
      const response = await api.get<MonitoringOverview>('/api/monitoring/overview')
      return response.data
    },
    staleTime: 300000,
    refetchInterval: 600000,
  })
}

export interface MetricConfig {
  type: MetricType
  name: string
  description: string
  unit: string
  thresholds: { good: number; needsImprovement: number }
  formatValue: (value: number) => string
}

export const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  LCP: {
    type: 'LCP',
    name: 'Largest Contentful Paint',
    description: 'Time to render the largest content element',
    unit: 's',
    thresholds: { good: 2500, needsImprovement: 4000 },
    formatValue: (value) => `${(value / 1000).toFixed(2)}s`,
  },
  FID: {
    type: 'FID',
    name: 'First Input Delay',
    description: 'Delay from first user interaction to response',
    unit: 'ms',
    thresholds: { good: 100, needsImprovement: 300 },
    formatValue: (value) => `${Math.round(value)}ms`,
  },
  CLS: {
    type: 'CLS',
    name: 'Cumulative Layout Shift',
    description: 'Amount of unexpected layout shift',
    unit: '',
    thresholds: { good: 0.1, needsImprovement: 0.25 },
    formatValue: (value) => value.toFixed(3),
  },
  TTFB: {
    type: 'TTFB',
    name: 'Time to First Byte',
    description: 'Time to receive the first byte of response',
    unit: 'ms',
    thresholds: { good: 800, needsImprovement: 1800 },
    formatValue: (value) => `${Math.round(value)}ms`,
  },
  INP: {
    type: 'INP',
    name: 'Interaction to Next Paint',
    description: 'Time from interaction to visual response',
    unit: 'ms',
    thresholds: { good: 200, needsImprovement: 500 },
    formatValue: (value) => `${Math.round(value)}ms`,
  },
}

export type Rating = 'good' | 'needs-improvement' | 'poor'

export function getMetricRating(type: MetricType, value: number): Rating {
  const config = METRIC_CONFIGS[type]
  if (value <= config.thresholds.good) return 'good'
  if (value <= config.thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

export function getRatingColor(rating: Rating): string {
  switch (rating) {
    case 'good': return 'text-emerald-600 dark:text-emerald-400'
    case 'needs-improvement': return 'text-amber-600 dark:text-amber-400'
    case 'poor': return 'text-destructive'
  }
}
