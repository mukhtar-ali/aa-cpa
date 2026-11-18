/**
 * VitalsChart Component
 *
 * Displays a line chart for Core Web Vitals metrics over time using Recharts
 * Shows p50, p75, p90 percentiles with color-coded thresholds
 */
import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { METRIC_CONFIGS } from '../hooks/use-metrics'
import type { MetricRollup, MetricType } from '../types'

// ============= Chart Data Processing =============

interface ChartDataPoint {
  date: string
  displayDate: string
  p50: number
  p75: number
  p90: number
}

function processMetricsData(
  metrics: MetricRollup[],
  type: MetricType
): ChartDataPoint[] {
  // Filter metrics by type
  const filteredMetrics = metrics.filter((m) => m.type === type)

  // Sort by date
  const sortedMetrics = [...filteredMetrics].sort(
    (a, b) => new Date(a.periodKey).getTime() - new Date(b.periodKey).getTime()
  )

  // Transform to chart data
  return sortedMetrics.map((m) => ({
    date: m.periodKey,
    displayDate: format(new Date(m.periodKey), 'MMM dd'),
    p50: m.p50,
    p75: m.p75,
    p90: m.p90,
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
  type: MetricType
}

function CustomTooltip({ active, payload, label, type }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const config = METRIC_CONFIGS[type]

  return (
    <div className='rounded-lg border bg-background p-2 shadow-md'>
      <div className='mb-2 text-sm font-medium'>{label}</div>
      {payload.map((entry, index) => (
        <div
          key={index}
          className='flex items-center justify-between gap-4 text-xs'
        >
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='text-muted-foreground'>{entry.name}:</span>
          </div>
          <span className='font-medium'>{config.formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ============= VitalsChart Component =============

interface VitalsChartProps {
  data: MetricRollup[]
  type: MetricType
  height?: number
  className?: string
}

export function VitalsChart({
  data,
  type,
  height = 300,
  className,
}: VitalsChartProps) {
  const config = METRIC_CONFIGS[type]

  // Process data for the chart
  const chartData = useMemo(() => processMetricsData(data, type), [data, type])

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{config.name}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center' style={{ height }}>
            <div className='text-center text-muted-foreground'>
              <div className='text-sm'>No data available</div>
              <div className='text-xs'>Metrics will appear once collected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{config.name}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
              tickFormatter={(value) => config.formatValue(value)}
            />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* p50 line - primary */}
            <Line
              type='monotone'
              dataKey='p50'
              stroke='hsl(var(--primary))'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name='p50 (median)'
            />

            {/* p75 line - accent foreground */}
            <Line
              type='monotone'
              dataKey='p75'
              stroke='hsl(var(--chart-2, var(--primary) / 0.8))'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name='p75 (target)'
            />

            {/* p90 line - muted foreground */}
            <Line
              type='monotone'
              dataKey='p90'
              stroke='hsl(var(--muted-foreground))'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name='p90 (worst)'
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Threshold reference */}
        <div className='mt-4 flex items-center gap-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-emerald-500' />
            <span>
              Good: ≤ {config.formatValue(config.thresholds.good * 1000)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-amber-500' />
            <span>
              Needs Improvement: ≤{' '}
              {config.formatValue(config.thresholds.needsImprovement * 1000)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-destructive' />
            <span>
              Poor: &gt;{' '}
              {config.formatValue(config.thresholds.needsImprovement * 1000)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============= Compact Chart Variant =============

interface CompactVitalsChartProps {
  data: MetricRollup[]
  type: MetricType
  height?: number
  showLegend?: boolean
}

export function CompactVitalsChart({
  data,
  type,
  height = 150,
  showLegend = false,
}: CompactVitalsChartProps) {
  const chartData = useMemo(() => processMetricsData(data, type), [data, type])

  if (chartData.length === 0) {
    return (
      <div className='flex items-center justify-center' style={{ height }}>
        <div className='text-xs text-muted-foreground'>No data</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='displayDate' hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip type={type} />} />
        {showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
        <Line
          type='monotone'
          dataKey='p75'
          stroke='hsl(var(--chart-2, var(--primary) / 0.8))'
          strokeWidth={2}
          dot={false}
          name='p75'
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
