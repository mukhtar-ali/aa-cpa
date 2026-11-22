/**
 * AnalyticsChart Component
 *
 * Displays a bar chart for analytics events (page views, custom events) over time using Recharts
 */
import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { EventRollup } from '../types'

// ============= Chart Data Processing =============

interface ChartDataPoint {
  date: string
  displayDate: string
  count: number
}

function processEventsData(events: EventRollup[]): ChartDataPoint[] {
  // Sort by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.periodKey).getTime() - new Date(b.periodKey).getTime()
  )

  // Transform to chart data
  return sortedEvents.map((e) => ({
    date: e.periodKey,
    displayDate: format(new Date(e.periodKey), 'MMM dd'),
    count: e.count,
  }))
}

// ============= Custom Tooltip =============

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className='rounded-lg border bg-background p-3 shadow-md'>
      <div className='mb-2 text-sm font-medium'>{label}</div>
      {payload.map((entry, index) => (
        <div
          key={index}
          className='flex items-center justify-between gap-4 text-sm'
        >
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='text-muted-foreground'>{entry.name}:</span>
          </div>
          <span className='font-medium'>{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ============= AnalyticsChart Component =============

interface AnalyticsChartProps {
  data: EventRollup[]
  title: string
  description: string
  eventName: string
  height?: number
  className?: string
}

export function AnalyticsChart({
  data,
  title,
  description,
  eventName,
  height = 300,
  className,
}: AnalyticsChartProps) {
  // Process data for the chart
  const chartData = useMemo(() => processEventsData(data), [data])

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center' style={{ height }}>
            <div className='text-center text-muted-foreground'>
              <div className='text-sm'>No data available</div>
              <div className='text-xs'>
                Analytics will appear once collected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total and average
  const total = chartData.reduce((sum, d) => sum + d.count, 0)
  const average = Math.round(total / chartData.length)

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold'>{total.toLocaleString()}</div>
            <div className='text-xs text-muted-foreground'>
              Total {eventName}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='displayDate'
              tick={{ fontSize: 12 }}
              className='text-muted-foreground'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className='text-muted-foreground'
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey='count'
              fill='hsl(var(--primary))'
              radius={[4, 4, 0, 0]}
              name={eventName}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
          <div>
            <span className='font-medium'>Average:</span>{' '}
            {average.toLocaleString()} per period
          </div>
          <div>
            <span className='font-medium'>Peak:</span>{' '}
            {Math.max(...chartData.map((d) => d.count)).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
