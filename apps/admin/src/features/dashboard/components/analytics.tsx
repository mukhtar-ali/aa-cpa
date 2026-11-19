import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, Eye, TrendingDown, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyMetricCard, MetricCard } from '@/features/monitoring/components/metric-card'
import { useMetricsOverview } from '@/features/monitoring/hooks/use-metrics'
import type { MetricType } from '@/features/monitoring/types'
import type { DashboardStats } from '@/lib/dashboard-api'

const METRIC_TYPES: MetricType[] = ['LCP', 'FID', 'CLS', 'TTFB', 'INP']

interface AnalyticsProps {
  stats?: DashboardStats
  isLoading: boolean
}

function TrendBadge({ trend }: { trend: number }) {
  const isUp = trend >= 0
  const Icon = isUp ? TrendingUp : TrendingDown
  const colorClass = isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
  return (
    <span className={`flex items-center gap-1 text-xs ${colorClass}`}>
      <Icon className='h-3 w-3' />
      {Math.abs(trend).toFixed(0)}% vs yesterday
    </span>
  )
}

export function Analytics({ stats, isLoading }: AnalyticsProps) {
  const { data: overview, isLoading: isLoadingOverview, error } = useMetricsOverview()

  const trend = stats?.pageviewsTrend ?? []
  const counts = trend.map((p) => p.count)
  const total7Day = counts.reduce((a, b) => a + b, 0)
  const dailyAvg = counts.length > 0 ? Math.round(total7Day / counts.length) : 0
  const peak = counts.length > 0 ? Math.max(...counts) : 0
  const lowest = counts.length > 0 ? Math.min(...counts) : 0

  const chartData = trend.map((point) => ({
    name: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(point.date)),
    pageviews: point.count,
  }))

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pageviews Today</CardTitle>
            <Eye className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{isLoading ? '-' : stats?.activity.pageviewsToday ?? 0}</div>
            {overview && <TrendBadge trend={overview.pageviews.trend} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Errors Today</CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{isLoading ? '-' : stats?.activity.errorsToday ?? 0}</div>
            {overview && <TrendBadge trend={-overview.errors.trend} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>7-Day Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{total7Day}</div>
            <p className='text-xs text-muted-foreground'>Pageviews this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Daily Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dailyAvg}</div>
            <p className='text-xs text-muted-foreground'>
              Peak {peak} · Lowest {lowest}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Pageviews over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
              <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke='hsl(var(--muted-foreground))' fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)' }}
              />
              <Line type='monotone' dataKey='pageviews' stroke='hsl(var(--primary))' strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <h3 className='mb-3 text-sm font-medium text-muted-foreground'>Core Web Vitals</h3>
        {error ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>Failed to load performance data</AlertDescription>
          </Alert>
        ) : isLoadingOverview ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {METRIC_TYPES.map((type) => (
              <Card key={type} className='animate-pulse'>
                <CardHeader className='space-y-1'>
                  <div className='h-4 w-24 rounded bg-muted' />
                </CardHeader>
                <CardContent>
                  <div className='h-8 w-16 rounded bg-muted' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !overview ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {METRIC_TYPES.map((type) => (
              <EmptyMetricCard key={type} type={type} />
            ))}
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            <MetricCard type='LCP' value={overview.metrics.lcp_p75} />
            <MetricCard type='FID' value={overview.metrics.fid_p75} />
            <MetricCard type='CLS' value={overview.metrics.cls_p75} />
            <MetricCard type='TTFB' value={overview.metrics.ttfb_p75} />
            <MetricCard type='INP' value={overview.metrics.inp_p75} />
          </div>
        )}
      </div>
    </div>
  )
}
