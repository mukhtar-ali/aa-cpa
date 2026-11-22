/**
 * Monitoring feature types for admin panel
 */

// ============= Error Types =============

export type ErrorType = 'error' | 'unhandledrejection' | 'api'

export interface MonitoringError {
  id: string
  type: ErrorType
  message: string
  stack?: string
  page: string
  timestamp: string
  createdAt: string
  context: Record<string, unknown>
}

export interface ErrorsResponse {
  data: MonitoringError[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ErrorDetailResponse extends MonitoringError {
  sessionId: string
}

// ============= Metrics Types =============

export type MetricType = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP'
export type Rating = 'good' | 'needs-improvement' | 'poor'

export interface MetricRollup {
  periodKey: string
  type: MetricType
  count: number
  p50: number
  p75: number
  p90: number
  min: number
  max: number
}

// ============= Overview Types =============

export interface MonitoringOverview {
  metrics: {
    lcp_p75: number | null
    fid_p75: number | null
    cls_p75: number | null
    ttfb_p75: number | null
    inp_p75: number | null
  }
  errors: {
    today: number
    trend: number
  }
  pageviews: {
    today: number
    trend: number
  }
}

// ============= Analytics Overview Types =============
// Reuses the pageviews from MonitoringOverview

export interface AnalyticsOverview {
  pageviews: {
    today: number
    trend: number
  }
}

// ============= Event Types =============

export interface EventRollup {
  periodKey: string
  name: string
  count: number
}
