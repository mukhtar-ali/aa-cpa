/**
 * MetricCard Component
 *
 * Displays a single Core Web Vital metric with:
 * - Current value (p75)
 * - Rating indicator (good/needs-improvement/poor)
 * - Metric name and description
 * - Color-coded based on threshold
 */
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  METRIC_CONFIGS,
  getMetricRating,
  getRatingColor,
} from '../hooks/use-metrics'
import type { MetricType, Rating } from '../types'

// ============= Rating Badge =============

interface RatingBadgeProps {
  rating: Rating
}

function RatingBadge({ rating }: RatingBadgeProps) {
  const colorClasses = {
    good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'needs-improvement':
      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    poor: 'bg-destructive/15 text-destructive dark:bg-destructive/25',
  }

  const label = {
    good: 'Good',
    'needs-improvement': 'Needs Improvement',
    poor: 'Poor',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        colorClasses[rating]
      )}
    >
      {label[rating]}
    </span>
  )
}

// ============= MetricCard Component =============

interface MetricCardProps {
  type: MetricType
  value: number | null
  count?: number
  className?: string
}

export function MetricCard({ type, value, count, className }: MetricCardProps) {
  const config = METRIC_CONFIGS[type]

  // Calculate rating based on value
  const rating = value !== null ? getMetricRating(type, value) : null

  // Format the value
  const formattedValue = value !== null ? config.formatValue(value) : 'N/A'

  // Get trend indicator color
  const valueColor = rating ? getRatingColor(rating) : 'text-muted-foreground'

  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-sm font-medium'>{config.name}</CardTitle>
          <CardDescription className='text-xs'>
            {config.description}
          </CardDescription>
        </div>
        {rating && <RatingBadge rating={rating} />}
      </CardHeader>
      <CardContent>
        <div className='flex items-baseline space-x-2'>
          <div className={cn('text-2xl font-bold', valueColor)}>
            {formattedValue}
          </div>
          {count !== undefined && count > 0 && (
            <div className='text-xs text-muted-foreground'>
              ({count} samples)
            </div>
          )}
        </div>
        {value !== null && (
          <div className='mt-3'>
            <ProgressBar rating={rating!} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============= Progress Bar =============

interface ProgressBarProps {
  rating: Rating
}

function ProgressBar({ rating }: ProgressBarProps) {
  const widthClasses = {
    good: 'w-full',
    'needs-improvement': 'w-2/3',
    poor: 'w-1/3',
  }

  const colorClasses = {
    good: 'bg-emerald-500',
    'needs-improvement': 'bg-amber-500',
    poor: 'bg-destructive',
  }

  return (
    <div className='h-2 w-full rounded-full bg-muted'>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          colorClasses[rating],
          widthClasses[rating]
        )}
      />
    </div>
  )
}

// ============= Empty State =============

interface EmptyMetricCardProps {
  type: MetricType
  className?: string
}

export function EmptyMetricCard({ type, className }: EmptyMetricCardProps) {
  const config = METRIC_CONFIGS[type]

  return (
    <Card className={className}>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-sm font-medium'>{config.name}</CardTitle>
        <CardDescription className='text-xs'>
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center py-6 text-muted-foreground'>
          <div className='text-center'>
            <div className='text-sm'>No data available</div>
            <div className='text-xs'>Waiting for metrics...</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
