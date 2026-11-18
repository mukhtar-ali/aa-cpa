/**
 * PerformanceDashboard Component
 *
 * Main dashboard for Core Web Vitals performance monitoring
 * Displays:
 * - Overview cards for each vital (LCP, FID, CLS, TTFB, INP)
 * - Trend charts for each vital
 * - Period selector (daily/hourly)
 * - Date range selector (7/30 days)
 */
import { useState } from 'react'
import { Loader2, Activity, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useMetrics,
  useMetricsOverview,
  METRIC_CONFIGS,
} from '../hooks/use-metrics'
import type { MetricType } from '../types'
import { MetricCard, EmptyMetricCard } from './metric-card'
import { VitalsChart } from './vitals-chart'

// ============= Metric Types Array =============

const METRIC_TYPES: MetricType[] = ['LCP', 'FID', 'CLS', 'TTFB', 'INP']

// ============= Overview Cards =============

function OverviewCards() {
  const { data: overview, isLoading, error } = useMetricsOverview()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {METRIC_TYPES.map((type) => (
          <Card key={type} className='animate-pulse'>
            <CardHeader className='space-y-1'>
              <div className='h-4 w-24 rounded bg-muted' />
              <div className='h-3 w-32 rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>Failed to load overview data</AlertDescription>
      </Alert>
    )
  }

  if (!overview) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {METRIC_TYPES.map((type) => (
          <EmptyMetricCard key={type} type={type} />
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
      <MetricCard type='LCP' value={overview.metrics.lcp_p75} />
      <MetricCard type='FID' value={overview.metrics.fid_p75} />
      <MetricCard type='CLS' value={overview.metrics.cls_p75} />
      <MetricCard type='TTFB' value={overview.metrics.ttfb_p75} />
      <MetricCard type='INP' value={overview.metrics.inp_p75} />
    </div>
  )
}

// ============= Metric Charts =============

interface MetricChartsProps {
  period: 'daily' | 'hourly'
  days: number
}

function MetricCharts({ period, days }: MetricChartsProps) {
  const {
    data: metrics,
    isLoading,
    error,
  } = useMetrics({ period, type: 'all', days })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>Failed to load metrics data</AlertDescription>
      </Alert>
    )
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-muted-foreground'>
            <Activity className='mx-auto mb-4 h-12 w-12 opacity-20' />
            <div className='text-sm'>No metrics data available</div>
            <div className='text-xs'>
              Performance metrics will appear once collected
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {METRIC_TYPES.map((type) => (
        <VitalsChart key={type} data={metrics} type={type} />
      ))}
    </div>
  )
}

// ============= Main PerformanceDashboard Component =============

export function PerformanceDashboard() {
  const [period, setPeriod] = useState<'daily' | 'hourly'>('daily')
  const [days, setDays] = useState(7)

  return (
    <div className='space-y-6'>
      {/* Header removed - moved to page layout */}

      {/* Overview Cards */}
      <section>
        <h3 className='mb-4 text-lg font-semibold'>
          Current Performance (p75)
        </h3>
        <OverviewCards />
      </section>

      {/* Charts Section */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Performance Trends</h3>

          {/* Controls */}
          <div className='flex items-center gap-4'>
            {/* Period Selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Period:</span>
              <Tabs
                value={period}
                onValueChange={(v) => setPeriod(v as 'daily' | 'hourly')}
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='daily'>Daily</TabsTrigger>
                  <TabsTrigger value='hourly'>Hourly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Days Selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Range:</span>
              <Select
                value={days.toString()}
                onValueChange={(v) => setDays(parseInt(v, 10))}
              >
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7'>Last 7 days</SelectItem>
                  <SelectItem value='14'>Last 14 days</SelectItem>
                  <SelectItem value='30'>Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <MetricCharts period={period} days={days} />
      </section>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Core Web Vitals</CardTitle>
          <CardDescription>
            Understanding the metrics and their impact on user experience
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {METRIC_TYPES.map((type) => {
              const config = METRIC_CONFIGS[type]
              return (
                <div key={type} className='space-y-2'>
                  <div className='font-medium'>{config.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {config.description}
                  </div>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='text-emerald-600 dark:text-emerald-400'>
                      Good: ≤{' '}
                      {config.formatValue(config.thresholds.good * 1000)}
                    </span>
                    <span className='text-muted-foreground'>|</span>
                    <span className='text-amber-600 dark:text-amber-400'>
                      Needs Work: ≤{' '}
                      {config.formatValue(
                        config.thresholds.needsImprovement * 1000
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className='mt-4 rounded-lg bg-muted p-4 text-sm'>
            <p className='text-muted-foreground'>
              These metrics are collected from real user interactions and
              aggregated hourly/daily. The p75 value (75th percentile)
              represents the experience of most users, while p90 shows
              worst-case scenarios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
