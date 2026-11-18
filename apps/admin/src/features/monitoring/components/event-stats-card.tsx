/**
 * EventStatsCard Component
 *
 * Displays a stats card for event analytics
 * Shows the count of unique events tracked
 */
import { Loader2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalytics } from '../hooks/use-analytics'

export function EventStatsCard() {
  // Fetch all events (not just pageviews)
  const { data: allEvents, isLoading } = useAnalytics({ name: '*', days: 1 })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Unique Events (24h)
          </CardTitle>
          <Sparkles className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  // Count unique event names from the data
  const uniqueEvents = allEvents
    ? new Set(allEvents.map((e) => e.name)).size
    : 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          Unique Events (24h)
        </CardTitle>
        <Sparkles className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{uniqueEvents}</div>
        <p className='text-xs text-muted-foreground'>
          Different event types tracked
        </p>
      </CardContent>
    </Card>
  )
}
