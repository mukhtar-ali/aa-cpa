/**
 * AnalyticsDashboard Component
 *
 * Dashboard for user behavior analytics
 * Displays:
 * - Page view trends over time
 * - Custom event tracking
 * - Period selector (daily/hourly)
 * - Date range selector (7/30 days)
 */
import { PageHeader } from '@/components/layout/page-header'
import { useState } from 'react'
import {
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
} from 'lucide-react'
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
import { useAnalytics, useAnalyticsOverview } from '../hooks/use-analytics'
import { AnalyticsChart } from './analytics-chart'
import { EventStatsCard } from './event-stats-card'

// ============= Overview Cards =============

function OverviewCards() {
  const { data: overview, isLoading, error } = useAnalyticsOverview()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='animate-pulse'>
          <CardHeader className='space-y-1'>
            <div className='h-4 w-24 rounded bg-muted' />
            <div className='h-3 w-32 rounded bg-muted' />
          </CardHeader>
          <CardContent>
            <div className='h-8 w-16 rounded bg-muted' />
          </CardContent>
        </Card>
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

  const pageviewsToday = overview?.pageviews?.today ?? 0
  const pageviewsTrend = overview?.pageviews?.trend ?? 0

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {/* Page Views Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Page Views Today
          </CardTitle>
          <Eye className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {pageviewsToday.toLocaleString()}
          </div>
          {pageviewsTrend !== 0 && (
            <p className='flex items-center text-xs text-muted-foreground'>
              {pageviewsTrend > 0 ? (
                <>
                  <TrendingUp className='mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                  <span className='text-emerald-600 dark:text-emerald-400'>+{pageviewsTrend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className='mr-1 h-3 w-3 text-destructive' />
                  <span className='text-destructive'>{pageviewsTrend}%</span>
                </>
              )}
              <span className='ml-1'>from yesterday</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Unique Events Card */}
      <EventStatsCard />

      {/* Total Events Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tracking Status</CardTitle>
          <BarChart3 className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>Active</div>
          <p className='text-xs text-muted-foreground'>
            Analytics tracking is enabled
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============= Charts Section =============

interface ChartsSectionProps {
  period: 'daily' | 'hourly'
  days: number
}

function ChartsSection({ period, days }: ChartsSectionProps) {
  const {
    data: pageViews,
    isLoading,
    error,
  } = useAnalytics({ period, name: 'pageview', days })

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
        <AlertDescription>Failed to load analytics data</AlertDescription>
      </Alert>
    )
  }

  if (!pageViews || pageViews.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-muted-foreground'>
            <Eye className='mx-auto mb-4 h-12 w-12 opacity-20' />
            <div className='text-sm'>No analytics data available</div>
            <div className='text-xs'>
              Page views will appear once users navigate the application
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Page Views Chart */}
      <AnalyticsChart
        data={pageViews}
        title='Page Views Trend'
        description='Number of page views over time'
        eventName='pageview'
      />
    </div>
  )
}

// ============= Main AnalyticsDashboard Component =============

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<'daily' | 'hourly'>('daily')
  const [days, setDays] = useState(7)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <PageHeader
        title='User Behavior Analytics'
        description='Track page views, user interactions, and custom events across your application'
      />

      {/* Overview Cards */}
      <section>
        <h3 className='mb-4 text-lg font-semibold'>Overview</h3>
        <OverviewCards />
      </section>

      {/* Charts Section */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Analytics Trends</h3>

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
        <ChartsSection period={period} days={days} />
      </section>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Analytics Tracking</CardTitle>
          <CardDescription>
            Understanding how user behavior is captured and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <div className='font-medium'>Page Views</div>
              <div className='text-sm text-muted-foreground'>
                Automatically tracked on every route change in the web
                application. Shows which pages are most visited and how users
                navigate through the app.
              </div>
            </div>
            <div className='space-y-2'>
              <div className='font-medium'>Custom Events</div>
              <div className='text-sm text-muted-foreground'>
                Track specific user interactions like button clicks, feature
                usage, and custom actions using the{' '}
                <code className='rounded bg-muted px-1 py-0.5 text-xs'>
                  trackEvent()
                </code>{' '}
                API.
              </div>
            </div>
          </div>
          <div className='mt-4 rounded-lg bg-muted p-4 text-sm'>
            <p className='mb-2 font-medium'>Developer Integration:</p>
            <code className='block rounded bg-background p-3 text-xs'>
              {`import { trackEvent, trackFeature } from '@/lib/monitoring';

// Track custom events
trackEvent('button_click', { button: 'signup' });

// Track feature usage
trackFeature('premium_dashboard', { action: 'view' });`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
